import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { schoolController } from "./school.controller.js";
import {
  schoolIdReqSchema,
  schoolWorkingDaysReqSchema,
} from "./school.schema.js";

const schoolRouter = express.Router();
schoolRouter.use(protect);
schoolRouter.get(
  "/:schoolId/working-days",
  validate(schoolIdReqSchema),
  schoolController.getWorkingDays,
);
schoolRouter.patch(
  "/:schoolId/working-days",
  sanitizeBodyMiddleware,
  validate(schoolWorkingDaysReqSchema),
  schoolController.updateWorkingDays,
);

export default schoolRouter;
