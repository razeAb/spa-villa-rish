import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { BUSINESS, LEGAL_PAGES } from "../data/legal";

const CONTACT_COPY = {
  he: {
    contact: "פרטי התקשרות",
    business: "שם העסק",
    businessId: "מספר עוסק",
    address: "כתובת",
    phone: "טלפון / וואטסאפ",
    email: "אימייל",
    coordinator: "רכז/ת נגישות",
    updated: "עודכן לאחרונה",
    back: "חזרה לאתר",
  },
  en: {
    contact: "Contact details",
    business: "Business name",
    businessId: "Business ID",
    address: "Address",
    phone: "Phone / WhatsApp",
    email: "Email",
    coordinator: "Accessibility coordinator",
    updated: "Last updated",
    back: "Back to site",
  },
};

export default function LegalPage({ page }) {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const content = LEGAL_PAGES[page]?.[locale] || LEGAL_PAGES[page]?.he;
  const copy = CONTACT_COPY[locale] || CONTACT_COPY.he;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (content) document.title = `${content.title} | Spa Rish`;
  }, [content]);

  if (!content) return null;

  const contactRows = [
    [copy.business, BUSINESS.legalName || BUSINESS.name[locale]],
    [copy.businessId, BUSINESS.businessId],
    [copy.address, BUSINESS.address[locale]],
    [copy.phone, BUSINESS.phone, true],
    [copy.email, BUSINESS.email, true],
    page === "accessibility" ? [copy.coordinator, BUSINESS.accessibilityCoordinator] : null,
  ].filter((row) => row && row[1]);

  const updated = new Date(`${BUSINESS.lastUpdated}T00:00:00`).toLocaleDateString(isHebrew ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="min-h-[100dvh] bg-black px-6 pb-20 pt-32 text-white" dir={isHebrew ? "rtl" : "ltr"}>
      <article className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl sm:text-5xl">{content.title}</h1>
        <p className="mt-3 text-sm text-white/60">
          {copy.updated}: {updated}
        </p>
        <p className="mt-8 leading-relaxed text-white/85">{content.intro}</p>

        {content.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className="mt-3 leading-relaxed text-white/85">
                {text}
              </p>
            ))}
            {section.list?.length ? (
              <ul className="mt-3 list-disc space-y-2 ps-6 leading-relaxed text-white/85">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">{copy.contact}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {contactRows.map(([label, value, ltr]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-2">
                <dt className="text-white/70">{label}</dt>
                <dd className="font-medium" dir={ltr ? "ltr" : undefined}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <NavLink to="/" className="mt-10 inline-block text-sm text-white/70 underline hover:text-white">
          {copy.back}
        </NavLink>
      </article>
    </section>
  );
}
