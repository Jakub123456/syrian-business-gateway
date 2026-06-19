"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { INDUSTRIES, label, type Industry } from "@/lib/taxonomy";
import { COUNTRIES } from "@/lib/data/countries";
import { createDemandRequest, setDemandStatus, deleteDemandRequest } from "@/lib/demand/actions";

export type OwnRequest = {
  id: string;
  title: string;
  category: Industry;
  quantity: string | null;
  targetCountryIso2: string | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
};

const EMPTY = { title: "", category: "" as Industry | "", description: "", quantity: "", market: "" };

export function RequestsManager({
  locale,
  dict,
  requests,
}: {
  locale: Locale;
  dict: Dictionary;
  requests: OwnRequest[];
}) {
  const f = dict.requestForm;
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
  const set = (patch: Partial<typeof EMPTY>) => setForm((s) => ({ ...s, ...patch }));
  const categoryLabel = (key: string) => {
    const i = INDUSTRIES.find((x) => x.key === key);
    return i ? label(i, locale) : key;
  };
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "ar" ? "ar" : "en", { year: "numeric", month: "short", day: "numeric" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await createDemandRequest({
      title: form.title,
      category: form.category,
      description: form.description,
      quantity: form.quantity,
      targetCountryIso2: form.market,
    });
    setSubmitting(false);
    if (!res.ok) return setError(res.error);
    setForm(EMPTY);
    router.refresh();
  }

  async function mutate(id: string, fn: () => Promise<{ ok: boolean }>) {
    setBusy(id);
    await fn();
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Create form */}
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-800">{f.new}</h2>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-800">{f.fTitle}</span>
          <input required value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder={f.fTitlePlaceholder} className={inputClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-800">{f.fCategory}</span>
            <select required value={form.category} onChange={(e) => set({ category: e.target.value as Industry })} className={inputClass}>
              <option value="">{f.selectCategory}</option>
              {INDUSTRIES.map((i) => (
                <option key={i.key} value={i.key}>{label(i, locale)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-800">{f.fMarket}</span>
            <select value={form.market} onChange={(e) => set({ market: e.target.value })} className={inputClass}>
              <option value="">{f.ownMarket}</option>
              {COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.iso2}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-800">{f.fQuantity}</span>
          <input value={form.quantity} onChange={(e) => set({ quantity: e.target.value })} placeholder={f.fQuantityPlaceholder} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-800">{f.fDescription}</span>
          <textarea required rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder={f.fDescriptionPlaceholder} className={inputClass} />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-600 disabled:opacity-60">
          {submitting ? f.posting : f.submit}
        </button>
      </form>

      {/* Own requests */}
      <div>
        <h2 className="text-lg font-semibold text-brand-800">{f.yours}</h2>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{f.none}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-brand-800">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{categoryLabel(r.category)} · {fmtDate(r.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "OPEN" ? "bg-brand-100 text-brand-700" : "bg-canvas text-muted"}`}>
                    {r.status === "OPEN" ? f.statusOpen : f.statusClosed}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 text-sm">
                  {r.status === "OPEN" ? (
                    <button onClick={() => mutate(r.id, () => setDemandStatus(r.id, "CLOSED"))} disabled={busy === r.id} className="rounded-md border border-line px-3 py-1.5 font-medium text-muted hover:bg-brand-50 disabled:opacity-50">
                      {f.close}
                    </button>
                  ) : (
                    <button onClick={() => mutate(r.id, () => setDemandStatus(r.id, "OPEN"))} disabled={busy === r.id} className="rounded-md border border-line px-3 py-1.5 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50">
                      {f.reopen}
                    </button>
                  )}
                  <button onClick={() => mutate(r.id, () => deleteDemandRequest(r.id))} disabled={busy === r.id} className="rounded-md border border-line px-3 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                    {f.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
