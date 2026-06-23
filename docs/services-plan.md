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

**Prerequisite gaps:** no email/notification provider; no `featured` field; no admin console;
matching/offers not built; registered exporters not yet shown in the public directory.

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

## Build-first roadmap (highest ROI, least infra) — with touchpoints

Ordered. Each maps to existing code; the only net-new infra is an email provider.

1. **Readiness PDF report** *(S–M, no new infra)*
   - Render the existing `ReadinessResult` (dims + `topGaps` + narrative) to PDF.
   - Touch: new `app/[locale]/dashboard/readiness/[iso2]/report` route or a server action
     using `@react-pdf/renderer` (or print-CSS + browser print). Reuses `lib/readiness/*`.

2. **Featured listing** *(S for the sort; monetize later)*
   - Add `featured Boolean` + `featuredUntil DateTime?` to `Company`; sort the directory by
     featured first. Touch: schema + migration, `directory-browser` sort, later a Pro flag.

3. **Country Market Guides** *(M)*
   - Build read-only market pages from `lib/data/countries.ts` (the data the deleted Explorer
     used): per-country imports, trade blocs, per-category requirements. Touch: new
     `/[locale]/markets` + `/markets/[iso2]` routes. Gate depth behind Pro later.

4. **Supplier shortlist on an RFQ** *(M)*
   - Rules-based ranking of exporters for a `DemandRequest`: sector ∩ request category,
     verified first, then export-stage/cert proxy (we can't run an exporter's private
     readiness for a buyer — use a public cert/stage proxy). Touch: `lib/match/` ranker +
     a panel on the request/importer dashboard.

5. **Demand alerts + RFQ broadcast** *(M — needs email)*
   - On `createDemandRequest`, find exporters whose sectors include the category and email
     them (opt-in). Touch: **add an email provider** (Resend) + `ANTHROPIC`-style env key,
     `lib/email/`, an opt-in field on `ExporterProfile`, hook in `lib/demand/actions.ts`.
   - This unlocks importer saved-search alerts too.

6. **Verification fast-track** *(M)*
   - Implement the `verification` lifecycle: a "request verification" action
     (`UNVERIFIED→PENDING`) + a minimal admin view to set `VERIFIED`/`REJECTED`. Surfaces the
     existing "Verified" badge honestly. Touch: action + `app/[locale]/admin` (ADMIN role).

**Prerequisite for #5 (and any alerts):** choose + wire an email provider — it's the single
unlock for most "alert/notify" VAS.

---

## Avoid early (heavy, regulated, off-brand)

Trade finance/lending, shipping execution, escrow, customs clearance, real-time chat. Keep
these as **partner referrals**, never core product.

---

## Positioning honesty (say only what's live)

- Directory is "browse sample suppliers" until **registered companies are wired into the
  public directory** (today it shows seed data only).
- No "you'll be matched / receive offers" language until **matching + offers** ship.
- "Country guides / market explorer" — frame as **coming** (data exists; public UI was
  removed and needs rebuilding).
- Readiness = "gap analysis & priority actions," not a full "development plan" product.

---

## Open decisions (before building)

1. **Monetization now or later?** Build VAS as free beta features first, or wire Stripe
   Billing alongside (gates Pro tier)?
2. **Email provider** — Resend (simplest) vs Postmark vs SES?
3. **Wire registered exporters into the public directory** first? Several importer VAS
   (shortlist, search, alerts) are only meaningful once real signups appear there.
4. **Admin console scope** — minimal verification queue now, or a fuller content/admin tool?
