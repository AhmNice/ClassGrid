import type { ClassTrack } from "../components/class/classTypes";
import type { ClassStage } from "./class.interface";

export interface ISubject {
  id: string;
  schoolId: string;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  classStage: ClassStage[];
  Track:ClassTrack[];
  defaultPeriodsPerWeek: number | null;
  defaultMaxPeriodsPerDay: number | null;
  defaultMaxConsecutive: number | null;
  defaultAllowConsecutive: boolean;
}

export interface ISubjectCreate {
  name: string;
  code?: string | null;
  isActive?: boolean;
  classStage: ClassStage[];
  defaultPeriodsPerWeek?: number | null;
  defaultMaxPeriodsPerDay?: number | null;
  defaultMaxConsecutive?: number | null;
  defaultAllowConsecutive?: boolean;
}

export type ISubjectUpdate = Partial<Omit<ISubjectCreate, "schoolId"> & { id: string }> ;

export type ISubjectSchedulingRequirements = Pick<
  ISubjectCreate,
  | "defaultPeriodsPerWeek"
  | "defaultMaxPeriodsPerDay"
  | "defaultMaxConsecutive"
  | "defaultAllowConsecutive"
>;