import { normalize } from "@/utils/cleaner.js";
import {
  IClassLevelSubject,
  IClassLevelSubjectCreate,
  IClassLevelSubjectUpdate,
  IClassSubjectAllocation,
  IManageClassSubjectAllocations,
} from "./subject.assignment.interface.js";
import { IClassLevelSubjectRepo } from "./subject.assignment.repo.js";
import { ISubjectRepo } from "@/model/subject/subject.repo.js";
import { IClassLevelRepo } from "@/model/class/level/class.repo.js";
import { ApiError } from "@/utils/errorHandler.js";
import _ from "lodash";
export interface ISubjectAssignmentService {
  assignSubjectToClassLevel(
    data: IClassLevelSubjectCreate,
  ): Promise<IClassLevelSubject>;
  getAllSubjectAssignments(): Promise<IClassLevelSubject[]>;
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
}
export class SubjectAssignmentService implements ISubjectAssignmentService {
  constructor(
    private readonly repo: IClassLevelSubjectRepo,
    private readonly subjectRepo: ISubjectRepo,
    private readonly classLevelRepo: IClassLevelRepo,
  ) {}
  async updateSubjectAssignments(
    data: IManageClassSubjectAllocations,
  ): Promise<void> {
    const { schoolId, additions, removals } = data;

    if (!schoolId) throw new ApiError(422, "School ID is required");
    if (!additions || !removals)
      throw new ApiError(422, "Additions and removals are required");

    const cleanAdditions = normalize(additions) as IClassSubjectAllocation[];
    const cleanRemovals = normalize(removals) as IClassSubjectAllocation[];

    if (_.isEmpty(cleanAdditions) && _.isEmpty(cleanRemovals)) {
      throw new ApiError(422, "At least one addition or removal is required");
    }

    const classLevelIds = [
      ...new Set(
        [...cleanAdditions, ...cleanRemovals].map((a) => a.classLevelId),
      ),
    ];
    const subjectIds = [
      ...new Set([...cleanAdditions, ...cleanRemovals].map((a) => a.subjectId)),
    ];

    const [classLevels, subjects] = await Promise.all([
      this.classLevelRepo.findByIds(classLevelIds, schoolId, ["id"]),
      this.subjectRepo.findByIds(subjectIds, schoolId, ["id"]),
    ]);

    if (classLevels.length !== classLevelIds.length) {
      throw new ApiError(404, "One or more class levels not found");
    }
    if (subjects.length !== subjectIds.length) {
      throw new ApiError(404, "One or more subjects not found");
    }

    // Run atomically using repository transaction wrapper
    await this.repo.transaction(async (txRepo) => {
      if (cleanAdditions.length > 0) {
        await Promise.all(
          cleanAdditions.map((allocation) =>
            txRepo.createClassLevelSubject({
              schoolId,
              classLevelId: allocation.classLevelId,
              subjectId: allocation.subjectId,
            }),
          ),
        );
      }

      if (cleanRemovals.length > 0) {
        await txRepo.removeAllocations(schoolId, cleanRemovals);
      }
    });
  }
  async assignSubjectToClassLevel(
    data: IClassLevelSubjectCreate,
  ): Promise<IClassLevelSubject> {
    const clean = normalize(data) as IClassLevelSubjectCreate;
    if (_.isEmpty(clean)) throw new ApiError(422, "No data provided");
    const [existingSubject, existingClassLevel] = await Promise.all([
      this.subjectRepo.getSubjectById(clean.subjectId),
      this.classLevelRepo.getClassLevelById(clean.classLevelId),
    ]);
    if (!existingSubject) throw new ApiError(404, "Subject not found");
    if (!existingClassLevel) throw new ApiError(404, "Class level not found");
    return await this.repo.createClassLevelSubject(clean);
  }
  async getClassLevelSubjectsByClassLevelId(
    classLevelId: string,
  ): Promise<IClassLevelSubject[]> {
    return await this.repo.getClassLevelSubjectsByClassLevelId(classLevelId);
  }
  async getClassLevelSubjectsBySubjectId(
    subjectId: string,
  ): Promise<IClassLevelSubject[]> {
    return await this.repo.getClassLevelSubjectsBySubjectId(subjectId);
  }
  async getAllSubjectAssignments(): Promise<IClassLevelSubject[]> {
    return await this.repo.getAllClassLevelSubjects();
  }
  async getClassLevelSubjectById(
    id: string,
  ): Promise<IClassLevelSubject | null> {
    return await this.repo.getClassLevelSubjectById(id);
  }
  async updateClassLevelSubject(
    id: string,
    data: IClassLevelSubjectUpdate,
  ): Promise<IClassLevelSubject | null> {
    return await this.repo.updateClassLevelSubject(id, data);
  }
  async deleteClassLevelSubject(id: string): Promise<boolean> {
    return await this.repo.deleteClassLevelSubject(id);
  }
}
