import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ImporterWizard } from "@/components/wizard/importer-wizard";

export default async function ImporterRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="container-page max-w-3xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-900">{dict.wizard.importerTitle}</h1>
        <Link href={`/${locale}/register`} className="text-sm text-muted underline hover:text-brand-700">
          {dict.common.changeRole}
        </Link>
      </div>
      <ImporterWizard locale={locale as Locale} dict={dict} />
    </div>
  );
}
