import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import { periodScheduleRepo, } from "./schedule.repo.js";
export class PeriodScheduleService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(data) {
        const clean = normalize(data);
        await this.ensureNameAvailable(clean.schoolId, clean.name);
        this.validateDays(clean.applicableDays);
        return await this.repo.create(clean);
    }
    async list(schoolId) {
        return await this.repo.list(schoolId);
    }
    async findById(schoolId, scheduleId) {
        return await this.repo.findById(schoolId, scheduleId);
    }
    async update(schoolId, scheduleId, data) {
        const existing = await this.repo.findById(schoolId, scheduleId);
        if (!existing)
            return null;
        const clean = normalize(data);
        if (Object.keys(clean).length === 0) {
            throw new ApiError(400, "At least one field is required");
        }
        if (clean.name) {
            await this.ensureNameAvailable(schoolId, clean.name, scheduleId);
        }
        if (clean.applicableDays)
            this.validateDays(clean.applicableDays);
        return await this.repo.update(schoolId, scheduleId, clean);
    }
    async delete(schoolId, scheduleId) {
        return await this.repo.delete(schoolId, scheduleId);
    }
    async ensureNameAvailable(schoolId, name, excludeId) {
        const duplicate = await this.repo.findByName(schoolId, name, excludeId);
        if (duplicate) {
            throw new ApiError(422, "A schedule with this name already exists");
        }
    }
    validateDays(days) {
        if (new Set(days).size !== days.length) {
            throw new ApiError(422, "Applicable days must be unique");
        }
    }
}
export const periodScheduleService = new PeriodScheduleService(periodScheduleRepo);
