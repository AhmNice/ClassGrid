import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import { teacherSubjectService } from "./teacher-subject.container.js";
class TeacherSubjectController {
    assign = asyncHandler(async (req, res) => {
        const assignment = await teacherSubjectService.assign({
            ...req.body,
            schoolId: req.user?.schoolId,
        });
        res
            .status(201)
            .json(new ApiResponse(201, assignment, "Teacher subject assignment created successfully"));
    });
    bulkUpdate = asyncHandler(async (req, res) => {
        await teacherSubjectService.bulkUpdate({
            ...req.body,
            schoolId: req.user?.schoolId,
        });
        res
            .status(200)
            .json(new ApiResponse(200, null, "Teacher subject assignments updated successfully"));
    });
    list = asyncHandler(async (req, res) => {
        const assignments = await teacherSubjectService.list(req.user?.schoolId, {
            teacherId: typeof req.query.teacherId === "string"
                ? req.query.teacherId
                : undefined,
            subjectId: typeof req.query.subjectId === "string"
                ? req.query.subjectId
                : undefined,
        });
        res
            .status(200)
            .json(new ApiResponse(200, assignments, "Teacher subject assignments fetched successfully"));
    });
    get = asyncHandler(async (req, res) => {
        const assignment = await teacherSubjectService.get(req.user?.schoolId, req.params.teacherSubjectId);
        if (!assignment) {
            throw new ApiError(404, "Teacher subject assignment not found");
        }
        res
            .status(200)
            .json(new ApiResponse(200, assignment, "Teacher subject assignment fetched successfully"));
    });
    remove = asyncHandler(async (req, res) => {
        const removed = await teacherSubjectService.remove(req.user?.schoolId, req.params.teacherSubjectId);
        if (!removed) {
            throw new ApiError(404, "Teacher subject assignment not found");
        }
        res
            .status(200)
            .json(new ApiResponse(200, null, "Teacher subject assignment removed successfully"));
    });
}
export const teacherSubjectController = new TeacherSubjectController();
