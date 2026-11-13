import { prisma } from "@/lib/prisma.js";
export class ClassArmRepo {
    async createClassArm(data) {
        return await prisma.classArm.create({ data });
    }
    async getClassArms(classLevelId, query) {
        const where = {
            classLevelId,
            ...(query.query
                ? { name: { contains: query.query, mode: "insensitive" } }
                : {}),
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
        };
        const [items, total] = await prisma.$transaction([
            prisma.classArm.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { [query.sortBy]: query.sortOrder },
            }),
            prisma.classArm.count({ where }),
        ]);
        return { items, total };
    }
    async getAllClassArms(query) {
        const where = {
            // classLevelId,
            ...(query.query
                ? { name: { contains: query.query, mode: "insensitive" } }
                : {}),
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
        };
        const [items, total] = await prisma.$transaction([
            prisma.classArm.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    classLevelId: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    classLevel: {
                        select: {
                            id: true,
                            stage: true,
                            name: true,
                            // track: true,
                        },
                    },
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { [query.sortBy]: query.sortOrder },
            }),
            prisma.classArm.count({ where }),
        ]);
        return { items, total };
    }
    async getClassArmById(classLevelId, id) {
        return await prisma.classArm.findFirst({ where: { id, classLevelId } });
    }
    async updateClassArm(classLevelId, id, data) {
        const result = await prisma.classArm.updateMany({
            where: { id, classLevelId },
            data,
        });
        if (result.count === 0)
            return null;
        return await this.getClassArmById(classLevelId, id);
    }
    async deleteClassArm(classLevelId, id) {
        const result = await prisma.classArm.deleteMany({
            where: { id, classLevelId },
        });
        return result.count > 0;
    }
}
export const classArmRepo = new ClassArmRepo();
