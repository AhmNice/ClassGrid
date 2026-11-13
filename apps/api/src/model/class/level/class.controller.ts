import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { normalizeListQuery } from "@/types/pagination.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import {
  IClassLevelCreate,
  IClassLevelListQuery,
  IClassLevelUpdate,
} from "./class.interface.js";
import { classLevelService } from "./class.container.js";

class ClassLevelController {
  readonly createClassLevel = asyncHandler(
    async (req: Request, res: Response) => {
      const classLevel = await classLevelService.createClassLevel({
        ...(req.body as Omit<IClassLevelCreate, "schoolId">),
        schoolId: String(req.user?.schoolId),
      });
      res
        .status(201)
        .json(
          new ApiResponse(201, classLevel, "Class level created successfully"),
        );
    },
  );

  readonly getClassLevels = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await classLevelService.getClassLevels(
        String(req.user?.schoolId),
        normalizeListQuery({
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
        }) as IClassLevelListQuery,
      );
      const page = result.page ?? (Number(req.query.page) || 1);
      const limit = result.limit ?? (Number(req.query.limit) || 20);
      res.status(200).json(
        new ApiResponse(
          200,
          result.items,
          "Class levels fetched successfully",
          {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        ),
      );
    },
  );

  readonly getClassLevel = asyncHandler(async (req: Request, res: Response) => {
    const classLevel = await classLevelService.getClassLevelById(
      String(req.params.classLevelId),
    );
    if (!classLevel) throw new ApiError(404, "Class level not found");
    res
      .status(200)
      .json(
        new ApiResponse(200, classLevel, "Class level fetched successfully"),
      );
  });

  readonly updateClassLevel = asyncHandler(
    async (req: Request, res: Response) => {
      const classLevel = await classLevelService.updateClassLevel(
        String(req.params.classLevelId),
        req.body as IClassLevelUpdate,
      );
      if (!classLevel) throw new ApiError(404, "Class level not found");
      res
        .status(200)
        .json(
          new ApiResponse(200, classLevel, "Class level updated successfully"),
        );
    },
  );

  readonly deleteClassLevel = asyncHandler(
    async (req: Request, res: Response) => {
      const deleted = await classLevelService.deleteClassLevel(
        String(req.params.classLevelId),
      );
      if (!deleted) throw new ApiError(404, "Class level not found");
      res
        .status(200)
        .json(new ApiResponse(200, null, "Class level deleted successfully"));
    },
  );
}

export const classLevelController = new ClassLevelController();
