import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { classArmController } from "./arm.controller.js";
import {
  classArmIdReqSchema,
  classArmListReqSchema,
  createClassArmReqSchema,
  updateClassArmReqSchema,
} from "./arm.schema.js";

const classArmRouter = express.Router({ mergeParams: true });
classArmRouter.use(protect);
classArmRouter.get(
  "/",
  validate(classArmListReqSchema),
  classArmController.getClassArms,
);
classArmRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(createClassArmReqSchema),
  classArmController.createClassArm,
);
classArmRouter.get(
  "/:armId",
  validate(classArmIdReqSchema),
  classArmController.getClassArm,
);
classArmRouter.patch(
  "/:armId",
  sanitizeBodyMiddleware,
  validate(updateClassArmReqSchema),
  classArmController.updateClassArm,
);
classArmRouter.delete(
  "/:armId",
  validate(classArmIdReqSchema),
  classArmController.deleteClassArm,
);

export default classArmRouter;
