import { z } from "zod";

const periodIdParams = z.object({
  periodId: z.string().uuid(),
});

const periodKind = z.enum(["LESSON", "BREAK"]);
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

const listQuery = z.object({
  schoolId: z.string().uuid(),
  query: z.string().trim().optional(),
  kind: periodKind.optional(),
  isActive: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["name", "kind", "sequence", "startTime", "createdAt"])
    .default("sequence"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const periodFields = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1),
  kind: periodKind.default("LESSON"),
  sequence: z.coerce.number().int().positive(),
  startTime: time,
  endTime: time,
  isActive: z.boolean().optional(),
});

const validateTimeRange = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      "startTime" in value &&
      "endTime" in value &&
      value.startTime < value.endTime,
    "Start time must be before end time",
  );

export const periodListReqSchema = z.object({ query: listQuery });
export const createPeriodReqSchema = z.object({
  body: validateTimeRange(periodFields),
});
export const periodIdReqSchema = z.object({ params: periodIdParams });
export const reorderPeriodsReqSchema = z.object({
  body: z.object({
    schoolId: z.string().uuid(),
    periodIds: z.array(z.string().uuid()).min(1),
  }),
});
export const updatePeriodReqSchema = z.object({
  params: periodIdParams,
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      kind: periodKind.optional(),
      sequence: z.coerce.number().int().positive().optional(),
      startTime: time.optional(),
      endTime: time.optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    )
    .refine(
      (body) =>
        body.startTime === undefined ||
        body.endTime === undefined ||
        body.startTime < body.endTime,
      "Start time must be before end time",
    ),
});
