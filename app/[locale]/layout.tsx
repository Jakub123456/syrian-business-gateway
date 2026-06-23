import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, dir, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// IBM Plex Sans Arabic carries both Latin and Arabic glyphs, so one family serves
// both locales cleanly (no font swap on language toggle).
const appSans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-app-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Syrian Business Gateway",
    template: "%s · Syrian Business Gateway",
  },
  description: "B2B gateway connecting Syrian exporters with global buyers.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const session = await getSession();

  return (
    <html lang={locale} dir={dir(locale as Locale)} className={`${appSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          {dict.common.skipToContent}
        </a>
        <SiteHeader locale={locale as Locale} dict={dict} authed={!!session} />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter locale={locale as Locale} dict={dict} />
      </body>
    </html>
  );
}
