export type TimetableStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export interface ITimetable {
  id: string;
  termId: string;
  name: string;
  version: number;
  status: TimetableStatus;
  basedOnId: string | null;

  createdById: string | null;
  updatedById: string | null;
  publishedById: string | null;

  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

export interface ITimetableListItem extends ITimetable {
  entriesCount: number;
}
export interface ITimetableCreate {
  termId: string;
  name: string;
  basedOnId?: string | null;
  version: number;
}

export interface ITimetableUpdate {
  name?: string;
}

export interface ITimetableListQuery {
  sessionId?: string;
  termId?: string;
}
