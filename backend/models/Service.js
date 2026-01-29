const mongoose = require("mongoose");

const LocalizedCopySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    typeLabel: { type: String, default: "" },
    priceDisplay: { type: String, default: "" },
  },
  { _id: false }
);

const AddOnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priceAmount: { type: Number, required: true },
    durationMin: { type: Number, default: 0 },
  },
  { _id: true }
);

const ServiceSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    typeLabel: { type: String, default: "" },
    category: { type: String, enum: ["massage", "group", "other"], default: "massage" },
    durationMin: { type: Number, required: true },
    priceAmount: { type: Number, required: true },
    priceCurrency: { type: String, default: "ILS" },
    priceDisplay: { type: String, default: "" },
    translations: {
      en: { type: LocalizedCopySchema },
      he: { type: LocalizedCopySchema },
    },
    addOns: { type: [AddOnSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
