export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto grid w-full max-w-[1024px] grid-cols-[1fr_auto_1fr] items-center px-6 pt-6 text-white">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-3 justify-self-start" aria-label="Home">
          <img
            src="/photos/logo.jpeg" // public/photos/logo.jpeg
            alt="Spa Rish"
            className="h-3 w-3 object-contain"
          />
        </a>

        {/* Center: Packages */}
        <a
          href="#packages"
          className="justify-self-center text-sm font-light uppercase tracking-[0.45em] text-white/80 transition hover:text-white"
        >
          Packages
        </a>

        {/* Right: Menu */}
        <div className="flex items-center gap-3 justify-self-end">
          <a href="#menu" className="text-sm font-light uppercase tracking-[0.4em] text-white/80 transition hover:text-white">
            Menu
          </a>
          <div className="hidden flex-col gap-[3px] sm:flex">
            <span className="block h-[2px] w-4 bg-emerald-300/80" />
            <span className="ml-auto block h-[2px] w-3 bg-emerald-300/60" />
          </div>
        </div>
      </div>
    </header>
  );
}
