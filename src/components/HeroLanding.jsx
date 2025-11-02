import { motion } from "framer-motion";
import { FaChevronRight, FaWhatsapp } from "react-icons/fa";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1602910340464-34d3aac2c229?auto=format&fit=crop&w=1600&q=80";

export default function HeroLanding() {
  return (
    <section className="relative isolate flex min-h-[860px] w-full justify-center overflow-hidden bg-black text-white md:min-h-[100dvh]">
      {/* Background image */}
      <img
        src={HERO_IMAGE}
        alt="Spa interior with warm lighting"
        className="absolute inset-0 h-full w-full object-cover opacity-95"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/65 via-black/35 to-black/40" />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      {/* Edge lines */}
      <div className="pointer-events-none absolute inset-y-0 left-[4%] w-px bg-white/15 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-0 right-[4%] w-px bg-white/15 sm:right-[6%]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[768px] flex-col items-center justify-center px-6 pb-24 pt-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="uppercase"
        >
          <h1 className="text-[36px] font-light leading-[1.5] tracking-[0.6em] text-white drop-shadow-md sm:text-[40px]">
            S H E V E T
            <br />
            H A M M A M &nbsp; &amp; &nbsp; S P A
          </h1>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[11px] tracking-[0.6em] text-white/80">
        S C R O L L &nbsp; E X P L O R E
      </div>

      {/* Vertical index */}
      <div className="absolute right-[3%] top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4 text-white/70">
        <span className="h-16 w-px bg-white/30" />
        <span className="text-sm tracking-[0.4em]">06</span>
      </div>

      {/* Language selector */}
      <button className="absolute bottom-6 left-6 z-10 flex items-center gap-3 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-medium text-black shadow-lg transition hover:bg-white">
        <img
          src="https://flagcdn.com/w20/gb.png"
          alt="English"
          className="h-4 w-5 rounded-sm object-cover"
        />
        English
        <FaChevronRight className="text-[10px]" />
      </button>

      {/* WhatsApp */}
      <a
        href="https://wa.me/0000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="absolute bottom-6 right-6 z-10 grid h-12 w-12 place-items-center rounded-full bg-black/75 text-white shadow-xl ring-1 ring-white/20 transition hover:scale-105"
      >
        <FaWhatsapp className="text-[18px]" />
        <span className="absolute bottom-[6px] right-[6px] h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-black" />
      </a>
    </section>
  );
}
