const express = require('express');
const { DateTime } = require('luxon');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const auth = require('../utils/authMiddleware'); // מאמת JWT לממשקים של מנהל
const { sendBookingConfirmation, sendAdminNotification } = require('../utils/mailer');
const hyp = require('../utils/hyp');
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

// Returns the customer's money through Hyp when a paid booking is canceled or deleted.
// Mock (pre-Hyp) payments only have their DB status updated.
const refundBookingPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.status === 'refunded') return;
  if (payment.provider === 'hyp' && payment.status === 'captured' && payment.hypTransId) {
    const reversal = await hyp.reverseTransaction(payment.hypTransId, payment.amount);
    payment.hypRefundId = reversal.refundId || '';
  }
  payment.status = 'refunded';
  await payment.save();
};

// Customer bookings are created in routes/payments.js once Hyp confirms the charge.

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
    const { from, to, status, excludeStatus, limit, skip, sort } = req.query;
    const filter = {};
    if (from || to) {
      filter.startUtc = {};
      if (from) filter.startUtc.$gte = new Date(from);
      if (to)   filter.startUtc.$lte = new Date(to);
    }
    if (status) {
      filter.status = status;
    } else if (excludeStatus) {
      filter.status = { $ne: excludeStatus };
    }

    let query = Booking.find(filter)
      .populate('serviceId')
      .populate('paymentId')
      .sort({ startUtc: sort === 'desc' ? -1 : 1 });

    const skipNum = Number(skip);
    if (Number.isFinite(skipNum) && skipNum > 0) query = query.skip(skipNum);
    const limitNum = Number(limit);
    if (Number.isFinite(limitNum) && limitNum > 0) query = query.limit(limitNum);

    const items = await query.lean();
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
    let refundNeeded = false;
    let restoreMockPayment = false;

    if (typeof status === 'string') {
      update.status = status;
      if (booking.paymentId) {
        if (status === 'canceled' && booking.paymentStatus !== 'refunded') {
          refundNeeded = true;
          update.paymentStatus = 'refunded';
        } else if (status !== 'canceled' && booking.paymentStatus === 'refunded') {
          // A real Hyp refund can't be undone; only legacy mock payments flip back.
          const payment = await Payment.findById(booking.paymentId).lean();
          if (payment && payment.provider !== 'hyp') {
            update.paymentStatus = 'captured';
            restoreMockPayment = true;
          }
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

    if (refundNeeded) {
      try {
        await refundBookingPayment(booking.paymentId);
      } catch (err) {
        console.error(`Refund failed for booking ${id}:`, err.message);
        return res.status(502).json({ error: 'Refund through Hyp failed — booking was not canceled. Try again or refund from the Hyp portal.' });
      }
    }

    const saved = await Booking.findByIdAndUpdate(id, update, { new: true });
    if (!saved) return res.status(404).json({ error: 'Not found' });

    if (restoreMockPayment) {
      await Payment.findByIdAndUpdate(booking.paymentId, { status: 'captured' });
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

    if (booking.paymentId && booking.paymentStatus !== 'refunded') {
      try {
        await refundBookingPayment(booking.paymentId);
      } catch (err) {
        console.error(`Refund failed for booking ${id}:`, err.message);
        return res.status(502).json({ error: 'Refund through Hyp failed — booking was not deleted. Try again or refund from the Hyp portal.' });
      }
    }
    await Booking.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
