const express = require("express");
const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Payment = require("../models/Payment");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const hyp = require("../utils/hyp");
const { sendBookingConfirmation, sendAdminNotification } = require("../utils/mailer");

const router = express.Router();

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const findClash = (serviceId, startUtc, endUtc) =>
  Booking.findOne({
    serviceId,
    startUtc: { $lt: endUtc },
    endUtc: { $gt: startUtc },
  });

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/);
  return { first: parts.shift() || "", last: parts.join(" ") };
};

const bookingSummary = (booking, service) => ({
  reference: String(booking._id),
  customerName: booking.customerName,
  startUtc: booking.startUtc,
  total: booking.totalAmount,
  currency: booking.currency,
  serviceTitle: {
    he: service?.translations?.he?.title || service?.title || "",
    en: service?.translations?.en?.title || service?.title || "",
  },
});

// Step 1: validate the booking, park it on a pending payment, and hand back the Hyp payment page URL.
router.post("/checkout", async (req, res) => {
  try {
    if (!hyp.isConfigured()) {
      return res.status(503).json({ error: "Online payment is not available right now" });
    }
    const {
      serviceId,
      addOnIds = [],
      customerName,
      phone,
      customerEmail,
      marketingOptIn,
      startUtc,
      note,
      lang,
    } = req.body || {};

    if (!serviceId || !customerName?.trim() || !phone?.trim() || !customerEmail?.trim() || !startUtc) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (!EMAIL_RE.test(customerEmail.trim())) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({ error: "Invalid service" });
    }

    const service = await Service.findById(serviceId).lean();
    if (!service || service.isActive === false) {
      return res.status(404).json({ error: "Service not found" });
    }
    if (!service.priceAmount || service.priceAmount <= 0) {
      return res.status(400).json({ error: "Service does not have a chargeable price" });
    }

    const start = DateTime.fromISO(startUtc, { zone: "utc" });
    if (!start.isValid) return res.status(400).json({ error: "Invalid start datetime" });
    if (start < DateTime.utc()) return res.status(400).json({ error: "Selected time has passed" });
    const end = start.plus({ minutes: service.durationMin });

    if (await findClash(serviceId, start.toJSDate(), end.toJSDate())) {
      return res.status(409).json({ error: "Slot already booked" });
    }

    const addOnMap = new Map(
      Array.isArray(service.addOns) ? service.addOns.map((addOn) => [String(addOn._id), addOn]) : []
    );
    const normalizedAddOnIds = Array.isArray(addOnIds) ? addOnIds.map((id) => String(id)) : [];
    const resolvedAddOns = normalizedAddOnIds.map((id) => addOnMap.get(id)).filter(Boolean);
    if (resolvedAddOns.length !== normalizedAddOnIds.length) {
      return res.status(400).json({ error: "One or more add-ons are invalid" });
    }
    const addOnsTotal = resolvedAddOns.reduce((sum, addOn) => sum + Number(addOn.priceAmount || 0), 0);
    const amount = Number(service.priceAmount) + addOnsTotal;
    const currency = service.priceCurrency || "ILS";

    const paymentId = new mongoose.Types.ObjectId();
    const payment = await Payment.create({
      _id: paymentId,
      serviceId,
      amount,
      currency,
      transactionId: `hyp_pending_${paymentId}`,
      provider: "hyp",
      status: "pending",
      addOns: resolvedAddOns.map((addOn) => ({
        addOnId: String(addOn._id),
        title: addOn.title,
        description: addOn.description || "",
        priceAmount: Number(addOn.priceAmount || 0),
        durationMin: Number(addOn.durationMin || 0),
      })),
      bookingDraft: {
        customerName: customerName.trim(),
        phone: phone.trim(),
        customerEmail: customerEmail.trim(),
        marketingOptIn: Boolean(marketingOptIn),
        startUtc: start.toJSDate(),
        note: typeof note === "string" ? note.trim() : "",
        lang: lang === "en" ? "en" : "he",
      },
    });

    const { first, last } = splitName(customerName);
    const serviceTitle = service.translations?.he?.title || service.title;
    const paymentUrl = await hyp.createPaymentPageUrl({
      amount,
      currency,
      order: String(payment._id),
      info: serviceTitle,
      clientName: first,
      clientLName: last,
      email: customerEmail.trim(),
      cell: phone.trim(),
      lang,
    });

    res.status(201).json({ paymentUrl });
  } catch (err) {
    console.error("Hyp checkout failed:", err.message);
    res.status(err instanceof hyp.HypError ? 502 : 500).json({ error: "Could not start payment" });
  }
});

// Step 2: the Hyp success page redirect lands on the frontend, which forwards its raw query string here.
router.post("/hyp/confirm", async (req, res) => {
  const rawQuery = typeof req.body?.query === "string" ? req.body.query.replace(/^\?/, "") : "";
  const params = new URLSearchParams(rawQuery);
  const order = params.get("Order");
  if (!order || !mongoose.isValidObjectId(order)) {
    return res.status(400).json({ status: "invalid", error: "Missing order reference" });
  }

  let payment;
  try {
    payment = await Payment.findOneAndUpdate(
      { _id: order, provider: "hyp", status: "pending" },
      { status: "processing" },
      { new: true }
    );

    if (!payment) {
      // Already handled (page refresh, double effect) or unknown — report the current state.
      const existing = await Payment.findById(order);
      if (!existing) return res.status(404).json({ status: "invalid", error: "Payment not found" });
      if (existing.status === "processing") return res.status(202).json({ status: "processing" });
      if (existing.status === "captured" && existing.bookingId) {
        const booking = await Booking.findById(existing.bookingId);
        const service = await Service.findById(existing.serviceId).lean();
        if (booking) return res.json({ status: "confirmed", booking: bookingSummary(booking, service) });
      }
      if (existing.status === "refunded" && existing.failureReason === "slot_taken") {
        return res.status(409).json({ status: "slot_taken" });
      }
      return res.status(400).json({ status: "failed" });
    }

    const fail = async (reason, httpStatus = 400, status = "failed") => {
      payment.status = "failed";
      payment.failureReason = reason;
      await payment.save();
      return res.status(httpStatus).json({ status });
    };

    if (params.get("CCode") !== "0") {
      return fail(`Hyp CCode ${params.get("CCode")}`);
    }

    let verification;
    try {
      verification = await hyp.verifyRedirect(rawQuery);
    } catch (err) {
      // Network trouble talking to Hyp — release the lock so a retry can verify again.
      console.error("Hyp verify error:", err.message);
      payment.status = "pending";
      await payment.save();
      return res.status(502).json({ status: "retry" });
    }
    if (!verification.ok) {
      return fail(`Hyp VERIFY CCode ${verification.ccode}`);
    }

    // The payment is real from here on.
    payment.hypTransId = params.get("Id") || "";
    payment.transactionId = payment.hypTransId ? `hyp_${payment.hypTransId}` : payment.transactionId;
    payment.hypApprovalCode = params.get("ACode") || "";
    const last4 = params.get("L4digit") || "";
    if (last4) {
      payment.last4 = last4;
      payment.maskedCard = `**** **** **** ${last4}`;
    }
    const tMonth = params.get("Tmonth");
    const tYear = params.get("Tyear");
    if (tMonth && tYear) payment.expiresOn = `${String(tMonth).padStart(2, "0")}/${String(tYear).slice(-2)}`;

    const paidAmount = Number(params.get("Amount"));
    const service = await Service.findById(payment.serviceId).lean();
    const draft = payment.bookingDraft || {};
    const start = draft.startUtc ? DateTime.fromJSDate(draft.startUtc, { zone: "utc" }) : null;
    const end = start && service ? start.plus({ minutes: service.durationMin }) : null;

    const amountMismatch = !Number.isFinite(paidAmount) || Math.abs(paidAmount - payment.amount) > 0.01;
    const clash = !amountMismatch && end ? await findClash(payment.serviceId, start.toJSDate(), end.toJSDate()) : null;

    if (amountMismatch || !end || clash) {
      const reason = amountMismatch ? "amount_mismatch" : !end ? "service_missing" : "slot_taken";
      try {
        const reversal = await hyp.reverseTransaction(payment.hypTransId, paidAmount || payment.amount);
        payment.status = "refunded";
        payment.hypRefundId = reversal.refundId || "";
        payment.failureReason = reason;
      } catch (err) {
        console.error(`Hyp auto-reversal failed for payment ${payment._id}:`, err.message);
        payment.status = "captured";
        payment.failureReason = `${reason}; auto refund failed — refund manually in Hyp`;
      }
      await payment.save();
      return res.status(409).json({ status: reason === "slot_taken" ? "slot_taken" : "failed" });
    }

    const booking = await Booking.create({
      serviceId: payment.serviceId,
      customerName: draft.customerName,
      phone: draft.phone,
      customerEmail: draft.customerEmail,
      marketingOptIn: Boolean(draft.marketingOptIn),
      startUtc: start.toJSDate(),
      endUtc: end.toJSDate(),
      status: "confirmed",
      note: draft.note || "",
      paymentId: payment._id,
      paymentStatus: "captured",
      totalAmount: payment.amount,
      currency: payment.currency || "ILS",
      addOns: Array.isArray(payment.addOns) ? payment.addOns : [],
    });

    payment.status = "captured";
    payment.bookingId = booking._id;
    await payment.save();

    const serviceTitle = service.translations?.he?.title || service.title;
    // fire-and-forget to keep response fast
    sendBookingConfirmation(booking, serviceTitle, "he").catch(console.error);
    sendAdminNotification(booking, serviceTitle).catch(console.error);

    res.status(201).json({ status: "confirmed", booking: bookingSummary(booking, service) });
  } catch (err) {
    console.error("Hyp confirm failed:", err);
    if (payment && payment.status === "processing" && !payment.hypTransId) {
      await Payment.updateOne({ _id: payment._id, status: "processing" }, { status: "pending" }).catch(() => {});
    }
    res.status(500).json({ status: "error" });
  }
});

module.exports = router;
