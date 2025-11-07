import React from "react";

export default function VipPackage() {
  return (
    <section
      id="next-section"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/photos/vipPackage.jpeg')" }} // ← ככה נכון
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
        <span className="text-xs tracking-[0.45em]">02</span>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1100px] items-center px-6 py-24 md:px-10">
        <div className="max-w-[680px] text-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
          <p className="mb-6 text-sm tracking-[0.35em] text-white/85 uppercase">
            Rituals <span className="text-white/60">+</span>
          </p>

          <h2 className="font-serif text-[42px] leading-[1.1] sm:text-[56px]">
            The Ultimate
            <br className="hidden sm:block" />
            <span className="italic">Roman Ritual</span>
          </h2>

          <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-white/85">
            Pamper yourself as Roman nobility did in ancient times, to a 30 minute head-to-toe cleansing ceremony in the hot hammam. While
            your body is resting on the marble floor, our therapists will wash and refresh your body with a natural sponge gourd and olive
            oil soap, and release toxins with a hemp whip. After a short rest you will enjoy an hour-long relaxing massage accompanied by
            oils enriched with nutritious extracts.
          </p>

          <p className="mt-6 text-white/90 italic">90 Minutes &nbsp;–&nbsp; 840 NIS/Person, 1480 NIS/Couple</p>

          <a
            href="#booking" // שנה לעוגן או לקישור הזמנה בפועל
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm tracking-widest ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15"
          >
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
}
