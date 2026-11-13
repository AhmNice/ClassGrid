import { normalize } from "@/utils/cleaner.js";
import { ApiError } from "@/utils/errorHandler.js";
import _ from "lodash";
export class SubjectAssignmentService {
    repo;
    subjectRepo;
    classLevelRepo;
    constructor(repo, subjectRepo, classLevelRepo) {
        this.repo = repo;
        this.subjectRepo = subjectRepo;
        this.classLevelRepo = classLevelRepo;
    }
    async updateSubjectAssignments(data) {
        const { schoolId, additions, removals } = data;
        if (!schoolId)
            throw new ApiError(422, "School ID is required");
        if (!additions || !removals)
            throw new ApiError(422, "Additions and removals are required");
        const cleanAdditions = normalize(additions);
        const cleanRemovals = normalize(removals);
        if (_.isEmpty(cleanAdditions) && _.isEmpty(cleanRemovals)) {
            throw new ApiError(422, "At least one addition or removal is required");
        }
        const classLevelIds = [
            ...new Set([...cleanAdditions, ...cleanRemovals].map((a) => a.classLevelId)),
        ];
        const subjectIds = [
            ...new Set([...cleanAdditions, ...cleanRemovals].map((a) => a.subjectId)),
        ];
        const [classLevels, subjects] = await Promise.all([
            this.classLevelRepo.findByIds(classLevelIds, schoolId, ["id"]),
            this.subjectRepo.findByIds(subjectIds, schoolId, ["id"]),
        ]);
        if (classLevels.length !== classLevelIds.length) {
            throw new ApiError(404, "One or more class levels not found");
        }
        if (subjects.length !== subjectIds.length) {
            throw new ApiError(404, "One or more subjects not found");
        }
        // Run atomically using repository transaction wrapper
        await this.repo.transaction(async (txRepo) => {
            if (cleanAdditions.length > 0) {
                await Promise.all(cleanAdditions.map((allocation) => txRepo.createClassLevelSubject({
                    schoolId,
                    classLevelId: allocation.classLevelId,
                    subjectId: allocation.subjectId,
                })));
            }
            if (cleanRemovals.length > 0) {
                await txRepo.removeAllocations(schoolId, cleanRemovals);
            }
        });
    }
    async assignSubjectToClassLevel(data) {
        const clean = normalize(data);
        if (_.isEmpty(clean))
            throw new ApiError(422, "No data provided");
        const [existingSubject, existingClassLevel] = await Promise.all([
            this.subjectRepo.getSubjectById(clean.subjectId),
            this.classLevelRepo.getClassLevelById(clean.classLevelId),
        ]);
        if (!existingSubject)
            throw new ApiError(404, "Subject not found");
        if (!existingClassLevel)
            throw new ApiError(404, "Class level not found");
        return await this.repo.createClassLevelSubject(clean);
    }
    async getClassLevelSubjectsByClassLevelId(classLevelId) {
        return await this.repo.getClassLevelSubjectsByClassLevelId(classLevelId);
    }
    async getClassLevelSubjectsBySubjectId(subjectId) {
        return await this.repo.getClassLevelSubjectsBySubjectId(subjectId);
    }
    async getAllSubjectAssignments() {
        return await this.repo.getAllClassLevelSubjects();
    }
    async getClassLevelSubjectById(id) {
        return await this.repo.getClassLevelSubjectById(id);
    }
    async updateClassLevelSubject(id, data) {
        return await this.repo.updateClassLevelSubject(id, data);
    }
    async deleteClassLevelSubject(id) {
        return await this.repo.deleteClassLevelSubject(id);
    }
}
