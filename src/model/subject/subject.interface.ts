import type { IListQuery } from "@/types/pagination.js";

export interface ISubject {
  id: string;
  schoolId: string;
  name: string;
  code: string | null;
  isActive: boolean;
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
