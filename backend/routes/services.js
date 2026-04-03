const express = require("express");
const Service = require("../models/Service");
const auth = require("../utils/authMiddleware");

const router = express.Router();

const ALLOWED_CATEGORIES = ["massage", "group", "other"];

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeAddOns = (addOns = []) => {
  if (!Array.isArray(addOns)) return [];
  return addOns
    .map((addOn) => {
      if (!addOn || typeof addOn !== "object") return null;
      const title = String(addOn.title || "").trim();
      const description = String(addOn.description || "").trim();
      const priceAmount = Number(addOn.priceAmount);
      const durationMin = Number(addOn.durationMin) || 0;
      if (!title || !Number.isFinite(priceAmount) || priceAmount <= 0) return null;
      const payload = { title, description, priceAmount, durationMin };
      if (addOn._id) {
        payload._id = addOn._id;
      }
      return payload;
    })
    .filter(Boolean);
};

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
    const {
      id,
      title,
      description = "",
      typeLabel = "",
      category = "massage",
      durationMin,
      priceAmount,
      priceCurrency = "ILS",
      priceDisplay = "",
      translations = {},
      isActive = true,
      slug,
    } = req.body;
    const parsedDuration = Number(durationMin);
    const parsedPrice = Number(priceAmount);
    if (!title || !Number.isFinite(parsedDuration) || parsedDuration <= 0 || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: "title, durationMin, and priceAmount are required" });
    }
    const payload = {
      title,
      description,
      typeLabel,
      durationMin: parsedDuration,
      category: ALLOWED_CATEGORIES.includes(category) ? category : "other",
      priceAmount: parsedPrice,
      priceCurrency,
      priceDisplay: priceDisplay || `${priceCurrency} ${priceAmount}`,
      translations: {
        en: translations.en || undefined,
        he: translations.he || undefined,
      },
      isActive,
    };
    if (Object.prototype.hasOwnProperty.call(req.body, "addOns")) {
      payload.addOns = normalizeAddOns(req.body.addOns);
    }
    if (id) {
      if (slug) payload.slug = slug;
      const doc = await Service.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: "Service not found" });
      return res.json(doc);
    }

    payload.slug = slug || slugify(title);
    const doc = await Service.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(409).json({ error: "Slug already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Delete service (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Service.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Service not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
