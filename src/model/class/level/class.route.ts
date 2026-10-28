import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { classLevelController } from "./class.controller.js";
import {
  classLevelIdReqSchema,
  classLevelListReqSchema,
  createClassLevelReqSchema,
  updateClassLevelReqSchema,
} from "./class.schema.js";
import classArmRouter from "./arm/arm.route.js";
import { classArmController } from "./arm/arm.controller.js";

const classLevelRouter = express.Router();
classLevelRouter.use(protect);
classLevelRouter.get(
  "/",
  validate(classLevelListReqSchema),
  classLevelController.getClassLevels,
);
classLevelRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(createClassLevelReqSchema),
  classLevelController.createClassLevel,
);
classLevelRouter.get("/arms/all", classArmController.getAllClassArms);
classLevelRouter.get(
  "/:classLevelId",
  validate(classLevelIdReqSchema),
  classLevelController.getClassLevel,
);
classLevelRouter.patch(
  "/:classLevelId",
  sanitizeBodyMiddleware,
  validate(updateClassLevelReqSchema),
  classLevelController.updateClassLevel,
);
classLevelRouter.delete(
  "/:classLevelId",
  validate(classLevelIdReqSchema),
  classLevelController.deleteClassLevel,
);
classLevelRouter.use("/:classLevelId/arms", classArmRouter);
export default classLevelRouter;
