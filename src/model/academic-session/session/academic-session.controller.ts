import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import {
  IAcademicSessionCreate,
  IAcademicSessionUpdate,
} from "./academic-session.interface.js";
import { academicSessionService } from "./academic-session.service.js";

class AcademicSessionController {
  readonly createAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await academicSessionService.createAcademicSession(
        req.body as IAcademicSessionCreate,
      );
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            session,
            "Academic session created successfully",
          ),
        );
    },
  );

  readonly getAcademicSessions = asyncHandler(
    async (_req: Request, res: Response) => {
      const sessions = await academicSessionService.getAcademicSessions();
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            sessions,
            "Academic sessions fetched successfully",
          ),
        );
    },
  );

  readonly getAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await academicSessionService.getAcademicSessionById(
        req.params.sessionId,
      );
      if (!session) throw new ApiError(404, "Academic session not found");
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            session,
            "Academic session fetched successfully",
          ),
        );
    },
  );

  readonly updateAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await academicSessionService.updateAcademicSession(
        req.params.sessionId,
        req.body as IAcademicSessionUpdate,
      );
      if (!session) throw new ApiError(404, "Academic session not found");
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            session,
            "Academic session updated successfully",
          ),
        );
    },
  );

  readonly deleteAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const deleted = await academicSessionService.deleteAcademicSession(
        req.params.sessionId,
      );
      if (!deleted) throw new ApiError(404, "Academic session not found");
      res
        .status(200)
        .json(
          new ApiResponse(200, null, "Academic session deleted successfully"),
        );
    },
  );

  readonly activateAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await academicSessionService.activateAcademicSession(
        req.params.sessionId,
      );
      if (!session) throw new ApiError(404, "Academic session not found");
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            session,
            "Academic session activated successfully",
          ),
        );
    },
  );
}

export const academicSessionController = new AcademicSessionController();
