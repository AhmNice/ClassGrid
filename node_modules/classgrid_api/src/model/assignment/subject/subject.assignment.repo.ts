import { prisma } from "@/lib/prisma.js";
import {
  IClassLevelSubject,
  IClassLevelSubjectCreate,
  IClassLevelSubjectUpdate,
} from "./subject.assignment.interface.js";
import { PrismaTx } from "@/types/general.js";

export interface IClassLevelSubjectRepo {
  createClassLevelSubject(
    data: IClassLevelSubjectCreate,
  ): Promise<IClassLevelSubject>;
  getAllClassLevelSubjects(): Promise<IClassLevelSubject[]>;
  getClassLevelSubjectsByClassLevelId(
    classLevelId: string,
  ): Promise<IClassLevelSubject[]>;
  getClassLevelSubjectsBySubjectId(
    subjectId: string,
  ): Promise<IClassLevelSubject[]>;
  getClassLevelSubjectById(id: string): Promise<IClassLevelSubject | null>;
  updateClassLevelSubject(
    id: string,
    data: IClassLevelSubjectUpdate,
  ): Promise<IClassLevelSubject | null>;
  deleteClassLevelSubject(id: string): Promise<boolean>;
  removeAllocations(
    schoolId: string,
    allocations: { classLevelId: string; subjectId: string }[],
  ): Promise<void>;

  // Expose transaction wrapper
  transaction<T>(fn: (repo: IClassLevelSubjectRepo) => Promise<T>): Promise<T>;
}

export class ClassLevelSubjectRepo implements IClassLevelSubjectRepo {
  constructor(private readonly db: PrismaTx = prisma) {}

  async createClassLevelSubject(
    data: IClassLevelSubjectCreate,
  ): Promise<IClassLevelSubject> {
    return await this.db.classLevelSubject.create({ data });
  }

  async getClassLevelSubjectsByClassLevelId(
    classLevelId: string,
  ): Promise<IClassLevelSubject[]> {
    return await this.db.classLevelSubject.findMany({
      where: { classLevelId },
    });
  }
  async getAllClassLevelSubjects(): Promise<IClassLevelSubject[]> {
    return await this.db.classLevelSubject.findMany();
  }
  async getClassLevelSubjectsBySubjectId(
    subjectId: string,
  ): Promise<IClassLevelSubject[]> {
    return await this.db.classLevelSubject.findMany({ where: { subjectId } });
  }

  async getClassLevelSubjectById(
    id: string,
  ): Promise<IClassLevelSubject | null> {
    return await this.db.classLevelSubject.findUnique({ where: { id } });
  }

  async updateClassLevelSubject(
    id: string,
    data: IClassLevelSubjectUpdate,
  ): Promise<IClassLevelSubject | null> {
    return await this.db.classLevelSubject.update({ where: { id }, data });
  }

  async deleteClassLevelSubject(id: string): Promise<boolean> {
    await this.db.classLevelSubject.delete({ where: { id } });
    return true;
  }

  async removeAllocations(
    schoolId: string,
    allocations: { classLevelId: string; subjectId: string }[],
  ): Promise<void> {
    if (allocations.length === 0) return;

    await this.db.classLevelSubject.deleteMany({
      where: {
        schoolId,
        OR: allocations.map((allocation) => ({
          classLevelId: allocation.classLevelId,
          subjectId: allocation.subjectId,
        })),
      },
    });
  }

  // Transaction runner method
  async transaction<T>(
    fn: (repo: IClassLevelSubjectRepo) => Promise<T>,
  ): Promise<T> {
    return await prisma.$transaction(async (tx) => {
      const txRepo = new ClassLevelSubjectRepo(tx);
      return await fn(txRepo);
    });
  }
}
