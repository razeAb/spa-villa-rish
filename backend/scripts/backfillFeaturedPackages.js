// One-time migration: mark the 3 original homepage hero packages as `featured`
// with their legacy background image, now that those fields exist on Service.
// Safe to re-run — it never overwrites a photo an admin has since uploaded.
const path = require("path");
const mongoose = require("mongoose");
const Service = require("../models/Service");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const FEATURED_DEFAULTS = [
  { slug: "bff-moments", heroImage: "/photos/vipPackage.jpeg", sortOrder: 1 },
  { slug: "couple-foam-clouds", heroImage: "/photos/turkishHamam.jpg", sortOrder: 2 },
  { slug: "couple-silk-touch", heroImage: "/photos/spa-day.jpg", sortOrder: 3 },
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing Mongo connection string. Set MONGODB_URI or MONGO_URI in backend/.env");
  }
  await mongoose.connect(mongoUri, { dbName: process.env.DB_NAME || "spa_booking" });
  console.log("Connected to MongoDB");

  for (const { slug, heroImage, sortOrder } of FEATURED_DEFAULTS) {
    const doc = await Service.findOne({ slug });
    if (!doc) {
      console.warn(`Skipping "${slug}": no service with that slug exists`);
      continue;
    }
    const update = { featured: true, sortOrder };
    if (!doc.heroImage) {
      update.heroImage = heroImage;
    }
    await Service.updateOne({ slug }, { $set: update });
    console.log(`Featured "${slug}"`);
  }

  console.log("Backfill complete");
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
