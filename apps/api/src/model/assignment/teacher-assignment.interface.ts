import { RoomType } from "../room/room.interface.js";

export interface ITeacherAssignment {
  id: string;
  sessionId: string;
  teacherId: string;
  subjectId: string;
  classArmId: string;
  periodsPerWeek: number;
  isActive: boolean;

  maxPeriodsPerDay?: number | null;
  requiredRoomType?: RoomType | null;
  requiresDoublePeriod?: boolean | null;

  createdById:string;
  updatedById:string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ITeacherAssignmentCreate {
  sessionId: string;
  teacherId: string;
  subjectId: string;
  classArmId: string;
  periodsPerWeek: number;
}