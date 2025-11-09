import { FaChevronRight, FaWhatsapp } from "react-icons/fa";
import { useLocale } from "../context/LocaleContext.jsx";

const WHATSAPP_LINK = "https://wa.me/0000000000";

export default function FloatingActions() {
  const { locale, toggleLocale } = useLocale();
  const isHebrew = locale === "he";
  const languageLabel = isHebrew ? "English" : "עברית";

  return (
    <>
      <button
        type="button"
        onClick={toggleLocale}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-3 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-medium text-black shadow-lg shadow-black/30 transition hover:bg-white"
        aria-label="Toggle language"
      >
        <img
          src={isHebrew ? "https://flagcdn.com/w20/gb.png" : "https://flagcdn.com/w20/il.png"}
          alt={languageLabel}
          className="h-4 w-5 rounded-sm object-cover"
        />
        {languageLabel}
        <FaChevronRight className={`text-[10px] transition ${isHebrew ? "rotate-0" : "rotate-180"}`} />
      </button>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-black/80 text-white shadow-xl ring-1 ring-white/15 transition hover:scale-105"
      >
        <FaWhatsapp className="text-[18px]" />
        <span className="absolute bottom-[6px] right-[6px] h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-black" />
      </a>
    </>
  );
}
