import { useId } from "react";
import { LayoutGrid, Printer } from "lucide-react";
import type { ITeacher } from "../../interface/teacher.interface";
import type { ClassStage } from "../../interface/class.interface";

export type StageFilter = ClassStage | "ALL";

export interface TimetableQuery {
  stage: StageFilter;
  classArmId: string;
  teacherId: string;
}

interface TimetableQueryBarProps {
  classArms: { id: string; name: string; className?: string; classStage?: ClassStage }[];
  teachers: ITeacher[];
  value: TimetableQuery;
  onChange: (next: TimetableQuery) => void;
  onViewMasterGrid?: () => void;
  onPrint?: () => void;
  printDisabled?: boolean;
}

const CHIP =
  "cursor-pointer whitespace-nowrap rounded px-2 py-1 font-mono text-[11px] font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const SELECT_CLASS =
  "h-8 w-full cursor-pointer appearance-none rounded border border-outline-variant/40 bg-surface-container px-2 text-xs text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

const PRIMARY_BUTTON =
  "inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded bg-primary px-3 text-xs font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const SECONDARY_BUTTON =
  "inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded border border-outline-variant px-3 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const STAGES: StageFilter[] = ["ALL", "JSS", "SS"];

const teacherName = (t: ITeacher) =>
  [t.title, t.firstName, t.lastName].filter(Boolean).join(" ");

const TimetableQueryBar = ({
  classArms,
  teachers,
  value,
  onChange,
  onViewMasterGrid,
  onPrint,
  printDisabled = true,
}: TimetableQueryBarProps) => {
  const classSelectId = useId();
  const teacherSelectId = useId();

  const visibleArms =
    value.stage === "ALL"
      ? classArms
      : classArms.filter((a) => a.classStage === value.stage);

  const setStage = (stage: StageFilter) => {
    const stillValid =
      value.classArmId &&
      (stage === "ALL" ||
        classArms.find((a) => a.id === value.classArmId)?.classStage === stage);
    onChange({
      ...value,
      stage,
      classArmId: stillValid ? value.classArmId : "",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-outline-variant/40 bg-surface p-2">
      {/* Stage chips */}
      <div role="group" aria-label="Filter by stage" className="flex gap-1">
        {STAGES.map((stage) => (
          <button
            key={stage}
            type="button"
            aria-pressed={value.stage === stage}
            onClick={() => setStage(stage)}
            className={[
              CHIP,
              value.stage === stage
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface hover:bg-surface-container-high",
            ].join(" ")}
          >
            {stage === "ALL" ? "All" : stage}
          </button>
        ))}
      </div>

      {/* Class — labelled via aria-label, no visible label */}
      <select
        id={classSelectId}
        aria-label="Class"
        value={value.classArmId}
        onChange={(e) => onChange({ ...value, classArmId: e.target.value })}
        className={`${SELECT_CLASS} w-auto min-w-32 flex-1`}
        disabled={visibleArms.length === 0}
      >
        <option value="">
          {visibleArms.length === 0
            ? `No ${value.stage === "ALL" ? "" : value.stage + " "}classes`
            : "All classes"}
        </option>
        {visibleArms.map((classArm) => (
          <option key={classArm.id} value={classArm.id}>
            {[classArm.className, classArm.name].filter(Boolean).join(" ")}
          </option>
        ))}
      </select>

      {/* Teacher */}
      <select
        id={teacherSelectId}
        aria-label="Teacher"
        value={value.teacherId}
        onChange={(e) => onChange({ ...value, teacherId: e.target.value })}
        className={`${SELECT_CLASS} w-auto min-w-32 flex-1`}
      >
        <option value="">All teachers</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {teacherName(t)}
            {t.staffCode ? ` — ${t.staffCode}` : ""}
          </option>
        ))}
      </select>

      {/* Actions */}
      <div className="ml-auto flex gap-1">
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            disabled={printDisabled}
            className={SECONDARY_BUTTON}
            title={printDisabled ? "Open a grid first" : "Print the visible grid"}
            aria-label="Print"
          >
            <Printer size={14} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={onViewMasterGrid}
          className={PRIMARY_BUTTON}
          aria-label="View master grid"
        >
          <LayoutGrid size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Master Grid</span>
        </button>
      </div>
    </div>
  );
};

export default TimetableQueryBar;