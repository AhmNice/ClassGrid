import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import {
  ITeacherAvailabilityCreate,
  ITeacherAvailabilityUpdate,
} from "./availability.interface.js";
import { teacherAvailabilityService } from "./availability.service.js";

class TeacherAvailabilityController {
  readonly create = asyncHandler(async (req: Request, res: Response) => {
    const availability = await teacherAvailabilityService.create({
      ...(req.body as Omit<ITeacherAvailabilityCreate, "teacherId">),
      teacherId: req.params.teacherId,
    });
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          availability,
          "Teacher availability created successfully",
        ),
      );
  });

  readonly list = asyncHandler(async (req: Request, res: Response) => {
    const availability = await teacherAvailabilityService.list(
      req.params.teacherId,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          availability,
          "Teacher availability fetched successfully",
        ),
      );
  });

  readonly get = asyncHandler(async (req: Request, res: Response) => {
    const availability = await teacherAvailabilityService.findById(
      req.params.teacherId,
      req.params.availabilityId,
    );
    if (!availability)
      throw new ApiError(404, "Teacher availability not found");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          availability,
          "Teacher availability fetched successfully",
        ),
      );
  });

  readonly update = asyncHandler(async (req: Request, res: Response) => {
    const availability = await teacherAvailabilityService.update(
      req.params.teacherId,
      req.params.availabilityId,
      req.body as ITeacherAvailabilityUpdate,
    );
    if (!availability)
      throw new ApiError(404, "Teacher availability not found");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          availability,
          "Teacher availability updated successfully",
        ),
      );
  });

  readonly delete = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await teacherAvailabilityService.delete(
      req.params.teacherId,
      req.params.availabilityId,
    );
    if (!deleted) throw new ApiError(404, "Teacher availability not found");
    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Teacher availability deleted successfully"),
      );
  });
}

export const teacherAvailabilityController =
  new TeacherAvailabilityController();
