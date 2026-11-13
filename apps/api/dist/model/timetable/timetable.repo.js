import { prisma } from "@/lib/prisma.js";
export class TimeTableRepo {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async create(data) {
        return await this.db.timetable.create({
            data: {
                termId: data.termId,
                name: data.name,
                basedOnId: data.basedOnId ?? null,
                version: data.version,
            },
        });
    }
    async findById(id) {
        return await this.db.timetable.findUnique({ where: { id } });
    }
    async findMany(query) {
        const timetables = await this.db.timetable.findMany({
            where: {
                ...(query.termId ? { termId: query.termId } : {}),
                term: {
                    session: {
                        schoolId: query.schoolId,
                        ...(query.sessionId ? { id: query.sessionId } : {}),
                    },
                },
            },
            include: {
                _count: {
                    select: { entries: true },
                },
            },
            orderBy: [{ termId: "asc" }, { version: "desc" }],
        });
        return timetables.map(({ _count, ...timetable }) => ({
            ...timetable,
            entriesCount: _count.entries,
        }));
    }
    async findPublishedByTerm(termId) {
        return await this.db.timetable.findFirst({
            where: { termId, status: "PUBLISHED" },
        });
    }
    async update(id, data) {
        return await this.db.timetable.update({
            where: { id },
            data,
        });
    }
    async duplicate(id, newName) {
        const timetable = await this.db.timetable.findUnique({
            where: { id },
        });
        if (!timetable) {
            throw new Error("Timetable not found");
        }
        const highestVersion = await this.db.timetable.aggregate({
            where: { termId: timetable.termId },
            _max: { version: true },
        });
        const nextVersion = (highestVersion._max.version ?? 0) + 1;
        const entries = await this.db.timetableEntry.findMany({
            where: { timetableId: timetable.id },
            select: {
                dayOfWeek: true,
                periodId: true,
                assignmentId: true,
                teacherId: true,
                classArmId: true,
                roomId: true,
                isLocked: true,
                note: true,
                createdById: true,
                updatedById: true,
            },
        });
        const duplicatedTimetable = await this.db.timetable.create({
            data: {
                termId: timetable.termId,
                name: newName,
                basedOnId: timetable.id,
                version: nextVersion,
            },
        });
        if (entries.length > 0) {
            await this.db.timetableEntry.createMany({
                data: entries.map((entry) => ({
                    ...entry,
                    timetableId: duplicatedTimetable.id,
                })),
            });
        }
        return duplicatedTimetable;
    }
    async isValidTargetForDuplication(id) {
        const timetable = await this.db.timetable.findUnique({
            where: { id },
        });
        return !!timetable && timetable.status === "PUBLISHED";
    }
    async transaction(fn) {
        return await prisma.$transaction(async (tx) => {
            const txRepo = new TimeTableRepo(tx);
            return await fn(txRepo);
        });
    }
    async markAsDraft(id) {
        const result = await this.db.timetable.updateMany({
            where: { id },
            data: { status: "DRAFT" },
        });
        if (result.count === 0)
            return null;
        return await this.db.timetable.findUnique({ where: { id } });
    }
    async markAsPublished(id) {
        const result = await this.db.timetable.updateMany({
            where: { id },
            data: {
                status: "PUBLISHED",
                publishedAt: new Date(),
                archivedAt: null,
            },
        });
        if (result.count === 0)
            return null;
        return await this.db.timetable.findUnique({ where: { id } });
    }
    async markAsArchived(id) {
        const result = await this.db.timetable.updateMany({
            where: { id },
            data: { status: "ARCHIVED", archivedAt: new Date() },
        });
        if (result.count === 0)
            return null;
        return await this.db.timetable.findUnique({ where: { id } });
    }
}
