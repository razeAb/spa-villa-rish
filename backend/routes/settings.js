const express = require("express");
const Settings = require("../models/Settings");
const auth = require("../utils/authMiddleware");
const { DEFAULT_OPENING_HOURS, normalizeOpeningHours } = require("../utils/openingHours");

const router = express.Router();

const serializeSettings = (doc) => {
  if (!doc) {
    return {
      slotStepMin: 15,
      bufferMin: 5,
      openingHours: DEFAULT_OPENING_HOURS,
    };
  }
  return {
    slotStepMin: doc.slotStepMin ?? 15,
    bufferMin: doc.bufferMin ?? 5,
    openingHours: Array.isArray(doc.openingHours) && doc.openingHours.length ? doc.openingHours : DEFAULT_OPENING_HOURS,
  };
};

router.get("/", async (_req, res) => {
  try {
    const doc = await Settings.findOne({}).lean();
    res.json(serializeSettings(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const slotStepMin = Number.parseInt(req.body.slotStepMin, 10);
    const bufferMin = Number.parseInt(req.body.bufferMin, 10);
    if (!Number.isFinite(slotStepMin) || slotStepMin <= 0) {
      return res.status(400).json({ error: "slotStepMin must be a positive number" });
    }
    if (!Number.isFinite(bufferMin) || bufferMin < 0) {
      return res.status(400).json({ error: "bufferMin must be zero or positive" });
    }

    const normalized = normalizeOpeningHours(req.body.openingHours);
    const openingHours = normalized.length ? normalized : DEFAULT_OPENING_HOURS;

    const payload = {
      slotStepMin,
      bufferMin,
      openingHours,
    };

    const doc = await Settings.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.json(serializeSettings(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
