const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const availability = require("./routes/availability");
const bookings = require("./routes/bookings");
const auth = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use("/api/auth", auth);
app.use("/api/availability", availability);
app.use("/api/bookings", bookings);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 4000, () => console.log("API running"));
