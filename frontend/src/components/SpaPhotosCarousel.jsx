import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../context/LocaleContext.jsx";

const IMAGE_NAMES = [
  "DSC_6847.jpg",
  "DSC_6851.jpg",
  "DSC_6853.jpg",
  "DSC_6873.jpg",
  "DSC_6876.jpg",
  "DSC_6879.jpg",
  "DSC_6891.jpg",
  "DSC_6916.jpg",
  "DSC_6962.jpg",
];

const sectionMotion = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function SpaPhotosCarousel() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const [index, setIndex] = useState(0);
  const images = useMemo(() => IMAGE_NAMES.map((name) => `/spa-photos/${encodeURIComponent(name)}`), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const copy = isHebrew
    ? {
        kicker: "גלריה",
        heading: "רגעים מהספא",
        desc: "הצצה לחוויות, לאווירה ולפרטים הקטנים.",
      }
    : {
        kicker: "Gallery",
        heading: "Spa Moments",
        desc: "A look at the atmosphere, details, and spaces.",
      };

  const goNext = () => setIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <motion.section
      {...sectionMotion}
      id="gallery"
      data-section="gallery"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-black text-white"
      style={{ scrollMarginTop: "120px" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      <div className="absolute inset-0 bg-lines opacity-20" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-4 py-16 sm:px-6 md:py-28">
        <div className={`mb-8 ${isHebrew ? "text-right" : "text-left"}`} dir={isHebrew ? "rtl" : "ltr"}>
          <p className={`text-xs text-white/70 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>{copy.kicker}</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{copy.heading}</h2>
          <p className="mt-3 max-w-2xl text-white/70">{copy.desc}</p>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
          <div className="relative h-[45vh] min-h-[260px] sm:h-[55vh] sm:min-h-[320px] lg:h-[62vh]">
            {images.map((src, idx) => (
              <div
                key={src}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  idx === index ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <img
                  src={src}
                  alt={`${copy.heading} ${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 px-3 py-2 text-xs text-white/90 backdrop-blur transition hover:bg-black/60 sm:left-4 sm:px-4 sm:text-sm"
            aria-label={isHebrew ? "תמונה קודמת" : "Previous photo"}
          >
            {isHebrew ? "הקודם" : "Prev"}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 px-3 py-2 text-xs text-white/90 backdrop-blur transition hover:bg-black/60 sm:right-4 sm:px-4 sm:text-sm"
            aria-label={isHebrew ? "תמונה הבאה" : "Next photo"}
          >
            {isHebrew ? "הבא" : "Next"}
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-4">
            {images.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                onClick={() => setIndex(idx)}
                className={`h-2 w-2 rounded-full border border-white/40 transition sm:h-2.5 sm:w-2.5 ${
                  idx === index ? "bg-white" : "bg-white/20"
                }`}
                aria-label={(isHebrew ? "עבור לתמונה " : "Go to image ") + (idx + 1)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
