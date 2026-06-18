import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Stateless sessions: a signed JWT in an httpOnly cookie. Verifiable in both the Node
// runtime (server actions/components) and the Edge runtime (proxy.ts) since jose is
// isomorphic. Swapping to Auth.js later only touches this file + the action layer.

export const SESSION_COOKIE = "sbg_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "EXPORTER" | "IMPORTER" | "ADMIN";
export type SessionPayload = { uid: string; email: string; role: Role };

function key(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    const { uid, email, role } = payload as Record<string, unknown>;
    if (typeof uid === "string" && typeof email === "string" && typeof role === "string") {
      return { uid, email, role: role as Role };
    }
    return null;
  } catch {
    return null;
  }
}

// --- cookie helpers (Node runtime: server actions, route handlers, server components) ---

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
