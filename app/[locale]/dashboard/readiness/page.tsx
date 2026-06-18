import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { fromJsonList } from "@/lib/serialize";
import { COUNTRIES, getCountry } from "@/lib/data/countries";
import { ReadinessPanel, type Market } from "@/components/readiness/readiness-panel";

export default async function ReadinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;

  const back = (
    <Link href={`/${locale}/dashboard`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
      <span className="flip-rtl">←</span> {dict.dashboard.title}
    </Link>
  );

  if (session.role !== "EXPORTER") {
    return (
      <div className="container-page py-12">
        {back}
        <h1 className="mt-4 text-3xl font-bold text-brand-900">{dict.readiness.title}</h1>
        <p className="mt-4 text-muted">{dict.readiness.exportersOnly}</p>
      </div>
    );
  }

  const company = await db.company.findUnique({
    where: { ownerId: session.uid },
    include: { exporter: true },
  });

  const targetIsos = company?.exporter ? fromJsonList(company.exporter.targetMarkets) : [];
  const source = targetIsos.length
    ? targetIsos.map(getCountry).filter((c): c is NonNullable<typeof c> => !!c)
    : COUNTRIES;
  const markets: Market[] = source.map((c) => ({
    iso2: c.iso2,
    name: loc === "ar" ? c.nameAr : c.nameEn,
    flag: c.flag,
  }));

  return (
    <div className="container-page py-12">
      {back}
      <h1 className="mt-4 text-3xl font-bold text-brand-900">{dict.readiness.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{dict.readiness.subtitle}</p>
      {targetIsos.length === 0 && <p className="mt-2 text-sm text-gold-600">{dict.readiness.noTargets}</p>}
      <div className="mt-8">
        <ReadinessPanel locale={loc} dict={dict} markets={markets} />
      </div>
    </div>
  );
}
