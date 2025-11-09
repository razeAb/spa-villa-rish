const express = require('express');
const { DateTime } = require('luxon');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const auth = require('../utils/authMiddleware'); // מאמת JWT לממשקים של מנהל
const router = express.Router();

// יצירת הזמנה (לקוח)
router.post('/', async (req,res) => {
  try {
    const { serviceId, customerName, phone, startUtc, note } = req.body;
    if (!serviceId || !customerName || !phone || !startUtc) return res.status(400).json({ error: 'Missing fields' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

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

    const payload = {
      serviceId, customerName, phone,
      startUtc: start.toJSDate(),
      endUtc: end.toJSDate(),
      status: 'confirmed'
    };
    if (typeof note === 'string' && note.trim()) {
      payload.note = note.trim();
    }

    const created = await Booking.create(payload);

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
    const items = await Booking.find(filter).populate('serviceId').sort({ startUtc: 1 }).lean();
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
    const update = {};
    if (typeof status === 'string') update.status = status;
    if (typeof note === 'string')   update.note = note;
  if (startUtc) {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: 'Not found' });

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
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
