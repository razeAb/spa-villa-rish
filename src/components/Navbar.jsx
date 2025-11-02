export default function Navbar() {
  return (
    <header className="absolute left-0 right-0 top-0 z-30">
      <div className="mx-auto flex w-full max-w-[768px] items-start justify-between px-6 pt-6 text-white">
        <div className="flex items-center gap-3 text-white/90">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-white/5 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-white/80" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-light tracking-[0.35em] uppercase">shevet</div>
            <div className="text-[10px] font-light tracking-[0.28em] text-white/70">h a m m a m &nbsp;+&nbsp; s p a</div>
          </div>
        </div>

        <nav className="pt-1 text-sm font-light uppercase tracking-[0.45em] text-white/80">
          <a href="#rituals" className="transition hover:text-white">
            Rituals +
          </a>
        </nav>

        <div className="flex items-center gap-3 pt-1 text-sm font-light uppercase tracking-[0.4em] text-white/80">
          <a href="#menu" className="transition hover:text-white">
            Menu
          </a>
          <div className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-4 bg-emerald-300/80" />
            <span className="ml-auto block h-[2px] w-3 bg-emerald-300/60" />
          </div>
        </div>
      </div>
    </header>
  );
}
