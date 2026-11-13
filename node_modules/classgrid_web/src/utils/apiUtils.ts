type DateOnlyNormalized<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: Date | Extract<T[P], null | undefined>;
};

function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function normalizeDateOnlyFields<T extends object, K extends keyof T>(
  data: T,
  fields: readonly K[],
): DateOnlyNormalized<T, K> {
  const result = { ...data } as T;

  for (const field of fields) {
    const value = data[field];

    // Preserve null and undefined values.
    if (value == null) continue;

    if (typeof value !== "string") {
      throw new TypeError(
        `Expected a date string for field "${String(field)}"`,
      );
    }

    // Accept either YYYY-MM-DD or an ISO timestamp representation.
    const dateOnly = value.slice(0, 10);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ||
      !(
        value === dateOnly ||
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)
      ) ||
      !isValidDateOnly(dateOnly)
    ) {
      throw new RangeError(
        `Invalid date-only value for field "${String(field)}": ${value}`,
      );
    }

    const [y, m, d] = dateOnly.split("-").map(Number);
    (result as Record<string, unknown>)[String(field)] = new Date(y, m - 1, d);
  }

  return result as DateOnlyNormalized<T, K>;
}

export function normalizeDateOnlyArray<T extends object, K extends keyof T>(
  items: readonly T[],
  fields: readonly K[],
): DateOnlyNormalized<T, K>[] {
  return items.map((item) => normalizeDateOnlyFields(item, fields));
}
