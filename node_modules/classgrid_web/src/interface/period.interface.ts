
export type PeriodKind = "LESSON" | "BREAK";

export interface IPeriod {
  id: string;
  schoolId: string;
  periodScheduleScheduleId: string;
  periodScheduleName: string;
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
  name: string;
  kind?: PeriodKind;
  periodScheduleScheduleId:string;
  sequence: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export type IPeriodUpdate = Partial<Omit<IPeriodCreate, "schoolId">>;


export interface IPeriodReorder {
  schoolId: string;
  periodIds: string[];
}
