import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import type { IPaginatedResult } from "@/types/pagination.js";
import type {
  IPeriod,
  IPeriodCreate,
  IPeriodListQuery,
  IPeriodUpdate,
  IPeriodReorder,
} from "./period.interface.js";

export interface IPeriodRepo {
  createPeriod(data: IPeriodCreate): Promise<IPeriod>;
  findDuplicateSequence(
    schoolId: string,
    sequence: number,
    excludeId?: string,
  ): Promise<IPeriod | null>;
  getPeriods(query: IPeriodListQuery): Promise<IPaginatedResult<IPeriod>>;
  getPeriodById(id: string): Promise<IPeriod | null>;
  updatePeriod(id: string, data: IPeriodUpdate): Promise<IPeriod | null>;
  deletePeriod(id: string): Promise<boolean>;
  getActivePeriods(schoolId: string): Promise<IPeriod[]>;
  reorderPeriods(data: IPeriodReorder): Promise<IPeriod[]>;
}

const isNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2025";

export class PeriodRepo implements IPeriodRepo {
  async createPeriod(data: IPeriodCreate): Promise<IPeriod> {
    return await prisma.period.create({ data });
  }

  async findDuplicateSequence(
    schoolId: string,
    sequence: number,
    excludeId?: string,
  ): Promise<IPeriod | null> {
    return await prisma.period.findFirst({
      where: {
        schoolId,
        sequence,
        isActive: true,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async getPeriods(
    query: IPeriodListQuery,
  ): Promise<IPaginatedResult<IPeriod>> {
    const search = query.query?.trim();
    const where: Prisma.PeriodWhereInput = {
      schoolId: query.schoolId,
      ...(query.kind === undefined ? {} : { kind: query.kind }),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.period.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy as string]: query.sortOrder },
      }),
      prisma.period.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async getPeriodById(id: string): Promise<IPeriod | null> {
    return await prisma.period.findUnique({ where: { id } });
  }

  async updatePeriod(id: string, data: IPeriodUpdate): Promise<IPeriod | null> {
    try {
      return await prisma.period.update({ where: { id }, data });
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async deletePeriod(id: string): Promise<boolean> {
    try {
      await prisma.period.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }
  async getActivePeriods(schoolId: string): Promise<IPeriod[]> {
    return await prisma.period.findMany({
      where: { schoolId, isActive: true },
      orderBy: { sequence: "asc" },
    });
  }

  async reorderPeriods(data: IPeriodReorder): Promise<IPeriod[]> {
    return await prisma.$transaction(async (tx) => {
      const offset = data.periodIds.length + 1000;
      await tx.period.updateMany({
        where: { schoolId: data.schoolId, isActive: true },
        data: { sequence: { increment: offset } },
      });
      for (const [index, id] of data.periodIds.entries()) {
        await tx.period.update({
          where: { id },
          data: { sequence: index + 1 },
        });
      }
      return await tx.period.findMany({
        where: { schoolId: data.schoolId, isActive: true },
        orderBy: { sequence: "asc" },
      });
    });
  }
}

export const periodRepo = new PeriodRepo();
