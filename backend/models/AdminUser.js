const mongoose = require("mongoose");

const AdminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["manager"], default: "manager" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

AdminUserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("AdminUser", AdminUserSchema);
