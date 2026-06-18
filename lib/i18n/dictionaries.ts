import "server-only";
import type { Locale } from "./config";

// Lazy-loaded message catalogs. Server Components call getDictionary(locale) and pass
// the typed object down. Keeping this dependency-free avoids coupling to any i18n library
// (deliberate choice for Next 16 compatibility — see plan.md).
const dictionaries = {
  en: () => import("../../messages/en.json").then((m) => m.default),
  ar: () => import("../../messages/ar.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
