import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { getTreatmentsForLocale } from "../data/treatments";

const BOOKING_LINK = "/booking";

const sectionMotion = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const COPY = {
  he: {
    eyebrow: "טיפולים אישיים",
    title: "טיפולים בודדים",
    description: "בחרו טיפול אישי והזמינו בקליק.",
    priceLabel: "מחיר:",
    cta: "שריין מקום",
  },
  en: {
    eyebrow: "Individual Treatments",
    title: "Personal Treatments",
    description: "Pick a single treatment and book in one click.",
    priceLabel: "Price:",
    cta: "Book Now",
  },
};

const buildBookingLinkProps = (service) => {
  const slug = service?.slug || service?.serviceId || service?._id || service?.id;
  const id = service?._id || service?.serviceId || service?.id || slug;
  if (!slug && !id) {
    return { to: BOOKING_LINK, state: undefined };
  }
  const slugString = slug ? String(slug) : "";
  const idString = id ? String(id) : "";
  const params = new URLSearchParams();
  if (slugString) params.set("serviceSlug", slugString);
  if (idString) params.set("serviceId", idString);
  return {
    to: { pathname: BOOKING_LINK, search: params.toString() ? `?${params.toString()}` : "" },
    state: { serviceSlug: slugString || undefined, serviceId: idString || undefined },
  };
};

function TreatmentCard({ item, isHebrew, priceLabel, ctaLabel }) {
  const { to, state } = buildBookingLinkProps(item);
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
      <div className={`mb-3 flex items-center justify-between gap-3 ${isHebrew ? "flex-row-reverse" : ""}`}>
        <h3 className="font-serif text-2xl leading-tight">{item.title}</h3>
        {item.typeLabel ? (
          <span
            className={`shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/80 ${
              isHebrew ? "tracking-[0.15em]" : "tracking-wide uppercase"
            }`}
          >
            {item.typeLabel}
          </span>
        ) : null}
      </div>

      <p className="text-white/85 whitespace-pre-line">{item.description}</p>

      <div className={`mt-5 flex items-center justify-between gap-2 ${isHebrew ? "flex-row-reverse" : ""}`}>
        <span className="text-lg italic">{item.priceDisplay}</span>
        <span className="text-sm text-white/80">{priceLabel}</span>
      </div>

      <Link
        to={to}
        state={state}
        className={`mt-6 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/15 ${
          isHebrew ? "justify-center" : "tracking-widest"
        }`}
      >
        {ctaLabel}
      </Link>
    </motion.div>
  );
}

export default function IndividualTreatments() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const copy = COPY[locale];
  const treatments = getTreatmentsForLocale(locale);

  return (
    <motion.section
      {...sectionMotion}
      id="treatments"
      data-section="treatments"
      dir={isHebrew ? "rtl" : "ltr"}
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/spa-photos/DSC_6879.jpg')", scrollMarginTop: "120px" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
      <div className="absolute inset-0 bg-lines opacity-20" />
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/10 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/10 sm:right-[6%]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-10 text-center">
          <p className={`text-xs text-white/70 ${isHebrew ? "tracking-[0.2em]" : "uppercase tracking-[0.35em]"}`}>
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{copy.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">{copy.description}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((treatment) => (
            <TreatmentCard
              key={treatment.slug || treatment._id}
              item={treatment}
              isHebrew={isHebrew}
              priceLabel={copy.priceLabel}
              ctaLabel={copy.cta}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
