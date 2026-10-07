import { ApiError } from "@/utils/errorHandler.js";
import {
  IClassLevel,
  IClassLevelCreate,
  IClassLevelListQuery,
  IClassLevelUpdate,
} from "./class.interface.js";
import { IClassLevelRepo } from "./class.repo.js";
import { IPaginatedResult } from "@/types/pagination.js";

export interface IClassLevelService {
  createClassLevel(data: IClassLevelCreate): Promise<IClassLevel>;
  getClassLevels(
    schoolId: string,
    query: IClassLevelListQuery,
  ): Promise<IPaginatedResult<IClassLevel>>;
  getClassLevelById(id: string): Promise<IClassLevel | null>;
  updateClassLevel(
    id: string,
    data: IClassLevelUpdate,
  ): Promise<IClassLevel | null>;
  deleteClassLevel(id: string): Promise<boolean>;
}

export class ClassLevelService implements IClassLevelService {
  constructor(private readonly repo: IClassLevelRepo) {}

  private async validateClassLevelUniqueName(
    name: string,
    schoolId: string,
    currentId?: string,
  ): Promise<void> {
    const normalized = name.trim().toLowerCase();
    const classLevels = (
      await this.repo.getClassLevels(schoolId, {
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      })
    ).items;
    const isTaken = classLevels.some(
      (level) =>
        level.id !== currentId &&
        level.name.trim().toLowerCase() === normalized,
    );
    if (isTaken) {
      throw new ApiError(422, "Class level name already exists");
    }
  }

  async createClassLevel(data: IClassLevelCreate): Promise<IClassLevel> {
    const name = data.name.trim();
    await this.validateClassLevelUniqueName(name, data.schoolId);
    return await this.repo.createClassLevel({ ...data, name });
  }

  async getClassLevels(
    schoolId: string,
    query: IClassLevelListQuery,
  ): Promise<IPaginatedResult<IClassLevel>> {
    return await this.repo.getClassLevels(schoolId, query);
  }

  async getClassLevelById(id: string): Promise<IClassLevel | null> {
    return await this.repo.getClassLevelById(id);
  }

  async updateClassLevel(
    id: string,
    data: IClassLevelUpdate,
  ): Promise<IClassLevel | null> {
    if (data.name === undefined) {
      return await this.repo.updateClassLevel(id, data);
    }

    const existing = await this.repo.getClassLevelById(id);
    if (!existing) return null;

    const name = data.name.trim();
    await this.validateClassLevelUniqueName(name, existing.schoolId, id);
    return await this.repo.updateClassLevel(id, { ...data, name });
  }

  async deleteClassLevel(id: string): Promise<boolean> {
    return await this.repo.deleteClassLevel(id);
  }
}
