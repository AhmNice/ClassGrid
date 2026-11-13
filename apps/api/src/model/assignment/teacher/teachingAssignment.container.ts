import { TeachingAssignmentRepo } from "./teachingAssignment.repo.js";
import { TeachingAssignmentService } from "./teaching.assignment.service.js";

export const teachingAssignmentService = new TeachingAssignmentService(
  new TeachingAssignmentRepo(),
);
