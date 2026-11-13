import { asyncHandler } from "@/lib/asyncHandler.js";
import { subjectAssignmentService } from "./subject.assignment.container.js";
import { ApiResponse } from "@/utils/api-response.js";
class SubjectAssignmentController {
    createClassLevelSubject = asyncHandler(async (req, res) => {
        const schoolId = String(req?.user?.schoolId);
        const classLevelSubject = await subjectAssignmentService.assignSubjectToClassLevel({
            ...req.body,
            schoolId,
        });
        res
            .status(201)
            .json(new ApiResponse(201, classLevelSubject, "Class level subject created successfully"));
    });
    getAllClassLevelSubjects = asyncHandler(async (req, res) => {
        const classLevelSubjects = await subjectAssignmentService.getAllSubjectAssignments();
        res.json(new ApiResponse(200, classLevelSubjects, "Class level subjects retrieved successfully"));
    });
    updateAllocation = asyncHandler(async (req, res) => {
        const schoolId = String(req?.user?.schoolId);
        await subjectAssignmentService.updateSubjectAssignments({
            schoolId,
            ...req.body,
        });
        res.json(new ApiResponse(200, null, "Class level subject allocations updated successfully"));
    });
}
export const subjectAssignmentController = new SubjectAssignmentController();
