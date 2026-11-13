import { prisma } from "@/lib/prisma.js";
class AcademicSessionRepo {
    async createAcademicSession(data) {
        return await prisma.$transaction(async (tx) => {
            if (data.isCurrent) {
                await tx.academicSession.updateMany({
                    where: { schoolId: data.schoolId, isCurrent: true },
                    data: { isCurrent: false },
                });
            }
            return await tx.academicSession.create({ data });
        });
    }
    async getAcademicSessions(schoolId) {
        return await prisma.academicSession.findMany({
            where: { schoolId },
            include: { terms: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async getCurrentAcademicSession(schoolId) {
        return await prisma.academicSession.findFirst({
            where: { schoolId, isCurrent: true },
        });
    }
    async getAcademicSessionById(id) {
        return await prisma.academicSession.findUnique({
            where: { id },
        });
    }
    async getTerms(sessionId) {
        return await prisma.term.findMany({
            where: { sessionId },
            // select: { name: true, startDate: true, endDate: true, isCurrent: true },
            orderBy: { startDate: "asc" },
        });
    }
    async updateAcademicSession(id, data) {
        if (data.isCurrent) {
            return await prisma.$transaction(async (tx) => {
                const session = await tx.academicSession.findUnique({ where: { id } });
                if (!session)
                    return null;
                await tx.academicSession.updateMany({
                    where: { schoolId: session.schoolId, isCurrent: true },
                    data: { isCurrent: false },
                });
                return await tx.academicSession.update({
                    where: { id },
                    data,
                });
            });
        }
        try {
            return await prisma.academicSession.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            // P2025: record to update not found
            if (error?.code === "P2025")
                return null;
            throw error;
        }
    }
    async activateAcademicSession(id) {
        return await prisma.$transaction(async (tx) => {
            const session = await tx.academicSession.findUnique({ where: { id } });
            if (!session)
                return null;
            await tx.academicSession.updateMany({
                where: { schoolId: session.schoolId, isCurrent: true },
                data: { isCurrent: false },
            });
            return await tx.academicSession.update({
                where: { id },
                data: { isCurrent: true },
            });
        });
    }
    async deleteAcademicSession(id) {
        try {
            await prisma.academicSession.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            // P2025: record to delete not found
            if (error?.code === "P2025")
                return false;
            throw error;
        }
    }
}
export const academicSessionRepo = new AcademicSessionRepo();
