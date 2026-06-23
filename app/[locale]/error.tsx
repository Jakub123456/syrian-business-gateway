"use client";

import Link from "next/link";

// Catches unhandled render errors in this segment (e.g. a database outage on a
// DB-backed page) and shows a branded page with a retry instead of a raw 500.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">We hit a snag</h1>
      <p className="mt-2 max-w-md text-muted">An unexpected error occurred. Please try again in a moment.</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
