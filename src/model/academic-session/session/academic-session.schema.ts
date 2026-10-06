import { z } from "zod";

const academicSessionFields = z.object({
  name: z.string().trim().min(1),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  isCurrent: z.boolean().default(false),
});

export const createAcademicSessionReqSchema = z.object({
  body: academicSessionFields.extend({
    schoolId: z.string().uuid(),
  }),
});

export const updateAcademicSessionReqSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
  }),
  body: academicSessionFields
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});

export const academicSessionIdReqSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});
