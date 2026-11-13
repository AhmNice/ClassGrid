import { createPortal } from "react-dom";
import { useEffect, useId, useRef } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { borderFor, cx, FOCUS_RING, INPUT } from "../../Pages/auth/authUi";
import { Field } from "../../utils/formHelper";
import type {
  ITimetableCreate,
  ITimetableListItem,
} from "../../interface/timetable.interface";

interface CreateTimetableModalProps {
  termId: string;
  basedOn?: ITimetableListItem;
  onSubmit: (
    data: ITimetableCreate,
  ) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

interface FormValues {
  name: string;
  version: number;
}

const CreateTimetableModal = ({
  termId,
  basedOn,
  onSubmit,
  onClose,
}: CreateTimetableModalProps) => {
  const uid = useId();
  const titleId = `create-timetable-title-${uid}`;
  const ids = {
    name: `${uid}-name`,
    version: `${uid}-version`,
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: basedOn ? `${basedOn.name} (copy)` : "",
      version: basedOn ? basedOn.version + 1 : 1,
    },
  });

  const isDuplicate = Boolean(basedOn);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock scroll, focus first field, restore focus on close.
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

  const submit = async (values: FormValues) => {
    const data: ITimetableCreate = {
      termId,
      name: values.name.trim(),
      version: values.version,
      ...(isDuplicate && basedOn ? { basedOnId: basedOn.id } : {}),
    };

    try {
      const res = await onSubmit(data);
      if (!res.success) {
        setError("root.server", {
          message: res.message ?? "Could not create the timetable.",
        });
      }
      // Caller closes on success — this modal doesn't know if the parent
      // wants to navigate, stay open, etc.
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not create the timetable. Try again.",
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
        {/* Header */}
        <div className="flex items-start justify-between gap-space-md border-b border-outline-variant/30 p-space-lg">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-heading text-lg font-semibold text-on-surface"
            >
              {isDuplicate ? "Duplicate Timetable" : "Create Timetable"}
            </h2>
            {isDuplicate && basedOn && (
              <p className="mt-space-xs text-sm text-on-surface-variant">
                Based on{" "}
                <span className="font-medium text-on-surface">
                  {basedOn.name}
                </span>{" "}
                <span className="font-mono text-xs">v{basedOn.version}</span>
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
            {!termId && (
              <p
                role="alert"
                className="rounded-sm bg-warning-container px-space-md py-space-sm text-sm text-on-warning-container"
              >
                Choose an academic session and a term before creating a
                timetable.
              </p>
            )}
            <Field
              label="Timetable name"
              htmlFor={ids.name}
              error={errors.name?.message}
            >
              <input
                id={ids.name}
                type="text"
                autoComplete="off"
                placeholder="Weekday Schedule"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                className={cx(INPUT, borderFor(!!errors.name))}
                {...register("name", {
                  validate: (v) =>
                    v.trim().length > 0 || "Enter a timetable name",
                })}
              />
            </Field>

            <Field
              label="Version"
              htmlFor={ids.version}
              error={errors.version?.message}
            >
              <input
                id={ids.version}
                type="number"
                min={1}
                inputMode="numeric"
                aria-invalid={!!errors.version}
                aria-describedby={
                  errors.version ? `${ids.version}-error` : undefined
                }
                className={cx(INPUT, borderFor(!!errors.version))}
                {...register("version", {
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be at least 1" },
                })}
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
              disabled={isSubmitting || !termId}
              className={cx(
                "rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING,
              )}
            >
              {isSubmitting
                ? isDuplicate
                  ? "Duplicating…"
                  : "Creating…"
                : isDuplicate
                  ? "Create copy"
                  : "Create timetable"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default CreateTimetableModal;
