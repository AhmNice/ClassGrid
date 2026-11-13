import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
export class TeacherService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createTeacher(data) {
        const clean = normalize(data);
        if (Object.keys(clean).length === 0) {
            throw new ApiError(400, "Teacher data cannot be empty");
        }
        const duplicate = await this.repo.findDuplicate(clean.schoolId, {
            email: clean.email,
            staffCode: clean.staffCode,
        });
        if (duplicate) {
            throw new ApiError(409, "A teacher with this email or staff code already exists");
        }
        return await this.repo.createTeacher(clean);
    }
    async getTeachers(query) {
        return await this.repo.getTeachers(query);
    }
    async getTeacherById(id) {
        return await this.repo.getTeacherById(id);
    }
    async updateTeacher(id, data) {
        const clean = normalize(data);
        if (Object.keys(clean).length === 0) {
            throw new ApiError(400, "No fields to update");
        }
        return await this.repo.updateTeacher(id, clean);
    }
    async deleteTeacher(id) {
        return await this.repo.deleteTeacher(id);
    }
}
