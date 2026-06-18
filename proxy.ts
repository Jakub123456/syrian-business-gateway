import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { locales, defaultLocale } from "./lib/i18n/config";

const SESSION_COOKIE = "sbg_session";

// Next.js 16 renamed Middleware to Proxy. Two jobs:
//  1. Redirect un-prefixed paths to a locale (negotiating from Accept-Language).
//  2. Gate /[locale]/dashboard behind a valid session (optimistic edge check; the page
//     re-verifies server-side). jose is verified inline so this stays edge-safe.
function resolveLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) return cookie;
  const header = request.headers.get("accept-language") ?? "";
  const preferred = header.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  if (preferred && (locales as readonly string[]).includes(preferred)) return preferred;
  return defaultLocale;
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!hasLocale) {
    const locale = resolveLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Protect /[locale]/dashboard
  if (segments[2] === "dashboard" && !(await hasValidSession(request))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${segments[1]}/signin`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
