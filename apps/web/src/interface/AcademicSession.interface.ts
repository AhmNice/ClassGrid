export interface IAcademicSession {
  id: string;
  schoolId: string;
  name: string;
  terms?:ITerm[]
  startDate: Date ;
  endDate: Date ;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface CurrentAcademicSession {
  id: string;
  sessionName: string;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  instructionalWeeks: number;
  termCount: number;
  termLabel: string; // current term label
  currentWeek: number;
  totalWeeks: number;
  clashes: number;
  locked: boolean;
  terms?: ITerm[]
}
export interface IAcademicSessionCreate {
  schoolId: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
}

export interface IAcademicSessionUpdate {
  name?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isCurrent?: boolean;
}
export interface ITerm {
  id: string;
  sessionId: string;
  name: TermName;
  startDate: Date ;
  endDate: Date ;
  midTermStartDate: Date | null;
  midTermEndDate: Date | null;
  examStartDate: Date | null;
  examEndDate: Date | null;
  timetableStatus?: "not_started" | "draft" | "published" ; // ToDo: add to backend
  timetableVersion?: number | null; // ToDo: add to backend
  isCurrent: boolean;
  isLocked?:boolean; // ToDo: add to backend
  createdAt: Date;
  updatedAt: Date;
}
export type TermName = "FIRST" | "SECOND" | "THIRD";
export interface ITermCreate {
  sessionId: string;
  name: TermName;
  startDate: Date | null;
  endDate: Date | null;
  midTermStartDate?: Date | null;
  midTermEndDate?: Date |null;
  examStartDate?: Date | null;
  examEndDate?: Date | null;
  isCurrent?: boolean;
}
export interface ITermUpdate {
  name?: TermName;
  startDate?: Date | null;
  endDate?: Date | null;
  midTermStartDate?: Date | null;
  midTermEndDate?: Date | null;
  examStartDate?: Date | null;
  examEndDate?: Date | null;
  isCurrent?: boolean;
}