import { normalize } from "@/utils/cleaner.js";
import { ApiError } from "@/utils/errorHandler.js";
import type {
  BulkITeacherSubjectCreate,
  ITeacherSubjectCreate,
  ITeacherSubjectDetails,
  ITeacherSubjectListQuery,
} from "./teacher-subject.interface.js";
import {
  ITeacherSubjectRepo,
  teacherSubjectRepo,
} from "./teacher-subject.repo.js";

export class TeacherSubjectService {
  constructor(private readonly repo: ITeacherSubjectRepo) {}

  async assign(
    data: ITeacherSubjectCreate,
  ): Promise<ITeacherSubjectDetails> {
    return await this.assignWithRepo(this.repo, data);
  }

  private async assignWithRepo(
    repo: ITeacherSubjectRepo,
    data: ITeacherSubjectCreate,
  ): Promise<ITeacherSubjectDetails> {
    const clean = normalize(data) as ITeacherSubjectCreate;
    if (!clean.teacherId || !clean.subjectId || !clean.schoolId) {
      throw new ApiError(422, "Teacher, subject, and school are required");
    }
    if (
      !(await repo.validateTarget(
        clean.schoolId,
        clean.teacherId,
        clean.subjectId,
      ))
    ) {
      throw new ApiError(
        422,
        "Teacher and subject must be active records in the same school",
      );
    }
    if (
      await repo.findByPair(
        clean.schoolId,
        clean.teacherId,
        clean.subjectId,
      )
    ) {
      throw new ApiError(409, "Teacher is already assigned to this subject");
    }
    return await repo.create(clean);
  }

  async bulkUpdate(data: BulkITeacherSubjectCreate): Promise<void> {
    const clean = normalize(data) as BulkITeacherSubjectCreate;
    const { schoolId, additions, removals } = clean;
    if (!schoolId) {
      throw new ApiError(422, "School ID is required");
    }
    const cleanAdditions = normalize(additions) ;
    const cleanRemovals = normalize(removals);
    if (cleanAdditions.length === 0 && cleanRemovals.length === 0) {
      throw new ApiError(422, "At least one addition or removal is required");
    }
    await this.repo.transaction(async (txRepo) => {
      for (const item of cleanAdditions) {
        await this.assignWithRepo(txRepo, {
          schoolId,
          teacherId: item.teacherId,
          subjectId: item.subjectId,
        });
      }

      for (const item of cleanRemovals) {
        const existing = await txRepo.findByPair(
          schoolId,
          item.teacherId,
          item.subjectId,
        );
        if (existing) await txRepo.delete(schoolId, existing.id);
      }
    });
  }
  async list(
    schoolId: string,
    query: ITeacherSubjectListQuery,
  ): Promise<ITeacherSubjectDetails[]> {
    return await this.repo.list(schoolId, query);
  }

  async get(
    schoolId: string,
    id: string,
  ): Promise<ITeacherSubjectDetails | null> {
    return await this.repo.findById(schoolId, id);
  }

  async remove(schoolId: string, id: string): Promise<boolean> {
    return await this.repo.delete(schoolId, id);
  }
}

export const teacherSubjectService = new TeacherSubjectService(
  teacherSubjectRepo,
);
