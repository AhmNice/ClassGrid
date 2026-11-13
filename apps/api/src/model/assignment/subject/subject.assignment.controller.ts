import { asyncHandler } from "@/lib/asyncHandler.js";
import { IClassLevelSubjectCreate } from "./subject.assignment.interface.js";
import { subjectAssignmentService } from "./subject.assignment.container.js";
import { ApiResponse } from "@/utils/api-response.js";
import { Request, Response } from "express";

class SubjectAssignmentController {
  readonly createClassLevelSubject = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = String(req?.user?.schoolId);
      const classLevelSubject =
        await subjectAssignmentService.assignSubjectToClassLevel({
          ...(req.body as IClassLevelSubjectCreate),
          schoolId,
        });
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            classLevelSubject,
            "Class level subject created successfully",
          ),
        );
    },
  );
  readonly getAllClassLevelSubjects = asyncHandler(
    async (req: Request, res: Response) => {
      const classLevelSubjects =
        await subjectAssignmentService.getAllSubjectAssignments();
      res.json(
        new ApiResponse(
          200,
          classLevelSubjects,
          "Class level subjects retrieved successfully",
        ),
      );
    },
  );
  readonly updateAllocation = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = String(req?.user?.schoolId);

      await subjectAssignmentService.updateSubjectAssignments({
        schoolId,
        ...req.body,
      });
      res.json(
        new ApiResponse(
          200,
          null,
          "Class level subject allocations updated successfully",
        ),
      );
    },
  );
}
export const subjectAssignmentController = new SubjectAssignmentController();
