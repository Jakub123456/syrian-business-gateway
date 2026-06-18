"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { signInWithPassword } from "@/lib/auth/actions";

export function SignInForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const s = dict.signin;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await signInWithPassword({ email, password });
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brand-800">{s.email}</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} autoComplete="email" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brand-800">{s.password}</span>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? dict.common.submitting : s.signInBtn}
      </button>

      <p className="text-center text-sm text-muted">
        {s.noAccount}{" "}
        <Link href={`/${locale}/register`} className="font-semibold text-brand-700 underline">
          {dict.nav.getStarted}
        </Link>
      </p>
    </form>
  );
}
