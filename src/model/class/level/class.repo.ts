import { prisma } from "@/lib/prisma.js";
import {
  IClassLevel,
  IClassLevelCreate,
  IClassLevelListQuery,
  IClassLevelUpdate,
} from "./class.interface.js";
import { IPaginatedResult } from "@/types/pagination.js";

export interface IClassLevelRepo {
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

export class ClassLevelRepo implements IClassLevelRepo {
  async createClassLevel(data: IClassLevelCreate): Promise<IClassLevel> {
    return await prisma.classLevel.create({ data });
  }
  async getClassLevels(
    schoolId: string,
    query: IClassLevelListQuery,
  ): Promise<IPaginatedResult<IClassLevel>> {
    const where = {
      schoolId,
      ...(query.query
        ? { name: { contains: query.query, mode: "insensitive" as const } }
        : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.stage === undefined ? {} : { stage: query.stage }),
    };
    const [items, total] = await prisma.$transaction([
      prisma.classLevel.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.classLevel.count({ where }),
    ]);
    return { items, total };
  }
  async getClassLevelById(id: string): Promise<IClassLevel | null> {
    return await prisma.classLevel.findUnique({ where: { id } });
  }
  async updateClassLevel(
    id: string,
    data: IClassLevelUpdate,
  ): Promise<IClassLevel | null> {
    return await prisma.classLevel.update({ where: { id }, data });
  }

  async deleteClassLevel(id: string): Promise<boolean> {
    await prisma.classLevel.delete({ where: { id } });
    return true;
  }
}
export const classLevelRepo = new ClassLevelRepo();
