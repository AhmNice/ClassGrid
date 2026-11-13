import { prisma } from "@/lib/prisma.js";
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
                },
            },
        },
    },
};
const assignmentDetailsInclude = {
    teacher: {
        select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            staffCode: true,
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
};
export class TeachingAssignmentRepo {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async create(data) {
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
    async isValidCreateTarget(data, schoolId) {
        const [session, teacher, subject, classArm, teacherSubject] = await Promise.all([
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
        return Boolean(session &&
            teacher?.isActive &&
            subject?.isActive &&
            classArm?.isActive &&
            teacherSubject &&
            session.schoolId === schoolId &&
            session.schoolId === teacher.schoolId &&
            session.schoolId === subject.schoolId &&
            session.schoolId === classArm.classLevel.schoolId &&
            session.schoolId === teacherSubject.schoolId &&
            classArm.classLevel.subjects.length > 0);
    }
    async findByUniqueKey(data, excludeId) {
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
    async findById(id, schoolId) {
        return this.db.teachingAssignment.findFirst({
            where: { id, session: { schoolId } },
        });
    }
    async list(schoolId, query) {
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
    async getByTeacher(schoolId, teacherId, sessionId) {
        return this.list(schoolId, {
            teacherId,
            ...(sessionId ? { sessionId } : {}),
        });
    }
    async reactivate(id, data) {
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
    async unassign(id, schoolId) {
        const result = await this.db.teachingAssignment.updateMany({
            where: {
                id,
                isActive: true,
                session: { schoolId },
            },
            data: { isActive: false },
        });
        if (result.count === 0)
            return null;
        return this.db.teachingAssignment.findUnique({ where: { id } });
    }
    async update(id, schoolId, data) {
        const result = await this.db.teachingAssignment.updateMany({
            where: { id, session: { schoolId } },
            data,
        });
        if (result.count === 0)
            return null;
        return this.findById(id, schoolId);
    }
    async reassign(id, schoolId, data) {
        return prisma.$transaction(async (tx) => {
            const current = await tx.teachingAssignment.findFirst({
                where: { id, session: { schoolId } },
            });
            if (!current)
                return null;
            return tx.teachingAssignment.update({
                where: { id },
                data,
            });
        });
    }
    async getClassArmTeachingAssignmentData(schoolId, classLevelId, classArmId, sessionId) {
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
                            },
                        },
                    },
                },
            },
        });
    }
    async getTeachingAssignmentBySession(sessionId) {
        return this.db.teachingAssignment.findMany({
            where: { sessionId },
            include: assignmentDetailsInclude,
            orderBy: [{ classArm: { name: "asc" } }, { subject: { name: "asc" } }],
        });
    }
    async transaction(fn) {
        return prisma.$transaction(async (tx) => {
            const repo = new TeachingAssignmentRepo(tx);
            return fn(repo);
        });
    }
}
export const teachingAssignmentRepo = new TeachingAssignmentRepo();
