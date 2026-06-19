"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EXPORTERS } from "@/lib/data/exporters";
import { GOVERNORATES, label } from "@/lib/taxonomy";
import { MAP_W, MAP_H, GOVERNORATE_COORDS, project, borderPath } from "@/lib/data/syria-geo";

export function SyriaMap({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const d = dict.directory;
  const [hovered, setHovered] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      GOVERNORATES.map((g) => ({ gov: g, list: EXPORTERS.filter((e) => e.governorate === g.key) }))
        .filter((x) => x.list.length > 0)
        .sort((a, b) => b.list.length - a.list.length),
    [],
  );
  const maxCount = Math.max(1, ...groups.map((g) => g.list.length));
  const path = borderPath();

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-brand-900">{d.mapTitle}</h2>
      <p className="mt-1 text-sm text-muted">{d.mapSubtitle}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Map */}
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" role="img" aria-label={d.mapTitle}>
          <path d={path} fill="var(--color-brand-50)" stroke="var(--color-brand-200)" strokeWidth={1.5} />
          {groups.map(({ gov, list }) => {
            const { x, y } = project(GOVERNORATE_COORDS[gov.key]);
            const r = 9 + (list.length / maxCount) * 13;
            const active = hovered === gov.key;
            return (
              <g
                key={gov.key}
                onMouseEnter={() => setHovered(gov.key)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                <circle cx={x} cy={y} r={r + 5} fill="var(--color-brand-500)" opacity={active ? 0.18 : 0} />
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={active ? "var(--color-brand-700)" : "var(--color-brand-600)"}
                  stroke="white"
                  strokeWidth={2}
                />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill="white">
                  {list.length}
                </text>
                {active && (
                  <text x={x} y={y - r - 8} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--color-brand-800)">
                    {label(gov, locale)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend / list */}
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
                  <Link
                    key={e.id}
                    href={`/${locale}/directory/${e.id}`}
                    className="text-sm text-brand-700 hover:underline"
                  >
                    {locale === "ar" ? e.nameAr : e.nameEn}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
