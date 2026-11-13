export type TeacherStatus = "ACTIVE" | "INACTIVE";
export const Status = ["ACTIVE", "INACTIVE"] as const;
export interface TeacherFilterState {
  query: string;
  title: TeacherTitle;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

type TeacherTitle = "ALL" | "Mr" | "Mrs" | "Miss" | "Dr" | "Prof" | "Engr";

export const DEFAULT_TEACHER_FILTERS: TeacherFilterState = {
  query: "",
  title: "ALL",
  status: "ALL",
};
export const TEACHER_TITLES: TeacherTitle[] = [
  "ALL",
  "Mr",
  "Dr",
  "Mrs",
  "Miss",
  "Prof",
  "Engr"
];
export const TEACHER_TITLE_LABELS: Record<TeacherTitle, string> = {
  ALL: "All Titles",
  Mr: "Mr",
  Mrs: "Mrs",
  Miss: "Miss",
  Dr: "Dr",
  Prof: "Prof",
  Engr: "Engr",
};