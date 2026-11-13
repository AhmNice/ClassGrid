import { prisma } from "@/lib/prisma.js";
const timetableEntrySelect = {
    id: true,
    timetableId: true,
    dayOfWeek: true,
    periodId: true,
    assignmentId: true,
    teacherId: true,
    classArmId: true,
    roomId: true,
    isLocked: true,
    note: true,
    period: {
        select: {
            id: true,
            name: true,
            sequence: true,
            startTime: true,
            endTime: true,
            kind: true,
        },
    },
    assignment: {
        select: {
            id: true,
            subject: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            teacher: {
                select: {
                    id: true,
                    title: true,
                    firstName: true,
                    lastName: true,
                },
            },
            classArm: {
                select: {
                    id: true,
                    name: true,
                    classLevel: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    },
    room: {
        select: {
            id: true,
            name: true,
            type: true,
        },
    },
};
export class TimetableEntryRepo {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async create(data) {
        return this.db.timetableEntry.create({
            data: {
                timetableId: data.timetableId,
                dayOfWeek: data.dayOfWeek,
                periodId: data.periodId,
                assignmentId: data.assignmentId,
                teacherId: data.teacherId,
                classArmId: data.classArmId,
                roomId: data.roomId || null,
                note: data.note ?? null,
            },
        });
    }
    async update(entryId, data) {
        return this.db.timetableEntry.update({
            where: { id: entryId },
            data: {
                ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
                ...(data.periodId !== undefined && { periodId: data.periodId }),
                ...(data.assignmentId !== undefined && {
                    assignmentId: data.assignmentId,
                }),
                ...(data.roomId !== undefined && { roomId: data.roomId || null }),
                ...(data.note !== undefined && { note: data.note ?? null }),
            },
        });
    }
    async delete(entryId) {
        return this.db.timetableEntry.delete({ where: { id: entryId } });
    }
    async findById(entryId) {
        return this.db.timetableEntry.findUnique({ where: { id: entryId } });
    }
    async getWeeklyEntries(timetableId) {
        return this.db.timetableEntry.findMany({
            where: { timetableId },
            select: timetableEntrySelect,
            orderBy: [{ dayOfWeek: "asc" }, { period: { sequence: "asc" } }],
        });
    }
    async getClassWeeklyEntries(timetableId, classArmId) {
        return this.db.timetableEntry.findMany({
            where: { timetableId, classArmId },
        });
    }
    async getTeacherWeeklyEntries(timetableId, teacherId) {
        return this.db.timetableEntry.findMany({
            where: { timetableId, teacherId },
        });
    }
    async getRoomWeeklyEntries(timetableId, roomId) {
        return this.db.timetableEntry.findMany({
            where: { timetableId, roomId },
        });
    }
    async getEntriesByDayAndPeriod(timetableId, dayOfWeek, periodId) {
        return this.db.timetableEntry.findMany({
            where: { timetableId, dayOfWeek, periodId },
        });
    }
    async transaction(fn) {
        return prisma.$transaction(async (tx) => {
            const txRepo = new TimetableEntryRepo(tx);
            return fn(txRepo);
        });
    }
}
