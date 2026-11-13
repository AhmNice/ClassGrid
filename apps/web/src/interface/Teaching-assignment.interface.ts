// teachingAssignment.interface.ts

import type { RoomType } from "./room.interface";

export interface TeacherSummary {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
  staffCode: string;
  isActive:boolean;
}

/** A subject as it appears inside a class-arm teaching-assignment response. */
export interface SubjectWithTeachers {
  id: string;
  name: string;
  code: string;
  /** Teachers the server considers eligible to teach this subject. */
  eligibleTeachers: TeacherSummary[];
  /** Assignments currently in place for this subject (0 or 1 in practice). */
  assignments: TeachingAssignmentSummary[];
  /** Server-computed: true iff at least one assignment exists. */
  isAssigned: boolean;
}

export interface TeachingAssignmentSummary {
  id: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
  teacher: TeacherSummary;
}

/** One class arm's full teaching-assignment payload. */
export interface ClassArmTeachingAssignmentData {
  classArm: {
    id: string;
    name: string;
    classLevel: { id: string; name: string };
  };
  subjects: SubjectWithTeachers[];
}

export interface getTeachingAssignmentParams {
  sessionId: string;
  classArmId: string;
  classLevelId: string;
}

export interface ITeachingAssignmentCreate {
  sessionId: string;
  teacherId: string;
  subjectId: string;
  classArmId: string;

  isActive?: boolean;
  periodsPerWeek: number;
  requiresDoublePeriod?: boolean;
  requiredRoomType?: RoomType;
  maxPeriodsPerDay?: number | null;
}