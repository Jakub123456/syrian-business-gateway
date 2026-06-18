"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

// Swaps the leading locale segment of the current path and persists the choice in a
// cookie so the proxy honours it on the next un-prefixed visit.
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const other: Locale = locale === "ar" ? "en" : "ar";

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    router.push(segments.join("/") || "/");
  }

  return (
    <button
      type="button"
      onClick={() => switchTo(other)}
      className="rounded-md border border-line px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-brand-50 hover:text-brand-700"
      aria-label={other === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      {other === "ar" ? "عربي" : "EN"}
    </button>
  );
}
