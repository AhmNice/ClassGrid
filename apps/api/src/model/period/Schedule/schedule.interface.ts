import type { DayOfWeek as PrismaDayOfWeek } from "@/generated/prisma/enums.js";

export type DayOfWeek = PrismaDayOfWeek;
export type PeriodScheduleKind = "WEEKDAY_SCHEDULE" | "FRIDAY_SCHEDULE";

export interface IPeriodSchedule {
  scheduleId: string;
  schoolId: string;
  name: PeriodScheduleKind;
  applicableDays: DayOfWeek[];
  isActive: boolean;
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
