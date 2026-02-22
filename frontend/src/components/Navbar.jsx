import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useLocale } from "../context/LocaleContext.jsx";

const PACKAGE_LINKS = [
  { id: "packages", label: { he: "רגעי BFF", en: "BFF Moments" } },
  { id: "hammam", label: { he: "ענני קצף", en: "Foam Clouds" } },
  { id: "spa-day", label: { he: "מגע המשי", en: "Silk Touch" } },
  { id: "gallery", label: { he: "גלריה", en: "Gallery" } },
  { id: "treatments", label: { he: "טיפולים אישיים", en: "Treatments" } },
  { id: "villa-stay", label: { he: "לינת וילה", en: "Villa Stay" } },
];

export default function Navbar() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 ">
      <div className="mx-auto grid w-full max-w-[1024px] grid-cols-[1fr_auto_1fr] items-center px-6 py-4 text-white">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-3 justify-self-start" aria-label="Home">
          <img
            src="/photos/spa-rish-lockup-light-he.png" // public/photos/logo.jpeg
            alt="Spa Rish"
            className="h-10 w-20 object-contain"
          />
        </a>

        {/* Center: Packages */}
        <div className="relative justify-self-center text-white" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={`flex items-center gap-2 text-sm font-light ${isHebrew ? "" : "uppercase tracking-[0.4em]"} text-white/85 transition hover:text-white`}
            aria-expanded={open}
            aria-haspopup="true"
          >
            {isHebrew ? "חבילות" : "Packages"}
            <FaChevronDown className={`text-[0.65rem] transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {open && (
            <div
              className={`absolute top-8 w-48 rounded-xl border border-white/10 bg-black/90 p-3 shadow-xl ${isHebrew ? "right-0 text-right" : "left-1/2 -translate-x-1/2 text-left"}`}
              dir={isHebrew ? "rtl" : "ltr"}
            >
              <div className="flex flex-col gap-1">
                {PACKAGE_LINKS.map((pkg) => (
                  <a
                    key={pkg.id}
                    href={`#${pkg.id}`}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white ${isHebrew ? "" : "uppercase tracking-[0.3em]"}`}
                  >
                    {pkg.label[locale]}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Menu */}
        <div className="flex items-center gap-3 justify-self-end">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={`text-sm font-light text-white/80 transition hover:text-white ${isHebrew ? "" : "uppercase tracking-[0.4em]"}`}
            aria-expanded={menuOpen}
            aria-controls="site-side-menu"
          >
            {isHebrew ? "תפריט" : "Menu"}
          </button>
          <div className="hidden flex-col gap-[3px] sm:flex">
            <span className="block h-[2px] w-4 bg-emerald-300/80" />
            <span className="ml-auto block h-[2px] w-3 bg-emerald-300/60" />
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            id="site-side-menu"
            className={`absolute inset-y-0 w-[280px] bg-black/95 px-6 py-6 text-white shadow-2xl ${
              isHebrew ? "left-0 text-right" : "right-0 text-left"
            }`}
            dir={isHebrew ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.35em] text-white/60">{isHebrew ? "תפריט" : "Menu"}</span>
              <button type="button" className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>
                X
              </button>
            </div>

            <nav className="mt-6 space-y-2">
              {PACKAGE_LINKS.map((pkg) => (
                <a
                  key={pkg.id}
                  href={`#${pkg.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-md px-2 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white ${
                    isHebrew ? "" : "uppercase tracking-[0.25em]"
                  }`}
                >
                  {pkg.label[locale]}
                </a>
              ))}
            </nav>

            <div className="mt-8 border-t border-white/10 pt-4">
              <Link
                to="/admin"
                className={`inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 ${
                  isHebrew ? "" : "uppercase tracking-[0.3em]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {isHebrew ? "כניסת אדמין" : "Admin login"}
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
