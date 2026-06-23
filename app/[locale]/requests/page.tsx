import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { localeAlternates } from "@/lib/seo";
import { getCountry } from "@/lib/data/countries";
import type { Industry } from "@/lib/taxonomy";
import { RequestsBrowser, type RequestItem } from "@/components/requests/requests-browser";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return { title: dict.requests.title, description: dict.requests.subtitle, alternates: localeAlternates(locale as Locale, "/requests") };
}

export default async function RequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;
  const session = await getSession();

  const rows = await db.demandRequest.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { importer: { select: { nameEn: true, nameAr: true, countryIso2: true } } },
    take: 200, // bound the query; add cursor pagination when volume warrants
  });

  const items: RequestItem[] = rows.map((r) => {
    const country = r.targetCountryIso2 ? getCountry(r.targetCountryIso2) : undefined;
    return {
      id: r.id,
      title: r.title,
      category: r.category as Industry,
      description: r.description,
      quantity: r.quantity,
      importerName: loc === "ar" && r.importer.nameAr ? r.importer.nameAr : r.importer.nameEn,
      countryLabel: country ? (loc === "ar" ? country.nameAr : country.nameEn) : r.targetCountryIso2,
      flag: country?.flag ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  });

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900">{dict.requests.title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{dict.requests.subtitle}</p>
        </div>
        {session?.role === "IMPORTER" && (
          <Link
            href={`/${locale}/dashboard/requests`}
            className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-600"
          >
            {dict.requests.ctaImporter}
          </Link>
        )}
      </div>
      <div className="mt-8">
        <RequestsBrowser locale={loc} dict={dict} items={items} />
      </div>
    </div>
  );
}
