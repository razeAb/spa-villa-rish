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
      // pending: customer sent to Hyp; processing: redirect being verified (lock)
      enum: ["pending", "processing", "authorized", "captured", "failed", "refunded"],
      default: "pending",
    },
    maskedCard: { type: String, default: "" },
    last4: { type: String, default: "" },
    expiresOn: { type: String, default: "" },
    failureReason: { type: String, default: "" },
    hypTransId: { type: String, default: "" },
    hypApprovalCode: { type: String, default: "" },
    hypRefundId: { type: String, default: "" },
    // Booking details held until Hyp confirms the charge
    bookingDraft: {
      customerName: String,
      phone: String,
      customerEmail: String,
      marketingOptIn: Boolean,
      startUtc: Date,
      note: String,
      lang: String,
    },
    addOns: {
      type: [
        {
          addOnId: { type: String, default: "" },
          title: { type: String, default: "" },
          description: { type: String, default: "" },
          priceAmount: { type: Number, default: 0 },
          durationMin: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    metadata: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

PaymentSchema.index({ status: 1, serviceId: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
