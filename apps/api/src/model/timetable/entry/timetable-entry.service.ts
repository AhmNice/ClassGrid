import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import { Prisma } from "@/generated/prisma/client.js";
import type {
  ITimetableEntry,
  ITimetableEntryCreate,
  ITimetableEntryUpdate,
} from "./timetable-entry.interface.js";
import type { ITimetableEntryRepo } from "./timetabel-entry.repo.js";
import type { ITimeTableRepo } from "../timetable.repo.js";

export interface ITimetableEntryService {
  createEntry(
    data: ITimetableEntryCreate,
    resolvedAssignment: { classArmId: string; teacherId: string },
  ): Promise<ITimetableEntry>;
  updateEntry(
    entryId: string,
    data: ITimetableEntryUpdate,
  ): Promise<ITimetableEntry>;
  deleteEntry(entryId: string): Promise<ITimetableEntry>;
  assignRoom(entryId: string, roomId: string): Promise<ITimetableEntry>;
  getWeeklyEntries(timetableId: string): Promise<ITimetableEntry[]>;
  getClassWeeklyEntries(
    timetableId: string,
    classArmId: string,
  ): Promise<ITimetableEntry[]>;
  getTeacherWeeklyEntries(
    timetableId: string,
    teacherId: string,
  ): Promise<ITimetableEntry[]>;
  getRoomWeeklyEntries(
    timetableId: string,
    roomId: string,
  ): Promise<ITimetableEntry[]>;
}

export class TimetableEntryService implements ITimetableEntryService {
  constructor(
    private readonly repo: ITimetableEntryRepo,
    private readonly timetableRepo: ITimeTableRepo,
  ) {}

  private async ensureTimetable(timetableId: string): Promise<void> {
    const timetable = await this.timetableRepo.findById(timetableId);
    if (!timetable) throw new ApiError(404, "Timetable not found");
  }

  private async ensureDraftTimetable(timetableId: string): Promise<void> {
    const timetable = await this.timetableRepo.findById(timetableId);
    if (!timetable) throw new ApiError(404, "Timetable not found");
    if (timetable.status !== "DRAFT") {
      throw new ApiError(409, "Only draft timetables can be modified");
    }
  }

  private async ensureDraftEntry(entryId: string): Promise<void> {
    const entry = await this.repo.findById(entryId);
    if (!entry) throw new ApiError(404, "Timetable entry not found");
    await this.ensureDraftTimetable(entry.timetableId);
  }

  private handleDbClashError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = String(error.meta?.target ?? "");
      if (target.includes("uq_entry_class_clash")) {
        throw new ApiError(409, "Class cannot have two lessons in one slot");
      }
      if (target.includes("uq_entry_teacher_clash")) {
        throw new ApiError(409, "Teacher cannot teach two lessons in one slot");
      }
      if (target.includes("uq_entry_room_clash")) {
        throw new ApiError(409, "Room cannot host two lessons in one slot");
      }
    }
    throw error;
  }

  /**
   * Create entry resolving classArmId and teacherId securely from the Teaching Assignment.
   */
  async createEntry(
    data: ITimetableEntryCreate,
    resolvedAssignment: { classArmId: string; teacherId: string },
  ): Promise<ITimetableEntry> {
    const cleanData = normalize(data) as ITimetableEntryCreate;
    if (
      !cleanData.timetableId ||
      !cleanData.periodId ||
      !cleanData.assignmentId ||
      !cleanData.dayOfWeek
    ) {
      throw new ApiError(422, "Required timetable entry fields are missing");
    }

    await this.ensureDraftTimetable(cleanData.timetableId);

    try {
      return await this.repo.create({
        ...cleanData,
        classArmId: resolvedAssignment.classArmId,
        teacherId: resolvedAssignment.teacherId,
      });
    } catch (error) {
      this.handleDbClashError(error);
    }
  }

  async updateEntry(
    entryId: string,
    data: ITimetableEntryUpdate,
  ): Promise<ITimetableEntry> {
    const cleanData = normalize(data) as ITimetableEntryUpdate;
    if (Object.keys(cleanData).length === 0) {
      throw new ApiError(400, "At least one field is required");
    }

    await this.ensureDraftEntry(entryId);

    try {
      return await this.repo.update(entryId, cleanData);
    } catch (error) {
      this.handleDbClashError(error);
    }
  }

  async deleteEntry(entryId: string): Promise<ITimetableEntry> {
    await this.ensureDraftEntry(entryId);
    return this.repo.delete(entryId);
  }

  async assignRoom(entryId: string, roomId: string): Promise<ITimetableEntry> {
    if (!roomId || !roomId.trim()) {
      throw new ApiError(422, "Room ID cannot be empty");
    }
    await this.ensureDraftEntry(entryId);
    try {
      return await this.repo.update(entryId, { roomId });
    } catch (error) {
      this.handleDbClashError(error);
    }
  }

  async getWeeklyEntries(timetableId: string): Promise<ITimetableEntry[]> {
    await this.ensureTimetable(timetableId);
    return this.repo.getWeeklyEntries(timetableId);
  }

  async getClassWeeklyEntries(
    timetableId: string,
    classArmId: string,
  ): Promise<ITimetableEntry[]> {
    await this.ensureTimetable(timetableId);
    return this.repo.getClassWeeklyEntries(timetableId, classArmId);
  }

  async getTeacherWeeklyEntries(
    timetableId: string,
    teacherId: string,
  ): Promise<ITimetableEntry[]> {
    await this.ensureTimetable(timetableId);
    return this.repo.getTeacherWeeklyEntries(timetableId, teacherId);
  }

  async getRoomWeeklyEntries(
    timetableId: string,
    roomId: string,
  ): Promise<ITimetableEntry[]> {
    await this.ensureTimetable(timetableId);
    return this.repo.getRoomWeeklyEntries(timetableId, roomId);
  }
}
