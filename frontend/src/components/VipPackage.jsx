import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";

const VIP_SLUG = "vip-couple";

const COPY = {
  he: {
    kicker: "חבילות +",
    heading: "חבילת VIP זוגית",
    bullets: ["כניסה לשניים עד 3 שעות", "עיסוי של 50 דקות לכל אחד בחדר פרטי", "גישה חופשית לחמאם, סאונה וג'קוזי", "פינת קפה ועוגה"],
    price: "₪1,200 — זוג VIP",
    cta: "שריין מקום",
  },
  en: {
    kicker: "Packages +",
    heading: "VIP Couple Package",
    bullets: [
      "Entry for two, up to 3 hours",
      "50-minute massage for each person in a private massage room",
      "Free access to the Turkish hammam, sauna & jacuzzi",
      "Coffee & cake corner",
    ],
    price: "₪1,200 — VIP Couple",
    cta: "Book Now",
  },
};

const sectionMotion = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function VipPackage() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const copy = COPY[locale];

  return (
    <motion.section
      {...sectionMotion}
      data-section="vip"
      id="packages"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/photos/vipPackage.jpeg')", scrollMarginTop: "120px" }}
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-lines opacity-20" />

      {/* Edge lines */}
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/15 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/15 sm:right-[6%]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1100px] items-center px-6 py-24 md:px-10">
        <div
          className={`max-w-[680px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] ${isHebrew ? "text-right" : "text-left"}`}
          dir={isHebrew ? "rtl" : "ltr"}
        >
          <p className={`mb-6 text-sm text-white/85 ${isHebrew ? "tracking-[0.25em]" : "uppercase tracking-[0.35em]"}`}>{copy.kicker}</p>

          <h2 className="font-serif text-[42px] leading-[1.1] sm:text-[56px]">{copy.heading}</h2>

          <ul className={`mt-6 list-disc space-y-3 text-base leading-relaxed text-white/85 ${isHebrew ? "pr-5" : "pl-5"}`}>
            {copy.bullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p className="mt-8 text-lg italic">{copy.price}</p>

          <Link
            to={{ pathname: "/booking", search: `?serviceSlug=${encodeURIComponent(VIP_SLUG)}` }}
            state={{ serviceSlug: VIP_SLUG }}
            className={`mt-8 inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15 ${
              isHebrew ? "" : "tracking-widest"
            }`}
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
