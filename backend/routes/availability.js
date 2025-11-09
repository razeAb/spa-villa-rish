const express = require("express");
const { DateTime } = require("luxon");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Settings = require("../models/Settings");
const { generateSlotsForDate } = require("../utils/availability");
const router = express.Router();

// GET /api/availability?serviceId=...&date=2025-11-09
router.get("/", async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) return res.status(400).json({ error: "serviceId and date are required" });

    const [service, settings] = await Promise.all([Service.findById(serviceId), Settings.findOne({})]);
    if (!service) return res.status(404).json({ error: "Service not found" });

    // opening hours
    const dow = DateTime.fromISO(date, { zone: "Asia/Jerusalem" }).weekday % 7; // convert to 0..6 (Sun..Sat)
    const openingSpec = settings?.openingHours?.find((h) => h.dow === dow);
    if (!openingSpec) return res.json({ slots: [] });

    // fetch existing bookings for that date (UTC range of the day)
    const dayStartUtc = DateTime.fromISO(date, { zone: "Asia/Jerusalem" }).startOf("day").toUTC();
    const dayEndUtc = dayStartUtc.plus({ days: 1 });

    const existing = await Booking.find({
      serviceId,
      startUtc: { $lt: dayEndUtc.toJSDate() },
      endUtc: { $gt: dayStartUtc.toJSDate() },
    }).lean();

    const slots = generateSlotsForDate({
      dateISO: date,
      tz: "Asia/Jerusalem",
      serviceDurationMin: service.durationMin,
      bufferMin: settings?.bufferMin ?? 5,
      slotStepMin: settings?.slotStepMin ?? 15,
      openingSpec,
      existingBookingsUtc: existing,
    });

    res.json({ slots });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
