import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiError } from "@/utils/errorHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
import { termService } from "./term.service.js";
const getSessionId = (req) => req.params.sessionId;
const getTermId = (req) => req.params.termId;
class TermController {
    createTerm = asyncHandler(async (req, res) => {
        const term = await termService.createTerm({
            ...req.body,
            sessionId: getSessionId(req),
        });
        res
            .status(201)
            .json(new ApiResponse(201, term, "Term created successfully"));
    });
    getTerms = asyncHandler(async (req, res) => {
        const terms = await termService.getTerms(getSessionId(req));
        res
            .status(200)
            .json(new ApiResponse(200, terms, "Terms fetched successfully"));
    });
    getTerm = asyncHandler(async (req, res) => {
        const term = await termService.getTermById(getSessionId(req), getTermId(req));
        if (!term)
            throw new ApiError(404, "Term not found");
        res
            .status(200)
            .json(new ApiResponse(200, term, "Term fetched successfully"));
    });
    updateTerm = asyncHandler(async (req, res) => {
        const term = await termService.updateTerm(getSessionId(req), getTermId(req), req.body);
        if (!term)
            throw new ApiError(404, "Term not found");
        res
            .status(200)
            .json(new ApiResponse(200, term, "Term updated successfully"));
    });
    deleteTerm = asyncHandler(async (req, res) => {
        const deleted = await termService.deleteTerm(getSessionId(req), getTermId(req));
        if (!deleted)
            throw new ApiError(404, "Term not found");
        res
            .status(200)
            .json(new ApiResponse(200, null, "Term deleted successfully"));
    });
    activateTerm = asyncHandler(async (req, res) => {
        const term = await termService.activateTerm(getSessionId(req), getTermId(req));
        if (!term)
            throw new ApiError(404, "Term not found");
        res
            .status(200)
            .json(new ApiResponse(200, term, "Term activated successfully"));
    });
}
export const termController = new TermController();
