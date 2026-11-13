import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import {
  IClassArmCreate,
  IClassArmListQuery,
  IClassArmUpdate,
} from "./arm.interface.js";
import { classArmService } from "./arm.service.js";
import { normalizeListQuery } from "@/types/pagination.js";

class ClassArmController {
  readonly createClassArm = asyncHandler(
    async (req: Request, res: Response) => {
      const arm = await classArmService.createClassArm({
        ...(req.body as Omit<IClassArmCreate, "classLevelId">),
        classLevelId: String(req.params.classLevelId),
      });
      res
        .status(201)
        .json(new ApiResponse(201, arm, "Class arm created successfully"));
    },
  );

  readonly getClassArms = asyncHandler(async (req: Request, res: Response) => {
    const result = await classArmService.getClassArms(
      String(req.params.classLevelId),
      {
        ...normalizeListQuery({
          ...(req.query as Record<string, string>),
          page: req.query.page ? Number(req.query.page) : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        }),
        isActive:
          req.query.isActive === undefined
            ? undefined
            : req.query.isActive === "true",
      } as IClassArmListQuery,
    );
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    res.status(200).json(
      new ApiResponse(200, result.items, "Class arms fetched successfully", {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      }),
    );
  });
  readonly getAllClassArms = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await classArmService.getAllClassArms({
        ...normalizeListQuery({
          ...(req.query as Record<string, string>),
          page: req.query.page ? Number(req.query.page) : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        }),
        isActive:
          req.query.isActive === undefined
            ? undefined
            : req.query.isActive === "true",
      } as IClassArmListQuery);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      res.status(200).json(
        new ApiResponse(200, result.items, "Class arms fetched successfully", {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        }),
      );
    },
  );

  readonly getClassArm = asyncHandler(async (req: Request, res: Response) => {
    const arm = await classArmService.getClassArmById(
      String(req.params.classLevelId),
      String(req.params.armId),
    );
    if (!arm) throw new ApiError(404, "Class arm not found");
    res
      .status(200)
      .json(new ApiResponse(200, arm, "Class arm fetched successfully"));
  });

  readonly updateClassArm = asyncHandler(
    async (req: Request, res: Response) => {
      const arm = await classArmService.updateClassArm(
        String(req.params.classLevelId),
        String(req.params.armId),
        req.body as IClassArmUpdate,
      );
      if (!arm) throw new ApiError(404, "Class arm not found");
      res
        .status(200)
        .json(new ApiResponse(200, arm, "Class arm updated successfully"));
    },
  );

  readonly deleteClassArm = asyncHandler(
    async (req: Request, res: Response) => {
      const deleted = await classArmService.deleteClassArm(
        String(req.params.classLevelId),
        String(req.params.armId),
      );
      if (!deleted) throw new ApiError(404, "Class arm not found");
      res
        .status(200)
        .json(new ApiResponse(200, null, "Class arm deleted successfully"));
    },
  );
}

export const classArmController = new ClassArmController();
