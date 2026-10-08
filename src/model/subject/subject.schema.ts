import { z } from "zod";

const subjectIdParams = z.object({
  subjectId: z.string().uuid(),
});

const listQuery = z.object({
  schoolId: z.string().uuid(),
  query: z.string().trim().optional(),
  isActive: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "code", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const subjectFields = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1),
  code: z.string().trim().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  defaultPeriodsPerWeek: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  defaultMaxPeriodsPerDay: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  defaultMaxConsecutive: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  defaultAllowConsecutive: z.boolean().optional(),
});

const schedulingRequirements = z.object({
  defaultPeriodsPerWeek: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  defaultMaxPeriodsPerDay: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  defaultMaxConsecutive: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  defaultAllowConsecutive: z.boolean().optional(),
});

export const subjectListReqSchema = z.object({ query: listQuery });
export const createSubjectReqSchema = z.object({ body: subjectFields });
export const subjectIdReqSchema = z.object({ params: subjectIdParams });
export const updateSubjectReqSchema = z.object({
  params: subjectIdParams,
  body: subjectFields
    .omit({ schoolId: true })
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});

export const updateSubjectSchedulingRequirementsReqSchema = z.object({
  params: subjectIdParams,
  body: schedulingRequirements.refine(
    (body) => Object.keys(body).length > 0,
    "At least one scheduling requirement is required",
  ),
});
