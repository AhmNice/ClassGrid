const DAY_MS = 86_400_000;

export type TermStatus = "active" | "upcoming" | "completed";

/** Accept either a Date or an ISO string and return a valid Date, or null. */
export const toDate = (
  value: Date | string | null | undefined
): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/** Midnight at the start of the given day, so comparisons ignore the time. */
export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatDate = (
  date: Date | string | null | undefined
): string => {
  const d = toDate(date);
  return d
    ? d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";
};

export const formatRange = (
  start: Date | string | null | undefined,
  end: Date | string | null | undefined
): string => {
  const s = toDate(start);
  const e = toDate(end);
  return s && e ? `${formatDate(s)} – ${formatDate(e)}` : "Not set";
};

/** Whole days from a to b (rounded, so daylight-saving shifts don't matter). */
export const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / DAY_MS);

/** Weeks covered by start..end inclusive, rounded up. */
export const weeksBetween = (start: Date, end: Date): number =>
  Math.max(0, Math.ceil((daysBetween(start, end) + 1) / 7));

/** Monday to Friday days in start..end inclusive. */
export const countWeekdays = (start: Date, end: Date): number => {
  let count = 0;
  const cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor <= last) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
};

/**
 * Parse a date-only string ("YYYY-MM-DD") as LOCAL midnight.
 * Never pass a UTC ISO string ("...T00:00:00.000Z") here — use toDate + startOfDay
 * for that, so the calendar day isn't shifted by the timezone.
 */
const parseLocalDate = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const getTermStatus = (
  term: { startDate: Date; endDate: Date }, // "YYYY-MM-DD"
  today: Date
): TermStatus => {
  const now = startOfDay(today);
  const start = term.startDate;
  const end = term.endDate;

  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
};

/**
 * Which week of the term `today` falls in.
 * - Before the term: 1 (pre-term week)
 * - After the term: last week
 * - During: 1..N
 */
export const currentWeekOf = (
  term: { startDate: Date; endDate: Date },
  today: Date
): number => {
  const now = startOfDay(today);
  const start = startOfDay(term.startDate);
  const end = startOfDay(term.endDate);

  if (now < start) return 1;
  if (now > end) return weeksBetween(start, end);
  return weeksBetween(start, now);
};

/**
 * Date <-> <input type="date"> helpers.
 *
 * IMPORTANT: these operate on the LOCAL calendar day. They are correct for
 * `Date` objects created locally (e.g. by `fromInputDate`, `startOfDay`) and
 * for plain "YYYY-MM-DD" strings. Do NOT feed them raw API values like
 * "2026-09-19T00:00:00.000Z" — convert those to a local Date first (or slice
 * the string) to avoid off-by-one days in negative-offset timezones.
 */
export const toInputDate = (
  date: Date | string | null | undefined
): string => {
  // Plain "YYYY-MM-DD" strings pass through unchanged.
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = toDate(date);
  if (!d) return "";
  const month = String(d.getMonth() + 1).padStart(2, "0"); // local
  const day = String(d.getDate()).padStart(2, "0"); // local
  return `${d.getFullYear()}-${month}-${day}`; // local
};

export const fromInputDate = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Convert an API date-only value ("...T00:00:00.000Z" or "YYYY-MM-DD") to a local Date. */
export const fromApiDate = (
  value: string | null | undefined
): Date | null => {
  if (!value) return null;
  // Plain "YYYY-MM-DD" → local midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseLocalDate(value);
  // UTC ISO from @db.Date → take the date part, then build a local Date
  const d = toDate(value);
  if (!d) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};
export const toApiDate = (
  date: Date | null | undefined,
): string | null | undefined => {
  if (date === undefined) return undefined;
  if (date === null) return null;
  return `${toInputDate(date)}T00:00:00.000Z`;
};
export const formatDateTime = (date: Date | null | undefined) => {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};