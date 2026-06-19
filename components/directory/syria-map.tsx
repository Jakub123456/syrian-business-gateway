"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { EXPORTERS, type Exporter } from "@/lib/data/exporters";
import { GOVERNORATES, label } from "@/lib/taxonomy";
import { MAP_W, MAP_H, GOVERNORATE_COORDS, project, borderPath } from "@/lib/data/syria-geo";

// Google Maps renders when both env vars are set; otherwise the dependency-free SVG map is
// the fallback (local dev / before billing). Both are NEXT_PUBLIC_ (client-side, inlined).
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
const SYRIA_CENTER = { lat: 35.0, lng: 38.5 };

type Gov = (typeof GOVERNORATES)[number];
type Group = { gov: Gov; list: Exporter[] };

export function SyriaMap({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const d = dict.directory;
  const [hovered, setHovered] = useState<string | null>(null);

  const groups: Group[] = useMemo(
    () =>
      GOVERNORATES.map((gov) => ({ gov, list: EXPORTERS.filter((e) => e.governorate === gov.key) }))
        .filter((x) => x.list.length > 0)
        .sort((a, b) => b.list.length - a.list.length),
    [],
  );
  const maxCount = Math.max(1, ...groups.map((g) => g.list.length));
  const useGoogle = !!API_KEY && !!MAP_ID;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-brand-900">{d.mapTitle}</h2>
      <p className="mt-1 text-sm text-muted">{d.mapSubtitle}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {useGoogle ? (
          <GoogleMapView
            groups={groups}
            maxCount={maxCount}
            hovered={hovered}
            setHovered={setHovered}
            locale={locale}
            apiKey={API_KEY!}
            mapId={MAP_ID!}
          />
        ) : (
          <SvgMapView groups={groups} maxCount={maxCount} hovered={hovered} setHovered={setHovered} locale={locale} ariaLabel={d.mapTitle} />
        )}

        <Legend groups={groups} hovered={hovered} setHovered={setHovered} locale={locale} dict={dict} />
      </div>
    </section>
  );
}

function GoogleMapView({
  groups,
  maxCount,
  hovered,
  setHovered,
  locale,
  apiKey,
  mapId,
}: {
  groups: Group[];
  maxCount: number;
  hovered: string | null;
  setHovered: (k: string | null) => void;
  locale: Locale;
  apiKey: string;
  mapId: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const open = groups.find((g) => g.gov.key === selected);

  return (
    <div className="h-[420px] overflow-hidden rounded-xl border border-line">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={SYRIA_CENTER}
          defaultZoom={6}
          mapId={mapId}
          gestureHandling="cooperative"
          disableDefaultUI
          className="h-full w-full"
        >
          {groups.map(({ gov, list }) => {
            const active = hovered === gov.key;
            const size = 26 + (list.length / maxCount) * 16;
            return (
              <AdvancedMarker key={gov.key} position={GOVERNORATE_COORDS[gov.key]} onClick={() => setSelected(gov.key)}>
                <div
                  onMouseEnter={() => setHovered(gov.key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ width: size, height: size }}
                  className={`flex items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-md transition ${active ? "bg-brand-700" : "bg-brand-600"}`}
                >
                  {list.length}
                </div>
              </AdvancedMarker>
            );
          })}

          {open && (
            <InfoWindow position={GOVERNORATE_COORDS[open.gov.key]} onCloseClick={() => setSelected(null)}>
              <div className="min-w-40">
                <p className="font-semibold text-brand-800">{label(open.gov, locale)}</p>
                <ul className="mt-1 space-y-0.5">
                  {open.list.map((e) => (
                    <li key={e.id}>
                      <a href={`/${locale}/directory/${e.id}`} className="text-sm text-brand-700 hover:underline">
                        {locale === "ar" ? e.nameAr : e.nameEn}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

function SvgMapView({
  groups,
  maxCount,
  hovered,
  setHovered,
  locale,
  ariaLabel,
}: {
  groups: Group[];
  maxCount: number;
  hovered: string | null;
  setHovered: (k: string | null) => void;
  locale: Locale;
  ariaLabel: string;
}) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      <path d={borderPath()} fill="var(--color-brand-50)" stroke="var(--color-brand-200)" strokeWidth={1.5} />
      {groups.map(({ gov, list }) => {
        const { x, y } = project(GOVERNORATE_COORDS[gov.key]);
        const r = 9 + (list.length / maxCount) * 13;
        const active = hovered === gov.key;
        return (
          <g key={gov.key} onMouseEnter={() => setHovered(gov.key)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
            <circle cx={x} cy={y} r={r + 5} fill="var(--color-brand-500)" opacity={active ? 0.18 : 0} />
            <circle cx={x} cy={y} r={r} fill={active ? "var(--color-brand-700)" : "var(--color-brand-600)"} stroke="white" strokeWidth={2} />
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
