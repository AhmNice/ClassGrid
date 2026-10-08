import { ApiError } from "@/utils/errorHandler.js";
import type { IPaginatedResult } from "@/types/pagination.js";
import type {
  ISubject,
  ISubjectCreate,
  ISubjectListQuery,
  ISubjectSchedulingRequirements,
  ISubjectUpdate,
} from "./subject.interface.js";
import { ISubjectRepo } from "./subject.repo.js";
import { normalize } from "@/utils/cleaner.js";

export interface ISubjectService {
  createSubject(data: ISubjectCreate): Promise<ISubject>;
  getSubjects(query: ISubjectListQuery): Promise<IPaginatedResult<ISubject>>;
  getSubjectById(id: string): Promise<ISubject | null>;
  updateSubject(id: string, data: ISubjectUpdate): Promise<ISubject | null>;
  updateSchedulingRequirements(
    id: string,
    data: ISubjectSchedulingRequirements,
  ): Promise<ISubject | null>;
  deleteSubject(id: string): Promise<boolean>;
}

export class SubjectService implements ISubjectService {
  constructor(private readonly repo: ISubjectRepo) {}

  private validateSchedulingRequirements(
    data: ISubjectSchedulingRequirements,
  ): void {
    const {
      defaultPeriodsPerWeek,
      defaultMaxPeriodsPerDay,
      defaultMaxConsecutive,
    } = data;
    if (
      defaultMaxPeriodsPerDay != null &&
      defaultPeriodsPerWeek != null &&
      defaultMaxPeriodsPerDay > defaultPeriodsPerWeek
    ) {
      throw new ApiError(
        422,
        "Maximum periods per day cannot exceed periods per week",
      );
    }
    if (
      defaultMaxConsecutive != null &&
      defaultMaxPeriodsPerDay != null &&
      defaultMaxConsecutive > defaultMaxPeriodsPerDay
    ) {
      throw new ApiError(
        422,
        "Maximum consecutive periods cannot exceed maximum periods per day",
      );
    }
    if (
      defaultMaxConsecutive != null &&
      defaultPeriodsPerWeek != null &&
      defaultMaxConsecutive > defaultPeriodsPerWeek
    ) {
      throw new ApiError(
        422,
        "Maximum consecutive periods cannot exceed periods per week",
      );
    }
  }

  private async ensureUnique(
    schoolId: string,
    name: string,
    code: string | null | undefined,
    currentId?: string,
  ): Promise<void> {
    const subjects = await this.repo.getSubjects({
      schoolId,
      query: undefined,
      isActive: undefined,
      page: 1,
      limit: 100,
      sortBy: "name",
      sortOrder: "asc",
    });
    const normalizedName = name.trim().toLowerCase();
    const normalizedCode = code?.trim().toLowerCase();
    if (
      subjects.items.some(
        (subject) =>
          subject.id !== currentId &&
          (subject.name.trim().toLowerCase() === normalizedName ||
            (normalizedCode !== undefined &&
              normalizedCode !== null &&
              subject.code?.trim().toLowerCase() === normalizedCode)),
      )
    ) {
      throw new ApiError(422, "Subject name or code already exists");
    }
  }

  async createSubject(data: ISubjectCreate): Promise<ISubject> {
    this.validateSchedulingRequirements(data);
    const clean = normalize(data) as ISubjectCreate;
    if (Object.keys(clean).length === 0) {
      throw new ApiError(400, "Subject data cannot be empty");
    }
    const duplicates = await this.repo.findDuplicate(clean.schoolId, {
      name: clean.name,
      code: clean.code ?? undefined,
    });
    if (duplicates) {
      throw new ApiError(422, "Subject name or code already exists");
    }
    return await this.repo.createSubject({
      ...data,
      name: clean.name,
      code: clean.code,
    });
  }

  async getSubjects(
    query: ISubjectListQuery,
  ): Promise<IPaginatedResult<ISubject>> {
    return await this.repo.getSubjects(query);
  }

  async getSubjectById(id: string): Promise<ISubject | null> {
    return await this.repo.getSubjectById(id);
  }

  async updateSubject(
    id: string,
    data: ISubjectUpdate,
  ): Promise<ISubject | null> {
    const existing = await this.repo.getSubjectById(id);
    if (!existing) return null;
    const name = data.name?.trim() ?? existing.name;
    const code =
      data.code === undefined ? existing.code : data.code?.trim() || null;
    this.validateSchedulingRequirements({
      defaultPeriodsPerWeek:
        data.defaultPeriodsPerWeek === undefined
          ? existing.defaultPeriodsPerWeek
          : data.defaultPeriodsPerWeek,
      defaultMaxPeriodsPerDay:
        data.defaultMaxPeriodsPerDay === undefined
          ? existing.defaultMaxPeriodsPerDay
          : data.defaultMaxPeriodsPerDay,
      defaultMaxConsecutive:
        data.defaultMaxConsecutive === undefined
          ? existing.defaultMaxConsecutive
          : data.defaultMaxConsecutive,
      defaultAllowConsecutive:
        data.defaultAllowConsecutive === undefined
          ? existing.defaultAllowConsecutive
          : data.defaultAllowConsecutive,
    });
    await this.ensureUnique(existing.schoolId, name, code, id);
    return await this.repo.updateSubject(id, { ...data, name, code });
  }

  async updateSchedulingRequirements(
    id: string,
    data: ISubjectSchedulingRequirements,
  ): Promise<ISubject | null> {
    const existing = await this.repo.getSubjectById(id);
    if (!existing) return null;
    const requirements = {
      defaultPeriodsPerWeek:
        data.defaultPeriodsPerWeek === undefined
          ? existing.defaultPeriodsPerWeek
          : data.defaultPeriodsPerWeek,
      defaultMaxPeriodsPerDay:
        data.defaultMaxPeriodsPerDay === undefined
          ? existing.defaultMaxPeriodsPerDay
          : data.defaultMaxPeriodsPerDay,
      defaultMaxConsecutive:
        data.defaultMaxConsecutive === undefined
          ? existing.defaultMaxConsecutive
          : data.defaultMaxConsecutive,
      defaultAllowConsecutive:
        data.defaultAllowConsecutive === undefined
          ? existing.defaultAllowConsecutive
          : data.defaultAllowConsecutive,
    };
    this.validateSchedulingRequirements(requirements);
    return await this.repo.updateSubject(id, requirements);
  }

  async deleteSubject(id: string): Promise<boolean> {
    return await this.repo.deleteSubject(id);
  }
}
