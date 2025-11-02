import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
export default function HeroLanding() {
  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Background image */}
      <img src="../photos/spa-home.jpg" alt="Spa" className="absolute inset-0 h-full w-full object-cover opacity-90" />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      <div className="absolute inset-0 bg-lines" />

      {/* Center title */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
          <h1 className="text-4xl md:text-6xl font-light tracking-[0.4em] text-white">S H E V E T</h1>
          <h2 className="mt-3 text-2xl md:text-4xl font-light tracking-[0.35em] text-white">H A M M A M &nbsp; &amp; &nbsp; S P A</h2>
        </motion.div>
      </div>

      {/* Left vertical language */}
      <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 select-none">
        <div className="rotate-[-90deg] text-xs tracking-[0.4em] text-white/60">English / עברית</div>
      </div>

      {/* Right vertical page index */}
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none">
        <div className="rotate-90 text-xs tracking-[0.4em] text-white/60">01</div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-3">
        <div className="h-8 w-px bg-white/60"></div>
        <div className="text-[11px] tracking-[0.5em] text-white/70">SCROLL EXPLORE</div>
      </div>

      {/* Language select bottom-left */}
      <div className="absolute bottom-6 left-4 z-10">
        <select className="rounded-md border border-white/30 bg-black/40 px-2 py-1 text-xs text-white/90 backdrop-blur" defaultValue="en">
          <option value="en">English</option>
          <option value="he">עברית</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      {/* WhatsApp bubble */}
      <a
        href="https://wa.me/0000000000"
        className="group absolute bottom-6 right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-green-500 text-black shadow-lg hover:scale-105 transition"
        aria-label="WhatsApp"
      >
        + <SiWhatsapp size={24} />{" "}
      </a>
    </section>
  );
}
