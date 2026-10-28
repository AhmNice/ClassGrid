import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import {
  IAcademicSessionCreate,
  IAcademicSessionUpdate,
} from "./academic-session.interface.js";
import { academicSessionService } from "./academic-session.service.js";

/**
 * The school always comes from the logged-in user, never from the request
 * body or URL. Adjust the `user` shape here to match what your auth
 * middleware sets, or move this into that middleware.
 */
const getSchoolId = (req: Request): string => {
  const user = (req as Request & { user?: { schoolId?: string } }).user;
  if (!user?.schoolId) {
    console.error("No school ID found in user object");
    throw new ApiError(401, "You must be signed in to a school to do this");
  }
  return user.schoolId;
};

class AcademicSessionController {
  readonly createAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await academicSessionService.createAcademicSession(
        getSchoolId(req),
        req.body as Omit<IAcademicSessionCreate, "schoolId">,
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
    async (req: Request, res: Response) => {
      const sessions = await academicSessionService.getAcademicSessions(
        getSchoolId(req),
      );
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

  readonly getCurrentAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await academicSessionService.currentAcademicSession(
        getSchoolId(req),
      );
      // Having no current session is a normal state (a new school, or between
      // sessions), so this is a 200 with null data, not an error.
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            session,
            session
              ? "Current academic session fetched successfully"
              : "No current academic session",
          ),
        );
    },
  );

  readonly getAcademicSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await academicSessionService.getAcademicSessionById(
        getSchoolId(req),
        String(req.params.sessionId),
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
        getSchoolId(req),
        String(req.params.sessionId),
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
        getSchoolId(req),
        String(req.params.sessionId),
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
        getSchoolId(req),
        String(req.params.sessionId),
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
