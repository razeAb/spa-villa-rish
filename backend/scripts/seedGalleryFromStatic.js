// One-time migration: bring the hardcoded homepage gallery photos into the
// database as real, deletable GalleryPhoto documents, so the admin gallery
// screen has full control over them (not just newly uploaded photos).
// Safe to re-run — skips any url that's already there.
const path = require("path");
const mongoose = require("mongoose");
const GalleryPhoto = require("../models/GalleryPhoto");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const STATIC_IMAGE_NAMES = [
  "DSC_6847.jpg",
  "DSC_6851.jpg",
  "DSC_6853.jpg",
  "DSC_6873.jpg",
  "DSC_6876.jpg",
  "DSC_6879.jpg",
  "DSC_6891.jpg",
  "DSC_6916.jpg",
  "DSC_6962.jpg",
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing Mongo connection string. Set MONGODB_URI or MONGO_URI in backend/.env");
  }
  await mongoose.connect(mongoUri, { dbName: process.env.DB_NAME || "spa_booking" });
  console.log("Connected to MongoDB");

  for (let i = 0; i < STATIC_IMAGE_NAMES.length; i++) {
    const url = `/spa-photos/${encodeURIComponent(STATIC_IMAGE_NAMES[i])}`;
    const existing = await GalleryPhoto.findOne({ url });
    if (existing) {
      console.log(`Skipping "${url}": already in gallery`);
      continue;
    }
    await GalleryPhoto.create({ url, sortOrder: i + 1 });
    console.log(`Added: ${url}`);
  }

  console.log("Gallery seed complete");
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
