import { AlertTriangle, Ban, CircleCheck, X } from "lucide-react";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import type { IPeriod } from "../../interface/period.interface";
import type { IRoom } from "../../interface/room.interface";
import type { DayOfWeek } from "../../interface/schedule.interface";
import type { ITimetableEntryCreate } from "../../interface/timetable-entry.interface";
import { ROOM_TYPE_LABELS } from "../../types/roomTypes";
import { shortLabel, sortPeriods } from "../../utils/PeriodUtils";
import {
  checkSlot,
  countPlaced,
  DAY_LABELS,
  teacherLabel,
  type LessonAssignment,
  type PlacedEntry,
} from "../../utils/slotCheck";

/* ---------------------------------- types --------------------------------- */

interface LessonFormValues {
  assignmentId: string;
  roomId: string;
  placeDouble: boolean;
  isLocked: boolean;
  note: string;
}

type ServerFieldError = { field: string; message: string };

interface SubmitResult {
  success: boolean;
  message?: string;
  /** On failure this can be a list of { field, message } errors. */
  data?: unknown;
}

interface AddLessonModalProps {
  timetableId: string;
  classArm: { id: string; name: string };
  dayOfWeek: DayOfWeek;
  /** The empty slot that was clicked. */
  period: IPeriod;
  /** Every period of the day's schedule, to find the one after `period`. */
  periods: IPeriod[];
  /** The subjects this class arm can be given: one per assignment. */
  assignments: LessonAssignment[];
  rooms: IRoom[];
  /** Every entry in this timetable, for every class arm. */
  entries: PlacedEntry[];
  /** "arm-jss2b" -> "JSS 2 B", for the clash messages. */
  armLabelFor: (classArmId: string) => string;
  onClose: () => void;
  /**
   * Receives one entry, or two for a double period. Return a failed result, or
   * throw an Error, to show the problem inside the form.
   */
  onSubmit?: (
    entries: ITimetableEntryCreate[],
  ) => void | SubmitResult | Promise<void | SubmitResult>;
}

/* --------------------------------- helpers -------------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const INPUT =
  "w-full rounded-sm border border-(--input-border) bg-(--input-bg) px-space-md py-space-sm text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const FIELD_KEYS = ["assignmentId", "roomId", "note"] as const;
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

const MAX_NOTE = 300;

/* ---------------------------------- modal --------------------------------- */

const AddLessonModal = ({
  timetableId,
  classArm,
  dayOfWeek,
  period,
  periods,
  assignments,
  rooms,
  entries,
  armLabelFor,
  onClose,
  onSubmit,
}: AddLessonModalProps) => {
  const uid = useId();
  const titleId = `${uid}-title`;
  const roomId = `${uid}-room`;
  const noteId = `${uid}-note`;
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    defaultValues: {
      assignmentId: "",
      roomId: "",
      placeDouble: false,
      isLocked: false,
      note: "",
    },
  });

  const [assignmentValue, roomValue, placeDouble] = watch([
    "assignmentId",
    "roomId",
    "placeDouble",
  ]);

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
        "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
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

  /* ------------------------------ what it would take ----------------------- */

  const assignment = assignments.find((a) => a.id === assignmentValue);

  // The period after the clicked one, if a double period is possible at all.
  const next = useMemo(() => {
    const sorted = sortPeriods(periods);
    return sorted[sorted.findIndex((p) => p.id === period.id) + 1];
  }, [periods, period.id]);

  const doubleBlockedReason = !next
    ? "This is the last period of the day."
    : next.kind !== "LESSON"
      ? `${next.name} comes next, and it isn’t a lesson.`
      : null;

  const slots = placeDouble && next && !doubleBlockedReason ? [period, next] : [period];

  const issues = useMemo(
    () =>
      assignment
        ? checkSlot({
            assignment,
            roomId: roomValue || null,
            dayOfWeek,
            classArmId: classArm.id,
            slots,
            wantsDouble: placeDouble,
            entries,
            rooms,
            armLabel: armLabelFor,
          })
        : [],
    // `slots` is rebuilt every render, so depend on what it is made from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignment, roomValue, dayOfWeek, classArm.id, placeDouble, doubleBlockedReason, entries, rooms],
  );

  // "I understand" only counts for the problems that were on screen when it
  // was ticked. A new problem needs a fresh tick.
  const signature = issues.map((i) => i.id).join("|");
  const [ackedFor, setAckedFor] = useState<string | null>(null);
  const acknowledged = issues.length === 0 || ackedFor === signature;

  /* ---------------------------------- rooms -------------------------------- */

  const busyRoomIds = new Set(
    entries
      .filter(
        (e) =>
          e.roomId &&
          e.dayOfWeek === dayOfWeek &&
          slots.some((slot) => slot.id === e.periodId),
      )
      .map((e) => e.roomId as string),
  );

  const activeRooms = rooms.filter((r) => r.isActive);
  const recommended = assignment?.requiredRoomType
    ? activeRooms.filter((r) => r.type === assignment.requiredRoomType)
    : [];
  const otherRooms = activeRooms.filter((r) => !recommended.includes(r));

  const roomOption = (r: IRoom) => (
    <option key={r.id} value={r.id}>
      {r.name} · {ROOM_TYPE_LABELS[r.type]}
      {r.capacity ? ` · ${r.capacity}` : ""}
      {busyRoomIds.has(r.id) ? " · in use" : ""}
    </option>
  );

  /* ------------------------------- submitting ------------------------------ */

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

    if (banner.length > 0) setError("root.server", { message: banner.join(" ") });
    else if (!focused) setError("root.server", { message });
  };

  const submit = async (values: LessonFormValues) => {
    if (!assignment) return;

    const created: ITimetableEntryCreate[] = slots.map((slot) => ({
      timetableId,
      dayOfWeek,
      periodId: slot.id,
      assignmentId: assignment.id,
      // Taken from the assignment, never typed, so they always match it.
      teacherId: assignment.teacherId,
      classArmId: classArm.id,
      roomId: values.roomId || null,
      isLocked: values.isLocked,
      note: values.note.trim() || null,
    }));

    const fallback =
      created.length > 1
        ? "Could not add the lessons. Try again."
        : "Could not add the lesson. Try again.";

    try {
      const result = await onSubmit?.(created);

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

  const slotText = `${DAY_LABELS[dayOfWeek]} · ${shortLabel(period)} (${period.startTime}–${period.endTime}) · ${classArm.name}`;

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
        className="flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-xl bg-surface shadow-xl"
      >
        <div className="flex items-start justify-between gap-space-md border-b border-outline-variant/30 p-space-lg">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-heading text-lg font-semibold text-on-surface"
            >
              Add lesson
            </h2>
            <p className="mt-space-xs font-mono text-xs text-on-surface-variant">
              {slotText}
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

        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-space-lg overflow-y-auto p-space-lg">
            {errors.root?.server && (
              <p
                role="alert"
                className="rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
              >
                {errors.root.server.message}
              </p>
            )}

            {/* Subject */}
            <fieldset className="space-y-space-sm">
              <legend className="text-sm font-medium text-on-surface">
                Subject and teacher
              </legend>
              {errors.assignmentId?.message && (
                <p role="alert" className="text-xs text-error">
                  {errors.assignmentId.message}
                </p>
              )}

              {assignments.length === 0 ? (
                <p className="rounded-sm border border-dashed border-outline-variant p-space-md text-sm text-on-surface-variant">
                  {classArm.name} has no subjects with teachers yet. Assign
                  teachers first.
                </p>
              ) : (
                <ul className="max-h-64 space-y-space-xs overflow-y-auto">
                  {assignments.map((a) => {
                    const placed = countPlaced(a.id, entries);
                    const complete = placed >= a.periodsPerWeek;

                    return (
                      <li key={a.id}>
                        <label className="flex cursor-pointer items-center gap-space-md rounded-sm border border-outline-variant/40 p-space-sm transition-colors hover:bg-surface-container-low has-checked:border-primary has-checked:bg-primary-container/40 focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none">
                          <input
                            type="radio"
                            value={a.id}
                            className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                            {...register("assignmentId", {
                              required: "Choose a subject",
                              // A subject that is normally a double starts
                              // with the double-period box already ticked.
                              onChange: () =>
                                setValue(
                                  "placeDouble",
                                  a.requiresDoublePeriod && !doubleBlockedReason,
                                ),
                            })}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-space-xs">
                              <span className="text-sm font-medium text-on-surface">
                                {a.subject.name}
                              </span>
                              <span className="font-mono text-xs text-on-surface-variant">
                                {a.subject.code}
                              </span>
                              {a.requiresDoublePeriod && (
                                <span className="rounded-sm bg-surface-container px-space-xs font-mono text-[10px] text-on-surface-variant">
                                  Double
                                </span>
                              )}
                            </span>
                            <span className="block text-xs text-on-surface-variant">
                              {teacherLabel(a.teacher)}
                            </span>
                          </span>
                          <span
                            className={cx(
                              "shrink-0 rounded-full px-space-sm py-space-xs font-mono text-xs font-medium",
                              complete
                                ? "bg-success-container text-on-success-container"
                                : "bg-surface-container text-on-surface",
                            )}
                          >
                            {placed} of {a.periodsPerWeek}
                            <span className="sr-only"> lessons placed{complete ? ", complete" : ""}</span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </fieldset>

            {assignment && (
              <>
                {/* Double period */}
                <div className="space-y-space-xs">
                  <label
                    className={cx(
                      "flex items-center gap-space-sm text-sm",
                      doubleBlockedReason
                        ? "cursor-not-allowed text-on-surface-variant"
                        : "cursor-pointer text-on-surface",
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={!!doubleBlockedReason}
                      className="h-4 w-4 accent-primary disabled:opacity-50"
                      {...register("placeDouble")}
                    />
                    Double period: also use {next ? shortLabel(next) : "the next period"}
                  </label>
                  {doubleBlockedReason && (
                    <p className="pl-6 text-xs text-on-surface-variant">
                      {doubleBlockedReason}
                    </p>
                  )}
                </div>

                {/* Room */}
                <div className="space-y-space-xs">
                  <label htmlFor={roomId} className="text-sm font-medium text-on-surface">
                    Room <span className="font-normal text-on-surface-variant">(optional)</span>
                  </label>
                  <select id={roomId} className={INPUT} {...register("roomId")}>
                    <option value="">No room</option>
                    {recommended.length > 0 ? (
                      <>
                        <optgroup label="Recommended">
                          {recommended.map(roomOption)}
                        </optgroup>
                        <optgroup label="Other rooms">
                          {otherRooms.map(roomOption)}
                        </optgroup>
                      </>
                    ) : (
                      activeRooms.map(roomOption)
                    )}
                  </select>
                  {errors.roomId?.message && (
                    <p role="alert" className="text-xs text-error">
                      {errors.roomId.message}
                    </p>
                  )}
                </div>

                {/* Lock and note */}
                <label className="flex cursor-pointer items-start gap-space-sm text-sm text-on-surface">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-primary"
                    {...register("isLocked")}
                  />
                  <span>
                    Lock this lesson
                    <span className="block text-xs text-on-surface-variant">
                      A locked lesson stays where it is when the timetable is
                      generated again.
                    </span>
                  </span>
                </label>

                <div className="space-y-space-xs">
                  <label htmlFor={noteId} className="text-sm font-medium text-on-surface">
                    Note <span className="font-normal text-on-surface-variant">(optional)</span>
                  </label>
                  <textarea
                    id={noteId}
                    rows={2}
                    maxLength={MAX_NOTE}
                    placeholder="For example: practical session"
                    className={INPUT}
                    {...register("note")}
                  />
                  {errors.note?.message && (
                    <p role="alert" className="text-xs text-error">
                      {errors.note.message}
                    </p>
                  )}
                </div>

                {/* Checks */}
                <section aria-label="Checks" aria-live="polite" className="space-y-space-sm">
                  {issues.length === 0 ? (
                    <p className="flex items-center gap-space-sm rounded-sm bg-success-container px-space-md py-space-sm text-sm text-on-success-container">
                      <CircleCheck size={16} aria-hidden="true" className="shrink-0" />
                      No clashes. This lesson fits.
                    </p>
                  ) : (
                    <>
                      <ul className="space-y-space-xs">
                        {issues.map((issue) => (
                          <li
                            key={issue.id}
                            className={cx(
                              "flex items-start gap-space-sm rounded-sm px-space-md py-space-sm text-sm",
                              issue.severity === "conflict"
                                ? "bg-error-container text-on-error-container"
                                : "bg-warning-container text-on-warning-container",
                            )}
                          >
                            {issue.severity === "conflict" ? (
                              <Ban size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                            ) : (
                              <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                            )}
                            <span>
                              <span className="font-medium">
                                {issue.severity === "conflict" ? "Clash: " : "Warning: "}
                              </span>
                              {issue.message}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <label className="flex cursor-pointer items-center gap-space-sm text-sm text-on-surface">
                        <input
                          type="checkbox"
                          checked={ackedFor === signature}
                          onChange={(e) => setAckedFor(e.target.checked ? signature : null)}
                          className="h-4 w-4 accent-primary"
                        />
                        I understand. Add it anyway.
                      </label>
                    </>
                  )}
                </section>
              </>
            )}
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
              disabled={isSubmitting || !assignment || !acknowledged}
              className={cx(
                "rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
                FOCUS_RING,
              )}
            >
              {isSubmitting
                ? "Adding…"
                : slots.length > 1
                  ? "Add 2 lessons"
                  : "Add lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default AddLessonModal;