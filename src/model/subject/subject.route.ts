import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { subjectController } from "./subject.controller.js";
import {
  createSubjectReqSchema,
  subjectIdReqSchema,
  subjectListReqSchema,
  updateSubjectSchedulingRequirementsReqSchema,
  updateSubjectReqSchema,
} from "./subject.schema.js";

const subjectRouter = express.Router();
subjectRouter.use(protect);
subjectRouter.get(
  "/",
  validate(subjectListReqSchema),
  subjectController.getSubjects,
);
subjectRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(createSubjectReqSchema),
  subjectController.createSubject,
);
subjectRouter.get(
  "/:subjectId",
  validate(subjectIdReqSchema),
  subjectController.getSubject,
);
subjectRouter.patch(
  "/:subjectId/scheduling-requirements",
  sanitizeBodyMiddleware,
  validate(updateSubjectSchedulingRequirementsReqSchema),
  subjectController.updateSchedulingRequirements,
);
subjectRouter.patch(
  "/:subjectId",
  sanitizeBodyMiddleware,
  validate(updateSubjectReqSchema),
  subjectController.updateSubject,
);
subjectRouter.delete(
  "/:subjectId",
  validate(subjectIdReqSchema),
  subjectController.deleteSubject,
);

export default subjectRouter;
