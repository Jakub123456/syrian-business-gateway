import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Country } from "@/lib/data/countries";
import type { ReadinessResult } from "./rubric";
import { explainDeterministic } from "./explain";

// LLM narrative layer (plan.md §9). Claude explains and prioritises the deterministic
// rubric output — it never produces or changes the score. Falls back to the deterministic
// explanation whenever no API key is configured or the call fails, so readiness scoring
// always works offline.

// Default to the latest Claude model; override via env if needed.
const MODEL = process.env.READINESS_MODEL || "claude-opus-4-8";

const NarrativeSchema = z.object({
  summary: z.string().describe("2–3 sentence plain-language assessment of export readiness for this market"),
  prioritizedActions: z
    .array(z.string())
    .max(5)
    .describe("Ordered, specific actions to close the gap, most impactful first"),
});

export type Narrative = {
  text: string;
  source: "rules" | "ai";
  model: string | null;
};

export async function generateNarrative(
  result: ReadinessResult,
  country: Country,
  companyName: string,
): Promise<Narrative> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { text: explainDeterministic(result, country), source: "rules", model: null };
  }

  try {
    const client = new Anthropic({ apiKey });
    const prompt = [
      `You are an export-readiness advisor for Syrian exporters. A deterministic rubric has already scored this company; do not change the score — explain it and prioritise the gaps.`,
      ``,
      `Company: ${companyName}`,
      `Target market: ${country.nameEn}`,
      `Overall score: ${result.score}/100 (${result.band})`,
      ``,
      `Dimension breakdown:`,
      ...result.dimensions.map((d) => `- ${d.labelEn}: ${d.earned}/${d.max} — ${d.summaryEn}${d.gaps.length ? ` (gaps: ${d.gaps.join("; ")})` : ""}`),
      ``,
      `Country import requirements: ${JSON.stringify(country.requirements)}`,
      ``,
      `Write a concise assessment and an ordered list of the most impactful actions to improve readiness.`,
    ].join("\n");

    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      output_config: { format: zodOutputFormat(NarrativeSchema) },
      messages: [{ role: "user", content: prompt }],
    });

    const parsed = response.parsed_output;
    if (!parsed) return { text: explainDeterministic(result, country), source: "rules", model: null };

    const actions = parsed.prioritizedActions.map((a, i) => `${i + 1}. ${a}`).join(" ");
    return { text: `${parsed.summary} ${actions}`.trim(), source: "ai", model: MODEL };
  } catch {
    // Any API failure (rate limit, refusal, network) → deterministic explanation.
    return { text: explainDeterministic(result, country), source: "rules", model: null };
  }
}
