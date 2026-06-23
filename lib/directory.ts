import "server-only";
import { db } from "@/lib/db";
import { fromJsonList } from "@/lib/serialize";
import { EXPORTERS, type Exporter } from "@/lib/data/exporters";
import type { Industry, ExportStage } from "@/lib/taxonomy";

// Bridges registered exporters (DB) into the public directory, which historically only
// showed the static sample data. Registered companies are merged with the samples; if the
// DB is unreachable, we fall back to samples so the directory never breaks.

type CompanyRow = {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  verification: string;
  exporter: {
    governorate: string;
    sectors: string;
    exportStage: string;
    certifications: string;
    yearEstablished: number | null;
    targetMarkets: string;
  } | null;
  products: { nameEn: string; nameAr: string | null; category: string }[];
};

function mapCompany(c: CompanyRow): Exporter {
  const ex = c.exporter!;
  return {
    id: c.id,
    nameEn: c.nameEn,
    nameAr: c.nameAr ?? c.nameEn,
    governorate: ex.governorate,
    sectors: fromJsonList(ex.sectors) as Industry[],
    exportStage: ex.exportStage as ExportStage,
    verified: c.verification === "VERIFIED",
    descriptionEn: c.descriptionEn ?? "",
    descriptionAr: c.descriptionAr ?? c.descriptionEn ?? "",
    certifications: fromJsonList(ex.certifications),
    yearEstablished: ex.yearEstablished ?? 0,
    targetMarkets: fromJsonList(ex.targetMarkets),
    products: c.products.map((p) => ({ nameEn: p.nameEn, nameAr: p.nameAr ?? p.nameEn, category: p.category as Industry })),
  };
}

export async function listDirectoryExporters(): Promise<Exporter[]> {
  try {
    const rows = await db.company.findMany({
      where: { type: "EXPORTER", isDraft: false },
      include: { exporter: true, products: true },
      orderBy: { createdAt: "desc" },
    });
    const registered = rows.filter((r) => r.exporter).map(mapCompany);
    // Registered companies first, then the sample exporters.
    return [...registered, ...EXPORTERS];
  } catch {
    return EXPORTERS;
  }
}

export async function getDirectoryExporter(id: string): Promise<Exporter | undefined> {
  const sample = EXPORTERS.find((e) => e.id === id);
  if (sample) return sample;
  try {
    const c = await db.company.findUnique({ where: { id }, include: { exporter: true, products: true } });
    if (c && c.type === "EXPORTER" && c.exporter && !c.isDraft) return mapCompany(c);
  } catch {}
  return undefined;
}
