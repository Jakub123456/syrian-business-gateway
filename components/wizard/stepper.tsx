export function Stepper({
  steps,
  current,
  stepLabel,
  ofLabel,
}: {
  steps: string[];
  current: number; // 1-based
  stepLabel: string;
  ofLabel: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted">
        {stepLabel} {current} {ofLabel} {steps.length}
      </p>
      <ol className="mt-3 flex items-center gap-3">
        {steps.map((label, i) => {
          const n = i + 1;
          const active = n === current;
          const done = n < current;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  active
                    ? "bg-brand-600 text-white"
                    : done
                      ? "bg-brand-200 text-brand-800"
                      : "border border-line bg-surface text-muted"
                }`}
              >
                {n}
              </span>
              <span className={`text-sm ${active ? "font-semibold text-brand-800" : "text-muted"}`}>
                {label}
              </span>
              {n < steps.length && <span className="mx-1 text-line">—</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
