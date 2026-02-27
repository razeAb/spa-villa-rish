const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const availability = require("./routes/availability");
const bookings = require("./routes/booking");
const auth = require("./routes/auth");
const services = require("./routes/services");
const payments = require("./routes/payments");
const settingsRoute = require("./routes/settings");
const { ensureCatalogServices } = require("./utils/catalog");
const { generalLimiter, loginLimiter } = require("./middleware/rateLimit");
const requestLogger = require("./middleware/logger");

const app = express();
const trustProxySetting = process.env.TRUST_PROXY;
const parsedTrustProxy = trustProxySetting
  ? trustProxySetting === "true"
    ? 1
    : Number.isNaN(Number(trustProxySetting))
      ? trustProxySetting
      : Number(trustProxySetting)
  : process.env.NODE_ENV === "production"
    ? 1
    : false;
app.set("trust proxy", parsedTrustProxy);
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(generalLimiter);

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", auth);
app.use("/api/availability", availability);
app.use("/api/bookings", bookings);
app.use("/api/services", services);
app.use("/api/payments", payments);
app.use("/api/settings", settingsRoute);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = parseInt(process.env.PORT, 10) || 4000;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Missing Mongo connection string. Set MONGODB_URI (or MONGO_URI) in backend/.env");
  process.exit(1);
}

mongoose
  .connect(mongoUri, { dbName: process.env.DB_NAME || "spa_booking" })
  .then(async () => {
    console.log("Connected to MongoDB");
    await ensureCatalogServices();
    console.log("Catalog services synced");
    app.listen(PORT, () => console.log(`API running on :${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
