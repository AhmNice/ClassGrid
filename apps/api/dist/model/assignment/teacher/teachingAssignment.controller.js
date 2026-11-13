import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { teachingAssignmentService } from "./teachingAssignment.container.js";
class TeachingAssignmentController {
    create = asyncHandler(async (req, res) => {
        const assignment = await teachingAssignmentService.createTeachingAssignment(req.body, String(req.user?.schoolId));
        res
            .status(201)
            .json(new ApiResponse(201, assignment, "Teaching assignment created successfully"));
    });
    list = asyncHandler(async (req, res) => {
        const assignments = await teachingAssignmentService.listTeachingAssignments(String(req.user?.schoolId), {
            sessionId: typeof req.query.sessionId === "string"
                ? req.query.sessionId
                : undefined,
            teacherId: typeof req.query.teacherId === "string"
                ? req.query.teacherId
                : undefined,
            subjectId: typeof req.query.subjectId === "string"
                ? req.query.subjectId
                : undefined,
            classArmId: typeof req.query.classArmId === "string"
                ? req.query.classArmId
                : undefined,
            isActive: req.query.isActive === "true"
                ? true
                : req.query.isActive === "false"
                    ? false
                    : undefined,
        });
        res
            .status(200)
            .json(new ApiResponse(200, assignments, "Teaching assignments fetched successfully"));
    });
    get = asyncHandler(async (req, res) => {
        const assignment = await teachingAssignmentService.getTeachingAssignment(String(req.params.assignmentId), String(req.user?.schoolId));
        res
            .status(200)
            .json(new ApiResponse(200, assignment, "Teaching assignment fetched successfully"));
    });
    getTeacherAssignments = asyncHandler(async (req, res) => {
        const assignments = await teachingAssignmentService.getTeacherTeachingAssignments(String(req.user?.schoolId), String(req.params.teacherId), typeof req.query.sessionId === "string"
            ? req.query.sessionId
            : undefined);
        res
            .status(200)
            .json(new ApiResponse(200, assignments, "Teacher assignments fetched successfully"));
    });
    getClassAssignments = asyncHandler(async (req, res) => {
        const assignments = await teachingAssignmentService.getClassTeachingAssignments(String(req.user?.schoolId), String(req.params.sessionId), String(req.params.classLevelId), String(req.params.classArmId));
        res
            .status(200)
            .json(new ApiResponse(200, assignments, "Teaching assignments fetched successfully"));
    });
    unassign = asyncHandler(async (req, res) => {
        const assignment = await teachingAssignmentService.unassignTeachingAssignment(String(req.params.assignmentId), String(req.user?.schoolId));
        res
            .status(200)
            .json(new ApiResponse(200, assignment, "Teaching assignment unassigned successfully"));
    });
    update = asyncHandler(async (req, res) => {
        const assignment = await teachingAssignmentService.updateTeachingAssignment(String(req.params.assignmentId), String(req.user?.schoolId), req.body);
        res
            .status(200)
            .json(new ApiResponse(200, assignment, "Teaching assignment updated successfully"));
    });
}
export const teachingAssignmentController = new TeachingAssignmentController();
