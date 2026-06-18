"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { COUNTRIES } from "@/lib/data/countries";
import { REGIONS, TRADE_BLOCS, INDUSTRIES, label, type Region, type TradeBloc } from "@/lib/taxonomy";

const industryLabel = (key: string, locale: Locale) => {
  const i = INDUSTRIES.find((x) => x.key === key);
  return i ? label(i, locale) : key;
};

export function ExplorerBrowser({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const e = dict.explorer;
  const [bloc, setBloc] = useState<TradeBloc | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const byBloc = useMemo(
    () => (bloc ? COUNTRIES.filter((c) => c.tradeBlocs.includes(bloc)) : COUNTRIES),
    [bloc],
  );

  const regionCounts = useMemo(() => {
    const m = new Map<Region, number>();
    for (const c of byBloc) m.set(c.region, (m.get(c.region) ?? 0) + 1);
    return m;
  }, [byBloc]);

  const visibleCountries = region ? byBloc.filter((c) => c.region === region) : [];

  return (
    <div>
      {/* Bloc filter bar */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={bloc === null} onClick={() => setBloc(null)}>
          {e.allCountries} ({COUNTRIES.length})
        </FilterChip>
        {TRADE_BLOCS.map((b) => (
          <FilterChip key={b.key} active={bloc === b.key} onClick={() => { setBloc(b.key); setRegion(null); }}>
            {label(b, locale)}
          </FilterChip>
        ))}
      </div>

      {!region ? (
        <>
          <h2 className="mt-10 text-xl font-semibold text-brand-900">{e.selectRegion}</h2>
          <p className="mt-1 text-sm text-muted">{e.selectRegionHint}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r) => {
              const count = regionCounts.get(r.key) ?? 0;
              return (
                <button
                  key={r.key}
                  type="button"
                  disabled={count === 0}
                  onClick={() => setRegion(r.key)}
                  className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 text-start shadow-sm transition hover:border-brand-300 hover:shadow disabled:opacity-40 disabled:hover:border-line"
                >
                  <span className="text-3xl" aria-hidden>{r.icon}</span>
                  <span>
                    <span className="block font-semibold text-brand-800">{label(r, locale)}</span>
                    <span className="block text-sm text-muted">{count} {e.countries}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setRegion(null)}
            className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
          >
            <span className="flip-rtl">←</span> {e.selectRegion}
          </button>
          <h2 className="mt-3 text-xl font-semibold text-brand-900">
            {label(REGIONS.find((r) => r.key === region)!, locale)} · {visibleCountries.length} {e.countries}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCountries.map((c) => (
              <Link
                key={c.iso2}
                href={`/${locale}/explorer/${c.iso2.toLowerCase()}`}
                className="rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>{c.flag}</span>
                  <span className="font-semibold text-brand-800">{locale === "ar" ? c.nameAr : c.nameEn}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{locale === "ar" ? c.summaryAr : c.summaryEn}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.topImports.slice(0, 3).map((imp) => (
                    <span key={imp} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                      {industryLabel(imp, locale)}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active ? "border-brand-600 bg-brand-600 font-medium text-white" : "border-line bg-surface text-muted hover:border-brand-300"
      }`}
    >
      {children}
    </button>
  );
}
