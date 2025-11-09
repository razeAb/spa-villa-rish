const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    startUtc: { type: Date, required: true }, // תאריך-שעה ב-UTC
    endUtc: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "done", "canceled"], default: "confirmed" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

BookingSchema.index({ startUtc: 1, endUtc: 1, serviceId: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
