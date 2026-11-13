import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import { DayOfWeek as PrismaDayOfWeek } from "@/generated/prisma/enums.js";
import {
  DayOfWeek,
  ICreateSchool,
  ISchool,
  ISchoolRepo,
  ISchoolWorkingDays,
  IUpdateSchool,
} from "./school.interface.js";

const isNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2025";

class SchoolRepository implements ISchoolRepo {
  async createSchool(data: ICreateSchool): Promise<ISchool> {
    return await prisma.school.create({
      data: {
        ...data,
        workingDays: data.workingDays as PrismaDayOfWeek[] | undefined,
      },
    });
  }

  async getSchools(): Promise<ISchool[]> {
    return await prisma.school.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getSchoolById(schoolId: string): Promise<ISchool | null> {
    return await prisma.school.findUnique({ where: { id: schoolId } });
  }

  async updateSchool(
    schoolId: string,
    data: IUpdateSchool,
  ): Promise<ISchool | null> {
    try {
      return await prisma.school.update({
        where: { id: schoolId },
        data: {
          ...data,
          workingDays: data.workingDays as PrismaDayOfWeek[] | undefined,
        },
      });
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async deleteSchool(schoolId: string): Promise<boolean> {
    try {
      await prisma.school.delete({ where: { id: schoolId } });
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }

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

export const schoolRepo = new SchoolRepository();
