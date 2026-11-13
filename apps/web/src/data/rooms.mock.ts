/* ---------------------------------- types --------------------------------- */

import type { IRoom } from "../interface/room.interface";

export type RoomType =
  | "CLASSROOM"
  | "COMPUTER_LAB"
  | "SCIENCE_LAB"
  | "HALL"
  | "LIBRARY"
  | "OTHER";

export const ROOM_TYPES: RoomType[] = [
  "CLASSROOM",
  "COMPUTER_LAB",
  "SCIENCE_LAB",
  "LIBRARY",
  "HALL",
  "OTHER",
];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  CLASSROOM: "Classroom",
  SCIENCE_LAB: "Science Lab",
  LIBRARY: "Library",
  COMPUTER_LAB: "Computer Lab",
  HALL: "Hall",
  OTHER: "Other",
};

export type RoomStatus = "AVAILABLE" | "MAINTENANCE";

/* -------------------------------- mock data ------------------------------- */

const SCHOOL_ID = "school-stjude";
const stamp = new Date(2026, 5, 1);

const room = (
  id: string,
  name: string,
  type: RoomType,
  capacity: number | null,
): IRoom => ({
  id,
  schoolId: SCHOOL_ID,
  name,
  type,
  capacity,
  isActive: true,
  createdAt: stamp,
  updatedAt: stamp,
});

export const MOCK_ROOMS: IRoom[] = [
  room("room-1", "Room 101", "CLASSROOM", 40),
  room("room-2", "Room 102", "CLASSROOM", 40),
  room("room-3", "Room 201", "CLASSROOM", 45),
  room("room-4", "Physics Laboratory", "SCIENCE_LAB", 30),
  room("room-5", "Chemistry Laboratory", "SCIENCE_LAB", 30),
  room("room-6", "Biology Laboratory", "SCIENCE_LAB", 30),
  room("room-7", "ICT Laboratory", "COMPUTER_LAB", 35),
  room("room-8", "Technical Drawing Workshop", "OTHER", 25),
  room("room-9", "Library", "LIBRARY", 60),
  room("room-10", "Assembly Hall", "HALL", 400),
];