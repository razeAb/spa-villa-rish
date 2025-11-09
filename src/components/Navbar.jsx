import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useLocale } from "../context/LocaleContext.jsx";

const PACKAGE_LINKS = [
  { id: "packages", label: { he: "חבילת VIP", en: "VIP Couple" } },
  { id: "hammam", label: { he: "חמאם טורקי", en: "Turkish Hammam" } },
  { id: "spa-day", label: { he: "יום ספא", en: "Spa Day" } },
  { id: "all-services", label: { he: "כל השירותים", en: "Services" } },
  { id: "villa-stay", label: { he: "לינת וילה", en: "Villa Stay" } },
];

export default function Navbar() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";

  const [open, setOpen] = useState(false);
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
          <a
            href="#menu"
            className={`text-sm font-light text-white/80 transition hover:text-white ${isHebrew ? "" : "uppercase tracking-[0.4em]"}`}
          >
            {isHebrew ? "תפריט" : "Menu"}
          </a>
          <div className="hidden flex-col gap-[3px] sm:flex">
            <span className="block h-[2px] w-4 bg-emerald-300/80" />
            <span className="ml-auto block h-[2px] w-3 bg-emerald-300/60" />
          </div>
        </div>
      </div>
    </header>
  );
}
