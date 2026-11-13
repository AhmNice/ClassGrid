import { useEffect, useRef } from "react";
import type { ClassStage, IClassLevel } from "../interface/class.interface";
import type { ISubject } from "../interface/subject.interface";

/** The key used for one cell of the grid. */
export const cellKey = (classLevelId: string, subjectId: string) =>
  `${classLevelId}|${subjectId}`;

const STAGE_NAMES: Record<ClassStage, string> = {
  JSS: "Junior Secondary",
  SS: "Senior Secondary",
};

/* ------------------------------ select-all box ----------------------------- */

interface TriStateCheckboxProps {
  checked: boolean;
  /** Some, but not all, are ticked. */
  indeterminate: boolean;
  disabled?: boolean;
  label: string;
  onChange: (on: boolean) => void;
}

const TriStateCheckbox = ({
  checked,
  indeterminate,
  disabled,
  label,
  onChange,
}: TriStateCheckboxProps) => {
  const ref = useRef<HTMLInputElement>(null);

  // "Indeterminate" can only be set from code, not with an attribute.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
};

/* ---------------------------------- matrix --------------------------------- */

interface SubjectMatrixProps {
  levels: IClassLevel[];
  /** The subjects to show (already searched). */
  subjects: ISubject[];
  /** Cells that are ticked right now. */
  assigned: Set<string>;
  /** Cells that were ticked when last saved, to highlight what changed. */
  saved: Set<string>;
  onToggle: (classLevelId: string, subjectId: string) => void;
  onToggleMany: (keys: string[], on: boolean) => void;
}

const TH = "px-space-sm py-space-sm text-center align-bottom";
const isEligible = (subject: ISubject, level: IClassLevel) =>
  subject.classStage.includes(level.stage);

const SubjectMatrix = ({
  levels,
  subjects,
  assigned,
  saved,
  onToggle,
  onToggleMany,
}: SubjectMatrixProps) => {
  // JSS then SS, each with its levels, for the grouped heading row.
  const stages = (Object.keys(STAGE_NAMES) as ClassStage[])
    .map((stage) => ({
      stage,
      levels: levels.filter((l) => l.stage === stage),
    }))
    .filter((group) => group.levels.length > 0);

  return (
    <div className="overflow-x-auto rounded-sm border border-outline-variant/40 bg-surface">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <caption className="sr-only">
          Which subjects each class level offers. Tick a box to offer a subject.
        </caption>

        <thead className="bg-surface-container text-on-surface-variant">
          <tr>
            <th
              scope="col"
              rowSpan={2}
              className="sticky left-0 z-10 min-w-48 bg-surface-container px-space-md py-space-sm text-left align-bottom text-xs font-medium"
            >
              Subject
            </th>
            {stages.map((group) => (
              <th
                key={group.stage}
                scope="colgroup"
                colSpan={group.levels.length}
                className="border-l border-outline-variant/40 px-space-sm py-space-sm text-center text-xs font-medium"
              >
                {STAGE_NAMES[group.stage]}
              </th>
            ))}
            <th
              scope="col"
              rowSpan={2}
              className="border-l border-outline-variant/40 px-space-sm py-space-sm text-center align-bottom text-xs font-medium"
            >
              All levels
            </th>
          </tr>

          <tr>
            {stages.flatMap((group) =>
              group.levels.map((level, index) => {
                const eligible = subjects.filter((s) => isEligible(s, level));
                const ticked = eligible.filter((s) =>
                  assigned.has(cellKey(level.id, s.id)),
                ).length;
                const total = [...assigned].filter((key) =>
                  key.startsWith(`${level.id}|`),
                ).length;

                return (
                  <th
                    key={level.id}
                    scope="col"
                    className={`${TH} ${index === 0 ? "border-l border-outline-variant/40" : ""}`}
                  >
                    <span className="block text-xs font-medium text-on-surface">
                      {level.name}
                    </span>
                    <span className="mb-space-xs block font-mono text-[10px]">
                      {total} {total === 1 ? "subject" : "subjects"}
                    </span>
                    <TriStateCheckbox
                      checked={eligible.length > 0 && ticked === eligible.length}
                      indeterminate={ticked > 0 && ticked < eligible.length}
                      disabled={eligible.length === 0}
                      label={`Offer all shown subjects in ${level.name}`}
                      onChange={(on) =>
                        onToggleMany(
                          eligible.map((s) => cellKey(level.id, s.id)),
                          on,
                        )
                      }
                    />
                  </th>
                );
              }),
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-outline-variant/40">
          {subjects.map((subject) => {
            const eligibleLevels = levels.filter((l) => isEligible(subject, l));
            const ticked = eligibleLevels.filter((l) =>
              assigned.has(cellKey(l.id, subject.id)),
            ).length;

            return (
              <tr key={subject.id} className="group hover:bg-surface-container-low">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface px-space-md py-space-sm text-left font-normal group-hover:bg-surface-container-low"
                >
                  <span className="block font-medium text-on-surface">
                    {subject.name}
                  </span>
                  {subject.code && (
                    <span className="font-mono text-xs text-on-surface-variant">
                      {subject.code}
                    </span>
                  )}
                </th>

                {stages.flatMap((group) =>
                  group.levels.map((level, index) => {
                    const edge =
                      index === 0 ? "border-l border-outline-variant/40" : "";

                    if (!isEligible(subject, level)) {
                      return (
                        <td
                          key={level.id}
                          title={`${subject.name} isn’t offered in ${STAGE_NAMES[level.stage]}`}
                          className={`${edge} px-space-sm py-space-sm text-center text-on-surface-variant`}
                        >
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">
                            Not offered in {STAGE_NAMES[level.stage]}
                          </span>
                        </td>
                      );
                    }

                    const key = cellKey(level.id, subject.id);
                    const isTicked = assigned.has(key);
                    const changed = isTicked !== saved.has(key);

                    return (
                      <td
                        key={level.id}
                        className={[
                          edge,
                          "p-0 text-center",
                          changed ? "bg-primary-container/50" : "",
                        ].join(" ")}
                      >
                        {/* The whole cell is the click target, not just the box. */}
                        <label className="grid cursor-pointer place-items-center px-space-sm py-space-sm">
                          <input
                            type="checkbox"
                            checked={isTicked}
                            onChange={() => onToggle(level.id, subject.id)}
                            aria-label={`${subject.name} in ${level.name}`}
                            className="h-4 w-4 cursor-pointer accent-primary"
                          />
                        </label>
                      </td>
                    );
                  }),
                )}

                <td className="border-l border-outline-variant/40 px-space-sm py-space-sm text-center">
                  <TriStateCheckbox
                    checked={eligibleLevels.length > 0 && ticked === eligibleLevels.length}
                    indeterminate={ticked > 0 && ticked < eligibleLevels.length}
                    disabled={eligibleLevels.length === 0}
                    label={`Offer ${subject.name} in every level it can be taught`}
                    onChange={(on) =>
                      onToggleMany(
                        eligibleLevels.map((l) => cellKey(l.id, subject.id)),
                        on,
                      )
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectMatrix;