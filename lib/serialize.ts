// SQLite has no scalar lists, so list columns are stored as JSON text. These helpers
// (de)serialize them at the data-access boundary. Swapping to Postgres makes these no-ops.

export function toJsonList(values: string[]): string {
  return JSON.stringify(values ?? []);
}

export function fromJsonList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
