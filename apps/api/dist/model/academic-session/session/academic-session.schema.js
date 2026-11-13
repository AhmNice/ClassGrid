import { z } from "zod";
import { parseDateOnly } from "@/utils/dateHelper.js";
/**
 * Dates are calendar days sent as "YYYY-MM-DD". They are parsed as midnight
 * UTC, which is exactly what a @db.Date column stores. A full ISO timestamp is
 * rejected on purpose: "2026-09-14T23:00:00Z" is how a Lagos midnight arrives,
 * and reading it as a UTC day would save the wrong date.
 */
const dateOnly = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
    .transform((value, ctx) => {
    const date = parseDateOnly(value);
    if (!date) {
        ctx.addIssue({ code: "custom", message: "Enter a valid date" });
        return z.NEVER;
    }
    return date;
});
const sessionFields = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Enter a session name")
        .max(100, "Session name is too long"),
    startDate: dateOnly.nullable(),
    endDate: dateOnly.nullable(),
});
export const createAcademicSessionReqSchema = z.object({
    // schoolId is not accepted here. The server takes it from the logged-in user.
    body: sessionFields.extend({
        isCurrent: z.boolean().default(false),
    }),
});
export const updateAcademicSessionReqSchema = z.object({
    params: z.object({
        sessionId: z.string().uuid(),
    }),
    body: sessionFields
        .extend({ isCurrent: z.boolean() })
        .partial()
        .refine((body) => Object.keys(body).length > 0, "At least one field is required"),
});
export const academicSessionIdReqSchema = z.object({
    params: z.object({
        sessionId: z.string().uuid(),
    }),
});
