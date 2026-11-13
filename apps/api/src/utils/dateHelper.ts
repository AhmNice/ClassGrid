import dayjs, { type Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Dates in this app are calendar days (@db.Date). Prisma returns them as
 * midnight UTC, so every helper below works in UTC. Using the server's local
 * timezone would shift a day on any server that isn't in UTC+0.
 */

/** The timezone the school lives in. Only used to decide what "today" is. */
export const SCHOOL_TIMEZONE = process.env.SCHOOL_TIMEZONE ?? "Africa/Lagos";

export type DateInput = Date | string;

const toDay = (value: DateInput): Dayjs => {
  const day = dayjs.utc(value).startOf("day");
  if (!day.isValid()) {
    throw new Error(`Invalid date: ${String(value)}`);
  }
  return day;
};

/** Today's calendar day in the school's timezone, as midnight UTC. */
export function getSchoolToday(): Dayjs {
  return dayjs.utc(dayjs().tz(SCHOOL_TIMEZONE).format("YYYY-MM-DD"));
}

/** Drops any time part: 2026-09-14T23:00Z -> 2026-09-14T00:00Z. */
export function toUtcDay(value: Date): Date {
  return toDay(value).toDate();
}

/**
 * Turns "YYYY-MM-DD" into a Date at midnight UTC, or null if it isn't a real
 * date. Use it where request bodies are validated.
 */
export function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

// Both ends count, so Mon 15 Sept to Mon 22 Sept is 8 days, which is 2 weeks.
const countWeeks = (start: Dayjs, end: Dayjs) =>
  Math.ceil((end.diff(start, "day") + 1) / 7);

export function getTotalSchoolWeeks(
  resumptionDate: DateInput,
  closingDate: DateInput,
): number {
  const start = toDay(resumptionDate);
  const end = toDay(closingDate);

  if (end.isBefore(start)) {
    throw new Error("Closing date cannot be before resumption date");
  }

  return countWeeks(start, end);
}

interface SchoolWeekOptions {
  resumptionDate: DateInput;
  totalWeeks: number;
  /** Defaults to today in the school's timezone. Pass one in for tests. */
  today?: DateInput;
}

/** Which week of the term it is, or null before it starts / after it ends. */
export function getCurrentSchoolWeek({
  resumptionDate,
  totalWeeks,
  today,
}: SchoolWeekOptions): number | null {
  const start = toDay(resumptionDate);
  const now = today ? toDay(today) : getSchoolToday();

  if (now.isBefore(start)) {
    return null;
  }

  const week = Math.floor(now.diff(start, "day") / 7) + 1;

  return week <= totalWeeks ? week : null;
}

/**
 * Week position for a progress display: 0 before the term starts, the total
 * once it has ended, and the real week in between.
 */
export function getTermProgress(
  resumptionDate: DateInput,
  closingDate: DateInput,
  today?: DateInput,
): { totalWeeks: number; currentWeek: number } {
  const totalWeeks = getTotalSchoolWeeks(resumptionDate, closingDate);
  const week = getCurrentSchoolWeek({ resumptionDate, totalWeeks, today });

  if (week !== null) return { totalWeeks, currentWeek: week };

  const now = today ? toDay(today) : getSchoolToday();
  const hasStarted = !now.isBefore(toDay(resumptionDate));
  return { totalWeeks, currentWeek: hasStarted ? totalWeeks : 0 };
}

export function formatSchoolDate(date: DateInput): string {
  return toDay(date)
    .format("MMM D, YYYY")
    .replace(/^Sep\b/, "Sept");
}

export function formatSchoolDateRange(
  resumptionDate: DateInput,
  closingDate: DateInput,
): string {
  return `${formatSchoolDate(resumptionDate)} – ${formatSchoolDate(closingDate)}`;
}
