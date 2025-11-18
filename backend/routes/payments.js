const express = require("express");
const Payment = require("../models/Payment");
const Service = require("../models/Service");

const router = express.Router();

const cleanDigits = (value = "") => value.replace(/\D/g, "");

const luhnCheck = (num) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(num.charAt(i), 10);
    if (Number.isNaN(digit)) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const isExpiryValid = (expiry) => {
  if (typeof expiry !== "string") return false;
  const sanitized = expiry.trim();
  const match = sanitized.match(/^(\d{2})[\/\-]?(\d{2,4})$/);
  if (!match) return false;
  const month = Number.parseInt(match[1], 10);
  if (month < 1 || month > 12) return false;
  let year = Number.parseInt(match[2], 10);
  if (match[2].length === 2) {
    year += 2000;
  }
  const now = new Date();
  const expiryDate = new Date(year, month - 1, 1);
  expiryDate.setMonth(expiryDate.getMonth() + 1, 1); // card is valid through the stated month
  return expiryDate > now;
};

router.post("/authorize", async (req, res) => {
  try {
    const { cardNumber, expiry, cvc, serviceId } = req.body || {};
    if (!cardNumber || !expiry || !cvc || !serviceId) {
      return res.status(400).json({ error: "Missing payment fields" });
    }
    const digits = cleanDigits(cardNumber);
    if (digits.length < 12 || digits.length > 19 || !luhnCheck(digits)) {
      return res.status(400).json({ error: "Invalid card number" });
    }
    if (!isExpiryValid(expiry)) {
      return res.status(400).json({ error: "Card expiry is invalid or past" });
    }
    const cvcDigits = cleanDigits(cvc);
    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      return res.status(400).json({ error: "Invalid CVC" });
    }

    const service = await Service.findById(serviceId).lean();
    if (!service || service.isActive === false) {
      return res.status(404).json({ error: "Service not found" });
    }
    if (!service.priceAmount || service.priceAmount <= 0) {
      return res.status(400).json({ error: "Service does not have a chargeable price" });
    }

    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payment = await Payment.create({
      serviceId,
      amount: service.priceAmount,
      currency: service.priceCurrency || "ILS",
      transactionId,
      maskedCard: `**** **** **** ${digits.slice(-4)}`,
      last4: digits.slice(-4),
      expiresOn: expiry,
      provider: "mock",
      status: "authorized",
    });

    res.status(201).json({
      paymentId: payment._id,
      transactionId,
      amount: payment.amount,
      currency: payment.currency,
      maskedCard: payment.maskedCard,
      status: payment.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to authorize payment" });
  }
});

module.exports = router;
