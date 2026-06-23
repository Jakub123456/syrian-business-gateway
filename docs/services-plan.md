# Value-Added Services — Plan

How SBG extends beyond the free directory **without becoming a logistics or payments
company**. SBG stays a *gateway*: it deepens discovery, readiness, and trust, and **refers
out** for anything needing trucks, banks, or customs officers.

## Delivery models

| Model | Means | Cost to build |
|---|---|---|
| **Platform-native** | Built on data we already hold (profiles, readiness, countries, requests) | Code only |
| **Concierge** | Human-assisted (shortlists, verification, listing setup) | Ops time, light tooling |
| **Partner referral** | Introduce vetted cert bodies / forwarders / inspectors — SBG doesn't execute | Partnerships + a referral field |

**Still out of scope for SBG itself** (partner referrals only): payments, escrow, shipping,
customs clearance, lending. *(SaaS subscription billing for paid tiers is fine — that's not
trade payment; keep the two separate.)*

---

## What we can build on today (the primitives)

| Primitive | Where | Powers which VAS |
|---|---|---|
| Readiness rubric (0–100, 6 dims, gaps, narrative) | `lib/readiness/` + `/dashboard/readiness` | PDF report, multi-market compare, cert roadmap, EU-ready filter |
| Exporter Directory + Syria map | `/directory`, `lib/data/exporters.ts` | Featured listing, shortlists, readiness-filtered search |
| Import Requests (RFQ board) | `/requests`, `DemandRequest` model | Demand alerts, RFQ broadcast, shortlist-on-RFQ, anonymous RFQ |
| Country requirement data | `lib/data/countries.ts` (Explorer UI removed) | Country Market Guides, label/packaging rules, compliance checklist |
| `Company.verification` enum | schema (`UNVERIFIED`→`VERIFIED`) | Verification fast-track, trust badge |
| Sector taxonomy (9) + governorates (14) | `lib/taxonomy.ts` | Matching, sector hubs, alerts |

**Prerequisite gaps:** no email/notification provider; no `featured` field; no admin console
/ verification workflow; no billing; matching/offers not built. *(Registered exporters now
**do** appear in the directory.)*

---

## Exporter VAS

| Service | Model | Builds on | Effort |
|---|---|---|---|
| **Export readiness report (PDF)** — score, gaps, requirements to hand a bank/consultant | Platform | readiness result | S–M |
| **Multi-market comparison** — UAE vs DE vs FR side-by-side | Platform | run rubric per market | S |
| **Certification roadmap** — ordered path (HACCP → EU Organic → license) | Platform | gap list ordering | S |
| **Market demand alerts** — email when a request matches your sector | Platform | requests + sector match + **email** | M |
| **Profile optimization checklist** — photos, bilingual copy, capacity wording | Platform | profile fields | S |
| **Label & packaging rules** per market | Platform | `countries.ts` requirements | M |
| **Featured listing** — priority placement in search | Platform | `featured` flag + sort | S |
| **Product spec-sheet templates** (food/textiles/cosmetics) | Platform/Concierge | product data | M |
| **Listing setup assist** (EN/AR translation, product upload) | Concierge | — | ops |
| **Verification fast-track** (doc review → badge) | Concierge | `verification` enum | M |
| **Buyer introduction** to a matching importer | Concierge | requests + sectors | ops |
| **Export documentation pack** (invoice, packing list, CoO templates) | Concierge/Partner | — | ops |
| Cert bodies / license consultants / forwarders / trade-finance introducers / lab testing | Partner referral | referral directory | partnership |

**Exporter pitch:** *Know your gaps. Get found. Get alerted when buyers post demand.*

---

## Importer VAS

| Service | Model | Builds on | Effort |
|---|---|---|---|
| **Supplier shortlist on RFQ** — 3–5 exporters ranked by match + verification | Platform | directory + rules ranking | M |
| **Readiness-filtered search** — "EU-ready olive oil only" | Platform | readiness/cert proxy on profiles | M |
| **RFQ broadcast** — push a request to matching exporters | Platform | requests + sector match + email | M |
| **Anonymous RFQ** — hide buyer name until exporters respond | Platform | `DemandRequest` flag | S |
| **Supplier comparison sheet** — certs/capacity/markets side-by-side | Platform | profile data | S |
| **Import compliance checklist** — what their market requires from Syria | Platform | `countries.ts` | M |
| **Saved searches & alerts** — notify on new matching suppliers | Platform | directory + email | M |
| **Sourcing-agent lite / sample coordination / due-diligence report / sector briefing** | Concierge | — | ops |
| Pre-shipment inspection / trade-credit insurance / sanctions screening / freight quotes | Partner referral | referral directory | partnership |

**Importer pitch:** *Source with confidence. Compare suppliers. Post once, reach verified producers.*

---

## Shared

Country Market Guides (premium deep country+category pages from `countries.ts`) · Trade
glossary (Incoterms, cert acronyms) · Webinars · Virtual matchmaking events · Sector SEO hubs
(olive oil, rosewater, textiles) · API / white-label for chambers of commerce.

---

## Commercial tiers

| Tier | Exporters | Importers |
|---|---|---|
| **Free** | Basic listing, browse requests, 1 readiness check/mo | Browse directory, post 1 RFQ |
| **Pro** | Unlimited readiness, PDF reports, alerts, featured slot | RFQ broadcast, shortlists, comparison export, alerts |
| **Concierge** (per-fee) | Verification audit, listing setup, buyer intro | Sourcing session, due-diligence report |
| **Partners** | Referral revenue (cert / forwarder / inspection) | Same |

Paid tiers imply **SaaS subscription billing** (e.g. Stripe Billing) — a thin, standard add,
distinct from trade payments/escrow which stay out of scope.

---

## Status & improvement plan (re-prioritised)

### Already shipped (codebase audit)
- ✅ Readiness scoring + **multi-market comparison** + **PDF / print report** (`lib/readiness/*`, `/dashboard/readiness`)
- ✅ **Supplier shortlist on an RFQ** (`lib/match/shortlist.ts`, importer dashboard)
- ✅ Import Requests / RFQ board — post, browse, manage (`lib/demand/*`, `/requests`)
- ✅ **Directory now reads the DB** — registered exporters appear (`lib/directory.ts`); this
  was the blocker that made importer VAS meaningful.

So **3 of the 6 original build-first items are done** and the directory dependency is resolved.

### Two unlocks gate most of the rest — decide these first
- **Email provider** (Resend) → unlocks *every* alert/notify service: market demand alerts,
  RFQ broadcast, importer saved-search alerts. Single highest-leverage piece of infra.
- **Admin + billing** → a **verification workflow** makes the "Verified" badge real (and
  sellable as a concierge fast-track), and **Stripe Billing** gates the Pro tier.

### Wave 1 — platform quick wins (no new infra)
1. **Certification roadmap** *(S)* — the rubric already finds cert gaps; order them into a
   path (HACCP → EU Organic → export licence) and render on the readiness result.
   Touch: `lib/readiness/rubric.ts` (emit ordered cert steps) + readiness panel.
2. **Profile optimisation checklist** *(S)* — the readiness "profile completeness" dimension
   already has the signals (website, logo, Arabic name, products, certs); surface them as a
   dashboard checklist with fix links. Touch: dashboard.
3. **Featured listing (sort)** *(S)* — add `featured` / `featuredUntil` to `Company`, sort
   featured-first in `lib/directory.ts`. Monetise later via billing.
4. **Readiness-filtered search** *(S–M, importer)* — the directory now has DB exporters +
   verification + export stage; add an "export-ready & verified only" filter (and per-sector).
   Touch: `directory-browser` filters.

### Wave 2 — email-gated (after choosing a provider)
5. **Market demand alerts** *(M)* — on `createDemandRequest`, email opt-in exporters whose
   sectors match the category. Touch: `lib/email/` (Resend) + opt-in field on
   `ExporterProfile` + hook in `lib/demand/actions.ts`.
6. **RFQ broadcast + importer saved-search alerts** *(M)* — reuse the same matcher + email.

### Wave 3 — trust + monetisation
7. **Verification workflow + minimal admin** *(M)* — "request verification"
   (`UNVERIFIED → PENDING`) + an ADMIN-only queue to set `VERIFIED` / `REJECTED`. Makes the
   badge honest; powers the concierge "fast-track". Touch: action + `app/[locale]/admin`.
8. **Stripe Billing → Pro tier** *(M–L)* — gate featured slot, unlimited readiness, alerts.
   SaaS subscription only — distinct from trade payments (which stay out of scope).

### Wave 4 — content / SEO (needs a product decision)
9. **Country Market Guides** *(M)* — read-only `/markets` + `/markets/[iso2]` from
   `lib/data/countries.ts` (label/packaging rules, importer compliance checklist).
   **Decision:** this revives the kind of country pages that were deliberately removed —
   confirm before building. High SEO value; premium-gate depth later.
10. **Sector SEO hubs** *(M)* — olive-oil / rosewater / textiles landing pages.

> **Concierge & partner-referral services are ops/sales, not engineering** — they need a
> referral-directory field + a simple intake form, then sales follow-through. Sequence them
> with business development, not the build roadmap.

---

## Avoid early (heavy, regulated, off-brand)

Trade finance/lending, shipping execution, escrow, customs clearance, real-time chat. Keep
these as **partner referrals**, never core product.

---

## Positioning honesty (say only what's live)

- Directory now shows **registered companies** (DB) merged with sample data — drop the
  samples once real signups are enough to fill it.
- "Verified" badge is **cosmetic** until the verification workflow ships — don't market
  vetting yet; the directory copy already softened "verified" → "Syrian exporters".
- No "you'll be matched / receive offers" language until **offers** ship (shortlist is
  "evaluate and reach out", not automated matching).
- Readiness = "gap analysis & priority actions" + comparison + PDF — not a full
  "development plan" product.
- "Country guides" — frame as **coming** (data exists; no public UI).

---

## Open decisions (before building)

1. **Monetisation now or later?** Ship Wave 1–2 as free beta, or wire Stripe Billing
   alongside to gate the Pro tier?
2. **Email provider** — Resend (simplest) vs Postmark vs SES? (Gates all of Wave 2.)
3. **Verification depth** — minimal admin queue now, or a fuller document-review flow?
4. **Revive market pages?** Country Market Guides means re-introducing country pages that
   were deliberately removed — yes (as premium guides) or keep deferred?
