// Manual, explicit catalog bootstrap — run by hand (npm run sync:catalog) when
// setting up a fresh/empty database. This used to run automatically on every
// server boot, which meant deleting a service in the admin panel didn't stick:
// the next restart re-inserted it from this static catalog with its original
// hardcoded title/price. Never wire this back into index.js's boot sequence.
const path = require("path");
const mongoose = require("mongoose");
const { ensureCatalogServices } = require("../utils/catalog");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing Mongo connection string. Set MONGODB_URI or MONGO_URI in backend/.env");
  }
  await mongoose.connect(mongoUri, { dbName: process.env.DB_NAME || "spa_booking" });
  console.log("Connected to MongoDB");
  await ensureCatalogServices();
  console.log("Catalog services synced");
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
