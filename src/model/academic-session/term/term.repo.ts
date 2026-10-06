import { prisma } from "@/lib/prisma.js";
import { ITerm, ITermCreate, ITermUpdate } from "./term.interface.js";

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
}

class TermRepo implements ITermRepo {
  async createTerm(data: ITermCreate): Promise<ITerm> {
    return await prisma.term.create({ data });
  }

  async getSessionDates(
    sessionId: string,
  ): Promise<{ startDate: Date | null; endDate: Date | null } | null> {
    return await prisma.academicSession.findUnique({
      where: { id: sessionId },
      select: { startDate: true, endDate: true },
    });
  }

  async getTerms(sessionId: string): Promise<ITerm[]> {
    return await prisma.term.findMany({
      where: { sessionId },
      orderBy: { name: "asc" },
    });
  }

  async getTermById(sessionId: string, id: string): Promise<ITerm | null> {
    return await prisma.term.findFirst({ where: { id, sessionId } });
  }

  async updateTerm(
    sessionId: string,
    id: string,
    data: ITermUpdate,
  ): Promise<ITerm | null> {
    if (data.isCurrent) {
      return await prisma.$transaction(async (tx) => {
        const term = await tx.term.findFirst({ where: { id, sessionId } });
        if (!term) return null;

        await tx.term.updateMany({
          where: { sessionId, isCurrent: true },
          data: { isCurrent: false },
        });
        return await tx.term.update({
          where: { id },
          data,
        });
      });
    }

    const result = await prisma.term.updateMany({
      where: { id, sessionId },
      data,
    });
    if (result.count === 0) return null;
    return await this.getTermById(sessionId, id);
  }

  async activateTerm(sessionId: string, id: string): Promise<ITerm | null> {
    return await prisma.$transaction(async (tx) => {
      const term = await tx.term.findFirst({ where: { id, sessionId } });
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
    const result = await prisma.term.deleteMany({ where: { id, sessionId } });
    return result.count > 0;
  }
}

export const termRepo = new TermRepo();
