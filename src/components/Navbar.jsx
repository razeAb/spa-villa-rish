import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-5">
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-full border border-white/40">
              <div className="h-2 w-2 rounded-full bg-white/80" />
            </div>
            <div className="leading-tight">
              <div className="text-white/90 uppercase tracking-[0.35em] text-[11px] font-ui">shevet</div>
              <div className="text-white/60 text-[10px] tracking-[0.2em] font-ui">h a m m a m &nbsp;&amp;&nbsp; s p a</div>
            </div>
          </div>

          <nav className="pointer-events-auto hidden md:block">
            <button className="text-white/80 hover:text-white uppercase tracking-[0.3em] italic text-sm font-ui">Rituals&nbsp;+</button>
          </nav>

          <div className="pointer-events-auto flex items-center gap-3 text-white/80 hover:text-white">
            <button className="uppercase tracking-[0.3em] text-sm font-ui">Menu</button>
            <span className="h-px w-6 bg-white/50 inline-block" />
            <Menu size={18} className="opacity-70" />
          </div>
        </div>
      </div>
    </header>
  );
}
