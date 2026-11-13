import { asyncHandler } from "@/lib/asyncHandler.js";
import { normalizeListQuery } from "@/types/pagination.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { classLevelService } from "./class.container.js";
class ClassLevelController {
    createClassLevel = asyncHandler(async (req, res) => {
        const classLevel = await classLevelService.createClassLevel({
            ...req.body,
            schoolId: String(req.user?.schoolId),
        });
        res
            .status(201)
            .json(new ApiResponse(201, classLevel, "Class level created successfully"));
    });
    getClassLevels = asyncHandler(async (req, res) => {
        const result = await classLevelService.getClassLevels(String(req.user?.schoolId), normalizeListQuery({
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
        res.status(200).json(new ApiResponse(200, result.items, "Class levels fetched successfully", {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
        }));
    });
    getClassLevel = asyncHandler(async (req, res) => {
        const classLevel = await classLevelService.getClassLevelById(String(req.params.classLevelId));
        if (!classLevel)
            throw new ApiError(404, "Class level not found");
        res
            .status(200)
            .json(new ApiResponse(200, classLevel, "Class level fetched successfully"));
    });
    updateClassLevel = asyncHandler(async (req, res) => {
        const classLevel = await classLevelService.updateClassLevel(String(req.params.classLevelId), req.body);
        if (!classLevel)
            throw new ApiError(404, "Class level not found");
        res
            .status(200)
            .json(new ApiResponse(200, classLevel, "Class level updated successfully"));
    });
    deleteClassLevel = asyncHandler(async (req, res) => {
        const deleted = await classLevelService.deleteClassLevel(String(req.params.classLevelId));
        if (!deleted)
            throw new ApiError(404, "Class level not found");
        res
            .status(200)
            .json(new ApiResponse(200, null, "Class level deleted successfully"));
    });
}
export const classLevelController = new ClassLevelController();
