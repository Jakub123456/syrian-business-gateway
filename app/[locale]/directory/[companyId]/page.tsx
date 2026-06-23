import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { EXPORTERS } from "@/lib/data/exporters";
import { getDirectoryExporter } from "@/lib/directory";
import { getCountry } from "@/lib/data/countries";
import { INDUSTRIES, EXPORT_STAGES, GOVERNORATES, label } from "@/lib/taxonomy";

export function generateStaticParams() {
  return EXPORTERS.map((e) => ({ companyId: e.id }));
}

export default async function ExporterProfilePage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string }>;
}) {
  const { locale, companyId } = await params;
  if (!isLocale(locale)) notFound();
  const ex = await getDirectoryExporter(companyId);
  if (!ex) notFound();
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;

  const govLabel = label(GOVERNORATES.find((g) => g.key === ex.governorate)!, loc);
  const stageLabel = label(EXPORT_STAGES.find((s) => s.key === ex.exportStage)!, loc);
  const industry = (key: string) => {
    const i = INDUSTRIES.find((x) => x.key === key);
    return i ? label(i, loc) : key;
  };

  return (
    <div className="container-page max-w-4xl py-12">
      <Link href={`/${locale}/directory`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <span className="flip-rtl">←</span> {dict.directory.title}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900">{loc === "ar" ? ex.nameAr : ex.nameEn}</h1>
          <p className="mt-1 text-sm text-muted">{govLabel} · {stageLabel} · {dict.common.established} {ex.yearEstablished}</p>
        </div>
        {ex.verified && (
          <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            ✓ {dict.common.verified}
          </span>
        )}
      </div>

      <p className="mt-4 text-lg text-muted">{loc === "ar" ? ex.descriptionAr : ex.descriptionEn}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ex.sectors.map((s) => (
          <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">{industry(s)}</span>
        ))}
      </div>

      {/* Products */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-brand-900">{dict.common.products}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {ex.products.map((p) => (
            <div key={p.nameEn} className="rounded-xl border border-line bg-surface p-4">
              <p className="font-medium text-brand-800">{loc === "ar" ? p.nameAr : p.nameEn}</p>
              <p className="mt-1 text-xs text-muted">{industry(p.category)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {ex.certifications.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{dict.common.certifications}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {ex.certifications.map((c) => (
                <span key={c} className="rounded-full bg-gold-400/15 px-3 py-1 text-sm font-medium text-gold-600">{c}</span>
              ))}
            </div>
          </section>
        )}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{dict.common.targetMarkets}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {ex.targetMarkets.map((iso) => {
              const c = getCountry(iso);
              return (
                <span key={iso} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                  {c ? `${c.flag} ${loc === "ar" ? c.nameAr : c.nameEn}` : iso}
                </span>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
