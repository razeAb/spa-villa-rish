const express = require("express");
const Service = require("../models/Service");
const auth = require("../utils/authMiddleware");

const router = express.Router();

// Public list of active services
router.get("/", async (_req, res) => {
  try {
    const services = await Service.find({ isActive: { $ne: false } }).sort({ title: 1 }).lean();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Minimal admin endpoint to add/update services
router.post("/", auth, async (req, res) => {
  try {
    const { id, title, durationMin, price, isActive = true } = req.body;
    if (!title || !durationMin) {
      return res.status(400).json({ error: "title and durationMin are required" });
    }

    let doc;
    if (id) {
      doc = await Service.findByIdAndUpdate(
        id,
        { title, durationMin, price, isActive },
        { new: true, runValidators: true }
      );
    } else {
      doc = await Service.create({ title, durationMin, price, isActive });
    }

    res.status(id ? 200 : 201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
