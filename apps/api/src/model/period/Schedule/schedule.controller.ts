import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import type {
  IPeriodScheduleCreate,
  IPeriodScheduleUpdate,
} from "./schedule.interface.js";
import { periodScheduleService } from "./schedule.container.js";

class PeriodScheduleController {
  readonly create = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await periodScheduleService.create({
      ...(req.body as Omit<IPeriodScheduleCreate, "schoolId">),
      schoolId: String(req.user?.schoolId),
    });
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          schedule,
          "Period schedule created successfully",
        ),
      );
  });

  readonly list = asyncHandler(async (req: Request, res: Response) => {
    const schedules = await periodScheduleService.list(
      String(req.user?.schoolId),
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          schedules,
          "Period schedules fetched successfully",
        ),
      );
  });

  readonly get = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await periodScheduleService.findById(
      String(req.user?.schoolId),
      String(req.params.scheduleId),
    );
    if (!schedule) throw new ApiError(404, "Period schedule not found");
    res
      .status(200)
      .json(
        new ApiResponse(200, schedule, "Period schedule fetched successfully"),
      );
  });

  readonly update = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await periodScheduleService.update(
      String(req.user?.schoolId),
      String(req.params.scheduleId),
      req.body as IPeriodScheduleUpdate,
    );
    if (!schedule) throw new ApiError(404, "Period schedule not found");
    res
      .status(200)
      .json(
        new ApiResponse(200, schedule, "Period schedule updated successfully"),
      );
  });

  readonly delete = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await periodScheduleService.delete(
      String(req.user?.schoolId),
      String(req.params.scheduleId),
    );
    if (!deleted) throw new ApiError(404, "Period schedule not found");
    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Period schedule deleted successfully"),
      );
  });
}

export const periodScheduleController = new PeriodScheduleController();
