import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { roomController } from "./room.controller.js";
import {
  createRoomReqSchema,
  roomIdReqSchema,
  roomListReqSchema,
  roomTimetableReqSchema,
  updateRoomReqSchema,
} from "./room.schema.js";

const roomRouter = express.Router();
roomRouter.use(protect);
roomRouter.get("/", validate(roomListReqSchema), roomController.getRooms);
roomRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(createRoomReqSchema),
  roomController.createRoom,
);
roomRouter.get(
  "/:roomId/timetable",
  validate(roomTimetableReqSchema),
  roomController.getRoomTimetable,
);
roomRouter.get("/:roomId", validate(roomIdReqSchema), roomController.getRoom);
roomRouter.patch(
  "/:roomId",
  sanitizeBodyMiddleware,
  validate(updateRoomReqSchema),
  roomController.updateRoom,
);
roomRouter.delete(
  "/:roomId",
  validate(roomIdReqSchema),
  roomController.deleteRoom,
);

export default roomRouter;
