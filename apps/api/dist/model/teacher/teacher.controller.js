import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import { normalizeListQuery } from "@/types/pagination.js";
import { teacherService } from "./teacher.container.js";
class TeacherController {
    createTeacher = asyncHandler(async (req, res) => {
        const schoolId = req?.user?.schoolId;
        if (!schoolId) {
            throw new ApiError(400, "schoolId is required");
        }
        const teacher = await teacherService.createTeacher({
            ...req.body,
            schoolId,
        });
        res
            .status(201)
            .json(new ApiResponse(201, teacher, "Teacher created successfully"));
    });
    getTeachers = asyncHandler(async (req, res) => {
        const result = await teacherService.getTeachers(normalizeListQuery({
            query: typeof req.query.query === "string" ? req.query.query : undefined,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
            sortOrder: req.query.sortOrder === "desc" || req.query.sortOrder === "asc"
                ? req.query.sortOrder
                : undefined,
        }));
        const page = result.page ?? (Number(req.query.page) || 1);
        const limit = result.limit ?? (Number(req.query.limit) || 20);
        res.status(200).json(new ApiResponse(200, result.items, "Teachers fetched successfully", {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
        }));
    });
    getTeacher = asyncHandler(async (req, res) => {
        const teacher = await teacherService.getTeacherById(req.params.teacherId);
        if (!teacher)
            throw new ApiError(404, "Teacher not found");
        res
            .status(200)
            .json(new ApiResponse(200, teacher, "Teacher fetched successfully"));
    });
    updateTeacher = asyncHandler(async (req, res) => {
        const teacher = await teacherService.updateTeacher(req.params.teacherId, req.body);
        if (!teacher)
            throw new ApiError(404, "Teacher not found");
        res
            .status(200)
            .json(new ApiResponse(200, teacher, "Teacher updated successfully"));
    });
    deleteTeacher = asyncHandler(async (req, res) => {
        const deleted = await teacherService.deleteTeacher(req.params.teacherId);
        if (!deleted)
            throw new ApiError(404, "Teacher not found");
        res
            .status(200)
            .json(new ApiResponse(200, null, "Teacher deleted successfully"));
    });
}
export const teacherController = new TeacherController();
