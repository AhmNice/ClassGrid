import { prisma } from "@/lib/prisma.js";
import { DayOfWeek as PrismaDayOfWeek } from "@/generated/prisma/enums.js";
import {
  DayOfWeek,
  ICreateSchool,
  ISchoolWorkingDays,
} from "./school.interface.js";

class _SchoolRepository {
  createSchool(_schoolData: ICreateSchool) {}

  async getWorkingDays(schoolId: string): Promise<ISchoolWorkingDays | null> {
    return await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, workingDays: true },
    });
  }

  async updateWorkingDays(
    schoolId: string,
    workingDays: DayOfWeek[],
  ): Promise<ISchoolWorkingDays | null> {
    const result = await prisma.school.updateMany({
      where: { id: schoolId },
      data: { workingDays: workingDays as PrismaDayOfWeek[] },
    });
    if (result.count === 0) return null;
    return await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, workingDays: true },
    });
  }
}

export const schoolRepo = new _SchoolRepository();
