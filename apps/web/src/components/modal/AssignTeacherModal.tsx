import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, UserPlus } from "lucide-react";
import { borderFor, cx, FOCUS_RING, INPUT } from "../../Pages/auth/authUi";
import { Field } from "../../utils/formHelper";
import { useAssignmentStore } from "../../store/assignment.store";
import { useTeacherStore } from "../../store/teacher.store";
import type {
  ITeachingAssignmentCreate,
  SubjectWithTeachers,
  TeacherSummary,
  TeachingAssignmentSummary,
} from "../../interface/Teaching-assignment.interface";

interface TeachingAssignmentModalProps {
  onClose: () => void;
  sessionId: string;
  classLevelId: string;
  classArmId: string;
  subject: SubjectWithTeachers;
  existingAssignment?: TeachingAssignmentSummary;
  onSaved?: () => void;
}

interface FormValues {
  teacherId: string;
  periodsPerWeek: number;
  requiresDoublePeriod: boolean;
  maxPeriodsPerDay: string;
}

const teacherName = (t: TeacherSummary) =>
  [t.title, t.firstName, t.lastName].filter(Boolean).join(" ");

const initials = (t: TeacherSummary) =>
  `${t.firstName.charAt(0)}${t.lastName.charAt(0)}`.toUpperCase();

/* -------------------------------------------------------------------------- */
/*                            Cross-field helpers                             */
/* -------------------------------------------------------------------------- */

/** Parse "maxPeriodsPerDay" from the form. Empty string → null (unset). */
const parseMaxPerDay = (raw: string): number | null =>
  raw.trim() === "" ? null : Number(raw);

/** Minimum valid maxPeriodsPerDay given the current form state. */
const minPerDay = (values: Pick<FormValues, "requiresDoublePeriod">): number =>
  values.requiresDoublePeriod ? 2 : 1;

const TeachingAssignmentModal = ({
  onClose,
  sessionId,
  classArmId,
  subject,
  existingAssignment,
  onSaved,
}: TeachingAssignmentModalProps) => {
  const createTeachingAssignment = useAssignmentStore(
    (s) => s.createTeachingAssignment,
  );
  const updateAssignment = useAssignmentStore((s) => s.updateAssignment);
  const teachers = subject.eligibleTeachers;
  const getTeachers = useTeacherStore((s) => s.getTeachers);

  const isEdit = !!existingAssignment;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { isSubmitting, errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      teacherId: existingAssignment?.teacherId ?? "",
      periodsPerWeek: existingAssignment?.periodsPerWeek ?? 5,
      requiresDoublePeriod: false,
      maxPeriodsPerDay: "",
    },
  });

  const uid = useId();
  const titleId = `assign-teacher-title-${uid}`;
  const ids = {
    teacher: `${uid}-teacher`,
    periods: `${uid}-periods`,
    double: `${uid}-double`,
    maxPerDay: `${uid}-max-per-day`,
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teachers.length === 0) getTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("select, input")?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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

  const teacherOptions = useMemo(() => {
    const active = teachers.filter((t) => t.isActive);
    if (
      existingAssignment &&
      !active.some((t) => t.id === existingAssignment.teacherId)
    ) {
      const current = teachers.find((t) => t.id === existingAssignment.teacherId);
      if (current) return [current, ...active];
    }
    return active;
  }, [teachers, existingAssignment]);

  const selectedTeacherId = watch("teacherId");
  const selectedTeacher = useMemo(
    () => teacherOptions.find((t) => t.id === selectedTeacherId) ?? null,
    [teacherOptions, selectedTeacherId],
  );

  const requiresDoublePeriod = watch("requiresDoublePeriod");
  const dayInputMin = requiresDoublePeriod ? 2 : 1;

  /**
   * Submit is blocked unless every field is valid AND there's a teacher
   * to pick from AND no save is already in flight.
   */
  const canSubmit = isValid && teacherOptions.length > 0 && !isSubmitting;

  const submit = async (values: FormValues) => {
    const maxPeriodsPerDay = parseMaxPerDay(values.maxPeriodsPerDay);

    try {
      if (isEdit && existingAssignment) {
        const res = await updateAssignment(existingAssignment.id, {
          teacherId: values.teacherId,
          periodsPerWeek: values.periodsPerWeek,
          requiresDoublePeriod: values.requiresDoublePeriod,
          maxPeriodsPerDay,
        });

        if (res.success === false) {
          applyServerErrors(res);
          return;
        }

        onSaved?.();
        onClose();
        return;
      }

      const payload: ITeachingAssignmentCreate = {
        sessionId,
        classArmId,
        teacherId: values.teacherId,
        subjectId: subject.id,
        periodsPerWeek: values.periodsPerWeek,
        requiresDoublePeriod: values.requiresDoublePeriod,
        maxPeriodsPerDay,
      };

      const res = await createTeachingAssignment(payload);
      if (res.success === false) {
        applyServerErrors(res);
        return;
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not save the assignment. Try again.",
      });
    }
  };

  /** Map server field errors back onto the form, or fall back to root. */
  function applyServerErrors(res: {
    message?: string;
    errors?: Array<{ field: string; message: string }>;
  }) {
    const errs = res.errors ?? [];
    let handled = false;
    for (const e of errs) {
      const field = e.field as keyof FormValues;
      if (
        field === "teacherId" ||
        field === "periodsPerWeek" ||
        field === "maxPeriodsPerDay" ||
        field === "requiresDoublePeriod"
      ) {
        setError(field as any, { message: e.message });
        handled = true;
      }
    }
    if (!handled) {
      setError("root.server", {
        message: res.message ?? "Could not save the assignment.",
      });
    }
  }

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
        <div className="flex items-start justify-between gap-space-md border-b border-outline-variant/30 p-space-lg">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-heading text-lg font-semibold text-on-surface"
            >
              {isEdit ? "Change teacher" : "Assign teacher"}
            </h2>
            <p className="mt-space-xs truncate text-sm text-on-surface-variant">
              {subject.name}{" "}
              <span className="font-mono text-xs">({subject.code})</span>
            </p>
          </div>
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
              label="Teacher"
              htmlFor={ids.teacher}
              error={errors.teacherId?.message}
            >
              {teacherOptions.length === 0 ? (
                <p
                  role="status"
                  className="rounded-sm border border-dashed border-outline-variant px-space-md py-space-sm text-sm text-on-surface-variant"
                >
                  No active teachers are available. Add a teacher first.
                </p>
              ) : (
                <select
                  id={ids.teacher}
                  aria-invalid={!!errors.teacherId}
                  aria-describedby={
                    errors.teacherId ? `${ids.teacher}-error` : undefined
                  }
                  className={cx(INPUT, borderFor(!!errors.teacherId))}
                  {...register("teacherId", {
                    validate: (v) =>
                      v.trim().length > 0 || "Choose a teacher",
                  })}
                >
                  <option value="" disabled>
                    Select a teacher…
                  </option>
                  {teacherOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {teacherName(t)}
                      {t.staffCode ? ` — ${t.staffCode}` : ""}
                      {!t.isActive ? " (inactive)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            {selectedTeacher && (
              <div className="flex items-center gap-space-md rounded-sm bg-surface-container p-space-sm">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container text-sm font-medium text-on-primary-container"
                >
                  {initials(selectedTeacher)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-on-surface">
                    {teacherName(selectedTeacher)}
                  </p>
                  <p className="font-mono text-xs text-on-surface-variant">
                    {selectedTeacher.staffCode ?? "—"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-space-lg sm:grid-cols-2">
              <Field
                label="Periods per week"
                htmlFor={ids.periods}
                error={errors.periodsPerWeek?.message}
              >
                <input
                  id={ids.periods}
                  type="number"
                  min={1}
                  inputMode="numeric"
                  aria-invalid={!!errors.periodsPerWeek}
                  aria-describedby={
                    errors.periodsPerWeek ? `${ids.periods}-error` : undefined
                  }
                  className={cx(INPUT, borderFor(!!errors.periodsPerWeek))}
                  {...register("periodsPerWeek", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Must be at least 1" },
                    max: { value: 40, message: "Must be 40 or fewer" },
                    validate: (week, values) => {
                      const maxDay = parseMaxPerDay(values.maxPeriodsPerDay);
                      if (maxDay === null) return true;
                      if (!Number.isFinite(maxDay)) return true;
                      if (Number.isFinite(week) && week < maxDay) {
                        return `Cannot be less than the daily maximum (${maxDay})`;
                      }
                      return true;
                    },
                  })}
                />
              </Field>

              <Field
                label="Max periods / day (optional)"
                htmlFor={ids.maxPerDay}
                error={errors.maxPeriodsPerDay?.message}
              >
                <input
                  id={ids.maxPerDay}
                  type="number"
                  min={dayInputMin}
                  max={12}
                  inputMode="numeric"
                  placeholder="Use teacher's default"
                  aria-invalid={!!errors.maxPeriodsPerDay}
                  aria-describedby={
                    errors.maxPeriodsPerDay
                      ? `${ids.maxPerDay}-error`
                      : undefined
                  }
                  className={cx(INPUT, borderFor(!!errors.maxPeriodsPerDay))}
                  {...register("maxPeriodsPerDay", {
                    validate: (raw, values) => {
                      const parsed = parseMaxPerDay(raw);
                      // Empty is valid — falls back to the teacher's default.
                      if (parsed === null) return true;

                      if (!Number.isFinite(parsed)) {
                        return "Enter a valid number";
                      }

                      const min = minPerDay(values);
                      if (parsed < min || parsed > 12) {
                        return values.requiresDoublePeriod
                          ? "A double period needs at least 2 periods in the day"
                          : "Enter a number between 1 and 12, or leave blank";
                      }

                      // Can't have more in a day than the whole week allows.
                      if (
                        Number.isFinite(values.periodsPerWeek) &&
                        parsed > values.periodsPerWeek
                      ) {
                        return `Cannot exceed the weekly allocation (${values.periodsPerWeek})`;
                      }

                      return true;
                    },
                  })}
                />
              </Field>
            </div>

            <label className="flex items-start gap-space-sm text-sm text-on-surface">
              <input
                id={ids.double}
                type="checkbox"
                className={cx(
                  "mt-0.5 h-4 w-4 rounded-sm border accent-primary",
                  FOCUS_RING,
                )}
                {...register("requiresDoublePeriod")}
              />
              <span>
                Requires double period
                <span className="block text-xs text-on-surface-variant">
                  This subject is scheduled as two consecutive periods.
                </span>
              </span>
            </label>
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
              disabled={!canSubmit}
              title={
                !canSubmit && !isSubmitting
                  ? "Fix the highlighted fields to continue"
                  : undefined
              }
              className={cx(
                "inline-flex items-center gap-space-xs rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING,
              )}
            >
              <UserPlus size={14} aria-hidden="true" />
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Assign teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default TeachingAssignmentModal;