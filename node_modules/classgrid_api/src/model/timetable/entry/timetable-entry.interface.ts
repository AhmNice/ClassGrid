import { DayOfWeek } from "@/model/school/school.interface.js";
import { Prisma } from "@/generated/prisma/client.js";

export interface ITimetableEntry {
  id: string;
  timetableId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  assignmentId: string;
  teacherId: string;
  classArmId: string;
  roomId: string | null;
  isLocked: boolean;
  note: string | null;
  createdById: string | null;
  updatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ITimetableEntryResponse = Prisma.TimetableEntryGetPayload<{
  select: {
    id: true;
    timetableId: true;
    dayOfWeek: true;
    periodId: true;
    assignmentId: true;
    teacherId: true;
    classArmId: true;
    roomId: true;
    isLocked: true;
    note: true;
    period: {
      select: {
        id: true;
        name: true;
        sequence: true;
        startTime: true;
        endTime: true;
        kind: true;
      };
    };
    assignment: {
      select: {
        id: true;
        subject: {
          select: {
            id: true;
            name: true;
            code: true;
          };
        };
        teacher: {
          select: {
            id: true;
            title: true;
            firstName: true;
            lastName: true;
          };
        };
        classArm: {
          select: {
            id: true;
            name: true;
            classLevel: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    };
    room: {
      select: {
        id: true;
        name: true;
        type: true;
      };
    };
  };
}>;
export interface ITimetableEntryCreate {
  timetableId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  assignmentId: string;
  teacherId: string;
  classArmId: string;
  roomId: string | null;
  isLocked: boolean;
  note: string | null;
}
export interface ITimetableEntryUpdate {
  timetableId?: string;
  dayOfWeek?: DayOfWeek;
  periodId?: string;
  assignmentId?: string;
  teacherId?: string;
  classArmId?: string;
  roomId?: string | null;
  isLocked?: boolean;
  note?: string | null;
}
