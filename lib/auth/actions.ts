"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { toJsonList } from "@/lib/serialize";
import { hashPassword, verifyPassword } from "./password";
import { setSessionCookie, clearSessionCookie, type Role } from "./session";
import { rateLimit } from "@/lib/ratelimit";
import { normalizeWebsite, isValidHttpUrl } from "@/lib/url";

export type ActionResult = { ok: true } | { ok: false; error: string };

const credentials = z.object({
  email: z.email(),
  password: z.string().min(8, "invalidPassword"),
});

// Normalises (adds https://) then rejects anything that isn't an http(s) URL.
const websiteField = z
  .string()
  .optional()
  .default("")
  .transform((v) => normalizeWebsite(v ?? ""))
  .refine((v) => v === "" || isValidHttpUrl(v), { message: "invalidWebsite" });

const productSchema = z.object({ nameEn: z.string().min(1), category: z.string().min(1) });

const exporterSchema = credentials.extend({
  locale: z.string().default("en"),
  nameEn: z.string().min(1),
  nameAr: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  website: websiteField,
  description: z.string().optional().default(""),
  governorate: z.string().min(1),
  sectors: z.array(z.string()).min(1),
  products: z.array(productSchema).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  yearEstablished: z.string().optional().default(""),
  employeeBucket: z.string().optional().default(""),
  capacity: z.string().optional().default(""),
  exportStage: z.string().min(1),
  currentMarkets: z.array(z.string()).optional().default([]),
  targetMarkets: z.array(z.string()).min(1),
  hasLicense: z.boolean().optional().default(false),
});

const importerSchema = credentials.extend({
  locale: z.string().default("en"),
  name: z.string().min(1),
  phone: z.string().optional().default(""),
  website: websiteField,
  industries: z.array(z.string()).min(1),
  country: z.string().min(1),
  description: z.string().optional().default(""),
  categoriesOfInterest: z.array(z.string()).min(1),
  orderVolume: z.string().optional().default(""),
});

// Errors are returned as codes; the client maps them to localised messages (dict.errors).
const KNOWN_FIELD_CODES = new Set(["invalidPassword", "invalidWebsite"]);
const fieldCode = (m?: string) => (m && KNOWN_FIELD_CODES.has(m) ? m : "invalidInput");

async function emailTaken(email: string): Promise<boolean> {
  return (await db.user.findUnique({ where: { email: email.toLowerCase() } })) !== null;
}

export async function registerExporter(raw: unknown): Promise<ActionResult> {
  if (!(await rateLimit("register", { limit: 5, windowSec: 3600 })).success)
    return { ok: false, error: "rateLimited" };
  const parsed = exporterSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: fieldCode(parsed.error.issues[0]?.message) };
  const d = parsed.data;
  if (await emailTaken(d.email)) return { ok: false, error: "emailExists" };

  const user = await db.user.create({
    data: {
      email: d.email.toLowerCase(),
      passwordHash: await hashPassword(d.password),
      role: "EXPORTER",
      locale: d.locale,
      company: {
        create: {
          type: "EXPORTER",
          nameEn: d.nameEn,
          nameAr: d.nameAr || null,
          email: d.email.toLowerCase(),
          phone: d.phone || null,
          website: d.website || null,
          descriptionEn: d.description || null,
          countryIso2: "SY",
          products: {
            create: d.products.map((p) => ({ nameEn: p.nameEn, category: p.category })),
          },
          exporter: {
            create: {
              governorate: d.governorate,
              sectors: toJsonList(d.sectors),
              exportStage: d.exportStage,
              certifications: toJsonList(d.certifications),
              yearEstablished: d.yearEstablished ? Number(d.yearEstablished) : null,
              employeeBucket: d.employeeBucket || null,
              capacityNote: d.capacity || null,
              hasExportLicense: d.hasLicense,
              currentMarkets: toJsonList(d.currentMarkets),
              targetMarkets: toJsonList(d.targetMarkets),
            },
          },
        },
      },
    },
  });

  await setSessionCookie({ uid: user.id, email: user.email, role: "EXPORTER" });
  return { ok: true };
}

export async function registerImporter(raw: unknown): Promise<ActionResult> {
  if (!(await rateLimit("register", { limit: 5, windowSec: 3600 })).success)
    return { ok: false, error: "rateLimited" };
  const parsed = importerSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: fieldCode(parsed.error.issues[0]?.message) };
  const d = parsed.data;
  if (await emailTaken(d.email)) return { ok: false, error: "emailExists" };

  const user = await db.user.create({
    data: {
      email: d.email.toLowerCase(),
      passwordHash: await hashPassword(d.password),
      role: "IMPORTER",
      locale: d.locale,
      company: {
        create: {
          type: "IMPORTER",
          nameEn: d.name,
          email: d.email.toLowerCase(),
          phone: d.phone || null,
          website: d.website || null,
          descriptionEn: d.description || null,
          countryIso2: d.country,
          importer: {
            create: {
              industries: toJsonList(d.industries),
              categoriesOfInterest: toJsonList(d.categoriesOfInterest),
              orderVolume: d.orderVolume || null,
            },
          },
        },
      },
    },
  });

  await setSessionCookie({ uid: user.id, email: user.email, role: "IMPORTER" });
  return { ok: true };
}

export async function signInWithPassword(raw: unknown): Promise<ActionResult> {
  if (!(await rateLimit("signin", { limit: 5, windowSec: 900 })).success)
    return { ok: false, error: "rateLimited" };
  const parsed = credentials.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, error: "invalidCredentials" };
  }
  await setSessionCookie({ uid: user.id, email: user.email, role: user.role as Role });
  return { ok: true };
}

export async function signOut(locale: string): Promise<void> {
  await clearSessionCookie();
  redirect(`/${locale}`);
}
