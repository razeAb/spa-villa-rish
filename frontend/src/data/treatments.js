const pickLocaleValue = (valueMap, locale) => {
  if (!valueMap) return "";
  return valueMap[locale] ?? valueMap.en ?? "";
};

const RAW_TREATMENTS = [
  {
    id: "massage-50",
    durationMin: 180,
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
    durationMin: 180,
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
    durationMin: 180,
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
    durationMin: 180,
    title: { en: "Swedish / Thai · 50 min", he: "שוודי / תאילנדי · 50 דק׳" },
    type: { en: "Swedish / Thai", he: "שוודי / תאילנדי" },
    price: { en: "By choice", he: "לפי בחירה" },
    desc: {
      en: "Choose between a classic Swedish massage or a traditional Thai massage, 50-minute session.",
      he: "בחרו בין עיסוי שוודי קלאסי לבין עיסוי תאילנדי מסורתי, במפגש של 50 דקות.",
    },
  },
];

const RAW_GROUP_PACKAGES = [
  {
    id: "vip-couple",
    durationMin: 180,
    title: { en: "VIP Couple Package", he: "חבילת VIP זוגית" },
    type: { en: "VIP", he: "VIP" },
    price: { en: "₪1,200 per couple", he: "₪1,200 לזוג" },
    desc: {
      en: "Entry for two up to 3 hours • 50-minute massage for each person • Full access to hammam, sauna & jacuzzi • Coffee & cake corner.",
      he: "כניסה לזוג עד 3 שעות • עיסוי של 50 דקות לכל אחד • גישה מלאה לחמאם, סאונה וג'קוזי • פינת קפה ועוגה.",
    },
  },
  {
    id: "group-day",
    durationMin: 180,
    title: { en: "Group Day", he: "יום קבוצתי" },
    type: { en: "Group", he: "קבוצה" },
    price: { en: "₪300 per person", he: "₪300 לאדם" },
    desc: {
      en: "Entry for a group of up to 6 people for 3 hours • Free access to the entire complex: hammam, sauna, jacuzzi • Lounge areas • Coffee & cake corner • Perfect for team days.",
      he: "כניסה לקבוצה של עד 6 אנשים ל־3 שעות • גישה חופשית לכל המתחם: חמאם, סאונה, ג'קוזי • אזורי לאונג' • פינת קפה ועוגה • מושלם לימי גיבוש.",
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

export const getGroupPackagesForLocale = (locale = "en") =>
  RAW_GROUP_PACKAGES.map((item) => ({
    id: item.id,
    durationMin: item.durationMin,
    title: pickLocaleValue(item.title, locale),
    type: pickLocaleValue(item.type, locale),
    price: pickLocaleValue(item.price, locale),
    desc: pickLocaleValue(item.desc, locale),
  }));
