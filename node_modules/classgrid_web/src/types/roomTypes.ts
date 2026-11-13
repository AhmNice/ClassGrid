import type { RoomType } from "../interface/room.interface";

export const ROOM_TYPES: RoomType[] = [
  "CLASSROOM",
  "COMPUTER_LAB",
  "SCIENCE_LAB",
  "HALL",
  "LIBRARY",
  "OTHER",
];

/** What people see. Change the wording here and it updates everywhere. */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  CLASSROOM: "Classroom",
  COMPUTER_LAB: "Computer lab",
  SCIENCE_LAB: "Science lab",
  HALL: "Hall",
  LIBRARY: "Library",
  OTHER: "Other",
};