import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ApiError } from "@/utils/errorHandler.js";
import { periodScheduleService } from "./schedule.container.js";
class PeriodScheduleController {
    create = asyncHandler(async (req, res) => {
        const schedule = await periodScheduleService.create({
            ...req.body,
            schoolId: String(req.user?.schoolId),
        });
        res
            .status(201)
            .json(new ApiResponse(201, schedule, "Period schedule created successfully"));
    });
    list = asyncHandler(async (req, res) => {
        const schedules = await periodScheduleService.list(String(req.user?.schoolId));
        res
            .status(200)
            .json(new ApiResponse(200, schedules, "Period schedules fetched successfully"));
    });
    get = asyncHandler(async (req, res) => {
        const schedule = await periodScheduleService.findById(String(req.user?.schoolId), String(req.params.scheduleId));
        if (!schedule)
            throw new ApiError(404, "Period schedule not found");
        res
            .status(200)
            .json(new ApiResponse(200, schedule, "Period schedule fetched successfully"));
    });
    update = asyncHandler(async (req, res) => {
        const schedule = await periodScheduleService.update(String(req.user?.schoolId), String(req.params.scheduleId), req.body);
        if (!schedule)
            throw new ApiError(404, "Period schedule not found");
        res
            .status(200)
            .json(new ApiResponse(200, schedule, "Period schedule updated successfully"));
    });
    delete = asyncHandler(async (req, res) => {
        const deleted = await periodScheduleService.delete(String(req.user?.schoolId), String(req.params.scheduleId));
        if (!deleted)
            throw new ApiError(404, "Period schedule not found");
        res
            .status(200)
            .json(new ApiResponse(200, null, "Period schedule deleted successfully"));
    });
}
export const periodScheduleController = new PeriodScheduleController();
