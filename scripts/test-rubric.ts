// Unit check for the deterministic rubric. Runs via Node type-stripping
// (rubric/explain/countries cross-import only types, so there are no runtime deps).
import { scoreReadiness, type ExporterInput } from "../lib/readiness/rubric.ts";
import { explainDeterministic } from "../lib/readiness/explain.ts";
import { getCountry } from "../lib/data/countries.ts";

const de = getCountry("DE")!; // EU food market, requires ISO 22000 / HACCP, health cert

const strong: ExporterInput = {
  sectors: ["FOOD_BEVERAGE"],
  certifications: ["ISO 22000", "HACCP", "Organic", "ISO 9001"],
  exportStage: "ESTABLISHED_EXPORTER",
  hasExportLicense: true,
  currentMarkets: ["DE", "FR"],
  targetMarkets: ["DE", "FR", "US"],
  yearEstablished: 2000,
  employeeBucket: "200+",
  capacityNote: "500 tons / year",
  productCount: 4,
  hasNameAr: true,
  hasWebsite: true,
  hasDescription: true,
  hasLogo: true,
};

const weak: ExporterInput = {
  sectors: ["FOOD_BEVERAGE"],
  certifications: [],
  exportStage: "NEW_TO_EXPORT",
  hasExportLicense: false,
  currentMarkets: [],
  targetMarkets: ["DE"],
  yearEstablished: null,
  employeeBucket: null,
  capacityNote: null,
  productCount: 0,
  hasNameAr: false,
  hasWebsite: false,
  hasDescription: false,
  hasLogo: false,
};

function report(label: string, input: ExporterInput) {
  const res = scoreReadiness(input, de);
  console.log(`\n=== ${label} → ${res.score}/100 (${res.band}) ===`);
  for (const d of res.dimensions) console.log(`  ${d.labelEn}: ${d.earned}/${d.max}`);
  console.log(`  topGaps: ${res.topGaps.length ? res.topGaps.join(" | ") : "(none)"}`);
  console.log(`  narrative: ${explainDeterministic(res, de)}`);
  return res;
}

const s = report("STRONG exporter", strong);
const w = report("WEAK exporter", weak);

const dims = s.dimensions.length;
const sumOk = s.dimensions.reduce((a, d) => a + d.earned, 0).toFixed(1);
console.log(`\n--- assertions ---`);
console.log(`dimensions=6: ${dims === 6 ? "PASS" : "FAIL"}`);
console.log(`strong band high: ${s.band === "high" ? "PASS" : "FAIL"}`);
console.log(`weak band low: ${w.band === "low" ? "PASS" : "FAIL"}`);
console.log(`strong > weak: ${s.score > w.score ? "PASS" : "FAIL"}`);
console.log(`scores in 0..100: ${s.score <= 100 && w.score >= 0 ? "PASS" : "FAIL"}`);
console.log(`dim sum == score(strong): ${Math.round(Number(sumOk)) === s.score ? "PASS" : "FAIL"} (${sumOk})`);
