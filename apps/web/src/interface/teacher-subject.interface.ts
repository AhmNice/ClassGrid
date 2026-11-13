export interface ITeacherSubject {
  id: string;
  schoolId: string;
  teacherId: string;
  subjectId: string;
}

export interface ITeacherSubjectCreate {
  teacherId: string;
  subjectId: string;
}
export interface BulkITeacherSubjectCreate {
  additions: ITeacherSubjectCreate,
  removals:ITeacherSubjectCreate
}
export interface ITeacherSubjectDetails extends ITeacherSubject {
  teacher: {
    id: string;
    title: string | null;
    firstName: string;
    lastName: string;
    staffCode: string | null;
  };
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
}

export interface ITeacherSubjectListQuery {
  teacherId?: string;
  subjectId?: string;
}
