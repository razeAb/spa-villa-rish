import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";

export default function SectionProgress() {
  const { locale } = useLocale();
  const isHebrew = locale === "he";
  const location = useLocation();
  const [state, setState] = useState({ current: 1, total: 0 });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("section[data-section]"));
    if (!sections.length) {
      setState({ current: 0, total: 0 });
      return;
    }
    setState((prev) => ({ ...prev, total: sections.length }));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target);
            if (index !== -1) {
              setState((prev) => ({ ...prev, current: index + 1 }));
            }
          }
        });
      },
      {
        threshold: 0.55,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  if (state.total <= 1) return null;

  const formattedCurrent = String(state.current).padStart(2, "0");
  const formattedTotal = String(state.total).padStart(2, "0");

  return (
    <div
      className={`fixed top-1/2 z-30 -translate-y-1/2 flex flex-col items-center gap-4 text-white/75 ${
        isHebrew ? "left-[2.75%]" : "right-[2.75%]"
      }`}
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <span className="block h-12 w-px bg-white/30" />
      <span className="grid h-3 w-3 place-items-center rounded-full border border-white/30">
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      </span>
      <span className={`text-xs tracking-[0.45em] ${isHebrew ? "tracking-[0.3em]" : ""}`}>
        {formattedCurrent}/{formattedTotal}
      </span>
    </div>
  );
}
