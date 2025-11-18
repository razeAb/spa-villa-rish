import servicesCatalog from "./servicesCatalog.json";

const pickLocaleValue = (valueMap = {}, locale) => {
  return valueMap[locale] ?? valueMap.en ?? valueMap.he ?? "";
};

const RAW_SERVICES = servicesCatalog;

const toLocalizedService = (item, locale) => {
  const translation = item.translations?.[locale] || item.translations?.en || {};
  return {
    _id: `demo-${item.id}`,
    slug: item.id,
    serviceId: item.id,
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

export const getAllServicesForLocale = (locale = "en") => RAW_SERVICES.map((item) => toLocalizedService(item, locale));
