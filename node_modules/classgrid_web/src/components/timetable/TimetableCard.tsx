import { Archive, Clock, Eye, FileText, Globe, Layers } from "lucide-react";
import { useId } from "react";
import type {
  ITimetableListItem,
  TimetableStatus,
} from "../../interface/timetable.interface";
import { formatDate, formatDateTime } from "../../utils/sessionUtils";

interface TimetableCardProps {
  timetable: ITimetableListItem;
  onView?: (timetable: ITimetableListItem) => void;
  onPublish?: (timetable: ITimetableListItem) => void;
  onArchive?: (timetable: ITimetableListItem) => void;
  onEdit?: (timetable: ITimetableListItem) => void;
}

/* -------------------------------- helpers -------------------------------- */

const STATUS_LABEL: Record<TimetableStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STATUS_PILL: Record<TimetableStatus, string> = {
  DRAFT: "bg-warning-container text-on-warning-container",
  PUBLISHED: "bg-success-container text-on-success-container",
  ARCHIVED: "bg-surface-container text-on-surface-variant",
};

const STATUS_BORDER: Record<TimetableStatus, string> = {
  DRAFT: "border-l-warning",
  PUBLISHED: "border-l-success",
  ARCHIVED: "border-l-outline-variant",
};

const BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm px-space-md py-space-xs text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60";



/* ---------------------------------- card ---------------------------------- */

const TimetableCard = ({
  timetable,
  onView,
  onPublish,
  onArchive,
  onEdit,
}: TimetableCardProps) => {
  const titleId = useId();
  const isDraft = timetable.status === "DRAFT";
  const isPublished = timetable.status === "PUBLISHED";
  const isArchived = timetable.status === "ARCHIVED";

  return (
    <article
      aria-labelledby={titleId}
      className={[
        "flex flex-col gap-space-md rounded-sm border border-l-4 border-outline-variant/40 bg-surface p-space-md",
        STATUS_BORDER[timetable.status],
      ].join(" ")}
    >
      {/* Header: name + version + status pill */}
      <header className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-space-xs">
            <h3
              id={titleId}
              className="truncate font-heading text-base font-semibold text-on-surface"
            >
              {timetable.name}
            </h3>
            <span className="shrink-0 rounded-sm bg-surface-container px-space-xs py-space-xs font-mono text-[10px] font-medium text-on-surface-variant">
              v{timetable.version}
            </span>
          </div>
          {timetable.basedOnId && (
            <p className="mt-space-xs font-mono text-xs text-on-surface-variant">
              Based on another version
            </p>
          )}
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-space-sm py-space-xs text-xs font-medium",
            STATUS_PILL[timetable.status],
          ].join(" ")}
        >
          {STATUS_LABEL[timetable.status]}
        </span>
      </header>

      {/* Stats row — entries count + dates */}
      <dl className="grid grid-cols-2 gap-space-sm text-sm">
        <div className="flex items-center gap-space-xs">
          <Layers size={14} className="text-on-surface-variant" aria-hidden="true" />
          <div>
            <dt className="text-xs text-on-surface-variant">Entries</dt>
            <dd className="font-mono font-medium text-on-surface">
              {timetable.entriesCount}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-space-xs">
          <Clock size={14} className="text-on-surface-variant" aria-hidden="true" />
          <div>
            <dt className="text-xs text-on-surface-variant">
              {isPublished ? "Published" : isArchived ? "Archived" : "Updated"}
            </dt>
            <dd className="font-mono text-xs text-on-surface">
              {formatDate(
                isPublished
                  ? timetable.publishedAt
                  : isArchived
                    ? timetable.archivedAt
                    : timetable.updatedAt,
              )}
            </dd>
          </div>
        </div>
      </dl>

      {/* Timestamps footnote — for published items, shows both dates */}
      {isPublished && timetable.publishedAt && (
        <p className="font-mono text-[11px] text-on-surface-variant">
          Published {formatDateTime(timetable.publishedAt)}
        </p>
      )}

      {/* Actions */}
      <footer className="mt-auto flex flex-wrap items-center justify-end gap-space-sm">
        {onEdit && isDraft && (
          <button
            type="button"
            onClick={() => onEdit(timetable)}
            className={`${BUTTON} border border-outline-variant text-on-surface hover:bg-surface-container`}
          >
            <FileText size={14} aria-hidden="true" />
            Edit
          </button>
        )}

        {onView && (
          <button
            type="button"
            onClick={() => onView(timetable)}
            className={`${BUTTON} border border-outline-variant text-on-surface hover:bg-surface-container`}
          >
            <Eye size={14} aria-hidden="true" />
            View
          </button>
        )}

        {onPublish && isDraft && (
          <button
            type="button"
            onClick={() => onPublish(timetable)}
            className={`${BUTTON} bg-primary text-on-primary hover:bg-primary-hover`}
          >
            <Globe size={14} aria-hidden="true" />
            Publish
          </button>
        )}

        {onArchive && isPublished && (
          <button
            type="button"
            onClick={() => onArchive(timetable)}
            className={`${BUTTON} text-error hover:bg-error-container/40`}
          >
            <Archive size={14} aria-hidden="true" />
            Archive
          </button>
        )}
      </footer>
    </article>
  );
};

export default TimetableCard;