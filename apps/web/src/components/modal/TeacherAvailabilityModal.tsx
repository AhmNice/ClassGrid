import { createPortal } from "react-dom";
import { useEffect, useId, useRef } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { borderFor, cx, FOCUS_RING, INPUT } from "../../Pages/auth/authUi";
import { Field } from "../../utils/formHelper";
import type {
  AvailabilityStatus,
  DayOfWeek,
  ITeacherAvailabilityCreate,
} from "../../interface/teacher-availability.interface";
import type { IPeriod } from "../../interface/period.interface";

interface TeacherAvailabilityModalProps {
  teacherId: string;
  teacherName: string;
  periods: IPeriod[];
  existingKeys?: Set<string>;
  /** Prefills the day select. */
  initialDay?: DayOfWeek;
  /** Prefills the period select. */
  initialPeriodId?: string;
  onClose: () => void;
  onSubmit: (
    data: ITeacherAvailabilityCreate,
  ) => Promise<{ success: boolean; message?: string }>;
}

interface FormValues {
  dayOfWeek: DayOfWeek;
  periodId: string;
  status: AvailabilityStatus;
  reason: string;
}

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
];

// Only two exception states — absence of a row means "available".
const STATUSES: { value: AvailabilityStatus; label: string; hint: string }[] = [
  {
    value: "UNAVAILABLE",
    label: "Unavailable",
    hint: "Hard constraint — can't be scheduled here",
  },
  {
    value: "PREFERRED",
    label: "Preferred",
    hint: "Soft preference — generator favours this slot",
  },
];

const TeacherAvailabilityModal = ({
  teacherId,
  teacherName,
  periods,
  existingKeys = new Set(),
  initialDay,
  initialPeriodId,
  onClose,
  onSubmit,
}: TeacherAvailabilityModalProps) => {
  const uid = useId();
  const titleId = `availability-title-${uid}`;
  const ids = {
    day: `${uid}-day`,
    period: `${uid}-period`,
    status: `${uid}-status`,
    reason: `${uid}-reason`,
  };

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      dayOfWeek: initialDay ?? "MONDAY",
      periodId: initialPeriodId ?? "",
      status: "UNAVAILABLE",
      reason: "",
    },
  });

  const selectedDay = watch("dayOfWeek");

  const dialogRef = useRef<HTMLDivElement>(null);

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

  const submit = async (values: FormValues) => {
    const data: ITeacherAvailabilityCreate = {
      teacherId,
      dayOfWeek: values.dayOfWeek,
      periodId: values.periodId,
      status: values.status,
      reason: values.reason.trim() || null,
    };

    try {
      const res = await onSubmit(data);
      if (!res.success) {
        setError("root.server", {
          message: res.message ?? "Could not save availability.",
        });
      }
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not save availability. Try again.",
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
        className="max-h-full w-full max-w-md overflow-y-auto rounded-xl bg-surface shadow-xl"
      >
        <div className="flex items-start justify-between gap-space-md border-b border-outline-variant/30 p-space-lg">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-heading text-lg font-semibold text-on-surface"
            >
              Add Availability
            </h2>
            <p className="mt-space-xs truncate text-sm text-on-surface-variant">
              {teacherName}
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

            <div className="grid gap-space-lg sm:grid-cols-2">
              <Field
                label="Day"
                htmlFor={ids.day}
                error={errors.dayOfWeek?.message}
              >
                <select
                  id={ids.day}
                  className={cx(INPUT, borderFor(!!errors.dayOfWeek))}
                  {...register("dayOfWeek", {
                    required: "Choose a day",
                  })}
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Period"
                htmlFor={ids.period}
                error={errors.periodId?.message}
              >
                <select
                  id={ids.period}
                  className={cx(INPUT, borderFor(!!errors.periodId))}
                  {...register("periodId", {
                    validate: (v) => v.length > 0 || "Choose a period",
                  })}
                >
                  <option value="" disabled>
                    Select a period…
                  </option>
                  {periods.map((p) => {
                    const key = `${selectedDay}:${p.id}`;
                    const exists = existingKeys.has(key);
                    return (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={exists}
                      >
                        P{p.sequence} · {p.name}
                        {exists ? " (already set)" : ""}
                      </option>
                    );
                  })}
                </select>
              </Field>
            </div>

            <Field
              label="Status"
              htmlFor={ids.status}
              error={errors.status?.message}
            >
              <select
                id={ids.status}
                className={cx(INPUT, borderFor(!!errors.status))}
                {...register("status", { required: "Choose a status" })}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} — {s.hint}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Reason (optional)"
              htmlFor={ids.reason}
              error={errors.reason?.message}
            >
              <input
                id={ids.reason}
                type="text"
                autoComplete="off"
                placeholder="e.g. Meeting, medical appointment"
                className={cx(INPUT, borderFor(!!errors.reason))}
                {...register("reason")}
              />
            </Field>
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
              {isSubmitting ? "Saving…" : "Add availability"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default TeacherAvailabilityModal;