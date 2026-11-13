import type { IPeriod } from "../interface/period.interface";

/** "08:40" -> 520 (minutes since midnight). */
export const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const durationOf = (period: Pick<IPeriod, "startTime" | "endTime">) =>
  Math.max(0, toMinutes(period.endTime) - toMinutes(period.startTime));

/** 40 -> "40m", 70 -> "1h 10m", 120 -> "2h". */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};

/** Earliest first. Two periods starting together fall back to their sequence. */
export const sortPeriods = (periods: IPeriod[]): IPeriod[] =>
  [...periods].sort(
    (a, b) =>
      toMinutes(a.startTime) - toMinutes(b.startTime) || a.sequence - b.sequence,
  );

/**
 * The API has many kinds of period. For display they fall into three groups:
 * lessons, breaks (recess, lunch) and everything else (clubs, assembly…).
 */
export type PeriodGroup = "LESSON" | "BREAK" | "OTHER";

export const groupOf = (kind: string): PeriodGroup => {
  if (kind === "LESSON") return "LESSON";
  if (/BREAK|RECESS|LUNCH/i.test(kind)) return "BREAK";
  return "OTHER";
};

/** "Period 1" -> "P1". Other names are shown as they are. */
export const shortLabel = (period: Pick<IPeriod, "name" | "kind">): string => {
  const match = /^period\s*(\d+)$/i.exec(period.name.trim());
  return groupOf(period.kind) === "LESSON" && match ? `P${match[1]}` : period.name;
};

/* --------------------------------- schedules -------------------------------- */

export interface ScheduleOption {
  id: string;
  label: string;
  /** Worked out from the periods, for example "08:00–14:10 · 8 lessons". */
  hint: string;
}

/**
 * One option per schedule found in the periods. The schedule with the most
 * periods comes first, since that is usually the normal day. `names` maps a
 * schedule id to its display name; without one the option is "Schedule 1".
 */
export const buildScheduleOptions = (
  periods: IPeriod[],
  names: Record<string, string> = {},
): ScheduleOption[] => {
  const byId = new Map<string, IPeriod[]>();
  for (const period of periods) {
    const list = byId.get(period.periodScheduleScheduleId) ?? [];
    list.push(period);
    byId.set(period.periodScheduleScheduleId, list);
  }

  return [...byId.entries()]
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([id, list], index) => {
      // Describe the days people actually run, so ignore switched-off periods.
      const live = sortPeriods(list.some((p) => p.isActive) ? list.filter((p) => p.isActive) : list);
      const lessons = live.filter((p) => groupOf(p.kind) === "LESSON").length;

      return {
        id,
        label: names[id] ?? `Schedule ${index + 1}`,
        hint: `${live[0].startTime}–${live[live.length - 1].endTime} · ${lessons} ${lessons === 1 ? "lesson" : "lessons"}`,
      };
    });
};