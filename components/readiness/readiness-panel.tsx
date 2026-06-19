"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { computeReadiness, compareReadiness, type ReadinessResponse, type MarketScore } from "@/lib/readiness/actions";
import type { ReadinessResult } from "@/lib/readiness/rubric";
import { Icon } from "@/components/icon";

export type Market = { iso2: string; name: string; flag: string };

const BAND_COLOR: Record<string, string> = {
  high: "text-brand-600",
  medium: "text-gold-500",
  low: "text-red-500",
};
const BAND_RING: Record<string, string> = {
  high: "border-brand-500",
  medium: "border-gold-400",
  low: "border-red-400",
};

export function ReadinessPanel({
  locale,
  dict,
  markets,
}: {
  locale: Locale;
  dict: Dictionary;
  markets: Market[];
}) {
  const r = dict.readiness;
  const [target, setTarget] = useState(markets[0]?.iso2 ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Extract<ReadinessResponse, { ok: true }> | null>(null);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<MarketScore[] | null>(null);

  async function run() {
    if (!target) return;
    setLoading(true);
    setError("");
    const res = await computeReadiness(target);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setData(res);
  }

  async function compare() {
    setComparing(true);
    setError("");
    const res = await compareReadiness();
    setComparing(false);
    if (!res.ok) return setError(res.error);
    setComparison(res.markets);
  }

  const bandLabel = (band: ReadinessResult["band"]) =>
    band === "high" ? r.bandHigh : band === "medium" ? r.bandMedium : r.bandLow;
  const barColor = (band: string) => (band === "high" ? "bg-brand-500" : band === "medium" ? "bg-gold-400" : "bg-red-400");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-5 print:hidden">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-800">{r.selectMarket}</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          >
            {markets.map((m) => (
              <option key={m.iso2} value={m.iso2}>{m.flag} {m.name}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={run}
          disabled={loading || !target}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? r.running : r.run}
        </button>
        <button
          type="button"
          onClick={compare}
          disabled={comparing}
          className="rounded-lg border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
        >
          {comparing ? r.comparing : r.compare}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 print:hidden">{error}</p>}

      {/* VAS: multi-market comparison */}
      {comparison && comparison.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-6 print:hidden">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{r.compareTitle}</h3>
          <p className="mt-1 text-sm text-muted">{r.compareHint}</p>
          <div className="mt-4 space-y-3">
            {comparison.map((m, i) => (
              <button
                key={m.iso2}
                type="button"
                onClick={() => { setTarget(m.iso2); }}
                className="block w-full text-start"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-800">
                    {m.flag} {locale === "ar" ? m.nameAr : m.nameEn}
                    {i === 0 && <span className="ms-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{r.bestFit}</span>}
                  </span>
                  <span className={`font-semibold ${BAND_COLOR[m.band]}`}>{m.score}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-canvas">
                  <div className={`h-full rounded-full ${barColor(m.band)}`} style={{ width: `${m.score}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Print-only report header */}
          <div className="hidden print:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{dict.brand}</p>
            <h2 className="text-xl font-bold text-brand-900">{r.reportTitle} — {data.countryNameEn}</h2>
            <p className="text-sm text-muted">{r.generatedOn} {new Date().toLocaleDateString(locale === "ar" ? "ar" : "en")}</p>
          </div>
          <div className="flex justify-end print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              {r.printReport}
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
          {/* Score gauge */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface p-6">
            <div className={`flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 ${BAND_RING[data.result.band]}`}>
              <span className={`text-4xl font-bold ${BAND_COLOR[data.result.band]}`}>{data.result.score}</span>
              <span className="text-xs text-muted">{r.scoreOutOf}</span>
            </div>
            <p className={`mt-4 text-lg font-semibold ${BAND_COLOR[data.result.band]}`}>{bandLabel(data.result.band)}</p>
            <p className="text-sm text-muted">{data.countryNameEn}</p>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{r.breakdown}</h3>
            <div className="mt-4 space-y-3">
              {data.result.dimensions.map((d) => {
                const pct = Math.round((d.earned / d.max) * 100);
                return (
                  <div key={d.key}>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-800">{locale === "ar" ? d.labelAr : d.labelEn}</span>
                      <span className="text-muted">{d.earned} / {d.max}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div
                        className={`h-full rounded-full ${pct >= 75 ? "bg-brand-500" : pct >= 50 ? "bg-gold-400" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment + gaps */}
          <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{r.assessment}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${data.narrative.source === "ai" ? "bg-brand-100 text-brand-700" : "bg-canvas text-muted"}`}>
                {data.narrative.source === "ai" ? (
                  <>
                    <Icon name="sparkles" className="h-3.5 w-3.5" />
                    {r.poweredByAI}
                  </>
                ) : (
                  r.ruleBased
                )}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink">{data.narrative.text}</p>

            {data.result.topGaps.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-brand-800">{r.gaps}</h4>
                <ol className="mt-2 space-y-2">
                  {data.result.topGaps.map((g, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-xs font-semibold text-gold-600">{i + 1}</span>
                      {g}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
