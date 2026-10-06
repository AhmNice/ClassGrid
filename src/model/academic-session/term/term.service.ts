import { ApiError } from "@/utils/errorHandler.js";
import { ITerm, ITermCreate, ITermUpdate } from "./term.interface.js";
import { ITermRepo, termRepo } from "./term.repo.js";

export interface ITermService {
  createTerm(data: ITermCreate): Promise<ITerm>;
  getTerms(sessionId: string): Promise<ITerm[]>;
  getTermById(sessionId: string, id: string): Promise<ITerm | null>;
  updateTerm(
    sessionId: string,
    id: string,
    data: ITermUpdate,
  ): Promise<ITerm | null>;
  activateTerm(sessionId: string, id: string): Promise<ITerm | null>;
  deleteTerm(sessionId: string, id: string): Promise<boolean>;
}
export class TermService implements ITermService {
  constructor(private readonly repo: ITermRepo) {}

  private validateDates(startDate: Date | null, endDate: Date | null): void {
    if (startDate && endDate && startDate >= endDate) {
      throw new ApiError(422, "Start date must be before end date");
    }
  }

  private validateWithinSession(
    startDate: Date | null,
    endDate: Date | null,
    sessionStartDate: Date | null,
    sessionEndDate: Date | null,
  ): void {
    if (startDate && sessionStartDate && startDate < sessionStartDate) {
      throw new ApiError(
        422,
        "Term start date must be within the academic session",
      );
    }
    if (endDate && sessionEndDate && endDate > sessionEndDate) {
      throw new ApiError(
        422,
        "Term end date must be within the academic session",
      );
    }
  }
  /*
   * Validates that the term does not overlap with any other terms in the same session.
   */
  private validateNoOverlap(
    startDate: Date | null,
    endDate: Date | null,
    terms: ITerm[],
  ): void {
    if (!startDate || !endDate) return;

    for (const term of terms) {
      if (!term.startDate || !term.endDate) continue;
      if (startDate < term.endDate && endDate > term.startDate) {
        throw new ApiError(422, "Term dates cannot overlap another term");
      }
    }
  }

  async createTerm(data: ITermCreate): Promise<ITerm> {
    this.validateDates(data.startDate, data.endDate);
    const session = await this.repo.getSessionDates(data.sessionId);
    if (!session) throw new ApiError(404, "Academic session not found");
    this.validateWithinSession(
      data.startDate,
      data.endDate,
      session.startDate,
      session.endDate,
    );
    this.validateNoOverlap(
      data.startDate,
      data.endDate,
      await this.repo.getTerms(data.sessionId),
    );
    return await this.repo.createTerm(data);
  }

  async getTerms(sessionId: string): Promise<ITerm[]> {
    return await this.repo.getTerms(sessionId);
  }

  async getTermById(sessionId: string, id: string): Promise<ITerm | null> {
    return await this.repo.getTermById(sessionId, id);
  }

  async updateTerm(
    sessionId: string,
    id: string,
    data: ITermUpdate,
  ): Promise<ITerm | null> {
    const existing = await this.repo.getTermById(sessionId, id);
    if (!existing) return null;

    this.validateDates(
      data.startDate !== undefined ? data.startDate : existing.startDate,
      data.endDate !== undefined ? data.endDate : existing.endDate,
    );
    const session = await this.repo.getSessionDates(sessionId);
    if (!session) throw new ApiError(404, "Academic session not found");
    this.validateWithinSession(
      data.startDate !== undefined ? data.startDate : existing.startDate,
      data.endDate !== undefined ? data.endDate : existing.endDate,
      session.startDate,
      session.endDate,
    );
    this.validateNoOverlap(
      data.startDate !== undefined ? data.startDate : existing.startDate,
      data.endDate !== undefined ? data.endDate : existing.endDate,
      (await this.repo.getTerms(sessionId)).filter((term) => term.id !== id),
    );
    return await this.repo.updateTerm(sessionId, id, data);
  }

  async deleteTerm(sessionId: string, id: string): Promise<boolean> {
    return await this.repo.deleteTerm(sessionId, id);
  }

  async activateTerm(sessionId: string, id: string): Promise<ITerm | null> {
    return await this.repo.activateTerm(sessionId, id);
  }
}

export const termService = new TermService(termRepo);
