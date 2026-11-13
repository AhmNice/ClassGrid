import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import type {
  IPeriodSchedule,
  IPeriodScheduleCreate,
  IPeriodScheduleUpdate,
} from "./schedule.interface.js";
import {
  IPeriodScheduleRepo,
  periodScheduleRepo,
} from "./schedule.repo.js";

export interface IPeriodScheduleService {
  create(data: IPeriodScheduleCreate): Promise<IPeriodSchedule>;
  list(schoolId: string): Promise<IPeriodSchedule[]>;
  findById(
    schoolId: string,
    scheduleId: string,
  ): Promise<IPeriodSchedule | null>;
  update(
    schoolId: string,
    scheduleId: string,
    data: IPeriodScheduleUpdate,
  ): Promise<IPeriodSchedule | null>;
  delete(schoolId: string, scheduleId: string): Promise<boolean>;
}

export class PeriodScheduleService implements IPeriodScheduleService {
  constructor(private readonly repo: IPeriodScheduleRepo) {}

  async create(data: IPeriodScheduleCreate): Promise<IPeriodSchedule> {
    const clean = normalize(data) as IPeriodScheduleCreate;
    await this.ensureNameAvailable(clean.schoolId, clean.name);
    this.validateDays(clean.applicableDays);
    return await this.repo.create(clean);
  }

  async list(schoolId: string): Promise<IPeriodSchedule[]> {
    return await this.repo.list(schoolId);
  }

  async findById(
    schoolId: string,
    scheduleId: string,
  ): Promise<IPeriodSchedule | null> {
    return await this.repo.findById(schoolId, scheduleId);
  }

  async update(
    schoolId: string,
    scheduleId: string,
    data: IPeriodScheduleUpdate,
  ): Promise<IPeriodSchedule | null> {
    const existing = await this.repo.findById(schoolId, scheduleId);
    if (!existing) return null;
    const clean = normalize(data) as IPeriodScheduleUpdate;
    if (Object.keys(clean).length === 0) {
      throw new ApiError(400, "At least one field is required");
    }
    if (clean.name) {
      await this.ensureNameAvailable(schoolId, clean.name, scheduleId);
    }
    if (clean.applicableDays) this.validateDays(clean.applicableDays);
    return await this.repo.update(schoolId, scheduleId, clean);
  }

  async delete(schoolId: string, scheduleId: string): Promise<boolean> {
    return await this.repo.delete(schoolId, scheduleId);
  }

  private async ensureNameAvailable(
    schoolId: string,
    name: IPeriodScheduleCreate["name"],
    excludeId?: string,
  ): Promise<void> {
    const duplicate = await this.repo.findByName(schoolId, name, excludeId);
    if (duplicate) {
      throw new ApiError(422, "A schedule with this name already exists");
    }
  }

  private validateDays(days: IPeriodScheduleCreate["applicableDays"]): void {
    if (new Set(days).size !== days.length) {
      throw new ApiError(422, "Applicable days must be unique");
    }
  }
}

export const periodScheduleService = new PeriodScheduleService(
  periodScheduleRepo,
);