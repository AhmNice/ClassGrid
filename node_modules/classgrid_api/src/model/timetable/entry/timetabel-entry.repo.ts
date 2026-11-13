import {
  ITimetableEntry,
  ITimetableEntryCreate,
  ITimetableEntryResponse,
  ITimetableEntryUpdate,
} from "./timetable-entry.interface.js";
import { PrismaTx } from "@/types/general.js";
import { prisma } from "@/lib/prisma.js";
import { DayOfWeek } from "@/model/school/school.interface.js";
import { Prisma } from "@/generated/prisma/client.js";

export interface ITimetableEntryRepo {
  create(
    data: ITimetableEntryCreate & { classArmId: string; teacherId: string },
  ): Promise<ITimetableEntry>;
  update(
    entryId: string,
    data: ITimetableEntryUpdate,
  ): Promise<ITimetableEntry>;
  delete(entryId: string): Promise<ITimetableEntry>;
  findById(entryId: string): Promise<ITimetableEntry | null>;
  getWeeklyEntries(timetableId: string): Promise<ITimetableEntryResponse[]>;
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
  getEntriesByDayAndPeriod(
    timetableId: string,
    dayOfWeek: DayOfWeek,
    periodId: string,
  ): Promise<ITimetableEntry[]>;
  transaction<T>(fn: (repo: ITimetableEntryRepo) => Promise<T>): Promise<T>;
}

const timetableEntrySelect = {
  id: true,
  timetableId: true,
  dayOfWeek: true,
  periodId: true,
  assignmentId: true,
  teacherId: true,
  classArmId: true,
  roomId: true,
  isLocked: true,
  note: true,
  period: {
    select: {
      id: true,
      name: true,
      sequence: true,
      startTime: true,
      endTime: true,
      kind: true,
    },
  },
  assignment: {
    select: {
      id: true,
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      teacher: {
        select: {
          id: true,
          title: true,
          firstName: true,
          lastName: true,
        },
      },
      classArm: {
        select: {
          id: true,
          name: true,
          classLevel: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
  room: {
    select: {
      id: true,
      name: true,
      type: true,
    },
  },
} satisfies Prisma.TimetableEntrySelect;

export class TimetableEntryRepo implements ITimetableEntryRepo {
  constructor(private readonly db: PrismaTx = prisma) {}

  async create(
    data: ITimetableEntryCreate & { classArmId: string; teacherId: string },
  ): Promise<ITimetableEntry> {
    return this.db.timetableEntry.create({
      data: {
        timetableId: data.timetableId,
        dayOfWeek: data.dayOfWeek,
        periodId: data.periodId,
        assignmentId: data.assignmentId,
        teacherId: data.teacherId,
        classArmId: data.classArmId,
        roomId: data.roomId || null,
        note: data.note ?? null,
      },
    });
  }

  async update(
    entryId: string,
    data: ITimetableEntryUpdate,
  ): Promise<ITimetableEntry> {
    return this.db.timetableEntry.update({
      where: { id: entryId },
      data: {
        ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
        ...(data.periodId !== undefined && { periodId: data.periodId }),
        ...(data.assignmentId !== undefined && {
          assignmentId: data.assignmentId,
        }),
        ...(data.roomId !== undefined && { roomId: data.roomId || null }),
        ...(data.note !== undefined && { note: data.note ?? null }),
      },
    });
  }

  async delete(entryId: string): Promise<ITimetableEntry> {
    return this.db.timetableEntry.delete({ where: { id: entryId } });
  }

  async findById(entryId: string): Promise<ITimetableEntry | null> {
    return this.db.timetableEntry.findUnique({ where: { id: entryId } });
  }

  async getWeeklyEntries(
    timetableId: string,
  ): Promise<ITimetableEntryResponse[]> {
    return this.db.timetableEntry.findMany({
      where: { timetableId },
      select: timetableEntrySelect,
      orderBy: [{ dayOfWeek: "asc" }, { period: { sequence: "asc" } }],
    });
  }
  async getClassWeeklyEntries(
    timetableId: string,
    classArmId: string,
  ): Promise<ITimetableEntry[]> {
    return this.db.timetableEntry.findMany({
      where: { timetableId, classArmId },
    });
  }

  async getTeacherWeeklyEntries(
    timetableId: string,
    teacherId: string,
  ): Promise<ITimetableEntry[]> {
    return this.db.timetableEntry.findMany({
      where: { timetableId, teacherId },
    });
  }

  async getRoomWeeklyEntries(
    timetableId: string,
    roomId: string,
  ): Promise<ITimetableEntry[]> {
    return this.db.timetableEntry.findMany({
      where: { timetableId, roomId },
    });
  }

  async getEntriesByDayAndPeriod(
    timetableId: string,
    dayOfWeek: DayOfWeek,
    periodId: string,
  ): Promise<ITimetableEntry[]> {
    return this.db.timetableEntry.findMany({
      where: { timetableId, dayOfWeek, periodId },
    });
  }

  async transaction<T>(
    fn: (repo: ITimetableEntryRepo) => Promise<T>,
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      const txRepo = new TimetableEntryRepo(tx);
      return fn(txRepo);
    });
  }
}
