const express = require('express');
const { DateTime } = require('luxon');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const auth = require('../utils/authMiddleware'); // מאמת JWT לממשקים של מנהל
const router = express.Router();

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

    res.status(201).json(created);
  } catch (e) {
    console.error(e);
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
      const service = await Service.findById(booking.serviceId);
      if (!service) return res.status(404).json({ error: 'Service not found' });
      const start = DateTime.fromISO(startUtc, { zone: 'utc' });
      if (!start.isValid) return res.status(400).json({ error: 'Invalid start datetime' });
      const end = start.plus({ minutes: service.durationMin });
      const clash = await Booking.findOne({
        _id: { $ne: id },
        serviceId: booking.serviceId,
        startUtc: { $lt: end.toJSDate() },
        endUtc:   { $gt: start.toJSDate() }
      });
      if (clash) return res.status(409).json({ error: 'New time conflicts with another booking' });

      update.startUtc = start.toJSDate();
      update.endUtc   = end.toJSDate();
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

module.exports = router;
