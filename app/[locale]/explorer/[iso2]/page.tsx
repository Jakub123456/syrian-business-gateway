import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { COUNTRIES, getCountry } from "@/lib/data/countries";
import { REGIONS, TRADE_BLOCS, INDUSTRIES, label } from "@/lib/taxonomy";

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ iso2: c.iso2.toLowerCase() }));
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; iso2: string }>;
}) {
  const { locale, iso2 } = await params;
  if (!isLocale(locale)) notFound();
  const country = getCountry(iso2);
  if (!country) notFound();
  const dict = await getDictionary(locale as Locale);
  const e = dict.explorer;
  const loc = locale as Locale;

  const regionLabel = label(REGIONS.find((r) => r.key === country.region)!, loc);
  const industryLabel = (key: string) => {
    const i = INDUSTRIES.find((x) => x.key === key);
    return i ? label(i, loc) : key;
  };

  return (
    <div className="container-page max-w-4xl py-12">
      <Link href={`/${locale}/explorer`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <span className="flip-rtl">←</span> {e.backToExplorer}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span className="text-5xl" aria-hidden>{country.flag}</span>
        <div>
          <h1 className="text-3xl font-bold text-brand-900">{loc === "ar" ? country.nameAr : country.nameEn}</h1>
          <p className="text-sm text-muted">{regionLabel}</p>
        </div>
      </div>
      <p className="mt-4 text-lg text-muted">{loc === "ar" ? country.summaryAr : country.summaryEn}</p>

      {/* Trade blocs */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{e.tradeBlocs}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {country.tradeBlocs.length === 0 ? (
            <span className="text-sm text-muted">{e.noBloc}</span>
          ) : (
            country.tradeBlocs.map((b) => (
              <span key={b} className="rounded-full bg-gold-400/15 px-3 py-1 text-sm font-medium text-gold-600">
                {label(TRADE_BLOCS.find((x) => x.key === b)!, loc)}
              </span>
            ))
          )}
        </div>
      </section>

      {/* Top imports */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{e.topImports}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {country.topImports.map((imp) => (
            <span key={imp} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
              {industryLabel(imp)}
            </span>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-brand-900">{e.requirements}</h2>
        <div className="mt-4 space-y-4">
          {country.requirements.map((req, idx) => (
            <div key={idx} className="rounded-xl border border-line bg-surface p-5">
              <h3 className="font-semibold text-brand-800">{industryLabel(req.category)}</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{e.standards}</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {req.standards.map((s) => (
                      <li key={s} className="flex gap-2"><span className="text-brand-400">•</span>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{e.certsRequired}</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {req.certsRequired.map((s) => (
                      <li key={s} className="flex gap-2"><span className="text-gold-500">✓</span>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {req.note && <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-sm text-muted">{req.note}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
