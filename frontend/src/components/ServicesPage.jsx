// src/pages/ServicesPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { useLocale } from "../context/LocaleContext.jsx";
import { getTreatmentsForLocale, getGroupPackagesForLocale } from "../data/treatments";

const BOOKING_LINK = "/booking";
const sectionMotion = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const CONTENT = {
  he: {
    eyebrow: "שירותים וחבילות",
    title: "כל האפשרויות",
    description: "בחרו טיפול או חבילה והזמינו את השעה המתאימה לכם. לכל אפשרות יש לינק הזמנה מהיר.",
    massageHeading: "סוגי עיסויים",
    groupHeading: "חבילות לקבוצות",
    priceLabel: "מחיר:",
    cta: "שריין מקום",
  },
  en: {
    eyebrow: "Services & Packages",
    title: "All Options",
    description: "Choose your treatment or package and book your time. Each option includes a quick booking link.",
    massageHeading: "Massage Types",
    groupHeading: "Group Packages",
    priceLabel: "Price:",
    cta: "Book Now",
  },
};

const buildBookingLinkProps = (identifier) => {
  if (!identifier) {
    return { to: BOOKING_LINK, state: undefined };
  }
  const serviceId = String(identifier);
  return {
    to: { pathname: BOOKING_LINK, search: `?serviceId=${encodeURIComponent(serviceId)}` },
    state: { serviceId },
  };
};

function Card({ item, isHebrew, priceLabel, ctaLabel, bookingLink, bookingState }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`group relative rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur ring-1 ring-white/10 hover:bg-white/10 ${
        isHebrew ? "text-right" : "text-left"
      }`}
      dir={isHebrew ? "rtl" : "ltr"}
    >
      {/* Title row */}
      <div className={`mb-3 flex items-center justify-between gap-3 ${isHebrew ? "flex-row-reverse" : ""}`}>
        <h3 className="font-serif text-2xl leading-tight">{item.title}</h3>
        <span
          className={`shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/80 ${
            isHebrew ? "tracking-[0.15em]" : "tracking-wide uppercase"
          }`}
        >
          {item.type}
        </span>
      </div>

      <p className="text-white/85">{item.desc}</p>

      {/* Price row */}
      <div className={`mt-5 flex items-center justify-between gap-2 ${isHebrew ? "flex-row-reverse" : ""}`}>
        <span className="text-sm text-white/80">{priceLabel}</span>
        <span className="text-lg italic">{item.price}</span>
      </div>

      {/* CTA */}
      <Link
        to={bookingLink}
        state={bookingState}
        className={`mt-6 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/15 ${
          isHebrew ? "justify-center" : "tracking-widest"
        }`}
        dir={isHebrew ? "rtl" : "ltr"}
      >
        {ctaLabel}
        <FaChevronRight className={`text-xs ${isHebrew ? "-scale-x-100" : ""}`} />
      </Link>
    </motion.div>
  );
}

export default function ServicesPage() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const copy = CONTENT[locale];
  const massages = getTreatmentsForLocale(locale);
  const groupPackages = getGroupPackagesForLocale(locale);

  return (
    <motion.section
      {...sectionMotion}
      data-section="services"
      id="all-services"
      dir={isHebrew ? "rtl" : "ltr"} // ✅ enforce RTL for Hebrew
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-black via-black/95 to-black text-white"
      style={{ scrollMarginTop: "120px" }}
    >
      {/* Edge lines like the hero */}
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/10 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/10 sm:right-[6%]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* Header */}
        <div className={`mb-10 text-center ${isHebrew ? "space-y-2" : ""}`}>
          <p className={`text-xs text-white/70 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>{copy.eyebrow}</p>
        </div>

        <h2 className="mt-3 text-center font-serif text-4xl sm:text-5xl">{copy.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-white/70">{copy.description}</p>

        {/* Massage types */}
        <div className="mb-10 mt-10">
          <h3 className={`mb-4 text-sm text-white/80 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>
            {copy.massageHeading}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {massages.map((m, i) => (
              <Card
                key={i}
                item={m}
                isHebrew={isHebrew}
                priceLabel={copy.priceLabel}
                ctaLabel={copy.cta}
                {...buildBookingLinkProps(m._id || m.id)}
              />
            ))}
          </div>
        </div>

        {/* Group packages */}
        <div className="mt-14">
          <h3 className={`mb-4 text-sm text-white/80 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>
            {copy.groupHeading}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groupPackages.map((g, i) => (
              <Card
                key={i}
                item={g}
                isHebrew={isHebrew}
                priceLabel={copy.priceLabel}
                ctaLabel={copy.cta}
                {...buildBookingLinkProps(g._id || g.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
