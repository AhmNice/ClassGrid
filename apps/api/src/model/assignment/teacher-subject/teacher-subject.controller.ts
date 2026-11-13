import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import type { ITeacherSubjectCreate } from "./teacher-subject.interface.js";
import { teacherSubjectService } from "./teacher-subject.container.js";

class TeacherSubjectController {
  readonly assign = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await teacherSubjectService.assign({
      ...(req.body as Omit<ITeacherSubjectCreate, "schoolId">),
      schoolId: req.user?.schoolId as string,
    });
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          assignment,
          "Teacher subject assignment created successfully",
        ),
      );
  });
  readonly bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
    await teacherSubjectService.bulkUpdate({
      ...(req.body as any),
      schoolId: req.user?.schoolId as string,
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Teacher subject assignments updated successfully",
        ),
      );
  });
  readonly list = asyncHandler(async (req: Request, res: Response) => {
    const assignments = await teacherSubjectService.list(
      req.user?.schoolId as string,
      {
        teacherId:
          typeof req.query.teacherId === "string"
            ? req.query.teacherId
            : undefined,
        subjectId:
          typeof req.query.subjectId === "string"
            ? req.query.subjectId
            : undefined,
      },
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          assignments,
          "Teacher subject assignments fetched successfully",
        ),
      );
  });

  readonly get = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await teacherSubjectService.get(
      req.user?.schoolId as string,
      req.params.teacherSubjectId as string,
    );
    if (!assignment) {
      throw new ApiError(404, "Teacher subject assignment not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          assignment,
          "Teacher subject assignment fetched successfully",
        ),
      );
  });

  readonly remove = asyncHandler(async (req: Request, res: Response) => {
    const removed = await teacherSubjectService.remove(
      req.user?.schoolId as string,
      req.params.teacherSubjectId as string,
    );
    if (!removed) {
      throw new ApiError(404, "Teacher subject assignment not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Teacher subject assignment removed successfully",
        ),
      );
  });
}

export const teacherSubjectController = new TeacherSubjectController();
