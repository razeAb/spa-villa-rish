// src/pages/ServicesPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";

// יעד ההזמנה – שנה לוואטסאפ/עמוד הזמנה שלך
const BOOKING_LINK = "#booking";
// לדוגמה לוואטסאפ:
// const BOOKING_LINK = "https://wa.me/972509603191?text=Hi,%20I'd%20like%20to%20book%20a%20treatment.";

const massages = [
  {
    title: "50-Minute Massage",
    type: "Massage 50 min",
    price: "By choice",
    desc: "A pampering 50-minute massage in a designed, intimate private room.",
  },
  {
    title: "Hammam Massage · 30 min",
    type: "Hammam 30 min",
    price: "By choice",
    desc: "Traditional massage on the hot marble slab inside the Turkish hammam — a unique authentic experience.",
  },
  {
    title: "Medical Massage",
    type: "Medical",
    price: "By choice",
    desc: "Professional therapeutic massage tailored for pain and tension relief, performed by a certified therapist.",
  },
  {
    title: "Swedish / Thai · 50 min",
    type: "Swedish / Thai",
    price: "By choice",
    desc: "Choose between a classic Swedish massage or a traditional Thai massage, 50-minute session.",
  },
];

const groupPackages = [
  {
    title: "Group Day",
    type: "Group",
    price: "₪300 per person",
    desc: "Entry for a group of up to 6 people for 3 hours • Free access to the entire complex: Turkish hammam, sauna, jacuzzi • Stylish lounge areas • Coffee & cake corner • Perfect for team days and events.",
  },
];

function Card({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ring-1 ring-white/10 hover:bg-white/10"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-serif text-2xl leading-tight">{item.title}</h3>
        <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-wide text-white/80">
          {item.type}
        </span>
      </div>
      <p className="text-white/85">{item.desc}</p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm text-white/80">Price:</span>
        <span className="text-lg italic">{item.price}</span>
      </div>

      <a
        href={BOOKING_LINK}
        className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm tracking-widest ring-1 ring-white/10 transition hover:bg-white/15"
      >
        Book Now <FaChevronRight className="text-xs" />
      </a>
    </motion.div>
  );
}

export default function ServicesPage() {
  return (
    <section
      id="all-services"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-black via-black/95 to-black text-white"
    >
      {/* Edge lines like the hero */}
      <div className="pointer-events-none absolute inset-y-8 left-[3.5%] w-px bg-white/10 sm:left-[6%]" />
      <div className="pointer-events-none absolute inset-y-8 right-[3.5%] w-px bg-white/10 sm:right-[6%]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">Services & Packages</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">All Options</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Choose your treatment or package and book your time. Each option includes a quick booking link.
          </p>
        </div>

        {/* Massage types */}
        <div className="mb-10">
          <h3 className="mb-4 text-sm uppercase tracking-[0.35em] text-white/80">Massage Types</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {massages.map((m, i) => (
              <Card key={i} item={m} />
            ))}
          </div>
        </div>

        {/* Group packages */}
        <div className="mt-14">
          <h3 className="mb-4 text-sm uppercase tracking-[0.35em] text-white/80">Group Packages</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groupPackages.map((g, i) => (
              <Card key={i} item={g} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
