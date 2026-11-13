export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type AvailabilityStatus = "UNAVAILABLE" | "PREFERRED";

export interface ITeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  status: AvailabilityStatus;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherAvailabilityCreate {
  teacherId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  status: AvailabilityStatus;
  reason?: string | null;
}

export interface ITeacherAvailabilityUpdate {
  dayOfWeek?: DayOfWeek;
  periodId?: string;
  status?: AvailabilityStatus;
  reason?: string | null;
}
