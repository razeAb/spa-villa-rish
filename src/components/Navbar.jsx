import { Menu, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-5">
          {/* Left: logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pointer-events-auto flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full border border-white/40 grid place-items-center">
              <div className="h-2 w-2 rounded-full bg-white/80" />
            </div>
            <span className="tracking-widest text-sm uppercase text-white/80">shevet</span>
          </motion.div>

          {/* Center: Rituals */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pointer-events-auto hidden md:block"
          >
            <button className="group inline-flex items-center gap-1 text-sm tracking-widest uppercase text-white/80 hover:text-white">
              Rituals <ChevronDown size={16} className="transition group-hover:translate-y-0.5" />
            </button>
          </motion.nav>

          {/* Right: Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pointer-events-auto"
          >
            <button className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-white/80 hover:text-white">
              Menu <Menu size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
