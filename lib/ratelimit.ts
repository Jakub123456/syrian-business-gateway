import "server-only";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting for sensitive actions (sign-in, registration). Uses Upstash Redis when
// configured (shared across serverless instances — the correct choice for production);
// otherwise falls back to a per-instance in-memory limiter (fine for local dev, best-effort
// in prod). Configure with UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = hasUpstash ? Redis.fromEnv() : null;
const limiters = new Map<string, Ratelimit>();

function limiterFor(limit: number, windowSec: number): Ratelimit {
  const key = `${limit}:${windowSec}`;
  let l = limiters.get(key);
  if (!l) {
    l = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "sbg-rl",
      analytics: false,
    });
    limiters.set(key, l);
  }
  return l;
}

// In-memory fallback (per-instance; resets on restart).
const memory = new Map<string, number[]>();
function memoryAllow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    memory.set(key, recent);
    return false;
  }
  recent.push(now);
  memory.set(key, recent);
  return true;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function rateLimit(
  scope: string,
  { limit, windowSec }: { limit: number; windowSec: number },
): Promise<{ success: boolean }> {
  const key = `${scope}:${await clientIp()}`;
  try {
    if (redis) {
      const { success } = await limiterFor(limit, windowSec).limit(key);
      return { success };
    }
  } catch {
    // Redis unreachable — fall through to in-memory rather than block legitimate users.
  }
  return { success: memoryAllow(key, limit, windowSec * 1000) };
}
