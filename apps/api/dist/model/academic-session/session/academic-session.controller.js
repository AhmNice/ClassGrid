import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { academicSessionService } from "./academic-session.service.js";
/**
 * The school always comes from the logged-in user, never from the request
 * body or URL. Adjust the `user` shape here to match what your auth
 * middleware sets, or move this into that middleware.
 */
const getSchoolId = (req) => {
    const user = req.user;
    if (!user?.schoolId) {
        console.error("No school ID found in user object");
        throw new ApiError(401, "You must be signed in to a school to do this");
    }
    return user.schoolId;
};
class AcademicSessionController {
    createAcademicSession = asyncHandler(async (req, res) => {
        const session = await academicSessionService.createAcademicSession(getSchoolId(req), req.body);
        res
            .status(201)
            .json(new ApiResponse(201, session, "Academic session created successfully"));
    });
    getAcademicSessions = asyncHandler(async (req, res) => {
        const sessions = await academicSessionService.getAcademicSessions(getSchoolId(req));
        res
            .status(200)
            .json(new ApiResponse(200, sessions, "Academic sessions fetched successfully"));
    });
    getCurrentAcademicSession = asyncHandler(async (req, res) => {
        const session = await academicSessionService.currentAcademicSession(getSchoolId(req));
        // Having no current session is a normal state (a new school, or between
        // sessions), so this is a 200 with null data, not an error.
        res
            .status(200)
            .json(new ApiResponse(200, session, session
            ? "Current academic session fetched successfully"
            : "No current academic session"));
    });
    getAcademicSession = asyncHandler(async (req, res) => {
        const session = await academicSessionService.getAcademicSessionById(getSchoolId(req), String(req.params.sessionId));
        if (!session)
            throw new ApiError(404, "Academic session not found");
        res
            .status(200)
            .json(new ApiResponse(200, session, "Academic session fetched successfully"));
    });
    updateAcademicSession = asyncHandler(async (req, res) => {
        const session = await academicSessionService.updateAcademicSession(getSchoolId(req), String(req.params.sessionId), req.body);
        if (!session)
            throw new ApiError(404, "Academic session not found");
        res
            .status(200)
            .json(new ApiResponse(200, session, "Academic session updated successfully"));
    });
    deleteAcademicSession = asyncHandler(async (req, res) => {
        const deleted = await academicSessionService.deleteAcademicSession(getSchoolId(req), String(req.params.sessionId));
        if (!deleted)
            throw new ApiError(404, "Academic session not found");
        res
            .status(200)
            .json(new ApiResponse(200, null, "Academic session deleted successfully"));
    });
    activateAcademicSession = asyncHandler(async (req, res) => {
        const session = await academicSessionService.activateAcademicSession(getSchoolId(req), String(req.params.sessionId));
        if (!session)
            throw new ApiError(404, "Academic session not found");
        res
            .status(200)
            .json(new ApiResponse(200, session, "Academic session activated successfully"));
    });
}
export const academicSessionController = new AcademicSessionController();
