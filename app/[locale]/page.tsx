import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Icon, type IconName } from "@/components/icon";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const base = `/${locale}`;

  const features: { title: string; body: string; icon: IconName }[] = [
    { title: dict.home.feature1Title, body: dict.home.feature1Body, icon: "link" },
    { title: dict.home.feature2Title, body: dict.home.feature2Body, icon: "gauge" },
    { title: dict.home.feature3Title, body: dict.home.feature3Body, icon: "compass" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-canvas">
        <div className="container-page py-20 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface px-3 py-1 text-sm font-medium text-brand-700">
            <span className="h-2 w-2 rounded-full bg-gold-500" />
            {dict.home.kicker}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-brand-900 sm:text-6xl">
            {dict.home.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">{dict.home.subtitle}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`${base}/register/exporter`}
              className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              {dict.home.registerExporter}
            </Link>
            <Link
              href={`${base}/register/importer`}
              className="rounded-lg bg-gold-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-gold-600"
            >
              {dict.home.registerImporter}
            </Link>
            <Link
              href={`${base}/explorer`}
              className="rounded-lg border border-brand-300 bg-surface px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
            >
              {dict.home.exploreCountries}
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            {dict.common.haveAccount}{" "}
            <Link href={`${base}/signin`} className="font-semibold text-brand-700 underline">
              {dict.nav.signIn}
            </Link>
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-line bg-surface p-6 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={f.icon} className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-brand-800">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
