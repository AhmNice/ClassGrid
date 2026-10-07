export interface IClassArm {
  id: string;
  classLevelId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
