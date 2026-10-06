import {
  IAcademicSession,
  IAcademicSessionCreate,
  IAcademicSessionUpdate,
} from "./academic-session.interface.js";
import {
  IAcademicSessionRepo,
  academicSessionRepo,
} from "./academic-session.repo.js";
import { ApiError } from "@/utils/errorHandler.js";

export interface IAcademicSessionService {
  createAcademicSession(
    data: IAcademicSessionCreate,
  ): Promise<IAcademicSession>;
  getAcademicSessions(): Promise<IAcademicSession[]>;
  getAcademicSessionById(id: string): Promise<IAcademicSession | null>;
  updateAcademicSession(
    id: string,
    data: IAcademicSessionUpdate,
  ): Promise<IAcademicSession | null>;
  activateAcademicSession(id: string): Promise<IAcademicSession | null>;
  deleteAcademicSession(id: string): Promise<boolean>;
}

export class AcademicSessionService implements IAcademicSessionService {
  constructor(private readonly repo: IAcademicSessionRepo) {}
  private validateDates(start: Date | null, end: Date | null): void {
    if (start && end && start >= end) {
      throw new ApiError(422, "Start date must be before end date");
    }
  }

  private validateTermsWithinSession(
    sessionStart: Date | null,
    sessionEnd: Date | null,
    terms: Array<{ startDate: Date | null; endDate: Date | null }>,
  ): void {
    for (const term of terms) {
      if (term.startDate && sessionStart && term.startDate < sessionStart) {
        throw new ApiError(
          422,
          "Academic session start date cannot be after a term start date",
        );
      }
      if (term.endDate && sessionEnd && term.endDate > sessionEnd) {
        throw new ApiError(
          422,
          "Academic session end date cannot be before a term end date",
        );
      }
    }
  }
  async createAcademicSession(
    data: IAcademicSessionCreate,
  ): Promise<IAcademicSession> {
    this.validateDates(data.startDate, data.endDate);

    return await this.repo.createAcademicSession({
      ...data,
      name: data.name.trim(),
    });
  }

  async getAcademicSessions(): Promise<IAcademicSession[]> {
    return await this.repo.getAcademicSessions();
  }

  async getAcademicSessionById(id: string): Promise<IAcademicSession | null> {
    return await this.repo.getAcademicSessionById(id);
  }

  async updateAcademicSession(
    id: string,
    data: IAcademicSessionUpdate,
  ): Promise<IAcademicSession | null> {
    const existing = await this.repo.getAcademicSessionById(id);
    if (!existing) return null;

    // Validate the resulting dates, not just the ones in the payload
    const startDate =
      data.startDate !== undefined ? data.startDate : existing.startDate;
    const endDate =
      data.endDate !== undefined ? data.endDate : existing.endDate;
    this.validateDates(startDate, endDate);
    const terms = await this.repo.getTerms(id);
    this.validateTermsWithinSession(startDate, endDate, terms);

    return await this.repo.updateAcademicSession(id, {
      ...data,
      ...(data.name !== undefined && { name: data.name.trim() }),
    });
  }

  async deleteAcademicSession(id: string): Promise<boolean> {
    return await this.repo.deleteAcademicSession(id);
  }

  async activateAcademicSession(id: string): Promise<IAcademicSession | null> {
    return await this.repo.activateAcademicSession(id);
  }
}

export const academicSessionService = new AcademicSessionService(
  academicSessionRepo,
);
