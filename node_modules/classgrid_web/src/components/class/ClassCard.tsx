import { Plus } from "lucide-react";
import { useId } from "react";
import type { IClassLevel } from "../../interface/class.interface";

/** The few arm fields the card needs. */
export interface ClassArmSummary {
  id: string;
  name: string;
  isActive: boolean;
}

interface ClassCardProps {
  classLevel: IClassLevel;
  /** The arms (A, B, C…) that belong to this class level. */
  arms?: ClassArmSummary[];
  onEdit?: (classLevel: IClassLevel) => void;
  onAddArm?: (classLevel: IClassLevel) => void;
}

const BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm border border-outline-variant px-space-md py-space-xs text-sm font-medium text-on-surface transition-colors hover:bg-surface-container motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const ClassCard = ({ classLevel, arms = [], onEdit, onAddArm }: ClassCardProps) => {
  const titleId = useId();
  const { name, stage, rank, isActive } = classLevel;

  return (
    <article
      aria-labelledby={titleId}
      className={[
        "flex flex-col gap-space-md rounded-sm border border-l-4 border-outline-variant/40 bg-surface p-space-md",
        isActive ? "border-l-primary" : "border-l-outline-variant",
      ].join(" ")}
    >
      <header className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <h3
            id={titleId}
            className={[
              "truncate font-heading text-base font-semibold",
              isActive ? "text-on-surface" : "text-on-surface-variant",
            ].join(" ")}
          >
            {name}
          </h3>
          <p className="mt-space-xs text-xs text-on-surface-variant">
            <span className="font-mono font-medium text-on-surface">{stage}</span>
            {" · "}Position {rank} in the stage
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-space-sm py-space-xs text-xs font-medium",
            isActive
              ? "bg-success-container text-on-success-container"
              : "bg-surface-container text-on-surface-variant",
          ].join(" ")}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </header>

      {/* Arms */}
      <div className="space-y-space-sm">
        <p className="text-xs text-on-surface-variant">
          {arms.length === 0
            ? "No arms yet"
            : `${arms.length} ${arms.length === 1 ? "arm" : "arms"}`}
        </p>

        {arms.length > 0 && (
          <ul aria-label={`Arms of ${name}`} className="flex flex-wrap gap-space-xs">
            {arms.map((arm) => (
              <li
                key={arm.id}
                className={[
                  "rounded-sm px-space-sm py-space-xs font-mono text-xs font-medium",
                  arm.isActive
                    ? "bg-surface-container text-on-surface"
                    : "bg-surface-container text-on-surface-variant line-through",
                ].join(" ")}
              >
                {arm.name}
                {!arm.isActive && <span className="sr-only"> (inactive)</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-space-sm">
        {onAddArm && (
          <button
            type="button"
            onClick={() => onAddArm(classLevel)}
            aria-label={`Add an arm to ${name}`}
            className={BUTTON}
          >
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Add arm
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(classLevel)}
            aria-label={`Edit ${name}`}
            className={BUTTON}
          >
            Edit
          </button>
        )}
      </footer>
    </article>
  );
};

export default ClassCard;