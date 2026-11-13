import { ApiError } from "@/utils/errorHandler.js";
export class ClassLevelService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async validateClassLevelUniqueName(name, schoolId, currentId) {
        const normalized = name.trim().toLowerCase();
        const classLevels = (await this.repo.getClassLevels(schoolId, {
            page: 1,
            limit: 100,
            sortBy: "name",
            sortOrder: "asc",
        })).items;
        const isTaken = classLevels.some((level) => level.id !== currentId &&
            level.name.trim().toLowerCase() === normalized);
        if (isTaken) {
            throw new ApiError(422, "Class level name already exists");
        }
    }
    async createClassLevel(data) {
        const name = data.name.trim();
        await this.validateClassLevelUniqueName(name, data.schoolId);
        return await this.repo.createClassLevel({ ...data, name });
    }
    async getClassLevels(schoolId, query) {
        return await this.repo.getClassLevels(schoolId, query);
    }
    async getClassLevelById(id) {
        return await this.repo.getClassLevelById(id);
    }
    async updateClassLevel(id, data) {
        if (data.name === undefined) {
            return await this.repo.updateClassLevel(id, data);
        }
        const existing = await this.repo.getClassLevelById(id);
        if (!existing)
            return null;
        const name = data.name.trim();
        await this.validateClassLevelUniqueName(name, existing.schoolId, id);
        return await this.repo.updateClassLevel(id, { ...data, name });
    }
    async deleteClassLevel(id) {
        return await this.repo.deleteClassLevel(id);
    }
}
