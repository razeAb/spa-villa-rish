const path = require("path");
const mongoose = require("mongoose");
const Service = require("../models/Service");
const Settings = require("../models/Settings");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const servicesSeed = [
  { title: "50-Minute Massage", durationMin: 50, price: 450 },
  { title: "Hammam Ritual · 30 min", durationMin: 30, price: 320 },
  { title: "Medical Massage", durationMin: 50, price: 480 },
];

const openingHoursSeed = [
  { dow: 0, open: "09:00", close: "19:00" },
  { dow: 1, open: "09:00", close: "19:00" },
  { dow: 2, open: "09:00", close: "19:00" },
  { dow: 3, open: "09:00", close: "19:00" },
  { dow: 4, open: "09:00", close: "16:00" },
  { dow: 5, open: "10:00", close: "15:00" },
];

async function connect() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing Mongo connection string. Set MONGODB_URI or MONGO_URI in backend/.env");
  }

  await mongoose.connect(mongoUri, { dbName: process.env.DB_NAME || "spa_booking" });
  console.log("Connected to MongoDB");
}

async function seedServices() {
  const docs = [];
  for (const svc of servicesSeed) {
    const doc = await Service.findOneAndUpdate(
      { title: svc.title },
      { $setOnInsert: svc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    docs.push(doc);
  }
  console.log(`Ensured ${docs.length} services`);
  return docs;
}

async function seedSettings() {
  const settings = await Settings.findOneAndUpdate(
    {},
    {
      slotStepMin: 15,
      bufferMin: 5,
      openingHours: openingHoursSeed,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Ensured settings with opening hours");
  return settings;
}

async function run() {
  try {
    await connect();
    await seedServices();
    await seedSettings();
    console.log("Seed complete");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
