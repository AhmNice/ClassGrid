import { Check, Loader } from "lucide-react";

export interface LoadingState {
  /** Stable key for React list rendering. Defaults to `message`. */
  id?: string;
  message: string;
  loading: boolean;
}

interface LoadElementProps {
  /** List of named loading states to track. */
  states: LoadingState[];
  /** Optional heading above the list, for example "Getting things ready". */
  title?: string;
  /** Optional: extra className for the wrapper. */
  className?: string;
  /** Optional: size of the spinner / check icon (default 14). */
  size?: number;
}

const LoadElement = ({ states, title, className, size = 14 }: LoadElementProps) => {
  if (states.length === 0) return null;

  const total = states.length;
  const done = states.filter((s) => !s.loading).length;
  const percent = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!allDone}
      className={[
        "mx-auto w-full max-w-xs rounded-sm border border-outline-variant/40 bg-surface p-space-lg",
        className ?? "",
      ].join(" ")}
    >
      {title && (
        <p className="mb-space-md font-heading text-sm font-bold text-on-surface">
          {title}
        </p>
      )}

      {/* Overall progress. The steps below say what is happening. */}
      <div
        role="progressbar"
        aria-label="Loading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mb-space-md h-1 overflow-hidden rounded-full bg-surface-container-high"
      >
        <div
          className={[
            "h-full rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none",
            allDone ? "bg-success" : "bg-primary",
          ].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul>
        {states.map((s, i) => {
          const key = s.id ?? `${s.message}-${i}`;
          const isLast = i === total - 1;

          return (
            <li
              key={key}
              aria-current={s.loading ? "step" : undefined}
              className="flex gap-space-md"
            >
              {/* The status circle, and the line down to the next step. */}
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={[
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors motion-reduce:transition-none",
                    s.loading
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-success-container text-on-success-container",
                  ].join(" ")}
                >
                  {s.loading ? (
                    <Loader
                      size={size}
                      strokeWidth={2}
                      className="motion-safe:animate-spin"
                    />
                  ) : (
                    <Check size={size} strokeWidth={2.5} />
                  )}
                </span>
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={[
                      "my-space-xs w-px flex-1 transition-colors motion-reduce:transition-none",
                      s.loading ? "bg-outline-variant" : "bg-success/50",
                    ].join(" ")}
                  />
                )}
              </div>

              <p
                className={[
                  "pt-0.5 text-sm transition-colors motion-reduce:transition-none",
                  isLast ? "" : "pb-space-md",
                  s.loading
                    ? "font-medium text-on-surface"
                    : "text-on-surface-variant",
                ].join(" ")}
              >
                {s.message}
                <span className="sr-only">{s.loading ? " (loading)" : " (done)"}</span>
              </p>
            </li>
          );
        })}
      </ul>

      <p aria-hidden="true" className="mt-space-md font-mono text-xs text-on-surface-variant">
        {done} of {total} ready
      </p>
    </div>
  );
};

export default LoadElement;