// Approximate governorate centroids (lat/lng) for the exporter map markers.

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
