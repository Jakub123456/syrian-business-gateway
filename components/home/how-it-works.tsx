import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function HowItWorks({ dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.home;
  const columns = [
    { title: h.howExporterTitle, steps: [h.howExporter1, h.howExporter2, h.howExporter3], accent: "brand" as const },
    { title: h.howImporterTitle, steps: [h.howImporter1, h.howImporter2, h.howImporter3], accent: "gold" as const },
  ];

  return (
    <section className="container-page py-16">
      <h2 className="text-2xl font-bold text-brand-900">{h.howHeading}</h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-lg font-semibold text-brand-800">{col.title}</h3>
            <ol className="mt-4 space-y-4">
              {col.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      col.accent === "gold" ? "bg-gold-400/15 text-gold-600" : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1 text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
