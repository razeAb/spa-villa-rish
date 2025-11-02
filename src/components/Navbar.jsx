export default function Navbar() {
  return (
    <header className="absolute top-6 left-0 right-0 z-30">
      <div className="mx-auto flex max-w-[768px] items-center justify-between px-6 text-[11px] font-light tracking-[0.25em] text-white/90">
        {/* Left Logo */}
        <div className="flex items-center gap-2">
          <img src="https://placehold.co/40x40" alt="Shevet logo" className="h-6 w-6 object-contain" />
          <div className="leading-tight text-white/90">
            <div className="text-xs tracking-[0.15em]">shevet</div>
            <div className="text-[9px] tracking-[0.2em] text-white/70">hammam & spa</div>
          </div>
        </div>

        {/* Center Nav */}
        <nav>
          <a href="#rituals" className="font-light italic text-white/90 tracking-[0.2em] text-sm transition hover:text-white">
            Rituals <span className="text-white/50 ml-1">+</span>
          </a>
        </nav>

        {/* Right Menu Icon */}
        <div className="flex items-center gap-2">
          <a href="#menu" className="font-light italic text-white/90 tracking-[0.2em] text-sm transition hover:text-white">
            Menu
          </a>
          <div className="flex flex-col justify-center gap-[2px]">
            <span className="w-4 h-[2px] bg-[#d8bca6] block" />
            <span className="w-3 h-[2px] bg-[#d8bca6] block" />
          </div>
        </div>
      </div>
    </header>
  );
}
