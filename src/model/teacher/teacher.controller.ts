import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ITeacherCreate, ITeacherUpdate } from "./teacher.interface.js";
import { normalizeListQuery } from "@/types/pagination.js";
import { teacherService } from "./teacher.container.js";

class TeacherController {
  readonly createTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacher = await teacherService.createTeacher(
      req.body as ITeacherCreate,
    );
    res
      .status(201)
      .json(new ApiResponse(201, teacher, "Teacher created successfully"));
  });

  readonly getTeachers = asyncHandler(async (req: Request, res: Response) => {
    const result = await teacherService.getTeachers(
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
      }),
    );
    const page = result.page ?? (Number(req.query.page) || 1);
    const limit = result.limit ?? (Number(req.query.limit) || 20);
    res.status(200).json(
      new ApiResponse(200, result.items, "Teachers fetched successfully", {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      }),
    );
  });

  readonly getTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacher = await teacherService.getTeacherById(
      req.params.teacherId as string,
    );
    if (!teacher) throw new ApiError(404, "Teacher not found");
    res
      .status(200)
      .json(new ApiResponse(200, teacher, "Teacher fetched successfully"));
  });

  readonly updateTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacher = await teacherService.updateTeacher(
      req.params.teacherId as string,
      req.body as ITeacherUpdate,
    );
    if (!teacher) throw new ApiError(404, "Teacher not found");
    res
      .status(200)
      .json(new ApiResponse(200, teacher, "Teacher updated successfully"));
  });

  readonly deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await teacherService.deleteTeacher(
      req.params.teacherId as string,
    );
    if (!deleted) throw new ApiError(404, "Teacher not found");
    res
      .status(200)
      .json(new ApiResponse(200, null, "Teacher deleted successfully"));
  });
}

export const teacherController = new TeacherController();
