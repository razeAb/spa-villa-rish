// src/pages/VillaStayPage.jsx
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function VillaStayPage() {
  const WHATSAPP_LINK =
    "https://wa.me/972506290202?text=Hi%20Spa%20Rish%2C%20I%27m%20interested%20in%20the%20Villa%20overnight%20stay%20(₪1%2C300)%20for%20two.";

  return (
    <section
      id="villa-stay"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/photos/villa-stay.jpg')" }} // replace with your image
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-lines opacity-20" />

      {/* Edge lines */}
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/12 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/12 sm:right-[6%]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1100px] items-center px-6 py-24 md:px-10">
        <div className="max-w-[720px] text-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
          <p className="mb-6 text-sm uppercase tracking-[0.35em] text-white/80">
            Packages <span className="text-white/50">+</span>
          </p>

          <h1 className="font-serif text-[42px] leading-[1.1] sm:text-[56px]">Villa Overnight Stay</h1>

          <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-white/85">
            <li>Overnight stay for two at the luxurious Villa Rish (subject to availability)</li>
            <li>Villa rated 10 on Booking</li>
            <li>Private heated pool</li>
            <li>BBQ corner</li>
            <li>Fully equipped kitchen</li>
            <li>Private garden</li>
            <li>Designer rooms</li>
            <li>Perfect continuation after your spa day</li>
          </ul>

          <p className="mt-8 text-lg italic">₪1,300 — per night (for two)</p>

          {/* WhatsApp CTA (no standard booking button) */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm tracking-widest ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15"
          >
            <FaWhatsapp className="text-base" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
