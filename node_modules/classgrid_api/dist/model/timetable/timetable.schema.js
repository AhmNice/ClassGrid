import { z } from "zod";
const timetableIdParams = z.object({
    timetableId: z.string().uuid(),
});
const timetableFields = z.object({
    termId: z.string().uuid(),
    name: z.string().trim().min(1),
    version: z.coerce.number().int().positive(),
    basedOnId: z.string().uuid().nullable().optional(),
});
export const createTimetableReqSchema = z.object({
    body: timetableFields,
});
export const timetableIdReqSchema = z.object({
    params: timetableIdParams,
});
export const updateTimetableReqSchema = z.object({
    params: timetableIdParams,
    body: z.object({
        name: z.string().trim().min(1),
    }),
});
export const duplicateTimetableReqSchema = z.object({
    params: timetableIdParams,
    body: z.object({
        name: z.string().trim().min(1),
    }),
});
export const timetableListReqSchema = z.object({
    query: z
        .object({
        sessionId: z.string().uuid().optional(),
        termId: z.string().uuid().optional(),
    })
        .refine((query) => Boolean(query.sessionId || query.termId), "Either sessionId or termId is required"),
});
