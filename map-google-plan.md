# Plan — Rebuild the exporter map on Google Maps

Replace the inline-SVG Syria map (`components/directory/syria-map.tsx`) with a real
interactive Google Map, while keeping the same behaviour: exporters plotted by governorate,
a synced legend, and links to each exporter's profile.

## Current state (what we're replacing)

- `components/directory/syria-map.tsx` — client component. Aggregates `EXPORTERS` by
  governorate; draws an SVG Syria outline + count markers; hover syncs marker ↔ legend;
  legend lists exporters as `<Link>`s to `/directory/[id]`. Props: `{ locale, dict }`.
- `lib/data/syria-geo.ts` — `GOVERNORATE_COORDS` (real lat/lng ✅), plus SVG-only
  `SYRIA_BORDER` / `project()` / `borderPath()` / `MAP_W/H` (become unused).
- Used once: `app/[locale]/directory/page.tsx`.
- No Google Maps dependency or key today.

**Carries over unchanged:** `GOVERNORATE_COORDS` (lat/lng) feed Google markers directly.
**Dropped:** the SVG border + projection helpers.

---

## ⚠️ Prerequisite (hard external dependency)

Google Maps JavaScript API requires:
1. A **Google Cloud project** with **billing enabled** (free $200/mo credit; map loads are
   metered after that).
2. **Maps JavaScript API** enabled.
3. An **API key**, restricted by **HTTP referrer** (your domains) — the key is exposed in
   the browser by design; referrer restriction is the security control, not secrecy.
4. For custom-styled maps + Advanced Markers: a **Map ID** (cloud-based styling).

Env vars (client-side → must be `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` (only if we use Advanced Markers / cloud styling)

Set locally in `.env.local` and in Vercel (Production + Preview). No key → the component
falls back (see Decision 2).

---

## Library

**`@vis.gl/react-google-maps`** (maintained by Google's vis.gl team; first-class React 19 /
App Router support; `APIProvider`, `Map`, `AdvancedMarker`, `InfoWindow`, `useMap`). One
dependency, script loaded client-side. *(Alternative: `@react-google-maps/api` — older,
heavier API. Recommend vis.gl.)*

---

## Component design (`syria-map.tsx` rewrite)

Same props `{ locale, dict }`, same outer card + heading + legend. Replace the SVG block:

```
<APIProvider apiKey={KEY}>
  <Map defaultCenter={{lat:35.0,lng:38.5}} defaultZoom={6} mapId={MAP_ID}
       gestureHandling="cooperative" disableDefaultUI className="h-[420px] rounded-xl">
    {groups.map(({gov,list}) => (
      <AdvancedMarker position={GOVERNORATE_COORDS[gov.key]}
        onMouseEnter={()=>setHovered(gov.key)} onClick={()=>setHovered(gov.key)}>
        <CountPin count={list.length} active={hovered===gov.key} />
      </AdvancedMarker>
    ))}
    {hovered && <InfoWindow .../>}   // optional, see Decision 4
  </Map>
</APIProvider>
```

- **Markers:** `AdvancedMarker` with a custom HTML pin (sage circle + count) — needs
  `mapId`. Size/intensity by `list.length` as today.
- **Center/zoom:** Syria (~35.0, 38.5, z6); `gestureHandling: "cooperative"` so page scroll
  isn't hijacked; trim default UI.
- **Legend:** keep the existing right-column list (governorate + count + exporter links);
  keep the hover ↔ marker sync via shared `hovered` state (`useMap` to pan/emphasise).
- **Optional Syria outline:** reuse `SYRIA_BORDER` as a faint `Polygon` overlay (keeps the
  "this is Syria" framing). Otherwise the basemap suffices.

Keep it a **client component**; lazy-loaded by the directory page (already client-heavy).

---

## Decisions to confirm before building

1. **Library** — `@vis.gl/react-google-maps` (recommended) vs `@react-google-maps/api`.
2. **No-key fallback** — when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is absent (local dev, or
   before you set up billing):
   a. **Keep the current SVG map as the fallback** (best UX, more code to retain), or
   b. **Legend-only** (drop the SVG; show just the governorate list), or
   c. **Require the key** (map area shows a "configure maps" notice).
   *Recommend (a)* — zero-regression and works offline.
3. **Theming** — **cloud Map ID styled** to the sage palette (needs a Map ID; nicer) vs
   **default Google basemap** (simplest, no Map ID). *Recommend default basemap first,
   style later.*
4. **Marker interaction** — keep **side legend + hover sync** (as today) vs **InfoWindow
   popups** on marker click listing that governorate's exporters with links vs **both**.
   *Recommend: keep legend, add InfoWindow on click.*
5. **Syria outline polygon** — draw it from `SYRIA_BORDER` (subtle border) vs basemap only.

---

## Implementation steps (once decisions are set)

1. `npm i @vis.gl/react-google-maps`.
2. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (+ `MAP_ID` if theming) to `.env.example`,
   `.env.local`, and Vercel.
3. Rewrite `components/directory/syria-map.tsx`: `APIProvider`+`Map`+`AdvancedMarker`,
   reuse `GOVERNORATE_COORDS`, keep legend + hover sync, add key-absent fallback (Decision 2).
4. Trim `lib/data/syria-geo.ts`: keep `GOVERNORATE_COORDS` (+ `SYRIA_BORDER` if Decision 5);
   remove `project()`/`borderPath()`/`MAP_W/H` if the SVG fallback is dropped.
5. Build + lint; verify the directory renders with the map (needs a key locally — or test
   the fallback path with the key unset).

---

## Trade-offs / notes

- **Cost & third-party scripts:** every directory view loads Google's Maps JS and counts as
  a map load (billable beyond the free credit). The current SVG is free and dependency-free.
- **Advanced Markers require a Map ID**; with a Map ID, inline `styles` are ignored (styling
  is cloud-based). If we skip Map ID, use classic `Marker` (no custom HTML pin, simpler).
- **A11y/SEO:** the SVG map was crawlable/lightweight; Google Maps is an interactive canvas —
  the legend (real links) remains the SEO/accessible surface, so keep it.
- **Privacy:** loads Google third-party scripts; note for any cookie/consent policy.

## Out of scope
Geocoding/search, clustering (only ~5 markers), directions, Street View, drawing tools.
