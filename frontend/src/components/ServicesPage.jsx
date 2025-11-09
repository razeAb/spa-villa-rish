// src/pages/ServicesPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";
import { useLocale } from "../context/LocaleContext.jsx";

const BOOKING_LINK = "#booking";
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
    massages: [
      {
        title: "עיסוי 50 דקות",
        type: "עיסוי",
        price: "לפי בחירה",
        desc: "עיסוי מפנק של 50 דקות בחדר פרטי מעוצב ואינטימי.",
      },
      {
        title: "עיסוי חמאם · 30 דק׳",
        type: "חמאם",
        price: "לפי בחירה",
        desc: "עיסוי מסורתי על השיש החם בתוך החמאם הטורקי — חוויה אותנטית ומיוחדת.",
      },
      {
        title: "עיסוי רפואי",
        type: "רפואי",
        price: "לפי בחירה",
        desc: "עיסוי טיפולי מקצועי להקלה על כאבים ולשחרור מתחים, מבוצע על ידי מטפל מוסמך.",
      },
      {
        title: "שוודי / תאילנדי · 50 דק׳",
        type: "שוודי / תאילנדי",
        price: "לפי בחירה",
        desc: "בחרו בין עיסוי שוודי קלאסי לבין עיסוי תאילנדי מסורתי, במפגש של 50 דקות.",
      },
    ],
    groups: [
      {
        title: "יום קבוצתי",
        type: "קבוצה",
        price: "₪300 לאדם",
        desc: "כניסה לקבוצה של עד 6 אנשים ל־3 שעות • גישה חופשית לכל המתחם: חמאם, סאונה, ג'קוזי • אזורי לאונג' מעוצבים • פינת קפה ועוגה • מושלם לימי גיבוש ואירועים.",
      },
    ],
  },
  en: {
    eyebrow: "Services & Packages",
    title: "All Options",
    description: "Choose your treatment or package and book your time. Each option includes a quick booking link.",
    massageHeading: "Massage Types",
    groupHeading: "Group Packages",
    priceLabel: "Price:",
    cta: "Book Now",
    massages: [
      {
        title: "50-Minute Massage",
        type: "Massage 50 min",
        price: "By choice",
        desc: "A pampering 50-minute massage in a designed, intimate private room.",
      },
      {
        title: "Hammam Massage · 30 min",
        type: "Hammam 30 min",
        price: "By choice",
        desc: "Traditional massage on the hot marble slab inside the Turkish hammam — a unique authentic experience.",
      },
      {
        title: "Medical Massage",
        type: "Medical",
        price: "By choice",
        desc: "Professional therapeutic massage tailored for pain and tension relief, performed by a certified therapist.",
      },
      {
        title: "Swedish / Thai · 50 min",
        type: "Swedish / Thai",
        price: "By choice",
        desc: "Choose between a classic Swedish massage or a traditional Thai massage, 50-minute session.",
      },
    ],
    groups: [
      {
        title: "Group Day",
        type: "Group",
        price: "₪300 per person",
        desc: "Entry for a group of up to 6 people for 3 hours • Free access to the entire complex: Turkish hammam, sauna, jacuzzi • Stylish lounge areas • Coffee & cake corner • Perfect for team days and events.",
      },
    ],
  },
};

function Card({ item, isHebrew, priceLabel, ctaLabel }) {
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
      <div className={`mb-3 flex items-center gap-3 ${isHebrew ? "flex-row-reverse" : "justify-between"}`}>
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

      <div className={`mt-5 flex items-center ${isHebrew ? "flex-row-reverse gap-2" : "justify-between"}`}>
        <span className="text-sm text-white/80">{priceLabel}</span>
        <span className="text-lg italic">{item.price}</span>
      </div>

      <a
        href={BOOKING_LINK}
        className={`mt-6 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/15 ${
          isHebrew ? "justify-center" : "tracking-widest"
        }`}
      >
        {ctaLabel}
        <FaChevronRight className={`text-xs ${isHebrew ? "scale-x-[-1]" : ""}`} />
      </a>
    </motion.div>
  );
}

export default function ServicesPage() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const copy = CONTENT[locale];

  return (
    <motion.section
      {...sectionMotion}
      data-section="services"
      id="all-services"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-black via-black/95 to-black text-white"
      style={{ scrollMarginTop: "120px" }}
    >
      {/* Edge lines like the hero */}
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/10 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/10 sm:right-[6%]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* Header */}
        <div className={`mb-10 text-center ${isHebrew ? "space-y-2" : ""}`} dir={isHebrew ? "rtl" : "ltr"}>
          <p className={`text-xs text-white/70 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>{copy.eyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{copy.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">{copy.description}</p>
        </div>

        {/* Massage types */}
        <div className="mb-10" dir={isHebrew ? "rtl" : "ltr"}>
          <h3 className={`mb-4 text-sm text-white/80 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>
            {copy.massageHeading}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {copy.massages.map((m, i) => (
              <Card key={i} item={m} isHebrew={isHebrew} priceLabel={copy.priceLabel} ctaLabel={copy.cta} />
            ))}
          </div>
        </div>

        {/* Group packages */}
        <div className="mt-14" dir={isHebrew ? "rtl" : "ltr"}>
          <h3 className={`mb-4 text-sm text-white/80 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>
            {copy.groupHeading}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {copy.groups.map((g, i) => (
              <Card key={i} item={g} isHebrew={isHebrew} priceLabel={copy.priceLabel} ctaLabel={copy.cta} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
