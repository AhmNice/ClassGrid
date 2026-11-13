import { ApiError } from "@/utils/errorHandler.js";
import { classLevelRepo } from "../class.repo.js";
import { classArmRepo } from "./arm.repo.js";
export class ClassArmService {
    repo;
    classLevelRepo;
    constructor(repo, classLevelRepo) {
        this.repo = repo;
        this.classLevelRepo = classLevelRepo;
    }
    async ensureClassLevelExists(classLevelId) {
        if (!(await this.classLevelRepo.getClassLevelById(classLevelId))) {
            throw new ApiError(404, "Class level not found");
        }
    }
    async validateUniqueName(classLevelId, name, currentId) {
        const normalized = name.trim().toLowerCase();
        const arms = (await this.repo.getClassArms(classLevelId, {
            page: 1,
            limit: 100,
            sortBy: "name",
            sortOrder: "asc",
        })).items;
        if (arms.some((arm) => arm.id !== currentId && arm.name.trim().toLowerCase() === normalized)) {
            throw new ApiError(422, "Class arm name already exists");
        }
    }
    async createClassArm(data) {
        await this.ensureClassLevelExists(data.classLevelId);
        const name = data.name.trim();
        await this.validateUniqueName(data.classLevelId, name);
        return await this.repo.createClassArm({ ...data, name });
    }
    async getClassArms(classLevelId, query) {
        await this.ensureClassLevelExists(classLevelId);
        return await this.repo.getClassArms(classLevelId, query);
    }
    async getAllClassArms(query) {
        const result = await this.repo.getAllClassArms(query);
        return {
            ...result,
            items: result.items.map((item) => ({
                id: item.id,
                name: item.name,
                classLevelId: item.classLevelId,
                className: item.classLevel.name,
                classStage: item.classLevel.stage,
                isActive: item.isActive,
                // track: item.classLevel.track,
                // subjects: item?.subjects,
                // room: item.room,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),
        };
    }
    async getClassArmById(classLevelId, id) {
        await this.ensureClassLevelExists(classLevelId);
        return await this.repo.getClassArmById(classLevelId, id);
    }
    async updateClassArm(classLevelId, id, data) {
        const existing = await this.repo.getClassArmById(classLevelId, id);
        if (!existing)
            return null;
        if (data.name !== undefined) {
            const name = data.name.trim();
            await this.validateUniqueName(classLevelId, name, id);
            data = { ...data, name };
        }
        return await this.repo.updateClassArm(classLevelId, id, data);
    }
    async deleteClassArm(classLevelId, id) {
        return await this.repo.deleteClassArm(classLevelId, id);
    }
}
export const classArmService = new ClassArmService(classArmRepo, classLevelRepo);
