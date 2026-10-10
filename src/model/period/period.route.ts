import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { periodController } from "./period.controller.js";
import {
  createPeriodReqSchema,
  periodIdReqSchema,
  periodListReqSchema,
  reorderPeriodsReqSchema,
  updatePeriodReqSchema,
} from "./period.schema.js";

const periodRouter = express.Router();
periodRouter.use(protect);
periodRouter.get(
  "/",
  validate(periodListReqSchema),
  periodController.getPeriods,
);
periodRouter.post(
  "/reorder",
  sanitizeBodyMiddleware,
  validate(reorderPeriodsReqSchema),
  periodController.reorderPeriods,
);
periodRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(createPeriodReqSchema),
  periodController.createPeriod,
);
periodRouter.get(
  "/:periodId",
  validate(periodIdReqSchema),
  periodController.getPeriod,
);
periodRouter.patch(
  "/:periodId",
  sanitizeBodyMiddleware,
  validate(updatePeriodReqSchema),
  periodController.updatePeriod,
);
periodRouter.delete(
  "/:periodId",
  validate(periodIdReqSchema),
  periodController.deletePeriod,
);

export default periodRouter;
