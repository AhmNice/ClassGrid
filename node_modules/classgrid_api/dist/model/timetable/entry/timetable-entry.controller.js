import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { timetableEntryService } from "./timetable-entry.container.js";
class TimetableEntryController {
    create = asyncHandler(async (req, res) => {
        const { classArmId, teacherId } = req.body;
        const entry = await timetableEntryService.createEntry({
            ...req.body,
            timetableId: String(req.params.timetableId),
        }, { classArmId, teacherId });
        res
            .status(201)
            .json(new ApiResponse(201, entry, "Timetable entry created successfully"));
    });
    update = asyncHandler(async (req, res) => {
        const entry = await timetableEntryService.updateEntry(String(req.params.entryId), req.body);
        res
            .status(200)
            .json(new ApiResponse(200, entry, "Timetable entry updated successfully"));
    });
    delete = asyncHandler(async (req, res) => {
        const entry = await timetableEntryService.deleteEntry(String(req.params.entryId));
        res
            .status(200)
            .json(new ApiResponse(200, entry, "Timetable entry deleted successfully"));
    });
    assignRoom = asyncHandler(async (req, res) => {
        const entry = await timetableEntryService.assignRoom(String(req.params.entryId), String(req.body.roomId));
        res
            .status(200)
            .json(new ApiResponse(200, entry, "Room assigned successfully"));
    });
    getWeeklyEntries = asyncHandler(async (req, res) => {
        const entries = await timetableEntryService.getWeeklyEntries(String(req.params.timetableId));
        res
            .status(200)
            .json(new ApiResponse(200, entries, "Timetable entries fetched successfully"));
    });
    getClassWeeklyEntries = asyncHandler(async (req, res) => {
        const entries = await timetableEntryService.getClassWeeklyEntries(String(req.params.timetableId), String(req.params.classArmId));
        res
            .status(200)
            .json(new ApiResponse(200, entries, "Class timetable entries fetched successfully"));
    });
    getTeacherWeeklyEntries = asyncHandler(async (req, res) => {
        const entries = await timetableEntryService.getTeacherWeeklyEntries(String(req.params.timetableId), String(req.params.teacherId));
        res
            .status(200)
            .json(new ApiResponse(200, entries, "Teacher timetable entries fetched successfully"));
    });
    getRoomWeeklyEntries = asyncHandler(async (req, res) => {
        const entries = await timetableEntryService.getRoomWeeklyEntries(String(req.params.timetableId), String(req.params.roomId));
        res
            .status(200)
            .json(new ApiResponse(200, entries, "Room timetable entries fetched successfully"));
    });
}
export const timetableEntryController = new TimetableEntryController();
