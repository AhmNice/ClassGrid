import { prisma } from "@/lib/prisma.js";
import {
  IAcademicSession,
  IAcademicSessionCreate,
  IAcademicSessionUpdate,
} from "./academic-session.interface.js";
import { ITerm } from "../term/term.interface.js";

export interface IAcademicSessionRepo {
  createAcademicSession(
    data: IAcademicSessionCreate,
  ): Promise<IAcademicSession>;
  getAcademicSessions(schoolId: string): Promise<IAcademicSession[]>;
  getCurrentAcademicSession(schoolId: string): Promise<IAcademicSession | null>;
  getAcademicSessionById(id: string): Promise<IAcademicSession | null>;
  getTerms(sessionId: string): Promise<ITerm[]>;
  updateAcademicSession(
    id: string,
    data: IAcademicSessionUpdate,
  ): Promise<IAcademicSession | null>;
  activateAcademicSession(id: string): Promise<IAcademicSession | null>;
  deleteAcademicSession(id: string): Promise<boolean>;
}

class AcademicSessionRepo implements IAcademicSessionRepo {
  async createAcademicSession(
    data: IAcademicSessionCreate,
  ): Promise<IAcademicSession> {
    return await prisma.$transaction(async (tx) => {
      if (data.isCurrent) {
        await tx.academicSession.updateMany({
          where: { schoolId: data.schoolId, isCurrent: true },
          data: { isCurrent: false },
        });
      }
      return await tx.academicSession.create({ data });
    });
  }

  async getAcademicSessions(schoolId: string): Promise<IAcademicSession[]> {
    return await prisma.academicSession.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCurrentAcademicSession(
    schoolId: string,
  ): Promise<IAcademicSession | null> {
    return await prisma.academicSession.findFirst({
      where: { schoolId, isCurrent: true },
    });
  }

  async getAcademicSessionById(id: string): Promise<IAcademicSession | null> {
    return await prisma.academicSession.findUnique({
      where: { id },
    });
  }

  async getTerms(sessionId: string): Promise<ITerm[]> {
    return await prisma.term.findMany({
      where: { sessionId },
      // select: { name: true, startDate: true, endDate: true, isCurrent: true },
      orderBy: { startDate: "asc" },
    });
  }

  async updateAcademicSession(
    id: string,
    data: IAcademicSessionUpdate,
  ): Promise<IAcademicSession | null> {
    if (data.isCurrent) {
      return await prisma.$transaction(async (tx) => {
        const session = await tx.academicSession.findUnique({ where: { id } });
        if (!session) return null;

        await tx.academicSession.updateMany({
          where: { schoolId: session.schoolId, isCurrent: true },
          data: { isCurrent: false },
        });
        return await tx.academicSession.update({
          where: { id },
          data,
        });
      });
    }

    try {
      return await prisma.academicSession.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      // P2025: record to update not found
      if (error?.code === "P2025") return null;
      throw error;
    }
  }

  async activateAcademicSession(id: string): Promise<IAcademicSession | null> {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.academicSession.findUnique({ where: { id } });
      if (!session) return null;

      await tx.academicSession.updateMany({
        where: { schoolId: session.schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
      return await tx.academicSession.update({
        where: { id },
        data: { isCurrent: true },
      });
    });
  }

  async deleteAcademicSession(id: string): Promise<boolean> {
    try {
      await prisma.academicSession.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      // P2025: record to delete not found
      if (error?.code === "P2025") return false;
      throw error;
    }
  }
}

export const academicSessionRepo = new AcademicSessionRepo();
