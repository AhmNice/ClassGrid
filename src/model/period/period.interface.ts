import type { IListQuery } from "@/types/pagination.js";

export type PeriodKind = "LESSON" | "BREAK";

export interface IPeriod {
  id: string;
  schoolId: string;
  name: string;
  kind: PeriodKind;
  sequence: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPeriodCreate {
  schoolId: string;
  name: string;
  kind?: PeriodKind;
  sequence: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export type IPeriodUpdate = Partial<Omit<IPeriodCreate, "schoolId">>;

export interface IPeriodListQuery extends IListQuery {
  schoolId: string;
  kind?: PeriodKind;
  isActive?: boolean;
}

export interface IPeriodReorder {
  schoolId: string;
  periodIds: string[];
}
