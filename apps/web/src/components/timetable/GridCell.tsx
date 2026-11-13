
import { AlertTriangle } from "lucide-react";

interface GridCellProps {
  subject: string;
  teacher: string;
  room?: string;
  /** Highlights the cell red — indicates a scheduling conflict. */
  isConflicting?: boolean;
}

const GridCell = ({
  subject,
  teacher,
  room,
  isConflicting = false,
}: GridCellProps) => {
  return (
    <div
      className={[
        "flex h-full min-h-14 flex-col justify-center gap-0.5 rounded-sm px-1.5 py-1 text-center",
        isConflicting
          ? "bg-error-container text-on-error-container ring-1 ring-error/40"
          : "",
      ].join(" ")}
      title={
        isConflicting
          ? `Conflict — ${subject} (${teacher}${room ? `, ${room}` : ""})`
          : `${subject} — ${teacher}${room ? `, ${room}` : ""}`
      }
    >
      <span className="flex items-center justify-center gap-1">
        {isConflicting && (
          <AlertTriangle
            size={12}
            aria-hidden="true"
            className="shrink-0"
          />
        )}
        <span
          className={[
            "truncate text-xs font-medium leading-tight",
            isConflicting ? "text-on-error-container" : "text-on-surface",
          ].join(" ")}
        >
          {subject}
        </span>
      </span>

      <span
        className={[
          "truncate text-[11px] leading-tight",
          isConflicting ? "text-on-error-container/80" : "text-on-surface-variant",
        ].join(" ")}
      >
        {teacher}
      </span>

      {room && (
        <span
          className={[
            "truncate font-mono text-[10px] leading-tight",
            isConflicting ? "text-on-error-container/70" : "text-on-surface-variant/70",
          ].join(" ")}
        >
          {room}
        </span>
      )}
    </div>
  );
};

export default GridCell;
