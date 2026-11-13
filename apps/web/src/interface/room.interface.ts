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
  // schoolId: string;
  name: string;
  type?: RoomType;
  capacity?: number | null;
  isActive?: boolean;
}
export type CapacityBand = "ANY" | "UP_TO_30" | "31_TO_50" | "OVER_50" | "NONE";
export type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export interface RoomFilterState {
  query: string;
  type: RoomType | "ALL";
  capacity: CapacityBand;
  status: StatusFilter;
}
