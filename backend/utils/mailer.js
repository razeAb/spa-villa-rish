// backend/utils/mailer.js
const nodemailer = require("nodemailer");

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM, MAIL_ADMIN } = process.env;
const enabled = MAIL_HOST && MAIL_USER && MAIL_PASS;

const transporter = enabled
  ? nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT) || 587,
      secure: Number(MAIL_PORT) === 465,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    })
  : null;

const send = async (opts) => {
  if (!enabled) return false;
  await transporter.sendMail({ from: MAIL_FROM || MAIL_USER, ...opts });
  return true;
};

const formatBooking = (booking, serviceTitle, lang = "he") =>
  lang === "he"
    ? `שלום ${booking.customerName},
