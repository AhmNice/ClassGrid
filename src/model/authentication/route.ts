import express from "express";
import authController from "./auth.controller.js";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { createUserReqSchema, loginReqSchema } from "./auth.schema.js";
import { protect } from "@/middleware/protection.js";

const AuthRouter = express.Router();
AuthRouter.post(
  "/register",
  sanitizeBodyMiddleware,
  validate(createUserReqSchema),
  authController.createUser,
);

AuthRouter.post(
  "/login",
  sanitizeBodyMiddleware,
  validate(loginReqSchema),
  authController.loginUser,
);
AuthRouter.use(protect);
AuthRouter.get("/me", authController.currentUser);
AuthRouter.post("/logout", authController.logoutUser);
export default AuthRouter;
