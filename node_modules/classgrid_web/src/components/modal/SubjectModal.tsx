import { Loader, X } from "lucide-react";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { Field } from "../../utils/formHelper";
import { borderFor } from "../../Pages/auth/authUi";
import type { RequestResponse } from "../../interface/common.interface";
import type { ClassStage } from "../../interface/class.interface";
import type {
  ISubject,
  ISubjectCreate,
} from "../../interface/subject.interface";

/** What is sent when editing: only the fields that actually changed. */
export type SubjectUpdateData = Partial<ISubjectCreate>;

/**
 * The form keeps numbers as numbers (RHF registers numeric inputs as strings
 * unless you use valueAsNumber). We default to 0, which means "no limit".
 */
interface SubjectFormValues {
  name: string;
  code: string;
  isActive: boolean;
  classStage: ClassStage[];
  defaultPeriodsPerWeek: number;
  defaultMaxPeriodsPerDay: number;
  defaultMaxConsecutive: number;
  defaultAllowConsecutive: boolean;
}

type ServerFieldError = { field: string; message: string };

interface SubjectModalProps {
  onClose: () => void;
  /** Pass a subject to edit it; leave out to add a new one. */
  subject?: ISubject;
  /**
   * Adding sends every field. Editing sends only the fields that changed (and
   * is skipped entirely when nothing changed).
   *
   * Return a failed result, or throw an Error, to show the problem inside the
   * form. Returning nothing, or a successful result, closes the modal.
   */
  onSubmit?: (
    data: ISubjectCreate | SubjectUpdateData,
  ) => void | Promise<RequestResponse<unknown> | undefined>;
}

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const INPUT =
  "w-full rounded-sm border bg-(--input-bg) px-space-md py-space-sm text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const CLASS_STAGES: ClassStage[] = ["JSS", "SS"];

// Fields that have an input (and an error line) on screen.
const FIELD_KEYS = [
  "name",
  "code",
  "classStage",
  "defaultPeriodsPerWeek",
  "defaultMaxPeriodsPerDay",
  "defaultMaxConsecutive",
] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

const isFieldKey = (field: string): field is FieldKey =>
  (FIELD_KEYS as readonly string[]).includes(field);

const isErrorList = (value: unknown): value is ServerFieldError[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.field === "string" &&
      typeof item.message === "string",
  );

/** null and undefined count as the same thing: "not set". */
const differs = (a: unknown, b: unknown) => (a ?? null) !== (b ?? null);

/** The same stages, whatever order they are listed in. */
const sameStages = (a: ClassStage[], b: ClassStage[]) =>
  a.length === b.length && a.every((stage) => b.includes(stage));

/**
 * Only the fields whose value differs from the saved subject. Comparing the
 * cleaned-up values (trimmed name, 0 turned into "no limit") means retyping
 * the same thing doesn't count as a change.
 */
const getChanges = (
  next: ISubjectCreate,
  original: ISubject,
): SubjectUpdateData => {
  const changes: SubjectUpdateData = {};
  if (differs(next.name, original.name)) changes.name = next.name;
  if (differs(next.code, original.code)) changes.code = next.code;
  if (differs(next.isActive, original.isActive)) changes.isActive = next.isActive;
  if (!sameStages(next.classStage, original.classStage)) {
    changes.classStage = next.classStage;
  }
  if (differs(next.defaultPeriodsPerWeek, original.defaultPeriodsPerWeek)) {
    changes.defaultPeriodsPerWeek = next.defaultPeriodsPerWeek;
  }
  if (differs(next.defaultMaxPeriodsPerDay, original.defaultMaxPeriodsPerDay)) {
    changes.defaultMaxPeriodsPerDay = next.defaultMaxPeriodsPerDay;
  }
  if (differs(next.defaultMaxConsecutive, original.defaultMaxConsecutive)) {
    changes.defaultMaxConsecutive = next.defaultMaxConsecutive;
  }
  if (differs(next.defaultAllowConsecutive, original.defaultAllowConsecutive)) {
    changes.defaultAllowConsecutive = next.defaultAllowConsecutive;
  }
  return changes;
};

const SubjectModal = ({ onClose, subject, onSubmit }: SubjectModalProps) => {
  const isEditing = !!subject;

  const uid = useId();
  const titleId = `${uid}-title`;
  const ids = {
    name: `${uid}-name`,
    code: `${uid}-code`,
    isActive: `${uid}-isActive`,
    dpw: `${uid}-dpw`,
    dmpd: `${uid}-dmpd`,
    dmc: `${uid}-dmc`,
    dac: `${uid}-dac`,
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    defaultValues: {
      name: subject?.name ?? "",
      code: subject?.code ?? "",
      isActive: subject?.isActive ?? true,
      classStage: subject?.classStage ?? [],
      defaultPeriodsPerWeek: subject?.defaultPeriodsPerWeek ?? 0,
      defaultMaxPeriodsPerDay: subject?.defaultMaxPeriodsPerDay ?? 0,
      defaultMaxConsecutive: subject?.defaultMaxConsecutive ?? 0,
      defaultAllowConsecutive: subject?.defaultAllowConsecutive ?? true,
    },
  });

  // Lock page scroll, focus first field, restore focus on close.
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
        "button:not([disabled]), input:not([disabled])",
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

  /**
   * Puts each server error under its own input. Anything for a field the form
   * doesn't show goes in the banner at the top.
   */
  const showServerFailure = (
    message: string,
    serverErrors: ServerFieldError[] | undefined,
  ) => {
    if (!serverErrors || serverErrors.length === 0) {
      setError("root.server", { message });
      return;
    }

    const banner: string[] = [];
    let focused = false;

    serverErrors.forEach(({ field, message: text }) => {
      if (isFieldKey(field)) {
        setError(field, { type: "server", message: text }, { shouldFocus: !focused });
        focused = true;
      } else {
        banner.push(text);
      }
    });

    if (banner.length > 0) {
      setError("root.server", { message: banner.join(" ") });
    } else if (!focused) {
      setError("root.server", { message });
    }
  };

  const submit = async (values: SubjectFormValues) => {
    const payload: ISubjectCreate = {
      name: values.name.trim(),
      code: values.code.trim() || null,
      isActive: values.isActive,
      classStage: Array.isArray(values.classStage) ? values.classStage : [],
      defaultPeriodsPerWeek: values.defaultPeriodsPerWeek || null,
      defaultMaxPeriodsPerDay: values.defaultMaxPeriodsPerDay || null,
      defaultMaxConsecutive: values.defaultMaxConsecutive || null,
      defaultAllowConsecutive: values.defaultAllowConsecutive,
    };

    // Adding sends everything. Editing sends only what changed.
    let data: ISubjectCreate | SubjectUpdateData = payload;
    if (subject) {
      const changes = getChanges(payload, subject);

      // Nothing changed, so there is nothing to save.
      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }
      data = changes;
    }

    const fallback = isEditing
      ? "Could not save the subject. Try again."
      : "Could not add the subject. Try again.";

    try {
      const res = await onSubmit?.(data);

      // Only close if the parent didn't signal failure.
      if (res?.success === false) {
        const serverErrors = (res as { errors?: unknown }).errors;
        showServerFailure(
          res.message || fallback,
          isErrorList(serverErrors) ? serverErrors : undefined,
        );
        return;
      }
      onClose();
    } catch (err) {
      setError("root.server", {
        message: err instanceof Error ? err.message : fallback,
      });
    }
  };

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
            {isEditing ? "Edit subject" : "Add subject"}
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

            <Field
              label="Subject name"
              htmlFor={ids.name}
              error={errors.name?.message}
            >
              <input
                id={ids.name}
                type="text"
                autoComplete="off"
                placeholder="Mathematics"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                className={cx(INPUT, borderFor(!!errors.name))}
                {...register("name", {
                  validate: (value) =>
                    value.trim().length > 0 || "Enter a subject name",
                })}
              />
            </Field>

            <fieldset className="space-y-space-sm">
              <legend className="text-sm font-medium text-on-surface">
                Class Stage <span className="text-error">*</span>
              </legend>
              <p className="text-xs text-on-surface-variant">
                Select which stages this subject applies to.
              </p>
              <div className="flex flex-wrap gap-space-lg pt-space-xs">
                {CLASS_STAGES.map((stage) => (
                  <label
                    key={stage}
                    htmlFor={`${uid}-classStage-${stage}`}
                    className="flex items-center gap-space-sm text-sm text-on-surface"
                  >
                    <input
                      id={`${uid}-classStage-${stage}`}
                      type="checkbox"
                      value={stage}
                      aria-invalid={!!errors.classStage}
                      className={cx(
                        "h-4 w-4 rounded-sm border accent-primary",
                        FOCUS_RING,
                      )}
                      {...register("classStage", {
                        validate: (value) =>
                          (value && value.length > 0) ||
                          "Select at least one class stage",
                      })}
                    />
                    {stage}
                  </label>
                ))}
              </div>
              {errors.classStage?.message && (
                <p role="alert" className="text-xs text-error">
                  {errors.classStage.message}
                </p>
              )}
            </fieldset>

            <Field
              label="Code (optional)"
              htmlFor={ids.code}
              error={errors.code?.message}
            >
              <input
                id={ids.code}
                type="text"
                autoComplete="off"
                placeholder="MTH101"
                aria-invalid={!!errors.code}
                aria-describedby={errors.code ? `${ids.code}-error` : undefined}
                className={cx(INPUT, borderFor(!!errors.code))}
                {...register("code", {
                  validate: (value) =>
                    !value ||
                    value.trim().length <= 20 ||
                    "Code must be 20 characters or fewer",
                })}
              />
            </Field>

            <fieldset className="space-y-space-sm">
              <legend className="text-sm font-medium text-on-surface">
                Scheduling defaults
              </legend>
              <p className="text-xs text-on-surface-variant">
                Leave as 0 to use the session defaults.
              </p>
              <div className="grid gap-space-lg sm:grid-cols-3">
                <Field
                  label="Periods / week"
                  htmlFor={ids.dpw}
                  error={errors.defaultPeriodsPerWeek?.message}
                >
                  <input
                    id={ids.dpw}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className={cx(
                      INPUT,
                      borderFor(!!errors.defaultPeriodsPerWeek),
                    )}
                    {...register("defaultPeriodsPerWeek", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                  />
                </Field>
                <Field
                  label="Max / day"
                  htmlFor={ids.dmpd}
                  error={errors.defaultMaxPeriodsPerDay?.message}
                >
                  <input
                    id={ids.dmpd}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className={cx(
                      INPUT,
                      borderFor(!!errors.defaultMaxPeriodsPerDay),
                    )}
                    {...register("defaultMaxPeriodsPerDay", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                  />
                </Field>
                <Field
                  label="Max consecutive"
                  htmlFor={ids.dmc}
                  error={errors.defaultMaxConsecutive?.message}
                >
                  <input
                    id={ids.dmc}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className={cx(
                      INPUT,
                      borderFor(!!errors.defaultMaxConsecutive),
                    )}
                    {...register("defaultMaxConsecutive", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                  />
                </Field>
              </div>
            </fieldset>

            <div className="space-y-space-sm">
              <label className="flex items-center gap-space-sm text-sm text-on-surface">
                <input
                  type="checkbox"
                  id={ids.isActive}
                  className={cx(
                    "h-4 w-4 rounded-sm border accent-primary",
                    FOCUS_RING,
                  )}
                  {...register("isActive")}
                />
                Active
              </label>
              <label className="flex items-center gap-space-sm text-sm text-on-surface">
                <input
                  type="checkbox"
                  id={ids.dac}
                  className={cx(
                    "h-4 w-4 rounded-sm border accent-primary",
                    FOCUS_RING,
                  )}
                  {...register("defaultAllowConsecutive")}
                />
                Allow consecutive periods by default
              </label>
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
                "inline-flex items-center gap-space-sm rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING,
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader
                    size={16}
                    strokeWidth={2}
                    className="motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                  <span>Saving…</span>
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add subject"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default SubjectModal;