import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { normalizeListQuery } from "@/types/pagination.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import {
  IPeriodCreate,
  IPeriodReorder,
  IPeriodUpdate,
} from "./period.interface.js";
import { periodService } from "./period.container.js";

class PeriodController {
  readonly createPeriod = asyncHandler(async (req: Request, res: Response) => {
    const period = await periodService.createPeriod(req.body as IPeriodCreate);
    res
      .status(201)
      .json(new ApiResponse(201, period, "Period created successfully"));
  });

  readonly getPeriods = asyncHandler(async (req: Request, res: Response) => {
    const result = await periodService.getPeriods({
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
      kind:
        typeof req.query.kind === "string"
          ? (req.query.kind as IPeriodCreate["kind"])
          : undefined,
      isActive:
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
            ? false
            : undefined,
    });
    const page = result.page ?? (Number(req.query.page) || 1);
    const limit = result.limit ?? (Number(req.query.limit) || 20);
    res.status(200).json(
      new ApiResponse(200, result.items, "Periods fetched successfully", {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      }),
    );
  });

  readonly getPeriod = asyncHandler(async (req: Request, res: Response) => {
    const period = await periodService.getPeriodById(
      String(req.params.periodId),
    );
    if (!period) throw new ApiError(404, "Period not found");
    res
      .status(200)
      .json(new ApiResponse(200, period, "Period fetched successfully"));
  });

  readonly reorderPeriods = asyncHandler(
    async (req: Request, res: Response) => {
      const periods = await periodService.reorderPeriods(
        req.body as IPeriodReorder,
      );
      res
        .status(200)
        .json(new ApiResponse(200, periods, "Periods reordered successfully"));
    },
  );

  readonly updatePeriod = asyncHandler(async (req: Request, res: Response) => {
    const period = await periodService.updatePeriod(
      String(req.params.periodId),
      req.body as IPeriodUpdate,
    );
    if (!period) throw new ApiError(404, "Period not found");
    res
      .status(200)
      .json(new ApiResponse(200, period, "Period updated successfully"));
  });

  readonly deletePeriod = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await periodService.deletePeriod(
      String(req.params.periodId),
    );
    if (!deleted) throw new ApiError(404, "Period not found");
    res
      .status(200)
      .json(new ApiResponse(200, null, "Period deleted successfully"));
  });
}

export const periodController = new PeriodController();
