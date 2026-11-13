import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import type { IListQuery, IPaginatedResult } from "@/types/pagination.js";
import type {
  ITeacher,
  ITeacherCreate,
  ITeacherUpdate,
} from "./teacher.interface.js";

export interface ITeacherRepo {
  createTeacher(data: ITeacherCreate): Promise<ITeacher>;
  getTeachers(query: IListQuery): Promise<IPaginatedResult<ITeacher>>;
  findDuplicate(
    schoolId: string,
    fields: { email?: string; staffCode?: string },
    excludeId?: string,
  ): Promise<ITeacher | null>;
  getTeacherById(id: string): Promise<ITeacher | null>;
  updateTeacher(id: string, data: ITeacherUpdate): Promise<ITeacher | null>;
  deleteTeacher(id: string): Promise<boolean>;
}

const isNotFound = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";

export class TeacherRepo implements ITeacherRepo {
  async createTeacher(data: ITeacherCreate): Promise<ITeacher> {
    return await prisma.teacher.create({ data });
  }

  async getTeachers(query: IListQuery): Promise<IPaginatedResult<ITeacher>> {
    const search = query.query?.trim();

    const where: Prisma.TeacherWhereInput = search
      ? {
          OR: (
            ["firstName", "lastName", "email", "phone", "staffCode"] as const
          ).map((field) => ({
            [field]: { contains: search, mode: "insensitive" as const },
          })),
        }
      : {};

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await prisma.$transaction([
      prisma.teacher.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
      }),
      prisma.teacher.count({ where }),
    ]);

    return { items: data, total, page, limit };
  }

  async getTeacherById(id: string): Promise<ITeacher | null> {
    return await prisma.teacher.findUnique({ where: { id } });
  }

  async updateTeacher(
    id: string,
    data: ITeacherUpdate,
  ): Promise<ITeacher | null> {
    try {
      return await prisma.teacher.update({ where: { id }, data });
    } catch (e) {
      if (isNotFound(e)) return null;
      throw e;
    }
  }
  async findDuplicate(
    schoolId: string,
    fields: { email?: string; staffCode?: string },
    excludeId?: string,
  ) {
    const conditions: Prisma.TeacherWhereInput[] = [];
    if (fields.email)
      conditions.push({ email: { equals: fields.email, mode: "insensitive" } });
    if (fields.staffCode)
      conditions.push({
        staffCode: { equals: fields.staffCode, mode: "insensitive" },
      });
    if (conditions.length === 0) return null;

    return await prisma.teacher.findFirst({
      where: {
        schoolId,
        OR: conditions,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }
  async deleteTeacher(id: string): Promise<boolean> {
    try {
      await prisma.teacher.delete({ where: { id } });
      return true;
    } catch (e) {
      if (isNotFound(e)) return false;
      throw e;
    }
  }
}
