import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SiteFooter({ dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <span aria-hidden>🇸🇾</span>
          <span className="font-semibold text-brand-700">{dict.brand}</span>
          <span className="rounded bg-gold-400/20 px-1.5 py-0.5 text-xs font-medium text-gold-600">
            {dict.beta}
          </span>
        </p>
        <p>© {dict.brand}</p>
      </div>
    </footer>
  );
}
