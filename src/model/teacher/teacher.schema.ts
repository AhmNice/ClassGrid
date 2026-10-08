import { z } from "zod";

const teacherIdParams = z.object({
  teacherId: z.string().uuid(),
});

const paginationQuery = z.object({
  query: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["firstName", "lastName", "email", "staffCode", "createdAt"])
    .default("lastName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const teacherFields = z.object({
  schoolId: z.string().uuid(),
  title: z.string().trim().min(1).nullable().optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email().nullable().optional(),
  phone: z.string().trim().min(1).nullable().optional(),
  staffCode: z.string().trim().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const teacherListReqSchema = z.object({
  query: paginationQuery,
});

export const createTeacherReqSchema = z.object({
  body: teacherFields,
});

export const teacherIdReqSchema = z.object({
  params: teacherIdParams,
});

export const updateTeacherReqSchema = z.object({
  params: teacherIdParams,
  body: teacherFields
    .omit({ schoolId: true })
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});
