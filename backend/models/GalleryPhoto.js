const mongoose = require("mongoose");

const GalleryPhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryPhoto", GalleryPhotoSchema);
