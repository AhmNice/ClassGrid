import { normalize } from "@/utils/cleaner.js";
import {
  ITimetable,
  ITimetableCreate,
  ITimetableListQuery,
  ITimetableListItem,
  ITimetableUpdate,
} from "./timetable.interface.js";
import { ITimeTableRepo } from "./timetable.repo.js";
import { ITermRepo } from "../academic-session/term/term.repo.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ITeachingAssignmentRepo } from "@/model/assignment/teacher/teachingAssignment.repo.js";
import { TimetableValidationService } from "@/service/timetable-validation.service.js";

export interface ITimetableService {
  createTimetable(data: ITimetableCreate): Promise<ITimetable>;
  getTimetables(query: ITimetableListQuery): Promise<ITimetableListItem[]>;
  updateDraftTimetable(id: string, data: ITimetableUpdate): Promise<ITimetable>;
  publishTimetable(id: string): Promise<ITimetable>;
  archiveTimetable(id: string): Promise<ITimetable>;
  duplicateTimetable(id: string, newName: string): Promise<ITimetable>;
}

export class TimetableService implements ITimetableService {
  constructor(
    private readonly repo: ITimeTableRepo,
    private readonly termRepo: ITermRepo,
    private readonly allocationRepo: ITeachingAssignmentRepo,
    private readonly validationService: TimetableValidationService,
  ) {}

  async createTimetable(data: ITimetableCreate): Promise<ITimetable> {
    const cleanData = normalize(data) as ITimetableCreate;

    const termInfo = await this.termRepo.getTermSchoolIdSessionId(
      cleanData.termId,
    );

    if (!termInfo || !termInfo.sessionId || !termInfo.schoolId) {
      throw new ApiError(404, "Associated academic term or school not found");
    }

    return await this.repo.create(cleanData);
  }

  async getTimetables(
    query: ITimetableListQuery,
  ): Promise<ITimetableListItem[]> {
    return await this.repo.findMany(query);
  }

  async duplicateTimetable(id: string, newName: string): Promise<ITimetable> {
    const isEligible = await this.repo.isValidTargetForDuplication(id);
    if (!isEligible) {
      throw new ApiError(
        400,
        "Timetable is not eligible for duplication (must be published)",
      );
    }

    return await this.repo.transaction((transactionRepo) =>
      transactionRepo.duplicate(id, newName),
    );
  }

  async updateDraftTimetable(
    id: string,
    data: ITimetableUpdate,
  ): Promise<ITimetable> {
    const timetable = await this.repo.findById(id);
    if (!timetable) throw new ApiError(404, "Timetable not found");
    if (timetable.status !== "DRAFT") {
      throw new ApiError(409, "Only draft timetables can be modified");
    }

    const cleanData = normalize(data) as ITimetableUpdate;
    if (!cleanData.name) {
      throw new ApiError(422, "Timetable name cannot be empty");
    }
    return await this.repo.update(id, cleanData);
  }

  async publishTimetable(id: string): Promise<ITimetable> {
    const timetable = await this.repo.findById(id);
    if (!timetable) throw new ApiError(404, "Timetable not found");
    if (timetable.status !== "DRAFT") {
      throw new ApiError(409, "Only draft timetables can be published");
    }

    const term = await this.termRepo.findUnique(timetable.termId);
    if (!term) throw new ApiError(404, "Associated academic term not found");
    if (!term.sessionId)
      throw new ApiError(404, "Associated academic session not found");

    // 1. Fetch teaching assignments for curriculum/quota validation
    const allocations =
      await this.allocationRepo.getTeachingAssignmentBySession(term.sessionId);

    // 2. Run validation check before publishing (CLASSGRID-3.37)
    const validationSummary = await this.validationService.validateTimetable(
      id,
      allocations,
    );
    if (!validationSummary.isValid) {
      throw new ApiError(
        422,
        JSON.stringify({
          message:
            "Timetable validation failed. Cannot publish invalid timetable.",
          errors: validationSummary.errors,
        }),
      );
    }

    return await this.repo.transaction(async (transactionRepo) => {
      const current = await transactionRepo.findById(id);
      if (!current) throw new ApiError(404, "Timetable not found");

      const published = await transactionRepo.findPublishedByTerm(
        current.termId,
      );
      if (published && published.id !== id) {
        await transactionRepo.markAsArchived(published.id);
      }

      const result = await transactionRepo.markAsPublished(id);
      if (!result) throw new ApiError(404, "Timetable not found");
      return result;
    });
  }

  async archiveTimetable(id: string): Promise<ITimetable> {
    const timetable = await this.repo.findById(id);
    if (!timetable) throw new ApiError(404, "Timetable not found");
    if (timetable.status === "ARCHIVED") {
      throw new ApiError(409, "Timetable is already archived");
    }
    if (timetable.status === "DRAFT") {
      throw new ApiError(409, "Draft timetables cannot be archived");
    }

    const result = await this.repo.markAsArchived(id);
    if (!result) throw new ApiError(404, "Timetable not found");
    return result;
  }
}
