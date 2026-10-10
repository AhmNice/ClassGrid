import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { normalizeListQuery } from "@/types/pagination.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { IRoomCreate, IRoomProperties, IRoomUpdate } from "./room.interface.js";
import { roomService } from "./room.container.js";

class RoomController {
  readonly createRoom = asyncHandler(async (req: Request, res: Response) => {
    const room = await roomService.createRoom(req.body as IRoomCreate);
    res
      .status(201)
      .json(new ApiResponse(201, room, "Room created successfully"));
  });

  readonly getRooms = asyncHandler(async (req: Request, res: Response) => {
    const result = await roomService.getRooms({
      ...normalizeListQuery({
        query:
          typeof req.query.query === "string" ? req.query.query : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sortBy:
          typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
        sortOrder:
          req.query.sortOrder === "desc" || req.query.sortOrder === "asc"
            ? req.query.sortOrder
            : undefined,
      }),
      schoolId: String(req.query.schoolId),
      isActive:
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
            ? false
            : undefined,
      type:
        typeof req.query.type === "string"
          ? (req.query.type as IRoomCreate["type"])
          : undefined,
    });
    const page = result.page ?? (Number(req.query.page) || 1);
    const limit = result.limit ?? (Number(req.query.limit) || 20);
    res.status(200).json(
      new ApiResponse(200, result.items, "Rooms fetched successfully", {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      }),
    );
  });

  readonly getRoom = asyncHandler(async (req: Request, res: Response) => {
    const room = await roomService.getRoomById(String(req.params.roomId));
    if (!room) throw new ApiError(404, "Room not found");
    res
      .status(200)
      .json(new ApiResponse(200, room, "Room fetched successfully"));
  });

  readonly getRoomTimetable = asyncHandler(
    async (req: Request, res: Response) => {
      const entries = await roomService.getRoomTimetable(
        String(req.params.roomId),
        {
          timetableId:
            typeof req.query.timetableId === "string"
              ? req.query.timetableId
              : undefined,
          termId:
            typeof req.query.termId === "string" ? req.query.termId : undefined,
        },
      );
      res
        .status(200)
        .json(
          new ApiResponse(200, entries, "Room timetable fetched successfully"),
        );
    },
  );

  readonly updateRoom = asyncHandler(async (req: Request, res: Response) => {
    const room = await roomService.updateRoom(
      String(req.params.roomId),
      req.body as IRoomUpdate,
    );
    if (!room) throw new ApiError(404, "Room not found");
    res
      .status(200)
      .json(new ApiResponse(200, room, "Room updated successfully"));
  });

  readonly updateRoomProperties = asyncHandler(
    async (req: Request, res: Response) => {
      const room = await roomService.updateRoomProperties(
        String(req.params.roomId),
        req.body as IRoomProperties,
      );
      if (!room) throw new ApiError(404, "Room not found");
      res
        .status(200)
        .json(
          new ApiResponse(200, room, "Room properties updated successfully"),
        );
    },
  );

  readonly deleteRoom = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await roomService.deleteRoom(String(req.params.roomId));
    if (!deleted) throw new ApiError(404, "Room not found");
    res
      .status(200)
      .json(new ApiResponse(200, null, "Room deleted successfully"));
  });
}

export const roomController = new RoomController();
