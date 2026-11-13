import type { IRoom, RoomType } from "../interface/room.interface";

const SCHOOL_ID = "school-stjude";
const stamp = new Date(2026, 5, 1);

const room = (
  id: string,
  name: string,
  type: RoomType,
  capacity: number | null,
  isActive = true,
): IRoom => ({
  id,
  schoolId: SCHOOL_ID,
  name,
  type,
  capacity,
  isActive,
  createdAt: stamp,
  updatedAt: stamp,
});

export const MOCK_ROOMS: IRoom[] = [
  room("room-1", "Room 101", "CLASSROOM", 40),
  room("room-2", "Room 102", "CLASSROOM", 40),
  room("room-3", "Room 103", "CLASSROOM", 40),
  room("room-4", "Room 201", "CLASSROOM", 45),
  room("room-5", "Room 202", "CLASSROOM", 45),
  room("room-6", "Room 203", "CLASSROOM", 35, false),
  room("room-7", "Physics Laboratory", "SCIENCE_LAB", 30),
  room("room-8", "Chemistry Laboratory", "SCIENCE_LAB", 30),
  room("room-9", "Biology Laboratory", "SCIENCE_LAB", 30),
  room("room-10", "ICT Laboratory", "COMPUTER_LAB", 35),
  room("room-11", "Computer Lab 2", "COMPUTER_LAB", 25),
  room("room-12", "Library", "LIBRARY", 60),
  room("room-13", "Assembly Hall", "HALL", 400),
  room("room-14", "Technical Drawing Workshop", "OTHER", 25),
  room("room-15", "Old Staff Room", "OTHER", null, false),
];