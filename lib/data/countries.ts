// Country reference data — markets used by the registration wizards (target/sourcing
// markets) and by readiness scoring (per-country import requirements).
// 37 countries across 7 regions. Region counts (must total 37):
//   Middle East 9 · Europe 11 · Asia 7 · North America 3 · Africa 3 · South America 2 · Oceania 2
// Requirement content here is illustrative placeholder pending the authoritative trade-data
// source (see plan.md §5 open question). Structure is production-shaped; values need review.

import type { Industry, Region, TradeBloc } from "../taxonomy";

export type CountryRequirement = {
  category: Industry;
  standards: string[];
  certsRequired: string[];
  note?: string;
};

export type Country = {
  iso2: string;
  nameEn: string;
  nameAr: string;
  region: Region;
  tradeBlocs: TradeBloc[];
  flag: string;
  summaryEn: string;
  summaryAr: string;
  topImports: Industry[];
  requirements: CountryRequirement[];
};

const FOOD_EU: CountryRequirement = {
  category: "FOOD_BEVERAGE",
  standards: ["EU 178/2002 food law", "Reg. 2023/915 contaminant limits", "EU labelling 1169/2011"],
  certsRequired: ["Health certificate", "EU importer of record", "ISO 22000 / HACCP"],
  note: "Full traceability and an EU-based responsible operator required.",
};
const FOOD_GCC: CountryRequirement = {
  category: "FOOD_BEVERAGE",
  standards: ["GSO labelling", "Shelf-life rules", "Arabic labelling"],
  certsRequired: ["Halal certificate", "Health certificate", "SFDA/registration"],
  note: "Arabic label and Halal documentation are mandatory.",
};
const AGRI_GENERIC: CountryRequirement = {
  category: "AGRICULTURE",
  standards: ["Phytosanitary controls", "MRL pesticide limits"],
  certsRequired: ["Phytosanitary certificate", "Certificate of origin"],
};

export const COUNTRIES: Country[] = [
  // ---------- Middle East (9) ----------
  { iso2: "AE", nameEn: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", region: "MIDDLE_EAST", tradeBlocs: ["GCC", "AL"], flag: "🇦🇪", summaryEn: "Major re-export hub for the Gulf and wider region.", summaryAr: "مركز رئيسي لإعادة التصدير للخليج والمنطقة.", topImports: ["FOOD_BEVERAGE", "TEXTILES_APPAREL", "COSMETICS_PERSONAL_CARE"], requirements: [FOOD_GCC, AGRI_GENERIC] },
  { iso2: "SA", nameEn: "Saudi Arabia", nameAr: "المملكة العربية السعودية", region: "MIDDLE_EAST", tradeBlocs: ["GCC", "AL"], flag: "🇸🇦", summaryEn: "Largest Gulf consumer market; SFDA-regulated.", summaryAr: "أكبر سوق استهلاكي خليجي خاضع لهيئة الغذاء والدواء.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE", "PHARMACEUTICALS"], requirements: [FOOD_GCC, { category: "PHARMACEUTICALS", standards: ["SFDA registration"], certsRequired: ["SFDA marketing authorisation"] }] },
  { iso2: "QA", nameEn: "Qatar", nameAr: "قطر", region: "MIDDLE_EAST", tradeBlocs: ["GCC", "AL"], flag: "🇶🇦", summaryEn: "High-income Gulf market with strong food imports.", summaryAr: "سوق خليجي مرتفع الدخل مع واردات غذائية كبيرة.", topImports: ["FOOD_BEVERAGE", "TEXTILES_APPAREL"], requirements: [FOOD_GCC] },
  { iso2: "KW", nameEn: "Kuwait", nameAr: "الكويت", region: "MIDDLE_EAST", tradeBlocs: ["GCC", "AL"], flag: "🇰🇼", summaryEn: "Gulf market reliant on imported food and goods.", summaryAr: "سوق خليجي يعتمد على استيراد الغذاء والسلع.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE"], requirements: [FOOD_GCC] },
  { iso2: "OM", nameEn: "Oman", nameAr: "عُمان", region: "MIDDLE_EAST", tradeBlocs: ["GCC", "AL"], flag: "🇴🇲", summaryEn: "Growing Gulf market and logistics gateway.", summaryAr: "سوق خليجي نامٍ وبوابة لوجستية.", topImports: ["FOOD_BEVERAGE", "CRAFTS_ARTISANAL"], requirements: [FOOD_GCC] },
  { iso2: "BH", nameEn: "Bahrain", nameAr: "البحرين", region: "MIDDLE_EAST", tradeBlocs: ["GCC", "AL"], flag: "🇧🇭", summaryEn: "Open Gulf economy with light import procedures.", summaryAr: "اقتصاد خليجي منفتح بإجراءات استيراد ميسّرة.", topImports: ["FOOD_BEVERAGE", "COSMETICS_PERSONAL_CARE"], requirements: [FOOD_GCC] },
  { iso2: "JO", nameEn: "Jordan", nameAr: "الأردن", region: "MIDDLE_EAST", tradeBlocs: ["AL"], flag: "🇯🇴", summaryEn: "Neighbouring market with established trade ties.", summaryAr: "سوق مجاور بعلاقات تجارية راسخة.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE", "CHEMICALS"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["JSMO standards", "Arabic labelling"], certsRequired: ["Certificate of origin", "Health certificate"] }] },
  { iso2: "LB", nameEn: "Lebanon", nameAr: "لبنان", region: "MIDDLE_EAST", tradeBlocs: ["AL"], flag: "🇱🇧", summaryEn: "Close cross-border market for Syrian goods.", summaryAr: "سوق حدودي قريب للبضائع السورية.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE", "TEXTILES_APPAREL"], requirements: [AGRI_GENERIC] },
  { iso2: "IQ", nameEn: "Iraq", nameAr: "العراق", region: "MIDDLE_EAST", tradeBlocs: ["AL"], flag: "🇮🇶", summaryEn: "Large regional market with high food demand.", summaryAr: "سوق إقليمي كبير بطلب غذائي مرتفع.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE", "MACHINERY"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["COSQC standards"], certsRequired: ["Certificate of origin", "Health certificate"] }] },

  // ---------- Europe (11) ----------
  { iso2: "DE", nameEn: "Germany", nameAr: "ألمانيا", region: "EUROPE", tradeBlocs: ["EU"], flag: "🇩🇪", summaryEn: "EU's largest economy; demanding quality standards.", summaryAr: "أكبر اقتصاد في الاتحاد الأوروبي بمعايير جودة صارمة.", topImports: ["FOOD_BEVERAGE", "TEXTILES_APPAREL", "MACHINERY"], requirements: [FOOD_EU] },
  { iso2: "FR", nameEn: "France", nameAr: "فرنسا", region: "EUROPE", tradeBlocs: ["EU"], flag: "🇫🇷", summaryEn: "Major EU consumer market with strong gourmet demand.", summaryAr: "سوق استهلاكي أوروبي كبير بطلب على المنتجات الفاخرة.", topImports: ["FOOD_BEVERAGE", "COSMETICS_PERSONAL_CARE", "CRAFTS_ARTISANAL"], requirements: [FOOD_EU] },
  { iso2: "IT", nameEn: "Italy", nameAr: "إيطاليا", region: "EUROPE", tradeBlocs: ["EU"], flag: "🇮🇹", summaryEn: "Mediterranean market with affinity for olive products.", summaryAr: "سوق متوسطي مهتم بمنتجات الزيتون.", topImports: ["FOOD_BEVERAGE", "TEXTILES_APPAREL", "AGRICULTURE"], requirements: [FOOD_EU, AGRI_GENERIC] },
  { iso2: "ES", nameEn: "Spain", nameAr: "إسبانيا", region: "EUROPE", tradeBlocs: ["EU"], flag: "🇪🇸", summaryEn: "Large EU food processor and re-exporter.", summaryAr: "سوق أوروبي كبير لتصنيع وإعادة تصدير الغذاء.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE"], requirements: [FOOD_EU] },
  { iso2: "NL", nameEn: "Netherlands", nameAr: "هولندا", region: "EUROPE", tradeBlocs: ["EU"], flag: "🇳🇱", summaryEn: "Europe's logistics gateway via Rotterdam.", summaryAr: "بوابة أوروبا اللوجستية عبر روتردام.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE", "CHEMICALS"], requirements: [FOOD_EU] },
  { iso2: "SE", nameEn: "Sweden", nameAr: "السويد", region: "EUROPE", tradeBlocs: ["EU"], flag: "🇸🇪", summaryEn: "Nordic market valuing organic and ethical sourcing.", summaryAr: "سوق إسكندنافي يقدّر المنتجات العضوية والأخلاقية.", topImports: ["FOOD_BEVERAGE", "COSMETICS_PERSONAL_CARE"], requirements: [FOOD_EU] },
  { iso2: "PL", nameEn: "Poland", nameAr: "بولندا", region: "EUROPE", tradeBlocs: ["EU"], flag: "🇵🇱", summaryEn: "Fast-growing Central European market.", summaryAr: "سوق وسط أوروبي سريع النمو.", topImports: ["FOOD_BEVERAGE", "MACHINERY", "TEXTILES_APPAREL"], requirements: [FOOD_EU] },
  { iso2: "CH", nameEn: "Switzerland", nameAr: "سويسرا", region: "EUROPE", tradeBlocs: ["EFTA"], flag: "🇨🇭", summaryEn: "High-value market with premium positioning.", summaryAr: "سوق عالي القيمة بمكانة متميزة.", topImports: ["FOOD_BEVERAGE", "PHARMACEUTICALS", "CRAFTS_ARTISANAL"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["Swiss Food Act", "Labelling ordinance"], certsRequired: ["Health certificate", "Importer registration"] }] },
  { iso2: "NO", nameEn: "Norway", nameAr: "النرويج", region: "EUROPE", tradeBlocs: ["EFTA"], flag: "🇳🇴", summaryEn: "Wealthy Nordic market outside the EU.", summaryAr: "سوق إسكندنافي ثري خارج الاتحاد الأوروبي.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE"], requirements: [AGRI_GENERIC] },
  { iso2: "IS", nameEn: "Iceland", nameAr: "آيسلندا", region: "EUROPE", tradeBlocs: ["EFTA"], flag: "🇮🇸", summaryEn: "Small but high-income import-reliant market.", summaryAr: "سوق صغير مرتفع الدخل يعتمد على الاستيراد.", topImports: ["FOOD_BEVERAGE"], requirements: [AGRI_GENERIC] },
  { iso2: "GB", nameEn: "United Kingdom", nameAr: "المملكة المتحدة", region: "EUROPE", tradeBlocs: [], flag: "🇬🇧", summaryEn: "Large post-Brexit market with its own UKCA/standards.", summaryAr: "سوق كبير بعد بريكست بمعايير UKCA خاصة.", topImports: ["FOOD_BEVERAGE", "TEXTILES_APPAREL", "COSMETICS_PERSONAL_CARE"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["UK food law", "UKCA where applicable"], certsRequired: ["Health certificate", "UK importer of record"] }] },

  // ---------- Asia (7) ----------
  { iso2: "CN", nameEn: "China", nameAr: "الصين", region: "ASIA", tradeBlocs: [], flag: "🇨🇳", summaryEn: "Vast market; GACC registration for food exporters.", summaryAr: "سوق ضخم؛ تسجيل GACC لمصدّري الغذاء.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE", "CHEMICALS"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["GB national standards"], certsRequired: ["GACC registration", "Health certificate"] }] },
  { iso2: "JP", nameEn: "Japan", nameAr: "اليابان", region: "ASIA", tradeBlocs: [], flag: "🇯🇵", summaryEn: "Premium market with rigorous quality expectations.", summaryAr: "سوق متميز بتوقعات جودة صارمة.", topImports: ["FOOD_BEVERAGE", "COSMETICS_PERSONAL_CARE"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["JAS standards", "Food Sanitation Act"], certsRequired: ["Import notification", "Health certificate"] }] },
  { iso2: "IN", nameEn: "India", nameAr: "الهند", region: "ASIA", tradeBlocs: [], flag: "🇮🇳", summaryEn: "Large emerging market; FSSAI-regulated food imports.", summaryAr: "سوق ناشئ كبير؛ واردات غذائية تنظّمها FSSAI.", topImports: ["AGRICULTURE", "CHEMICALS", "MACHINERY"], requirements: [{ category: "AGRICULTURE", standards: ["FSSAI standards"], certsRequired: ["Phytosanitary certificate", "FSSAI clearance"] }] },
  { iso2: "ID", nameEn: "Indonesia", nameAr: "إندونيسيا", region: "ASIA", tradeBlocs: ["ASEAN"], flag: "🇮🇩", summaryEn: "Largest ASEAN market; Halal-focused.", summaryAr: "أكبر أسواق آسيان مع تركيز على الحلال.", topImports: ["FOOD_BEVERAGE", "TEXTILES_APPAREL"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["BPOM registration"], certsRequired: ["Halal certificate", "BPOM approval"] }] },
  { iso2: "VN", nameEn: "Vietnam", nameAr: "فيتنام", region: "ASIA", tradeBlocs: ["ASEAN"], flag: "🇻🇳", summaryEn: "Fast-growing ASEAN manufacturing and consumer hub.", summaryAr: "مركز تصنيع واستهلاك آسيوي سريع النمو.", topImports: ["AGRICULTURE", "CHEMICALS", "MACHINERY"], requirements: [AGRI_GENERIC] },
  { iso2: "TH", nameEn: "Thailand", nameAr: "تايلاند", region: "ASIA", tradeBlocs: ["ASEAN"], flag: "🇹🇭", summaryEn: "Regional food-processing and trade centre.", summaryAr: "مركز إقليمي لتصنيع الغذاء والتجارة.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["Thai FDA standards"], certsRequired: ["Thai FDA registration", "Health certificate"] }] },
  { iso2: "SG", nameEn: "Singapore", nameAr: "سنغافورة", region: "ASIA", tradeBlocs: ["ASEAN"], flag: "🇸🇬", summaryEn: "Open, high-income re-export hub for Asia.", summaryAr: "مركز إعادة تصدير منفتح ومرتفع الدخل لآسيا.", topImports: ["FOOD_BEVERAGE", "COSMETICS_PERSONAL_CARE", "ELECTRONICS"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["SFA standards"], certsRequired: ["SFA import licence", "Health certificate"] }] },

  // ---------- North America (3) ----------
  { iso2: "US", nameEn: "United States", nameAr: "الولايات المتحدة", region: "NORTH_AMERICA", tradeBlocs: ["USMCA"], flag: "🇺🇸", summaryEn: "Huge market; FDA registration and FSMA rules apply.", summaryAr: "سوق ضخم؛ تطبق قواعد تسجيل FDA وFSMA.", topImports: ["FOOD_BEVERAGE", "COSMETICS_PERSONAL_CARE", "CRAFTS_ARTISANAL"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["FDA FSMA", "Nutrition labelling"], certsRequired: ["FDA facility registration", "Prior notice", "US agent"] }] },
  { iso2: "CA", nameEn: "Canada", nameAr: "كندا", region: "NORTH_AMERICA", tradeBlocs: ["USMCA"], flag: "🇨🇦", summaryEn: "Quality-focused market; CFIA oversight.", summaryAr: "سوق يركز على الجودة تحت إشراف CFIA.", topImports: ["FOOD_BEVERAGE", "AGRICULTURE"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["SFCR safe food rules", "Bilingual labelling"], certsRequired: ["SFCR licence", "Health certificate"] }] },
  { iso2: "MX", nameEn: "Mexico", nameAr: "المكسيك", region: "NORTH_AMERICA", tradeBlocs: ["USMCA"], flag: "🇲🇽", summaryEn: "Large Latin American manufacturing and consumer market.", summaryAr: "سوق تصنيع واستهلاك كبير في أمريكا اللاتينية.", topImports: ["CHEMICALS", "MACHINERY", "AGRICULTURE"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["NOM standards", "Spanish labelling"], certsRequired: ["COFEPRIS registration"] }] },

  // ---------- Africa (3) ----------
  { iso2: "EG", nameEn: "Egypt", nameAr: "مصر", region: "AFRICA", tradeBlocs: ["AFCFTA", "AL"], flag: "🇪🇬", summaryEn: "Large North African market and regional gateway.", summaryAr: "سوق كبير في شمال أفريقيا وبوابة إقليمية.", topImports: ["FOOD_BEVERAGE", "CHEMICALS", "MACHINERY"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["ES Egyptian standards", "Arabic labelling"], certsRequired: ["GOEIC registration", "Certificate of origin"] }] },
  { iso2: "NG", nameEn: "Nigeria", nameAr: "نيجيريا", region: "AFRICA", tradeBlocs: ["AFCFTA"], flag: "🇳🇬", summaryEn: "Africa's most populous consumer market.", summaryAr: "أكبر سوق استهلاكي في أفريقيا من حيث السكان.", topImports: ["FOOD_BEVERAGE", "PHARMACEUTICALS", "MACHINERY"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["SON standards"], certsRequired: ["NAFDAC registration", "SONCAP"] }] },
  { iso2: "ZA", nameEn: "South Africa", nameAr: "جنوب أفريقيا", region: "AFRICA", tradeBlocs: ["AFCFTA"], flag: "🇿🇦", summaryEn: "Most industrialised African economy.", summaryAr: "أكثر الاقتصادات الأفريقية تصنيعاً.", topImports: ["MACHINERY", "CHEMICALS", "FOOD_BEVERAGE"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["SABS standards"], certsRequired: ["Health certificate", "Import permit"] }] },

  // ---------- South America (2) ----------
  { iso2: "BR", nameEn: "Brazil", nameAr: "البرازيل", region: "SOUTH_AMERICA", tradeBlocs: ["MERCOSUR"], flag: "🇧🇷", summaryEn: "Largest South American market; ANVISA-regulated.", summaryAr: "أكبر سوق في أمريكا الجنوبية تنظّمه ANVISA.", topImports: ["CHEMICALS", "MACHINERY", "PHARMACEUTICALS"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["ANVISA rules", "Portuguese labelling"], certsRequired: ["ANVISA registration", "Health certificate"] }] },
  { iso2: "AR", nameEn: "Argentina", nameAr: "الأرجنتين", region: "SOUTH_AMERICA", tradeBlocs: ["MERCOSUR"], flag: "🇦🇷", summaryEn: "Major MERCOSUR market with import licensing.", summaryAr: "سوق رئيسي في ميركوسور مع تراخيص استيراد.", topImports: ["CHEMICALS", "MACHINERY"], requirements: [{ category: "CHEMICALS", standards: ["SENASA / INAL rules"], certsRequired: ["Import licence", "Certificate of origin"] }] },

  // ---------- Oceania (2) ----------
  { iso2: "AU", nameEn: "Australia", nameAr: "أستراليا", region: "OCEANIA", tradeBlocs: [], flag: "🇦🇺", summaryEn: "Strict biosecurity; high-value consumer market.", summaryAr: "إجراءات أمن حيوي صارمة وسوق استهلاكي عالي القيمة.", topImports: ["FOOD_BEVERAGE", "COSMETICS_PERSONAL_CARE"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["FSANZ code", "Country-of-origin labelling"], certsRequired: ["Biosecurity import permit", "Health certificate"] }] },
  { iso2: "NZ", nameEn: "New Zealand", nameAr: "نيوزيلندا", region: "OCEANIA", tradeBlocs: [], flag: "🇳🇿", summaryEn: "Premium market with strict biosecurity controls.", summaryAr: "سوق متميز بضوابط أمن حيوي صارمة.", topImports: ["FOOD_BEVERAGE", "MACHINERY"], requirements: [{ category: "FOOD_BEVERAGE", standards: ["FSANZ code"], certsRequired: ["MPI import health standard", "Biosecurity clearance"] }] },
];

export function getCountry(iso2: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso2.toLowerCase() === iso2.toLowerCase());
}
