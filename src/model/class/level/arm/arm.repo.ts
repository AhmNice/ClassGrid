import { prisma } from "@/lib/prisma.js";
import {
  IClassArm,
  IClassArmCreate,
  IClassArmListQuery,
  IClassArmUpdate,
} from "./arm.interface.js";
import { IPaginatedResult } from "@/types/pagination.js";

export interface IClassArmRepo {
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
export class ClassArmRepo implements IClassArmRepo {
  async createClassArm(data: IClassArmCreate): Promise<IClassArm> {
    return await prisma.classArm.create({ data });
  }

  async getClassArms(
    classLevelId: string,
    query: IClassArmListQuery,
  ): Promise<IPaginatedResult<IClassArm>> {
    const where = {
      classLevelId,
      ...(query.query
        ? { name: { contains: query.query, mode: "insensitive" as const } }
        : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
    };
    const [items, total] = await prisma.$transaction([
      prisma.classArm.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.classArm.count({ where }),
    ]);
    return { items, total };
  }

  async getClassArmById(
    classLevelId: string,
    id: string,
  ): Promise<IClassArm | null> {
    return await prisma.classArm.findFirst({ where: { id, classLevelId } });
  }

  async updateClassArm(
    classLevelId: string,
    id: string,
    data: IClassArmUpdate,
  ): Promise<IClassArm | null> {
    const result = await prisma.classArm.updateMany({
      where: { id, classLevelId },
      data,
    });
    if (result.count === 0) return null;
    return await this.getClassArmById(classLevelId, id);
  }

  async deleteClassArm(classLevelId: string, id: string): Promise<boolean> {
    const result = await prisma.classArm.deleteMany({
      where: { id, classLevelId },
    });
    return result.count > 0;
  }
}

export const classArmRepo = new ClassArmRepo();
