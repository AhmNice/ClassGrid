import { RoomRepo } from "./room.repo.js";
import { RoomService } from "./room.service.js";

const roomRepo = new RoomRepo();
export const roomService = new RoomService(roomRepo);
