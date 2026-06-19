import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { INDUSTRIES, type Industry } from "@/lib/taxonomy";
import { DirectoryBrowser } from "@/components/directory/directory-browser";
import { SyriaMap } from "@/components/directory/syria-map";

export default async function DirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sector?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  // Deep-link support: /directory?sector=FOOD_BEVERAGE pre-selects the filter.
  const { sector } = await searchParams;
  const initialSector = INDUSTRIES.some((i) => i.key === sector) ? (sector as Industry) : "";

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-brand-900">{dict.directory.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{dict.directory.subtitle}</p>
      <div className="mt-8">
        <SyriaMap locale={locale as Locale} dict={dict} />
      </div>
      <div className="mt-8">
        <DirectoryBrowser locale={locale as Locale} dict={dict} initialSector={initialSector} />
      </div>
    </div>
  );
}
