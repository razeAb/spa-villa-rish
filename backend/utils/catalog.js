const path = require("path");
const fs = require("fs");
const Service = require("../models/Service");

const catalogPath = path.join(__dirname, "..", "..", "frontend", "src", "data", "servicesCatalog.json");

function loadCatalog() {
  const raw = fs.readFileSync(catalogPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("servicesCatalog.json must export an array");
  }
  return parsed;
}

async function ensureCatalogServices() {
  const catalog = loadCatalog();
  for (const entry of catalog) {
    const slug = entry.slug || entry.id;
    if (!slug) continue;
    const payload = {
      slug,
      title: entry.translations?.en?.title || entry.title || slug,
      description: entry.translations?.en?.description || "",
      typeLabel: entry.translations?.en?.typeLabel || "",
      translations: entry.translations || {},
      category: entry.category || "massage",
      durationMin: entry.durationMin,
      priceAmount: entry.priceAmount,
      priceCurrency: entry.priceCurrency || "ILS",
      priceDisplay: entry.translations?.en?.priceDisplay || entry.priceDisplay || "",
      isActive: entry.isActive !== false,
    };

    await Service.findOneAndUpdate(
      { slug },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

module.exports = { ensureCatalogServices, loadCatalog };
