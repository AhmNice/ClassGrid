import type { CapacityBand, IRoom, RoomFilterState, RoomType } from "../interface/room.interface";

export const DEFAULT_ROOM_FILTERS: RoomFilterState = {
  query: "",
  type: "ALL",
  capacity: "ANY",
  status: "ALL",
};
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  CLASSROOM: "Classroom",
  SCIENCE_LAB: "Science Lab",
  LIBRARY: "Library",
  COMPUTER_LAB: "Computer Lab",
  HALL: "Hall",
  OTHER: "Other",
};
export const hasActiveFilters = (filters: RoomFilterState) =>
  filters.query.trim() !== "" ||
  filters.type !== "ALL" ||
  filters.capacity !== "ANY" ||
  filters.status !== "ALL";
  
export const matchesCapacity = (room:IRoom, band: CapacityBand):boolean => {
  const {capacity} = room;
  switch (band) {
    case "ANY":
      return true;
    case "UP_TO_30":
      return capacity !== null && capacity <= 30;
    case "31_TO_50":
      return capacity !== null && capacity >= 31 && capacity <= 50;
    case "OVER_50":
      return capacity !== null && capacity > 50;
    case "NONE":
      return capacity === null;
    default:
      return false;
  }
}
export const filterRooms = (rooms: IRoom[], filters: RoomFilterState): IRoom[] => {
  const needle = filters.query.trim().toLowerCase();

  return rooms.filter((room) => {
    if (filters.type !== "ALL" && room.type !== filters.type) return false;
    if (!matchesCapacity(room, filters.capacity)) return false;
    if (filters.status === "ACTIVE" && !room.isActive) return false;
    if (filters.status === "INACTIVE" && room.isActive) return false;
    if (needle) {
      const haystack = `${room.name} ${ROOM_TYPE_LABELS[room.type]}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
};