import { Link } from "react-router-dom";

// Single source of truth for the admin section's cross-page nav links, so
// every admin screen offers the same set instead of each page hand-rolling
// its own list (which had drifted — some pages were missing Gallery,
// History, Guide, or even the back-to-site link entirely).
const LINKS = [
  { to: "/admin", he: "קונסולת אדמין", en: "Admin console" },
  { to: "/admin/calendar", he: "לוח שנה", en: "Calendar" },
  { to: "/admin/history", he: "היסטוריה", en: "History" },
  { to: "/admin/services", he: "שירותים", en: "Services" },
  { to: "/admin/gallery", he: "גלריה", en: "Gallery" },
  { to: "/admin/guide", he: "מדריך", en: "Guide", external: true },
];

export default function AdminNav({ lang = "he", onToggleLang, currentPath }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
      {LINKS.filter((link) => link.to !== currentPath).map((link) => (
        <Link
          key={link.to}
          to={link.to}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noreferrer" : undefined}
          className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10"
        >
          {lang === "he" ? link.he : link.en}
        </Link>
      ))}
      <Link to="/" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
        {lang === "he" ? "חזרה לאתר" : "← Back to site"}
      </Link>
      {onToggleLang ? (
        <button onClick={onToggleLang} className="rounded-lg border border-white/20 px-3 py-1 hover:bg-white/10">
          {lang === "he" ? "English" : "עברית"}
        </button>
      ) : null}
    </div>
  );
}
