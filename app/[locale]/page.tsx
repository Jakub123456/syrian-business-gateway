import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { db } from "@/lib/db";
import { localeAlternates } from "@/lib/seo";
import { INDUSTRIES, GOVERNORATES, label } from "@/lib/taxonomy";
import { getExporter } from "@/lib/data/exporters";
import { Icon } from "@/components/icon";
import { AudienceSplit } from "@/components/home/audience-split";
import { ProofStrip } from "@/components/home/proof-strip";
import { HowItWorks } from "@/components/home/how-it-works";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return {
    title: { absolute: dict.home.h1 },
    description: dict.home.subtitle,
    alternates: localeAlternates(locale as Locale, ""),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;
  const h = dict.home;
  const base = `/${locale}`;

  // Live demand count — resilient: never break the landing if the DB is unreachable.
  let openRequests: number | null = null;
  try {
    openRequests = await db.demandRequest.count({ where: { status: "OPEN" } });
  } catch {
    openRequests = null;
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-canvas">
        <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface px-3 py-1 text-sm font-medium text-brand-700">
              <span className="h-2 w-2 rounded-full bg-gold-500" />
              {h.kicker}
            </p>
            <h1 className="text-4xl font-bold leading-tight text-brand-900 sm:text-5xl">{h.h1}</h1>
            <p className="mt-3 text-sm font-medium uppercase tracking-wide text-brand-600">{h.title}</p>
            <p className="mt-5 max-w-xl text-lg text-muted">{h.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`${base}/register/exporter`} className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-700">
                {h.registerExporter}
              </Link>
              <Link href={`${base}/register/importer`} className="rounded-lg bg-gold-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-gold-600">
                {h.registerImporter}
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link href={`${base}/directory`} className="font-semibold text-brand-700 hover:underline">{h.ctaDirectory} →</Link>
              <Link href={`${base}/requests`} className="font-semibold text-brand-700 hover:underline">{h.ctaRequests} →</Link>
            </div>
            <p className="mt-5 text-sm text-muted">
              {dict.common.haveAccount}{" "}
              <Link href={`${base}/signin`} className="font-semibold text-brand-700 underline">{dict.nav.signIn}</Link>
            </p>
          </div>

          {/* Mini-cards mock — both sides of the marketplace */}
          <HeroMock locale={loc} dict={dict} />
        </div>
      </section>

      <AudienceSplit locale={loc} dict={dict} />
      <ProofStrip locale={loc} dict={dict} openRequests={openRequests} />
      <HowItWorks locale={loc} dict={dict} />

      {/* Why Syria */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-brand-900">{h.whyHeading}</h2>
          <p className="mt-4 text-lg text-muted">{h.whyBody}</p>
        </div>
      </section>

      {/* Trust + final CTA */}
      <section className="bg-brand-50/40 py-16">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-6">
              <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-sm text-ink">{h.trustBeta}</p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-6">
              <Icon name="globe" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-sm text-ink">{h.trustBilingual}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-bold text-brand-900">{h.finalHeading}</h2>
            <p className="max-w-xl text-muted">{h.finalBody}</p>
            <Link href={`${base}/register`} className="rounded-lg bg-brand-600 px-7 py-3 font-semibold text-white shadow-sm hover:bg-brand-700">
              {dict.nav.getStarted}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroMock({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.home;
  const ex = getExporter("al-nour-olive-oil");
  if (!ex) return null;
  const gov = GOVERNORATES.find((g) => g.key === ex.governorate);
  const product = ex.products[0];

  return (
    <div className="relative mx-auto w-full max-w-sm lg:ms-auto">
      {/* Exporter profile mini-card */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{h.miniProfile}</p>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-brand-800">{locale === "ar" ? ex.nameAr : ex.nameEn}</p>
            <p className="text-xs text-muted">{gov ? label(gov, locale) : ex.governorate}</p>
          </div>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">✓ {dict.common.verified}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ex.sectors.map((s) => {
            const i = INDUSTRIES.find((x) => x.key === s)!;
            return (
              <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{label(i, locale)}</span>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs text-muted">{h.miniReady}</span>
          <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">82 / 100</span>
        </div>
      </div>

      {/* Import request mini-card (overlapping) */}
      <div className="relative z-10 -mt-3 ms-8 rounded-2xl border border-gold-400/40 bg-surface p-5 shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{h.miniRequest}</p>
          <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-xs font-medium text-gold-600">{dict.requests.open}</span>
        </div>
        <p className="mt-2 font-semibold text-brand-800">{locale === "ar" ? product.nameAr : product.nameEn}</p>
        <p className="mt-1 text-xs text-muted">Global Foods Ltd. · 🇩🇪</p>
      </div>
    </div>
  );
}
