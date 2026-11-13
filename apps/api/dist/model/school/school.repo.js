import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
const isNotFound = (error) => error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025";
class SchoolRepository {
    async createSchool(data) {
        return await prisma.school.create({
            data: {
                ...data,
                workingDays: data.workingDays,
            },
        });
    }
    async getSchools() {
        return await prisma.school.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async getSchoolById(schoolId) {
        return await prisma.school.findUnique({ where: { id: schoolId } });
    }
    async updateSchool(schoolId, data) {
        try {
            return await prisma.school.update({
                where: { id: schoolId },
                data: {
                    ...data,
                    workingDays: data.workingDays,
                },
            });
        }
        catch (error) {
            if (isNotFound(error))
                return null;
            throw error;
        }
    }
    async deleteSchool(schoolId) {
        try {
            await prisma.school.delete({ where: { id: schoolId } });
            return true;
        }
        catch (error) {
            if (isNotFound(error))
                return false;
            throw error;
        }
    }
    async getWorkingDays(schoolId) {
        return await prisma.school.findUnique({
            where: { id: schoolId },
            select: { id: true, workingDays: true },
        });
    }
    async updateWorkingDays(schoolId, workingDays) {
        const result = await prisma.school.updateMany({
            where: { id: schoolId },
            data: { workingDays: workingDays },
        });
        if (result.count === 0)
            return null;
        return await prisma.school.findUnique({
            where: { id: schoolId },
            select: { id: true, workingDays: true },
        });
    }
}
export const schoolRepo = new SchoolRepository();
