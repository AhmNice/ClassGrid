import { Search } from "lucide-react";
import type { ISubject } from "../../interface/subject.interface";
import { DEFAULT_SUBJECT_FILTERS, type SubjectFilterState } from "./Subject.type";
import type { ClassStage } from "../../interface/class.interface";
import {
  CLASS_STAGES,
  CLASS_TRACKS,
  type ClassTrack,
} from "../class/classTypes";

interface SubjectFilterProps {
  subjects: ISubject[];
  filters: SubjectFilterState;
  onChange: (filters: SubjectFilterState) => void;
}

/**
 * Whether the filter state diverges from the default. Each field is guarded
 * so a missing/undefined value (e.g. from persisted state) still behaves.
 */
const hasActiveFilters = (filters: SubjectFilterState): boolean =>
  (filters.query ?? "").trim() !== "" ||
  (filters.isActive ?? "ALL") !== "ALL" ||
  (filters.classTrack ?? "ALL") !== "ALL" ||
  (filters.classStage ?? "ALL") !== "ALL";

const SubjectFilter = ({
  subjects = [],
  filters,
  onChange,
}: SubjectFilterProps) => {
  // Only render stage/track groups when the data actually carries them.
  const supportsStages = subjects.some((s) => Array.isArray(s.classStage));
  const supportsTracks = subjects.some((s) => Array.isArray(s.Track));

  const stageChips: {
    value: ClassStage | "ALL";
    label: string;
    count: number;
  }[] = supportsStages
    ? [
        { value: "ALL", label: "All Tiers", count: subjects.length },
        ...CLASS_STAGES.filter((stage) =>
          subjects.some((sub) => sub.classStage?.includes(stage)),
        ).map((stage) => ({
          value: stage,
          label: stage,
          count: subjects.filter((sub) => sub.classStage?.includes(stage))
            .length,
        })),
      ]
    : [];

  const trackChips: {
    value: ClassTrack | "ALL";
    label: string;
    count: number;
  }[] = supportsTracks
    ? [
        { value: "ALL", label: "All Tracks", count: subjects.length },
        ...CLASS_TRACKS.filter((track) =>
          subjects.some((sub) => sub.Track?.includes(track)),
        ).map((track) => ({
          value: track,
          label: track,
          count: subjects.filter((sub) => sub.Track?.includes(track))
            .length,
        })),
      ]
    : [];

  const set = <K extends keyof SubjectFilterState>(
    key: K,
    value: SubjectFilterState[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const chipClass = (active: boolean) =>
    [
      "shrink-0 cursor-pointer whitespace-nowrap rounded-sm px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active
        ? "bg-primary text-on-primary"
        : "bg-surface-container text-on-surface hover:bg-surface-container-high",
    ].join(" ");

  return (
    <div className="space-y-3 overflow-x-auto rounded-md border border-outline-variant/40 bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative w-full shrink-0 sm:w-56">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            autoComplete="off"
            type="search"
            aria-label="Search subjects"
            value={filters.query ?? ""}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search subject name or code…"
            className="w-full rounded-sm border border-transparent bg-surface-container py-2 pl-9 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        {/* Status: built from data, so it always works */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "ALL", label: "All" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ] as const
          ).map((chip) => {
            const count =
              chip.value === "ALL"
                ? subjects.length
                : subjects.filter((s) =>
                    chip.value === "ACTIVE" ? s.isActive : !s.isActive,
                  ).length;
            const isActive = (filters.isActive ?? "ALL") === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => set("isActive", chip.value)}
                className={chipClass(isActive)}
              >
                {chip.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Stage group — only when the data supports it */}
        {stageChips.length > 0 && (
          <div
            role="group"
            aria-label="Filter by class stage"
            className="flex flex-wrap gap-2"
          >
            {stageChips.map((chip) => {
              const isActive = (filters.classStage ?? "ALL") === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => set("classStage", chip.value)}
                  className={chipClass(isActive)}
                >
                  {chip.label} ({chip.count})
                </button>
              );
            })}
          </div>
        )}

        {/* Track group — only when the data supports it */}
        {trackChips.length > 0 && (
          <div
            role="group"
            aria-label="Filter by class track"
            className="flex flex-wrap gap-2"
          >
            {trackChips.map((chip) => {
              const isActive = (filters.classTrack ?? "ALL") === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => set("classTrack", chip.value)}
                  className={chipClass(isActive)}
                >
                  {chip.label} ({chip.count})
                </button>
              );
            })}
          </div>
        )}

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_SUBJECT_FILTERS)}
            className="ml-auto cursor-pointer rounded-sm px-3 py-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SubjectFilter;