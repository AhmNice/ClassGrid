import { X } from "lucide-react";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { Field } from "../../utils/formHelper";
import type { ITeacher, ITeacherCreate } from "../../interface/teacher.interface";

/* ---------------------------------- types --------------------------------- */

/**
 * The form keeps the three limits as text so an empty box can mean "no
 * limit". They become numbers (or null) only when the form is submitted.
 */
interface TeacherFormValues {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  staffCode: string;
  maxPeriodsPerDay: string;
  maxPeriodsPerWeek: string;
  maxConsecutivePeriods: string;
  isActive: boolean;
}

/** What is sent when editing: only the fields that actually changed. */
export type TeacherUpdateData = Partial<ITeacherCreate>;

type ServerFieldError = { field: string; message: string };

interface SubmitResult {
  success: boolean;
  message?: string;
  /** On failure this can be a list of { field, message } errors. */
  data?: unknown;
}

interface AddTeacherModalProps {
  close: () => void;
  teacher?: ITeacher;
  onSubmit?: (
    data: ITeacherCreate | TeacherUpdateData,
  ) => void | SubmitResult | Promise<void | SubmitResult>;
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

const TITLES = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Engr"];

// Sensible ceilings, so a typo like 200 is caught.
const MAX_PER_DAY = 15;
const MAX_PER_WEEK = 75;

// Fields that have an input (and an error line) on screen.
const FIELD_KEYS = [
  "title",
  "firstName",
  "lastName",
  "email",
  "phone",
  "staffCode",
  "maxPeriodsPerDay",
  "maxPeriodsPerWeek",
  "maxConsecutivePeriods",
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

/** "" -> null (no limit), "6" -> 6. */
const toLimit = (value: string): number | null =>
  value.trim() === "" ? null : Number(value);

/** null -> "" (empty box), 6 -> "6". */
const limitText = (value: number | null | undefined) =>
  value == null ? "" : String(value);

/**
 * Only the fields whose value differs from the saved teacher. Comparing the
 * cleaned-up values (trimmed text, limits as numbers) means "  Ade " or "6"
 * typed over 6 doesn't count as a change.
 */
const getChanges = (
  next: ITeacherCreate,
  original: ITeacher,
): TeacherUpdateData => {
  const changes: TeacherUpdateData = {};
  if (next.title !== original.title) changes.title = next.title;
  if (next.firstName !== original.firstName) changes.firstName = next.firstName;
  if (next.lastName !== original.lastName) changes.lastName = next.lastName;
  if (next.email !== original.email) changes.email = next.email;
  if (next.phone !== original.phone) changes.phone = next.phone;
  if (next.staffCode !== original.staffCode) changes.staffCode = next.staffCode;
  if (next.maxPeriodsPerDay !== original.maxPeriodsPerDay) {
    changes.maxPeriodsPerDay = next.maxPeriodsPerDay;
  }
  if (next.maxPeriodsPerWeek !== original.maxPeriodsPerWeek) {
    changes.maxPeriodsPerWeek = next.maxPeriodsPerWeek;
  }
  if (next.maxConsecutivePeriods !== original.maxConsecutivePeriods) {
    changes.maxConsecutivePeriods = next.maxConsecutivePeriods;
  }
  if (next.isActive !== original.isActive) changes.isActive = next.isActive;
  return changes;
};

/** Empty is fine. Otherwise it must be a whole number from 1 up to `max`. */
const checkLimit = (value: string, max: number): string | true => {
  if (value.trim() === "") return true;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    return "Enter a whole number of 1 or more";
  }
  if (number > max) return `Enter ${max} or less`;
  return true;
};

/* ---------------------------------- modal --------------------------------- */

const AddTeacherModal = ({
  close: onClose,
  teacher,
  onSubmit,
}: AddTeacherModalProps) => {
  const isEditing = !!teacher;

  const uid = useId();
  const titleId = `add-teacher-modal-title-${uid}`;
  const ids = {
    title: `${uid}-title`,
    firstName: `${uid}-first-name`,
    lastName: `${uid}-last-name`,
    email: `${uid}-email`,
    phone: `${uid}-phone`,
    staffCode: `${uid}-staff-code`,
    perDay: `${uid}-per-day`,
    perWeek: `${uid}-per-week`,
    consecutive: `${uid}-consecutive`,
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    defaultValues: {
      title: teacher?.title ?? "",
      firstName: teacher?.firstName ?? "",
      lastName: teacher?.lastName ?? "",
      email: teacher?.email ?? "",
      phone: teacher?.phone ?? "",
      staffCode: teacher?.staffCode ?? "",
      maxPeriodsPerDay: limitText(teacher?.maxPeriodsPerDay),
      maxPeriodsPerWeek: limitText(teacher?.maxPeriodsPerWeek),
      maxConsecutivePeriods: limitText(teacher?.maxConsecutivePeriods),
      // New teachers can be timetabled straight away.
      isActive: teacher?.isActive ?? true,
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
   * Puts each server error under its own input. Anything for a field the form
   * doesn't show goes in the banner at the top.
   */
  const showServerFailure = (result: SubmitResult, fallback: string) => {
    const message = result.message || fallback;

    if (!isErrorList(result.data)) {
      setError("root.server", { message });
      return;
    }

    const banner: string[] = [];
    let focused = false;

    result.data.forEach(({ field, message: text }) => {
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

  const submit = async (values: TeacherFormValues) => {
    const payload: ITeacherCreate = {
      title: values.title,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      staffCode: values.staffCode.trim(),
      maxPeriodsPerDay: toLimit(values.maxPeriodsPerDay),
      maxPeriodsPerWeek: toLimit(values.maxPeriodsPerWeek),
      maxConsecutivePeriods: toLimit(values.maxConsecutivePeriods),
      isActive: values.isActive,
    };

    // Adding sends everything. Editing sends only what changed.
    let data: ITeacherCreate | TeacherUpdateData = payload;
    if (teacher) {
      const changes = getChanges(payload, teacher);

      // Nothing changed, so there is nothing to save.
      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }
      data = changes;
    }

    const fallback = isEditing
      ? "Could not save the teacher. Try again."
      : "Could not add the teacher. Try again.";

    try {
      const result = await onSubmit?.(data);

      // Only an explicit failure keeps the modal open.
      if (result && result.success === false) {
        showServerFailure(result, fallback);
        return;
      }
      onClose();
    } catch (err) {
      setError("root.server", {
        message: err instanceof Error ? err.message : fallback,
      });
    }
  };

  /** A required text box: shared wiring for the aria attributes. */
  const describe = (id: string, hasError: boolean) => ({
    "aria-invalid": hasError,
    "aria-describedby": hasError ? `${id}-error` : undefined,
  });

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
            {isEditing ? "Edit Teacher" : "Add New Teacher"}
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

            {/* Name */}
            <div className="grid gap-space-lg sm:grid-cols-[7rem_1fr_1fr]">
              <Field label="Title" htmlFor={ids.title} error={errors.title?.message}>
                <select
                  id={ids.title}
                  className={cx(INPUT, borderFor(!!errors.title))}
                  {...describe(ids.title, !!errors.title)}
                  {...register("title", { required: "Select a title" })}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="First name"
                htmlFor={ids.firstName}
                error={errors.firstName?.message}
              >
                <input
                  id={ids.firstName}
                  type="text"
                  autoComplete="given-name"
                  className={cx(INPUT, borderFor(!!errors.firstName))}
                  {...describe(ids.firstName, !!errors.firstName)}
                  {...register("firstName", {
                    validate: (value) =>
                      value.trim().length > 0 || "Enter a first name",
                  })}
                />
              </Field>

              <Field
                label="Last name"
                htmlFor={ids.lastName}
                error={errors.lastName?.message}
              >
                <input
                  id={ids.lastName}
                  type="text"
                  autoComplete="family-name"
                  className={cx(INPUT, borderFor(!!errors.lastName))}
                  {...describe(ids.lastName, !!errors.lastName)}
                  {...register("lastName", {
                    validate: (value) =>
                      value.trim().length > 0 || "Enter a last name",
                  })}
                />
              </Field>
            </div>

            {/* Contact */}
            <div className="grid gap-space-lg sm:grid-cols-2">
              <Field label="Email" htmlFor={ids.email} error={errors.email?.message}>
                <input
                  id={ids.email}
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  placeholder="teacher@school.com"
                  className={cx(INPUT, borderFor(!!errors.email))}
                  {...describe(ids.email, !!errors.email)}
                  {...register("email", {
                    required: "Enter an email address",
                    validate: (value) =>
                      /^\S+@\S+\.\S+$/.test(value.trim()) ||
                      "Enter a valid email address",
                  })}
                />
              </Field>

              <Field label="Phone" htmlFor={ids.phone} error={errors.phone?.message}>
                <input
                  id={ids.phone}
                  type="tel"
                  autoComplete="off"
                  placeholder="0803 000 0000"
                  className={cx(INPUT, borderFor(!!errors.phone))}
                  {...describe(ids.phone, !!errors.phone)}
                  {...register("phone", {
                    required: "Enter a phone number",
                    validate: (value) =>
                      /^\+?[0-9\s()-]{7,20}$/.test(value.trim()) ||
                      "Enter a valid phone number",
                  })}
                />
              </Field>
            </div>

            <Field
              label="Staff code"
              htmlFor={ids.staffCode}
              error={errors.staffCode?.message}
              hint="The school's own ID for this teacher, for example TCH-001."
            >
              <input
                id={ids.staffCode}
                type="text"
                autoComplete="off"
                placeholder="TCH-001"
                className={cx(INPUT, borderFor(!!errors.staffCode))}
                aria-invalid={!!errors.staffCode}
                aria-describedby={
                  errors.staffCode ? `${ids.staffCode}-error` : `${ids.staffCode}-hint`
                }
                {...register("staffCode", {
                  validate: (value) =>
                    value.trim().length > 0 || "Enter a staff code",
                })}
              />
            </Field>

            {/* Workload limits used when building timetables */}
            <fieldset className="space-y-space-sm">
              <legend className="text-sm font-medium text-on-surface">
                Workload limits
              </legend>
              <p className="text-xs text-on-surface-variant">
                The timetable won’t go over these. Leave a box empty for no limit.
              </p>

              <div className="grid gap-space-lg sm:grid-cols-3">
                <Field
                  label="Per day"
                  htmlFor={ids.perDay}
                  error={errors.maxPeriodsPerDay?.message}
                >
                  <input
                    id={ids.perDay}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="6"
                    className={cx(INPUT, borderFor(!!errors.maxPeriodsPerDay))}
                    {...describe(ids.perDay, !!errors.maxPeriodsPerDay)}
                    {...register("maxPeriodsPerDay", {
                      validate: (value) => {
                        const limit = checkLimit(value, MAX_PER_DAY);
                        if (limit !== true) return limit;

                        const week = toLimit(getValues("maxPeriodsPerWeek"));
                        const day = toLimit(value);
                        if (day !== null && week !== null && day > week) {
                          return "Can’t be more than the weekly limit";
                        }
                        return true;
                      },
                      // These three depend on each other, so re-check them.
                      onChange: () =>
                        trigger(["maxPeriodsPerWeek", "maxConsecutivePeriods"]),
                    })}
                  />
                </Field>

                <Field
                  label="Per week"
                  htmlFor={ids.perWeek}
                  error={errors.maxPeriodsPerWeek?.message}
                >
                  <input
                    id={ids.perWeek}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="30"
                    className={cx(INPUT, borderFor(!!errors.maxPeriodsPerWeek))}
                    {...describe(ids.perWeek, !!errors.maxPeriodsPerWeek)}
                    {...register("maxPeriodsPerWeek", {
                      validate: (value) => checkLimit(value, MAX_PER_WEEK),
                      onChange: () => trigger("maxPeriodsPerDay"),
                    })}
                  />
                </Field>

                <Field
                  label="In a row"
                  htmlFor={ids.consecutive}
                  error={errors.maxConsecutivePeriods?.message}
                >
                  <input
                    id={ids.consecutive}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="3"
                    className={cx(INPUT, borderFor(!!errors.maxConsecutivePeriods))}
                    {...describe(ids.consecutive, !!errors.maxConsecutivePeriods)}
                    {...register("maxConsecutivePeriods", {
                      validate: (value) => {
                        const limit = checkLimit(value, MAX_PER_DAY);
                        if (limit !== true) return limit;

                        const day = toLimit(getValues("maxPeriodsPerDay"));
                        const row = toLimit(value);
                        if (row !== null && day !== null && row > day) {
                          return "Can’t be more than the daily limit";
                        }
                        return true;
                      },
                    })}
                  />
                </Field>
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-center gap-space-sm text-sm text-on-surface">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                {...register("isActive")}
              />
              Available for timetabling
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
              disabled={isSubmitting}
              className={cx(
                "rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING,
              )}
            >
              {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Add teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default AddTeacherModal;