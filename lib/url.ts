// URL helpers. Inputs are user-controlled, so normalise at write time and only ever render
// http(s) links (guards against javascript:/data: URIs).

export function normalizeWebsite(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export function isValidHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns a safe http(s) URL to render as a link, or null. */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return isValidHttpUrl(raw.trim()) ? raw.trim() : null;
}
