import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { teacherAvailabilityController } from "./availability.controller.js";
import {
  availabilityCreateSchema,
  availabilityIdSchema,
  availabilityListSchema,
  availabilityUpdateSchema,
} from "./availability.schema.js";

const teacherAvailabilityRouter = express.Router({ mergeParams: true });
teacherAvailabilityRouter.use(protect);
teacherAvailabilityRouter.get(
  "/",
  validate(availabilityListSchema),
  teacherAvailabilityController.list,
);
teacherAvailabilityRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(availabilityCreateSchema),
  teacherAvailabilityController.create,
);
teacherAvailabilityRouter.get(
  "/:availabilityId",
  validate(availabilityIdSchema),
  teacherAvailabilityController.get,
);
teacherAvailabilityRouter.patch(
  "/:availabilityId",
  sanitizeBodyMiddleware,
  validate(availabilityUpdateSchema),
  teacherAvailabilityController.update,
);
teacherAvailabilityRouter.delete(
  "/:availabilityId",
  validate(availabilityIdSchema),
  teacherAvailabilityController.delete,
);

export default teacherAvailabilityRouter;
