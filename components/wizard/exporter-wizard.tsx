"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  INDUSTRIES,
  GOVERNORATES,
  EXPORT_STAGES,
  CERTIFICATIONS,
  EMPLOYEE_BUCKETS,
  label,
  type Industry,
  type ExportStage,
} from "@/lib/taxonomy";
import { COUNTRIES } from "@/lib/data/countries";
import { registerExporter } from "@/lib/auth/actions";
import { Stepper } from "./stepper";
import { Field, TextInput, TextArea, Select, ChipToggle } from "./fields";

const STORAGE_KEY = "sbg:exporter-draft";

type Draft = {
  nameEn: string;
  nameAr: string;
  email: string;
  password: string;
  phone: string;
  website: string;
  description: string;
  governorate: string;
  sectors: Industry[];
  products: { nameEn: string; category: Industry }[];
  certifications: string[];
  yearEstablished: string;
  employeeBucket: string;
  capacity: string;
  exportStage: ExportStage | "";
  currentMarkets: string[];
  targetMarkets: string[];
  hasLicense: boolean;
};

const EMPTY: Draft = {
  nameEn: "", nameAr: "", email: "", password: "", phone: "", website: "",
  description: "", governorate: "", sectors: [], products: [], certifications: [],
  yearEstablished: "", employeeBucket: "", capacity: "",
  exportStage: "", currentMarkets: [], targetMarkets: [], hasLicense: false,
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ExporterWizard({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const w = dict.wizard;
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load any saved draft (the autosave "resume" behaviour from the plan). Reading a
  // client-only store on mount is the correct use of setState-in-effect — SSR can't
  // see localStorage, so a lazy initializer would cause a hydration mismatch.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setDraft({ ...EMPTY, ...JSON.parse(raw) });
      } catch {}
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Autosave on change — writes to the external store only (no React state).
  // Never persist the password to localStorage.
  useEffect(() => {
    if (!hydrated) return;
    const { password: _pw, ...persistable } = draft;
    void _pw;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  }, [draft, hydrated]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const steps = [w.stepCompany, w.stepDetails, w.stepExportStage];

  function next() {
    setError("");
    if (step === 1) {
      if (!draft.nameEn || !draft.email) return setError(w.companyNameEn + " + " + w.contactEmail);
      if (draft.password.length < 8) return setError(w.passwordHint);
    }
    if (step === 2 && (!draft.description || !draft.governorate || draft.sectors.length === 0))
      return setError(w.description + " · " + w.governorate + " · " + w.sectors);
    if (step === 3) return submit();
    setStep((s) => s + 1);
  }

  async function submit() {
    if (!draft.exportStage || draft.targetMarkets.length === 0)
      return setError(w.exportStage + " · " + w.targetMarkets);
    setSubmitting(true);
    setError("");
    const result = await registerExporter({ ...draft, locale });
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    localStorage.removeItem(STORAGE_KEY);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-10 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="mt-4 text-xl font-semibold text-brand-800">{w.doneTitle}</h2>
        <p className="mt-2 text-muted">{w.doneBody}</p>
        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
        >
          {dict.dashboard.title}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
      <Stepper steps={steps} current={step} stepLabel={dict.common.step} ofLabel={dict.common.of} />
      <hr className="my-6 border-line" />

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-800">{w.companyHeading}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={w.companyNameEn} required>
              <TextInput value={draft.nameEn} onChange={(e) => set({ nameEn: e.target.value })} placeholder="e.g. Al-Nour Olive Oil Co." />
            </Field>
            <Field label={w.companyNameAr} optionalLabel={dict.common.optional}>
              <TextInput dir="rtl" value={draft.nameAr} onChange={(e) => set({ nameAr: e.target.value })} placeholder="مثال: شركة النور لزيت الزيتون" />
            </Field>
            <Field label={w.contactEmail} required>
              <TextInput type="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} placeholder="contact@company.com" autoComplete="email" />
            </Field>
            <Field label={w.password} required>
              <TextInput type="password" value={draft.password} onChange={(e) => set({ password: e.target.value })} placeholder={w.passwordHint} autoComplete="new-password" />
            </Field>
            <Field label={w.phone} optionalLabel={dict.common.optional}>
              <TextInput value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+963 ..." />
            </Field>
            <Field label={w.website} optionalLabel={dict.common.optional}>
              <TextInput value={draft.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://..." />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-800">{w.detailsHeading}</h2>
          <Field label={w.description} required>
            <TextArea value={draft.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={w.governorate} required>
              <Select value={draft.governorate} onChange={(e) => set({ governorate: e.target.value })}>
                <option value="">{w.selectGovernorate}</option>
                {GOVERNORATES.map((g) => (
                  <option key={g.key} value={g.key}>{label(g, locale)}</option>
                ))}
              </Select>
            </Field>
            <Field label={w.yearEstablished} optionalLabel={dict.common.optional}>
              <TextInput type="number" value={draft.yearEstablished} onChange={(e) => set({ yearEstablished: e.target.value })} placeholder="2010" />
            </Field>
          </div>
          <Field label={w.sectors} required>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <ChipToggle key={i.key} active={draft.sectors.includes(i.key)} onClick={() => set({ sectors: toggle(draft.sectors, i.key) })}>
                  {i.icon} {label(i, locale)}
                </ChipToggle>
              ))}
            </div>
          </Field>
          <Field label={w.certsHeld} optionalLabel={dict.common.optional}>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map((c) => (
                <ChipToggle key={c} active={draft.certifications.includes(c)} onClick={() => set({ certifications: toggle(draft.certifications, c) })}>
                  {c}
                </ChipToggle>
              ))}
            </div>
          </Field>
          <Field label={w.employees} optionalLabel={dict.common.optional}>
            <div className="flex flex-wrap gap-2">
              {EMPLOYEE_BUCKETS.map((b) => (
                <ChipToggle key={b} active={draft.employeeBucket === b} onClick={() => set({ employeeBucket: draft.employeeBucket === b ? "" : b })}>
                  {b}
                </ChipToggle>
              ))}
            </div>
          </Field>
          <Field label={w.capacity} optionalLabel={dict.common.optional}>
            <TextInput value={draft.capacity} onChange={(e) => set({ capacity: e.target.value })} placeholder="e.g. 200 tons / year" />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-brand-800">{w.exportStageHeading}</h2>
          <Field label={w.exportStage} required>
            <div className="grid gap-2">
              {EXPORT_STAGES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => set({ exportStage: s.key })}
                  className={`rounded-lg border p-3 text-start ${
                    draft.exportStage === s.key ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-300"
                  }`}
                >
                  <span className="font-medium text-brand-800">{label(s, locale)}</span>
                  <span className="block text-xs text-muted">{s.hint}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label={w.targetMarkets} required>
            <CountryPicker locale={locale} selected={draft.targetMarkets} onToggle={(iso) => set({ targetMarkets: toggle(draft.targetMarkets, iso) })} />
          </Field>
          <Field label={w.currentMarkets} optionalLabel={dict.common.optional}>
            <CountryPicker locale={locale} selected={draft.currentMarkets} onToggle={(iso) => set({ currentMarkets: toggle(draft.currentMarkets, iso) })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.hasLicense} onChange={(e) => set({ hasLicense: e.target.checked })} className="h-4 w-4" />
            {w.hasLicense}
          </label>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{dict.common.required}: {error}</p>}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { setError(""); setStep((s) => Math.max(1, s - 1)); }}
          disabled={step === 1}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted enabled:hover:bg-brand-50 disabled:opacity-40"
        >
          {dict.common.back}
        </button>
        <div className="flex items-center gap-3">
          {hydrated && <span className="text-xs text-brand-600">{w.draftSaved} ✓</span>}
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {step === 3 ? (submitting ? dict.common.submitting : dict.common.submit) : dict.common.next}
          </button>
        </div>
      </div>
    </div>
  );
}

function CountryPicker({
  locale,
  selected,
  onToggle,
}: {
  locale: Locale;
  selected: string[];
  onToggle: (iso2: string) => void;
}) {
  return (
    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-line p-3">
      {COUNTRIES.map((c) => (
        <ChipToggle key={c.iso2} active={selected.includes(c.iso2)} onClick={() => onToggle(c.iso2)}>
          {c.flag} {locale === "ar" ? c.nameAr : c.nameEn}
        </ChipToggle>
      ))}
    </div>
  );
}
