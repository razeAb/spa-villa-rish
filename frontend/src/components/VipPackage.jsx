import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { useServices } from "../hooks/useServices";

const VIP_SLUG = "bff-moments";

const COPY = {
  he: {
    kicker: "חבילות +",
    heading: "רגעי BFF",
    description:
      "שימוש פרטי בחמאם, סאונה וג'קוזי • עיסוי מקצועי 45 דקות • ערכת חמאם לטיפול עצמי • כיבוד קפה ותה • 2 שעות: ₪400 למשתתפת • 3 שעות: ₪500 למשתתפת • מינימום 3 משתתפות.",
    price: "₪400–₪500 למשתתפת",
    cta: "שריין מקום",
  },
  en: {
    kicker: "Packages +",
    heading: "BFF Moments",
    description:
      "Private use of Hammam, Sauna & Jacuzzi • 45-minute professional massage • Hammam treatment kit • Coffee & tea refreshments • 2 Hours: ₪400 per participant • 3 Hours: ₪500 per participant • Minimum 3 participants.",
    price: "₪400–₪500 per participant",
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
  const { services } = useServices();
  const isHebrew = locale === "he";
  const copy = COPY[locale];
  const service = services.find((svc) => svc.slug === VIP_SLUG);
  const description = service?.translations?.[locale]?.description || service?.description || copy.description || "";

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

          {description ? (
            <p className="mt-6 text-lg leading-relaxed text-white/90 whitespace-pre-line drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              {description}
            </p>
          ) : null}

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
