import { RoomType } from "@/model/room/room.interface.js";

export interface ITeachingAssignment {
  id: string;
  sessionId: string;
  teacherId: string;
  subjectId: string;
  classArmId: string;
  isActive: boolean;
  periodsPerWeek: number;
  requiresDoublePeriod: boolean;
  requiredRoomType: RoomType | null;
  maxPeriodsPerDay: number | null;
  createdAt: Date;
  updatedAt: Date;
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

export type ITeachingAssignmentUpdate = Partial<
  Pick<
    ITeachingAssignment,
    | "teacherId"
    | "periodsPerWeek"
    | "requiresDoublePeriod"
    | "requiredRoomType"
    | "maxPeriodsPerDay"
    | "isActive"
  >
>;

export interface ITeachingAssignmentListQuery {
  sessionId?: string;
  teacherId?: string;
  subjectId?: string;
  classArmId?: string;
  isActive?: boolean;
}

export interface ITeachingAssignmentDetails extends ITeachingAssignment {
  teacher: {
    id: string;
    title: string | null;
    firstName: string;
    lastName: string;
    staffCode: string | null;
  };
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
  classArm: {
    id: string;
    name: string;
    classLevel: { id: string; name: string };
  };
}
