import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import { periodRepo } from "./period.repo.js";
import { periodScheduleRepo } from "./Schedule/schedule.repo.js";
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const validateTimes = (startTime, endTime) => {
    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
        throw new ApiError(422, "Times must use HH:mm format");
    }
    if (startTime >= endTime) {
        throw new ApiError(422, "Start time must be before end time");
    }
};
export class PeriodService {
    repo;
    scheduleRepo;
    constructor(repo, scheduleRepo) {
        this.repo = repo;
        this.scheduleRepo = scheduleRepo;
    }
    async createPeriod(data) {
        const clean = normalize(data);
        if (!clean.name)
            throw new ApiError(422, "Period name cannot be empty");
        validateTimes(clean.startTime, clean.endTime);
        if (clean.isActive !== false) {
            const duplicate = await this.repo.findDuplicateSequence(clean.schoolId, clean.sequence);
            if (duplicate) {
                throw new ApiError(422, "Active period sequence already exists");
            }
            const validSchedule = await this.scheduleRepo.findById(clean.schoolId, clean.periodScheduleScheduleId);
            if (!validSchedule)
                throw new ApiError(400, "Invalid schedule");
        }
        return await this.repo.createPeriod(clean);
    }
    async getPeriods(query) {
        return await this.repo.getPeriods(query);
    }
    async getPeriodById(id) {
        return await this.repo.getPeriodById(id);
    }
    async updatePeriod(id, data) {
        const existing = await this.repo.getPeriodById(id);
        if (!existing)
            return null;
        const clean = normalize(data);
        if (Object.keys(clean).length === 0) {
            throw new ApiError(400, "No fields to update");
        }
        const startTime = clean.startTime ?? existing.startTime;
        const endTime = clean.endTime ?? existing.endTime;
        validateTimes(startTime, endTime);
        const isActive = clean.isActive ?? existing.isActive;
        if (isActive) {
            const duplicate = await this.repo.findDuplicateSequence(existing.schoolId, clean.sequence ?? existing.sequence, id);
            if (duplicate) {
                throw new ApiError(422, "Active period sequence already exists");
            }
        }
        return await this.repo.updatePeriod(id, clean);
    }
    async deletePeriod(id) {
        return await this.repo.deletePeriod(id);
    }
    async reorderPeriods(data) {
        const activePeriods = await this.repo.getActivePeriods(data.schoolId);
        const activeIds = new Set(activePeriods.map((period) => period.id));
        const requestedIds = new Set(data.periodIds);
        if (requestedIds.size !== data.periodIds.length) {
            throw new ApiError(422, "Period IDs must be unique");
        }
        if (activePeriods.length !== data.periodIds.length ||
            data.periodIds.some((id) => !activeIds.has(id))) {
            throw new ApiError(422, "All and only active periods for the school must be provided");
        }
        return await this.repo.reorderPeriods(data);
    }
}
export const periodService = new PeriodService(periodRepo, periodScheduleRepo);
