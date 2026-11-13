import { normalize } from "@/utils/cleaner.js";
import { ApiError } from "@/utils/errorHandler.js";
export class TimetableService {
    repo;
    termRepo;
    allocationRepo;
    validationService;
    constructor(repo, termRepo, allocationRepo, validationService) {
        this.repo = repo;
        this.termRepo = termRepo;
        this.allocationRepo = allocationRepo;
        this.validationService = validationService;
    }
    async createTimetable(data) {
        const cleanData = normalize(data);
        const termInfo = await this.termRepo.getTermSchoolIdSessionId(cleanData.termId);
        if (!termInfo || !termInfo.sessionId || !termInfo.schoolId) {
            throw new ApiError(404, "Associated academic term or school not found");
        }
        return await this.repo.create(cleanData);
    }
    async getTimetables(query) {
        return await this.repo.findMany(query);
    }
    async duplicateTimetable(id, newName) {
        const isEligible = await this.repo.isValidTargetForDuplication(id);
        if (!isEligible) {
            throw new ApiError(400, "Timetable is not eligible for duplication (must be published)");
        }
        return await this.repo.transaction((transactionRepo) => transactionRepo.duplicate(id, newName));
    }
    async updateDraftTimetable(id, data) {
        const timetable = await this.repo.findById(id);
        if (!timetable)
            throw new ApiError(404, "Timetable not found");
        if (timetable.status !== "DRAFT") {
            throw new ApiError(409, "Only draft timetables can be modified");
        }
        const cleanData = normalize(data);
        if (!cleanData.name) {
            throw new ApiError(422, "Timetable name cannot be empty");
        }
        return await this.repo.update(id, cleanData);
    }
    async publishTimetable(id) {
        const timetable = await this.repo.findById(id);
        if (!timetable)
            throw new ApiError(404, "Timetable not found");
        if (timetable.status !== "DRAFT") {
            throw new ApiError(409, "Only draft timetables can be published");
        }
        const term = await this.termRepo.findUnique(timetable.termId);
        if (!term)
            throw new ApiError(404, "Associated academic term not found");
        if (!term.sessionId)
            throw new ApiError(404, "Associated academic session not found");
        // 1. Fetch teaching assignments for curriculum/quota validation
        const allocations = await this.allocationRepo.getTeachingAssignmentBySession(term.sessionId);
        // 2. Run validation check before publishing (CLASSGRID-3.37)
        const validationSummary = await this.validationService.validateTimetable(id, allocations);
        if (!validationSummary.isValid) {
            throw new ApiError(422, JSON.stringify({
                message: "Timetable validation failed. Cannot publish invalid timetable.",
                errors: validationSummary.errors,
            }));
        }
        return await this.repo.transaction(async (transactionRepo) => {
            const current = await transactionRepo.findById(id);
            if (!current)
                throw new ApiError(404, "Timetable not found");
            const published = await transactionRepo.findPublishedByTerm(current.termId);
            if (published && published.id !== id) {
                await transactionRepo.markAsArchived(published.id);
            }
            const result = await transactionRepo.markAsPublished(id);
            if (!result)
                throw new ApiError(404, "Timetable not found");
            return result;
        });
    }
    async archiveTimetable(id) {
        const timetable = await this.repo.findById(id);
        if (!timetable)
            throw new ApiError(404, "Timetable not found");
        if (timetable.status === "ARCHIVED") {
            throw new ApiError(409, "Timetable is already archived");
        }
        if (timetable.status === "DRAFT") {
            throw new ApiError(409, "Draft timetables cannot be archived");
        }
        const result = await this.repo.markAsArchived(id);
        if (!result)
            throw new ApiError(404, "Timetable not found");
        return result;
    }
}
