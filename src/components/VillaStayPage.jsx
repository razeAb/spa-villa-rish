// src/pages/VillaStayPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { useLocale } from "../context/LocaleContext.jsx";

const sectionMotion = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function VillaStayPage() {
  const WHATSAPP_LINK =
    "https://wa.me/972506290202?text=Hi%20Spa%20Rish%2C%20I%27m%20interested%20in%20the%20Villa%20overnight%20stay%20(₪1%2C300)%20for%20two.";

  const { locale } = useLocale();
  const isHebrew = locale === "he";

  const copy = isHebrew
    ? {
        eyebrow: "חבילות +",
        heading: "לינה בוילה",
        bullets: [
          "לינת לילה לזוג בווילה ריש המפוארת (על בסיס זמינות)",
          "הווילה מדורגת 10 בבוקינג",
          "בריכה מחוממת פרטית",
          "פינת ברביקיו",
          "מטבח מאובזר",
          "גן פרטי",
          "חדרים מעוצבים",
          "המשך מושלם אחרי יום הספא",
        ],
        price: "₪1,300 — ללילה (לזוג)",
        cta: "שלחו וואטסאפ",
      }
    : {
        eyebrow: "Packages +",
        heading: "Villa Overnight Stay",
        bullets: [
          "Overnight stay for two at the luxurious Villa Rish (subject to availability)",
          "Villa rated 10 on Booking",
          "Private heated pool",
          "BBQ corner",
          "Fully equipped kitchen",
          "Private garden",
          "Designer rooms",
          "Perfect continuation after your spa day",
        ],
        price: "₪1,300 — per night (for two)",
        cta: "WhatsApp Us",
      };

  return (
    <motion.section
      {...sectionMotion}
      data-section="villa"
      id="villa-stay"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/photos/villa-stay.jpg')", scrollMarginTop: "120px" }} // replace with your image
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-lines opacity-20" />

      {/* Edge lines */}
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/12 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/12 sm:right-[6%]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1100px] items-center px-6 py-24 md:px-10">
        <div
          className={`max-w-[720px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] ${isHebrew ? "text-right" : "text-left"}`}
          dir={isHebrew ? "rtl" : "ltr"}
        >
          <p className={`mb-6 text-sm text-white/80 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>{copy.eyebrow}</p>

          <h1 className="font-serif text-[42px] leading-[1.1] sm:text-[56px]">{copy.heading}</h1>

          <ul className={`mt-6 list-disc space-y-3 text-base leading-relaxed text-white/85 ${isHebrew ? "pr-5" : "pl-5"}`}>
            {copy.bullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p className="mt-8 text-lg italic">{copy.price}</p>

          {/* WhatsApp CTA (no standard booking button) */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className={`mt-8 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15 ${
              isHebrew ? "justify-center" : "tracking-widest"
            }`}
          >
            <FaWhatsapp className="text-base" />
            {copy.cta}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
