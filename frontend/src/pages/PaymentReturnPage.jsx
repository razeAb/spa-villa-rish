import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { api } from "../api/client";
import { useLocale } from "../context/LocaleContext.jsx";
import { downloadBookingPdf } from "../utils/bookingPdf";
import { SPA_LOCATION } from "../data/spaLocation";

// Hyp redirects here after a successful payment (configured as the success URL in the Hyp portal).
// The backend verifies the redirect with Hyp before the booking is created.

const COPY = {
  he: {
    verifying: "מאמתים את התשלום…",
    confirmTitle: "ההזמנה אושרה!",
    confirmSubtitle: "שלחנו את הפרטים למייל. נתראה בקרוב.",
    confirmSubtitleNoEmail: "שמרו את אישור ההזמנה למטה. נתראה בקרוב.",
    confirmReference: "מספר הזמנה",
    confirmWhen: "מועד",
    confirmBookedFor: "עבור",
    totalLabel: "שולם",
    slotTakenTitle: "השעה נתפסה",
    slotTakenBody: "מישהו הזמין את השעה הזו לפני שהתשלום הושלם. החיוב בוטל והכסף יוחזר לכרטיס. אפשר לבחור שעה אחרת.",
    failedTitle: "התשלום לא אושר",
    failedBody: "לא חויבתם. אפשר לנסות שוב, ואם הבעיה חוזרת צרו איתנו קשר.",
    errorTitle: "לא הצלחנו לאמת את התשלום",
    errorBody: "אם חויבתם, ההזמנה תטופל ידנית — צרו איתנו קשר ונסדר הכל.",
    bookAgain: "חזרה להזמנה",
    home: "חזרה לאתר",
    downloadPdf: "הורדת אישור הזמנה (PDF)",
    directions: "איך מגיעים",
    waze: "ניווט ב-Waze",
    googleMaps: "ניווט ב-Google Maps",
    preparingPdf: "מכין PDF…",
  },
  en: {
    verifying: "Verifying your payment…",
    confirmTitle: "You're booked!",
    confirmSubtitle: "We've emailed you the details. See you soon.",
    confirmSubtitleNoEmail: "Save your booking confirmation below. See you soon.",
    confirmReference: "Booking reference",
    confirmWhen: "When",
    confirmBookedFor: "For",
    totalLabel: "Paid",
    slotTakenTitle: "That time was taken",
    slotTakenBody: "Someone booked this slot before your payment completed. The charge was reversed and the money will return to your card. Please pick another time.",
    failedTitle: "Payment was not approved",
    failedBody: "You were not charged. Please try again, and contact us if it keeps happening.",
    errorTitle: "We couldn't verify your payment",
    errorBody: "If you were charged, we'll sort out your booking manually — please contact us.",
    bookAgain: "Back to booking",
    home: "Back to site",
    downloadPdf: "Download confirmation (PDF)",
    directions: "Getting here",
    waze: "Navigate with Waze",
    googleMaps: "Open in Google Maps",
    preparingPdf: "Preparing PDF…",
  },
};

const MAX_ATTEMPTS = 6;
const RETRY_DELAY_MS = 2000;

const formatCurrency = (amount, currency = "ILS", locale = "en") => {
  try {
    return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const formatWhen = (iso, locale) =>
  new Date(iso).toLocaleString(locale === "he" ? "he-IL" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PaymentReturnPage() {
  const { locale } = useLocale();
  const copy = COPY[locale];
  const isHebrew = locale === "he";
  const [state, setState] = useState({ status: "verifying", booking: null });
  const [pdfBusy, setPdfBusy] = useState(false);

  const handleDownloadPdf = async () => {
    if (!state.booking || pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadBookingPdf(state.booking, locale);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setPdfBusy(false);
    }
  };

  // When Hyp's form is embedded on the booking page, its success redirect lands inside the iframe.
  // Move the whole window here so the confirmation isn't shown in a box on the old page.
  const insideFrame = typeof window !== "undefined" && window.top !== window.self;
  if (insideFrame) {
    try {
      window.top.location.replace(window.location.href);
    } catch {
      /* cross-origin parent — fall through and render in place */
    }
  }

  useEffect(() => {
    if (insideFrame) return undefined;
    // Forward the query string untouched — Hyp's signature depends on parameter order.
    const rawQuery = window.location.search;
    let alive = true;
    let timer;

    const attempt = async (n) => {
      try {
        const result = await api.confirmHypPayment(rawQuery);
        if (!alive) return;
        if (result?.status === "processing" && n < MAX_ATTEMPTS) {
          timer = setTimeout(() => attempt(n + 1), RETRY_DELAY_MS);
          return;
        }
        setState({ status: result?.status === "confirmed" ? "confirmed" : "error", booking: result?.booking || null });
      } catch (err) {
        if (!alive) return;
        const status = err?.payload?.status;
        if ((status === "retry" || err?.status >= 500) && n < MAX_ATTEMPTS) {
          timer = setTimeout(() => attempt(n + 1), RETRY_DELAY_MS);
          return;
        }
        if (status === "slot_taken") setState({ status: "slot_taken", booking: null });
        else if (status === "failed" || status === "invalid") setState({ status: "failed", booking: null });
        else setState({ status: "error", booking: null });
      }
    };

    attempt(1);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [insideFrame]);

  const booking = state.booking;

  const renderBody = () => {
    if (state.status === "verifying") {
      return <p className="text-center text-white/70">{copy.verifying}</p>;
    }

    if (state.status === "confirmed" && booking) {
      return (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500/10 text-2xl text-emerald-300">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{copy.confirmTitle}</h2>
            <p className="mt-2 text-sm text-white/70">{booking.emailSent ? copy.confirmSubtitle : copy.confirmSubtitleNoEmail}</p>
          </div>
          <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span className="text-white/50">{copy.confirmBookedFor}</span>
              <span className="font-medium text-white">{booking.serviceTitle?.[locale] || booking.serviceTitle?.he}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">{copy.confirmWhen}</span>
              <span className="font-medium text-white">{formatWhen(booking.startUtc, locale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">{copy.totalLabel}</span>
              <span className="font-medium text-white">{formatCurrency(booking.total || 0, booking.currency, locale)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-white/50">{copy.confirmReference}</span>
              <span className="font-mono text-xs text-white/60">{booking.reference.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-white/5 p-5 text-sm">
            <p className="text-white/50">{copy.directions}</p>
            <p className="mt-1 font-medium text-white">{SPA_LOCATION.address[locale] || SPA_LOCATION.address.he}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href={SPA_LOCATION.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#33ccff] px-4 py-2 text-center font-semibold text-black hover:bg-[#33ccff]/85"
              >
                {copy.waze}
              </a>
              <a
                href={SPA_LOCATION.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 text-center text-white hover:border-white/60"
              >
                {copy.googleMaps}
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfBusy}
              className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-white/80 disabled:cursor-wait disabled:bg-white/60"
            >
              {pdfBusy ? copy.preparingPdf : copy.downloadPdf}
            </button>
            <NavLink to="/" className="rounded-full border border-white/20 px-6 py-2 text-sm text-white hover:border-white/60">
              {copy.home}
            </NavLink>
          </div>
        </div>
      );
    }

    const [title, body] =
      state.status === "slot_taken"
        ? [copy.slotTakenTitle, copy.slotTakenBody]
        : state.status === "failed"
          ? [copy.failedTitle, copy.failedBody]
          : [copy.errorTitle, copy.errorBody];

    return (
      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">{body}</p>
        </div>
        <NavLink to="/booking" className="inline-block rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-white/80">
          {copy.bookAgain}
        </NavLink>
      </div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-[100dvh] bg-gradient-to-b from-black via-black to-[#050505] px-6 py-20 text-white"
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40">
        {renderBody()}
      </div>
    </motion.section>
  );
}
