import express from "express";
import { protect } from "@/middleware/protection.js";
import { validate } from "@/middleware/validation.js";
import { academicSessionController } from "./academic-session.controller.js";
import {
  academicSessionIdReqSchema,
  createAcademicSessionReqSchema,
  updateAcademicSessionReqSchema,
} from "./academic-session.schema.js";

const academicSessionRouter = express.Router();
academicSessionRouter.use(protect);
academicSessionRouter.get("/", academicSessionController.getAcademicSessions);

academicSessionRouter.get(
  "/current",
  academicSessionController.getCurrentAcademicSession,
);
academicSessionRouter.post(
  "/",
  validate(createAcademicSessionReqSchema),
  academicSessionController.createAcademicSession,
);
academicSessionRouter.get(
  "/:sessionId",
  validate(academicSessionIdReqSchema),
  academicSessionController.getAcademicSession,
);
academicSessionRouter.post(
  "/:sessionId/activate",
  validate(academicSessionIdReqSchema),
  academicSessionController.activateAcademicSession,
);
academicSessionRouter.patch(
  "/:sessionId",
  validate(updateAcademicSessionReqSchema),
  academicSessionController.updateAcademicSession,
);
academicSessionRouter.delete(
  "/:sessionId",
  validate(academicSessionIdReqSchema),
  academicSessionController.deleteAcademicSession,
);

export default academicSessionRouter;
