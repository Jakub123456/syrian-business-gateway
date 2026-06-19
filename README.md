# Syrian Business Gateway (SBG)

AI-powered B2B platform connecting Syrian exporters with global buyers, with a Global
Market (Country) Explorer and (Phase 4) auto-generated export-readiness development plans.

See [`plan.md`](./plan.md) for the full build plan, data model, and phased roadmap.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript, Turbopack)
- **Tailwind CSS v4** (CSS-config), brand olive-green + gold palette
- **i18n**: dependency-free dictionary loader, **English + Arabic with full RTL**
  (`app/[locale]`, locale negotiation in `proxy.ts` — Next 16's renamed middleware)
- **Database**: **Prisma + SQLite** (dev) — schema in `prisma/schema.prisma`. Postgres
  is the prod target (see `plan.md` §4 and the schema header for the switch).
- **Auth**: hand-rolled session — signed JWT (`jose`) in an httpOnly cookie + `bcryptjs`
  password hashing. `proxy.ts` gates `/[locale]/dashboard`.

## Run

```bash
npm install
npm run db:migrate   # creates prisma/dev.db (DATABASE_URL in .env / .env.local)
npm run dev          # http://localhost:3000  → redirects to /en
```

`.env`/`.env.local` need `DATABASE_URL` and `AUTH_SECRET` (generate the latter with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

Try `/en` and `/ar` (RTL), `/en/explorer`, `/en/directory`, then register an exporter or
importer — submitting creates a real account, signs you in, and lands on `/dashboard`.

## What's implemented

**Phases 0–3** — landing, role chooser, Country Explorer (37 countries / 7 regions /
8 bloc filters / per-country requirements), Exporter Directory (search + filters), full
EN/AR + RTL.

**Phase 1 auth + persistence**
- Registration wizards (exporter 3-step, importer 2-step) now collect a password,
  **persist** `User` + `Company` + profile + products to the DB, and auto sign-in.
- Email + password sign-in; `proxy.ts` protects the dashboard; auth-aware header.
- Dashboard reads the logged-in company from the DB and renders its profile.
- Draft autosave still resumes a half-finished wizard (password excluded from storage).

**Phase 4 import requests** (`lib/demand/`, `/requests`, `/dashboard/requests`)
- Importers post **"requests for imports"** from their dashboard (`createDemandRequest` /
  `setDemandStatus` / `deleteDemandRequest` server actions, role-gated to importers).
- Public **Import Requests directory** (`/requests`) lists OPEN requests with category +
  search filters; cards show the buyer, destination market, quantity and date.
- `DemandRequest` model (+ migration). Seed sample requests: `node scripts/seed-demands.mjs`.

**Phase 4 export-readiness scoring** (`lib/readiness/`, `/dashboard/readiness`)
- **Deterministic rubric** (`rubric.ts`) is the source of truth: a weighted 0–100 across
  six dimensions (certifications, standards, docs, capacity, experience, completeness),
  scored from the exporter profile vs. the target market's requirements. Auditable and stable.
- **Claude narrative layer** (`ai.ts`, `@anthropic-ai/sdk`, `claude-opus-4-8`, Zod-validated
  structured output) explains and prioritises the gaps — it never changes the number, and
  **gracefully falls back** to a deterministic explanation when `ANTHROPIC_API_KEY` is unset.
- Results persist to `ReadinessScore` (upsert per company+market); the dashboard shows a
  score gauge, per-dimension bars, prioritised actions, and a rules/AI source badge.
- Verify the rubric: `node --experimental-strip-types scripts/test-rubric.ts`.

## Data layers

- **Users / companies / products** → Prisma + SQLite (`lib/db.ts`).
- **Country Explorer & sample Directory** → static seed data in [`lib/data/`](./lib/data)
  (correct for SEO-cached public content). The `Country` table can later be seeded from
  `lib/data/countries.ts` if the Explorer needs to become editable.
- SQLite has no enums/arrays, so enum columns are validated strings and list columns are
  JSON text via [`lib/serialize.ts`](./lib/serialize.ts). Switching to Postgres reverts
  these to native enums/arrays.

## DB scripts

```bash
npm run db:migrate    # prisma migrate dev
npm run db:studio     # browse data
npm run db:reset      # drop + re-migrate
node scripts/smoke-auth.mjs   # end-to-end auth stack check (needs env vars loaded)
```

## Notable choices

- **No i18n library** — Next 16 is newer than next-intl's official support, so i18n is a
  small dictionary loader (`lib/i18n/`) to avoid build-breaking incompatibility.
- **No NextAuth (yet)** — NextAuth v5 is beta and Next 16 is brand-new, so auth is a
  small, fully-controlled `jose` + `bcryptjs` layer (`lib/auth/`). Swapping to Auth.js
  later for OAuth touches only that folder + the action layer.
- **Prisma 6, not 7** — Prisma 7 dropped `url` from the schema for a new driver-adapter
  config; pinned to stable 6 to keep the standard migrate flow.
- **RTL via logical CSS** — Tailwind logical utilities (`ms-*`, `me-*`, `text-start`);
  a `.flip-rtl` helper mirrors directional glyphs.
