import { ChevronDown, X } from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useForm,
  type FieldErrors,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { useAcademicSessionStore } from "../../store/academic-session.store";
import {
  formatDate,
  formatRange,
  fromInputDate,
  toInputDate,
} from "../../utils/sessionUtils";
import type {
  ITerm,
  ITermCreate,
} from "../../interface/AcademicSession.interface";

/* ---------------------------------- types --------------------------------- */

// Replace with your real TermName if it differs.
export type TermName = "FIRST" | "SECOND" | "THIRD";
const TERM_NAMES: TermName[] = ["FIRST", "SECOND", "THIRD"];

/**
 * The form keeps dates as "YYYY-MM-DD" strings, which is what the date inputs
 * use. They are turned into Date objects only when the form is submitted.
 */
interface TermFormValues {
  name: TermName | "";
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  midTermStartDate: string;
  midTermEndDate: string;
  examStartDate: string;
  examEndDate: string;
}

interface AddTermModalProps {
  sessionId: string;
  sessionStart: Date;
  sessionEnd: Date;
  /** Every term already in this session. */
  existingTerms: ITerm[];
  /** Pass a term to edit it; leave out to create one. */
  term?: ITerm;
  onClose: () => void;
}

/* --------------------------------- helpers -------------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const INPUT =
  "w-full rounded-sm border bg-(--input-bg) px-space-md py-space-sm text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const borderFor = (hasError: boolean) =>
  hasError ? "border-error" : "border-(--input-border)";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

const Field = ({ label, htmlFor, error, children }: FieldProps) => (
  <div className="space-y-space-xs">
    <label htmlFor={htmlFor} className="text-sm font-medium text-on-surface">
      {label}
    </label>
    {children}
    {error && (
      <p id={`${htmlFor}-error`} role="alert" className="text-xs text-error">
        {error}
      </p>
    )}
  </div>
);

/* ---------------------------------- modal --------------------------------- */

const AddTermModal = ({
  sessionId,
  sessionStart,
  sessionEnd,
  existingTerms,
  term,
  onClose,
}: AddTermModalProps) => {
  const isEditing = !!term;

  const others = existingTerms.filter((t) => t.id !== term?.id);

  const sessionStartStr = toInputDate(sessionStart);
  const sessionEndStr = toInputDate(sessionEnd);

  const uid = useId();
  const titleId = `${uid}-title`;
  const ids = {
    name: `${uid}-name`,
    start: `${uid}-start`,
    end: `${uid}-end`,
    isCurrent: `${uid}-isCurrent`,
    breakStart: `${uid}-break-start`,
    breakEnd: `${uid}-break-end`,
    examStart: `${uid}-exam-start`,
    examEnd: `${uid}-exam-end`,
    extras: `${uid}-extras`,
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  // Only exams are optional now; mid-term break is required.
  const hasExams = !!(term?.examStartDate || term?.examEndDate);
  const [showExtras, setShowExtras] = useState(hasExams);
  const updateTerm = useAcademicSessionStore((state) => state.updateTerm);
  const createTerm = useAcademicSessionStore((state) => state.createTerm);

  // New terms default to the first name not used yet.
  const suggestedName =
    TERM_NAMES.find((n) => !others.some((o) => o.name === n)) ?? "";

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TermFormValues>({
    defaultValues: {
      name: term ? (term.name as TermName) : suggestedName,
      startDate: toInputDate(term?.startDate ?? null),
      endDate: toInputDate(term?.endDate ?? null),
      isCurrent: term?.isCurrent ?? false,
      midTermStartDate: toInputDate(term?.midTermStartDate ?? null),
      midTermEndDate: toInputDate(term?.midTermEndDate ?? null),
      examStartDate: toInputDate(term?.examStartDate ?? null),
      examEndDate: toInputDate(term?.examEndDate ?? null),
    },
  });

  // Lock page scroll, focus the first field, and restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("select, input")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const close = () => {
    if (!isSubmitting) onClose();
  };

  // Escape closes; Tab stays inside the dialog.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), select:not([disabled])",
      ) ?? [],
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* ------------------------------- validation ------------------------------ */

  const withinSession = (value: string) => {
    if (sessionStartStr && value < sessionStartStr) {
      return `Must be on or after the session start (${formatDate(sessionStart)})`;
    }
    if (sessionEndStr && value > sessionEndStr) {
      return `Must be on or before the session end (${formatDate(sessionEnd)})`;
    }
    return true;
  };

  const withinTerm = (value: string) => {
    const start = getValues("startDate");
    const end = getValues("endDate");
    if ((start && value < start) || (end && value > end)) {
      return "Must fall within the term dates";
    }
    return true;
  };

  // Mid-term break is REQUIRED: both dates are mandatory, in order,
  // and inside the term.
  const breakRules = {
    start: {
      validate: (value: string) => {
        if (!value) return "Choose when the break starts";
        return withinTerm(value);
      },
      onChange: () => {
        if (getValues("midTermEndDate")) trigger("midTermEndDate");
      },
    },
    end: {
      validate: (value: string) => {
        const start = getValues("midTermStartDate");
        if (!value) return "Choose when the break ends";
        if (start && value < start) {
          return "The break can't end before it starts";
        }
        return withinTerm(value);
      },
    },
  };

  // Exams remain optional: both dates or neither, in order, and inside
  // the term.
  const examRules = {
    start: {
      validate: (value: string) => {
        if (!value) {
          return getValues("examEndDate")
            ? "Choose when the exams start"
            : true;
        }
        return withinTerm(value);
      },
      onChange: () => {
        if (getValues("examEndDate")) trigger("examEndDate");
      },
    },
    end: {
      validate: (value: string) => {
        const start = getValues("examStartDate");
        if (!value) return start ? "Choose when the exams end" : true;
        if (start && value < start) {
          return "The exams can't end before they start";
        }
        return withinTerm(value);
      },
    },
  };

  /* -------------------------------- submitting ------------------------------ */

  const onInvalid = (errs: FieldErrors<TermFormValues>) => {
    // Reveal the exams section if that is where the problem is.
    if (errs.examStartDate || errs.examEndDate) {
      setShowExtras(true);
    }
  };

  const submit = async (values: TermFormValues) => {
    const data: ITermCreate = {
      sessionId,
      name: values.name as TermName,
      startDate: fromInputDate(values.startDate),
      endDate: fromInputDate(values.endDate),
      isCurrent: values.isCurrent,
      midTermStartDate: fromInputDate(values.midTermStartDate),
      midTermEndDate: fromInputDate(values.midTermEndDate),
      examStartDate: fromInputDate(values.examStartDate),
      examEndDate: fromInputDate(values.examEndDate),
    };

    try {
      const res = isEditing
        ? await updateTerm(sessionId, term.id, data)
        : await createTerm(sessionId, data);
      console.log("AddTermModal: submit result", res);
      if (res && res.success) onClose();
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not save the term. Try again.",
      });
    }
  };

  /* ---------------------------------- view ---------------------------------- */

  const dateInput = (
    id: string,
    key: keyof TermFormValues,
    options: UseFormRegisterReturn,
    extra?: { min?: string; max?: string },
  ) => (
    <input
      id={id}
      type="date"
      min={extra?.min || undefined}
      max={extra?.max || undefined}
      aria-invalid={!!errors[key]}
      aria-describedby={errors[key] ? `${id}-error` : undefined}
      className={cx(INPUT, borderFor(!!errors[key]))}
      {...options}
    />
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay-bg) p-space-lg"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between gap-space-md border-b border-outline-variant/30 p-space-lg">
          <h2
            id={titleId}
            className="font-heading text-lg font-semibold text-on-surface"
          >
            {isEditing && term ? `Edit ${term.name}` : "Add term"}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={cx(
              "grid h-8 w-8 shrink-0 place-items-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface motion-reduce:transition-none",
              FOCUS_RING,
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit, onInvalid)} noValidate>
          <div className="space-y-space-lg p-space-lg">
            {/* Limits the dates must fit inside */}
            <div className="space-y-space-xs rounded-sm bg-surface-container p-space-md text-sm text-on-surface-variant">
              <p className="text-xs">
                Session runs{" "}
                <span className="font-mono text-on-surface">
                  {formatRange(sessionStart, sessionEnd)}
                </span>
              </p>
              {others.length > 0 && (
                <p className="text-xs">
                  Other terms:{" "}
                  {others
                    .map(
                      (o) =>
                        `${o.name} (${formatRange(o.startDate ?? null, o.endDate ?? null)})`,
                    )
                    .join(", ")}
                </p>
              )}
            </div>

            {errors.root?.server && (
              <p
                role="alert"
                className="rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
              >
                {errors.root.server.message}
              </p>
            )}

            <Field label="Term" htmlFor={ids.name} error={errors.name?.message}>
              <select
                id={ids.name}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                className={cx(INPUT, borderFor(!!errors.name))}
                {...register("name", {
                  validate: (value) => {
                    if (!value) return "Select a term";
                    if (others.some((o) => o.name === value)) {
                      return `${value} already exists in this session`;
                    }
                    return true;
                  },
                })}
              >
                <option value="" disabled>
                  Select a term
                </option>
                {TERM_NAMES.map((name) => (
                  <option
                    key={name}
                    value={name}
                    disabled={others.some((o) => o.name === name)}
                  >
                    {name.charAt(0) + name.slice(1).toLowerCase()} Term
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-space-lg sm:grid-cols-2">
              <Field
                label="Start date"
                htmlFor={ids.start}
                error={errors.startDate?.message}
              >
                {dateInput(
                  ids.start,
                  "startDate",
                  register("startDate", {
                    validate: (value) =>
                      value ? withinSession(value) : "Choose a start date",
                    // Re-check the end date, but only once one has been picked.
                    onChange: () => {
                      if (getValues("endDate")) trigger("endDate");
                    },
                  }),
                  { min: sessionStartStr, max: sessionEndStr },
                )}
              </Field>

              <Field
                label="End date"
                htmlFor={ids.end}
                error={errors.endDate?.message}
              >
                {dateInput(
                  ids.end,
                  "endDate",
                  register("endDate", {
                    validate: (value) => {
                      if (!value) return "Choose an end date";
                      const start = getValues("startDate");
                      if (start && value <= start) {
                        return "End date must be after the start date";
                      }
                      const inSession = withinSession(value);
                      if (inSession !== true) return inSession;

                      const clash = start
                        ? others.find(
                            (o) =>
                              toInputDate(o.startDate) <= value &&
                              toInputDate(o.endDate) >= start,
                          )
                        : undefined;
                      if (clash) {
                        return `Overlaps ${clash.name} (${formatRange(
                          clash.startDate ?? null,
                          clash.endDate ?? null,
                        )})`;
                      }
                      return true;
                    },
                  }),
                  { min: sessionStartStr, max: sessionEndStr },
                )}
              </Field>
            </div>

            {/* Current term checkbox */}
            <div className="flex items-center gap-space-sm">
              <input
                type="checkbox"
                id={ids.isCurrent}
                aria-describedby={
                  errors.isCurrent ? `${ids.isCurrent}-error` : undefined
                }
                className={cx(
                  "h-4 w-4 shrink-0 rounded-sm border text-primary accent-primary",
                  FOCUS_RING,
                  errors.isCurrent && "border-error",
                )}
                {...register("isCurrent")}
              />
              <label
                htmlFor={ids.isCurrent}
                className="text-sm font-medium text-on-surface"
              >
                Current term
              </label>
              {errors.isCurrent?.message && (
                <p
                  id={`${ids.isCurrent}-error`}
                  role="alert"
                  className="text-xs text-error"
                >
                  {errors.isCurrent.message}
                </p>
              )}
            </div>

            {/* Mid-term break — always visible and required */}
            <fieldset className="space-y-space-sm">
              <legend className="text-sm font-medium text-on-surface">
                Mid-term break
              </legend>
              <div className="grid gap-space-lg sm:grid-cols-2">
                <Field
                  label="From"
                  htmlFor={ids.breakStart}
                  error={errors.midTermStartDate?.message}
                >
                  {dateInput(
                    ids.breakStart,
                    "midTermStartDate",
                    register("midTermStartDate", breakRules.start),
                  )}
                </Field>
                <Field
                  label="To"
                  htmlFor={ids.breakEnd}
                  error={errors.midTermEndDate?.message}
                >
                  {dateInput(
                    ids.breakEnd,
                    "midTermEndDate",
                    register("midTermEndDate", breakRules.end),
                  )}
                </Field>
              </div>
            </fieldset>

            {/* Optional details — exams only */}
            <div>
              <button
                type="button"
                onClick={() => setShowExtras((v) => !v)}
                aria-expanded={showExtras}
                aria-controls={ids.extras}
                className={cx(
                  "inline-flex items-center gap-space-xs rounded-sm text-sm font-medium text-on-surface",
                  FOCUS_RING,
                )}
              >
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={cx(
                    "transition-transform motion-reduce:transition-none",
                    showExtras && "rotate-180",
                  )}
                />
                Examinations (optional)
              </button>

              {/* Kept mounted (just hidden) so its fields still validate. */}
              <div
                id={ids.extras}
                hidden={!showExtras}
                className="mt-space-md space-y-space-lg"
              >
                <fieldset className="space-y-space-sm">
                  <legend className="text-sm font-medium text-on-surface">
                    Examinations
                  </legend>
                  <div className="grid gap-space-lg sm:grid-cols-2">
                    <Field
                      label="From"
                      htmlFor={ids.examStart}
                      error={errors.examStartDate?.message}
                    >
                      {dateInput(
                        ids.examStart,
                        "examStartDate",
                        register("examStartDate", examRules.start),
                      )}
                    </Field>
                    <Field
                      label="To"
                      htmlFor={ids.examEnd}
                      error={errors.examEndDate?.message}
                    >
                      {dateInput(
                        ids.examEnd,
                        "examEndDate",
                        register("examEndDate", examRules.end),
                      )}
                    </Field>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-space-sm border-t border-outline-variant/30 p-space-lg">
            <button
              type="button"
              onClick={close}
              disabled={isSubmitting}
              className={cx(
                "rounded-sm px-space-lg py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING,
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cx(
                "rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING,
              )}
            >
              {isSubmitting
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Add term"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default AddTermModal;
