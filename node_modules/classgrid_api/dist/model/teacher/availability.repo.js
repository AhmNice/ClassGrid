import { prisma } from "@/lib/prisma.js";
export class TeacherAvailabilityRepo {
    async create(data) {
        return await prisma.teacherAvailability.create({ data });
    }
    async list(teacherId) {
        return await prisma.teacherAvailability.findMany({
            where: { teacherId },
            orderBy: [{ dayOfWeek: "asc" }, { period: { sequence: "asc" } }],
        });
    }
    async findById(teacherId, id) {
        return await prisma.teacherAvailability.findFirst({
            where: { id, teacherId },
        });
    }
    async update(teacherId, id, data) {
        const result = await prisma.teacherAvailability.updateMany({
            where: { id, teacherId },
            data,
        });
        if (result.count === 0)
            return null;
        return await this.findById(teacherId, id);
    }
    async delete(teacherId, id) {
        const result = await prisma.teacherAvailability.deleteMany({
            where: { id, teacherId },
        });
        return result.count > 0;
    }
}
export const teacherAvailabilityRepo = new TeacherAvailabilityRepo();
