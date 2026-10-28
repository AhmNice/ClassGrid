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
  workingDays?: DayOfWeek[];
}

export interface ISchool {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  workingDays: DayOfWeek[];
  createdAt: Date;
  updatedAt: Date;
}

export type IUpdateSchool = Partial<ICreateSchool>;

export interface ISchoolRepo {
  createSchool(data: ICreateSchool): Promise<ISchool>;
  getSchools(): Promise<ISchool[]>;
  getSchoolById(schoolId: string): Promise<ISchool | null>;
  updateSchool(schoolId: string, data: IUpdateSchool): Promise<ISchool | null>;
  deleteSchool(schoolId: string): Promise<boolean>;
}

export interface ISchoolWorkingDays {
  id: string;
  workingDays: DayOfWeek[];
}
