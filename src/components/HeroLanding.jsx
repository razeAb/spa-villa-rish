import { motion } from "framer-motion";
import { FaChevronRight, FaWhatsapp } from "react-icons/fa";

export default function HeroLanding() {
  return (
    <section
      className="relative isolate flex min-h-[100dvh] w-full justify-center overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/photos/spa-home.jpg')" }}
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-lines opacity-20" />

      {/* Edge lines */}
      <div className="pointer-events-none absolute inset-y-6 left-[3.5%] w-px bg-white/15 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-6 right-[3.5%] w-px bg-white/20 sm:right-[6%]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-[858px] w-full max-w-[768px] flex-col items-center justify-center px-6 pb-28 pt-36 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="uppercase"
        >
          <h1 className="text-[34px] font-light leading-[1.6] tracking-[0.62em] text-white drop-shadow-md sm:text-[38px]">
            S H E V E T
            <br />H A M M A M &nbsp; &amp; &nbsp; S P A
          </h1>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[11px] tracking-[0.7em] text-white/80">
        S C R O L L &nbsp; E X P L O R E
      </div>

      {/* Vertical index */}
      <div className="absolute right-[2.75%] top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4 text-white/70">
        <span className="block h-12 w-px bg-white/30" />
        <span className="grid h-3 w-3 place-items-center rounded-full border border-white/30">
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        </span>
        <span className="text-xs tracking-[0.45em]">06</span>
      </div>

      {/* Language selector */}
      <button className="absolute bottom-6 left-6 z-10 flex items-center gap-3 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-medium text-black shadow-lg shadow-black/30 transition hover:bg-white">
        <img src="https://flagcdn.com/w20/gb.png" alt="English" className="h-4 w-5 rounded-sm object-cover" />
        English
        <FaChevronRight className="text-[10px]" />
      </button>

      {/* WhatsApp */}
      <a
        href="https://wa.me/0000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="absolute bottom-6 right-6 z-10 grid h-12 w-12 place-items-center rounded-full bg-black/80 text-white shadow-xl ring-1 ring-white/15 transition hover:scale-105"
      >
        <FaWhatsapp className="text-[18px]" />
        <span className="absolute bottom-[6px] right-[6px] h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-black" />
      </a>
    </section>
  );
}
