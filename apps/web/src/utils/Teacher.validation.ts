import type { ITeacherCreate } from "../interface/teacher.interface";

export const TEACHER_TITLES = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Engr"];

// The same ceilings the add-teacher form uses.
export const MAX_PER_DAY = 15;
export const MAX_PER_WEEK = 75;

/** One row exactly as it appears in the file: every cell is text. */
export interface RawTeacherRow {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  staffCode: string;
  maxPeriodsPerDay: string;
  maxPeriodsPerWeek: string;
  maxConsecutivePeriods: string;
  isActive: string;
}

export interface RowCheck {
  /** The cleaned-up teacher, or null if the row has problems. */
  teacher: ITeacherCreate | null;
  /** Plain-language problems, one per line. */
  errors: string[];
}

const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^\+?[0-9\s()-]{7,20}$/;

/** "" means no limit. Otherwise a whole number from 1 up to `max`. */
const parseLimit = (
  value: string,
  max: number,
  label: string,
  errors: string[],
): number | null => {
  const text = value.trim();
  if (text === "") return null;

  const number = Number(text);
  if (!Number.isInteger(number) || number < 1) {
    errors.push(`${label} must be a whole number of 1 or more`);
    return null;
  }
  if (number > max) {
    errors.push(`${label} can’t be more than ${max}`);
    return null;
  }
  return number;
};

const YES = ["yes", "y", "true", "1", "active"];
const NO = ["no", "n", "false", "0", "inactive"];

export function validateTeacherRow(raw: RawTeacherRow): RowCheck {
  const errors: string[] = [];

  // "Mr." and "mr" both count as "Mr".
  const titleText = raw.title.trim().replace(/\.$/, "");
  const title = TEACHER_TITLES.find(
    (t) => t.toLowerCase() === titleText.toLowerCase(),
  );
  if (!title) {
    errors.push(
      titleText
        ? `Title “${raw.title.trim()}” isn’t one of ${TEACHER_TITLES.join(", ")}`
        : "Title is missing",
    );
  }

  const firstName = raw.firstName.trim();
  if (!firstName) errors.push("First name is missing");

  const lastName = raw.lastName.trim();
  if (!lastName) errors.push("Last name is missing");

  const email = raw.email.trim().toLowerCase();
  if (!email) errors.push("Email is missing");
  else if (!EMAIL.test(email)) errors.push("Email isn’t a valid address");

  const phone = raw.phone.trim();
  if (!phone) errors.push("Phone is missing");
  else if (!PHONE.test(phone)) errors.push("Phone isn’t a valid number");

  const staffCode = raw.staffCode.trim();
  if (!staffCode) errors.push("Staff code is missing");

  const maxPeriodsPerDay = parseLimit(
    raw.maxPeriodsPerDay,
    MAX_PER_DAY,
    "Periods per day",
    errors,
  );
  const maxPeriodsPerWeek = parseLimit(
    raw.maxPeriodsPerWeek,
    MAX_PER_WEEK,
    "Periods per week",
    errors,
  );
  const maxConsecutivePeriods = parseLimit(
    raw.maxConsecutivePeriods,
    MAX_PER_DAY,
    "Periods in a row",
    errors,
  );

  if (
    maxPeriodsPerDay !== null &&
    maxPeriodsPerWeek !== null &&
    maxPeriodsPerDay > maxPeriodsPerWeek
  ) {
    errors.push("Periods per day is higher than periods per week");
  }
  if (
    maxConsecutivePeriods !== null &&
    maxPeriodsPerDay !== null &&
    maxConsecutivePeriods > maxPeriodsPerDay
  ) {
    errors.push("Periods in a row is higher than periods per day");
  }

  // Blank means active, like the form's default.
  const activeText = raw.isActive.trim().toLowerCase();
  let isActive = true;
  if (activeText !== "") {
    if (YES.includes(activeText)) isActive = true;
    else if (NO.includes(activeText)) isActive = false;
    else errors.push("Active must be Yes or No");
  }

  if (errors.length > 0) return { teacher: null, errors };

  return {
    teacher: {
      title: title!,
      firstName,
      lastName,
      email,
      phone,
      staffCode,
      maxPeriodsPerDay,
      maxPeriodsPerWeek,
      maxConsecutivePeriods,
      isActive,
    },
    errors,
  };
}