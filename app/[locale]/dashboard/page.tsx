import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { db } from "@/lib/db";
import { fromJsonList } from "@/lib/serialize";
import { getCountry } from "@/lib/data/countries";
import { Icon } from "@/components/icon";
import { INDUSTRIES, EXPORT_STAGES, GOVERNORATES, label, type Locale as TaxLocale } from "@/lib/taxonomy";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);
  const dict = await getDictionary(locale as Locale);
  const loc = locale as TaxLocale;

  const company = await db.company.findUnique({
    where: { ownerId: session.uid },
    include: { exporter: true, importer: true, products: true },
  });

  const ind = (key: string) => {
    const i = INDUSTRIES.find((x) => x.key === key);
    return i ? label(i, loc) : key;
  };

  return (
    <div className="container-page py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900">{dict.dashboard.title}</h1>
          <p className="mt-1 text-muted">
            {dict.dashboard.signedInAs} <span className="font-medium text-brand-700">{session.email}</span>
            <span className="ms-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {session.role === "EXPORTER" ? dict.role.exporterTitle : session.role === "IMPORTER" ? dict.role.importerTitle : session.role}
            </span>
          </p>
        </div>
        <form action={signOut.bind(null, locale)}>
          <button type="submit" className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted hover:bg-brand-50 hover:text-brand-700">
            {dict.dashboard.signOut}
          </button>
        </form>
      </div>

      {!company ? (
        <p className="mt-10 text-muted">{dict.dashboard.body}</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Profile card */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-brand-800">
                {loc === "ar" && company.nameAr ? company.nameAr : company.nameEn}
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${company.verification === "VERIFIED" ? "bg-brand-100 text-brand-700" : "bg-gold-400/15 text-gold-600"}`}>
                {company.verification === "VERIFIED" ? `✓ ${dict.common.verified}` : dict.dashboard.pendingReview}
              </span>
            </div>
            {company.descriptionEn && <p className="mt-2 text-sm text-muted">{company.descriptionEn}</p>}

            {company.exporter && (
              <div className="mt-5 space-y-4 text-sm">
                <Row label={dict.wizard.governorate}>
                  {label(GOVERNORATES.find((g) => g.key === company.exporter!.governorate) ?? { en: company.exporter.governorate, ar: company.exporter.governorate }, loc)}
                </Row>
                <Row label={dict.wizard.exportStage}>
                  {label(EXPORT_STAGES.find((s) => s.key === company.exporter!.exportStage) ?? { en: company.exporter.exportStage, ar: company.exporter.exportStage }, loc)}
                </Row>
                <Chips label={dict.wizard.sectors} items={fromJsonList(company.exporter.sectors).map(ind)} />
                <Chips label={dict.common.certifications} items={fromJsonList(company.exporter.certifications)} />
                <Chips
                  label={dict.common.targetMarkets}
                  items={fromJsonList(company.exporter.targetMarkets).map((iso) => {
                    const c = getCountry(iso);
                    return c ? `${c.flag} ${loc === "ar" ? c.nameAr : c.nameEn}` : iso;
                  })}
                />
              </div>
            )}

            {company.importer && (
              <div className="mt-5 space-y-4 text-sm">
                <Row label={dict.wizard.country}>
                  {(() => { const c = getCountry(company.countryIso2); return c ? `${c.flag} ${loc === "ar" ? c.nameAr : c.nameEn}` : company.countryIso2; })()}
                </Row>
                <Chips label={dict.wizard.industries} items={fromJsonList(company.importer.industries).map(ind)} />
                <Chips label={dict.wizard.categoriesOfInterest} items={fromJsonList(company.importer.categoriesOfInterest).map(ind)} />
              </div>
            )}

            {company.products.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{dict.common.products}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {company.products.map((p) => (
                    <div key={p.id} className="rounded-lg border border-line p-3">
                      <p className="font-medium text-brand-800">{loc === "ar" && p.nameAr ? p.nameAr : p.nameEn}</p>
                      <p className="text-xs text-muted">{ind(p.category)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export readiness (Phase 4) for exporters; placeholder for importers */}
          {session.role === "EXPORTER" ? (
            <Link
              href={`/${locale}/dashboard/readiness`}
              className="flex flex-col items-center rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center transition hover:border-brand-400 hover:shadow"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-brand-600">
                <Icon name="gauge" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-semibold text-brand-800">{dict.dashboard.readinessCard}</h3>
              <p className="mt-2 text-sm text-muted">{dict.dashboard.readinessCardBody}</p>
              <span className="mt-4 inline-block rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white">
                {dict.dashboard.openReadiness}
              </span>
            </Link>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name="inbox" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-semibold text-brand-800">{dict.role.importerB1}</h3>
              <p className="mt-2 text-sm text-muted">{dict.dashboard.body}</p>
              <span className="mt-4 inline-block rounded-full bg-gold-400/15 px-3 py-1 text-sm font-medium text-gold-600">
                {dict.common.comingSoon}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-brand-800">{children}</span>
    </div>
  );
}

function Chips({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">{it}</span>
        ))}
      </div>
    </div>
  );
}
