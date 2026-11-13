export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"

/**
 * The two "exception" states a row can express.
 * Absence of a row means "available" — sparse storage.
 */
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

  teacher?: {
    id: string;
    title: string | null;
    firstName: string;
    lastName: string;
    staffCode: string | null;
  };
  period?: {
    id: string;
    name: string;
    sequence: number;
    startTime: string;
    endTime: string;
    kind: "LESSON" | "BREAK";
  };
}

export interface ITeacherAvailabilityCreate {
  teacherId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  status: AvailabilityStatus;
  reason?: string | null;
}