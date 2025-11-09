const pickLocaleValue = (valueMap, locale) => {
  if (!valueMap) return "";
  return valueMap[locale] ?? valueMap.en ?? "";
};

const RAW_TREATMENTS = [
  {
    id: "massage-50",
    durationMin: 50,
    title: { en: "50-Minute Massage", he: "עיסוי 50 דקות" },
    type: { en: "Massage 50 min", he: "עיסוי" },
    price: { en: "By choice", he: "לפי בחירה" },
    desc: {
      en: "A pampering 50-minute massage in a designed, intimate private room.",
      he: "עיסוי מפנק של 50 דקות בחדר פרטי מעוצב ואינטימי.",
    },
  },
  {
    id: "hammam-30",
    durationMin: 30,
    title: { en: "Hammam Massage · 30 min", he: "עיסוי חמאם · 30 דק׳" },
    type: { en: "Hammam 30 min", he: "חמאם" },
    price: { en: "By choice", he: "לפי בחירה" },
    desc: {
      en: "Traditional massage on the hot marble slab inside the Turkish hammam — a unique authentic experience.",
      he: "עיסוי מסורתי על השיש החם בתוך החמאם הטורקי — חוויה אותנטית ומיוחדת.",
    },
  },
  {
    id: "medical-massage",
    durationMin: 50,
    title: { en: "Medical Massage", he: "עיסוי רפואי" },
    type: { en: "Medical", he: "רפואי" },
    price: { en: "By choice", he: "לפי בחירה" },
    desc: {
      en: "Professional therapeutic massage tailored for pain and tension relief, performed by a certified therapist.",
      he: "עיסוי טיפולי מקצועי להקלה על כאבים ולשחרור מתחים, מבוצע על ידי מטפל מוסמך.",
    },
  },
  {
    id: "swedish-thai-50",
    durationMin: 50,
    title: { en: "Swedish / Thai · 50 min", he: "שוודי / תאילנדי · 50 דק׳" },
    type: { en: "Swedish / Thai", he: "שוודי / תאילנדי" },
    price: { en: "By choice", he: "לפי בחירה" },
    desc: {
      en: "Choose between a classic Swedish massage or a traditional Thai massage, 50-minute session.",
      he: "בחרו בין עיסוי שוודי קלאסי לבין עיסוי תאילנדי מסורתי, במפגש של 50 דקות.",
    },
  },
];

export const getTreatmentsForLocale = (locale = "en") =>
  RAW_TREATMENTS.map((item) => ({
    id: item.id,
    durationMin: item.durationMin,
    title: pickLocaleValue(item.title, locale),
    type: pickLocaleValue(item.type, locale),
    price: pickLocaleValue(item.price, locale),
    desc: pickLocaleValue(item.desc, locale),
  }));
