import express from "express";
import { protect } from "@/middleware/protection.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { teacherController } from "./teacher.controller.js";
import {
  createTeacherReqSchema,
  teacherIdReqSchema,
  teacherListReqSchema,
  updateTeacherReqSchema,
} from "./teacher.schema.js";

const teacherRouter = express.Router();
teacherRouter.use(protect);

teacherRouter.get(
  "/",
  validate(teacherListReqSchema),
  teacherController.getTeachers,
);
teacherRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(createTeacherReqSchema),
  teacherController.createTeacher,
);
teacherRouter.get(
  "/:teacherId",
  validate(teacherIdReqSchema),
  teacherController.getTeacher,
);
teacherRouter.patch(
  "/:teacherId",
  sanitizeBodyMiddleware,
  validate(updateTeacherReqSchema),
  teacherController.updateTeacher,
);
teacherRouter.delete(
  "/:teacherId",
  validate(teacherIdReqSchema),
  teacherController.deleteTeacher,
);

export default teacherRouter;
