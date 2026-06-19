import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DirectoryBrowser } from "@/components/directory/directory-browser";
import { SyriaMap } from "@/components/directory/syria-map";

export default async function DirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-brand-900">{dict.directory.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{dict.directory.subtitle}</p>
      <div className="mt-8">
        <SyriaMap locale={locale as Locale} dict={dict} />
      </div>
      <div className="mt-8">
        <DirectoryBrowser locale={locale as Locale} dict={dict} />
      </div>
    </div>
  );
}
