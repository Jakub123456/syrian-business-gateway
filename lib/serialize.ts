// List columns are stored as JSON text (an accommodation carried over from the SQLite
// phase that works fine on Postgres). These helpers (de)serialize them at the data-access
// boundary. To move to native Postgres arrays later, make these pass-throughs and change
// the column types in the schema.

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
