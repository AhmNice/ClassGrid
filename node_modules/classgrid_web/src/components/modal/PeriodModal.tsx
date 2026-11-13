import { createPortal } from "react-dom";
import type {
  IPeriod,
  IPeriodCreate,
  PeriodKind,
} from "../../interface/period.interface";
import type { RequestResponse } from "../../interface/common.interface";
import { useForm } from "react-hook-form";
import { useEffect, useId, useRef } from "react";
import { borderFor, cx, FOCUS_RING, INPUT } from "../../Pages/auth/authUi";
import { X, Trash2 } from "lucide-react";
import { Field } from "../../utils/formHelper";
import { usePeriodStore } from "../../store/period.store";

interface PeriodModalProps {
  onClose: () => void;
  /** When present, the modal edits this period instead of creating one. */
  period?: IPeriod;
  /** When provided (edit mode only), renders a Delete button in the footer. */
  onDelete?: () => void;
  onSubmit?: (data: IPeriodCreate) => void | Promise<RequestResponse<IPeriod>>;
}

interface FormValues {
  name: string;
  kind: PeriodKind;
  periodScheduleScheduleId: string;
  sequence: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const periodKinds: { value: PeriodKind; label: string }[] = [
  { value: "LESSON", label: "Lesson" },
  { value: "BREAK", label: "Break" },
];

const PeriodModal = ({ onClose, period, onDelete, onSubmit }: PeriodModalProps) => {
  const isEdit = !!period;

  // Pull real schedules + the actions from the store.
  const periodSchedules = usePeriodStore((s) => s.periodSchedules);
  const getPeriodSchedules = usePeriodStore((s) => s.getPeriodSchedules);
  const createPeriod = usePeriodStore((s) => s.createPeriod);
  const updatePeriod = usePeriodStore((s) => s.updatePeriod);

  // Load schedules if they aren't already in the store.
  useEffect(() => {
    if (periodSchedules.length === 0) getPeriodSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: period?.name ?? "",
      kind: period?.kind ?? "LESSON",
      periodScheduleScheduleId:
        period?.periodScheduleScheduleId ??
        periodSchedules[0]?.scheduleId ??
        "",
      sequence: period?.sequence ?? 1,
      startTime: period?.startTime ?? "",
      endTime: period?.endTime ?? "",
      isActive: period?.isActive ?? true,
    },
  });

  const uid = useId();
  const titleId = `period-modal-title-${uid}`;
  const ids = {
    name: `${uid}-name`,
    startTime: `${uid}-start-time`,
    endTime: `${uid}-end-time`,
    sequence: `${uid}-sequence`,
    kind: `${uid}-kind`,
    periodScheduleScheduleId: `${uid}-period-schedule`,
    isActive: `${uid}-isActive`,
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock page scroll, focus first field, restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, select")?.focus();

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
    const data: IPeriodCreate = {
      name: values.name.trim(),
      kind: values.kind,
      periodScheduleScheduleId: values.periodScheduleScheduleId,
      sequence: values.sequence,
      startTime: values.startTime,
      endTime: values.endTime,
      isActive: values.isActive,
    };

    try {
      // Prefer caller-provided onSubmit; otherwise branch create vs. edit.
      const res = onSubmit
        ? await onSubmit(data)
        : isEdit && period
          ? await updatePeriod(period.id, data)
          : await createPeriod(data as IPeriodCreate);

      if (res && "success" in res && res.success === false) {
        setError("root.server", {
          message: res.message ?? "Could not save the period.",
        });
        return;
      }
      onClose();
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not save the period. Try again.",
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
        {/* Header */}
        <div className="flex items-center justify-between gap-space-md border-b border-outline-variant/30 p-space-lg">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-heading text-lg font-semibold text-on-surface"
            >
              {isEdit ? "Edit Period" : "Add Period"}
            </h2>
            {isEdit && period && (
              <p className="mt-space-xs truncate text-xs text-on-surface-variant">
                {period.name} · P{period.sequence}
              </p>
            )}
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
              label="Period name"
              htmlFor={ids.name}
              error={errors.name?.message}
            >
              <input
                id={ids.name}
                type="text"
                autoComplete="off"
                placeholder="Period 1"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                className={cx(INPUT, borderFor(!!errors.name))}
                {...register("name", {
                  validate: (value) =>
                    value.trim().length > 0 || "Enter a period name",
                })}
              />
            </Field>

            <div className="grid gap-space-lg sm:grid-cols-2">
              <Field
                label="Kind"
                htmlFor={ids.kind}
                error={errors.kind?.message}
              >
                <select
                  id={ids.kind}
                  aria-invalid={!!errors.kind}
                  aria-describedby={
                    errors.kind ? `${ids.kind}-error` : undefined
                  }
                  className={cx(INPUT, borderFor(!!errors.kind))}
                  {...register("kind", {
                    required: "Choose a period kind",
                  })}
                >
                  {periodKinds.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Schedule"
                htmlFor={ids.periodScheduleScheduleId}
                error={errors.periodScheduleScheduleId?.message}
              >
                <select
                  id={ids.periodScheduleScheduleId}
                  aria-invalid={!!errors.periodScheduleScheduleId}
                  aria-describedby={
                    errors.periodScheduleScheduleId
                      ? `${ids.periodScheduleScheduleId}-error`
                      : undefined
                  }
                  className={cx(
                    INPUT,
                    borderFor(!!errors.periodScheduleScheduleId),
                  )}
                  {...register("periodScheduleScheduleId", {
                    validate: (value) =>
                      value.trim().length > 0 || "Choose a schedule",
                  })}
                >
                  <option value="" disabled>
                    Select a schedule
                  </option>
                  {periodSchedules.map((s) => (
                    <option key={s.scheduleId} value={s.scheduleId}>
                      {s.name.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-space-lg sm:grid-cols-3">
              <Field
                label="Sequence"
                htmlFor={ids.sequence}
                error={errors.sequence?.message}
              >
                <input
                  id={ids.sequence}
                  type="number"
                  min={1}
                  inputMode="numeric"
                  aria-invalid={!!errors.sequence}
                  aria-describedby={
                    errors.sequence ? `${ids.sequence}-error` : undefined
                  }
                  className={cx(INPUT, borderFor(!!errors.sequence))}
                  {...register("sequence", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Must be at least 1" },
                  })}
                />
              </Field>

              <Field
                label="Start time"
                htmlFor={ids.startTime}
                error={errors.startTime?.message}
              >
                <input
                  id={ids.startTime}
                  type="time"
                  aria-invalid={!!errors.startTime}
                  aria-describedby={
                    errors.startTime ? `${ids.startTime}-error` : undefined
                  }
                  className={cx(INPUT, borderFor(!!errors.startTime))}
                  {...register("startTime", {
                    validate: (value) =>
                      value.trim().length > 0 || "Choose a start time",
                  })}
                />
              </Field>

              <Field
                label="End time"
                htmlFor={ids.endTime}
                error={errors.endTime?.message}
              >
                <input
                  id={ids.endTime}
                  type="time"
                  aria-invalid={!!errors.endTime}
                  aria-describedby={
                    errors.endTime ? `${ids.endTime}-error` : undefined
                  }
                  className={cx(INPUT, borderFor(!!errors.endTime))}
                  {...register("endTime", {
                    validate: (value, values) => {
                      if (!value) return "Choose an end time";
                      if (values.startTime && value <= values.startTime) {
                        return "End time must be after start time";
                      }
                      return true;
                    },
                  })}
                />
              </Field>
            </div>

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
          </div>

          {/* Footer */}
          <div className="flex items-center gap-space-sm border-t border-outline-variant/30 p-space-lg">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isSubmitting}
                className={cx(
                  "inline-flex items-center gap-space-xs rounded-sm px-space-lg py-space-sm text-sm font-medium text-error transition-colors hover:bg-error-container/40 disabled:opacity-60 motion-reduce:transition-none",
                  FOCUS_RING,
                )}
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </button>
            )}

            <div className="ml-auto flex gap-space-sm">
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
                  : isEdit
                    ? "Save changes"
                    : "Add period"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default PeriodModal;