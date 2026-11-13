import { prisma } from "@/lib/prisma.js";
import { ITerm, ITermCreate, ITermUpdate } from "./term.interface.js";
import { PrismaTx } from "@/types/general.js";

export interface ITermRepo {
  createTerm(data: ITermCreate): Promise<ITerm>;
  getSessionDates(
    sessionId: string,
  ): Promise<{ startDate: Date | null; endDate: Date | null } | null>;
  getTerms(sessionId: string): Promise<ITerm[]>;
  getTermById(sessionId: string, id: string): Promise<ITerm | null>;
  updateTerm(
    sessionId: string,
    id: string,
    data: ITermUpdate,
  ): Promise<ITerm | null>;
  activateTerm(sessionId: string, id: string): Promise<ITerm | null>;
  deleteTerm(sessionId: string, id: string): Promise<boolean>;
  getTermSchoolIdSessionId(
    termId: string,
  ): Promise<{ schoolId: string; sessionId: string } | null>;
  findUnique(termId: string): Promise<ITerm | null>;
  transaction<T>(fn: (repo: ITermRepo) => Promise<T>): Promise<T>;
}

export class TermRepo implements ITermRepo {
  constructor(private readonly db: PrismaTx = prisma) {}

  async createTerm(data: ITermCreate): Promise<ITerm> {
    const { sessionId, ...termData } = data;
    return await this.db.term.create({
      data: {
        ...termData,
        session: { connect: { id: sessionId } },
      },
    });
  }

  async getSessionDates(
    sessionId: string,
  ): Promise<{ startDate: Date | null; endDate: Date | null } | null> {
    return await this.db.academicSession.findUnique({
      where: { id: sessionId },
      select: { startDate: true, endDate: true },
    });
  }

  async getTerms(sessionId: string): Promise<ITerm[]> {
    return await this.db.term.findMany({
      where: { sessionId },
      orderBy: { name: "asc" },
    });
  }

  async getTermById(sessionId: string, id: string): Promise<ITerm | null> {
    return await this.db.term.findFirst({ where: { id, sessionId } });
  }
  async findUnique(termId: string): Promise<ITerm | null> {
    return await this.db.term.findUnique({ where: { id: termId } });
  }
  async updateTerm(
    sessionId: string,
    id: string,
    data: ITermUpdate,
  ): Promise<ITerm | null> {
    const { midTermStartDate, midTermEndDate, ...termData } = data;
    const updateData = {
      ...termData,
      ...(midTermStartDate == null ? {} : { midTermStartDate }),
      ...(midTermEndDate == null ? {} : { midTermEndDate }),
    };

    if (data.isCurrent) {
      // Use this.db to respect active transaction context if passed
      return await this.db.$transaction(async (tx) => {
        const txRepo = new TermRepo(tx);
        const term = await txRepo.getTermById(sessionId, id);
        if (!term) return null;

        await tx.term.updateMany({
          where: { sessionId, isCurrent: true },
          data: { isCurrent: false },
        });
        return await tx.term.update({
          where: { id },
          data: updateData,
        });
      });
    }

    const result = await this.db.term.updateMany({
      where: { id, sessionId },
      data: updateData,
    });
    if (result.count === 0) return null;
    return await this.getTermById(sessionId, id);
  }

  async activateTerm(sessionId: string, id: string): Promise<ITerm | null> {
    return await this.db.$transaction(async (tx) => {
      const txRepo = new TermRepo(tx);
      const term = await txRepo.getTermById(sessionId, id);
      if (!term) return null;

      await tx.term.updateMany({
        where: { sessionId, isCurrent: true },
        data: { isCurrent: false },
      });
      return await tx.term.update({
        where: { id },
        data: { isCurrent: true },
      });
    });
  }

  async deleteTerm(sessionId: string, id: string): Promise<boolean> {
    const result = await this.db.term.deleteMany({ where: { id, sessionId } });
    return result.count > 0;
  }

  async getTermSchoolIdSessionId(
    termId: string,
  ): Promise<{ schoolId: string; sessionId: string } | null> {
    const result = await this.db.term.findUnique({
      where: { id: termId },
      select: {
        session: { select: { id: true, schoolId: true } },
      },
    });

    if (!result || !result.session) return null;

    return {
      sessionId: result.session.id,
      schoolId: result.session.schoolId,
    };
  }

  // Expose transaction runner pattern
  async transaction<T>(fn: (repo: ITermRepo) => Promise<T>): Promise<T> {
    return await prisma.$transaction(async (tx) => {
      const txRepo = new TermRepo(tx);
      return await fn(txRepo);
    });
  }
}

export const termRepo = new TermRepo();
