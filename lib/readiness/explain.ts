// Deterministic narrative — the always-available explanation of a readiness result.
// Used directly when no LLM is configured, and as the guaranteed fallback for ai.ts.

import type { Country } from "@/lib/data/countries";
import type { ReadinessResult } from "./rubric";

const BAND_LEAD: Record<ReadinessResult["band"], string> = {
  high: "is well positioned to export to",
  medium: "is partially ready to export to",
  low: "has significant gaps before exporting to",
};

export function explainDeterministic(result: ReadinessResult, country: Country): string {
  const lead = `Your company ${BAND_LEAD[result.band]} ${country.nameEn} (score ${result.score}/100).`;
  const strengths = result.dimensions
    .filter((d) => d.earned / d.max >= 0.75)
    .map((d) => d.labelEn.toLowerCase());
  const strengthLine = strengths.length
    ? ` Strengths: ${strengths.join(", ")}.`
    : "";
  const gapLine = result.topGaps.length
    ? ` Priority actions: ${result.topGaps.map((g, i) => `${i + 1}. ${g}`).join(" ")}`
    : " No major gaps remain.";
  return lead + strengthLine + gapLine;
}
