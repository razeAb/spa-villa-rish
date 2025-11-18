const pickLocaleValue = (valueMap = {}, locale) => {
  return valueMap[locale] ?? valueMap.en ?? valueMap.he ?? "";
};

const RAW_SERVICES = [
  {
    id: "massage-50",
    category: "massage",
    durationMin: 180,
    priceAmount: 450,
    priceCurrency: "ILS",
    translations: {
      en: {
        title: "50-Minute Massage",
        description: "A pampering 50-minute massage in a designed, intimate private room.",
        typeLabel: "Massage 50 min",
        priceDisplay: "By choice",
      },
      he: {
        title: "עיסוי 50 דקות",
        description: "עיסוי מפנק של 50 דקות בחדר פרטי מעוצב ואינטימי.",
        typeLabel: "עיסוי",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    id: "hammam-30",
    category: "massage",
    durationMin: 180,
    priceAmount: 320,
    priceCurrency: "ILS",
    translations: {
      en: {
        title: "Hammam Massage · 30 min",
        description: "Traditional massage on the hot marble slab inside the Turkish hammam — a unique authentic experience.",
        typeLabel: "Hammam 30 min",
        priceDisplay: "By choice",
      },
      he: {
        title: "עיסוי חמאם · 30 דק׳",
        description: "עיסוי מסורתי על השיש החם בתוך החמאם הטורקי — חוויה אותנטית ומיוחדת.",
        typeLabel: "חמאם",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    id: "medical-massage",
    category: "massage",
    durationMin: 180,
    priceAmount: 480,
    priceCurrency: "ILS",
    translations: {
      en: {
        title: "Medical Massage",
        description:
          "Professional therapeutic massage tailored for pain and tension relief, performed by a certified therapist.",
        typeLabel: "Medical",
        priceDisplay: "By choice",
      },
      he: {
        title: "עיסוי רפואי",
        description: "עיסוי טיפולי מקצועי להקלה על כאבים ולשחרור מתחים, מבוצע על ידי מטפל מוסמך.",
        typeLabel: "רפואי",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    id: "swedish-thai-50",
    category: "massage",
    durationMin: 180,
    priceAmount: 460,
    priceCurrency: "ILS",
    translations: {
      en: {
        title: "Swedish / Thai · 50 min",
        description: "Choose between a classic Swedish massage or a traditional Thai massage, 50-minute session.",
        typeLabel: "Swedish / Thai",
        priceDisplay: "By choice",
      },
      he: {
        title: "שוודי / תאילנדי · 50 דק׳",
        description: "בחרו בין עיסוי שוודי קלאסי לבין עיסוי תאילנדי מסורתי, במפגש של 50 דקות.",
        typeLabel: "שוודי / תאילנדי",
        priceDisplay: "לפי בחירה",
      },
    },
  },
  {
    id: "vip-couple",
    category: "group",
    durationMin: 180,
    priceAmount: 1200,
    priceCurrency: "ILS",
    translations: {
      en: {
        title: "VIP Couple Package",
        description:
          "Entry for two up to 3 hours • 50-minute massage for each person • Full access to hammam, sauna & jacuzzi • Coffee & cake corner.",
        typeLabel: "VIP",
        priceDisplay: "₪1,200 per couple",
      },
      he: {
        title: "חבילת VIP זוגית",
        description:
          "כניסה לזוג עד 3 שעות • עיסוי של 50 דקות לכל אחד • גישה מלאה לחמאם, סאונה וג'קוזי • פינת קפה ועוגה.",
        typeLabel: "VIP",
        priceDisplay: "₪1,200 לזוג",
      },
    },
  },
  {
    id: "group-day",
    category: "group",
    durationMin: 180,
    priceAmount: 300,
    priceCurrency: "ILS",
    translations: {
      en: {
        title: "Group Day",
        description:
          "Entry for a group of up to 6 people for 3 hours • Free access to the entire complex plus coffee & cake corner.",
        typeLabel: "Group",
        priceDisplay: "₪300 per person",
      },
      he: {
        title: "יום קבוצתי",
        description:
          "כניסה לקבוצה של עד 6 אנשים ל־3 שעות • גישה חופשית לכל המתחם: חמאם, סאונה, ג'קוזי • אזורי לאונג' • פינת קפה ועוגה.",
        typeLabel: "קבוצה",
        priceDisplay: "₪300 לאדם",
      },
    },
  },
];

const toLocalizedService = (item, locale) => {
  const translation = item.translations?.[locale] || item.translations?.en || {};
  return {
    _id: `demo-${item.id}`,
    slug: item.id,
    category: item.category,
    durationMin: item.durationMin,
    title: translation.title || "",
    typeLabel: translation.typeLabel || "",
    description: translation.description || "",
    priceDisplay: translation.priceDisplay || "",
    priceAmount: item.priceAmount,
    priceCurrency: item.priceCurrency,
    translations: item.translations,
    isFallback: true,
  };
};

export const getTreatmentsForLocale = (locale = "en") =>
  RAW_SERVICES.filter((item) => item.category === "massage").map((item) => toLocalizedService(item, locale));

export const getGroupPackagesForLocale = (locale = "en") =>
  RAW_SERVICES.filter((item) => item.category === "group").map((item) => toLocalizedService(item, locale));

export const getAllServicesForLocale = (locale = "en") =>
  RAW_SERVICES.map((item) => toLocalizedService(item, locale));
