import { X } from "lucide-react";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import type {
  IRoom,
  IRoomCreate,
  RoomType,
} from "../../interface/room.interface";
import { ROOM_TYPES, ROOM_TYPE_LABELS } from "../../types/roomTypes";

/* ---------------------------------- types --------------------------------- */

/**
 * The form keeps capacity as text so an empty box can mean "no fixed
 * capacity". It becomes a number (or null) only when the form is submitted.
 */
interface RoomFormValues {
  schoolId: string;
  name: string;
  type: RoomType;
  capacity: string;
  isActive: boolean;
}

/** What is sent when creating a room. The school comes from the logged-in user. */
export type RoomCreateData = Omit<IRoomCreate, "schoolId">;

/** What is sent when editing: only the fields that actually changed. */
export type RoomUpdateData = Partial<RoomCreateData>;

type ServerFieldError = { field: string; message: string };

interface SubmitResult {
  success: boolean;
  message?: string;
  /** On failure this can be a list of { field, message } errors. */
  data?: unknown;
}

interface AddRoomModalProps {
  schoolId: string;
  room?: IRoom;
  onClose: () => void;
  onSubmit?: (
    data: RoomCreateData | RoomUpdateData,
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

const MAX_CAPACITY = 5000;

// Fields that have an input (and an error line) on screen.
const FIELD_KEYS = ["name", "type", "capacity"] as const;
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

/** Form text -> real values (trimmed name, capacity as a number or null). */
const toPayload = (values: RoomFormValues): RoomCreateData => ({
  name: values.name.trim(),
  type: values.type,
  capacity: values.capacity.trim() === "" ? null : Number(values.capacity),
  isActive: values.isActive,
});

/**
 * Only the fields whose value differs from the saved room. Comparing the
 * cleaned-up values (not the raw form text) means "Room 101 " or "40" typed
 * over 40 doesn't count as a change.
 */
const getChanges = (next: RoomCreateData, original: IRoom): RoomUpdateData => {
  const changes: RoomUpdateData = {};
  if (next.name !== original.name) changes.name = next.name;
  if (next.type !== original.type) changes.type = next.type;
  if (next.capacity !== original.capacity) changes.capacity = next.capacity;
  if (next.isActive !== original.isActive) changes.isActive = next.isActive;
  return changes;
};

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

const Field = ({ label, htmlFor, error, hint, children }: FieldProps) => (
  <div className="space-y-space-xs">
    <label htmlFor={htmlFor} className="text-sm font-medium text-on-surface">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${htmlFor}-error`} role="alert" className="text-xs text-error">
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${htmlFor}-hint`} className="text-xs text-on-surface-variant">
          {hint}
        </p>
      )
    )}
  </div>
);

/* ---------------------------------- modal --------------------------------- */

const AddRoomModal = ({ schoolId, room, onClose, onSubmit }: AddRoomModalProps) => {
  const isEditing = !!room;

  const uid = useId();
  const titleId = `${uid}-title`;
  const nameId = `${uid}-name`;
  const typeId = `${uid}-type`;
  const capacityId = `${uid}-capacity`;

  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormValues>({
    defaultValues: {
      schoolId,
      name: room?.name ?? "",
      type: room?.type ?? "CLASSROOM",
      capacity: room?.capacity != null ? String(room.capacity) : "",
      // New rooms are usable straight away.
      isActive: room?.isActive ?? true,
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

  const submit = async (values: RoomFormValues) => {
    const payload = toPayload(values);

    // Creating sends everything. Editing sends only what changed.
    let data: RoomCreateData | RoomUpdateData = payload;
    if (room) {
      const changes = getChanges(payload, room);
      // Nothing changed, so there is nothing to save.
      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }
      data = changes;
    }

    const fallback = isEditing
      ? "Could not save the room. Try again."
      : "Could not add the room. Try again.";

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
            {isEditing ? "Edit room" : "Add new room"}
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

            <Field label="Room name" htmlFor={nameId} error={errors.name?.message}>
              <input
                id={nameId}
                type="text"
                autoComplete="off"
                placeholder="Room 101"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${nameId}-error` : undefined}
                className={cx(INPUT, borderFor(!!errors.name))}
                {...register("name", {
                  validate: (value) => {
                    const name = value.trim();
                    if (name.length === 0) return "Enter a room name";
                    if (name.length > 100) return "Room name is too long";
                    return true;
                  },
                })}
              />
            </Field>

            <div className="grid gap-space-lg sm:grid-cols-2">
              <Field label="Type" htmlFor={typeId} error={errors.type?.message}>
                <select
                  id={typeId}
                  aria-invalid={!!errors.type}
                  aria-describedby={errors.type ? `${typeId}-error` : undefined}
                  className={cx(INPUT, borderFor(!!errors.type))}
                  {...register("type", { required: "Select a room type" })}
                >
                  {ROOM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {ROOM_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Capacity"
                htmlFor={capacityId}
                error={errors.capacity?.message}
                hint="Leave empty if it has no fixed capacity."
              >
                <input
                  id={capacityId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="40"
                  aria-invalid={!!errors.capacity}
                  aria-describedby={
                    errors.capacity ? `${capacityId}-error` : `${capacityId}-hint`
                  }
                  className={cx(INPUT, borderFor(!!errors.capacity))}
                  {...register("capacity", {
                    validate: (value) => {
                      if (value.trim() === "") return true;
                      const number = Number(value);
                      if (!Number.isInteger(number) || number < 1) {
                        return "Enter a whole number of 1 or more";
                      }
                      if (number > MAX_CAPACITY) {
                        return `Enter ${MAX_CAPACITY} or less`;
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
              {isSubmitting
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Add room"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default AddRoomModal;