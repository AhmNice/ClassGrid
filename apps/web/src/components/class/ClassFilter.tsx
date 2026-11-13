
import type { IClassArm } from "../../interface/classArm.interface";
import {
  CLASS_STAGE_LABELS,
  CLASS_STAGES,
  CLASS_TRACK_LABELS,
  CLASS_TRACKS,
  DEFAULT_CLASS_FILTERS,
  type ClassFilterState,
  type ClassTrack,
} from "./classTypes";
import { Search } from "lucide-react";
import type { ClassStage } from "../../interface/class.interface";

interface ClassFilterProps {
  classes: IClassArm[];
  filters: ClassFilterState;
  onChange: (filters: ClassFilterState) => void;
}

const hasActiveFilters = (filters: ClassFilterState) =>
  filters.query.trim() !== "" ||
  filters.stage !== "ALL" ||
  filters.track !== "ALL" ||
  filters.status !== "ALL";

const ClassFilter = ({ classes = [], filters, onChange }: ClassFilterProps) => {
  // Stage chips — single dimension: filters.stage
  const stageChips: {
    value: ClassStage | "ALL";
    label: string;
    count: number;
  }[] = [
    { value: "ALL", label: "All Tiers", count: classes.length },
    ...CLASS_STAGES.filter((stage) =>
      classes.some((cl) => cl.classStage === stage),
    ).map((stage) => ({
      value: stage,
      label: CLASS_STAGE_LABELS[stage],
      count: classes.filter((cl) => cl.classStage === stage).length,
    })),
  ];

  // Track chips — single dimension: filters.track
  // Use a real field if IClassArm has one, e.g. cl.track; fall back to className only if needed.
  const trackChips: {
    value: ClassTrack | "ALL";
    label: string;
    count: number;
  }[] = [
    { value: "ALL", label: "All Tracks", count: classes.length },
    ...CLASS_TRACKS.filter((track) =>
      classes.some((cl) => cl.track === track),
    ).map((track) => ({
      value: track,
      label: CLASS_TRACK_LABELS[track],
      count: classes.filter((cl) => cl.track === track).length,
    })),
  ];

  const set = <K extends keyof ClassFilterState>(
    key: K,
    value: ClassFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-4 rounded-md border border-outline-variant/40 bg-surface p-4 overflow-x-auto">
      <div className="gap-space-sm flex flex-wrap items-center">
        <div className="relative w-full sm:w-52 shrink-0">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            autoComplete="off"
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search class name, code, arm..."
            className="w-full rounded-sm border border-transparent bg-surface-container py-2 pl-9 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        {/* Stage group */}
        <div className="gap-space-sm grid grid-cols-2 sm:flex">
          {stageChips.map((chip) => {
            const isActive = filters.stage === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => set("stage", chip.value)} // stage dimension
                className={[
                  "shrink-0 cursor-pointer whitespace-nowrap rounded-sm px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high",
                ].join(" ")}
              >
                {chip.label} ({chip.count})
              </button>
            );
          })}
        </div>

        {/* Track group */}
        <div className="gap-space-sm grid grid-cols-2 sm:flex">
          {trackChips.map((chip) => {
            const isActive = filters.track === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => set("track", chip.value)} // track dimension
                className={[
                  "shrink-0 cursor-pointer whitespace-nowrap rounded-sm px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high",
                ].join(" ")}
              >
                {chip.label} ({chip.count})
              </button>
            );
          })}
        </div>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_CLASS_FILTERS)}
            className="ml-auto cursor-pointer rounded-sm px-space-sm py-space-sm text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassFilter;
