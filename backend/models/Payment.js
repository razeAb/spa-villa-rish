const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ILS" },
    provider: { type: String, default: "mock" },
    status: {
      type: String,
      enum: ["authorized", "captured", "failed", "refunded"],
      default: "authorized",
    },
    maskedCard: { type: String, default: "" },
    last4: { type: String, default: "" },
    expiresOn: { type: String, default: "" },
    failureReason: { type: String, default: "" },
    metadata: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

PaymentSchema.index({ status: 1, serviceId: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
