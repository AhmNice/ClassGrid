import { asyncHandler } from "@/lib/asyncHandler.js";
import { normalizeListQuery } from "@/types/pagination.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { subjectService } from "./subject.container.js";
class SubjectController {
    createSubject = asyncHandler(async (req, res) => {
        const schoolId = req?.user?.schoolId;
        if (!schoolId) {
            throw new ApiError(400, "schoolId is required");
        }
        const subject = await subjectService.createSubject({
            ...req.body,
            schoolId,
        });
        res
            .status(201)
            .json(new ApiResponse(201, subject, "Subject created successfully"));
    });
    getSubjects = asyncHandler(async (req, res) => {
        const schoolId = req?.user?.schoolId;
        if (!schoolId) {
            throw new ApiError(400, "schoolId is required");
        }
        const result = await subjectService.getSubjects({
            ...normalizeListQuery({
                query: typeof req.query.query === "string" ? req.query.query : undefined,
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
                sortOrder: req.query.sortOrder === "desc" || req.query.sortOrder === "asc"
                    ? req.query.sortOrder
                    : undefined,
            }),
            schoolId: schoolId,
            isActive: req.query.isActive === "true"
                ? true
                : req.query.isActive === "false"
                    ? false
                    : undefined,
        });
        const page = result.page ?? (Number(req.query.page) || 1);
        const limit = result.limit ?? (Number(req.query.limit) || 20);
        res.status(200).json(new ApiResponse(200, result.items, "Subjects fetched successfully", {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
        }));
    });
    getSubject = asyncHandler(async (req, res) => {
        const subject = await subjectService.getSubjectById(String(req.params.subjectId));
        if (!subject)
            throw new ApiError(404, "Subject not found");
        res
            .status(200)
            .json(new ApiResponse(200, subject, "Subject fetched successfully"));
    });
    updateSubject = asyncHandler(async (req, res) => {
        const subject = await subjectService.updateSubject(String(req.params.subjectId), req.body);
        if (!subject)
            throw new ApiError(404, "Subject not found");
        res
            .status(200)
            .json(new ApiResponse(200, subject, "Subject updated successfully"));
    });
    updateSchedulingRequirements = asyncHandler(async (req, res) => {
        const subject = await subjectService.updateSchedulingRequirements(String(req.params.subjectId), req.body);
        if (!subject)
            throw new ApiError(404, "Subject not found");
        res
            .status(200)
            .json(new ApiResponse(200, subject, "Subject scheduling requirements updated successfully"));
    });
    deleteSubject = asyncHandler(async (req, res) => {
        const deleted = await subjectService.deleteSubject(String(String(req.params.subjectId)));
        if (!deleted)
            throw new ApiError(404, "Subject not found");
        res
            .status(200)
            .json(new ApiResponse(200, null, "Subject deleted successfully"));
    });
}
export const subjectController = new SubjectController();
