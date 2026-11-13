import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { timetableService } from "./timetable.container.js";
import {
  ITimetableCreate,
  ITimetableListQuery,
  ITimetableUpdate,
} from "./timetable.interface.js";

class TimetableController {
  readonly list = asyncHandler(async (req: Request, res: Response) => {
    const timetables = await timetableService.getTimetables({
      schoolId: String(req.user?.schoolId),
      sessionId:
        typeof req.query.sessionId === "string"
          ? req.query.sessionId
          : undefined,
      termId:
        typeof req.query.termId === "string" ? req.query.termId : undefined,
    } as ITimetableListQuery);
    res
      .status(200)
      .json(
        new ApiResponse(200, timetables, "Timetables fetched successfully"),
      );
  });

  readonly create = asyncHandler(async (req: Request, res: Response) => {
    const timetable = await timetableService.createTimetable(
      req.body as ITimetableCreate,
    );
    res
      .status(201)
      .json(new ApiResponse(201, timetable, "Timetable created successfully"));
  });

  readonly update = asyncHandler(async (req: Request, res: Response) => {
    const timetable = await timetableService.updateDraftTimetable(
      String(req.params.timetableId),
      req.body as ITimetableUpdate,
    );
    res
      .status(200)
      .json(new ApiResponse(200, timetable, "Timetable updated successfully"));
  });

  readonly duplicate = asyncHandler(async (req: Request, res: Response) => {
    const timetable = await timetableService.duplicateTimetable(
      String(req.params.timetableId),
      req.body.name,
    );
    res
      .status(201)
      .json(
        new ApiResponse(201, timetable, "Timetable duplicated successfully"),
      );
  });

  readonly publish = asyncHandler(async (req: Request, res: Response) => {
    const timetable = await timetableService.publishTimetable(
      String(req.params.timetableId),
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, timetable, "Timetable published successfully"),
      );
  });

  readonly archive = asyncHandler(async (req: Request, res: Response) => {
    const timetable = await timetableService.archiveTimetable(
      String(req.params.timetableId),
    );
    res
      .status(200)
      .json(new ApiResponse(200, timetable, "Timetable archived successfully"));
  });
}

export const timetableController = new TimetableController();
