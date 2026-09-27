// Where the spa is, and deep links that open turn-by-turn navigation there.
// Keep in sync with SPA_LOCATION in backend/utils/mailer.js.
const DESTINATION = "ספא ריש Spa rish, אלחדיתה, Yarka, 2496700";

export const SPA_LOCATION = {
  address: { he: "אלחדיתה, ירכא, 2496700", en: "Al-Hadita, Yarka, 2496700" },
  wazeUrl: `https://waze.com/ul?q=${encodeURIComponent(DESTINATION)}&navigate=yes`,
  googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESTINATION)}`,
};
