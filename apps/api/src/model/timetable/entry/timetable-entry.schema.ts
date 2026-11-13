import { z } from "zod";

export const timetableEntryTimetableParams = z.object({
  timetableId: z.string().uuid(),
});

export const timetableEntryClassParams = timetableEntryTimetableParams.extend({
  classArmId: z.string().uuid(),
});

export const timetableEntryTeacherParams = timetableEntryTimetableParams.extend(
  {
    teacherId: z.string().uuid(),
  },
);

export const timetableEntryRoomParams = timetableEntryTimetableParams.extend({
  roomId: z.string().uuid(),
});

export const timetableEntryTimetableReqSchema = z.object({
  params: timetableEntryTimetableParams,
});

export const timetableEntryClassReqSchema = z.object({
  params: timetableEntryClassParams,
});

export const timetableEntryTeacherReqSchema = z.object({
  params: timetableEntryTeacherParams,
});

export const timetableEntryRoomReqSchema = z.object({
  params: timetableEntryRoomParams,
});

const timetableEntryIdParams = z.object({
  entryId: z.string().uuid(),
});

const dayOfWeek = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const timetableEntryFields = z.object({
  dayOfWeek,
  periodId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  teacherId: z.string().uuid(),
  classArmId: z.string().uuid(),
  roomId: z.string().uuid().nullable().optional(),
  isLocked: z.boolean().default(false),
  note: z.string().nullable().optional(),
});

export const createTimetableEntryReqSchema = z.object({
  params: timetableEntryTimetableParams,
  body: timetableEntryFields,
});

export const updateTimetableEntryReqSchema = z.object({
  params: timetableEntryIdParams,
  body: timetableEntryFields
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field is required",
    }),
});

export const timetableEntryIdReqSchema = z.object({
  params: timetableEntryIdParams,
});

export const assignTimetableEntryRoomReqSchema = z.object({
  params: timetableEntryIdParams,
  body: z.object({
    roomId: z.string().uuid(),
  }),
});
