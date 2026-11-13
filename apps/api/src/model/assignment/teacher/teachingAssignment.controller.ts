import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import type {
  ITeachingAssignmentCreate,
  ITeachingAssignmentUpdate,
} from "./teachingAssignment.interface.js";
import { teachingAssignmentService } from "./teachingAssignment.container.js";

class TeachingAssignmentController {
  readonly create = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await teachingAssignmentService.createTeachingAssignment(
      req.body as ITeachingAssignmentCreate,
      String(req.user?.schoolId),
    );
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          assignment,
          "Teaching assignment created successfully",
        ),
      );
  });

  readonly list = asyncHandler(async (req: Request, res: Response) => {
    const assignments = await teachingAssignmentService.listTeachingAssignments(
      String(req.user?.schoolId),
      {
        sessionId:
          typeof req.query.sessionId === "string"
            ? req.query.sessionId
            : undefined,
        teacherId:
          typeof req.query.teacherId === "string"
            ? req.query.teacherId
            : undefined,
        subjectId:
          typeof req.query.subjectId === "string"
            ? req.query.subjectId
            : undefined,
        classArmId:
          typeof req.query.classArmId === "string"
            ? req.query.classArmId
            : undefined,
        isActive:
          req.query.isActive === "true"
            ? true
            : req.query.isActive === "false"
              ? false
              : undefined,
      },
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          assignments,
          "Teaching assignments fetched successfully",
        ),
      );
  });

  readonly get = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await teachingAssignmentService.getTeachingAssignment(
      String(req.params.assignmentId),
      String(req.user?.schoolId),
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          assignment,
          "Teaching assignment fetched successfully",
        ),
      );
  });

  readonly getTeacherAssignments = asyncHandler(
    async (req: Request, res: Response) => {
      const assignments =
        await teachingAssignmentService.getTeacherTeachingAssignments(
          String(req.user?.schoolId),
          String(req.params.teacherId),
          typeof req.query.sessionId === "string"
            ? req.query.sessionId
            : undefined,
        );
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            assignments,
            "Teacher assignments fetched successfully",
          ),
        );
    },
  );

  readonly getClassAssignments = asyncHandler(
    async (req: Request, res: Response) => {
      const assignments =
        await teachingAssignmentService.getClassTeachingAssignments(
          String(req.user?.schoolId),
          String(req.params.sessionId),
          String(req.params.classLevelId),
          String(req.params.classArmId),
        );
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            assignments,
            "Teaching assignments fetched successfully",
          ),
        );
    },
  );

  readonly unassign = asyncHandler(async (req: Request, res: Response) => {
    const assignment =
      await teachingAssignmentService.unassignTeachingAssignment(
        String(req.params.assignmentId),
        String(req.user?.schoolId),
      );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          assignment,
          "Teaching assignment unassigned successfully",
        ),
      );
  });

  readonly update = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await teachingAssignmentService.updateTeachingAssignment(
      String(req.params.assignmentId),
      String(req.user?.schoolId),
      req.body as ITeachingAssignmentUpdate,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          assignment,
          "Teaching assignment updated successfully",
        ),
      );
  });
}

export const teachingAssignmentController = new TeachingAssignmentController();
