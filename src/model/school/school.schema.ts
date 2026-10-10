import { z } from "zod";

const schoolIdParams = z.object({
  schoolId: z.string().uuid(),
});

const dayOfWeek = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const schoolWorkingDaysReqSchema = z.object({
  params: schoolIdParams,
  body: z.object({
    workingDays: z
      .array(dayOfWeek)
      .min(1, "At least one working day is required")
      .max(7)
      .refine(
        (days) => new Set(days).size === days.length,
        "Working days must be unique",
      ),
  }),
});

export const schoolIdReqSchema = z.object({
  params: schoolIdParams,
});
