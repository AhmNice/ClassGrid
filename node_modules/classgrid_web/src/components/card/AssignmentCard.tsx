import { UserPlus } from "lucide-react";
import { useId } from "react";
import type {
  SubjectWithTeachers,
  TeacherSummary,
  TeachingAssignmentSummary,
} from "../../interface/Teaching-assignment.interface";

interface AssignmentCardProps {
  subject: SubjectWithTeachers;
  onAssign?: (subject: SubjectWithTeachers) => void;
  onChange?: (
    subject: SubjectWithTeachers,
    assignment: TeachingAssignmentSummary,
  ) => void;
  onRemove?: (
    subject: SubjectWithTeachers,
    assignment: TeachingAssignmentSummary,
  ) => void;
}

/* --------------------------------- helpers -------------------------------- */

const teacherName = (t: TeacherSummary) =>
  [t.title, t.firstName, t.lastName].filter(Boolean).join(" ");

const initials = (t: TeacherSummary) =>
  `${t.firstName.charAt(0)}${t.lastName.charAt(0)}`.toUpperCase();

const BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm px-space-md py-space-xs text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const Avatar = ({
  teacher,
  className,
}: {
  teacher: TeacherSummary;
  className: string;
}) => (
  <span
    aria-hidden="true"
    className={`grid shrink-0 place-items-center rounded-full bg-primary-container font-medium text-on-primary-container ${className}`}
  >
    {initials(teacher)}
  </span>
);

/* ---------------------------------- card ---------------------------------- */

const AssignmentCard = ({
  subject,
  onAssign,
  onChange,
  onRemove,
}: AssignmentCardProps) => {
  const titleId = useId();

  const assignment = subject.assignments[0];
  const isAssigned = subject.isAssigned;

  return (
    <article
      aria-labelledby={titleId}
      className={[
        "flex flex-col gap-space-md rounded-sm border border-l-4 border-outline-variant/40 bg-surface p-space-md",
        isAssigned ? "border-l-success" : "border-l-warning",
      ].join(" ")}
    >
      {/* Subject */}
      <header className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <h3
            id={titleId}
            className="truncate font-heading text-base font-semibold text-on-surface"
          >
            {subject.name}
          </h3>
          <p className="mt-space-xs font-mono text-xs text-on-surface-variant">
            {subject.code}
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-space-sm py-space-xs text-xs font-medium",
            isAssigned
              ? "bg-success-container text-on-success-container"
              : "bg-warning-container text-on-warning-container",
          ].join(" ")}
        >
          {isAssigned ? "Assigned" : "Needs teacher"}
        </span>
      </header>

      {/* Teacher / empty state */}
      {assignment ? (
        <div className="flex items-center gap-space-md rounded-sm bg-surface-container p-space-sm">
          <Avatar teacher={assignment.teacher} className="h-10 w-10 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-on-surface">
              {teacherName(assignment.teacher)}
            </p>
            <p className="font-mono text-xs text-on-surface-variant">
              {assignment.teacher.staffCode}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block font-heading text-lg font-bold leading-none text-on-surface">
              {assignment.periodsPerWeek}
            </span>
            <span className="text-xs text-on-surface-variant">per week</span>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-space-md rounded-sm border border-dashed border-outline-variant p-space-sm">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-container text-on-surface-variant"
          >
            <UserPlus size={14} />
          </span>
          <p className="text-sm text-on-surface-variant">
            No teacher assigned to this subject yet.
          </p>
        </div>
      )}

      {/* Actions */}
      <footer className="mt-auto flex flex-wrap items-center justify-end gap-space-sm">
        {assignment ? (
          <>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(subject, assignment)}
                aria-label={`Remove the teacher from ${subject.name}`}
                className={`${BUTTON} text-error hover:bg-error-container/40`}
              >
                Remove
              </button>
            )}
            {onChange && (
              <button
                type="button"
                onClick={() => onChange(subject, assignment)}
                aria-label={`Change the teacher for ${subject.name}`}
                className={`${BUTTON} border border-outline-variant text-on-surface hover:bg-surface-container`}
              >
                Change
              </button>
            )}
          </>
        ) : (
          onAssign && (
            <button
              type="button"
              onClick={() => onAssign(subject)}
              aria-label={`Assign a teacher to ${subject.name}`}
              className={`${BUTTON} bg-primary text-on-primary hover:bg-primary-hover`}
            >
              <UserPlus size={14} strokeWidth={2} aria-hidden="true" />
              Assign teacher
            </button>
          )
        )}
      </footer>
    </article>
  );
};

export default AssignmentCard;