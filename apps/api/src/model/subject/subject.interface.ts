import type { IListQuery } from "@/types/pagination.js";
import { ClassStage } from "../class/level/class.interface.js";

export interface ISubject {
  id: string;
  schoolId: string;
  name: string;
  code: string | null;
  isActive: boolean;
  classStage:ClassStage[];
  createdAt: Date;
  updatedAt: Date;
  defaultPeriodsPerWeek: number | null;
  defaultMaxPeriodsPerDay: number | null;
  defaultMaxConsecutive: number | null;
  defaultAllowConsecutive: boolean;
}

export interface ISubjectCreate {
  schoolId: string;
  name: string;
  classStage:ClassStage[]
  code?: string | null;
  isActive?: boolean;
  defaultPeriodsPerWeek?: number | null;
  defaultMaxPeriodsPerDay?: number | null;
  defaultMaxConsecutive?: number | null;
  defaultAllowConsecutive?: boolean;
}

export type ISubjectUpdate = Partial<Omit<ISubjectCreate, "schoolId">>;

export type ISubjectSchedulingRequirements = Pick<
  ISubjectCreate,
  | "defaultPeriodsPerWeek"
  | "defaultMaxPeriodsPerDay"
  | "defaultMaxConsecutive"
  | "defaultAllowConsecutive"
>;

export interface ISubjectListQuery extends IListQuery {
  schoolId: string;
  isActive?: boolean;
}
