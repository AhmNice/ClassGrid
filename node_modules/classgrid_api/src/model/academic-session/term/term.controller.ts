import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ITermCreate, ITermUpdate } from "./term.interface.js";
import { termService } from "./term.service.js";

const getSessionId = (req: Request): string => req.params.sessionId;
const getTermId = (req: Request): string => req.params.termId;

class TermController {
  readonly createTerm = asyncHandler(async (req: Request, res: Response) => {
    const term = await termService.createTerm({
      ...(req.body as Omit<ITermCreate, "sessionId">),
      sessionId: getSessionId(req),
    });
    res
      .status(201)
      .json(new ApiResponse(201, term, "Term created successfully"));
  });

  readonly getTerms = asyncHandler(async (req: Request, res: Response) => {
    const terms = await termService.getTerms(getSessionId(req));
    res
      .status(200)
      .json(new ApiResponse(200, terms, "Terms fetched successfully"));
  });

  readonly getTerm = asyncHandler(async (req: Request, res: Response) => {
    const term = await termService.getTermById(
      getSessionId(req),
      getTermId(req),
    );
    if (!term) throw new ApiError(404, "Term not found");
    res
      .status(200)
      .json(new ApiResponse(200, term, "Term fetched successfully"));
  });

  readonly updateTerm = asyncHandler(async (req: Request, res: Response) => {
    const term = await termService.updateTerm(
      getSessionId(req),
      getTermId(req),
      req.body as ITermUpdate,
    );
    if (!term) throw new ApiError(404, "Term not found");
    res
      .status(200)
      .json(new ApiResponse(200, term, "Term updated successfully"));
  });

  readonly deleteTerm = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await termService.deleteTerm(
      getSessionId(req),
      getTermId(req),
    );
    if (!deleted) throw new ApiError(404, "Term not found");
    res
      .status(200)
      .json(new ApiResponse(200, null, "Term deleted successfully"));
  });

  readonly activateTerm = asyncHandler(async (req: Request, res: Response) => {
    const term = await termService.activateTerm(
      getSessionId(req),
      getTermId(req),
    );
    if (!term) throw new ApiError(404, "Term not found");
    res
      .status(200)
      .json(new ApiResponse(200, term, "Term activated successfully"));
  });
}

export const termController = new TermController();
