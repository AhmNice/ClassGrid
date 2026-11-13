import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
const isNotFound = (error) => error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025";
export class PeriodScheduleRepo {
    async create(data) {
        return await prisma.periodSchedule.create({
            data: {
                ...data,
                applicableDays: data.applicableDays,
            },
        });
    }
    async list(schoolId) {
        return await prisma.periodSchedule.findMany({
            where: { schoolId },
            orderBy: { name: "asc" },
        });
    }
    async findById(schoolId, scheduleId) {
        return await prisma.periodSchedule.findFirst({
            where: { scheduleId, schoolId },
        });
    }
    async findByName(schoolId, name, excludeId) {
        return await prisma.periodSchedule.findFirst({
            where: {
                schoolId,
                name,
                ...(excludeId ? { NOT: { scheduleId: excludeId } } : {}),
            },
        });
    }
    async update(schoolId, scheduleId, data) {
        try {
            return await prisma.periodSchedule.update({
                where: { scheduleId },
                data: {
                    ...data,
                    applicableDays: data.applicableDays,
                },
            });
        }
        catch (error) {
            if (isNotFound(error))
                return null;
            throw error;
        }
    }
    async delete(schoolId, scheduleId) {
        const result = await prisma.periodSchedule.deleteMany({
            where: { scheduleId, schoolId },
        });
        return result.count > 0;
    }
}
export const periodScheduleRepo = new PeriodScheduleRepo();
