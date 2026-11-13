import { prisma } from "@/lib/prisma.js";
export class ClassLevelRepo {
    async createClassLevel(data) {
        return await prisma.classLevel.create({ data });
    }
    async getClassLevels(schoolId, query) {
        const where = {
            schoolId,
            ...(query.query
                ? { name: { contains: query.query, mode: "insensitive" } }
                : {}),
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
            ...(query.stage === undefined ? {} : { stage: query.stage }),
        };
        const [items, total] = await prisma.$transaction([
            prisma.classLevel.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { [query.sortBy]: query.sortOrder },
            }),
            prisma.classLevel.count({ where }),
        ]);
        return { items, total };
    }
    async getClassLevelById(id) {
        return await prisma.classLevel.findUnique({ where: { id } });
    }
    async updateClassLevel(id, data) {
        return await prisma.classLevel.update({ where: { id }, data });
    }
    async deleteClassLevel(id) {
        await prisma.classLevel.delete({ where: { id } });
        return true;
    }
    async findByIds(ids, schoolId, returnFields = ["id"]) {
        return await prisma.classLevel.findMany({
            where: { id: { in: ids }, schoolId },
            select: {
                ...returnFields?.reduce((acc, field) => {
                    acc[field] = true;
                    return acc;
                }, {}),
            },
        });
    }
}
export const classLevelRepo = new ClassLevelRepo();
