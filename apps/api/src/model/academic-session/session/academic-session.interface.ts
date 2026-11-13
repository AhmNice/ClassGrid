import { ITerm } from "../term/term.interface.js";

export interface IAcademicSession {
  id: string;
  schoolId: string;
  name: string;
  terms?: ITerm[];
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** The few term fields the session logic needs. */
export interface ITermSummary {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
}

export interface CurrentAcademicSession {
  id: string;
  sessionName: string;
  dateRange: string;
  startDate?: Date | null;
  endDate?: Date | null;
  instructionalWeeks: number;
  termCount: number;
  termLabel: string; // current term label
  currentWeek: number;
  totalWeeks: number;
  clashes: number;
  locked: boolean;
  terms: ITerm[];
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
