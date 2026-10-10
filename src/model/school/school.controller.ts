import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { schoolService } from "./school.service.js";

class SchoolController {
  readonly getWorkingDays = asyncHandler(
    async (req: Request, res: Response) => {
      const school = await schoolService.getWorkingDays(req.params.schoolId);
      res
        .status(200)
        .json(
          new ApiResponse(200, school, "Working days fetched successfully"),
        );
    },
  );

  readonly updateWorkingDays = asyncHandler(
    async (req: Request, res: Response) => {
      const school = await schoolService.updateWorkingDays(
        req.params.schoolId,
        req.body.workingDays,
      );
      res
        .status(200)
        .json(
          new ApiResponse(200, school, "Working days updated successfully"),
        );
    },
  );
}

export const schoolController = new SchoolController();
