const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Service = require("../models/Service");
const Settings = require("../models/Settings");
const AdminUser = require("../models/AdminUser");
const { hashPassword } = require("../utils/password");
const { DEFAULT_OPENING_HOURS } = require("../utils/openingHours");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const catalogPath = path.join(__dirname, "..", "..", "frontend", "src", "data", "servicesCatalog.json");
const catalogRaw = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const servicesSeed = catalogRaw.map((svc) => ({
  slug: svc.id,
  title: svc.translations?.en?.title || svc.id,
  description: svc.translations?.en?.description || "",
  typeLabel: svc.translations?.en?.typeLabel || "",
  category: svc.category || "massage",
  durationMin: svc.durationMin,
  priceAmount: svc.priceAmount,
  priceCurrency: svc.priceCurrency || "ILS",
  priceDisplay: svc.translations?.en?.priceDisplay || "",
  translations: svc.translations || {},
}));

const openingHoursSeed = DEFAULT_OPENING_HOURS;

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
      { slug: svc.slug },
      { $set: svc },
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

async function seedAdminUser() {
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;
  if (!username || !password) {
    console.warn("ADMIN_USER/ADMIN_PASS missing. Skipping admin user seed.");
    return null;
  }
  const existing = await AdminUser.findOne({ username });
  if (existing) {
    if (process.env.RESET_ADMIN_USER === "true") {
      existing.passwordHash = hashPassword(password);
      await existing.save();
      console.log(`Reset credentials for existing admin "${username}"`);
    } else {
      console.log(`Admin user "${username}" already exists. Set RESET_ADMIN_USER=true to overwrite.`);
    }
    return existing;
  }
  const doc = await AdminUser.create({
    username,
    passwordHash: hashPassword(password),
    role: "manager",
  });
  console.log(`Created admin user "${username}"`);
  return doc;
}

async function run() {
  try {
    await connect();
    await seedServices();
    await seedSettings();
    await seedAdminUser();
    console.log("Seed complete");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
