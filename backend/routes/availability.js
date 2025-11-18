const express = require("express");
const { DateTime } = require("luxon");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Settings = require("../models/Settings");
const { generateSlotsForDate } = require("../utils/availability");
const { DEFAULT_OPENING_HOURS, normalizeOpeningHours } = require("../utils/openingHours");
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
    const normalized = normalizeOpeningHours(settings?.openingHours);
    const weeklyOpening = normalized.length ? normalized : DEFAULT_OPENING_HOURS;
    const defaultSpec = DEFAULT_OPENING_HOURS.find((h) => h.dow === dow);
    const openingSpec = weeklyOpening.find((h) => h.dow === dow) || defaultSpec;
    const reserved = [];
    if (!openingSpec) {
      return res.json({ slots: [], reserved });
    }

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

    const reservedSlots = existing
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

    res.json({ slots, reserved: reservedSlots });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
