import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { INDUSTRIES, GOVERNORATES, label } from "@/lib/taxonomy";
import { EXPORTERS } from "@/lib/data/exporters";
import { Icon } from "@/components/icon";

const FEATURED = ["al-nour-olive-oil", "damascus-rose", "aleppo-soap-house"];

export function ProofStrip({
  locale,
  dict,
  openRequests,
}: {
  locale: Locale;
  dict: Dictionary;
  openRequests: number | null;
}) {
  const h = dict.home;
  const base = `/${locale}`;
  const suppliers = FEATURED.map((id) => EXPORTERS.find((e) => e.id === id)).filter(
    (e): e is NonNullable<typeof e> => !!e,
  );
  const govLabel = (key: string) => {
    const g = GOVERNORATES.find((x) => x.key === key);
    return g ? label(g, locale) : key;
  };

  return (
    <section className="bg-brand-50/40 py-16">
      <div className="container-page">
        {/* Sectors */}
        <h2 className="text-xl font-semibold text-brand-900">{h.sectorsHeading}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {INDUSTRIES.map((i) => (
            <Link
              key={i.key}
              href={`${base}/directory?sector=${i.key}`}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-muted transition hover:border-brand-300 hover:text-brand-700"
            >
              {label(i, locale)}
            </Link>
          ))}
        </div>

        {/* Featured suppliers */}
        <div className="mt-12 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-900">{h.suppliersHeading}</h3>
          <Link href={`${base}/directory`} className="text-sm font-medium text-brand-700 hover:underline">
            {h.viewAll} →
          </Link>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((e) => (
            <Link
              key={e.id}
              href={`${base}/directory/${e.id}`}
              className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-brand-800">{locale === "ar" ? e.nameAr : e.nameEn}</h4>
                {e.verified && (
                  <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    ✓ {dict.common.verified}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">{govLabel(e.governorate)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {e.sectors.map((s) => {
                  const i = INDUSTRIES.find((x) => x.key === s)!;
                  return (
                    <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                      {label(i, locale)}
                    </span>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>

        {/* Live demand teaser */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-gold-600">
              <Icon name="inbox" className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-semibold text-brand-900">
                {h.demandHeading}
                {openRequests != null && openRequests > 0 && (
                  <span className="ms-2 rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-medium text-gold-600">
                    {h.openRequests.replace("{count}", String(openRequests))}
                  </span>
                )}
              </h3>
              <p className="mt-1 text-sm text-muted">{h.demandBody}</p>
            </div>
          </div>
          <Link href={`${base}/requests`} className="shrink-0 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-600">
            {h.demandCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
