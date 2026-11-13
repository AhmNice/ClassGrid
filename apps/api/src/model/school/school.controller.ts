import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ICreateSchool, IUpdateSchool } from "./school.interface.js";
import { schoolService } from "./school.service.js";

class SchoolController {
  readonly createSchool = asyncHandler(async (req: Request, res: Response) => {
    const school = await schoolService.createSchool(req.body as ICreateSchool);
    res
      .status(201)
      .json(new ApiResponse(201, school, "School created successfully"));
  });

  readonly getSchools = asyncHandler(async (_req: Request, res: Response) => {
    const schools = await schoolService.getSchools();
    res
      .status(200)
      .json(new ApiResponse(200, schools, "Schools fetched successfully"));
  });

  readonly getSchool = asyncHandler(async (req: Request, res: Response) => {
    const school = await schoolService.getSchoolById(req.params.schoolId);
    if (!school) throw new ApiError(404, "School not found");
    res
      .status(200)
      .json(new ApiResponse(200, school, "School fetched successfully"));
  });

  readonly updateSchool = asyncHandler(async (req: Request, res: Response) => {
    const school = await schoolService.updateSchool(
      req.params.schoolId,
      req.body as IUpdateSchool,
    );
    if (!school) throw new ApiError(404, "School not found");
    res
      .status(200)
      .json(new ApiResponse(200, school, "School updated successfully"));
  });

  readonly deleteSchool = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await schoolService.deleteSchool(req.params.schoolId);
    if (!deleted) throw new ApiError(404, "School not found");
    res
      .status(200)
      .json(new ApiResponse(200, null, "School deleted successfully"));
  });

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
