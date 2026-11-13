import { prisma } from "@/lib/prisma.js";
const detailsInclude = {
    teacher: {
        select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            staffCode: true,
        },
    },
    subject: {
        select: { id: true, name: true, code: true },
    },
};
export class TeacherSubjectRepo {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async create(data) {
        return await this.db.teacherSubject.create({
            data,
            include: detailsInclude,
        });
    }
    async findById(schoolId, id) {
        return await this.db.teacherSubject.findFirst({
            where: { id, schoolId },
            include: detailsInclude,
        });
    }
    async findByPair(schoolId, teacherId, subjectId) {
        return await this.db.teacherSubject.findFirst({
            where: { schoolId, teacherId, subjectId },
            include: detailsInclude,
        });
    }
    async list(schoolId, query) {
        return await this.db.teacherSubject.findMany({
            where: {
                schoolId,
                ...(query.teacherId ? { teacherId: query.teacherId } : {}),
                ...(query.subjectId ? { subjectId: query.subjectId } : {}),
            },
            include: detailsInclude,
            orderBy: [
                { teacher: { lastName: "asc" } },
                { teacher: { firstName: "asc" } },
                { subject: { name: "asc" } },
            ],
        });
    }
    async delete(schoolId, id) {
        const result = await this.db.teacherSubject.deleteMany({
            where: { id, schoolId },
        });
        return result.count > 0;
    }
    async validateTarget(schoolId, teacherId, subjectId) {
        const [teacher, subject] = await Promise.all([
            this.db.teacher.findFirst({
                where: { id: teacherId, schoolId, isActive: true },
                select: { id: true },
            }),
            this.db.subject.findFirst({
                where: { id: subjectId, schoolId, isActive: true },
                select: { id: true },
            }),
        ]);
        return Boolean(teacher && subject);
    }
    async transaction(fn) {
        return await prisma.$transaction(async (tx) => {
            const repo = new TeacherSubjectRepo(tx);
            return await fn(repo);
        });
    }
}
export const teacherSubjectRepo = new TeacherSubjectRepo();
