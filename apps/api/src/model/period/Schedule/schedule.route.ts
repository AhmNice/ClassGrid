import express from "express";
import { protect } from "@/middleware/protection.js";
import { validate } from "@/middleware/validation.js";
import { periodScheduleController } from "./schedule.controller.js";
import {
  createScheduleReqSchema,
  scheduleIdReqSchema,
  updateScheduleReqSchema,
} from "./schedule.schema.js";

const periodScheduleRouter = express.Router();
periodScheduleRouter.use(protect);
periodScheduleRouter.get("/", periodScheduleController.list);
periodScheduleRouter.post(
  "/",
  validate(createScheduleReqSchema),
  periodScheduleController.create,
);
periodScheduleRouter.get(
  "/:scheduleId",
  validate(scheduleIdReqSchema),
  periodScheduleController.get,
);
periodScheduleRouter.patch(
  "/:scheduleId",
  validate(updateScheduleReqSchema),
  periodScheduleController.update,
);
periodScheduleRouter.delete(
  "/:scheduleId",
  validate(scheduleIdReqSchema),
  periodScheduleController.delete,
);

export default periodScheduleRouter;
