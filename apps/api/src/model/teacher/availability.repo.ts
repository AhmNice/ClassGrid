import { prisma } from "@/lib/prisma.js";
import {
  ITeacherAvailability,
  ITeacherAvailabilityCreate,
  ITeacherAvailabilityUpdate,
} from "./availability.interface.js";

export interface ITeacherAvailabilityRepo {
  create(data: ITeacherAvailabilityCreate): Promise<ITeacherAvailability>;
  list(teacherId: string): Promise<ITeacherAvailability[]>;
  findById(teacherId: string, id: string): Promise<ITeacherAvailability | null>;
  update(
    teacherId: string,
    id: string,
    data: ITeacherAvailabilityUpdate,
  ): Promise<ITeacherAvailability | null>;
  delete(teacherId: string, id: string): Promise<boolean>;
}

export class TeacherAvailabilityRepo implements ITeacherAvailabilityRepo {
  async create(
    data: ITeacherAvailabilityCreate,
  ): Promise<ITeacherAvailability> {
    return await prisma.teacherAvailability.create({ data });
  }

  async list(teacherId: string): Promise<ITeacherAvailability[]> {
    return await prisma.teacherAvailability.findMany({
      where: { teacherId },
      orderBy: [{ dayOfWeek: "asc" }, { period: { sequence: "asc" } }],
    });
  }

  async findById(
    teacherId: string,
    id: string,
  ): Promise<ITeacherAvailability | null> {
    return await prisma.teacherAvailability.findFirst({
      where: { id, teacherId },
    });
  }

  async update(
    teacherId: string,
    id: string,
    data: ITeacherAvailabilityUpdate,
  ): Promise<ITeacherAvailability | null> {
    const result = await prisma.teacherAvailability.updateMany({
      where: { id, teacherId },
      data,
    });
    if (result.count === 0) return null;
    return await this.findById(teacherId, id);
  }

  async delete(teacherId: string, id: string): Promise<boolean> {
    const result = await prisma.teacherAvailability.deleteMany({
      where: { id, teacherId },
    });
    return result.count > 0;
  }
}

export const teacherAvailabilityRepo = new TeacherAvailabilityRepo();
