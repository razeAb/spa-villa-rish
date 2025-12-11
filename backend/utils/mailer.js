const nodemailer = require("nodemailer");

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM, MAIL_ADMIN, MAIL_SECURE } = process.env;

const isEnabled = Boolean(MAIL_HOST && MAIL_USER && MAIL_PASS);

const transporter = isEnabled
  ? nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT) || 587,
      secure: Number(MAIL_PORT) === 465 || String(MAIL_SECURE).toLowerCase() === "true",
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    })
  : null;

const send = async (options) => {
  if (!transporter) return false;
  await transporter.sendMail({
    from: MAIL_FROM || MAIL_USER,
    ...options,
  });
  return true;
};

const formatDateTime = (iso, lang = "he") =>
  new Date(iso).toLocaleString(lang === "he" ? "he-IL" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

const formatBooking = (booking, serviceTitle, lang = "he") => {
  const dateTime = formatDateTime(booking.startUtc || booking.start, lang);

  if (lang === "he") {
    return `שלום ${booking.customerName}

ההזמנה שלך לשירות "${serviceTitle}" נקלטה בהצלחה.
תודה שבחרת בנו.

פרטי הזמנה
• שם לקוח: ${booking.customerName}
• תאריך ושעה: ${dateTime}
• טלפון: ${booking.phone}
• אימייל: ${booking.customerEmail}

מדיניות ביטולים
ניתן לבטל הזמנה עד 3 ימים מראש.`;
  }

  return `Hello ${booking.customerName},

Your booking for "${serviceTitle}" was received successfully.
Thank you for choosing us.

Booking Details
• Customer: ${booking.customerName}
• Date & Time: ${dateTime}
• Phone: ${booking.phone}
• Email: ${booking.customerEmail}

Cancellation Policy
You can cancel your reservation up to 3 days in advance.`;
};

const sendBookingConfirmation = (booking, serviceTitle, lang = "he") =>
  send({
    to: booking.customerEmail,
    subject: lang === "he" ? "אישור תור - Villa Rish" : "Booking Confirmation - Villa Rish",
    text: formatBooking(booking, serviceTitle, lang),
  });

const sendAdminNotification = (booking, serviceTitle) => {
  if (!MAIL_ADMIN) return Promise.resolve(false);
  const dateTime = formatDateTime(booking.startUtc || booking.start, "en");
  return send({
    to: MAIL_ADMIN,
    subject: `New booking: ${serviceTitle}`,
    text: `Customer: ${booking.customerName} (${booking.phone}, ${booking.customerEmail})
Service: ${serviceTitle}
Date: ${dateTime}
Note: ${booking.note || "-"}
Total: ${booking.totalAmount || 0} ${booking.currency || ""}`.trim(),
  });
};

module.exports = {
  sendBookingConfirmation,
  sendAdminNotification,
  formatBooking,
  isEnabled,
};
