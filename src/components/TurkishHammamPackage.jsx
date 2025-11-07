import React from "react";

export default function TurkishHammamPackage() {
  return (
    <section
      id="hammam"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/photos/turkishHamam.jpg')" }} // replace with your image
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-lines opacity-20" />

      {/* Edge lines */}
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/15 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/15 sm:right-[6%]" />

      {/* Right vertical index */}
      <div className="absolute right-[2.75%] top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-4 text-white/75 md:flex">
        <span className="block h-12 w-px bg-white/30" />
        <span className="grid h-3 w-3 place-items-center rounded-full border border-white/30">
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        </span>
        <span className="text-xs tracking-[0.45em]">03</span>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1100px] items-center px-6 py-24 md:px-10">
        <div className="max-w-[680px] text-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
          <p className="mb-6 text-sm tracking-[0.35em] text-white/85 uppercase">
            Packages <span className="text-white/60">+</span>
          </p>

          <h2 className="font-serif text-[42px] leading-[1.1] sm:text-[56px]">Turkish Hammam</h2>

          <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-white/85">
            <li>Entry for two, up to 3 hours</li>
            <li>30-minute massage for each person on the marble slab in the Turkish hammam</li>
            <li>Free access to the sauna & jacuzzi</li>
            <li>Coffee & cake corner</li>
            <li>Authentic experience of a traditional hammam</li>
          </ul>

          <p className="mt-8 text-lg italic">₪1,500 — Turkish Hammam</p>

          <a
            href="#booking"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm tracking-widest ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15"
          >
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
}
