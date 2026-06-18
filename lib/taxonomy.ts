// Shared taxonomies for SBG. Bilingual labels (en/ar) live next to the enum keys so
// both the UI and (later) the Prisma enums stay in sync from one source of truth.

export type Locale = "en" | "ar";

export type Industry =
  | "FOOD_BEVERAGE"
  | "TEXTILES_APPAREL"
  | "CHEMICALS"
  | "COSMETICS_PERSONAL_CARE"
  | "CRAFTS_ARTISANAL"
  | "MACHINERY"
  | "ELECTRONICS"
  | "AGRICULTURE"
  | "PHARMACEUTICALS";

export const INDUSTRIES: { key: Industry; en: string; ar: string; icon: string }[] = [
  { key: "FOOD_BEVERAGE", en: "Food & Beverages", ar: "الأغذية والمشروبات", icon: "🫒" },
  { key: "TEXTILES_APPAREL", en: "Textiles & Apparel", ar: "المنسوجات والألبسة", icon: "🧵" },
  { key: "CHEMICALS", en: "Chemicals", ar: "الكيماويات", icon: "⚗️" },
  { key: "COSMETICS_PERSONAL_CARE", en: "Cosmetics & Personal Care", ar: "مستحضرات التجميل والعناية", icon: "🧴" },
  { key: "CRAFTS_ARTISANAL", en: "Crafts & Artisanal", ar: "الحرف اليدوية", icon: "🪡" },
  { key: "MACHINERY", en: "Machinery", ar: "الآلات والمعدات", icon: "⚙️" },
  { key: "ELECTRONICS", en: "Electronics", ar: "الإلكترونيات", icon: "💡" },
  { key: "AGRICULTURE", en: "Agriculture", ar: "الزراعة", icon: "🌾" },
  { key: "PHARMACEUTICALS", en: "Pharmaceuticals", ar: "الأدوية", icon: "💊" },
];

export type Region =
  | "MIDDLE_EAST"
  | "EUROPE"
  | "ASIA"
  | "NORTH_AMERICA"
  | "AFRICA"
  | "SOUTH_AMERICA"
  | "OCEANIA";

export const REGIONS: { key: Region; en: string; ar: string; icon: string }[] = [
  { key: "MIDDLE_EAST", en: "Middle East", ar: "الشرق الأوسط", icon: "🕌" },
  { key: "EUROPE", en: "Europe", ar: "أوروبا", icon: "🏛️" },
  { key: "ASIA", en: "Asia", ar: "آسيا", icon: "🏯" },
  { key: "NORTH_AMERICA", en: "North America", ar: "أمريكا الشمالية", icon: "🗽" },
  { key: "AFRICA", en: "Africa", ar: "أفريقيا", icon: "🌍" },
  { key: "SOUTH_AMERICA", en: "South America", ar: "أمريكا الجنوبية", icon: "🌿" },
  { key: "OCEANIA", en: "Oceania", ar: "أوقيانوسيا", icon: "🦘" },
];

export type TradeBloc =
  | "EFTA"
  | "ASEAN"
  | "EU"
  | "USMCA"
  | "GCC"
  | "AFCFTA"
  | "AL"
  | "MERCOSUR";

export const TRADE_BLOCS: { key: TradeBloc; en: string; ar: string }[] = [
  { key: "EFTA", en: "EFTA", ar: "الرابطة الأوروبية للتجارة الحرة" },
  { key: "ASEAN", en: "ASEAN", ar: "آسيان" },
  { key: "EU", en: "EU", ar: "الاتحاد الأوروبي" },
  { key: "USMCA", en: "USMCA", ar: "اتفاقية USMCA" },
  { key: "GCC", en: "GCC", ar: "مجلس التعاون الخليجي" },
  { key: "AFCFTA", en: "AfCFTA", ar: "منطقة التجارة الحرة القارية الأفريقية" },
  { key: "AL", en: "AL", ar: "جامعة الدول العربية" },
  { key: "MERCOSUR", en: "MERCOSUR", ar: "ميركوسور" },
];

export type ExportStage =
  | "NEW_TO_EXPORT"
  | "EXPLORING"
  | "EXPORT_READY"
  | "OCCASIONAL_EXPORTER"
  | "ESTABLISHED_EXPORTER";

export const EXPORT_STAGES: { key: ExportStage; en: string; ar: string; hint: string }[] = [
  { key: "NEW_TO_EXPORT", en: "New to exporting", ar: "جديد في التصدير", hint: "Selling domestically, never exported" },
  { key: "EXPLORING", en: "Exploring export", ar: "أستكشف التصدير", hint: "Researching markets and requirements" },
  { key: "EXPORT_READY", en: "Export ready", ar: "جاهز للتصدير", hint: "Documents and capacity in place" },
  { key: "OCCASIONAL_EXPORTER", en: "Occasional exporter", ar: "مصدّر أحياناً", hint: "A few export deals so far" },
  { key: "ESTABLISHED_EXPORTER", en: "Established exporter", ar: "مصدّر راسخ", hint: "Regular exports to several markets" },
];

// 14 Syrian governorates — used for the exporter location field.
export const GOVERNORATES: { key: string; en: string; ar: string }[] = [
  { key: "DAMASCUS", en: "Damascus", ar: "دمشق" },
  { key: "RIF_DIMASHQ", en: "Rif Dimashq", ar: "ريف دمشق" },
  { key: "ALEPPO", en: "Aleppo", ar: "حلب" },
  { key: "HOMS", en: "Homs", ar: "حمص" },
  { key: "HAMA", en: "Hama", ar: "حماة" },
  { key: "LATAKIA", en: "Latakia", ar: "اللاذقية" },
  { key: "TARTUS", en: "Tartus", ar: "طرطوس" },
  { key: "IDLIB", en: "Idlib", ar: "إدلب" },
  { key: "DARAA", en: "Daraa", ar: "درعا" },
  { key: "AS_SUWAYDA", en: "As-Suwayda", ar: "السويداء" },
  { key: "QUNEITRA", en: "Quneitra", ar: "القنيطرة" },
  { key: "DEIR_EZ_ZOR", en: "Deir ez-Zor", ar: "دير الزور" },
  { key: "AL_HASAKAH", en: "Al-Hasakah", ar: "الحسكة" },
  { key: "RAQQA", en: "Raqqa", ar: "الرقة" },
];

export const CERTIFICATIONS = [
  "ISO 22000",
  "HACCP",
  "Halal",
  "Organic",
  "ISO 9001",
  "CE",
  "GlobalG.A.P.",
  "Other",
];

export const EMPLOYEE_BUCKETS = ["1-10", "11-50", "51-200", "200+"];
export const ORDER_VOLUMES = ["Small / sample", "1 container", "Several containers", "Bulk / ongoing"];

export function label<T extends { en: string; ar: string }>(item: T, locale: Locale): string {
  return locale === "ar" ? item.ar : item.en;
}
