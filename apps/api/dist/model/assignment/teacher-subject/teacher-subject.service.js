import { normalize } from "@/utils/cleaner.js";
import { ApiError } from "@/utils/errorHandler.js";
import { teacherSubjectRepo, } from "./teacher-subject.repo.js";
export class TeacherSubjectService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async assign(data) {
        return await this.assignWithRepo(this.repo, data);
    }
    async assignWithRepo(repo, data) {
        const clean = normalize(data);
        if (!clean.teacherId || !clean.subjectId || !clean.schoolId) {
            throw new ApiError(422, "Teacher, subject, and school are required");
        }
        if (!(await repo.validateTarget(clean.schoolId, clean.teacherId, clean.subjectId))) {
            throw new ApiError(422, "Teacher and subject must be active records in the same school");
        }
        if (await repo.findByPair(clean.schoolId, clean.teacherId, clean.subjectId)) {
            throw new ApiError(409, "Teacher is already assigned to this subject");
        }
        return await repo.create(clean);
    }
    async bulkUpdate(data) {
        const clean = normalize(data);
        const { schoolId, additions, removals } = clean;
        if (!schoolId) {
            throw new ApiError(422, "School ID is required");
        }
        const cleanAdditions = normalize(additions);
        const cleanRemovals = normalize(removals);
        if (cleanAdditions.length === 0 && cleanRemovals.length === 0) {
            throw new ApiError(422, "At least one addition or removal is required");
        }
        await this.repo.transaction(async (txRepo) => {
            for (const item of cleanAdditions) {
                await this.assignWithRepo(txRepo, {
                    schoolId,
                    teacherId: item.teacherId,
                    subjectId: item.subjectId,
                });
            }
            for (const item of cleanRemovals) {
                const existing = await txRepo.findByPair(schoolId, item.teacherId, item.subjectId);
                if (existing)
                    await txRepo.delete(schoolId, existing.id);
            }
        });
    }
    async list(schoolId, query) {
        return await this.repo.list(schoolId, query);
    }
    async get(schoolId, id) {
        return await this.repo.findById(schoolId, id);
    }
    async remove(schoolId, id) {
        return await this.repo.delete(schoolId, id);
    }
}
export const teacherSubjectService = new TeacherSubjectService(teacherSubjectRepo);
