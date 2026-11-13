import { Router } from "express";
import { subjectAssignmentController } from "./subject.assignment.controller.js";
import { protect } from "@/middleware/protection.js";

const subjectAssignmentRoute = Router();
subjectAssignmentRoute.use(protect);
subjectAssignmentRoute.post(
  "/",
  subjectAssignmentController.createClassLevelSubject,
);
subjectAssignmentRoute.get(
  "/",
  subjectAssignmentController.getAllClassLevelSubjects,
);
subjectAssignmentRoute.put(
  "/allocations",
  subjectAssignmentController.updateAllocation,
);

export { subjectAssignmentRoute };
