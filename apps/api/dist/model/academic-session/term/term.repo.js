import { prisma } from "@/lib/prisma.js";
export class TermRepo {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async createTerm(data) {
        const { sessionId, ...termData } = data;
        return await this.db.term.create({
            data: {
                ...termData,
                session: { connect: { id: sessionId } },
            },
        });
    }
    async getSessionDates(sessionId) {
        return await this.db.academicSession.findUnique({
            where: { id: sessionId },
            select: { startDate: true, endDate: true },
        });
    }
    async getTerms(sessionId) {
        return await this.db.term.findMany({
            where: { sessionId },
            orderBy: { name: "asc" },
        });
    }
    async getTermById(sessionId, id) {
        return await this.db.term.findFirst({ where: { id, sessionId } });
    }
    async findUnique(termId) {
        return await this.db.term.findUnique({ where: { id: termId } });
    }
    async updateTerm(sessionId, id, data) {
        const { midTermStartDate, midTermEndDate, ...termData } = data;
        const updateData = {
            ...termData,
            ...(midTermStartDate == null ? {} : { midTermStartDate }),
            ...(midTermEndDate == null ? {} : { midTermEndDate }),
        };
        if (data.isCurrent) {
            // Use this.db to respect active transaction context if passed
            return await this.db.$transaction(async (tx) => {
                const txRepo = new TermRepo(tx);
                const term = await txRepo.getTermById(sessionId, id);
                if (!term)
                    return null;
                await tx.term.updateMany({
                    where: { sessionId, isCurrent: true },
                    data: { isCurrent: false },
                });
                return await tx.term.update({
                    where: { id },
                    data: updateData,
                });
            });
        }
        const result = await this.db.term.updateMany({
            where: { id, sessionId },
            data: updateData,
        });
        if (result.count === 0)
            return null;
        return await this.getTermById(sessionId, id);
    }
    async activateTerm(sessionId, id) {
        return await this.db.$transaction(async (tx) => {
            const txRepo = new TermRepo(tx);
            const term = await txRepo.getTermById(sessionId, id);
            if (!term)
                return null;
            await tx.term.updateMany({
                where: { sessionId, isCurrent: true },
                data: { isCurrent: false },
            });
            return await tx.term.update({
                where: { id },
                data: { isCurrent: true },
            });
        });
    }
    async deleteTerm(sessionId, id) {
        const result = await this.db.term.deleteMany({ where: { id, sessionId } });
        return result.count > 0;
    }
    async getTermSchoolIdSessionId(termId) {
        const result = await this.db.term.findUnique({
            where: { id: termId },
            select: {
                session: { select: { id: true, schoolId: true } },
            },
        });
        if (!result || !result.session)
            return null;
        return {
            sessionId: result.session.id,
            schoolId: result.session.schoolId,
        };
    }
    // Expose transaction runner pattern
    async transaction(fn) {
        return await prisma.$transaction(async (tx) => {
            const txRepo = new TermRepo(tx);
            return await fn(txRepo);
        });
    }
}
export const termRepo = new TermRepo();
