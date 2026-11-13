export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" |"FRIDAY"

export type PeriodScheduleKind = "WEEKDAY_SCHEDULE" | "FRIDAY_SCHEDULE";

export interface IPeriodSchedule {
  scheduleId: string;
  schoolId: string;
  name: PeriodScheduleKind;
  applicableDays: DayOfWeek[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPeriodScheduleCreate {
  schoolId: string;
  name: PeriodScheduleKind;
  applicableDays: DayOfWeek[];
  isActive?: boolean;
}

export type IPeriodScheduleUpdate = Partial<
  Omit<IPeriodScheduleCreate, "schoolId">
>;
