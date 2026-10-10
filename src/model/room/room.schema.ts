import { z } from "zod";

const roomIdParams = z.object({
  roomId: z.string().uuid(),
});

const roomType = z.enum([
  "CLASSROOM",
  "COMPUTER_LAB",
  "SCIENCE_LAB",
  "HALL",
  "LIBRARY",
  "OTHER",
]);

const listQuery = z.object({
  schoolId: z.string().uuid(),
  query: z.string().trim().optional(),
  isActive: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional(),
  ),
  type: roomType.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "type", "capacity", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const roomFields = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1),
  type: roomType.default("CLASSROOM"),
  capacity: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

const roomProperties = z
  .object({
    type: roomType.optional(),
    capacity: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine(
    (body) => Object.keys(body).length > 0,
    "At least one room property is required",
  );

export const roomListReqSchema = z.object({ query: listQuery });
export const createRoomReqSchema = z.object({ body: roomFields });
export const roomIdReqSchema = z.object({ params: roomIdParams });
export const roomTimetableReqSchema = z.object({
  params: roomIdParams,
  query: z
    .object({
      timetableId: z.string().uuid().optional(),
      termId: z.string().uuid().optional(),
    })
    .refine(
      (query) => Boolean(query.timetableId || query.termId),
      "Either timetableId or termId is required",
    ),
});
export const updateRoomReqSchema = z.object({
  params: roomIdParams,
  body: roomFields
    .omit({ schoolId: true })
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});

export const updateRoomPropertiesReqSchema = z.object({
  params: roomIdParams,
  body: roomProperties,
});
