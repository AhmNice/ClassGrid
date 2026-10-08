import { ApiError } from "@/utils/errorHandler.js";
import { prisma } from "@/lib/prisma.js";
import {
  ITeacherAvailability,
  ITeacherAvailabilityCreate,
  ITeacherAvailabilityUpdate,
} from "./availability.interface.js";
import {
  ITeacherAvailabilityRepo,
  teacherAvailabilityRepo,
} from "./availability.repo.js";
import { ITeacherRepo, TeacherRepo } from "./teacher.repo.js";

export interface ITeacherAvailabilityService {
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

export class TeacherAvailabilityService implements ITeacherAvailabilityService {
  constructor(
    private readonly repo: ITeacherAvailabilityRepo,
    private readonly teacherRepo: ITeacherRepo,
  ) {}

  private async ensureValidPeriod(
    teacherId: string,
    periodId: string,
  ): Promise<void> {
    const teacher = await this.teacherRepo.getTeacherById(teacherId);
    if (!teacher) throw new ApiError(404, "Teacher not found");

    const period = await prisma.period.findFirst({
      where: {
        id: periodId,
        schoolId: teacher.schoolId,
        kind: "LESSON",
        isActive: true,
      },
    });
    if (!period) {
      throw new ApiError(
        422,
        "Period must be an active lesson period for the teacher's school",
      );
    }
  }

  private async ensureUniqueSlot(
    teacherId: string,
    dayOfWeek: string,
    periodId: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.repo.list(teacherId);
    if (
      existing.some(
        (item) =>
          item.id !== currentId &&
          item.dayOfWeek === dayOfWeek &&
          item.periodId === periodId,
      )
    ) {
      throw new ApiError(
        422,
        "Teacher availability is already configured for this day and period",
      );
    }
  }

  async create(
    data: ITeacherAvailabilityCreate,
  ): Promise<ITeacherAvailability> {
    await this.ensureValidPeriod(data.teacherId, data.periodId);
    await this.ensureUniqueSlot(data.teacherId, data.dayOfWeek, data.periodId);
    return await this.repo.create(data);
  }

  async list(teacherId: string): Promise<ITeacherAvailability[]> {
    const teacher = await this.teacherRepo.getTeacherById(teacherId);
    if (!teacher) throw new ApiError(404, "Teacher not found");
    return await this.repo.list(teacherId);
  }

  async findById(
    teacherId: string,
    id: string,
  ): Promise<ITeacherAvailability | null> {
    return await this.repo.findById(teacherId, id);
  }

  async update(
    teacherId: string,
    id: string,
    data: ITeacherAvailabilityUpdate,
  ): Promise<ITeacherAvailability | null> {
    const existing = await this.repo.findById(teacherId, id);
    if (!existing) return null;
    if (data.periodId) await this.ensureValidPeriod(teacherId, data.periodId);
    await this.ensureUniqueSlot(
      teacherId,
      data.dayOfWeek ?? existing.dayOfWeek,
      data.periodId ?? existing.periodId,
      id,
    );
    return await this.repo.update(teacherId, id, data);
  }

  async delete(teacherId: string, id: string): Promise<boolean> {
    return await this.repo.delete(teacherId, id);
  }
}

export const teacherAvailabilityService = new TeacherAvailabilityService(
  teacherAvailabilityRepo,
  new TeacherRepo(),
);
