export interface IClassLevelSubject {
  id: string;
  schoolId: string;
  classLevelId: string;
  subjectId: string;

}
export interface IClassLevelSubjectCreate {
  schoolId: string;
  classLevelId: string;
  subjectId: string;
}
export interface IClassLevelSubjectUpdate {
  classLevelId?: string;
  subjectId?: string;
}
export interface IManageClassSubjectAllocations {
  schoolId: string;
  additions: IClassSubjectAllocation[];
  removals: IClassSubjectAllocation[];
}

export interface IClassSubjectAllocation {
  classLevelId: string;
  subjectId: string;
}