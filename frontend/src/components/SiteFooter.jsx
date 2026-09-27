import { NavLink } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";

const LINKS = [
  { to: "/terms", label: { he: "תקנון ומדיניות ביטולים", en: "Terms & Cancellations" } },
  { to: "/privacy", label: { he: "מדיניות פרטיות", en: "Privacy Policy" } },
  { to: "/accessibility", label: { he: "הצהרת נגישות", en: "Accessibility" } },
];

export default function SiteFooter() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  return (
    <footer className="border-t border-white/10 bg-black px-6 pb-24 pt-8 text-sm text-white/70" dir={isHebrew ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="hover:text-white">
              {link.label[locale] || link.label.he}
            </NavLink>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} Spa Rish</p>
      </div>
    </footer>
  );
}
