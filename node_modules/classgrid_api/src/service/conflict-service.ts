import { ITimetableEntry } from "@/model/timetable/entry/timetable-entry.interface.js";
import { ITimetableEntryRepo } from "@/model/timetable/entry/timetabel-entry.repo.js";

export interface ConflictDetail {
  type: "TEACHER_CLASH" | "ROOM_CLASH" | "CLASS_CLASH";
  message: string;
  conflictingEntry: ITimetableEntry;
}

export class TimetableConflictService {
  constructor(private readonly repo: ITimetableEntryRepo) {}

  /**
   * Checks for class arm, teacher, and room clashes within a timetable slot.
   */
  async detectConflicts(
    timetableId: string,
    dayOfWeek: string,
    periodId: string,
    classArmId: string,
    teacherId: string,
    roomId?: string | null,
    excludeEntryId?: string,
  ): Promise<ConflictDetail[]> {
    const conflicts: ConflictDetail[] = [];

    // Fetch all entries for this specific day and period in the timetable
    const entriesInSlot = await this.repo.getEntriesByDayAndPeriod(
      timetableId,
      dayOfWeek,
      periodId,
    );

    for (const entry of entriesInSlot) {
      if (excludeEntryId && entry.id === excludeEntryId) continue;

      // 1. Check Class Arm Clash (Class cannot attend two lessons in one slot)
      if (entry.classArmId === classArmId) {
        conflicts.push({
          type: "CLASS_CLASH",
          message: `Class arm is already scheduled for another lesson during this period.`,
          conflictingEntry: entry,
        });
      }

      // 2. Check Teacher Clash (Teacher cannot teach two lessons in one slot)
      if (entry.teacherId === teacherId) {
        conflicts.push({
          type: "TEACHER_CLASH",
          message: `Teacher is already assigned to another class during this period.`,
          conflictingEntry: entry,
        });
      }

      // 3. Check Room Clash (Room cannot host two lessons in one slot)
      if (roomId && entry.roomId === roomId) {
        conflicts.push({
          type: "ROOM_CLASH",
          message: `Room is already booked for another lesson during this period.`,
          conflictingEntry: entry,
        });
      }
    }

    return conflicts;
  }
}
