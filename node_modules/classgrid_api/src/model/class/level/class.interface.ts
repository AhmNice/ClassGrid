export type ClassStage = "JSS" | "SS";

export interface IClassLevel {
  id: string;
  schoolId: string;
  name: string;
  rank: number;
  stage: ClassStage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface IClassLevelCreate {
  schoolId: string;
  name: string;
  rank: number;
  isActive?: boolean;
  stage: ClassStage;
}
export interface IClassLevelUpdate {
  name?: string;
  rank?: number;
  isActive?: boolean;
}

export interface IClassLevelListQuery {
  query?: string;
  isActive?: boolean;
  stage?: ClassStage;
  page: number;
  limit: number;
  sortBy: "name" | "rank" | "createdAt";
  sortOrder: "asc" | "desc";
}
