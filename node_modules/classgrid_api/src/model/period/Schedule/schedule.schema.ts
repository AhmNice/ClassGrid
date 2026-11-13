import { z } from "zod";

const dayOfWeek = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const scheduleKind = z.enum(["WEEKDAY_SCHEDULE", "FRIDAY_SCHEDULE"]);

const scheduleIdParams = z.object({
  scheduleId: z.string().uuid(),
});

const applicableDays = z
  .array(dayOfWeek)
  .min(1, "At least one applicable day is required")
  .refine(
    (days) => new Set(days).size === days.length,
    "Applicable days must be unique",
  );

export const createScheduleReqSchema = z.object({
  body: z.object({
    name: scheduleKind,
    applicableDays,
    isActive: z.boolean().optional(),
  }),
});

export const scheduleIdReqSchema = z.object({ params: scheduleIdParams });

export const updateScheduleReqSchema = z.object({
  params: scheduleIdParams,
  body: z
    .object({
      name: scheduleKind.optional(),
      applicableDays: applicableDays.optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});
