import type { IListQuery } from "@/types/pagination.js";
import type { IPeriodSchedule } from "./Schedule/schedule.interface.js";

export type PeriodKind = "LESSON" | "BREAK";

export interface IPeriod {
  id: string;
  schoolId: string;
  periodScheduleScheduleId: string | null;
  name: string;
  kind: PeriodKind;
  sequence: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IPeriodListItem = IPeriod & {
  periodScheduleName: IPeriodSchedule["name"] | null;
};

export interface IPeriodCreate {
  schoolId: string;
  name: string;
  kind?: PeriodKind;
  periodScheduleScheduleId: string | null;
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
