// Sample exporter directory data. Stands in for the `Company`/`ExporterProfile` tables
// until Postgres is provisioned; shape mirrors the Prisma models in plan.md §4.

import type { ExportStage, Industry } from "../taxonomy";

export type ExporterProduct = { nameEn: string; nameAr: string; category: Industry };

export type Exporter = {
  id: string;
  nameEn: string;
  nameAr: string;
  governorate: string; // taxonomy key
  sectors: Industry[];
  exportStage: ExportStage;
  verified: boolean;
  descriptionEn: string;
  descriptionAr: string;
  certifications: string[];
  yearEstablished: number;
  targetMarkets: string[]; // iso2[]
  products: ExporterProduct[];
  website?: string;
};

export const EXPORTERS: Exporter[] = [
  {
    id: "al-nour-olive-oil",
    nameEn: "Al-Nour Olive Oil Co.",
    nameAr: "شركة النور لزيت الزيتون",
    governorate: "IDLIB",
    sectors: ["FOOD_BEVERAGE", "AGRICULTURE"],
    exportStage: "OCCASIONAL_EXPORTER",
    verified: true,
    descriptionEn: "Cold-pressed extra-virgin olive oil from northern Syrian groves.",
    descriptionAr: "زيت زيتون بكر ممتاز معصور على البارد من بساتين شمال سوريا.",
    certifications: ["ISO 22000", "HACCP", "Organic"],
    yearEstablished: 2009,
    targetMarkets: ["DE", "FR", "AE", "US"],
    products: [
      { nameEn: "Extra-virgin olive oil", nameAr: "زيت زيتون بكر ممتاز", category: "FOOD_BEVERAGE" },
      { nameEn: "Organic table olives", nameAr: "زيتون مائدة عضوي", category: "FOOD_BEVERAGE" },
    ],
  },
  {
    id: "damascus-rose",
    nameEn: "Damascus Rose Naturals",
    nameAr: "دمشق روز للمنتجات الطبيعية",
    governorate: "RIF_DIMASHQ",
    sectors: ["COSMETICS_PERSONAL_CARE", "AGRICULTURE"],
    exportStage: "EXPORT_READY",
    verified: true,
    descriptionEn: "Rosewater, rose oil and natural skincare from the Damascus rose.",
    descriptionAr: "ماء الورد وزيت الورد ومنتجات عناية طبيعية من الورد الدمشقي.",
    certifications: ["ISO 9001", "Organic"],
    yearEstablished: 2015,
    targetMarkets: ["FR", "JP", "AE", "GB"],
    products: [
      { nameEn: "Damascus rosewater", nameAr: "ماء الورد الدمشقي", category: "COSMETICS_PERSONAL_CARE" },
      { nameEn: "Rose essential oil", nameAr: "زيت الورد العطري", category: "COSMETICS_PERSONAL_CARE" },
    ],
  },
  {
    id: "aleppo-soap-house",
    nameEn: "Aleppo Soap House",
    nameAr: "بيت صابون حلب",
    governorate: "ALEPPO",
    sectors: ["COSMETICS_PERSONAL_CARE", "CRAFTS_ARTISANAL"],
    exportStage: "ESTABLISHED_EXPORTER",
    verified: true,
    descriptionEn: "Traditional laurel-and-olive Aleppo soap, hand-cut and aged.",
    descriptionAr: "صابون حلب التقليدي بالغار والزيتون، مقطّع يدوياً ومعتّق.",
    certifications: ["ISO 22000", "Halal"],
    yearEstablished: 1998,
    targetMarkets: ["DE", "FR", "US", "SG", "AE"],
    products: [
      { nameEn: "Laurel Aleppo soap", nameAr: "صابون حلب بالغار", category: "COSMETICS_PERSONAL_CARE" },
      { nameEn: "Gift soap set", nameAr: "طقم صابون هدايا", category: "CRAFTS_ARTISANAL" },
    ],
  },
  {
    id: "euphrates-textiles",
    nameEn: "Euphrates Textiles",
    nameAr: "نسيج الفرات",
    governorate: "ALEPPO",
    sectors: ["TEXTILES_APPAREL"],
    exportStage: "EXPLORING",
    verified: false,
    descriptionEn: "Cotton home textiles and apparel from Aleppo's weaving tradition.",
    descriptionAr: "منسوجات منزلية وألبسة قطنية من تراث النسيج الحلبي.",
    certifications: ["ISO 9001"],
    yearEstablished: 2012,
    targetMarkets: ["IT", "PL", "AE"],
    products: [
      { nameEn: "Cotton bath towels", nameAr: "مناشف قطنية", category: "TEXTILES_APPAREL" },
      { nameEn: "Woven table linens", nameAr: "مفارش طاولة منسوجة", category: "TEXTILES_APPAREL" },
    ],
  },
  {
    id: "palmyra-spices",
    nameEn: "Palmyra Spices & Herbs",
    nameAr: "تدمر للبهارات والأعشاب",
    governorate: "HOMS",
    sectors: ["FOOD_BEVERAGE", "AGRICULTURE"],
    exportStage: "EXPORT_READY",
    verified: true,
    descriptionEn: "Cumin, za'atar, aniseed and dried herbs, cleaned and graded.",
    descriptionAr: "كمون وزعتر ويانسون وأعشاب مجففة، منظّفة ومصنّفة.",
    certifications: ["HACCP", "Halal"],
    yearEstablished: 2007,
    targetMarkets: ["AE", "SA", "DE", "US"],
    products: [
      { nameEn: "Syrian za'atar blend", nameAr: "خلطة زعتر سوري", category: "FOOD_BEVERAGE" },
      { nameEn: "Whole cumin seed", nameAr: "كمون حب", category: "AGRICULTURE" },
    ],
  },
  {
    id: "orient-handicrafts",
    nameEn: "Orient Handicrafts",
    nameAr: "حرف الشرق اليدوية",
    governorate: "DAMASCUS",
    sectors: ["CRAFTS_ARTISANAL"],
    exportStage: "OCCASIONAL_EXPORTER",
    verified: false,
    descriptionEn: "Mother-of-pearl inlay, brassware and damascene woodwork.",
    descriptionAr: "تطعيم صدف ونحاسيات وأعمال خشبية دمشقية.",
    certifications: [],
    yearEstablished: 2011,
    targetMarkets: ["FR", "US", "AE", "JP"],
    products: [
      { nameEn: "Inlaid jewellery box", nameAr: "علبة مجوهرات مطعّمة", category: "CRAFTS_ARTISANAL" },
      { nameEn: "Engraved brass tray", nameAr: "صينية نحاس منقوشة", category: "CRAFTS_ARTISANAL" },
    ],
  },
];

export function getExporter(id: string): Exporter | undefined {
  return EXPORTERS.find((e) => e.id === id);
}
