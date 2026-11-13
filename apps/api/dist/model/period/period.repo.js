import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
const isNotFound = (error) => error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025";
export class PeriodRepo {
    async createPeriod(data) {
        return await prisma.period.create({ data });
    }
    async findDuplicateSequence(schoolId, sequence, excludeId) {
        return await prisma.period.findFirst({
            where: {
                schoolId,
                sequence,
                isActive: true,
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });
    }
    async getPeriods(query) {
        const search = query.query?.trim();
        const where = {
            schoolId: query.schoolId,
            ...(query.kind === undefined ? {} : { kind: query.kind }),
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        };
        const [items, total] = await prisma.$transaction([
            prisma.period.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { [query.sortBy]: query.sortOrder },
            }),
            prisma.period.count({ where }),
        ]);
        return { items, total, page: query.page, limit: query.limit };
    }
    async getPeriodById(id) {
        return await prisma.period.findUnique({ where: { id } });
    }
    async updatePeriod(id, data) {
        try {
            return await prisma.period.update({ where: { id }, data });
        }
        catch (error) {
            if (isNotFound(error))
                return null;
            throw error;
        }
    }
    async deletePeriod(id) {
        try {
            await prisma.period.delete({ where: { id } });
            return true;
        }
        catch (error) {
            if (isNotFound(error))
                return false;
            throw error;
        }
    }
    async getActivePeriods(schoolId) {
        return await prisma.period.findMany({
            where: { schoolId, isActive: true },
            orderBy: { sequence: "asc" },
        });
    }
    async reorderPeriods(data) {
        return await prisma.$transaction(async (tx) => {
            const offset = data.periodIds.length + 1000;
            await tx.period.updateMany({
                where: { schoolId: data.schoolId, isActive: true },
                data: { sequence: { increment: offset } },
            });
            for (const [index, id] of data.periodIds.entries()) {
                await tx.period.update({
                    where: { id },
                    data: { sequence: index + 1 },
                });
            }
            return await tx.period.findMany({
                where: { schoolId: data.schoolId, isActive: true },
                orderBy: { sequence: "asc" },
            });
        });
    }
}
export const periodRepo = new PeriodRepo();
