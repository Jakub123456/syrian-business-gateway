// Export-readiness scoring — the deterministic rubric (plan.md §9, decision D6).
// This is the SOURCE OF TRUTH for the score: a weighted 0–100 across six dimensions,
// computed only from the exporter's profile and the target country's requirements.
// The LLM layer (ai.ts) may explain and prioritise these numbers but never changes them.

import type { Country, CountryRequirement } from "@/lib/data/countries";
import type { Industry } from "@/lib/taxonomy";

export type ExporterInput = {
  sectors: Industry[];
  certifications: string[];
  exportStage: string;
  hasExportLicense: boolean;
  currentMarkets: string[]; // iso2[]
  targetMarkets: string[]; // iso2[]
  yearEstablished: number | null;
  employeeBucket: string | null;
  capacityNote: string | null;
  productCount: number;
  // profile completeness signals
  hasNameAr: boolean;
  hasWebsite: boolean;
  hasDescription: boolean;
  hasLogo: boolean;
};

export type Dimension = {
  key: string;
  labelEn: string;
  labelAr: string;
  earned: number;
  max: number;
  summaryEn: string;
  gaps: string[];
};

export type ReadinessResult = {
  targetIso2: string;
  score: number; // 0–100
  band: "low" | "medium" | "high";
  dimensions: Dimension[];
  topGaps: string[];
};

// Keywords that identify which held certifications satisfy a required item, and which
// requirement strings are "certification-type" (a company holds them) vs. shipment docs.
const HELD_CERT_KEYWORDS: Record<string, string[]> = {
  "ISO 22000": ["iso 22000", "22000"],
  HACCP: ["haccp"],
  Halal: ["halal"],
  Organic: ["organic"],
  "ISO 9001": ["iso 9001", "9001"],
  CE: ["ce mark", "ukca"],
  "GlobalG.A.P.": ["globalg", "g.a.p", "gap"],
};
const CERT_TYPE_HINTS = ["halal", "organic", "iso", "haccp", "globalg", "g.a.p", "gap", "ce mark", "gmp", "ukca"];
const QUALITY_CERTS = ["ISO 22000", "HACCP", "ISO 9001", "GlobalG.A.P."];

const STAGE_POINTS: Record<string, number> = {
  NEW_TO_EXPORT: 2,
  EXPLORING: 4,
  EXPORT_READY: 7,
  OCCASIONAL_EXPORTER: 8,
  ESTABLISHED_EXPORTER: 10,
};

const BUCKET_CAPACITY: Record<string, number> = { "1-10": 0.4, "11-50": 0.7, "51-200": 0.9, "200+": 1 };

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// Requirements relevant to what this exporter actually sells; fall back to all if no overlap.
function relevantRequirements(exporter: ExporterInput, country: Country): CountryRequirement[] {
  const matched = country.requirements.filter((r) => exporter.sectors.includes(r.category));
  return matched.length > 0 ? matched : country.requirements;
}

// 1. Certifications vs. the target's required certifications (30 pts).
function scoreCertifications(exporter: ExporterInput, reqs: CountryRequirement[]): Dimension {
  const max = 30;
  const held = exporter.certifications;
  const isCertType = (s: string) => CERT_TYPE_HINTS.some((h) => s.toLowerCase().includes(h));
  const isMet = (req: string) =>
    held.some((c) => (HELD_CERT_KEYWORDS[c] ?? [c.toLowerCase()]).some((kw) => req.toLowerCase().includes(kw)));

  const required = Array.from(new Set(reqs.flatMap((r) => r.certsRequired))).filter(isCertType);
  const gaps: string[] = [];

  if (required.length === 0) {
    return {
      key: "certifications",
      labelEn: "Certifications match",
      labelAr: "مطابقة الشهادات",
      earned: max,
      max,
      summaryEn: "No specific product certifications are required for this market.",
      gaps,
    };
  }

  const met = required.filter(isMet);
  for (const r of required) if (!isMet(r)) gaps.push(`Obtain or document: ${r}`);
  const earned = round((met.length / required.length) * max);
  return {
    key: "certifications",
    labelEn: "Certifications match",
    labelAr: "مطابقة الشهادات",
    earned,
    max,
    summaryEn: `${met.length} of ${required.length} required certifications are in place.`,
    gaps,
  };
}

// 2. Standards & labelling readiness (20 pts) — proxied by quality-management certs + stage.
function scoreStandards(exporter: ExporterInput, reqs: CountryRequirement[]): Dimension {
  const max = 20;
  const hasQuality = exporter.certifications.some((c) => QUALITY_CERTS.includes(c));
  const stageFactor = (STAGE_POINTS[exporter.exportStage] ?? 4) / 10;
  const earned = round(max * (0.5 * (hasQuality ? 1 : 0.3) + 0.5 * stageFactor));
  const gaps: string[] = [];
  if (!hasQuality) gaps.push("Adopt a quality-management standard (e.g. ISO 9001 / ISO 22000) to evidence labelling and process control");
  const standards = Array.from(new Set(reqs.flatMap((r) => r.standards))).slice(0, 2);
  if (standards.length) gaps.push(`Review market standards: ${standards.join("; ")}`);
  return {
    key: "standards",
    labelEn: "Standards & labelling",
    labelAr: "المعايير ووضع العلامات",
    earned,
    max,
    summaryEn: hasQuality ? "Quality-management systems support standards compliance." : "No quality-management certification on file.",
    gaps,
  };
}

// 3. Export licence & documentation (15 pts).
function scoreDocumentation(exporter: ExporterInput): Dimension {
  const max = 15;
  let earned = 0;
  const gaps: string[] = [];
  if (exporter.hasExportLicense) earned += 10;
  else gaps.push("Obtain an export licence");
  if (exporter.currentMarkets.length > 0) earned += 5;
  else gaps.push("Build documented export experience (first shipments, certificates of origin)");
  return {
    key: "documentation",
    labelEn: "Export licence & docs",
    labelAr: "رخصة التصدير والوثائق",
    earned,
    max,
    summaryEn: exporter.hasExportLicense ? "Export licence held." : "No export licence on file.",
    gaps,
  };
}

// 4. Capacity vs. typical order size (15 pts).
function scoreCapacity(exporter: ExporterInput): Dimension {
  const max = 15;
  const bucket = exporter.employeeBucket ? BUCKET_CAPACITY[exporter.employeeBucket] ?? 0.5 : 0.4;
  const hasCapacityNote = !!exporter.capacityNote;
  const earned = round(max * (0.7 * bucket + 0.3 * (hasCapacityNote ? 1 : 0)));
  const gaps: string[] = [];
  if (!hasCapacityNote) gaps.push("State your production capacity (volume/unit) so buyers can match order sizes");
  if (bucket < 0.7) gaps.push("Confirm you can scale to container-level volumes for this market");
  return {
    key: "capacity",
    labelEn: "Production capacity",
    labelAr: "الطاقة الإنتاجية",
    earned,
    max,
    summaryEn: hasCapacityNote ? "Capacity is documented." : "Production capacity is not documented.",
    gaps,
  };
}

// 5. Export experience / stage (10 pts), with a bonus if already shipping to the target.
function scoreExperience(exporter: ExporterInput, targetIso2: string): Dimension {
  const max = 10;
  let earned = STAGE_POINTS[exporter.exportStage] ?? 4;
  if (exporter.currentMarkets.map((m) => m.toUpperCase()).includes(targetIso2.toUpperCase())) {
    earned = max;
  }
  earned = Math.min(max, earned);
  const gaps: string[] = [];
  if (earned < 7) gaps.push("Gain export experience or move toward export-ready status");
  return {
    key: "experience",
    labelEn: "Export experience",
    labelAr: "خبرة التصدير",
    earned,
    max,
    summaryEn: `Export stage contributes ${earned}/${max}.`,
    gaps,
  };
}

// 6. Profile completeness (10 pts) — proxy for buyer-facing professionalism.
function scoreCompleteness(exporter: ExporterInput): Dimension {
  const max = 10;
  const checks = [
    exporter.hasNameAr,
    exporter.hasWebsite,
    exporter.hasDescription,
    exporter.hasLogo,
    exporter.yearEstablished !== null,
    exporter.productCount > 0,
    exporter.certifications.length > 0,
  ];
  const earned = round((checks.filter(Boolean).length / checks.length) * max);
  const gaps: string[] = [];
  if (!exporter.hasWebsite) gaps.push("Add a company website");
  if (exporter.productCount === 0) gaps.push("List at least one product");
  if (!exporter.hasLogo) gaps.push("Upload a company logo");
  return {
    key: "completeness",
    labelEn: "Profile completeness",
    labelAr: "اكتمال الملف",
    earned,
    max,
    summaryEn: `${checks.filter(Boolean).length}/${checks.length} profile signals complete.`,
    gaps,
  };
}

export function scoreReadiness(exporter: ExporterInput, country: Country): ReadinessResult {
  const reqs = relevantRequirements(exporter, country);
  const dimensions = [
    scoreCertifications(exporter, reqs),
    scoreStandards(exporter, reqs),
    scoreDocumentation(exporter),
    scoreCapacity(exporter),
    scoreExperience(exporter, country.iso2),
    scoreCompleteness(exporter),
  ];
  const score = Math.round(dimensions.reduce((sum, d) => sum + d.earned, 0));
  const band: ReadinessResult["band"] = score >= 75 ? "high" : score >= 50 ? "medium" : "low";

  // Prioritise gaps from the dimensions with the largest point shortfall.
  const topGaps = dimensions
    .map((d) => ({ gap: d.gaps[0], shortfall: d.max - d.earned }))
    .filter((g): g is { gap: string; shortfall: number } => !!g.gap && g.shortfall > 0)
    .sort((a, b) => b.shortfall - a.shortfall)
    .slice(0, 4)
    .map((g) => g.gap);

  return { targetIso2: country.iso2, score, band, dimensions, topGaps };
}
