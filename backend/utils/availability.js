const { DateTime, Interval } = require("luxon");

// יוצר סלוטים לתאריך לפי שעות פתיחה, משך טיפול ובאפר, בלי התנגשויות
function generateSlotsForDate({
  dateISO,
  tz = "Asia/Jerusalem",
  serviceDurationMin,
  bufferMin,
  slotStepMin,
  openingSpec,
  existingBookingsUtc,
}) {
  const day = DateTime.fromISO(dateISO, { zone: tz }).startOf("day");
  const open = day.set({
    hour: parseInt(openingSpec.open.split(":")[0], 10),
    minute: parseInt(openingSpec.open.split(":")[1], 10),
  });
  const close = day.set({
    hour: parseInt(openingSpec.close.split(":")[0], 10),
    minute: parseInt(openingSpec.close.split(":")[1], 10),
  });
  const serviceWithBuffer = serviceDurationMin + (bufferMin || 0);

  const existingIntervals = existingBookingsUtc.map((b) =>
    Interval.fromDateTimes(DateTime.fromJSDate(b.startUtc).toUTC(), DateTime.fromJSDate(b.endUtc).toUTC())
  );

  let slots = [];
  for (let t = open; t < close; t = t.plus({ minutes: slotStepMin })) {
    const start = t;
    const end = t.plus({ minutes: serviceWithBuffer });
    if (end > close) break;

    const startUtc = start.toUTC();
    const endUtc = end.toUTC();
    const candidate = Interval.fromDateTimes(startUtc, endUtc);

    const overlaps = existingIntervals.some((iv) => iv.overlaps(candidate));
    if (!overlaps) {
      slots.push({
        label: start.toFormat("HH:mm"),
        startUtc: startUtc.toISO(),
        endUtc: endUtc.toISO(),
      });
    }
  }
  return slots;
}

module.exports = { generateSlotsForDate };
