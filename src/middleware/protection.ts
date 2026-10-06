import { SessionService } from "@/utils/session.js";
import { Request, Response, NextFunction } from "express";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await SessionService.verifySession(req, res, next);
  } catch (error) {
    next(error);
  }
};
