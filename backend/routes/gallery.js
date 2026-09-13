const express = require("express");
const GalleryPhoto = require("../models/GalleryPhoto");
const auth = require("../utils/authMiddleware");

const router = express.Router();

// Public list, ordered for display
router.get("/", async (_req, res) => {
  try {
    const photos = await GalleryPhoto.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: add a photo (url comes from POST /api/uploads)
router.post("/", auth, async (req, res) => {
  try {
    const { url, sortOrder = 0 } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url is required" });
    }
    const doc = await GalleryPhoto.create({ url, sortOrder: Number(sortOrder) || 0 });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: change display order
router.patch("/:id", auth, async (req, res) => {
  try {
    const { sortOrder } = req.body;
    const doc = await GalleryPhoto.findByIdAndUpdate(
      req.params.id,
      { sortOrder: Number(sortOrder) || 0 },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ error: "Photo not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const doc = await GalleryPhoto.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Photo not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
