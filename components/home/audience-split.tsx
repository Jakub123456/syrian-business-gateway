import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Icon, type IconName } from "@/components/icon";

export function AudienceSplit({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.home;
  const base = `/${locale}`;

  const cards = [
    {
      icon: "factory" as IconName,
      accent: "brand" as const,
      heading: h.exporterHeading,
      lead: h.exporterLead,
      bullets: [h.exporterB1, h.exporterB2, h.exporterB3],
      cta: h.exporterCta,
      href: `${base}/register/exporter`,
    },
    {
      icon: "globe" as IconName,
      accent: "gold" as const,
      heading: h.importerHeading,
      lead: h.importerLead,
      bullets: [h.importerB1, h.importerB2, h.importerB3],
      cta: h.importerCta,
      href: `${base}/register/importer`,
    },
  ];

  return (
    <section className="container-page py-16">
      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((c) => (
          <div key={c.href} className="flex flex-col rounded-2xl border border-line bg-surface p-8 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.accent === "gold" ? "bg-gold-400/15 text-gold-600" : "bg-brand-50 text-brand-600"}`}>
              <Icon name={c.icon} className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-brand-900">{c.heading}</h2>
            <p className="mt-1.5 text-muted">{c.lead}</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {c.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Icon name="check" className={`mt-0.5 h-4 w-4 shrink-0 ${c.accent === "gold" ? "text-gold-500" : "text-brand-500"}`} />
                  <span className="text-ink">{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href={c.href}
              className={`mt-7 w-fit rounded-lg px-5 py-2.5 text-sm font-semibold text-white ${c.accent === "gold" ? "bg-gold-500 hover:bg-gold-600" : "bg-brand-600 hover:bg-brand-700"}`}
            >
              {c.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
