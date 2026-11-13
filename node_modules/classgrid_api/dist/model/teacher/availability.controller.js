import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import { teacherAvailabilityService } from "./availability.service.js";
class TeacherAvailabilityController {
    create = asyncHandler(async (req, res) => {
        const availability = await teacherAvailabilityService.create({
            ...req.body,
            teacherId: req.params.teacherId,
        });
        res
            .status(201)
            .json(new ApiResponse(201, availability, "Teacher availability created successfully"));
    });
    list = asyncHandler(async (req, res) => {
        const availability = await teacherAvailabilityService.list(req.params.teacherId);
        res
            .status(200)
            .json(new ApiResponse(200, availability, "Teacher availability fetched successfully"));
    });
    get = asyncHandler(async (req, res) => {
        const availability = await teacherAvailabilityService.findById(req.params.teacherId, req.params.availabilityId);
        if (!availability)
            throw new ApiError(404, "Teacher availability not found");
        res
            .status(200)
            .json(new ApiResponse(200, availability, "Teacher availability fetched successfully"));
    });
    update = asyncHandler(async (req, res) => {
        const availability = await teacherAvailabilityService.update(req.params.teacherId, req.params.availabilityId, req.body);
        if (!availability)
            throw new ApiError(404, "Teacher availability not found");
        res
            .status(200)
            .json(new ApiResponse(200, availability, "Teacher availability updated successfully"));
    });
    delete = asyncHandler(async (req, res) => {
        const deleted = await teacherAvailabilityService.delete(req.params.teacherId, req.params.availabilityId);
        if (!deleted)
            throw new ApiError(404, "Teacher availability not found");
        res
            .status(200)
            .json(new ApiResponse(200, null, "Teacher availability deleted successfully"));
    });
}
export const teacherAvailabilityController = new TeacherAvailabilityController();
