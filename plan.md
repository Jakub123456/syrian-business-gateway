# Syrian Business Gateway (SBG) — Build Plan

> AI-powered B2B platform matching Syrian exporters with global buyers, with a Global
> Market (Country) Explorer and auto-generated export-readiness development plans.

**Status:** Beta / greenfield · **Stack:** Next.js + Postgres · **AI:** phased (Phase 4)

> **Current state:** This is the original build plan; several choices evolved during
> implementation. Live deviations: dependency-free dictionary i18n (not next-intl);
> **Postgres on Neon** (not SQLite); hand-rolled **jose + bcrypt** auth (not Auth.js); the
> **Country Explorer was removed** (its data still powers registration markets + readiness);
> the exporter map uses **OpenStreetMap/Leaflet**; landing copy dropped AI/matchmaking
> language. See the root [README](./README.md) for the accurate, current feature set, and
> [docs/](./docs) for the other planning notes.

---

## 0. Key Decisions (and what was rejected)

| # | Decision | Why | Rejected alternative |
|---|---|---|---|
| D1 | **Next.js 15 App Router, single full-stack repo** (RSC + Route Handlers) | SEO matters for the public Directory + Country pages; one deploy, one auth context; Server Components keep the DB on the server | SPA + separate API (2 deploys, worse SEO); Pages Router (legacy) |
| D2 | **Postgres + Prisma, single relational DB** | Strongly relational (companies↔products↔countries↔requirements); Prisma enums map cleanly to the bloc/region/industry taxonomies | Mongo (relations are the whole app); Supabase RLS (we want app-layer authz, not row policies, for AI/match logic) |
| D3 | **`next-intl`, locale-prefixed routes, AR is first-class** | EN/AR with RTL is a launch requirement, not a nice-to-have; prefixing (`/ar/...`) gives clean SEO + shareable localized URLs | Client-only i18n (no SSR translations, bad SEO); cookie-only locale (not shareable) |
| D4 | **Bilingual *content* via paired columns** (`nameEn`/`nameAr`), not a translations table | Only 2 locales, mostly short fields; paired columns are simpler to query/sort and good enough | Generic `Translation` join table (overkill for 2 locales) |
| D5 | **Auth.js (NextAuth v5): email magic-link + password, role on the user** | Low-friction for non-technical SME exporters; role (`EXPORTER`/`IMPORTER`/`ADMIN`) drives the entire UX split | Clerk/Auth0 (cost, data residency questions under sanctions context); social-only (B2B users expect email) |
| D6 | **Readiness scoring = deterministic rules first, LLM second** | Scores must be explainable and stable to be trusted by SMEs and buyers; LLM only explains/prioritizes, never invents the number | LLM-only scoring (non-deterministic, unauditable) |
| D7 | **Country requirement data is editable content, not hardcoded** | The 37-country requirement set will change; needs an admin/seed pipeline, versioning | Hardcoding requirements in TS (unmaintainable) |
| D8 | **Postgres FTS for MVP search**, swap to Meilisearch only if needed | Avoids an extra service early; `tsvector` covers directory + country search at this scale | Meilisearch/Algolia from day 1 (premature infra) |

---

## 1. Product Overview

### Audiences & jobs-to-be-done
- **Syrian Exporter** — list products → get an export-readiness score for a target market → match with global importers → receive a tailored plan that closes the gap "deal by deal."
- **International Importer** — post demand requests → receive vetted offers → connect with exporters.
- **Anonymous visitor** — browse Country Explorer + Exporter Directory before signing up (both fully public, SEO-indexed).

### Top nav (from mockup)
`Home` · `Country Explorer` · `Exporter Directory` · `[🇸🇾 / عر language toggle]` · `Sign In` · `Get Started`

---

## 2. Scope

**MVP — Phases 0–3**
- Landing + role chooser
- Auth (magic-link + password), exporter & importer accounts
- Exporter wizard (3 steps) · Importer wizard (2 steps)
- Country Explorer: 37 countries, 7 regions, 8 bloc filters, per-country import requirements
- Exporter Directory: browse/search/filter + public profiles
- Full EN/AR + RTL
- Role-aware dashboard shell

**Phase 4 — AI & marketplace**
- Readiness scoring · AI matching · auto development plans · demand requests + offers · connections

**Phase 5 — Trust & admin**
- Verification/vetting · admin content console · notifications · analytics

**Explicitly out of scope (now):** payments/escrow, logistics/shipping, native mobile, real-time chat (use async messaging in P4).

---

## 3. Exact Onboarding Flows

> Mockup gives field names for Step 1 of each wizard; Steps 2–3 fields below are the
> proposed concrete fill-in. Every step validates with a Zod schema and **autosaves a
> draft `Company` row** so a refresh/return resumes (key UX choice for SME users).

### 3a. Exporter wizard — `/register/exporter` (3 steps)

**Step 1 — Company Info** *(exact from mockup)*
| Field | Required | Notes |
|---|---|---|
| Company Name (English) | ✅ | placeholder "e.g. Al-Nour Olive Oil Co." |
| Company Name (Arabic) | — | RTL input |
| Contact Email | ✅ | becomes login if no account yet |
| Phone Number | — | default `+963` |
| Website | — | URL |

**Step 2 — Details**
| Field | Required | Notes |
|---|---|---|
| Logo upload | — | R2/S3, ≤2 MB, image |
| Short description (EN/AR) | ✅ EN | shown on directory card |
| Governorate / City | ✅ | Syria location (enum of 14 governorates) |
| Sectors | ✅ | multi-select of the 9 industries (≥1) |
| Main products | ✅ | quick add: name + category (seeds `Product`) |
| Certifications held | — | multi: ISO 22000, HACCP, Halal, Organic, ISO 9001, CE, GlobalG.A.P., "Other" |
| Year established | — | int |
| Employees | — | bucket: 1–10 / 11–50 / 51–200 / 200+ |
| Production capacity | — | free text + unit |

**Step 3 — Export Stage**
| Field | Required | Notes |
|---|---|---|
| Export stage | ✅ | radio, enum `ExportStage` (below) |
| Currently exports to | — | country multi-select |
| Target markets | ✅ | country multi-select → drives readiness scoring later |
| Has export license | — | bool |

`ExportStage`: `NEW_TO_EXPORT` · `EXPLORING` · `EXPORT_READY` · `OCCASIONAL_EXPORTER` · `ESTABLISHED_EXPORTER`

### 3b. Importer wizard — `/register/importer` (2 steps)

**Step 1 — Company Info** *(exact from mockup)*
| Field | Required | Notes |
|---|---|---|
| Company Name | ✅ | "e.g. Global Foods Ltd." |
| Contact Email | ✅ | placeholder "sourcing@company.com" |
| Phone Number | — | default `+1` |
| Website | — | URL |
| Industries | ✅ | multi-select of the 9 industries (≥1) |

**Step 2 — Details**
| Field | Required | Notes |
|---|---|---|
| Country / market | ✅ | the importer's market (one of the 37) |
| Short description | — | |
| Product categories of interest | ✅ | subset of the 9 |
| Typical order volume | — | bucket |
| Logo | — | |

### Role chooser — `/register` (from mockup)
Two `RoleCard`s:
- **Syrian Exporter** — "I have Syrian products and want to reach international markets" · bullets: List your products / Get your readiness scored / Match with global importers → **Register as Exporter**
- **International Importer** — "I want to source quality Syrian products for my market" · bullets: Post demand requests / Receive vetted offers / Connect with exporters → **Register as Importer**
- Footer: "By registering you agree to our Terms of Service" + "Change role".

---

## 4. Data Model — Prisma schema (concrete)

```prisma
enum Role          { EXPORTER IMPORTER ADMIN }
enum CompanyType   { EXPORTER IMPORTER }
enum Industry      { FOOD_BEVERAGE TEXTILES_APPAREL CHEMICALS COSMETICS_PERSONAL_CARE
                     CRAFTS_ARTISANAL MACHINERY ELECTRONICS AGRICULTURE PHARMACEUTICALS }
enum Region        { SOUTH_AMERICA OCEANIA ASIA AFRICA EUROPE MIDDLE_EAST NORTH_AMERICA }
enum TradeBloc     { EFTA ASEAN EU USMCA GCC AFCFTA AL MERCOSUR }
enum ExportStage   { NEW_TO_EXPORT EXPLORING EXPORT_READY OCCASIONAL_EXPORTER ESTABLISHED_EXPORTER }
enum Verification  { UNVERIFIED PENDING VERIFIED REJECTED }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?
  role          Role
  locale        String   @default("en")   // "en" | "ar"
  emailVerified DateTime?
  company       Company?
  createdAt     DateTime @default(now())
}

model Company {
  id           String       @id @default(cuid())
  owner        User         @relation(fields: [ownerId], references: [id])
  ownerId      String       @unique
  type         CompanyType
  nameEn       String
  nameAr       String?
  email        String
  phone        String?
  website      String?
  logoUrl      String?
  descriptionEn String?
  descriptionAr String?
  countryIso2  String                       // exporter: SY; importer: their market
  verification Verification @default(UNVERIFIED)
  isDraft      Boolean      @default(true)   // wizard autosave
  exporter     ExporterProfile?
  importer     ImporterProfile?
  products     Product[]
  createdAt    DateTime     @default(now())
  @@index([type, verification])
}

model ExporterProfile {
  companyId      String      @id
  company        Company     @relation(fields: [companyId], references: [id])
  governorate    String                      // 14 Syrian governorates
  sectors        Industry[]
  exportStage    ExportStage
  certifications String[]
  yearEstablished Int?
  employeeBucket String?
  capacityNote   String?
  hasExportLicense Boolean   @default(false)
  currentMarkets String[]                     // iso2[]
  targetMarkets  String[]                     // iso2[] — drives readiness scoring
}

model ImporterProfile {
  companyId   String     @id
  company     Company    @relation(fields: [companyId], references: [id])
  industries  Industry[]
  categoriesOfInterest Industry[]
  orderVolume String?
}

model Product {
  id          String   @id @default(cuid())
  company     Company  @relation(fields: [companyId], references: [id])
  companyId   String
  nameEn      String
  nameAr      String?
  category    Industry
  hsCode      String?
  description String?
  images      String[]
  minOrderQty Int?
  unit        String?
  @@index([category])
}

model Country {
  iso2       String   @id            // "DE", "AE", ...
  nameEn     String
  nameAr     String
  region     Region
  tradeBlocs TradeBloc[]
  flagEmoji  String
  summaryEn  String?
  summaryAr  String?
  requirements CountryRequirement[]
}

model CountryRequirement {
  id           String   @id @default(cuid())
  country      Country  @relation(fields: [countryIso2], references: [iso2])
  countryIso2  String
  category     Industry                // requirements are per product category
  standards    String[]                // e.g. "EU 2023/915 contaminants"
  certsRequired String[]               // e.g. "EU Organic", "CE"
  tariffNote   String?
  importNote   String?
  @@index([countryIso2, category])
}

// ---- Phase 4 ----
model DemandRequest {
  id          String   @id @default(cuid())
  importerId  String
  category    Industry
  titleEn     String
  description String
  quantity    String?
  targetCountryIso2 String?
  status      String   @default("OPEN")
  offers      Offer[]
  createdAt   DateTime @default(now())
}
model Offer          { id String @id @default(cuid()) demandRequestId String exporterId String message String status String @default("SENT") createdAt DateTime @default(now()) }
model ReadinessScore { id String @id @default(cuid()) companyId String targetCountryIso2 String score Int breakdown Json createdAt DateTime @default(now()) @@unique([companyId, targetCountryIso2]) }
model DevelopmentPlan{ id String @id @default(cuid()) companyId String targetCountryIso2 String steps Json model String generatedAt DateTime @default(now()) }
model Match          { id String @id @default(cuid()) exporterId String importerId String? demandRequestId String? score Int rationale String status String @default("SUGGESTED") createdAt DateTime @default(now()) }
```

---

## 5. Seed Data (the content backbone)

**🔑 Biggest external dependency.** The Explorer is only as good as this data. Plan a CSV → seed pipeline now.

- **Regions → country counts (must total 37):** Middle East 9 · Europe 11 · Asia 7 · North America 3 · Africa 3 · South America 2 · Oceania 2.
- **Trade blocs (8):** EFTA, ASEAN, EU, USMCA, GCC, AfCFTA, AL (Arab League), MERCOSUR. Many-to-many: a country can sit in several (e.g. an Arab GCC state ∈ {GCC, AL}).
- **`countries.csv`** columns: `iso2,nameEn,nameAr,region,tradeBlocs(|-sep),flagEmoji,summaryEn,summaryAr`.
- **`requirements.csv`** columns: `iso2,category,standards(|-sep),certsRequired(|-sep),tariffNote,importNote`. ~37 countries × the handful of categories each actually imports — not a full 37×9 matrix.
- **Industries (9):** Food & Beverages, Textiles & Apparel, Chemicals, Cosmetics & Personal Care, Crafts & Artisanal, Machinery, Electronics, Agriculture, Pharmaceuticals.
- **Syrian governorates (14):** for exporter location enum.

**Open question:** who authors/owns the requirement content? (trade consultant, partner org, scraped + reviewed?) This gates Phase 2 quality.

---

## 6. Routes & API Contracts

### Pages (all under `/[locale]`, locale ∈ {en, ar})
```
/                         Landing
/register                 Role chooser
/register/exporter        3-step wizard (?step=1..3, draft autosaved)
/register/importer        2-step wizard
/signin                   Magic-link + password
/explorer                 Region grid + bloc filter bar (37, public)
/explorer/[iso2]          Country detail: imports, standards, blocs, requirements
/directory                Exporter directory: search + filters (public)
/directory/[companyId]    Public exporter profile
/dashboard                Role-aware home
/dashboard/profile        Edit company + products
/dashboard/readiness      (P4) score + development plan per target market
/dashboard/matches        (P4) suggested matches
/dashboard/demands        (P4) importer: post/manage demand requests
/admin                    (P5) verification queue + content editor
```

### Route Handlers (server)
```
POST /api/register/draft         upsert draft Company from a wizard step  -> {companyId}
POST /api/register/submit        finalize: isDraft=false, send verify email
GET  /api/directory?q&sector&country&stage&verified&page   -> paginated cards
GET  /api/countries?bloc&region                            -> explorer list
GET  /api/countries/[iso2]                                 -> detail + requirements
POST /api/readiness     (P4)  {companyId, targetIso2}      -> ReadinessScore
POST /api/plan          (P4)  {companyId, targetIso2}      -> DevelopmentPlan
POST /api/demands       (P4)  importer creates a request
POST /api/match         (P4)  recompute suggestions
```
Authz: middleware gates `/dashboard/*` (any role) and `/admin/*` (ADMIN); `/explorer/*` and `/directory/*` fully public. Mutations validate role server-side, never trust client.

---

## 7. Internationalization & RTL (launch requirement)

- `next-intl`; catalogs `messages/en.json`, `messages/ar.json`; locale segment in the URL.
- Root layout sets `dir={locale === 'ar' ? 'rtl' : 'ltr'}`.
- **Hard rule:** Tailwind logical utilities only (`ms-*`/`me-*`/`ps-*`/`text-start`) — no `ml-*`/`left-*`. Add an ESLint guard against physical-direction classes to enforce it.
- Content fields fall back EN→AR when one is missing.
- Arabic-capable typeface (e.g. IBM Plex Sans Arabic / Noto Sans Arabic).
- **Test RTL from Phase 0** with a couple of real Arabic strings — retrofitting is the classic i18n trap.

---

## 8. Phased Delivery

| Phase | Deliverable | Est. |
|---|---|---|
| **0 — Foundations** | Next.js+TS+Tailwind+shadcn; Prisma+Postgres+migrations; next-intl EN/AR + RTL baseline; Auth.js with roles; nav + language switcher; CI/lint/env | ½–1 wk |
| **1 — Onboarding** | Landing; role chooser; exporter 3-step + importer 2-step wizards w/ draft autosave + Zod; email verify; dashboard shell | 1–1.5 wk |
| **2 — Country Explorer** | Seed 37 countries/blocs/requirements; region grid; bloc filters; country detail; SEO (metadata, sitemap, ISR) | 1–1.5 wk |
| **3 — Directory** | Products on profile; directory browse/search/filter (Postgres FTS); public profiles | 1 wk |
| **4 — AI & marketplace** | Readiness scoring (rules→Claude); matching; development plans; demands+offers; connections | 2–3 wk |
| **5 — Trust & admin** | Verification workflow; admin content console; notifications; analytics; rate limiting | 1 wk |

---

## 9. AI Design (Phase 4) — concrete contracts

**Readiness score (D6 — rules first, LLM second).**
1. Deterministic rubric → integer 0–100 across weighted dimensions, e.g.:
   - Certifications vs. `CountryRequirement.certsRequired` for the target market (30)
   - Standards/labeling coverage (20) · Export license + docs (15) · Capacity vs. typical order (15) · Export experience/stage (10) · Profile completeness (10)
2. Claude takes the rubric breakdown + company/country context and writes the **explanation + gap prioritization** — it does not change the number. Output validated against a Zod schema; persisted in `ReadinessScore.breakdown`.

**Development plan.** Input: `{exporterProfile, products, targetCountryRequirements, scoreBreakdown}`. Output (Zod-validated JSON): ordered `steps[]` of `{title, why, category(cert|docs|standards|capacity|market), effort, blocking}`. Stored in `DevelopmentPlan.steps`; record the `model` id used.

**Matching.** Candidate set from structured filters (sector/category ∩, target market ∩ importer market, capacity ≥ typical volume); Claude ranks + writes one-line rationale per pair. **Cache** results in `Match`; recompute on profile change or nightly — never block a page render on a live LLM call.

Use the latest Claude model; version prompts; log token usage per call.

---

## 10. Open Questions (decide before/with the phase noted)

1. **[P2] Country requirement content** — source & owner of the 37-country requirement data? *(biggest blocker)*
2. **[P5] "Vetted/verified"** — manual review, document upload, or third-party check? Defines the `Verification` workflow.
3. **[P0] Compliance/hosting** — constraints from the Syria sanctions context for hosting, KYC, and any third-party SaaS (auth/email/AI). Confirm before picking vendors.
4. **[P1] Auth** — magic-link + password only, or also social? (assumed email-only.)
5. **[P0] Branding** — logo, palette, Arabic-friendly type.

---

## 11. First Steps

1. Resolve open Q3 (compliance/hosting) and Q1 owner — they gate vendor + content choices.
2. Phase 0 scaffold.
3. Define the Prisma schema in §4 + seed **5 sample countries** end-to-end to validate the Explorer shape before bulk data entry.
4. Ship the two onboarding wizards behind the landing page as the first usable slice.
