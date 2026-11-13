import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
const isNotFound = (e) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
export class TeacherRepo {
    async createTeacher(data) {
        return await prisma.teacher.create({ data });
    }
    async getTeachers(query) {
        const search = query.query?.trim();
        const where = search
            ? {
                OR: ["firstName", "lastName", "email", "phone", "staffCode"].map((field) => ({
                    [field]: { contains: search, mode: "insensitive" },
                })),
            }
            : {};
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const [data, total] = await prisma.$transaction([
            prisma.teacher.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
            }),
            prisma.teacher.count({ where }),
        ]);
        return { items: data, total, page, limit };
    }
    async getTeacherById(id) {
        return await prisma.teacher.findUnique({ where: { id } });
    }
    async updateTeacher(id, data) {
        try {
            return await prisma.teacher.update({ where: { id }, data });
        }
        catch (e) {
            if (isNotFound(e))
                return null;
            throw e;
        }
    }
    async findDuplicate(schoolId, fields, excludeId) {
        const conditions = [];
        if (fields.email)
            conditions.push({ email: { equals: fields.email, mode: "insensitive" } });
        if (fields.staffCode)
            conditions.push({
                staffCode: { equals: fields.staffCode, mode: "insensitive" },
            });
        if (conditions.length === 0)
            return null;
        return await prisma.teacher.findFirst({
            where: {
                schoolId,
                OR: conditions,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });
    }
    async deleteTeacher(id) {
        try {
            await prisma.teacher.delete({ where: { id } });
            return true;
        }
        catch (e) {
            if (isNotFound(e))
                return false;
            throw e;
        }
    }
}
