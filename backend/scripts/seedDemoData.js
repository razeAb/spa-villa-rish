const path = require("path");
const mongoose = require("mongoose");
const Service = require("../models/Service");
const Settings = require("../models/Settings");
const AdminUser = require("../models/AdminUser");
const { hashPassword } = require("../utils/password");
const { DEFAULT_OPENING_HOURS } = require("../utils/openingHours");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const servicesSeed = [
  {
    slug: "massage-50",
    title: "50-Minute Massage",
    description: "A pampering 50-minute massage in a designed, intimate private room.",
    typeLabel: "Massage 50 min",
    category: "massage",
    durationMin: 180,
    priceAmount: 450,
    priceCurrency: "ILS",
    priceDisplay: "By choice",
    translations: {
      en: {
        title: "50-Minute Massage",
        description: "A pampering 50-minute massage in a designed, intimate private room.",
        typeLabel: "Massage 50 min",
        priceDisplay: "By choice",
      },
      he: {
        title: "עיסוי 50 דקות",
        description: "עיסוי מפנק של 50 דקות בחדר פרטי מעוצב ואינטימי.",
        typeLabel: "עיסוי",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    slug: "hammam-30",
    title: "Hammam Massage · 30 min",
    description: "Traditional massage on the hot marble slab inside the Turkish hammam — a unique authentic experience.",
    typeLabel: "Hammam 30 min",
    category: "massage",
    durationMin: 180,
    priceAmount: 320,
    priceCurrency: "ILS",
    priceDisplay: "By choice",
    translations: {
      en: {
        title: "Hammam Massage · 30 min",
        description: "Traditional massage on the hot marble slab inside the Turkish hammam — a unique authentic experience.",
        typeLabel: "Hammam 30 min",
        priceDisplay: "By choice",
      },
      he: {
        title: "עיסוי חמאם · 30 דק׳",
        description: "עיסוי מסורתי על השיש החם בתוך החמאם הטורקי — חוויה אותנטית ומיוחדת.",
        typeLabel: "חמאם",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    slug: "medical-massage",
    title: "Medical Massage",
    description: "Professional therapeutic massage tailored for pain and tension relief, performed by a certified therapist.",
    typeLabel: "Medical",
    category: "massage",
    durationMin: 180,
    priceAmount: 480,
    priceCurrency: "ILS",
    priceDisplay: "By choice",
    translations: {
      en: {
        title: "Medical Massage",
        description:
          "Professional therapeutic massage tailored for pain and tension relief, performed by a certified therapist.",
        typeLabel: "Medical",
        priceDisplay: "By choice",
      },
      he: {
        title: "עיסוי רפואי",
        description: "עיסוי טיפולי מקצועי להקלה על כאבים ולשחרור מתחים, מבוצע על ידי מטפל מוסמך.",
        typeLabel: "רפואי",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    slug: "swedish-thai-50",
    title: "Swedish / Thai · 50 min",
    description: "Choose between a classic Swedish massage or a traditional Thai massage, 50-minute session.",
    typeLabel: "Swedish / Thai",
    category: "massage",
    durationMin: 180,
    priceAmount: 460,
    priceCurrency: "ILS",
    priceDisplay: "By choice",
    translations: {
      en: {
        title: "Swedish / Thai · 50 min",
        description: "Choose between a classic Swedish massage or a traditional Thai massage, 50-minute session.",
        typeLabel: "Swedish / Thai",
        priceDisplay: "By choice",
      },
      he: {
        title: "שוודי / תאילנדי · 50 דק׳",
        description: "בחרו בין עיסוי שוודי קלאסי לבין עיסוי תאילנדי מסורתי, במפגש של 50 דקות.",
        typeLabel: "שוודי / תאילנדי",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    slug: "vip-couple",
    title: "VIP Couple Package",
    description:
      "Entry for two up to 3 hours • 50-minute massage for each person • Full access to hammam, sauna & jacuzzi • Coffee & cake corner.",
    typeLabel: "VIP",
    category: "group",
    durationMin: 180,
    priceAmount: 1200,
    priceCurrency: "ILS",
    priceDisplay: "₪1,200 per couple",
    translations: {
      en: {
        title: "VIP Couple Package",
        description:
          "Entry for two up to 3 hours • 50-minute massage for each person • Full access to hammam, sauna & jacuzzi • Coffee & cake corner.",
        typeLabel: "VIP",
        priceDisplay: "₪1,200 per couple",
      },
      he: {
        title: "חבילת VIP זוגית",
        description:
          "כניסה לזוג עד 3 שעות • עיסוי של 50 דקות לכל אחד • גישה מלאה לחמאם, סאונה וג'קוזי • פינת קפה ועוגה.",
        typeLabel: "VIP",
        priceDisplay: "₪1,200 לזוג",
      },
    },
  },
  {
    slug: "group-day",
    title: "Group Day",
    description:
      "Entry for a group of up to 6 people for 3 hours • Free access to the entire complex plus coffee & cake corner.",
    typeLabel: "Group",
    category: "group",
    durationMin: 180,
    priceAmount: 300,
    priceCurrency: "ILS",
    priceDisplay: "₪300 per person",
    translations: {
      en: {
        title: "Group Day",
        description:
          "Entry for a group of up to 6 people for 3 hours • Free access to the entire complex plus coffee & cake corner.",
        typeLabel: "Group",
        priceDisplay: "₪300 per person",
      },
      he: {
        title: "יום קבוצתי",
        description:
          "כניסה לקבוצה של עד 6 אנשים ל־3 שעות • גישה חופשית לכל המתחם: חמאם, סאונה, ג'קוזי • אזורי לאונג' • פינת קפה ועוגה.",
        typeLabel: "קבוצה",
        priceDisplay: "₪300 לאדם",
      },
    },
  },
];

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
