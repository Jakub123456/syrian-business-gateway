import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ locale, dict, authed }: { locale: Locale; dict: Dictionary; authed: boolean }) {
  const base = `/${locale}`;
  const navLinks = [
    { href: base, label: dict.nav.home },
    { href: `${base}/directory`, label: dict.nav.directory },
    { href: `${base}/requests`, label: dict.nav.requests },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href={base} className="flex items-center gap-2 font-bold text-brand-700">
          <span aria-hidden className="text-xl">🇸🇾</span>
          <span className="hidden sm:inline">{dict.brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-brand-50 hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          {authed ? (
            <Link
              href={`${base}/dashboard`}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {dict.dashboard.title}
            </Link>
          ) : (
            <>
              <Link
                href={`${base}/signin`}
                className="rounded-md px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                {dict.nav.signIn}
              </Link>
              <Link
                href={`${base}/register`}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {dict.nav.getStarted}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
