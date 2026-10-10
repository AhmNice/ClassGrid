import type { IListQuery } from "@/types/pagination.js";

export type RoomType =
  "CLASSROOM" | "COMPUTER_LAB" | "SCIENCE_LAB" | "HALL" | "LIBRARY" | "OTHER";

export interface IRoom {
  id: string;
  schoolId: string;
  name: string;
  type: RoomType;
  capacity: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomCreate {
  schoolId: string;
  name: string;
  type?: RoomType;
  capacity?: number | null;
  isActive?: boolean;
}

export type IRoomUpdate = Partial<Omit<IRoomCreate, "schoolId">>;

export type IRoomProperties = Pick<IRoomCreate, "type" | "capacity">;

export interface IRoomListQuery extends IListQuery {
  schoolId: string;
  isActive?: boolean;
  type?: RoomType;
}

export interface IRoomTimetableQuery {
  timetableId?: string;
  termId?: string;
}
