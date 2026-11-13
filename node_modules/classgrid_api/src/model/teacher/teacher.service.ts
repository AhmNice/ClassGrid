import type { IListQuery, IPaginatedResult } from "@/types/pagination.js";
import type {
  ITeacher,
  ITeacherCreate,
  ITeacherUpdate,
} from "./teacher.interface.js";
import type { ITeacherRepo } from "./teacher.repo.js";
import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";

export interface ITeacherService {
  createTeacher(data: ITeacherCreate): Promise<ITeacher>;
  getTeachers(query: IListQuery): Promise<IPaginatedResult<ITeacher>>;
  getTeacherById(id: string): Promise<ITeacher | null>;
  updateTeacher(id: string, data: ITeacherUpdate): Promise<ITeacher | null>;
  deleteTeacher(id: string): Promise<boolean>;
}

export class TeacherService implements ITeacherService {
  constructor(private readonly repo: ITeacherRepo) {}

  async createTeacher(data: ITeacherCreate): Promise<ITeacher> {
    const clean = normalize(data) as ITeacherCreate;
    if (Object.keys(clean).length === 0) {
      throw new ApiError(400, "Teacher data cannot be empty");
    }
    const duplicate = await this.repo.findDuplicate(clean.schoolId, {
      email: clean.email,
      staffCode: clean.staffCode,
    });
    if (duplicate) {
      throw new ApiError(
        409,
        "A teacher with this email or staff code already exists",
      );
    }
    return await this.repo.createTeacher(clean);
  }

  async getTeachers(query: IListQuery): Promise<IPaginatedResult<ITeacher>> {
    return await this.repo.getTeachers(query);
  }

  async getTeacherById(id: string): Promise<ITeacher | null> {
    return await this.repo.getTeacherById(id);
  }

  async updateTeacher(
    id: string,
    data: ITeacherUpdate,
  ): Promise<ITeacher | null> {
    const clean = normalize(data) as ITeacherUpdate;
    if (Object.keys(clean).length === 0) {
      throw new ApiError(400, "No fields to update");
    }
    return await this.repo.updateTeacher(id, clean);
  }

  async deleteTeacher(id: string): Promise<boolean> {
    return await this.repo.deleteTeacher(id);
  }
}
