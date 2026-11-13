import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { timetableService } from "./timetable.container.js";
class TimetableController {
    list = asyncHandler(async (req, res) => {
        const timetables = await timetableService.getTimetables({
            schoolId: String(req.user?.schoolId),
            sessionId: typeof req.query.sessionId === "string"
                ? req.query.sessionId
                : undefined,
            termId: typeof req.query.termId === "string" ? req.query.termId : undefined,
        });
        res
            .status(200)
            .json(new ApiResponse(200, timetables, "Timetables fetched successfully"));
    });
    create = asyncHandler(async (req, res) => {
        const timetable = await timetableService.createTimetable(req.body);
        res
            .status(201)
            .json(new ApiResponse(201, timetable, "Timetable created successfully"));
    });
    update = asyncHandler(async (req, res) => {
        const timetable = await timetableService.updateDraftTimetable(String(req.params.timetableId), req.body);
        res
            .status(200)
            .json(new ApiResponse(200, timetable, "Timetable updated successfully"));
    });
    duplicate = asyncHandler(async (req, res) => {
        const timetable = await timetableService.duplicateTimetable(String(req.params.timetableId), req.body.name);
        res
            .status(201)
            .json(new ApiResponse(201, timetable, "Timetable duplicated successfully"));
    });
    publish = asyncHandler(async (req, res) => {
        const timetable = await timetableService.publishTimetable(String(req.params.timetableId));
        res
            .status(200)
            .json(new ApiResponse(200, timetable, "Timetable published successfully"));
    });
    archive = asyncHandler(async (req, res) => {
        const timetable = await timetableService.archiveTimetable(String(req.params.timetableId));
        res
            .status(200)
            .json(new ApiResponse(200, timetable, "Timetable archived successfully"));
    });
}
export const timetableController = new TimetableController();
