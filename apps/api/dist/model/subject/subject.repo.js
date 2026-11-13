import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
const isNotFound = (error) => error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025";
export class SubjectRepo {
    async createSubject(data) {
        return await prisma.subject.create({ data });
    }
    async findDuplicate(schoolId, fields, excludeId) {
        const conditions = [];
        if (fields.name) {
            conditions.push({
                name: { equals: fields.name, mode: "insensitive" },
            });
        }
        if (fields.code) {
            conditions.push({
                code: { equals: fields.code, mode: "insensitive" },
            });
        }
        if (conditions.length === 0)
            return null;
        return await prisma.subject.findFirst({
            where: {
                schoolId,
                OR: conditions,
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });
    }
    async getSubjects(query) {
        const search = query.query?.trim();
        const where = {
            schoolId: query.schoolId,
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { code: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        const [items, total] = await prisma.$transaction([
            prisma.subject.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { [query.sortBy]: query.sortOrder },
            }),
            prisma.subject.count({ where }),
        ]);
        return { items, total, page: query.page, limit: query.limit };
    }
    async getSubjectById(id) {
        return await prisma.subject.findUnique({ where: { id } });
    }
    async updateSubject(id, data) {
        try {
            return await prisma.subject.update({ where: { id }, data });
        }
        catch (error) {
            if (isNotFound(error))
                return null;
            throw error;
        }
    }
    async deleteSubject(id) {
        try {
            await prisma.subject.delete({ where: { id } });
            return true;
        }
        catch (error) {
            if (isNotFound(error))
                return false;
            throw error;
        }
    }
    async findByIds(ids, schoolId, returnFields = ["id"]) {
        return await prisma.subject.findMany({
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
