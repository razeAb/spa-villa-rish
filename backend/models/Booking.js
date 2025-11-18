const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    marketingOptIn: { type: Boolean, default: false },
    startUtc: { type: Date, required: true }, // תאריך-שעה ב-UTC
    endUtc: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "done", "canceled"], default: "confirmed" },
    note: { type: String, default: "" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    paymentStatus: { type: String, enum: ["authorized", "captured", "refunded", "failed", "none"], default: "none" },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: "ILS" },
  },
  { timestamps: true }
);

BookingSchema.index({ startUtc: 1, endUtc: 1, serviceId: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
