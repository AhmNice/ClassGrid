import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import type { IPaginatedResult } from "@/types/pagination.js";
import type {
  IRoom,
  IRoomCreate,
  IRoomListQuery,
  IRoomProperties,
  IRoomTimetableQuery,
  IRoomUpdate,
} from "./room.interface.js";
import { IRoomRepo } from "./room.repo.js";

export interface IRoomService {
  createRoom(data: IRoomCreate): Promise<IRoom>;
  getRooms(query: IRoomListQuery): Promise<IPaginatedResult<IRoom>>;
  getRoomById(id: string): Promise<IRoom | null>;
  updateRoom(id: string, data: IRoomUpdate): Promise<IRoom | null>;
  updateRoomProperties(
    id: string,
    data: IRoomProperties,
  ): Promise<IRoom | null>;
  deleteRoom(id: string): Promise<boolean>;
  getRoomTimetable(
    roomId: string,
    query: IRoomTimetableQuery,
  ): Promise<unknown[]>;
}

export class RoomService implements IRoomService {
  constructor(private readonly repo: IRoomRepo) {}

  async createRoom(data: IRoomCreate): Promise<IRoom> {
    const clean = normalize(data) as IRoomCreate;
    if (!clean.name) throw new ApiError(422, "Room name cannot be empty");
    const duplicate = await this.repo.findDuplicate(clean.schoolId, clean.name);
    if (duplicate) throw new ApiError(422, "Room name already exists");
    return await this.repo.createRoom(clean);
  }

  async getRooms(query: IRoomListQuery): Promise<IPaginatedResult<IRoom>> {
    return await this.repo.getRooms(query);
  }

  async getRoomById(id: string): Promise<IRoom | null> {
    return await this.repo.getRoomById(id);
  }

  async updateRoom(id: string, data: IRoomUpdate): Promise<IRoom | null> {
    const existing = await this.repo.getRoomById(id);
    if (!existing) return null;
    const clean = normalize(data) as IRoomUpdate;
    if (Object.keys(clean).length === 0) {
      throw new ApiError(400, "No fields to update");
    }
    const name = clean.name ?? existing.name;
    const duplicate = await this.repo.findDuplicate(
      existing.schoolId,
      name,
      id,
    );
    if (duplicate) throw new ApiError(422, "Room name already exists");
    return await this.repo.updateRoom(id, { ...clean, name });
  }

  async updateRoomProperties(
    id: string,
    data: IRoomProperties,
  ): Promise<IRoom | null> {
    const existing = await this.repo.getRoomById(id);
    if (!existing) return null;
    if (data.type === undefined && data.capacity === undefined) {
      throw new ApiError(400, "At least one room property is required");
    }
    return await this.repo.updateRoom(id, data);
  }
  async deleteRoom(id: string): Promise<boolean> {
    return await this.repo.deleteRoom(id);
  }

  async getRoomTimetable(
    roomId: string,
    query: IRoomTimetableQuery,
  ): Promise<unknown[]> {
    const room = await this.repo.getRoomById(roomId);
    if (!room) throw new ApiError(404, "Room not found");
    return await this.repo.getRoomTimetable(roomId, query);
  }
}
