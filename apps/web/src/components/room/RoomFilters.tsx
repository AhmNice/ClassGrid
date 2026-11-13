import { useId } from "react";
import { ChevronDown, Search } from "lucide-react";
import type {
  CapacityBand,
  IRoom,
  RoomFilterState,
  RoomType,
} from "../../interface/room.interface";
import { ROOM_TYPE_LABELS, ROOM_TYPES } from "../../types/roomTypes";
import {
  DEFAULT_ROOM_FILTERS,
  hasActiveFilters,
} from "../../utils/room.filters";

interface RoomFilterProps {
  rooms: IRoom[];
  filters: RoomFilterState;
  onChange: (filters: RoomFilterState) => void;
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}
const CAPACITY_OPTIONS: { value: CapacityBand; label: string }[] = [
  { value: "ANY", label: "Any capacity" },
  { value: "UP_TO_30", label: "Up to 30 seats" },
  { value: "31_TO_50", label: "31 to 50 seats" },
  { value: "OVER_50", label: "Over 50 seats" },
  { value: "NONE", label: "No fixed capacity" },
];
function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps<T>) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full cursor-pointer appearance-none rounded-sm border border-transparent bg-surface-container py-2 pl-3 pr-8 font-mono text-xs font-medium text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
      </div>
    </div>
  );
}

const RoomFilters = ({ rooms = [], filters, onChange }: RoomFilterProps) => {
  const chips: { value: RoomType | "ALL"; label: string; count: number }[] = [
    { value: "ALL", label: "All", count: rooms.length },
    ...ROOM_TYPES.filter((type) =>
      rooms.some((room) => room.type === type),
    ).map((type) => ({
      value: type,
      label: ROOM_TYPE_LABELS[type],
      count: rooms.filter((room) => room.type === type).length,
    })),
  ];
  const set = <K extends keyof RoomFilterState>(
    key: K,
    value: RoomFilterState[K],
  ) => onChange({ ...filters, [key]: value });
  return (
    <div className="space-y-4 rounded-md border border-outline-variant/40 bg-surface p-4 overflow-x-auto">
      {/* ROW 1: Search & Chips */}
      <div className="gap-space-sm flex flex-wrap items-center">
        {/* Search Input */}
        <div className="flex gap-space-sm flex-wrap items-center sm:flex-nowrap">
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
              onChange={(value) => set("query", value.target.value)}
              placeholder="Search room name, code, wing..."
              className="w-full rounded-sm border border-transparent bg-surface-container py-2 pl-9 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
            />
          </div>

          {/* Chips */}
          <div className="gap-space-sm grid grid-cols-2 sm:flex">
            {chips.map((chip) => {
              const isActive = filters.type === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => set("type", chip.value)}
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
        </div>

        <FilterSelect
          label="Student Capacity"
          value={filters.capacity}
          options={CAPACITY_OPTIONS}
          onChange={(value) => set("capacity", value)}
        />
        <div className="flex items-end sm:justify-end">
          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={() => onChange(DEFAULT_ROOM_FILTERS)}
              className="cursor-pointer rounded-sm px-space-sm py-space-sm text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomFilters;
