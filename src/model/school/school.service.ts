import { ApiError } from "@/utils/errorHandler.js";
import { DayOfWeek, ISchoolWorkingDays } from "./school.interface.js";
import { schoolRepo } from "./school.repo.js";

export class SchoolService {
  async getWorkingDays(schoolId: string): Promise<ISchoolWorkingDays> {
    const school = await schoolRepo.getWorkingDays(schoolId);
    if (!school) throw new ApiError(404, "School not found");
    return school;
  }

  async updateWorkingDays(
    schoolId: string,
    workingDays: DayOfWeek[],
  ): Promise<ISchoolWorkingDays> {
    if (new Set(workingDays).size !== workingDays.length) {
      throw new ApiError(422, "Working days must be unique");
    }
    const school = await schoolRepo.updateWorkingDays(schoolId, workingDays);
    if (!school) throw new ApiError(404, "School not found");
    return school;
  }
}

export const schoolService = new SchoolService();
