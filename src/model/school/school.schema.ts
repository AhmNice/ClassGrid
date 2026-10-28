import { z } from "zod";

const schoolIdParams = z.object({
  schoolId: z.string().uuid(),
});

export const dayOfWeek = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const schoolFields = z.object({
  name: z.string().trim().min(1),
  logoUrl: z.string().trim().url().optional(),
  address: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  workingDays: z
    .array(dayOfWeek)
    .min(1, "At least one working day is required")
    .max(7)
    .refine(
      (days) => new Set(days).size === days.length,
      "Working days must be unique",
    )
    .optional(),
});

export const createSchoolReqSchema = z.object({
  body: schoolFields,
});

export const updateSchoolReqSchema = z.object({
  params: schoolIdParams,
  body: schoolFields
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});

export const schoolListReqSchema = z.object({});

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
