import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";

export default async function RoleChooserPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const base = `/${locale}`;

  const cards = [
    {
      title: dict.role.exporterTitle,
      desc: dict.role.exporterDesc,
      bullets: [dict.role.exporterB1, dict.role.exporterB2, dict.role.exporterB3],
      cta: dict.home.registerExporter,
      href: `${base}/register/exporter`,
      icon: "🏭",
      accent: "brand",
    },
    {
      title: dict.role.importerTitle,
      desc: dict.role.importerDesc,
      bullets: [dict.role.importerB1, dict.role.importerB2, dict.role.importerB3],
      cta: dict.home.registerImporter,
      href: `${base}/register/importer`,
      icon: "🌍",
      accent: "gold",
    },
  ] as const;

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-brand-900">{dict.role.title}</h1>
        <p className="mt-3 text-muted">{dict.role.subtitle}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {cards.map((c) => (
          <div key={c.href} className="flex flex-col rounded-2xl border border-line bg-surface p-8 shadow-sm">
            <div className="text-4xl" aria-hidden>{c.icon}</div>
            <h2 className="mt-4 text-xl font-semibold text-brand-800">{c.title}</h2>
            <p className="mt-2 text-sm text-muted">{c.desc}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {c.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className={c.accent === "gold" ? "text-gold-500" : "text-brand-500"}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href={c.href}
              className={`mt-7 rounded-lg px-5 py-3 text-center font-semibold text-white ${
                c.accent === "gold" ? "bg-gold-500 hover:bg-gold-600" : "bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {c.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">{dict.common.terms}</p>
    </div>
  );
}
