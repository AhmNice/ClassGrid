import { normalize } from "@/utils/cleaner.js";
import { ApiError } from "@/utils/errorHandler.js";
export class TeachingAssignmentService {
    teachingAssignmentRepo;
    constructor(teachingAssignmentRepo) {
        this.teachingAssignmentRepo = teachingAssignmentRepo;
    }
    async createTeachingAssignment(data, schoolId) {
        const cleanData = normalize(data);
        if (!cleanData.sessionId || !cleanData.teacherId || !cleanData.subjectId || !cleanData.classArmId) {
            throw new ApiError(422, "Session, teacher, subject, and class arm are required");
        }
        if (!Number.isInteger(cleanData.periodsPerWeek) || cleanData.periodsPerWeek < 1) {
            throw new ApiError(422, "Periods per week must be a positive integer");
        }
        if (cleanData.maxPeriodsPerDay !== undefined &&
            cleanData.maxPeriodsPerDay !== null &&
            (!Number.isInteger(cleanData.maxPeriodsPerDay) ||
                cleanData.maxPeriodsPerDay < 1)) {
            throw new ApiError(422, "Maximum periods per day must be a positive integer");
        }
        if (!(await this.teachingAssignmentRepo.isValidCreateTarget(cleanData, schoolId))) {
            throw new ApiError(422, "Teacher, subject, class arm, and session must belong to the same active school assignment");
        }
        const existing = await this.teachingAssignmentRepo.findByUniqueKey(cleanData);
        if (existing?.isActive) {
            throw new ApiError(422, "Teaching assignment already exists");
        }
        if (existing) {
            return await this.teachingAssignmentRepo.reactivate(existing.id, cleanData);
        }
        return await this.teachingAssignmentRepo.create(cleanData);
    }
    async unassignTeachingAssignment(assignmentId, schoolId) {
        const assignment = await this.teachingAssignmentRepo.unassign(assignmentId, schoolId);
        if (!assignment) {
            throw new ApiError(404, "Active teaching assignment not found");
        }
        return assignment;
    }
    async getTeachingAssignment(assignmentId, schoolId) {
        const assignment = await this.teachingAssignmentRepo.findById(assignmentId, schoolId);
        if (!assignment)
            throw new ApiError(404, "Teaching assignment not found");
        return assignment;
    }
    async listTeachingAssignments(schoolId, query) {
        return await this.teachingAssignmentRepo.list(schoolId, query);
    }
    async getTeacherTeachingAssignments(schoolId, teacherId, sessionId) {
        return await this.teachingAssignmentRepo.getByTeacher(schoolId, teacherId, sessionId);
    }
    async updateTeachingAssignment(assignmentId, schoolId, data) {
        const existing = await this.teachingAssignmentRepo.findById(assignmentId, schoolId);
        if (!existing)
            throw new ApiError(404, "Teaching assignment not found");
        const cleanData = normalize(data);
        if (Object.keys(cleanData).length === 0) {
            throw new ApiError(400, "At least one field is required");
        }
        if (cleanData.periodsPerWeek !== undefined &&
            (!Number.isInteger(cleanData.periodsPerWeek) ||
                cleanData.periodsPerWeek < 1)) {
            throw new ApiError(422, "Periods per week must be a positive integer");
        }
        if (cleanData.maxPeriodsPerDay !== undefined &&
            cleanData.maxPeriodsPerDay !== null &&
            (!Number.isInteger(cleanData.maxPeriodsPerDay) ||
                cleanData.maxPeriodsPerDay < 1)) {
            throw new ApiError(422, "Maximum periods per day must be a positive integer");
        }
        const target = {
            sessionId: existing.sessionId,
            teacherId: cleanData.teacherId ?? existing.teacherId,
            subjectId: existing.subjectId,
            classArmId: existing.classArmId,
            periodsPerWeek: cleanData.periodsPerWeek ?? existing.periodsPerWeek,
            requiresDoublePeriod: cleanData.requiresDoublePeriod ?? existing.requiresDoublePeriod,
            requiredRoomType: cleanData.requiredRoomType ?? existing.requiredRoomType ?? undefined,
            maxPeriodsPerDay: cleanData.maxPeriodsPerDay ?? existing.maxPeriodsPerDay,
        };
        if (!(await this.teachingAssignmentRepo.isValidCreateTarget(target, schoolId))) {
            throw new ApiError(422, "Teacher, subject, class arm, and session must belong to the same active school assignment");
        }
        const duplicate = await this.teachingAssignmentRepo.findByUniqueKey(target, assignmentId);
        if (duplicate?.isActive) {
            throw new ApiError(422, "Another active teaching assignment already uses this teacher");
        }
        const updated = await this.teachingAssignmentRepo.reassign(assignmentId, schoolId, cleanData);
        if (!updated)
            throw new ApiError(404, "Teaching assignment not found");
        return updated;
    }
    async getClassTeachingAssignments(schoolId, sessionId, classLevelId, classArmId) {
        const classArm = await this.teachingAssignmentRepo.getClassArmTeachingAssignmentData(schoolId, classLevelId, classArmId, sessionId);
        if (!classArm) {
            throw new ApiError(404, "Class arm not found");
        }
        const assignmentsBySubject = new Map();
        for (const assignment of classArm.teachingAssignments) {
            const existing = assignmentsBySubject.get(assignment.subjectId) ?? [];
            existing.push(assignment);
            assignmentsBySubject.set(assignment.subjectId, existing);
        }
        return {
            classArm: {
                id: classArm.id,
                name: classArm.name,
                classLevel: {
                    id: classArm.classLevel.id,
                    name: classArm.classLevel.name,
                },
            },
            subjects: classArm.classLevel.subjects.map(({ subject }) => {
                const assignments = assignmentsBySubject.get(subject.id) ?? [];
                return {
                    id: subject.id,
                    name: subject.name,
                    code: subject.code,
                    assignments: assignments.map((assignment) => ({
                        id: assignment.id,
                        periodsPerWeek: assignment.periodsPerWeek,
                        teacher: assignment.teacher,
                    })),
                    eligibleTeachers: subject.teachers.map(({ teacher }) => teacher),
                    isAssigned: assignments.length > 0,
                };
            }),
        };
    }
}
