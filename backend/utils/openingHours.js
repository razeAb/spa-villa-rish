const DEFAULT_OPENING_HOURS = [
  { dow: 0, open: "09:00", close: "19:00" },
  { dow: 1, open: "09:00", close: "19:00" },
  { dow: 2, open: "09:00", close: "19:00" },
  { dow: 3, open: "09:00", close: "19:00" },
  { dow: 4, open: "09:00", close: "16:00" },
  { dow: 5, open: "10:00", close: "15:00" },
  { dow: 6, open: "10:00", close: "15:00" },
];

function normalizeOpeningHours(hours = []) {
  return hours
    .map((item) => {
      const dow =
        typeof item.dow === "string"
          ? Number.parseInt(item.dow, 10)
          : typeof item.dow === "number"
          ? item.dow
          : null;
      if (!Number.isInteger(dow)) return null;
      if (!item.open || !item.close) return null;
      return { dow, open: item.open, close: item.close };
    })
    .filter(Boolean);
}

module.exports = { DEFAULT_OPENING_HOURS, normalizeOpeningHours };
