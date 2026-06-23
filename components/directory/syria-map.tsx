"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Exporter } from "@/lib/data/exporters";
import { GOVERNORATES, label } from "@/lib/taxonomy";

// OpenStreetMap (Leaflet) tile map. Client-only — load without SSR.
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-xl bg-brand-50" />,
});

type Gov = (typeof GOVERNORATES)[number];
type Group = { gov: Gov; list: Exporter[] };

export function SyriaMap({ locale, dict, exporters }: { locale: Locale; dict: Dictionary; exporters: Exporter[] }) {
  const d = dict.directory;
  const [hovered, setHovered] = useState<string | null>(null);

  const groups: Group[] = useMemo(
    () =>
      GOVERNORATES.map((gov) => ({ gov, list: exporters.filter((e) => e.governorate === gov.key) }))
        .filter((x) => x.list.length > 0)
        .sort((a, b) => b.list.length - a.list.length),
    [exporters],
  );
  const maxCount = Math.max(1, ...groups.map((g) => g.list.length));

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-brand-900">{d.mapTitle}</h2>
      <p className="mt-1 text-sm text-muted">{d.mapSubtitle}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <LeafletMap groups={groups} maxCount={maxCount} locale={locale} setHovered={setHovered} />
        <Legend groups={groups} hovered={hovered} setHovered={setHovered} locale={locale} dict={dict} />
      </div>
    </section>
  );
}

function Legend({
  groups,
  hovered,
  setHovered,
  locale,
  dict,
}: {
  groups: Group[];
  hovered: string | null;
  setHovered: (k: string | null) => void;
  locale: Locale;
  dict: Dictionary;
}) {
  const d = dict.directory;
  return (
    <ul className="space-y-3">
      {groups.map(({ gov, list }) => (
        <li
          key={gov.key}
          onMouseEnter={() => setHovered(gov.key)}
          onMouseLeave={() => setHovered(null)}
          className={`rounded-xl border p-3 transition ${hovered === gov.key ? "border-brand-300 bg-brand-50" : "border-line"}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-brand-800">{label(gov, locale)}</span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {list.length} {d.results}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
            {list.map((e) => (
              <Link key={e.id} href={`/${locale}/directory/${e.id}`} className="text-sm text-brand-700 hover:underline">
                {locale === "ar" ? e.nameAr : e.nameEn}
              </Link>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
