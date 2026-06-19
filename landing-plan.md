# Landing Page Improvement — Implementation Plan

Engineering plan distilled from the content strategy. Goal: turn the hero + 3 cards into a
~6-section, audience-split landing that (1) drops all AI/overpromise language, (2) maps every
claim to a live feature, and (3) reads equally well in EN + AR/RTL.

**Scope:** copy + page structure only. **No new routes** (links to existing `/directory`,
`/requests`, `/register`). All strings get EN + AR keys from day one.

---

## 0. Guardrails (apply throughout)

- **No buzzwords:** AI, auto-generate, smart, seamless, leverage, revolutionary, disruptive.
- **No automated "matching" claims** until `/dashboard/matches` exists — frame as *browse
  suppliers* + *see demand* + *connect directly*.
- **No invented statistics.** Concrete nouns over abstractions (olive oil, certifications,
  Germany, export license).
- Every section is a **server component** where possible (SEO); the only interactivity is
  links — keep it static and fast.

---

## 1. Target structure (page.tsx → ~6 sections)

| # | Section | Component | Server/Client | Data |
|---|---|---|---|---|
| 1 | **Hero** (neutral, dual CTA) | inline in `page.tsx` | server | — |
| 2 | **Audience split** (exporter \| importer) | `components/home/audience-split.tsx` | server | dict |
| 3 | **Product proof** (sectors + sample suppliers + demand teaser) | `components/home/proof-strip.tsx` | server | `INDUSTRIES`, `EXPORTERS` slice, optional live count |
| 4 | **How it works** (3 steps × 2 roles) | `components/home/how-it-works.tsx` | server | dict |
| 5 | **Why Syria** (category story) | inline | server | — |
| 6 | **Trust + final CTA** | inline | server | dict |

Extract 2–4 as components only because they're sizable; hero/why/final stay inline in
`page.tsx`. No new client components needed (sector chips and sample cards are `<Link>`s).

---

## 2. i18n key plan (`messages/en.json` → `home.*`, mirror in `ar.json`)

**Replace** the flat `feature*` keys; **keep** `kicker`, `registerExporter`, `registerImporter`.
Proposed EN copy below — AR mirrors each (same structure; keep brand `البوابة السورية للأعمال`,
don't literally translate "gateway").

### Hero
| key | EN |
|---|---|
| `home.kicker` | Syrian Business Gateway — Beta *(unchanged)* |
| `home.h1` | Connecting Syrian producers with global buyers |
| `home.subtitle` | The structured B2B gateway for Syrian export: list your company, check market readiness, and match supply with demand — in English and Arabic. |
| `home.ctaDirectory` | Browse Exporter Directory |
| `home.ctaRequests` | View open import requests |

*(`registerExporter` / `registerImporter` reused for the two primary CTAs.)*
**Retire** `home.title` ("Connecting Syrian Excellence…") from the H1 — optionally keep the
string for a secondary tagline / metadata.

### Audience split
| key | EN |
|---|---|
| `home.exporterHeading` | For Syrian producers |
| `home.exporterLead` | You have the products. We help the right buyers find you. |
| `home.exporterB1` | List products, certifications, and capacity in the public directory |
| `home.exporterB2` | Score export readiness for Germany, the UAE, and 35 other markets |
| `home.exporterB3` | See live import requests from buyers in your sector |
| `home.exporterCta` | Start exporter registration |
| `home.importerHeading` | For global buyers |
| `home.importerLead` | Source from Syria with profiles you can actually evaluate. |
| `home.importerB1` | Search exporters by sector, location, and certification |
| `home.importerB2` | Post sourcing requests with specs and quantities |
| `home.importerB3` | Connect directly with reviewed Syrian companies |
| `home.importerCta` | Start importer registration |

### Product proof
| key | EN |
|---|---|
| `home.sectorsHeading` | Explore by sector |
| `home.suppliersHeading` | Featured suppliers |
| `home.demandHeading` | Real buyer demand |
| `home.demandBody` | See what international buyers are sourcing right now. |
| `home.demandCta` | View import requests |
| `home.openRequests` | `{count} open requests` (interpolated; falls back to `View import requests` when count unavailable) |

### How it works
| key | EN |
|---|---|
| `home.howHeading` | How it works |
| `home.howExporterTitle` | For exporters |
| `home.howExporter1` | Create your company profile (3-step wizard) |
| `home.howExporter2` | Check readiness for your target markets |
| `home.howExporter3` | Connect when buyers match your offer |
| `home.howImporterTitle` | For importers |
| `home.howImporter1` | Tell us your market and categories |
| `home.howImporter2` | Browse the directory or post a request |
| `home.howImporter3` | Review exporter profiles and reach out |

### Why Syria + Trust + Final
| key | EN |
|---|---|
| `home.whyHeading` | World-class Syrian products |
| `home.whyBody` | Syrian producers excel in olive oil and agriculture, Damascus rose and natural cosmetics, handwoven textiles and artisanal crafts, with growing food-processing capacity. SBG brings these suppliers into one searchable gateway. |
| `home.trustHeading` | Built for real trade |
| `home.trustBeta` | We're in beta — profiles are reviewed manually and features expand regularly. |
| `home.trustBilingual` | Full English and Arabic support, including right-to-left layout. |
| `home.finalHeading` | Ready to trade? |
| `home.finalBody` | Register in minutes, save your progress, and resume anytime. |
| `home.finalCta` | Get Started *(reuse `nav.getStarted`)* |

### Replace the three current feature cards (if kept anywhere) / metadata
| key | Current | Proposed |
|---|---|---|
| `home.feature1Title/Body` | Matchmaking / "We pair…" | **Real buyer demand** / "Browse open import requests and connect with buyers posting specs in your sector." |
| `home.feature2Title/Body` | Readiness scoring / … | **Market readiness** / "See how your certifications and documentation stack up against each target market's requirements." |
| `home.feature3Title/Body` | Development plans / "auto-generated…" | **Clear next steps** / "Get a prioritized list of what to fix — certifications, documents, standards — before your next export deal." |
| `layout.tsx` `metadata.description` | "AI-powered B2B platform…" | "B2B gateway connecting Syrian exporters with global buyers." |
| `readiness.poweredByAI` | "AI-assisted" | "Detailed assessment" *(softens the public-facing badge)* |

---

## 3. Data wiring

- **Sector chips** → `INDUSTRIES` from `lib/taxonomy.ts`, rendered as `<Link>` chips
  (horizontal-scroll on mobile). Target: `/directory?sector=<KEY>` — **requires** the
  directory change in §4.
- **Sample suppliers** → 3 from `lib/data/exporters.ts`
  (`al-nour-olive-oil`, `damascus-rose`, `aleppo-soap-house`), each a compact card linking to
  `/directory/<id>`. Reuse the directory card visual or a slim variant.
- **Live demand count** (optional) → in `page.tsx` (server),
  `db.demandRequest.count({ where: { status: "OPEN" } })` wrapped in `try/catch`; on failure
  fall back to the no-count CTA. Keeps the landing resilient if the DB is unreachable.

---

## 4. Required supporting change — directory deep-link

`DirectoryBrowser` filters with local `useState` only; `/directory?sector=X` will **not**
pre-filter today. To make sector chips deep-link:

- Initialize `sector` (and optionally `q`) from `useSearchParams()` on mount, OR pass an
  optional `initialSector` prop from the directory page (which reads `searchParams`).
- Small, isolated change; **flagged decision** below if you'd rather skip it.

---

## 5. Visual notes (within existing tokens)

- Keep the sage hero gradient. **Hero visual:** a lightweight static mock — two stacked
  mini-cards (an exporter profile + an import request) — beside the copy. (Reusing the
  interactive `syria-map` in the hero is possible but heavier; recommend the mock.)
- Audience cards mirror the **register page** pattern: brand-green for exporter, clay for
  importer. Reuse `Icon` (`factory` / `globe`).
- Sector chips: emoji dropped already → use plain text chips (consistent with the rest).
- No dark mode.

---

## 6. Sequencing (pick one to start)

- **Phase A — copy-only (≈30 min, biggest immediate win):** update `home.subtitle`, the three
  feature cards, `layout.tsx` metadata, and `readiness.poweredByAI`. Removes every AI buzzword
  with zero structural risk. Ships the "no overpromise" goal on its own.
- **Phase B — full structure:** add sections 2–6 + new `home.*` keys (EN+AR) + data wiring +
  the directory deep-link (§4) + optional live count. Extract the 3 section components.

Recommend **A then B** (A is independently shippable).

---

## 7. Flagged decisions (need a yes/no before Phase B)

1. **Sector chip deep-linking** — add `?sector=` support to the directory (recommended), or
   link chips to plain `/directory`?
2. **Live request count on the hero/proof strip** — query the DB with graceful fallback
   (recommended), or a static "View import requests" link?
3. **Hero visual** — static stacked mini-cards mock (recommended), reuse the Syria map, or keep
   the current clean gradient with no visual?
4. **Old tagline** "Connecting Syrian Excellence to Global Markets" — retire, or keep as a
   secondary tagline / metadata line?

---

## 8. Out of scope

- New routes or pages (About/Terms/Privacy are separate work).
- Any automated-matching product or `/dashboard/matches`.
- Invented metrics, testimonials, or logos.
- Real photography (map + cards suffice for beta).

## 9. Success criteria

- A visitor knows within ~5s whether SBG is for them (exporter vs importer).
- Zero AI buzzwords on the public landing page.
- Every claim maps to a live feature or an honest beta disclaimer.
- Copy works equally in EN and AR (RTL verified).
