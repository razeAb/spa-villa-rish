// Builds a branded A4 booking & payment confirmation and saves it as a PDF.
// The page is laid out as HTML (so Hebrew/RTL renders natively), captured with html2canvas,
// and placed on an A4 page with jsPDF. Both libraries load only when a customer asks for the PDF.
//
// This is a booking confirmation, not a tax invoice/receipt (חשבונית/קבלה) — those must come from
// an accounting system, e.g. Hyp's invoicing.

import { SPA_LOCATION } from "../data/spaLocation";

const LOGO_SRC = "/spa-photos/spa-rish-nav-logo-cropped.png";
const TIME_ZONE = "Asia/Jerusalem";
const CONTACT = { whatsapp: "050-629-0202", instagram: "@sparish__" };

const COLORS = {
  ink: "#141414",
  muted: "#6b6b6b",
  line: "#e6e2da",
  soft: "#f7f5f0",
  header: "#0c0c0c",
  accent: "#1f6f78",
  gold: "#b89b5e",
  paid: "#1c7c4d",
  paidBg: "#e7f4ec",
};

const TEXT = {
  he: {
    docTitle: "אישור הזמנה ותשלום",
    brandLine: "ספא וילה ריש",
    reference: "מספר הזמנה",
    issued: "תאריך הפקה",
    paid: "שולם במלואו",
    customer: "פרטי הלקוח",
    name: "שם",
    phone: "טלפון",
    email: "אימייל",
    appointment: "פרטי התור",
    treatment: "טיפול",
    date: "תאריך",
    time: "שעה",
    duration: "משך",
    minutes: "דקות",
    address: "כתובת",
    items: "פירוט",
    description: "תיאור",
    amount: "סכום",
    addOn: "תוספת",
    total: "סה״כ שולם",
    payment: "פרטי תשלום",
    method: "אמצעי תשלום",
    card: "כרטיס אשראי",
    approval: "מספר אישור",
    transaction: "מספר עסקה",
    paidAt: "מועד התשלום",
    note: "לשינוי מועד או ביטול, צרו איתנו קשר בוואטסאפ.",
    contact: "וואטסאפ",
    disclaimer: "מסמך זה מהווה אישור הזמנה ותשלום ואינו מהווה חשבונית מס או קבלה.",
    fileName: "SpaRish-booking",
  },
  en: {
    docTitle: "Booking & Payment Confirmation",
    brandLine: "Spa Villa Rish",
    reference: "Booking no.",
    issued: "Issued",
    paid: "Paid in full",
    customer: "Customer",
    name: "Name",
    phone: "Phone",
    email: "Email",
    appointment: "Appointment",
    treatment: "Treatment",
    date: "Date",
    time: "Time",
    duration: "Duration",
    minutes: "min",
    address: "Address",
    items: "Summary",
    description: "Description",
    amount: "Amount",
    addOn: "Add-on",
    total: "Total paid",
    payment: "Payment",
    method: "Method",
    card: "Credit card",
    approval: "Approval no.",
    transaction: "Transaction no.",
    paidAt: "Paid on",
    note: "To reschedule or cancel, contact us on WhatsApp.",
    contact: "WhatsApp",
    disclaimer: "This document confirms your booking and payment. It is not a tax invoice or receipt.",
    fileName: "SpaRish-booking",
  },
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const intlLocale = (locale) => (locale === "he" ? "he-IL" : "en-GB");

const formatDate = (value, locale) =>
  new Date(value).toLocaleDateString(intlLocale(locale), {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (value, locale) =>
  new Date(value).toLocaleTimeString(intlLocale(locale), { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });

const formatDateTime = (value, locale) =>
  new Date(value).toLocaleString(intlLocale(locale), {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatMoney = (amount, currency, locale) => {
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: "currency",
      currency: currency || "ILS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${amount}`;
  }
};

const row = (label, value, { ltr = false } = {}) => `
  <div style="display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px solid ${COLORS.line};">
    <span style="color:${COLORS.muted};">${escapeHtml(label)}</span>
    <span style="font-weight:500;text-align:end;${ltr ? "direction:ltr;unicode-bidi:embed;" : ""}">${escapeHtml(value)}</span>
  </div>`;

const sectionTitle = (text) => `
  <div style="font-size:12px;font-weight:700;color:${COLORS.accent};margin-bottom:6px;">${escapeHtml(text)}</div>`;

const buildMarkup = (booking, locale) => {
  const t = TEXT[locale] || TEXT.he;
  const currency = booking.currency || "ILS";
  const addOns = Array.isArray(booking.addOns) ? booking.addOns : [];
  const addOnsTotal = addOns.reduce((sum, a) => sum + Number(a.priceAmount || 0), 0);
  const basePrice = Number(booking.total || 0) - addOnsTotal;
  const serviceTitle = booking.serviceTitle?.[locale] || booking.serviceTitle?.he || "";
  const reference = String(booking.reference || "").slice(-8).toUpperCase();
  const timeRange = booking.endUtc
    ? `${formatTime(booking.startUtc, locale)} – ${formatTime(booking.endUtc, locale)}`
    : formatTime(booking.startUtc, locale);
  const payment = booking.payment || {};

  const itemRows = [
    { label: serviceTitle, amount: basePrice },
    ...addOns.map((a) => ({ label: `${t.addOn}: ${a.title}`, amount: a.priceAmount })),
  ]
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 14px;border-bottom:1px solid ${COLORS.line};">
        <span>${escapeHtml(item.label)}</span>
        <span style="direction:ltr;unicode-bidi:embed;">${escapeHtml(formatMoney(item.amount, currency, locale))}</span>
      </div>`
    )
    .join("");

  return `
  <div style="width:794px;min-height:1123px;box-sizing:border-box;background:#fff;color:${COLORS.ink};
              font-family:'Heebo',Arial,sans-serif;font-size:13px;line-height:1.5;display:flex;flex-direction:column;"
       dir="${locale === "he" ? "rtl" : "ltr"}">

    <div style="background:${COLORS.header};color:#fff;padding:34px 48px 30px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <img src="${LOGO_SRC}" alt="Spa Rish" style="height:62px;display:block;" />
        <div style="margin-top:6px;font-size:12px;color:#bdbdbd;">${escapeHtml(t.brandLine)}</div>
      </div>
      <div style="text-align:end;">
        <div style="font-size:22px;font-weight:700;">${escapeHtml(t.docTitle)}</div>
        <div style="margin-top:8px;font-size:12px;color:#bdbdbd;">${escapeHtml(t.reference)}:
          <span style="color:#fff;font-weight:500;direction:ltr;unicode-bidi:embed;">${escapeHtml(reference)}</span></div>
        <div style="font-size:12px;color:#bdbdbd;">${escapeHtml(t.issued)}:
          <span style="color:#fff;direction:ltr;unicode-bidi:embed;">${escapeHtml(formatDateTime(new Date(), locale))}</span></div>
      </div>
    </div>
    <div style="height:4px;background:linear-gradient(90deg, ${COLORS.accent}, ${COLORS.gold});"></div>

    <div style="padding:30px 48px 0;flex:1;">
      <div style="display:flex;align-items:center;justify-content:space-between;background:${COLORS.soft};
                  border:1px solid ${COLORS.line};border-radius:12px;padding:18px 22px;">
        <div>
          <div style="font-size:12px;color:${COLORS.muted};">${escapeHtml(t.treatment)}</div>
          <div style="font-size:20px;font-weight:700;">${escapeHtml(serviceTitle)}</div>
          <div style="margin-top:4px;font-size:14px;">${escapeHtml(formatDate(booking.startUtc, locale))} ·
            <span style="direction:ltr;unicode-bidi:embed;font-weight:500;">${escapeHtml(timeRange)}</span></div>
        </div>
        <div style="background:${COLORS.paidBg};color:${COLORS.paid};font-weight:700;font-size:13px;
                    border-radius:999px;padding:6px 16px;white-space:nowrap;">✓ ${escapeHtml(t.paid)}</div>
      </div>

      <div style="display:flex;gap:32px;margin-top:28px;">
        <div style="flex:1;">
          ${sectionTitle(t.customer)}
          ${row(t.name, booking.customerName)}
          ${booking.phone ? row(t.phone, booking.phone, { ltr: true }) : ""}
          ${booking.customerEmail ? row(t.email, booking.customerEmail, { ltr: true }) : ""}
        </div>
        <div style="flex:1;">
          ${sectionTitle(t.appointment)}
          ${row(t.date, formatDate(booking.startUtc, locale))}
          ${row(t.time, timeRange, { ltr: true })}
          ${booking.durationMin ? row(t.duration, `${booking.durationMin} ${t.minutes}`) : ""}
          ${row(t.address, SPA_LOCATION.address[locale] || SPA_LOCATION.address.he)}
        </div>
      </div>

      <div style="margin-top:28px;">
        ${sectionTitle(t.items)}
        <div style="border:1px solid ${COLORS.line};border-radius:10px;overflow:hidden;">
          <div style="display:flex;justify-content:space-between;padding:8px 14px;background:${COLORS.soft};
                      color:${COLORS.muted};font-size:12px;border-bottom:1px solid ${COLORS.line};">
            <span>${escapeHtml(t.description)}</span><span>${escapeHtml(t.amount)}</span>
          </div>
          ${itemRows}
          <div style="display:flex;justify-content:space-between;padding:12px 14px;font-size:15px;font-weight:700;">
            <span>${escapeHtml(t.total)}</span>
            <span style="direction:ltr;unicode-bidi:embed;">${escapeHtml(formatMoney(booking.total, currency, locale))}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:28px;width:50%;">
        ${sectionTitle(t.payment)}
        ${row(t.method, payment.last4 ? `${t.card} •••• ${payment.last4}` : t.card)}
        ${payment.approvalCode ? row(t.approval, payment.approvalCode, { ltr: true }) : ""}
        ${payment.transactionId ? row(t.transaction, payment.transactionId, { ltr: true }) : ""}
        ${payment.paidAt ? row(t.paidAt, formatDateTime(payment.paidAt, locale), { ltr: true }) : ""}
      </div>

      <div style="margin-top:28px;padding:12px 16px;border-inline-start:3px solid ${COLORS.gold};background:${COLORS.soft};
                  color:${COLORS.ink};">${escapeHtml(t.note)}</div>
    </div>

    <div style="margin:32px 48px 0;padding:16px 0 28px;border-top:1px solid ${COLORS.line};font-size:11px;color:${COLORS.muted};
                display:flex;justify-content:space-between;gap:16px;">
      <span>Spa Rish · ${escapeHtml(t.contact)}
        <span style="direction:ltr;unicode-bidi:embed;">${CONTACT.whatsapp}</span> · Instagram
        <span style="direction:ltr;unicode-bidi:embed;">${CONTACT.instagram}</span></span>
      <span>${escapeHtml(t.disclaimer)}</span>
    </div>
  </div>`;
};

export const renderBookingCanvas = async (booking, locale = "he") => {
  const { default: html2canvas } = await import("html2canvas");
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;";
  host.innerHTML = buildMarkup(booking, locale);
  document.body.appendChild(host);
  try {
    await Promise.all([
      document.fonts?.ready,
      ...[...host.querySelectorAll("img")].map((img) => img.decode().catch(() => {})),
    ]);
    return await html2canvas(host.firstElementChild, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
  } finally {
    host.remove();
  }
};

export const downloadBookingPdf = async (booking, locale = "he") => {
  const [{ jsPDF }, canvas] = await Promise.all([import("jspdf"), renderBookingCanvas(booking, locale)]);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageWidth, Math.min(imgHeight, pageHeight));
  const t = TEXT[locale] || TEXT.he;
  pdf.save(`${t.fileName}-${String(booking.reference || "").slice(-8).toUpperCase()}.pdf`);
};
