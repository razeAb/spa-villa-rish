const express = require("express");
const { DateTime } = require("luxon");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Settings = require("../models/Settings");
const { generateSlotsForDate } = require("../utils/availability");
const router = express.Router();

const DEFAULT_OPENING_HOURS = [
  { dow: 0, open: "09:00", close: "19:00" },
  { dow: 1, open: "09:00", close: "19:00" },
  { dow: 2, open: "09:00", close: "19:00" },
  { dow: 3, open: "09:00", close: "19:00" },
  { dow: 4, open: "09:00", close: "15:00" },
  { dow: 5, open: "10:00", close: "15:00" },
  { dow: 6, open: "10:00", close: "15:00" },
];

// GET /api/availability?serviceId=...&date=2025-11-09
router.get("/", async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) return res.status(400).json({ error: "serviceId and date are required" });

    const [service, settings] = await Promise.all([Service.findById(serviceId), Settings.findOne({})]);
    if (!service) return res.status(404).json({ error: "Service not found" });

    // opening hours
    const dow = DateTime.fromISO(date, { zone: "Asia/Jerusalem" }).weekday % 7; // convert to 0..6 (Sun..Sat)
    const weeklyOpening = settings?.openingHours?.length ? settings.openingHours : DEFAULT_OPENING_HOURS;
    const openingSpec = weeklyOpening.find((h) => h.dow === dow);
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

    const reserved = existing
      .map((booking) => {
        const start = DateTime.fromJSDate(booking.startUtc).setZone("Asia/Jerusalem");
        const end = DateTime.fromJSDate(booking.endUtc).setZone("Asia/Jerusalem");
        return {
          startUtc: booking.startUtc,
          endUtc: booking.endUtc,
          label: `${start.toFormat("HH:mm")} - ${end.toFormat("HH:mm")}`,
        };
      })
      .sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));

    res.json({ slots, reserved });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
