import React from "react";
import type { ITeacher } from "../../interface/teacher.interface";
import {
  DEFAULT_TEACHER_FILTERS,
  Status,
  TEACHER_TITLE_LABELS,
  TEACHER_TITLES,
  type TeacherFilterState,
  type TeacherStatus,
} from "./TeacherTypes";
import { Search } from "lucide-react";
import { FilterSelect } from "../../utils/formHelper";

interface TeacherFilterProps {
  teachers: ITeacher[];
  filters: TeacherFilterState;
  onChange: (filters: TeacherFilterState) => void;
}

const hasActiveFilters = (filters: TeacherFilterState) =>
  filters.query.trim() !== "" ||
  filters.title !== "ALL" ||
  filters.status !== "ALL";

/** ITeacher.isActive is boolean; TeacherStatus is a string union. Bridge them. */
const statusOf = (teacher: ITeacher): TeacherStatus =>
  teacher.isActive ? "ACTIVE" : "INACTIVE";

const TeacherFilter = ({ teachers, filters, onChange }: TeacherFilterProps) => {
  const statusChips: {
    value: TeacherStatus | "ALL";
    label: string;
    count: number;
  }[] = [
    { value: "ALL", label: "All", count: teachers.length },
    ...Status.filter((status) =>
      teachers.some((t) => statusOf(t) === status),
    ).map((status) => ({
      value: status,
      label: status,
      count: teachers.filter((t) => statusOf(t) === status).length,
    })),
  ];

  // TEACHER_TITLE_LABELS is a Record<TeacherTitle, string>, not an array.
  // Iterate TEACHER_TITLES (which includes "ALL") and look up the label.
  const titleOptions = TEACHER_TITLES.map((title) => ({
    value: title,
    label: TEACHER_TITLE_LABELS[title],
  }));

  const set = <K extends keyof TeacherFilterState>(
    key: K,
    value: TeacherFilterState[K],
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
            placeholder="Search name, email, staff code…"
            className="w-full rounded-sm border border-transparent bg-surface-container py-2 pl-9 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        <div className="gap-space-sm grid grid-cols-2 sm:flex">
          {statusChips.map((chip) => {
            const isActive = filters.status === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => set("status", chip.value)}
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

        <div className="w-full sm:w-40">
          <FilterSelect
            label="Title"
            value={filters.title}
            onChange={(value) =>
              set("title", value as TeacherFilterState["title"])
            }
            options={titleOptions}
          />
        </div>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_TEACHER_FILTERS)}
            className="ml-auto cursor-pointer rounded-sm px-space-sm py-space-sm text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TeacherFilter;