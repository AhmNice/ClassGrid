import { ApiError } from "@/utils/errorHandler.js";
import { termRepo } from "./term.repo.js";
export class TermService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    validateDates(startDate, endDate) {
        if (startDate && endDate && startDate >= endDate) {
            throw new ApiError(422, "Start date must be before end date");
        }
    }
    mapDbError(error) {
        if (error.code !== "P2002")
            throw error;
        const target = JSON.stringify(error.meta?.target ?? "");
        if (target.includes("name")) {
            throw new ApiError(422, "Term name must be unique within the session", [
                {
                    field: "name",
                    message: "Term name must be unique within the session",
                },
            ]);
        }
        return new ApiError(409, "Term name must be unique within the session");
    }
    requireName(name) {
        const trimmed = name.trim();
        if (!trimmed) {
            throw new ApiError(422, "Invalid session", [
                { field: "name", message: "Enter a session name" },
            ]);
        }
        return trimmed;
    }
    validateWithinSession(startDate, endDate, sessionStartDate, sessionEndDate) {
        if (startDate && sessionStartDate && startDate < sessionStartDate) {
            throw new ApiError(422, "Term start date must be within the academic session");
        }
        if (endDate && sessionEndDate && endDate > sessionEndDate) {
            throw new ApiError(422, "Term end date must be within the academic session");
        }
    }
    /*
     * Validates that the term does not overlap with any other terms in the same session.
     */
    validateNoOverlap(startDate, endDate, terms) {
        if (!startDate || !endDate)
            return;
        for (const term of terms) {
            if (!term.startDate || !term.endDate)
                continue;
            if (startDate < term.endDate && endDate > term.startDate) {
                throw new ApiError(422, "Term dates cannot overlap another term");
            }
        }
    }
    async createTerm(data) {
        this.validateDates(data.startDate, data.endDate);
        const session = await this.repo.getSessionDates(data.sessionId);
        if (!session)
            throw new ApiError(404, "Academic session not found");
        this.validateWithinSession(data.startDate, data.endDate, session.startDate, session.endDate);
        this.validateNoOverlap(data.startDate, data.endDate, await this.repo.getTerms(data.sessionId));
        try {
            return await this.repo.createTerm(data);
        }
        catch (error) {
            throw this.mapDbError(error);
        }
    }
    async getTerms(sessionId) {
        return await this.repo.getTerms(sessionId);
    }
    async getTermById(sessionId, id) {
        return await this.repo.getTermById(sessionId, id);
    }
    async updateTerm(sessionId, id, data) {
        const existing = await this.repo.getTermById(sessionId, id);
        if (!existing)
            return null;
        const name = data.name !== undefined ? this.requireName(data.name) : undefined;
        this.validateDates(data.startDate !== undefined ? data.startDate : existing.startDate, data.endDate !== undefined ? data.endDate : existing.endDate);
        const session = await this.repo.getSessionDates(sessionId);
        if (!session)
            throw new ApiError(404, "Academic session not found");
        this.validateWithinSession(data.startDate !== undefined ? data.startDate : existing.startDate, data.endDate !== undefined ? data.endDate : existing.endDate, session.startDate, session.endDate);
        this.validateNoOverlap(data.startDate !== undefined ? data.startDate : existing.startDate, data.endDate !== undefined ? data.endDate : existing.endDate, (await this.repo.getTerms(sessionId)).filter((term) => term.id !== id));
        try {
            return await this.repo.updateTerm(sessionId, id, {
                ...data,
                ...(name !== undefined && { name: name }),
                ...(data.startDate !== undefined && { startDate: data.startDate }),
                ...(data.endDate !== undefined && { endDate: data.endDate }),
                ...(data.midTermStartDate !== undefined && {
                    midTermStartDate: data.midTermStartDate,
                }),
                ...(data.midTermEndDate !== undefined && {
                    midTermEndDate: data.midTermEndDate,
                }),
                ...(data.examStartDate !== undefined && {
                    examStartDate: data.examStartDate,
                }),
                ...(data.examEndDate !== undefined && {
                    examEndDate: data.examEndDate,
                }),
                ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
            });
        }
        catch (error) {
            throw this.mapDbError(error);
        }
    }
    async deleteTerm(sessionId, id) {
        return await this.repo.deleteTerm(sessionId, id);
    }
    async activateTerm(sessionId, id) {
        return await this.repo.activateTerm(sessionId, id);
    }
}
export const termService = new TermService(termRepo);
