import { ApiError } from "@/utils/errorHandler.js";
import { IClassLevelRepo, classLevelRepo } from "../class.repo.js";
import {
  IClassArm,
  IClassArmCreate,
  IClassArmListQuery,
  IClassArmUpdate,
} from "./arm.interface.js";
import { IClassArmRepo, classArmRepo } from "./arm.repo.js";
import { IPaginatedResult } from "@/types/pagination.js";

export interface IClassArmService {
  createClassArm(data: IClassArmCreate): Promise<IClassArm>;
  getClassArms(
    classLevelId: string,
    query: IClassArmListQuery,
  ): Promise<IPaginatedResult<IClassArm>>;
  getClassArmById(classLevelId: string, id: string): Promise<IClassArm | null>;
  updateClassArm(
    classLevelId: string,
    id: string,
    data: IClassArmUpdate,
  ): Promise<IClassArm | null>;
  deleteClassArm(classLevelId: string, id: string): Promise<boolean>;
}

export class ClassArmService implements IClassArmService {
  constructor(
    private readonly repo: IClassArmRepo,
    private readonly classLevelRepo: IClassLevelRepo,
  ) {}

  private async ensureClassLevelExists(classLevelId: string): Promise<void> {
    if (!(await this.classLevelRepo.getClassLevelById(classLevelId))) {
      throw new ApiError(404, "Class level not found");
    }
  }

  private async validateUniqueName(
    classLevelId: string,
    name: string,
    currentId?: string,
  ): Promise<void> {
    const normalized = name.trim().toLowerCase();
    const arms = (
      await this.repo.getClassArms(classLevelId, {
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      })
    ).items;
    if (
      arms.some(
        (arm) =>
          arm.id !== currentId && arm.name.trim().toLowerCase() === normalized,
      )
    ) {
      throw new ApiError(422, "Class arm name already exists");
    }
  }

  async createClassArm(data: IClassArmCreate): Promise<IClassArm> {
    await this.ensureClassLevelExists(data.classLevelId);
    const name = data.name.trim();
    await this.validateUniqueName(data.classLevelId, name);
    return await this.repo.createClassArm({ ...data, name });
  }

  async getClassArms(
    classLevelId: string,
    query: IClassArmListQuery,
  ): Promise<IPaginatedResult<IClassArm>> {
    await this.ensureClassLevelExists(classLevelId);
    return await this.repo.getClassArms(classLevelId, query);
  }

  async getClassArmById(
    classLevelId: string,
    id: string,
  ): Promise<IClassArm | null> {
    await this.ensureClassLevelExists(classLevelId);
    return await this.repo.getClassArmById(classLevelId, id);
  }

  async updateClassArm(
    classLevelId: string,
    id: string,
    data: IClassArmUpdate,
  ): Promise<IClassArm | null> {
    const existing = await this.repo.getClassArmById(classLevelId, id);
    if (!existing) return null;

    if (data.name !== undefined) {
      const name = data.name.trim();
      await this.validateUniqueName(classLevelId, name, id);
      data = { ...data, name };
    }
    return await this.repo.updateClassArm(classLevelId, id, data);
  }

  async deleteClassArm(classLevelId: string, id: string): Promise<boolean> {
    return await this.repo.deleteClassArm(classLevelId, id);
  }
}

export const classArmService = new ClassArmService(
  classArmRepo,
  classLevelRepo,
);
