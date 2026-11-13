import { X } from "lucide-react";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { fromInputDate } from "../../utils/sessionUtils";
// Adjust the path if `errorResponse` lives somewhere else in your project.
import type {
  ResponseData,
} from "../../store/academic-session.store";

export interface IAcademicSessionCreate {
  schoolId: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
}

/**
 * The form keeps dates as "YYYY-MM-DD" strings, which is what date inputs use.
 * They become Date objects (at local midnight) only when the form is submitted,
 * so a picked day can never shift by one in another time zone.
 */
interface SessionFormValues {
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface AddSessionModalProps {
  schoolId: string | null;
  onClose: () => void;
  /** Reject or throw an Error to show its message inside the form. */
  onSubmit?: (data: IAcademicSessionCreate) => void | Promise<ResponseData>;
}

/* --------------------------------- helpers -------------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const INPUT =
  "w-full rounded-sm border bg-(--input-bg) px-space-md py-space-sm text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Fields that have an input (and an error line) on screen.
const FIELD_KEYS = ["name", "startDate", "endDate"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

/** "start_date" -> "startDate", so snake_case from the API still matches. */
const toCamelCase = (field: string) =>
  field.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

const isFieldKey = (field: string): field is FieldKey =>
  (FIELD_KEYS as readonly string[]).includes(field);

const isErrorList = (value: unknown): value is { field: string; message: string }[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.field === "string" &&
      typeof item.message === "string"
  );

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

const AddSessionModal = ({ schoolId, onClose, onSubmit }: AddSessionModalProps) => {
  const uid = useId();
  const titleId = `${uid}-title`;
  const nameId = `${uid}-name`;
  const startId = `${uid}-start`;
  const endId = `${uid}-end`;

  const dialogRef = useRef<HTMLDivElement>(null);
console.log("AddSessionModal rendered with schoolId:", schoolId); // Debugging line
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormValues>({
    defaultValues: {
      schoolId: schoolId ?? "",
      name: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    },
  });

  // Lock page scroll, focus the first field, and restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();

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
        "button:not([disabled]), input:not([disabled])"
      ) ?? []
    );
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

  /**
   * Puts each server error under its own input. Errors for fields the form
   * doesn't show (or doesn't recognise) go into the banner at the top instead.
   * Field errors clear themselves as soon as the user edits that field.
   */
  const applyServerErrors = (serverErrors: { field: string; message: string }[], fallback: string) => {
    const bannerMessages: string[] = [];
    let focused = false;

    serverErrors.forEach(({ field, message }:{ field: string; message: string }) => {
      const extract = field.split(".");
      console.log(extract)
      const key = toCamelCase(`${extract[extract.length - 1]}`);
      console.log(key)
      if (isFieldKey(key)) {
        setError(key, { type: "server", message }, { shouldFocus: !focused });
        focused = true;
      } else {
        bannerMessages.push(message);
      }
    });

    if (bannerMessages.length > 0) {
      setError("root.server", { message: bannerMessages.join(" ") });
    } else if (!focused) {
      setError("root.server", { message: fallback });
    }
  };

  const submit = async (values: SessionFormValues) => {
    const data: IAcademicSessionCreate = {
      schoolId: values.schoolId,
      name: values.name.trim(),
      startDate: fromInputDate(values.startDate),
      endDate: fromInputDate(values.endDate),
      isCurrent: values.isCurrent,
    };

    const fallback = "Could not create the session. Try again.";

    try {
      const res = await onSubmit?.(data);

      if (res && res.success) {
        onClose();
        return;
      }

      if (res && isErrorList(res.data)) {
        applyServerErrors(res.data, res.message || fallback);
      } else {
        setError("root.server", { message: res?.message || fallback });
      }
    } catch (err) {
      setError("root.server", {
        message: err instanceof Error ? err.message : fallback,
      });
    }
  };

  const borderFor = (hasError: boolean) =>
    hasError ? "border-error" : "border-(--input-border)";

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
            Add new session
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={cx(
              "grid h-8 w-8 shrink-0 place-items-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface motion-reduce:transition-none",
              FOCUS_RING
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="space-y-space-lg p-space-lg">
            {errors.root?.server && (
              <p
                role="alert"
                className="rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
              >
                {errors.root.server.message}
              </p>
            )}

            <Field label="Session name" htmlFor={nameId} error={errors.name?.message}>
              <input
                id={nameId}
                type="text"
                autoComplete="off"
                placeholder="2026/2027"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${nameId}-error` : undefined}
                className={cx(INPUT, borderFor(!!errors.name))}
                {...register("name", {
                  validate: (value) =>
                    value.trim().length > 0 || "Enter a session name",
                })}
              />
            </Field>

            <div className="grid gap-space-lg sm:grid-cols-2">
              <Field
                label="Start date"
                htmlFor={startId}
                error={errors.startDate?.message}
              >
                <input
                  id={startId}
                  type="date"
                  aria-invalid={!!errors.startDate}
                  aria-describedby={errors.startDate ? `${startId}-error` : undefined}
                  className={cx(INPUT, borderFor(!!errors.startDate))}
                  {...register("startDate", {
                    validate: (value) => (value ? true : "Choose a start date"),
                    // Re-check the end date if one is already picked.
                    onChange: () => {
                      if (getValues("endDate")) trigger("endDate");
                    },
                  })}
                />
              </Field>

              <Field
                label="End date"
                htmlFor={endId}
                error={errors.endDate?.message}
              >
                <input
                  id={endId}
                  type="date"
                  aria-invalid={!!errors.endDate}
                  aria-describedby={errors.endDate ? `${endId}-error` : undefined}
                  className={cx(INPUT, borderFor(!!errors.endDate))}
                  {...register("endDate", {
                    validate: (end) => {
                      if (!end) return "Choose an end date";
                      const start = getValues("startDate");
                      if (start && end <= start) {
                        return "End date must be after the start date";
                      }
                      return true;
                    },
                  })}
                />
              </Field>
            </div>

            <label className="flex cursor-pointer items-center gap-space-sm text-sm text-on-surface">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                {...register("isCurrent")}
              />
              Set as current session
            </label>
          </div>

          <div className="flex justify-end gap-space-sm border-t border-outline-variant/30 p-space-lg">
            <button
              type="button"
              onClick={close}
              disabled={isSubmitting}
              className={cx(
                "rounded-sm px-space-lg py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cx(
                "rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING
              )}
            >
              {isSubmitting ? "Creating…" : "Create session"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddSessionModal;