"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { INDUSTRIES, ORDER_VOLUMES, label, type Industry } from "@/lib/taxonomy";
import { COUNTRIES } from "@/lib/data/countries";
import { registerImporter } from "@/lib/auth/actions";
import { Stepper } from "./stepper";
import { Field, TextInput, TextArea, Select, ChipToggle } from "./fields";
import { Icon } from "@/components/icon";

const STORAGE_KEY = "sbg:importer-draft";

type Draft = {
  name: string;
  email: string;
  password: string;
  phone: string;
  website: string;
  industries: Industry[];
  country: string;
  description: string;
  categoriesOfInterest: Industry[];
  orderVolume: string;
};

const EMPTY: Draft = {
  name: "", email: "", password: "", phone: "", website: "", industries: [],
  country: "", description: "", categoriesOfInterest: [], orderVolume: "",
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ImporterWizard({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const w = dict.wizard;
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Resume a saved draft. setState-in-effect is correct here: localStorage is client-only,
  // so reading it in a lazy initializer would mismatch the SSR'd markup.
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

  // Never persist the password to localStorage.
  useEffect(() => {
    if (!hydrated) return;
    const { password: _pw, ...persistable } = draft;
    void _pw;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  }, [draft, hydrated]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const steps = [w.stepCompany, w.stepDetails];

  function next() {
    setError("");
    if (step === 1) {
      if (!draft.name || !draft.email || draft.industries.length === 0)
        return setError(w.companyName + " · " + w.contactEmail + " · " + w.industries);
      if (draft.password.length < 8) return setError(w.passwordHint);
    }
    if (step === 2) return submit();
    setStep((s) => s + 1);
  }

  async function submit() {
    setError("");
    if (!draft.country || draft.categoriesOfInterest.length === 0)
      return setError(w.country + " · " + w.categoriesOfInterest);
    setSubmitting(true);
    const result = await registerImporter({ ...draft, locale });
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    localStorage.removeItem(STORAGE_KEY);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-gold-400/40 bg-gold-400/10 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/20 text-gold-600">
          <Icon name="check" className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-brand-800">{w.doneTitle}</h2>
        <p className="mt-2 text-muted">{w.doneBody}</p>
        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="mt-6 rounded-lg bg-gold-500 px-5 py-2.5 font-semibold text-white hover:bg-gold-600"
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
            <Field label={w.companyName} required>
              <TextInput value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Global Foods Ltd." />
            </Field>
            <Field label={w.contactEmail} required>
              <TextInput type="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} placeholder="sourcing@company.com" autoComplete="email" />
            </Field>
            <Field label={w.password} required>
              <TextInput type="password" value={draft.password} onChange={(e) => set({ password: e.target.value })} placeholder={w.passwordHint} autoComplete="new-password" />
            </Field>
            <Field label={w.phone} optionalLabel={dict.common.optional}>
              <TextInput value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+1 ..." />
            </Field>
            <Field label={w.website} optionalLabel={dict.common.optional}>
              <TextInput value={draft.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://..." />
            </Field>
          </div>
          <Field label={w.industries} required>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <ChipToggle key={i.key} active={draft.industries.includes(i.key)} onClick={() => set({ industries: toggle(draft.industries, i.key) })}>
                  {label(i, locale)}
                </ChipToggle>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-800">{w.detailsHeading}</h2>
          <Field label={w.country} required>
            <Select value={draft.country} onChange={(e) => set({ country: e.target.value })}>
              <option value="">{w.selectCountry}</option>
              {COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.iso2}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
              ))}
            </Select>
          </Field>
          <Field label={w.categoriesOfInterest} required>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <ChipToggle key={i.key} active={draft.categoriesOfInterest.includes(i.key)} onClick={() => set({ categoriesOfInterest: toggle(draft.categoriesOfInterest, i.key) })}>
                  {label(i, locale)}
                </ChipToggle>
              ))}
            </div>
          </Field>
          <Field label={w.orderVolume} optionalLabel={dict.common.optional}>
            <div className="flex flex-wrap gap-2">
              {ORDER_VOLUMES.map((v) => (
                <ChipToggle key={v} active={draft.orderVolume === v} onClick={() => set({ orderVolume: draft.orderVolume === v ? "" : v })}>
                  {v}
                </ChipToggle>
              ))}
            </div>
          </Field>
          <Field label={w.description} optionalLabel={dict.common.optional}>
            <TextArea value={draft.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {(dict.errors as Record<string, string>)[error] ?? `${dict.common.required}: ${error}`}
        </p>
      )}

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
            className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-600 disabled:opacity-60"
          >
            {step === 2 ? (submitting ? dict.common.submitting : dict.common.submit) : dict.common.next}
          </button>
        </div>
      </div>
    </div>
  );
}
