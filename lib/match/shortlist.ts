// VAS — supplier shortlist for an import request. A transparent, rules-based ranking of
// directory exporters for a given category/market. NOT automated matchmaking: it surfaces
// candidates the importer can evaluate. Pure function (no DB), usable on client or server.

import { EXPORTERS, type Exporter } from "@/lib/data/exporters";
import type { Industry } from "@/lib/taxonomy";

const STAGE_WEIGHT: Record<string, number> = {
  NEW_TO_EXPORT: 1,
  EXPLORING: 2,
  EXPORT_READY: 4,
  OCCASIONAL_EXPORTER: 4,
  ESTABLISHED_EXPORTER: 5,
};

export type Shortlisted = {
  exporter: Exporter;
  score: number;
  verified: boolean;
  targetsMarket: boolean;
};

export function shortlistSuppliers(
  category: Industry,
  targetIso2?: string | null,
  limit = 3,
): Shortlisted[] {
  return EXPORTERS.filter((e) => e.sectors.includes(category))
    .map((e) => {
      const targetsMarket = !!targetIso2 && e.targetMarkets.includes(targetIso2);
      const score =
        10 + // sector match (entry requirement)
        (e.verified ? 5 : 0) +
        (STAGE_WEIGHT[e.exportStage] ?? 0) +
        (targetsMarket ? 6 : 0) +
        Math.min(3, e.certifications.length);
      return { exporter: e, score, verified: e.verified, targetsMarket };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
