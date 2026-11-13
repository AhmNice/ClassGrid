import { z } from "zod";

const uuid = z.string().uuid();

export const createTeacherSubjectReqSchema = z.object({
  body: z.object({
    teacherId: uuid,
    subjectId: uuid,
  }),
});
export const bulkUpdateTeacherSubjectReqSchema = z.object({
  body: z.object({
    additions: z.array(z.object({
      teacherId: uuid,
      subjectId: uuid,
    })),
    removals: z.array(z.object({
      teacherId: uuid,
      subjectId: uuid,
    })),
  }),
});
export const teacherSubjectIdReqSchema = z.object({
  params: z.object({ teacherSubjectId: uuid }),
});

export const teacherSubjectListReqSchema = z.object({
  query: z.object({
    teacherId: uuid.optional(),
    subjectId: uuid.optional(),
  }),
});
