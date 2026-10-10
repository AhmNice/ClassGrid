export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ICreateSchool {
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface ISchoolWorkingDays {
  id: string;
  workingDays: DayOfWeek[];
}
