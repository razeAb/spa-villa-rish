const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const availability = require("./routes/availability");
const bookings = require("./routes/booking");
const auth = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/availability", availability);
app.use("/api/bookings", bookings);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = parseInt(process.env.PORT, 10) || 4000;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Missing Mongo connection string. Set MONGODB_URI (or MONGO_URI) in backend/.env");
  process.exit(1);
}

mongoose
  .connect(mongoUri, { dbName: process.env.DB_NAME || "spa_booking" })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API running on :${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
