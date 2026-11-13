import { prisma } from "@/lib/prisma.js";
export class ClassLevelSubjectRepo {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async createClassLevelSubject(data) {
        return await this.db.classLevelSubject.create({ data });
    }
    async getClassLevelSubjectsByClassLevelId(classLevelId) {
        return await this.db.classLevelSubject.findMany({
            where: { classLevelId },
        });
    }
    async getAllClassLevelSubjects() {
        return await this.db.classLevelSubject.findMany();
    }
    async getClassLevelSubjectsBySubjectId(subjectId) {
        return await this.db.classLevelSubject.findMany({ where: { subjectId } });
    }
    async getClassLevelSubjectById(id) {
        return await this.db.classLevelSubject.findUnique({ where: { id } });
    }
    async updateClassLevelSubject(id, data) {
        return await this.db.classLevelSubject.update({ where: { id }, data });
    }
    async deleteClassLevelSubject(id) {
        await this.db.classLevelSubject.delete({ where: { id } });
        return true;
    }
    async removeAllocations(schoolId, allocations) {
        if (allocations.length === 0)
            return;
        await this.db.classLevelSubject.deleteMany({
            where: {
                schoolId,
                OR: allocations.map((allocation) => ({
                    classLevelId: allocation.classLevelId,
                    subjectId: allocation.subjectId,
                })),
            },
        });
    }
    // Transaction runner method
    async transaction(fn) {
        return await prisma.$transaction(async (tx) => {
            const txRepo = new ClassLevelSubjectRepo(tx);
            return await fn(txRepo);
        });
    }
}
