import { z } from "zod";

const params = z.object({
  teacherId: z.string().uuid(),
  availabilityId: z.string().uuid().optional(),
});

const fields = z.object({
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  periodId: z.string().uuid(),
  status: z.enum(["UNAVAILABLE", "PREFERRED"]),
  reason: z.string().nullable().optional(),
});

export const availabilityListSchema = z.object({
  params: params.pick({ teacherId: true }),
});

export const availabilityCreateSchema = z.object({
  params: params.pick({ teacherId: true }),
  body: fields,
});

export const availabilityIdSchema = z.object({
  params: params.required({ availabilityId: true }),
});

export const availabilityUpdateSchema = z.object({
  params: params.required({ availabilityId: true }),
  body: fields
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});
