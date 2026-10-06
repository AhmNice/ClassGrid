export interface IAcademicSession {
  id: string;
  schoolId: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
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
