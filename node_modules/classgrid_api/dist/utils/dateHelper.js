import dayjs from "dayjs";
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
const toDay = (value) => {
    const day = dayjs.utc(value).startOf("day");
    if (!day.isValid()) {
        throw new Error(`Invalid date: ${String(value)}`);
    }
    return day;
};
/** Today's calendar day in the school's timezone, as midnight UTC. */
export function getSchoolToday() {
    return dayjs.utc(dayjs().tz(SCHOOL_TIMEZONE).format("YYYY-MM-DD"));
}
/** Drops any time part: 2026-09-14T23:00Z -> 2026-09-14T00:00Z. */
export function toUtcDay(value) {
    return toDay(value).toDate();
}
/**
 * Turns "YYYY-MM-DD" into a Date at midnight UTC, or null if it isn't a real
 * date. Use it where request bodies are validated.
 */
export function parseDateOnly(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return null;
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()))
        return null;
    return date.toISOString().slice(0, 10) === value ? date : null;
}
// Both ends count, so Mon 15 Sept to Mon 22 Sept is 8 days, which is 2 weeks.
const countWeeks = (start, end) => Math.ceil((end.diff(start, "day") + 1) / 7);
export function getTotalSchoolWeeks(resumptionDate, closingDate) {
    const start = toDay(resumptionDate);
    const end = toDay(closingDate);
    if (end.isBefore(start)) {
        throw new Error("Closing date cannot be before resumption date");
    }
    return countWeeks(start, end);
}
/** Which week of the term it is, or null before it starts / after it ends. */
export function getCurrentSchoolWeek({ resumptionDate, totalWeeks, today, }) {
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
export function getTermProgress(resumptionDate, closingDate, today) {
    const totalWeeks = getTotalSchoolWeeks(resumptionDate, closingDate);
    const week = getCurrentSchoolWeek({ resumptionDate, totalWeeks, today });
    if (week !== null)
        return { totalWeeks, currentWeek: week };
    const now = today ? toDay(today) : getSchoolToday();
    const hasStarted = !now.isBefore(toDay(resumptionDate));
    return { totalWeeks, currentWeek: hasStarted ? totalWeeks : 0 };
}
export function formatSchoolDate(date) {
    return toDay(date)
        .format("MMM D, YYYY")
        .replace(/^Sep\b/, "Sept");
}
export function formatSchoolDateRange(resumptionDate, closingDate) {
    return `${formatSchoolDate(resumptionDate)} – ${formatSchoolDate(closingDate)}`;
}
