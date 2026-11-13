import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
export class RoomService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createRoom(data) {
        const clean = normalize(data);
        if (!clean.name)
            throw new ApiError(422, "Room name cannot be empty");
        const duplicate = await this.repo.findDuplicate(clean.schoolId, clean.name);
        if (duplicate)
            throw new ApiError(422, "Room name already exists");
        return await this.repo.createRoom(clean);
    }
    async getRooms(query) {
        return await this.repo.getRooms(query);
    }
    async getRoomById(id) {
        return await this.repo.getRoomById(id);
    }
    async updateRoom(id, data) {
        const existing = await this.repo.getRoomById(id);
        if (!existing)
            return null;
        const clean = normalize(data);
        if (Object.keys(clean).length === 0) {
            throw new ApiError(400, "No fields to update");
        }
        const name = clean.name ?? existing.name;
        const duplicate = await this.repo.findDuplicate(existing.schoolId, name, id);
        if (duplicate)
            throw new ApiError(422, "Room name already exists");
        return await this.repo.updateRoom(id, { ...clean, name });
    }
    async deleteRoom(id) {
        return await this.repo.deleteRoom(id);
    }
    async getRoomTimetable(roomId, query) {
        const room = await this.repo.getRoomById(roomId);
        if (!room)
            throw new ApiError(404, "Room not found");
        return await this.repo.getRoomTimetable(roomId, query);
    }
}
