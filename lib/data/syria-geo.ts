// Lightweight geo data for the exporter map: approximate governorate centroids and a
// simplified Syria border, both in lat/lng. A shared projection maps them into the same
// SVG space so markers sit inside the outline. Stylised, not survey-accurate.

export const GOVERNORATE_COORDS: Record<string, { lat: number; lng: number }> = {
  DAMASCUS: { lat: 33.51, lng: 36.29 },
  RIF_DIMASHQ: { lat: 33.55, lng: 36.78 },
  ALEPPO: { lat: 36.2, lng: 37.16 },
  HOMS: { lat: 34.73, lng: 37.3 },
  HAMA: { lat: 35.13, lng: 36.9 },
  LATAKIA: { lat: 35.52, lng: 35.79 },
  TARTUS: { lat: 34.89, lng: 35.92 },
  IDLIB: { lat: 35.93, lng: 36.63 },
  DARAA: { lat: 32.62, lng: 36.1 },
  AS_SUWAYDA: { lat: 32.71, lng: 36.57 },
  QUNEITRA: { lat: 33.07, lng: 35.86 },
  DEIR_EZ_ZOR: { lat: 35.34, lng: 40.14 },
  AL_HASAKAH: { lat: 36.4, lng: 40.75 },
  RAQQA: { lat: 35.95, lng: 39.01 },
};

// Simplified Syria boundary, clockwise from the north-west coast.
export const SYRIA_BORDER: { lat: number; lng: number }[] = [
  { lat: 35.92, lng: 35.8 },
  { lat: 36.6, lng: 36.15 },
  { lat: 36.7, lng: 37.1 },
  { lat: 36.85, lng: 38.1 },
  { lat: 37.08, lng: 40.2 },
  { lat: 37.3, lng: 42.05 },
  { lat: 35.9, lng: 41.35 },
  { lat: 34.45, lng: 40.95 },
  { lat: 33.38, lng: 38.78 },
  { lat: 32.35, lng: 37.0 },
  { lat: 32.7, lng: 36.02 },
  { lat: 33.05, lng: 35.72 },
  { lat: 33.62, lng: 35.95 },
  { lat: 34.55, lng: 36.42 },
  { lat: 34.62, lng: 35.95 },
  { lat: 35.1, lng: 35.85 },
];

export const MAP_W = 560;
export const MAP_H = 520;
const PAD = 24;
const MIN_LNG = 35.4;
const MAX_LNG = 42.3;
const MIN_LAT = 32.1;
const MAX_LAT = 37.5;

export function project({ lat, lng }: { lat: number; lng: number }): { x: number; y: number } {
  const x = PAD + ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (MAP_W - 2 * PAD);
  const y = PAD + ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (MAP_H - 2 * PAD);
  return { x, y };
}

export function borderPath(): string {
  return (
    SYRIA_BORDER.map((p, i) => {
      const { x, y } = project(p);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") + " Z"
  );
}
