import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Icon, type IconName } from "./icon";
import { SITE } from "@/lib/site";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  const f = dict.footer;
  const year = new Date().getFullYear();

  const exploreLinks = [
    { href: base, label: dict.nav.home },
    { href: `${base}/directory`, label: dict.nav.directory },
    { href: `${base}/requests`, label: dict.nav.requests },
    { href: `${base}/signin`, label: dict.nav.signIn },
  ];
  // Pages that don't exist yet → placeholder links.
  const companyLinks = [
    { label: f.about },
    { label: f.howItWorks },
    { label: f.terms },
    { label: f.privacy },
  ];
  const socials: { key: keyof typeof SITE.social; icon: IconName; name: string }[] = [
    { key: "linkedin", icon: "linkedin", name: "LinkedIn" },
    { key: "x", icon: "x", name: "X" },
    { key: "instagram", icon: "instagram", name: "Instagram" },
  ];
  const contacts: { icon: IconName; value: string; href?: string }[] = [
    { icon: "mail", value: SITE.email, href: SITE.email ? `mailto:${SITE.email}` : undefined },
    { icon: "phone", value: SITE.phone, href: SITE.phone ? `tel:${SITE.phone.replace(/\s+/g, "")}` : undefined },
    { icon: "pin", value: SITE.location },
  ];

  return (
    <footer className="mt-16 border-t border-line bg-surface print:hidden">
      <div className="container-page py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + social */}
          <div>
            <Link href={base} className="flex items-center gap-2 font-bold text-brand-700">
              <span aria-hidden>🇸🇾</span>
              <span>{dict.brand}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{f.tagline}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">{f.followUs}</p>
            <div className="mt-2 flex gap-2">
              {socials.map((s) => {
                const url = SITE.social[s.key];
                const cls = "flex h-9 w-9 items-center justify-center rounded-full border border-line";
                return url ? (
                  <a
                    key={s.key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`${cls} text-brand-600 hover:bg-brand-50 hover:text-brand-700`}
                  >
                    <Icon name={s.icon} className="h-4 w-4" />
                  </a>
                ) : (
                  <span key={s.key} aria-label={`${s.name} — ${f.unavailable}`} title={f.unavailable} className={`${cls} text-line`}>
                    <Icon name={s.icon} className="h-4 w-4" />
                  </span>
                );
              })}
            </div>
          </div>

          {/* Explore */}
          <FooterColumn title={f.explore}>
            {exploreLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted hover:text-brand-700">{l.label}</Link>
              </li>
            ))}
          </FooterColumn>

          {/* Company (placeholder links) */}
          <FooterColumn title={f.company}>
            {companyLinks.map((l) => (
              <li key={l.label}>
                <a href="#" title={f.unavailable} className="text-muted hover:text-brand-700">{l.label}</a>
              </li>
            ))}
          </FooterColumn>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-brand-800">{f.contactTitle}</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {contacts.map((c, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Icon name={c.icon} className="h-4 w-4 shrink-0 text-brand-500" />
                  {c.value ? (
                    c.href ? (
                      <a href={c.href} className="text-muted hover:text-brand-700">{c.value}</a>
                    ) : (
                      <span className="text-muted">{c.value}</span>
                    )
                  ) : (
                    <span className="italic text-line">{f.unavailable}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {dict.brand}. {f.rights}</p>
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold-400/15 px-2 py-0.5 text-xs font-medium text-gold-600">
            {dict.beta}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-brand-800">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm">{children}</ul>
    </div>
  );
}
