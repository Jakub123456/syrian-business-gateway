"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { INDUSTRIES } from "@/lib/taxonomy";

export type DemandResult = { ok: true; id?: string } | { ok: false; error: string };

const INDUSTRY_KEYS = INDUSTRIES.map((i) => i.key) as [string, ...string[]];

const createSchema = z.object({
  title: z.string().min(3, "Give the request a short title"),
  category: z.enum(INDUSTRY_KEYS),
  description: z.string().min(10, "Describe what you want to source"),
  quantity: z.string().optional().default(""),
  targetCountryIso2: z.string().optional().default(""),
});

async function importerCompany(uid: string) {
  return db.company.findUnique({ where: { ownerId: uid } });
}

export async function createDemandRequest(raw: unknown): Promise<DemandResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };
  if (session.role !== "IMPORTER") return { ok: false, error: "Only importers can post requests" };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const company = await importerCompany(session.uid);
  if (!company) return { ok: false, error: "Complete your importer profile first" };

  const created = await db.demandRequest.create({
    data: {
      importerId: company.id,
      title: d.title,
      category: d.category,
      description: d.description,
      quantity: d.quantity || null,
      targetCountryIso2: d.targetCountryIso2 || company.countryIso2 || null,
    },
  });
  return { ok: true, id: created.id };
}

async function ownRequest(uid: string, id: string) {
  const company = await importerCompany(uid);
  if (!company) return null;
  const req = await db.demandRequest.findUnique({ where: { id } });
  if (!req || req.importerId !== company.id) return null;
  return req;
}

export async function setDemandStatus(id: string, status: "OPEN" | "CLOSED"): Promise<DemandResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };
  if (!(await ownRequest(session.uid, id))) return { ok: false, error: "Request not found" };
  await db.demandRequest.update({ where: { id }, data: { status } });
  return { ok: true };
}

export async function deleteDemandRequest(id: string): Promise<DemandResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };
  if (!(await ownRequest(session.uid, id))) return { ok: false, error: "Request not found" };
  await db.demandRequest.delete({ where: { id } });
  return { ok: true };
}
