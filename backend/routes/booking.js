const express = require('express');
const { DateTime } = require('luxon');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const auth = require('../utils/authMiddleware'); // מאמת JWT לממשקים של מנהל
const { sendBookingConfirmation, sendAdminNotification } = require('../utils/mailer');
const router = express.Router();

const buildSlotWindow = async (serviceId, startIso) => {
  const service = await Service.findById(serviceId);
  if (!service) return { error: 'Service not found', status: 404 };
  const start = DateTime.fromISO(startIso, { zone: 'utc' });
  if (!start.isValid) return { error: 'Invalid start datetime' };
  const end = start.plus({ minutes: service.durationMin });
  return {
    start: start.toJSDate(),
    end: end.toJSDate(),
    service,
  };
};

const hasClash = (serviceId, startUtc, endUtc, excludeId = null) => {
  const filter = {
    serviceId,
    startUtc: { $lt: endUtc },
    endUtc: { $gt: startUtc },
  };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  return Booking.findOne(filter);
};

// יצירת הזמנה (לקוח)
router.post('/', async (req,res) => {
  try {
    const { serviceId, customerName, phone, customerEmail, marketingOptIn, startUtc, note, paymentId } = req.body;
    if (!serviceId || !customerName || !phone || !startUtc || !customerEmail || !paymentId) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (!service.priceAmount || service.priceAmount <= 0) {
      return res.status(400).json({ error: 'Service is missing a price' });
    }

    const start = DateTime.fromISO(startUtc, { zone: 'utc' });
    if (!start.isValid) return res.status(400).json({ error: 'Invalid start datetime' });
    const end = start.plus({ minutes: service.durationMin });

    // בדיקת התנגשות
    const clash = await Booking.findOne({
      serviceId,
      startUtc: { $lt: end.toJSDate() },
      endUtc:   { $gt: start.toJSDate() }
    });
    if (clash) return res.status(409).json({ error: 'Slot already booked' });

    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'authorized') {
      return res.status(400).json({ error: 'Payment authorization is missing or invalid' });
    }
    if (String(payment.serviceId) !== String(serviceId)) {
      return res.status(400).json({ error: 'Payment does not match selected service' });
    }

    const payload = {
      serviceId, customerName, phone,
      customerEmail,
      marketingOptIn: Boolean(marketingOptIn),
      startUtc: start.toJSDate(),
      endUtc: end.toJSDate(),
      status: 'confirmed',
      paymentId: payment._id,
      paymentStatus: 'captured',
      totalAmount: payment.amount,
      currency: payment.currency || 'ILS'
    };
    if (typeof note === 'string' && note.trim()) {
      payload.note = note.trim();
    }

    const created = await Booking.create(payload);
    payment.status = 'captured';
    payment.bookingId = created._id;
    await payment.save();

    const serviceTitle = service.translations?.he?.title || service.title;
    // fire-and-forget to keep response fast
    sendBookingConfirmation(created, serviceTitle, "he").catch(console.error);
    sendAdminNotification(created, serviceTitle).catch(console.error);

    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});



// יצירת תור ידני (מנהל)
router.post('/admin', auth, async (req,res) => {
  try {
    const { serviceId, customerName, phone, customerEmail, marketingOptIn, startUtc, note, status } = req.body || {};
    if (!serviceId || !customerName || !phone || !startUtc) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const slotWindow = await buildSlotWindow(serviceId, startUtc);
    if (slotWindow.error) return res.status(slotWindow.status || 400).json({ error: slotWindow.error });

    const clash = await hasClash(serviceId, slotWindow.start, slotWindow.end);
    if (clash) return res.status(409).json({ error: 'Slot already booked' });

    const payload = {
      serviceId,
      customerName,
      phone,
      customerEmail: customerEmail || undefined,
      marketingOptIn: Boolean(marketingOptIn),
      startUtc: slotWindow.start,
      endUtc: slotWindow.end,
      status: status || 'confirmed',
      paymentStatus: 'none',
      totalAmount: 0,
      currency: slotWindow.service.priceCurrency || 'ILS',
    };
    if (typeof note === 'string' && note.trim()) {
      payload.note = note.trim();
    }

    const created = await Booking.create(payload);
    const serviceTitle = slotWindow.service.translations?.he?.title || slotWindow.service.title;
    if (customerEmail) {
      sendBookingConfirmation(created, serviceTitle, "he").catch(console.error);
    }
    sendAdminNotification(created, serviceTitle).catch(console.error);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// שאילת הזמנות (מנהל)
router.get('/', auth, async (req,res) => {
  try {
    const { from, to, status } = req.query;
    const filter = {};
    if (from || to) {
      filter.startUtc = {};
      if (from) filter.startUtc.$gte = new Date(from);
      if (to)   filter.startUtc.$lte = new Date(to);
    }
    if (status) filter.status = status;
    const items = await Booking.find(filter).populate('serviceId').populate('paymentId').sort({ startUtc: 1 }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// עדכון הזמנה (שעה/סטטוס/הערה)
router.put('/:id', auth, async (req,res) => {
  try {
    const { id } = req.params;
    const { startUtc, status, note } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: 'Not found' });

    const update = {};
    let nextPaymentStatus = null;

    if (typeof status === 'string') {
      update.status = status;
      if (booking.paymentId) {
        if (status === 'canceled') {
          update.paymentStatus = 'refunded';
          nextPaymentStatus = 'refunded';
        } else if (booking.paymentStatus === 'refunded') {
          update.paymentStatus = 'captured';
          nextPaymentStatus = 'captured';
        }
      }
    }
    if (typeof note === 'string') update.note = note;

    if (startUtc) {
      const slotWindow = await buildSlotWindow(booking.serviceId, startUtc);
      if (slotWindow.error) return res.status(slotWindow.status || 400).json({ error: slotWindow.error });
      const clash = await hasClash(booking.serviceId, slotWindow.start, slotWindow.end, id);
      if (clash) return res.status(409).json({ error: 'New time conflicts with another booking' });

      update.startUtc = slotWindow.start;
      update.endUtc   = slotWindow.end;
    }
    if (!Object.keys(update).length) return res.status(400).json({ error: 'No changes provided' });

    const saved = await Booking.findByIdAndUpdate(id, update, { new: true });
    if (!saved) return res.status(404).json({ error: 'Not found' });

    if (nextPaymentStatus && booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, { status: nextPaymentStatus });
    }

    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// מחיקת הזמנה (מנהל)
router.delete('/:id', auth, async (req,res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: 'Not found' });

    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, { status: 'refunded' });
    }
    await Booking.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
