import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
const HERO_IMAGE = "../photos/spa-home.jpg";
export default function HeroLanding() {
  return (
    <section className="relative flex min-h-[720px] w-full justify-center overflow-hidden bg-black text-white md:min-h-[856px]">
      {/* Background image */}
      <img src={HERO_IMAGE} alt="Spa" className="absolute inset-0 h-full w-full object-cover opacity-90" />
      {/* Overlays */}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
      {/* Vertical edge lines */}
      <div className="absolute inset-y-0 left-4 hidden w-px bg-white/15 sm:block" />
      <div className="absolute inset-y-0 right-4 hidden w-px bg-white/15 sm:block" />
      {/* Center Title */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto w-full max-w-[768px] text-center uppercase"
        >
          <h1 className="text-4xl font-light tracking-[0.45em] md:text-6xl">S H E V E T</h1>
          <h2 className="mt-4 text-2xl font-light tracking-[0.42em] md:text-4xl">{`H A M M A M \u00a0 & \u00a0 S P A`}</h2>
        </motion.div>
      </div>
      {/* Left vertical language */}
      <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 select-none">
        <div className="-rotate-90 flex items-center gap-3 text-[10px] tracking-[0.4em] text-white/60">
          <span className="inline-block h-px w-4 bg-white/40" />
          English / Hebrew
          <span className="inline-block h-px w-4 bg-white/40" />
        </div>
      </div>
      {/* Right vertical page index */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none">
        <div className="rotate-90 text-[10px] tracking-[0.4em] text-white/60">06</div>
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <div className="h-8 w-px bg-white/60" />
        <div className="text-[11px] tracking-[0.5em] text-white/70">{`S C R O L L \u00a0 E X P L O R E`}</div>
      </div>
      {/* Language chip */}
      <div className="absolute bottom-6 left-4 z-10">
        <button className="flex items-center gap-2 rounded-md border border-white/25 bg-black/45 px-2.5 py-1.5 text-xs text-white/90 backdrop-blur">
          <span className="text-base leading-none">🇬🇧</span>
          <span>English</span>
          <span className="ml-1 inline-block -rotate-90 text-white/70">›</span>
        </button>
      </div>
      {/* WhatsApp button */}
      <a
        href="https://wa.me/0000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="group absolute bottom-6 right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-black/80 shadow-xl ring-1 ring-white/20 transition duration-200 hover:scale-105"
      >
        <FaWhatsapp className="text-lg text-white" />
        <span className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-black/80" />
      </a>
    </section>
  );
}
