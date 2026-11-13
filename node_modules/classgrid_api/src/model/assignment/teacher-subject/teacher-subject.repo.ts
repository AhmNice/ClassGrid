import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import type {
  ITeacherSubject,
  ITeacherSubjectCreate,
  ITeacherSubjectDetails,
  ITeacherSubjectListQuery,
} from "./teacher-subject.interface.js";
import { PrismaTx } from "@/types/general.js";

const detailsInclude = {
  teacher: {
    select: {
      id: true,
      title: true,
      firstName: true,
      lastName: true,
      staffCode: true,
    },
  },
  subject: {
    select: { id: true, name: true, code: true },
  },
} satisfies Prisma.TeacherSubjectInclude;

export interface ITeacherSubjectRepo {
  create(data: ITeacherSubjectCreate): Promise<ITeacherSubjectDetails>;
  findById(
    schoolId: string,
    id: string,
  ): Promise<ITeacherSubjectDetails | null>;
  findByPair(
    schoolId: string,
    teacherId: string,
    subjectId: string,
  ): Promise<ITeacherSubjectDetails | null>;
  list(
    schoolId: string,
    query: ITeacherSubjectListQuery,
  ): Promise<ITeacherSubjectDetails[]>;
  delete(schoolId: string, id: string): Promise<boolean>;
  validateTarget(
    schoolId: string,
    teacherId: string,
    subjectId: string,
  ): Promise<boolean>;
  transaction<T>(fn: (repo: ITeacherSubjectRepo) => Promise<T>): Promise<T>;
}

export class TeacherSubjectRepo implements ITeacherSubjectRepo {
  constructor(private readonly db: PrismaTx = prisma) {}
  async create(data: ITeacherSubjectCreate): Promise<ITeacherSubjectDetails> {
    return await this.db.teacherSubject.create({
      data,
      include: detailsInclude,
    });
  }

  async findById(
    schoolId: string,
    id: string,
  ): Promise<ITeacherSubjectDetails | null> {
    return await this.db.teacherSubject.findFirst({
      where: { id, schoolId },
      include: detailsInclude,
    });
  }

  async findByPair(
    schoolId: string,
    teacherId: string,
    subjectId: string,
  ): Promise<ITeacherSubjectDetails | null> {
    return await this.db.teacherSubject.findFirst({
      where: { schoolId, teacherId, subjectId },
      include: detailsInclude,
    });
  }

  async list(
    schoolId: string,
    query: ITeacherSubjectListQuery,
  ): Promise<ITeacherSubjectDetails[]> {
    return await this.db.teacherSubject.findMany({
      where: {
        schoolId,
        ...(query.teacherId ? { teacherId: query.teacherId } : {}),
        ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      },
      include: detailsInclude,
      orderBy: [
        { teacher: { lastName: "asc" } },
        { teacher: { firstName: "asc" } },
        { subject: { name: "asc" } },
      ],
    });
  }

  async delete(schoolId: string, id: string): Promise<boolean> {
    const result = await this.db.teacherSubject.deleteMany({
      where: { id, schoolId },
    });
    return result.count > 0;
  }

  async validateTarget(
    schoolId: string,
    teacherId: string,
    subjectId: string,
  ): Promise<boolean> {
    const [teacher, subject] = await Promise.all([
      this.db.teacher.findFirst({
        where: { id: teacherId, schoolId, isActive: true },
        select: { id: true },
      }),
      this.db.subject.findFirst({
        where: { id: subjectId, schoolId, isActive: true },
        select: { id: true },
      }),
    ]);
    return Boolean(teacher && subject);
  }
  async transaction<T>(
    fn: (repo: ITeacherSubjectRepo) => Promise<T>,
  ): Promise<T> {
    return await prisma.$transaction(async (tx: PrismaTx) => {
      const repo = new TeacherSubjectRepo(tx);
      return await fn(repo);
    });
  }
}

export const teacherSubjectRepo = new TeacherSubjectRepo();
