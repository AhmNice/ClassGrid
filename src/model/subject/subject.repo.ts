import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import type { IPaginatedResult } from "@/types/pagination.js";
import type {
  ISubject,
  ISubjectCreate,
  ISubjectListQuery,
  ISubjectUpdate,
} from "./subject.interface.js";

export interface ISubjectRepo {
  createSubject(data: ISubjectCreate): Promise<ISubject>;
  findDuplicate(
    schoolId: string,
    fields: { name?: string; code?: string },
    excludeId?: string,
  ): Promise<ISubject | null>;
  getSubjects(query: ISubjectListQuery): Promise<IPaginatedResult<ISubject>>;
  getSubjectById(id: string): Promise<ISubject | null>;
  updateSubject(id: string, data: ISubjectUpdate): Promise<ISubject | null>;
  deleteSubject(id: string): Promise<boolean>;
}

const isNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2025";

export class SubjectRepo implements ISubjectRepo {
  async createSubject(data: ISubjectCreate): Promise<ISubject> {
    return await prisma.subject.create({ data });
  }
  async findDuplicate(
    schoolId: string,
    fields: { name?: string; code?: string },
    excludeId?: string,
  ): Promise<ISubject | null> {
    const conditions: Prisma.SubjectWhereInput[] = [];
    if (fields.name) {
      conditions.push({
        name: { equals: fields.name, mode: "insensitive" },
      });
    }
    if (fields.code) {
      conditions.push({
        code: { equals: fields.code, mode: "insensitive" },
      });
    }
    if (conditions.length === 0) return null;
    return await prisma.subject.findFirst({
      where: {
        schoolId,
        OR: conditions,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }
  async getSubjects(
    query: ISubjectListQuery,
  ): Promise<IPaginatedResult<ISubject>> {
    const search = query.query?.trim();
    const where: Prisma.SubjectWhereInput = {
      schoolId: query.schoolId,
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.subject.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy as string]: query.sortOrder },
      }),
      prisma.subject.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async getSubjectById(id: string): Promise<ISubject | null> {
    return await prisma.subject.findUnique({ where: { id } });
  }

  async updateSubject(
    id: string,
    data: ISubjectUpdate,
  ): Promise<ISubject | null> {
    try {
      return await prisma.subject.update({ where: { id }, data });
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<boolean> {
    try {
      await prisma.subject.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }
}
