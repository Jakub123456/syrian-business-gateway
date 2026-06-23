"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Locale } from "@/lib/i18n/config";
import { GOVERNORATE_COORDS } from "@/lib/data/syria-geo";
import { label } from "@/lib/taxonomy";
import type { Exporter } from "@/lib/data/exporters";
import type { GOVERNORATES } from "@/lib/taxonomy";

type Gov = (typeof GOVERNORATES)[number];
export type MapGroup = { gov: Gov; list: Exporter[] };

// OpenStreetMap tile map (no API key). Count pins per governorate; popup lists that
// governorate's exporters with profile links.
function countPin(count: number, max: number): L.DivIcon {
  const s = Math.round(28 + (count / max) * 16);
  return L.divIcon({
    className: "",
    html: `<div style="width:${s}px;height:${s}px;background:#4a6b4f;color:#fff;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font:600 12px/1 system-ui,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.35)">${count}</div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -s / 2],
  });
}

export default function LeafletMap({
  groups,
  maxCount,
  locale,
  setHovered,
}: {
  groups: MapGroup[];
  maxCount: number;
  locale: Locale;
  setHovered: (k: string | null) => void;
}) {
  return (
    <MapContainer
      center={[35.0, 38.5]}
      zoom={6}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-xl"
      style={{ background: "var(--color-brand-50)" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {groups.map(({ gov, list }) => {
        const c = GOVERNORATE_COORDS[gov.key];
        return (
          <Marker
            key={gov.key}
            position={[c.lat, c.lng]}
            icon={countPin(list.length, maxCount)}
            eventHandlers={{
              mouseover: () => setHovered(gov.key),
              mouseout: () => setHovered(null),
            }}
          >
            <Popup>
              <p className="font-semibold text-brand-800">{label(gov, locale)}</p>
              <div className="mt-1 flex flex-col gap-0.5">
                {list.map((e) => (
                  <a key={e.id} href={`/${locale}/directory/${e.id}`} className="text-brand-700 hover:underline">
                    {locale === "ar" ? e.nameAr : e.nameEn}
                  </a>
                ))}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
