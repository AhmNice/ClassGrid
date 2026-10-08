import { z } from "zod";

const classLevelParams = z.object({
  classLevelId: z.string().uuid(),
});

const paginationQuery = z.object({
  query: z.string().trim().optional(),
  isActive: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional(),
  ),
  stage: z.enum(["JSS", "SS"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "rank", "createdAt"]).default("rank"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const classLevelFields = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1),
  rank: z.coerce.number().int().positive(),
  stage: z.enum(["JSS", "SS"]),
  isActive: z.boolean().optional(),
});

export const classLevelListReqSchema = z.object({
  params: z.object({ schoolId: z.string().uuid() }),
  query: paginationQuery,
});

export const createClassLevelReqSchema = z.object({
  body: classLevelFields,
});

export const classLevelIdReqSchema = z.object({
  params: classLevelParams,
});

export const updateClassLevelReqSchema = z.object({
  params: classLevelParams,
  body: classLevelFields
    .omit({ schoolId: true, stage: true })
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});
