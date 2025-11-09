const mongoose = require("mongoose");
// שעות פתיחה לפי ימים (0=Sunday בישראל? ב-JS 0=Sunday. עדיף לשמור מפורשות)
const SettingsSchema = new mongoose.Schema(
  {
    slotStepMin: { type: Number, default: 15 }, // גודל סלוטים להצגה
    bufferMin: { type: Number, default: 5 }, // באפר לפני/אחרי טיפול
    openingHours: [
      {
        dow: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
        open: { type: String, required: true }, // "09:00"
        close: { type: String, required: true }, // "20:00"
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
