import type { ClassStage } from "../../interface/class.interface";
import type { StatusFilter } from "../../interface/room.interface";

export type ClassTrack = "SCIENCE" | "ART";

/** Stages (the school level) and tracks (the SS subject stream) are separate. */
export const CLASS_STAGES: ClassStage[] = ["JSS", "SS"];

export const CLASS_STAGE_LABELS: Record<ClassStage, string> = {
  JSS: "JSS",
  SS: "SS",
};
export const DEFAULT_CLASS_FILTERS: ClassFilterState ={
  query:"",
  stage:"ALL",
  track:"ALL",
  status:"ALL"
}
export const CLASS_TRACKS: ClassTrack[] = ["SCIENCE", "ART"];

export const CLASS_TRACK_LABELS: Record<ClassTrack, string> = {
  SCIENCE: "Science",
  ART: "Art",
};

export interface ClassFilterState {
  query: string;
  stage: ClassStage | "ALL";
  track: ClassTrack | "ALL";
  status: StatusFilter;
}

export type ClassChipType = ClassStage | ClassTrack;