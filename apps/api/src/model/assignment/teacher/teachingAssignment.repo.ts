import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import {
  ITeachingAssignment,
  ITeachingAssignmentCreate,
  ITeachingAssignmentUpdate,
  ITeachingAssignmentDetails,
  ITeachingAssignmentListQuery,
} from "./teachingAssignment.interface.js";
import { PrismaTx } from "@/types/general.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const classArmTeachingAssignmentInclude = {
  classLevel: {
    select: {
      id: true,
      name: true,
      subjects: {
        where: {
          subject: {
            isActive: true,
          },
        },
        select: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              teachers: {
                where: {
                  teacher: {
                    isActive: true,
                  },
                },
                select: {
                  teacher: {
                    select: {
                      id: true,
                      title: true,
                      firstName: true,
                      lastName: true,
                      staffCode: true,
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  teachingAssignments: {
    where: {
      isActive: true,
    },
    select: {
      id: true,
      subjectId: true,
      teacherId: true,
      periodsPerWeek: true,
      teacher: {
        select: {
          id: true,
          title: true,
          firstName: true,
          lastName: true,
          staffCode: true,
          isActive: true,
        },
      },
    },
  },
} satisfies Prisma.ClassArmInclude;

const assignmentDetailsInclude = {
  teacher: {
    select: {
      id: true,
      title: true,
      firstName: true,
      lastName: true,
      staffCode: true,
      isActive: true,
    },
  },
  subject: {
    select: { id: true, name: true, code: true },
  },
  classArm: {
    select: {
      id: true,
      name: true,
      classLevel: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.TeachingAssignmentInclude;

export type ClassArmTeachingAssignmentData = Prisma.ClassArmGetPayload<{
  include: typeof classArmTeachingAssignmentInclude;
}>;

export interface ITeachingAssignmentRepo {
  isValidCreateTarget(
    data: ITeachingAssignmentCreate,
    schoolId: string,
  ): Promise<boolean>;
  findByUniqueKey(
    data: ITeachingAssignmentCreate,
    excludeId?: string,
  ): Promise<ITeachingAssignment | null>;
  findById(id: string, schoolId: string): Promise<ITeachingAssignment | null>;
  list(
    schoolId: string,
    query: ITeachingAssignmentListQuery,
  ): Promise<ITeachingAssignmentDetails[]>;
  getByTeacher(
    schoolId: string,
    teacherId: string,
    sessionId?: string,
  ): Promise<ITeachingAssignmentDetails[]>;
  getClassArmTeachingAssignmentData(
    schoolId: string,
    classLevelId: string,
    classArmId: string,
    sessionId: string,
  ): Promise<ClassArmTeachingAssignmentData | null>;
  create(data: ITeachingAssignmentCreate): Promise<ITeachingAssignment>;
  reactivate(
    id: string,
    data: ITeachingAssignmentCreate,
  ): Promise<ITeachingAssignment>;
  unassign(id: string, schoolId: string): Promise<ITeachingAssignment | null>;
  update(
    id: string,
    schoolId: string,
    data: ITeachingAssignmentUpdate,
  ): Promise<ITeachingAssignment | null>;
  reassign(
    id: string,
    schoolId: string,
    data: ITeachingAssignmentUpdate,
  ): Promise<ITeachingAssignment | null>;
  getTeachingAssignmentBySession(
    sessionId: string,
  ): Promise<ITeachingAssignmentDetails[]>;
  transaction<T>(fn: (repo: ITeachingAssignmentRepo) => Promise<T>): Promise<T>;
}

export class TeachingAssignmentRepo implements ITeachingAssignmentRepo {
  constructor(private readonly db: PrismaTx = prisma) {}
  async create(data: ITeachingAssignmentCreate): Promise<ITeachingAssignment> {
    return this.db.teachingAssignment.create({
      data: {
        sessionId: data.sessionId,
        teacherId: data.teacherId,
        subjectId: data.subjectId,
        classArmId: data.classArmId,

        isActive: data.isActive,
        periodsPerWeek: data.periodsPerWeek,
        requiresDoublePeriod: data.requiresDoublePeriod,
        requiredRoomType: data.requiredRoomType,
        maxPeriodsPerDay: data.maxPeriodsPerDay,
      },
    });
  }
  async isValidCreateTarget(
    data: ITeachingAssignmentCreate,
    schoolId: string,
  ): Promise<boolean> {
    const [session, teacher, subject, classArm, teacherSubject] =
      await Promise.all([
        this.db.academicSession.findUnique({
          where: { id: data.sessionId },
          select: { schoolId: true },
        }),
        this.db.teacher.findUnique({
          where: { id: data.teacherId },
          select: { schoolId: true, isActive: true },
        }),
        this.db.subject.findUnique({
          where: { id: data.subjectId },
          select: { schoolId: true, isActive: true },
        }),
        this.db.classArm.findUnique({
          where: { id: data.classArmId },
          select: {
            isActive: true,
            classLevel: {
              select: {
                schoolId: true,
                subjects: {
                  where: { subjectId: data.subjectId },
                  select: { subjectId: true },
                },
              },
            },
          },
        }),
        this.db.teacherSubject.findUnique({
          where: {
            teacherId_subjectId: {
              teacherId: data.teacherId,
              subjectId: data.subjectId,
            },
          },
          select: { schoolId: true },
        }),
      ]);

    return Boolean(
      session &&
      teacher?.isActive &&
      subject?.isActive &&
      classArm?.isActive &&
      teacherSubject &&
      session.schoolId === schoolId &&
      session.schoolId === teacher.schoolId &&
      session.schoolId === subject.schoolId &&
      session.schoolId === classArm.classLevel.schoolId &&
      session.schoolId === teacherSubject.schoolId &&
      classArm.classLevel.subjects.length > 0,
    );
  }
  async findByUniqueKey(
    data: ITeachingAssignmentCreate,
    excludeId?: string,
  ): Promise<ITeachingAssignment | null> {
    return this.db.teachingAssignment.findFirst({
      where: {
        sessionId: data.sessionId,
        teacherId: data.teacherId,
        subjectId: data.subjectId,
        classArmId: data.classArmId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }
  async findById(
    id: string,
    schoolId: string,
  ): Promise<ITeachingAssignment | null> {
    return this.db.teachingAssignment.findFirst({
      where: { id, session: { schoolId } },
    });
  }
  async list(
    schoolId: string,
    query: ITeachingAssignmentListQuery,
  ): Promise<ITeachingAssignmentDetails[]> {
    return this.db.teachingAssignment.findMany({
      where: {
        session: { schoolId },
        ...(query.sessionId ? { sessionId: query.sessionId } : {}),
        ...(query.teacherId ? { teacherId: query.teacherId } : {}),
        ...(query.subjectId ? { subjectId: query.subjectId } : {}),
        ...(query.classArmId ? { classArmId: query.classArmId } : {}),
        isActive: query.isActive ?? true,
      },
      include: assignmentDetailsInclude,
      orderBy: [{ classArm: { name: "asc" } }, { subject: { name: "asc" } }],
    });
  }
  async getByTeacher(
    schoolId: string,
    teacherId: string,
    sessionId?: string,
  ): Promise<ITeachingAssignmentDetails[]> {
    return this.list(schoolId, {
      teacherId,
      ...(sessionId ? { sessionId } : {}),
    });
  }
  async reactivate(
    id: string,
    data: ITeachingAssignmentCreate,
  ): Promise<ITeachingAssignment> {
    return this.db.teachingAssignment.update({
      where: { id },
      data: {
        isActive: data.isActive ?? true,
        periodsPerWeek: data.periodsPerWeek,
        requiresDoublePeriod: data.requiresDoublePeriod,
        requiredRoomType: data.requiredRoomType,
        maxPeriodsPerDay: data.maxPeriodsPerDay,
      },
    });
  }
  async unassign(
    id: string,
    schoolId: string,
  ): Promise<ITeachingAssignment | null> {
    const result = await this.db.teachingAssignment.updateMany({
      where: {
        id,
        isActive: true,
        session: { schoolId },
      },
      data: { isActive: false },
    });
    if (result.count === 0) return null;
    return this.db.teachingAssignment.findUnique({ where: { id } });
  }
  async update(
    id: string,
    schoolId: string,
    data: ITeachingAssignmentUpdate,
  ): Promise<ITeachingAssignment | null> {
    const result = await this.db.teachingAssignment.updateMany({
      where: { id, session: { schoolId } },
      data,
    });
    if (result.count === 0) return null;
    return this.findById(id, schoolId);
  }
  async reassign(
    id: string,
    schoolId: string,
    data: ITeachingAssignmentUpdate,
  ): Promise<ITeachingAssignment | null> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.teachingAssignment.findFirst({
        where: { id, session: { schoolId } },
      });
      if (!current) return null;

      return tx.teachingAssignment.update({
        where: { id },
        data,
      });
    });
  }
  async getClassArmTeachingAssignmentData(
    schoolId: string,
    classLevelId: string,
    classArmId: string,
    sessionId: string,
  ): Promise<ClassArmTeachingAssignmentData | null> {
    return this.db.classArm.findFirst({
      where: {
        id: classArmId,
        classLevelId,
        classLevel: {
          schoolId,
        },
      },
      include: {
        classLevel: {
          select: {
            id: true,
            name: true,
            subjects: {
              where: {
                schoolId,
                subject: {
                  isActive: true,
                  schoolId,
                },
              },
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    teachers: {
                      where: {
                        schoolId,
                        teacher: {
                          schoolId,
                          isActive: true,
                        },
                      },
                      select: {
                        teacher: {
                          select: {
                            id: true,
                            title: true,
                            firstName: true,
                            lastName: true,
                            staffCode: true,
                            isActive: true
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        teachingAssignments: {
          where: {
            sessionId,
            isActive: true,
            session: {
              schoolId,
            },
            teacher: {
              schoolId,
            },
            subject: {
              schoolId,
            },
          },
          select: {
            id: true,
            subjectId: true,
            teacherId: true,
            periodsPerWeek: true,
            teacher: {
              select: {
                id: true,
                title: true,
                firstName: true,
                lastName: true,
                staffCode: true,
                isActive:true
              },
            },
          },
        },
      },
    });
  }
  async getTeachingAssignmentBySession(
    sessionId: string,
  ): Promise<ITeachingAssignmentDetails[]> {
    return this.db.teachingAssignment.findMany({
      where: { sessionId },
      include: assignmentDetailsInclude,
      orderBy: [{ classArm: { name: "asc" } }, { subject: { name: "asc" } }],
    });
  }
  async transaction<T>(
    fn: (repo: ITeachingAssignmentRepo) => Promise<T>,
  ): Promise<T> {
    return prisma.$transaction(async (tx: PrismaTx) => {
      const repo = new TeachingAssignmentRepo(tx);
      return fn(repo);
    });
  }
}

export const teachingAssignmentRepo = new TeachingAssignmentRepo();
