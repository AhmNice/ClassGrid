import type { ClassStage } from "../../interface/class.interface";
import type { ClassTrack } from "../class/classTypes";

export interface SubjectFilterState {
  query: string;
  isActive:SubjectStatus ;
  classTrack: ClassTrack | "ALL";
  classStage: ClassStage | "ALL"
}
export type SubjectStatus = "ALL" | "ACTIVE" | "INACTIVE"
export const DEFAULT_SUBJECT_FILTERS: SubjectFilterState = {
  query: "",
  isActive: "ALL",
  classTrack: "ALL",
  classStage: "ALL"
}

