import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ExplorerBrowser } from "@/components/explorer/explorer-browser";

export default async function ExplorerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-brand-900">{dict.explorer.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{dict.explorer.subtitle}</p>
      <div className="mt-8">
        <ExplorerBrowser locale={locale as Locale} dict={dict} />
      </div>
    </div>
  );
}
