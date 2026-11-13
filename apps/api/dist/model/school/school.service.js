import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import { schoolRepo } from "./school.repo.js";
export class SchoolService {
    async createSchool(data) {
        const clean = normalize(data);
        if (clean.workingDays)
            this.validateWorkingDays(clean.workingDays);
        return await schoolRepo.createSchool(clean);
    }
    async getSchools() {
        return await schoolRepo.getSchools();
    }
    async getSchoolById(schoolId) {
        return await schoolRepo.getSchoolById(schoolId);
    }
    async updateSchool(schoolId, data) {
        const clean = normalize(data);
        if (Object.keys(clean).length === 0) {
            throw new ApiError(400, "At least one field is required");
        }
        if (clean.workingDays)
            this.validateWorkingDays(clean.workingDays);
        return await schoolRepo.updateSchool(schoolId, clean);
    }
    async deleteSchool(schoolId) {
        return await schoolRepo.deleteSchool(schoolId);
    }
    validateWorkingDays(workingDays) {
        if (new Set(workingDays).size !== workingDays.length) {
            throw new ApiError(422, "Working days must be unique");
        }
    }
    async getWorkingDays(schoolId) {
        const school = await schoolRepo.getWorkingDays(schoolId);
        if (!school)
            throw new ApiError(404, "School not found");
        return school;
    }
    async updateWorkingDays(schoolId, workingDays) {
        this.validateWorkingDays(workingDays);
        const school = await schoolRepo.updateWorkingDays(schoolId, workingDays);
        if (!school)
            throw new ApiError(404, "School not found");
        return school;
    }
}
export const schoolService = new SchoolService();
