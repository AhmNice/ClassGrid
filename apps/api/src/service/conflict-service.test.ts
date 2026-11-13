import { TimetableConflictService } from "./conflict-service.js";
import type { ITimetableEntryRepo } from "@/model/timetable/entry/timetabel-entry.repo.js";
import type { ITimetableEntry } from "@/model/timetable/entry/timetable-entry.interface.js";

describe("TimetableConflictService", () => {
  const makeEntry = (
    overrides: Partial<ITimetableEntry> = {},
  ): ITimetableEntry => ({
    id: "entry-1",
    timetableId: "timetable-1",
    dayOfWeek: "MONDAY",
    periodId: "period-1",
    assignmentId: "assignment-1",
    teacherId: "teacher-1",
    classArmId: "class-1",
    roomId: "room-1",
    isLocked: false,
    note: null,
    createdById: null,
    updatedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const makeService = (entries: ITimetableEntry[]) => {
    const repo = {
      getEntriesByDayAndPeriod: jest
        .fn()
        .mockImplementation(
          async (timetableId: string, dayOfWeek: string, periodId: string) =>
            entries.filter(
              (entry) =>
                entry.timetableId === timetableId &&
                entry.dayOfWeek === dayOfWeek &&
                entry.periodId === periodId,
            ),
        ),
    } as unknown as ITimetableEntryRepo;

    return {
      service: new TimetableConflictService(repo),
      getEntries: repo.getEntriesByDayAndPeriod as jest.Mock,
    };
  };

  it("detects a class clash in the same timetable slot", async () => {
    const entry = makeEntry();
    const { service } = makeService([entry]);

    await expect(
      service.detectConflicts(
        "timetable-1",
        "MONDAY",
        "period-1",
        "teacher-2",
        "class-1",
        "room-2",
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        type: "CLASS_CLASH",
        conflictingEntry: entry,
      }),
    ]);
  });

  it("detects teacher and room clashes in the same timetable slot", async () => {
    const entry = makeEntry();
    const { service } = makeService([entry]);

    const conflicts = await service.detectConflicts(
      "timetable-1",
      "MONDAY",
      "period-1",
      "teacher-1",
      "class-2",
      "room-1",
    );

    expect(conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "TEACHER_CLASH" }),
        expect.objectContaining({ type: "ROOM_CLASH" }),
      ]),
    );
    expect(conflicts).toHaveLength(2);
  });

  it("ignores entries in a different slot", async () => {
    const { service } = makeService([
      makeEntry({ dayOfWeek: "TUESDAY", periodId: "period-2" }),
    ]);

    await expect(
      service.detectConflicts(
        "timetable-1",
        "MONDAY",
        "period-1",
        "teacher-1",
        "class-1",
        "room-1",
      ),
    ).resolves.toEqual([]);
  });

  it("does not report the entry being updated as a conflict", async () => {
    const entry = makeEntry();
    const { service } = makeService([entry]);

    await expect(
      service.detectConflicts(
        "timetable-1",
        "MONDAY",
        "period-1",
        "teacher-1",
        "class-1",
        "room-1",
        entry.id,
      ),
    ).resolves.toEqual([]);
  });
});
