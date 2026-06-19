"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { INDUSTRIES, label, type Industry } from "@/lib/taxonomy";

export type RequestItem = {
  id: string;
  title: string;
  category: Industry;
  description: string;
  quantity: string | null;
  importerName: string;
  countryLabel: string | null;
  flag: string | null;
  createdAt: string; // ISO
};

export function RequestsBrowser({
  locale,
  dict,
  items,
}: {
  locale: Locale;
  dict: Dictionary;
  items: RequestItem[];
}) {
  const q = dict.requests;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Industry | "">("");

  const categoryLabel = (key: string) => {
    const i = INDUSTRIES.find((x) => x.key === key);
    return i ? label(i, locale) : key;
  };

  const results = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((it) => {
      if (category && it.category !== category) return false;
      if (needle && !`${it.title} ${it.description}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [items, search, category]);

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "ar" ? "ar" : "en", { year: "numeric", month: "short", day: "numeric" });

  const inputClass =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={q.search}
          className={`${inputClass} min-w-56 flex-1`}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value as Industry | "")} className={inputClass}>
          <option value="">{q.filterCategory}: {dict.common.all}</option>
          {INDUSTRIES.map((i) => (
            <option key={i.key} value={i.key}>{label(i, locale)}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-muted">{results.length} {q.results}</p>

      {results.length === 0 ? (
        <p className="mt-10 text-center text-muted">{q.noResults}</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((it) => (
            <article key={it.id} className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {categoryLabel(it.category)}
                </span>
                <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-xs font-medium text-gold-600">{q.open}</span>
              </div>
              <h3 className="mt-3 font-semibold text-brand-800">{it.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{it.description}</p>
              <dl className="mt-4 space-y-1 text-xs text-muted">
                <div className="flex justify-between gap-2">
                  <dt>{q.postedBy}</dt>
                  <dd className="font-medium text-brand-700">{it.importerName}</dd>
                </div>
                {it.countryLabel && (
                  <div className="flex justify-between gap-2">
                    <dt>{q.market}</dt>
                    <dd className="text-ink">{it.flag ? `${it.flag} ` : ""}{it.countryLabel}</dd>
                  </div>
                )}
                {it.quantity && (
                  <div className="flex justify-between gap-2">
                    <dt>{q.quantity}</dt>
                    <dd className="text-ink">{it.quantity}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <dt>{q.posted}</dt>
                  <dd className="text-ink">{fmtDate(it.createdAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
