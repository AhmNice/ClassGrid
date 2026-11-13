import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import {
  DayOfWeek,
  ICreateSchool,
  ISchool,
  ISchoolWorkingDays,
  IUpdateSchool,
} from "./school.interface.js";
import { schoolRepo } from "./school.repo.js";

export class SchoolService {
  async createSchool(data: ICreateSchool): Promise<ISchool> {
    const clean = normalize(data) as ICreateSchool;
    if (clean.workingDays) this.validateWorkingDays(clean.workingDays);
    return await schoolRepo.createSchool(clean);
  }

  async getSchools(): Promise<ISchool[]> {
    return await schoolRepo.getSchools();
  }

  async getSchoolById(schoolId: string): Promise<ISchool | null> {
    return await schoolRepo.getSchoolById(schoolId);
  }

  async updateSchool(
    schoolId: string,
    data: IUpdateSchool,
  ): Promise<ISchool | null> {
    const clean = normalize(data) as IUpdateSchool;
    if (Object.keys(clean).length === 0) {
      throw new ApiError(400, "At least one field is required");
    }
    if (clean.workingDays) this.validateWorkingDays(clean.workingDays);
    return await schoolRepo.updateSchool(schoolId, clean);
  }

  async deleteSchool(schoolId: string): Promise<boolean> {
    return await schoolRepo.deleteSchool(schoolId);
  }

  private validateWorkingDays(workingDays: DayOfWeek[]): void {
    if (new Set(workingDays).size !== workingDays.length) {
      throw new ApiError(422, "Working days must be unique");
    }
  }

  async getWorkingDays(schoolId: string): Promise<ISchoolWorkingDays> {
    const school = await schoolRepo.getWorkingDays(schoolId);
    if (!school) throw new ApiError(404, "School not found");
    return school;
  }

  async updateWorkingDays(
    schoolId: string,
    workingDays: DayOfWeek[],
  ): Promise<ISchoolWorkingDays> {
    this.validateWorkingDays(workingDays);
    const school = await schoolRepo.updateWorkingDays(schoolId, workingDays);
    if (!school) throw new ApiError(404, "School not found");
    return school;
  }
}

export const schoolService = new SchoolService();
