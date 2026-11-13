import { z } from "zod";

const uuid = z.string().uuid();
const roomType = z.enum([
  "CLASSROOM",
  "COMPUTER_LAB",
  "SCIENCE_LAB",
  "HALL",
  "LIBRARY",
  "OTHER",
]);

export const createTeachingAssignmentReqSchema = z.object({
  body: z.object({
    sessionId: uuid,
    teacherId: uuid,
    subjectId: uuid,
    classArmId: uuid,
    periodsPerWeek: z.coerce.number().int().positive(),
    isActive: z.boolean().optional(),
    requiresDoublePeriod: z.boolean().optional(),
    requiredRoomType: roomType.optional(),
    maxPeriodsPerDay: z.coerce.number().int().positive().nullable().optional(),
  }),
});

export const teachingAssignmentIdReqSchema = z.object({
  params: z.object({ assignmentId: uuid }),
});

export const teachingAssignmentListReqSchema = z.object({
  query: z.object({
    sessionId: uuid.optional(),
    teacherId: uuid.optional(),
    subjectId: uuid.optional(),
    classArmId: uuid.optional(),
    isActive: z
      .preprocess(
        (value) =>
          value === "true" ? true : value === "false" ? false : value,
        z.boolean(),
      )
      .optional(),
  }),
});

export const teacherTeachingAssignmentsReqSchema = z.object({
  params: z.object({ teacherId: uuid }),
  query: z.object({ sessionId: uuid.optional() }),
});

export const updateTeachingAssignmentReqSchema = z.object({
  params: z.object({ assignmentId: uuid }),
  body: z
    .object({
      teacherId: uuid.optional(),
      periodsPerWeek: z.coerce.number().int().positive().optional(),
      isActive: z.boolean().optional(),
      requiresDoublePeriod: z.boolean().optional(),
      requiredRoomType: roomType.nullable().optional(),
      maxPeriodsPerDay: z.coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),
    })
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required",
    ),
});

export const classTeachingAssignmentsReqSchema = z.object({
  params: z.object({
    sessionId: uuid,
    classLevelId: uuid,
    classArmId: uuid,
  }),
});
