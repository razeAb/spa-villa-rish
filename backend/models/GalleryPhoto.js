const mongoose = require("mongoose");

const GalleryPhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryPhoto", GalleryPhotoSchema);
