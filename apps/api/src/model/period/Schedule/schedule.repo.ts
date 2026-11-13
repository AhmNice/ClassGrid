import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import type {
  DayOfWeek,
  IPeriodSchedule,
  IPeriodScheduleCreate,
  IPeriodScheduleUpdate,
  PeriodScheduleKind,
} from "./schedule.interface.js";

export interface IPeriodScheduleRepo {
  create(data: IPeriodScheduleCreate): Promise<IPeriodSchedule>;
  list(schoolId: string): Promise<IPeriodSchedule[]>;
  findById(
    schoolId: string,
    scheduleId: string,
  ): Promise<IPeriodSchedule | null>;
  findByName(
    schoolId: string,
    name: PeriodScheduleKind,
    excludeId?: string,
  ): Promise<IPeriodSchedule | null>;
  update(
    schoolId: string,
    scheduleId: string,
    data: IPeriodScheduleUpdate,
  ): Promise<IPeriodSchedule | null>;
  delete(schoolId: string, scheduleId: string): Promise<boolean>;
}

const isNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2025";

export class PeriodScheduleRepo implements IPeriodScheduleRepo {
  async create(data: IPeriodScheduleCreate): Promise<IPeriodSchedule> {
    return await prisma.periodSchedule.create({
      data: {
        ...data,
        applicableDays: data.applicableDays as DayOfWeek[],
      },
    });
  }

  async list(schoolId: string): Promise<IPeriodSchedule[]> {
    return await prisma.periodSchedule.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
    });
  }

  async findById(
    schoolId: string,
    scheduleId: string,
  ): Promise<IPeriodSchedule | null> {
    return await prisma.periodSchedule.findFirst({
      where: { scheduleId, schoolId },
    });
  }

  async findByName(
    schoolId: string,
    name: PeriodScheduleKind,
    excludeId?: string,
  ): Promise<IPeriodSchedule | null> {
    return await prisma.periodSchedule.findFirst({
      where: {
        schoolId,
        name,
        ...(excludeId ? { NOT: { scheduleId: excludeId } } : {}),
      },
    });
  }

  async update(
    schoolId: string,
    scheduleId: string,
    data: IPeriodScheduleUpdate,
  ): Promise<IPeriodSchedule | null> {
    try {
      return await prisma.periodSchedule.update({
        where: { scheduleId },
        data: {
          ...data,
          applicableDays: data.applicableDays as
            | DayOfWeek[]
            | undefined,
        },
      });
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async delete(schoolId: string, scheduleId: string): Promise<boolean> {
    const result = await prisma.periodSchedule.deleteMany({
      where: { scheduleId, schoolId },
    });
    return result.count > 0;
  }
}

export const periodScheduleRepo = new PeriodScheduleRepo();
