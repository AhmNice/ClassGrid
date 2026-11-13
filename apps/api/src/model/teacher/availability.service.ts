import { ApiError } from "@/utils/errorHandler.js";
import { prisma } from "@/lib/prisma.js";
import {
  ITeacherAvailability,
  ITeacherAvailabilityCreate,
  ITeacherAvailabilityUpdate,
  DayOfWeek,
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

  private async ensureValidSlot(
    teacherId: string,
    dayOfWeek: DayOfWeek,
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
      include: {
        periodSchedule: {
          select: { applicableDays: true, isActive: true },
        },
      },
    });
    if (!period) {
      throw new ApiError(
        422,
        "Period must be an active lesson period for the teacher's school",
      );
    }
    if (
      !period.periodSchedule ||
      !period.periodSchedule.isActive ||
      !period.periodSchedule.applicableDays.includes(dayOfWeek)
    ) {
      throw new ApiError(
        422,
        "Period schedule does not apply to the selected day",
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
    await this.ensureValidSlot(
      data.teacherId,
      data.dayOfWeek,
      data.periodId,
    );
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
    await this.ensureValidSlot(
      teacherId,
      data.dayOfWeek ?? existing.dayOfWeek,
      data.periodId ?? existing.periodId,
    );
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
