"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  required,
  optionalLabel,
  children,
}: {
  label: string;
  required?: boolean;
  optionalLabel?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-800">
        {label}
        {required ? (
          <span className="text-gold-600"> *</span>
        ) : optionalLabel ? (
          <span className="ms-1 text-xs font-normal text-muted">({optionalLabel})</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputClass} rows={3} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputClass} />;
}

export function ChipToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? "border-brand-500 bg-brand-50 font-medium text-brand-700"
          : "border-line bg-surface text-muted hover:border-brand-300"
      }`}
    >
      {children}
    </button>
  );
}
