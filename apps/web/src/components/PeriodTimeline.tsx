import type { IPeriod } from "../interface/period.interface";
import {
  durationOf,
  formatDuration,
  groupOf,
  shortLabel,
  sortPeriods,
  toMinutes,
  type PeriodGroup,
} from "../utils/PeriodUtils";

interface PeriodTimelineProps {
  periods: IPeriod[];
  /** Called when the user clicks a period. Omitted → read-only. */
  onEdit?: (period: IPeriod) => void;
}

const GROUP_STYLE: Record<PeriodGroup, { block: string; swatch: string; label: string }> = {
  LESSON: {
    block: "bg-primary text-on-primary",
    swatch: "bg-primary",
    label: "Instructional Block",
  },
  BREAK: {
    block: "bg-primary-accent text-on-primary",
    swatch: "bg-primary-accent",
    label: "Breaks & Recess",
  },
  OTHER: {
    block: "bg-info text-on-primary",
    swatch: "bg-info",
    label: "Extracurricular / Other",
  },
};

type Segment =
  | { type: "period"; period: IPeriod; minutes: number }
  | { type: "gap"; id: string; minutes: number };

/** Periods in time order, with a gap wherever the day has unscheduled time. */
const buildSegments = (periods: IPeriod[]): Segment[] => {
  const segments: Segment[] = [];

  sortPeriods(periods).forEach((period, index, all) => {
    const previous = all[index - 1];
    if (previous) {
      const gap = toMinutes(period.startTime) - toMinutes(previous.endTime);
      if (gap > 0) segments.push({ type: "gap", id: `gap-${period.id}`, minutes: gap });
    }
    segments.push({ type: "period", period, minutes: durationOf(period) });
  });

  return segments;
};

/** "40m" when every period in the group is the same length, else "30–45m". */
const durationRange = (periods: IPeriod[]) => {
  const lengths = periods.map(durationOf);
  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  return shortest === longest
    ? formatDuration(shortest)
    : `${formatDuration(shortest)}–${formatDuration(longest)}`;
};

const PeriodTimeline = ({ periods, onEdit }: PeriodTimelineProps) => {
  const segments = buildSegments(periods);

  // The legend only lists the kinds this schedule actually uses.
  const legend = (Object.keys(GROUP_STYLE) as PeriodGroup[])
    .map((group) => ({
      group,
      items: periods.filter((p) => groupOf(p.kind) === group),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <div className="space-y-space-sm bg-surface p-space-sm">
      <p className="text-sm text-on-surface-variant font-mono text-center">
        Timeline of the day's periods (300 total minutes)
      </p>
      {/* Blocks are as wide as the time they cover, so the day's shape shows. */}
      <ol
        aria-label="Bell schedule for the day"
        className="flex gap-space-xs overflow-x-auto rounded-sm bg-primary-container/60 p-space-sm"
      >
        {segments.map((segment) =>
          segment.type === "gap" ? (
            <li
              key={segment.id}
              aria-hidden="true"
              title={`${formatDuration(segment.minutes)} with no period`}
              style={{ flexGrow: segment.minutes, flexBasis: 0 }}
              className="min-w-3 rounded-sm bg-primary-container"
            />
          ) : (
            <li
              key={segment.period.id}
              style={{ flexGrow: segment.minutes, flexBasis: 0 }}
              title={`${segment.period.name} · ${segment.period.startTime}–${segment.period.endTime} (${formatDuration(segment.minutes)})`}
              onClick={onEdit ? () => onEdit(segment.period) : undefined}
              role={onEdit ? "button" : undefined}
              tabIndex={onEdit ? 0 : undefined}
              onKeyDown={
                onEdit
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onEdit(segment.period);
                      }
                    }
                  : undefined
              }
              className={[
                "min-w-14 rounded-sm px-space-xs py-space-sm text-center font-mono",
                GROUP_STYLE[groupOf(segment.period.kind)].block,
                segment.period.isActive ? "" : "opacity-50",
                onEdit
                  ? "cursor-pointer transition-transform motion-reduce:transition-none hover:-translate-y-0.5"
                  : "",
              ].join(" ")}
            >
              <span className="sr-only">
                {segment.period.name}, {segment.period.startTime} to{" "}
                {segment.period.endTime}
                {segment.period.isActive ? "" : ", inactive"}
              </span>
              <span aria-hidden="true" className="block text-xs font-bold">
                {shortLabel(segment.period)}
              </span>
              <span aria-hidden="true" className="block text-[10px] opacity-80">
                {segment.period.startTime}
              </span>
            </li>
          ),
        )}
      </ol>

      <ul className="flex flex-wrap gap-x-space-lg gap-y-space-xs font-mono text-xs text-on-surface-variant">
        {legend.map(({ group, items }) => (
          <li key={group} className="flex items-center gap-space-sm">
            <span
              aria-hidden="true"
              className={`h-3 w-3 rounded-sm ${GROUP_STYLE[group].swatch}`}
            />
            {GROUP_STYLE[group].label} ({durationRange(items)})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PeriodTimeline;