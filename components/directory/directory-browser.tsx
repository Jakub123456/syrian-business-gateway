"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EXPORTERS } from "@/lib/data/exporters";
import { INDUSTRIES, EXPORT_STAGES, GOVERNORATES, label, type Industry } from "@/lib/taxonomy";

export function DirectoryBrowser({
  locale,
  dict,
  initialSector = "",
}: {
  locale: Locale;
  dict: Dictionary;
  initialSector?: Industry | "";
}) {
  const d = dict.directory;
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<Industry | "">(initialSector);
  const [stage, setStage] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const govLabel = (key: string) => {
    const g = GOVERNORATES.find((x) => x.key === key);
    return g ? label(g, locale) : key;
  };
  const stageLabel = (key: string) => {
    const s = EXPORT_STAGES.find((x) => x.key === key);
    return s ? label(s, locale) : key;
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return EXPORTERS.filter((ex) => {
      if (verifiedOnly && !ex.verified) return false;
      if (sector && !ex.sectors.includes(sector)) return false;
      if (stage && ex.exportStage !== stage) return false;
      if (needle) {
        const hay = [
          ex.nameEn, ex.nameAr,
          ...ex.products.flatMap((p) => [p.nameEn, p.nameAr]),
        ].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, sector, stage, verifiedOnly]);

  const inputClass =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={d.searchPlaceholder}
          className={`${inputClass} min-w-56 flex-1`}
        />
        <select value={sector} onChange={(e) => setSector(e.target.value as Industry | "")} className={inputClass}>
          <option value="">{d.filterSector}: {dict.common.all}</option>
          {INDUSTRIES.map((i) => (
            <option key={i.key} value={i.key}>{label(i, locale)}</option>
          ))}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className={inputClass}>
          <option value="">{d.filterStage}: {dict.common.all}</option>
          {EXPORT_STAGES.map((s) => (
            <option key={s.key} value={s.key}>{label(s, locale)}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4" />
          {d.filterVerified}
        </label>
      </div>

      <p className="mt-4 text-sm text-muted">{results.length} {d.results}</p>

      {results.length === 0 ? (
        <p className="mt-10 text-center text-muted">{d.noResults}</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((ex) => (
            <Link
              key={ex.id}
              href={`/${locale}/directory/${ex.id}`}
              className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-brand-800">{locale === "ar" ? ex.nameAr : ex.nameEn}</h3>
                {ex.verified && (
                  <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    ✓ {dict.common.verified}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">{govLabel(ex.governorate)} · {stageLabel(ex.exportStage)}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{locale === "ar" ? ex.descriptionAr : ex.descriptionEn}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ex.sectors.map((s) => {
                  const i = INDUSTRIES.find((x) => x.key === s)!;
                  return (
                    <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                      {label(i, locale)}
                    </span>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
