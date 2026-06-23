import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

// Public base URL (set NEXT_PUBLIC_SITE_URL in prod, e.g. https://yourdomain.com).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://syrian-business-gateway.vercel.app";

// hreflang + canonical for a bilingual (en/ar) page. `path` is the locale-less path,
// e.g. "/directory" or "/directory/abc" ("" for the landing page).
export function localeAlternates(locale: Locale, path = ""): NonNullable<Metadata["alternates"]> {
  const p = path && path !== "/" ? path : "";
  return {
    canonical: `/${locale}${p}`,
    languages: { en: `/en${p}`, ar: `/ar${p}`, "x-default": `/en${p}` },
  };
}
