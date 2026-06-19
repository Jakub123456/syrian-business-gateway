"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { fromJsonList } from "@/lib/serialize";
import { getCountry } from "@/lib/data/countries";
import type { Industry } from "@/lib/taxonomy";
import { scoreReadiness, type ExporterInput, type ReadinessResult } from "./rubric";
import { generateNarrative, type Narrative } from "./ai";

export type ReadinessResponse =
  | { ok: true; result: ReadinessResult; narrative: Narrative; countryNameEn: string }
  | { ok: false; error: string };

type ExporterCompany = NonNullable<Awaited<ReturnType<typeof loadExporter>>>;

async function loadExporter(uid: string) {
  return db.company.findUnique({
    where: { ownerId: uid },
    include: { exporter: true, products: true },
  });
}

function toInput(company: ExporterCompany): ExporterInput {
  const ex = company.exporter!;
  return {
    sectors: fromJsonList(ex.sectors) as Industry[],
    certifications: fromJsonList(ex.certifications),
    exportStage: ex.exportStage,
    hasExportLicense: ex.hasExportLicense,
    currentMarkets: fromJsonList(ex.currentMarkets),
    targetMarkets: fromJsonList(ex.targetMarkets),
    yearEstablished: ex.yearEstablished,
    employeeBucket: ex.employeeBucket,
    capacityNote: ex.capacityNote,
    productCount: company.products.length,
    hasNameAr: !!company.nameAr,
    hasWebsite: !!company.website,
    hasDescription: !!company.descriptionEn,
    hasLogo: !!company.logoUrl,
  };
}

export async function computeReadiness(targetIso2: string): Promise<ReadinessResponse> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };
  if (session.role !== "EXPORTER") return { ok: false, error: "Readiness scoring is for exporters" };

  const country = getCountry(targetIso2);
  if (!country) return { ok: false, error: "Unknown country" };

  const company = await loadExporter(session.uid);
  if (!company?.exporter) return { ok: false, error: "Complete your exporter profile first" };

  const input = toInput(company);
  const result = scoreReadiness(input, country);
  const narrative = await generateNarrative(result, country, company.nameEn);

  await db.readinessScore.upsert({
    where: { companyId_targetCountryIso2: { companyId: company.id, targetCountryIso2: country.iso2 } },
    create: {
      companyId: company.id,
      targetCountryIso2: country.iso2,
      score: result.score,
      band: result.band,
      breakdown: JSON.stringify(result.dimensions),
      topGaps: JSON.stringify(result.topGaps),
      narrative: narrative.text,
      source: narrative.source,
      model: narrative.model,
    },
    update: {
      score: result.score,
      band: result.band,
      breakdown: JSON.stringify(result.dimensions),
      topGaps: JSON.stringify(result.topGaps),
      narrative: narrative.text,
      source: narrative.source,
      model: narrative.model,
    },
  });

  return { ok: true, result, narrative, countryNameEn: country.nameEn };
}

// VAS — multi-market comparison. Scores the exporter against every target market in one
// pass (deterministic only, no LLM) and returns a ranked list. Lets an exporter see which
// market they're most ready for before committing.
export type MarketScore = {
  iso2: string;
  nameEn: string;
  nameAr: string;
  flag: string;
  score: number;
  band: ReadinessResult["band"];
};
export type CompareResponse =
  | { ok: true; markets: MarketScore[] }
  | { ok: false; error: string };

export async function compareReadiness(): Promise<CompareResponse> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };
  if (session.role !== "EXPORTER") return { ok: false, error: "Readiness scoring is for exporters" };

  const company = await loadExporter(session.uid);
  if (!company?.exporter) return { ok: false, error: "Complete your exporter profile first" };

  const targets = fromJsonList(company.exporter.targetMarkets);
  if (targets.length === 0) return { ok: false, error: "Add target markets to your profile first" };

  const input = toInput(company);
  const markets: MarketScore[] = targets
    .map((iso) => getCountry(iso))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((country) => {
      const r = scoreReadiness(input, country);
      return { iso2: country.iso2, nameEn: country.nameEn, nameAr: country.nameAr, flag: country.flag, score: r.score, band: r.band };
    })
    .sort((a, b) => b.score - a.score);

  return { ok: true, markets };
}
