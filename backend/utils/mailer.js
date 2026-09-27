const path = require("path");
const nodemailer = require("nodemailer");

// Embedded (cid) rather than linked, so it shows even when the email app blocks remote images.
const LOGO_ATTACHMENT = { filename: "spa-rish-logo.png", path: path.join(__dirname, "../assets/email-logo.png"), cid: "spa-rish-logo" };

// Accepts MAIL_* or SMTP_* names.
const env = (name) => process.env[`MAIL_${name}`] || process.env[`SMTP_${name}`];
const MAIL_HOST = env("HOST");
const MAIL_PORT = env("PORT");
const MAIL_USER = env("USER");
const MAIL_PASS = env("PASS");
const MAIL_FROM = env("FROM");
const MAIL_ADMIN = env("ADMIN");
const MAIL_SECURE = env("SECURE");

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

// Keep in sync with frontend/src/data/spaLocation.js.
const SPA_DESTINATION = "ספא ריש Spa rish, אלחדיתה, Yarka, 2496700";
const SPA_LOCATION = {
  address: { he: "אלחדיתה, ירכא, 2496700", en: "Al-Hadita, Yarka, 2496700" },
  wazeUrl: `https://waze.com/ul?q=${encodeURIComponent(SPA_DESTINATION)}&navigate=yes`,
  googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SPA_DESTINATION)}`,
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDateTime = (iso, lang = "he") =>
  new Date(iso).toLocaleString(lang === "he" ? "he-IL" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jerusalem", // servers run in UTC; bookings are in Israel time
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

איך מגיעים
${SPA_LOCATION.address.he}
ניווט ב-Waze: ${SPA_LOCATION.wazeUrl}
ניווט ב-Google Maps: ${SPA_LOCATION.googleMapsUrl}

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

Getting here
${SPA_LOCATION.address.en}
Waze: ${SPA_LOCATION.wazeUrl}
Google Maps: ${SPA_LOCATION.googleMapsUrl}

Cancellation Policy
You can cancel your reservation up to 3 days in advance.`;
};

// Branded email frame (logo header + white card). Inline styles and tables only,
// since email clients strip <style> blocks and modern layout.
const emailShell = (bodyHtml, lang = "he") => {
  const he = lang === "he";
  const dir = he ? "rtl" : "ltr";
  return `<!doctype html>
<html dir="${dir}" lang="${he ? "he" : "en"}"><body style="margin:0;background:#f4f2ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="${dir}"
  style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#141414;text-align:${he ? "right" : "left"};">
  <tr><td align="center" style="background:#0c0c0c;padding:22px 28px;color:#ffffff;font-size:20px;font-weight:700;">
    <img src="cid:${LOGO_ATTACHMENT.cid}" width="180" height="70" alt="Spa Rish" style="display:block;border:0;width:180px;height:auto;" />
  </td></tr>
  <tr><td style="height:4px;background:#1f6f78;"></td></tr>
  <tr><td style="padding:28px;">
${bodyHtml}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
};

const detailRow = (label, valueHtml, he) =>
  `<tr><td style="padding:6px 0;color:#6b6b6b;vertical-align:top;">${escapeHtml(label)}</td>` +
  `<td style="padding:6px 0;text-align:${he ? "left" : "right"};font-weight:600;">${valueHtml}</td></tr>`;

const emailButton = (href, label, bg, color) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;margin:4px;padding:12px 22px;border-radius:999px;` +
  `background:${bg};color:${color};text-decoration:none;font-weight:700;">${escapeHtml(label)}</a>`;

// Customer confirmation, with tap-to-navigate buttons.
const formatBookingHtml = (booking, serviceTitle, lang = "he") => {
  const he = lang === "he";
  const t = he
    ? {
        greeting: `שלום ${booking.customerName},`,
        intro: `ההזמנה שלך ל"${serviceTitle}" אושרה. תודה שבחרת בנו!`,
        details: "פרטי ההזמנה",
        when: "מועד",
        phone: "טלפון",
        email: "אימייל",
        directions: "איך מגיעים",
        waze: "ניווט ב-Waze",
        maps: "ניווט ב-Google Maps",
        policyTitle: "מדיניות ביטולים",
        policy: "ניתן לבטל הזמנה עד 3 ימים מראש.",
      }
    : {
        greeting: `Hello ${booking.customerName},`,
        intro: `Your booking for "${serviceTitle}" is confirmed. Thank you for choosing us!`,
        details: "Booking details",
        when: "When",
        phone: "Phone",
        email: "Email",
        directions: "Getting here",
        waze: "Navigate with Waze",
        maps: "Open in Google Maps",
        policyTitle: "Cancellation policy",
        policy: "You can cancel your reservation up to 3 days in advance.",
      };
  const row = (label, value) => detailRow(label, escapeHtml(value), he);

  return emailShell(
    `
    <p style="margin:0 0 6px;font-size:16px;">${escapeHtml(t.greeting)}</p>
    <p style="margin:0 0 22px;font-size:15px;">${escapeHtml(t.intro)}</p>
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1f6f78;">${escapeHtml(t.details)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #e6e2da;">
      ${row(t.when, formatDateTime(booking.startUtc || booking.start, lang))}
      ${row(t.phone, booking.phone)}
      ${row(t.email, booking.customerEmail)}
    </table>
    <div style="margin-top:24px;padding:18px;border-radius:12px;background:#f7f5f0;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1f6f78;">${escapeHtml(t.directions)}</p>
      <p style="margin:0 0 12px;font-size:14px;">${escapeHtml(SPA_LOCATION.address[lang] || SPA_LOCATION.address.he)}</p>
      ${emailButton(SPA_LOCATION.wazeUrl, t.waze, "#33ccff", "#000000")}
      ${emailButton(SPA_LOCATION.googleMapsUrl, t.maps, "#141414", "#ffffff")}
    </div>
    <p style="margin:24px 0 4px;font-size:13px;font-weight:700;">${escapeHtml(t.policyTitle)}</p>
    <p style="margin:0;font-size:13px;color:#6b6b6b;">${escapeHtml(t.policy)}</p>`,
    lang
  );
};

const sendBookingConfirmation = (booking, serviceTitle, lang = "he") =>
  send({
    to: booking.customerEmail,
    subject: lang === "he" ? "אישור הזמנה - Spa Rish" : "Booking Confirmation - Spa Rish",
    text: formatBooking(booking, serviceTitle, lang),
    html: formatBookingHtml(booking, serviceTitle, lang),
    attachments: [LOGO_ATTACHMENT],
  });

// Israeli mobile (05X...) -> 9725X... for WhatsApp links.
const toWhatsAppNumber = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
};

const formatMoney = (amount, currency = "ILS") => {
  try {
    return new Intl.NumberFormat("he-IL", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);
  } catch {
    return `${amount || 0} ${currency}`;
  }
};

const adminAlertRows = (booking, serviceTitle) => {
  const paid = booking.paymentStatus === "captured";
  const addOns = (booking.addOns || []).map((a) => `${a.title} (${formatMoney(a.priceAmount, booking.currency)})`).join(", ");
  return [
    ["לקוח", booking.customerName],
    ["טלפון", booking.phone, `<a href="tel:${escapeHtml(booking.phone)}" style="color:#1f6f78;" dir="ltr">${escapeHtml(booking.phone)}</a>`],
    booking.customerEmail ? ["אימייל", booking.customerEmail, `<span dir="ltr">${escapeHtml(booking.customerEmail)}</span>`] : null,
    ["טיפול", serviceTitle],
    ["מועד", formatDateTime(booking.startUtc || booking.start, "he")],
    addOns ? ["תוספות", addOns] : null,
    ["סה״כ", formatMoney(booking.totalAmount, booking.currency)],
    ["תשלום", paid ? "שולם באשראי ✓" : "ללא תשלום אונליין"],
    booking.note ? ["הערה", booking.note] : null,
  ].filter(Boolean);
};

// New-booking alert for the owner, in Hebrew.
const formatAdminNotificationHtml = (booking, serviceTitle) => {
  const whatsapp = toWhatsAppNumber(booking.phone);
  return emailShell(
    `
    <p style="margin:0 0 18px;font-size:18px;font-weight:700;">הזמנה חדשה התקבלה</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #e6e2da;">
      ${adminAlertRows(booking, serviceTitle)
        .map(([label, value, html]) => detailRow(label, html || escapeHtml(value), true))
        .join("")}
    </table>
    ${whatsapp ? `<div style="margin-top:22px;text-align:center;">${emailButton(`https://wa.me/${whatsapp}`, "שליחת וואטסאפ ללקוח", "#25d366", "#000000")}</div>` : ""}`,
    "he"
  );
};

const sendAdminNotification = (booking, serviceTitle) => {
  if (!MAIL_ADMIN) return Promise.resolve(false);
  const text = ["הזמנה חדשה התקבלה", ...adminAlertRows(booking, serviceTitle).map(([label, value]) => `${label}: ${value}`)].join("\n");
  return send({
    to: MAIL_ADMIN,
    subject: `הזמנה חדשה: ${serviceTitle} – ${formatDateTime(booking.startUtc || booking.start, "he")}`,
    text,
    html: formatAdminNotificationHtml(booking, serviceTitle),
    attachments: [LOGO_ATTACHMENT],
  });
};

module.exports = {
  sendBookingConfirmation,
  sendAdminNotification,
  formatBooking,
  formatBookingHtml,
  formatAdminNotificationHtml,
  isEnabled,
};
