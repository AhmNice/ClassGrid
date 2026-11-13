import { useState } from "react";
import { CircleCheck, Lock, LockOpen, PencilLine, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  countWeekdays,
  formatRange,
  weeksBetween,
  type TermStatus,
} from "../utils/sessionUtils";
import type { ITerm } from "../interface/AcademicSession.interface";

// Taken from ITerm so it can't drift from the real type.
type TimetableStatus = ITerm["timetableStatus"];

interface TermCardProps {
  term: ITerm;
  status: TermStatus;
  onEditDates?: (term: ITerm) => void;
  /** Called after the user confirms deletion. The card shows a busy state until it settles. */
  onDelete?: (term: ITerm) => void | Promise<void>;
  /** Hides the edit and delete buttons, for sessions that can't be changed. */
  readOnly?: boolean;
}

/* --------------------------------- styling -------------------------------- */

const STATUS_BADGE: Record<TermStatus, { label: string; className: string }> = {
  active: {
    label: "In progress",
    className: "bg-success-container text-on-success-container",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-info-container text-on-info-container",
  },
  completed: {
    label: "Completed",
    className: "bg-surface-container text-on-surface-variant",
  },
};

// The left edge shows where the term is in time.
const STATUS_EDGE: Record<TermStatus, string> = {
  active: "border-l-success",
  upcoming: "border-l-info",
  completed: "border-l-outline-variant",
};

const TIMETABLE_ACTION: Record<
  NonNullable<TimetableStatus>,
  { label: string; to: string }
> = {
  published: { label: "View timetable", to: "/timetables" },
  draft: { label: "Continue timetable", to: "/timetable-editor" },
  not_started: { label: "Generate timetable", to: "/generate" },
};

const FOCUS_RING = [
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
].join(" ");

const BUTTON_BASE = [
  "inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm px-space-md py-space-xs",
  "text-sm font-medium transition-colors motion-reduce:transition-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
  FOCUS_RING,
].join(" ");

const SECONDARY_BUTTON = [
  BUTTON_BASE,
  "border border-outline-variant text-on-surface hover:bg-surface-container",
].join(" ");

const DANGER_OUTLINE_BUTTON = [
  BUTTON_BASE,
  "border border-error text-error hover:bg-error-container",
].join(" ");

const DANGER_SOLID_BUTTON = [
  BUTTON_BASE,
  "bg-error text-on-error hover:opacity-90",
].join(" ");

// The API names terms FIRST / SECOND / THIRD. Show people something readable.
// Move this next to TermName if the modal and other pages need it too.
const TERM_LABELS: Record<string, string> = {
  FIRST: "First Term ",
  SECOND: "Second Term ",
  THIRD: "Third Term ",
};
const termLabel = (name: string) => TERM_LABELS[name] ?? name;

/* ------------------------------ subcomponents ----------------------------- */

const TimetableBadge = ({ term }: { term: ITerm }) => {
  if (term.timetableStatus === "published") {
    return (
      <span className="inline-flex items-center gap-space-xs rounded-full bg-success-container px-space-sm py-space-xs text-xs font-medium text-on-success-container">
        <CircleCheck size={14} aria-hidden="true" />
        {term.timetableVersion
          ? `${term.timetableVersion} published`
          : "Published"}
      </span>
    );
  }
  if (term.timetableStatus === "draft") {
    return (
      <span className="inline-flex items-center gap-space-xs rounded-full bg-warning-container px-space-sm py-space-xs text-xs font-medium text-on-warning-container">
        <PencilLine size={14} aria-hidden="true" />
        {term.timetableVersion ? `Draft ${term.timetableVersion}` : "Draft"}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-surface-container px-space-sm py-space-xs text-xs font-medium text-on-surface-variant">
      No timetable yet
    </span>
  );
};

interface StatProps {
  label: string;
  start: Date | null;
  end: Date | null;
  detail: string;
}

const Stat = ({ label, start, end, detail }: StatProps) => {
  const isSet = start && end;
  return (
    <div className="rounded-sm bg-surface-container p-space-sm">
      <dt className="text-xs text-on-surface-variant">{label}</dt>
      <dd
        className={
          isSet
            ? "mt-space-xs font-mono text-sm font-medium text-on-surface"
            : "mt-space-xs text-sm text-on-surface-variant"
        }
      >
        {formatRange(start, end)}
      </dd>
      {isSet && (
        <p className="mt-space-xs text-xs text-on-surface-variant">{detail}</p>
      )}
    </div>
  );
};

/* ---------------------------------- card ---------------------------------- */

const TermCard = ({
  term,
  status,
  onEditDates,
  onDelete,
  readOnly = false,
}: TermCardProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const badge = STATUS_BADGE[status];
  const action = term.timetableStatus
    ? TIMETABLE_ACTION[term.timetableStatus]
    : undefined;

  const teachingWeeks =
    term.startDate && term.endDate
      ? weeksBetween(term.startDate, term.endDate)
      : 0;
  const breakDays =
    term.midTermStartDate && term.midTermEndDate
      ? countWeekdays(term.midTermStartDate, term.midTermEndDate)
      : 0;
  const examDays =
    term.examStartDate && term.examEndDate
      ? countWeekdays(term.examStartDate, term.examEndDate)
      : 0;

  const canDelete = !readOnly && !!onDelete;
  // A locked term shouldn't be deletable. Adjust if your rules differ
  // (e.g. also block when a timetable is published).
  const deleteBlocked = !!term.isLocked;

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(term);
    } finally {
      // On success the card usually unmounts; on failure, drop back to normal.
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <article
      className={[
        "flex flex-col gap-space-md rounded-sm border border-l-4 border-outline-variant/40 bg-surface p-space-md",
        STATUS_EDGE[status],
      ].join(" ")}
    >
      <header className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          <h3 className="font-heading text-base font-semibold text-on-surface">
            {termLabel(term.name)}
          </h3>
          <span
            className={`rounded-full px-space-sm py-space-xs text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <TimetableBadge term={term} />
      </header>

      <dl className="grid gap-space-sm md:grid-cols-3">
        <Stat
          label="Instructional period"
          start={term.startDate ?? null}
          end={term.endDate ?? null}
          detail={`${teachingWeeks} teaching weeks`}
        />
        <Stat
          label="Mid-term break"
          start={term.midTermStartDate}
          end={term.midTermEndDate}
          detail={`${breakDays} school days`}
        />
        <Stat
          label="Examinations"
          start={term.examStartDate}
          end={term.examEndDate}
          detail={`${examDays} school days`}
        />
      </dl>

      <footer className="flex flex-wrap items-center justify-between gap-space-sm">
        <span className="inline-flex items-center gap-space-xs text-sm text-on-surface-variant">
          {term.isLocked ? (
            <Lock size={14} aria-hidden="true" />
          ) : (
            <LockOpen size={14} aria-hidden="true" />
          )}
          {term.isLocked ? "Timetable locked" : "Timetable editable"}
        </span>

        {confirmingDelete ? (
          <div
            role="alertdialog"
            aria-label={`Confirm deleting ${termLabel(term.name)}`}
            className="flex flex-wrap items-center gap-space-sm"
          >
            <p className="text-sm text-on-surface">
              Delete {termLabel(term.name).trim()}? This can&apos;t be undone.
            </p>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={isDeleting}
              className={SECONDARY_BUTTON}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className={DANGER_SOLID_BUTTON}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-space-sm">
            {canDelete && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={deleteBlocked}
                title={
                  deleteBlocked
                    ? "Unlock this term's timetable before deleting it"
                    : undefined
                }
                className={DANGER_OUTLINE_BUTTON}
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </button>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={() => onEditDates?.(term)}
                className={SECONDARY_BUTTON}
              >
                Edit dates
              </button>
            )}
            {action && (
              <Link to={action.to} className={SECONDARY_BUTTON}>
                {action.label}
              </Link>
            )}
          </div>
        )}
      </footer>
    </article>
  );
};

export default TermCard;