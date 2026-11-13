import { z } from "zod";

const armParams = z.object({
  classLevelId: z.string().uuid(),
  armId: z.string().uuid().optional(),
});

const armFields = z.object({
  name: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const classArmListReqSchema = z.object({
  params: armParams.pick({ classLevelId: true }),
  query: z.object({
    query: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["name", "createdAt"]).default("name"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const createClassArmReqSchema = z.object({
  params: armParams.pick({ classLevelId: true }),
  body: armFields,
});

export const classArmIdReqSchema = z.object({
  params: armParams.required({ armId: true }),
});

export const updateClassArmReqSchema = z.object({
  params: armParams.required({ armId: true }),
  body: armFields
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});
