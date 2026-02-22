import { motion } from "framer-motion";
import { useLocale } from "../context/LocaleContext.jsx";

const COPY = {
  he: {
    headingLine1: "ספא ריש",
    headingLine2: "חמאם וספא",
    scroll: "גלול להמשך",
  },
  en: {
    headingLine1: "SPA RISH",
    headingLine2: "HAMMAM & SPA",
    scroll: "SCROLL  EXPLORE",
  },
};
const sectionMotion = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function HeroLanding() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const copy = COPY[locale];

  return (
    <motion.section
      {...sectionMotion}
      data-section="hero"
      className="relative isolate flex min-h-[100dvh] w-full justify-center overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/photos/spa-home.jpg')" }}
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-lines opacity-20" />

      {/* Edge lines */}
      <div className="pointer-events-none absolute inset-y-6 left-[3.5%] w-px bg-white/15 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-6 right-[3.5%] w-px bg-white/20 sm:right-[6%]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-[858px] w-full max-w-[768px] flex-col items-center justify-center px-6 pb-28 pt-36 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className={isHebrew ? "font-light text-white" : "uppercase"}
          dir={isHebrew ? "rtl" : "ltr"}
        >
          <h1
            className={`text-[34px] font-light leading-[1.6] text-white drop-shadow-md sm:text-[38px] ${
              isHebrew ? "tracking-[0.2em]" : "tracking-[0.62em]"
            }`}
          >
            {copy.headingLine1}
            <br />
            {copy.headingLine2}
          </h1>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[11px] text-white/80 ${
          isHebrew ? "tracking-[0.2em]" : "tracking-[0.7em]"
        }`}
      >
        {copy.scroll}
      </div>

    </motion.section>
  );
}
