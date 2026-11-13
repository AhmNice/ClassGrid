import { z } from "zod";
const termParams = z.object({
    sessionId: z.string().uuid(),
    termId: z.string().uuid().optional(),
});
export const termListReqSchema = z.object({
    params: termParams.pick({ sessionId: true }),
});
const termFields = z.object({
    name: z.enum(["FIRST", "SECOND", "THIRD"]),
    startDate: z.coerce.date().nullable(),
    endDate: z.coerce.date().nullable(),
    midTermStartDate: z.coerce.date().nullable().optional(),
    midTermEndDate: z.coerce.date().nullable().optional(),
    examStartDate: z.coerce.date().nullable().optional(),
    examEndDate: z.coerce.date().nullable().optional(),
    isCurrent: z.boolean().optional(),
});
export const createTermReqSchema = z.object({
    params: termParams.omit({ termId: true }),
    body: termFields,
});
export const updateTermReqSchema = z.object({
    params: termParams.required({ termId: true }),
    body: termFields
        .partial()
        .refine((body) => Object.keys(body).length > 0, "At least one field is required"),
});
export const termIdReqSchema = z.object({
    params: termParams.required({ termId: true }),
});
