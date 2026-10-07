import AuthRouter from "@/model/authentication/route.js";
import academicSessionRouter from "@/model/academic-session/session/academic-session.route.js";
import termRouter from "@/model/academic-session/term/term.route.js";
import classArmRouter from "@/model/class/level/arm/arm.route.js";
import express from "express";

const router = express.Router();
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
router.use("/auth", AuthRouter);
router.use("/academic-sessions", academicSessionRouter);
router.use("/academic-sessions/:sessionId/terms", termRouter);
router.use("/class-levels/:classLevelId/arms", classArmRouter);
export default router;
