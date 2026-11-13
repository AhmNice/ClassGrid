import type { PeriodKind } from "./period.interface";
import type { DayOfWeek } from "./schedule.interface";

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

export interface ITimetableEntryPeriod {
  id: string;
  name: string;
  sequence: number;
  startTime: string;
  endTime: string;
  kind: PeriodKind;
}

export interface ITimetableEntrySubject {
  id: string;
  name: string;
  code: string;
}

export interface ITimetableEntryTeacher {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
}

export interface ITimetableEntryClassArm {
  id: string;
  name: string;
  classLevel: {
    id: string;
    name: string;
  };
}

export interface ITimetableEntryAssignment {
  id: string;
  subject: ITimetableEntrySubject;
  teacher: ITimetableEntryTeacher;
  classArm: ITimetableEntryClassArm;
}

export interface ITimetableEntryRoom {
  id: string;
  name: string;
  type: string; // narrow to RoomType if you have the enum
}

/* -------------------------------------------------------------------------- */
/*                            The entry itself                                */
/* -------------------------------------------------------------------------- */

export interface ITimetableEntryResponse {
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

  period: ITimetableEntryPeriod;
  assignment: ITimetableEntryAssignment;
  room: ITimetableEntryRoom | null; 
}
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
export  interface ITimetableEntryUpdate {
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