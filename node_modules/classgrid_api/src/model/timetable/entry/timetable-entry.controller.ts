import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { timetableEntryService } from "./timetable-entry.container.js";
import type {
  ITimetableEntryCreate,
  ITimetableEntryUpdate,
} from "./timetable-entry.interface.js";

class TimetableEntryController {
  readonly create = asyncHandler(async (req: Request, res: Response) => {
    const { classArmId, teacherId } = req.body;
    const entry = await timetableEntryService.createEntry(
      {
        ...(req.body as ITimetableEntryCreate),
        timetableId: String(req.params.timetableId),
      },
      { classArmId, teacherId },
    );
    res
      .status(201)
      .json(
        new ApiResponse(201, entry, "Timetable entry created successfully"),
      );
  });

  readonly update = asyncHandler(async (req: Request, res: Response) => {
    const entry = await timetableEntryService.updateEntry(
      String(req.params.entryId),
      req.body as ITimetableEntryUpdate,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, entry, "Timetable entry updated successfully"),
      );
  });

  readonly delete = asyncHandler(async (req: Request, res: Response) => {
    const entry = await timetableEntryService.deleteEntry(
      String(req.params.entryId),
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, entry, "Timetable entry deleted successfully"),
      );
  });

  readonly assignRoom = asyncHandler(async (req: Request, res: Response) => {
    const entry = await timetableEntryService.assignRoom(
      String(req.params.entryId),
      String(req.body.roomId),
    );
    res
      .status(200)
      .json(new ApiResponse(200, entry, "Room assigned successfully"));
  });

  readonly getWeeklyEntries = asyncHandler(
    async (req: Request, res: Response) => {
      const entries = await timetableEntryService.getWeeklyEntries(
        String(req.params.timetableId),
      );
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            entries,
            "Timetable entries fetched successfully",
          ),
        );
    },
  );

  readonly getClassWeeklyEntries = asyncHandler(
    async (req: Request, res: Response) => {
      const entries = await timetableEntryService.getClassWeeklyEntries(
        String(req.params.timetableId),
        String(req.params.classArmId),
      );
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            entries,
            "Class timetable entries fetched successfully",
          ),
        );
    },
  );

  readonly getTeacherWeeklyEntries = asyncHandler(
    async (req: Request, res: Response) => {
      const entries = await timetableEntryService.getTeacherWeeklyEntries(
        String(req.params.timetableId),
        String(req.params.teacherId),
      );
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            entries,
            "Teacher timetable entries fetched successfully",
          ),
        );
    },
  );

  readonly getRoomWeeklyEntries = asyncHandler(
    async (req: Request, res: Response) => {
      const entries = await timetableEntryService.getRoomWeeklyEntries(
        String(req.params.timetableId),
        String(req.params.roomId),
      );
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            entries,
            "Room timetable entries fetched successfully",
          ),
        );
    },
  );
}

export const timetableEntryController = new TimetableEntryController();
