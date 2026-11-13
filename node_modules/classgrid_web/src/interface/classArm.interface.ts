export interface IClassArm {
  id: string;
  name: string;
  classLevelId: string;
  className: string;
  classStage: string;
  isActive:boolean;
  track?:string;
  subjects?:Subject[];
  room?:string,
  createdAt: Date;
  updatedAt: Date;
}
export interface Subject {
  name:string;
  teacher: string;
}
export interface IClassArmCreate {
  classLevelId: string;
  name: string;
  isActive?: boolean;
}
export interface IClassArmUpdate {
  name?: string;
  isActive?: boolean;
}

export interface IClassArmListQuery {
  query?: string;
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: "name" | "createdAt";
  sortOrder: "asc" | "desc";
}
