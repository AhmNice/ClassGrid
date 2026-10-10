import AuthRouter from "@/model/authentication/route.js";
import academicSessionRouter from "@/model/academic-session/session/academic-session.route.js";
import termRouter from "@/model/academic-session/term/term.route.js";
import classArmRouter from "@/model/class/level/arm/arm.route.js";
import teacherAvailabilityRouter from "@/model/teacher/availability.route.js";
import teacherRouter from "@/model/teacher/teacher.route.js";
import subjectRouter from "@/model/subject/subject.route.js";
import roomRouter from "@/model/room/room.route.js";
import periodRouter from "@/model/period/period.route.js";
import schoolRouter from "@/model/school/school.route.js";
import express from "express";

const router = express.Router();
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
router.use("/auth", AuthRouter);
router.use("/academic-sessions", academicSessionRouter);
router.use("/academic-sessions/:sessionId/terms", termRouter);
router.use("/class-levels/:classLevelId/arms", classArmRouter);
router.use("/teachers/:teacherId/availability", teacherAvailabilityRouter);
router.use("/teachers", teacherRouter);
router.use("/subjects", subjectRouter);
router.use("/rooms", roomRouter);
router.use("/periods", periodRouter);
router.use("/schools", schoolRouter);
export default router;
