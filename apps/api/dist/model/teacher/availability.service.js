import { ApiError } from "@/utils/errorHandler.js";
import { prisma } from "@/lib/prisma.js";
import { teacherAvailabilityRepo, } from "./availability.repo.js";
import { TeacherRepo } from "./teacher.repo.js";
export class TeacherAvailabilityService {
    repo;
    teacherRepo;
    constructor(repo, teacherRepo) {
        this.repo = repo;
        this.teacherRepo = teacherRepo;
    }
    async ensureValidSlot(teacherId, dayOfWeek, periodId) {
        const teacher = await this.teacherRepo.getTeacherById(teacherId);
        if (!teacher)
            throw new ApiError(404, "Teacher not found");
        const period = await prisma.period.findFirst({
            where: {
                id: periodId,
                schoolId: teacher.schoolId,
                kind: "LESSON",
                isActive: true,
            },
            include: {
                periodSchedule: {
                    select: { applicableDays: true, isActive: true },
                },
            },
        });
        if (!period) {
            throw new ApiError(422, "Period must be an active lesson period for the teacher's school");
        }
        if (!period.periodSchedule ||
            !period.periodSchedule.isActive ||
            !period.periodSchedule.applicableDays.includes(dayOfWeek)) {
            throw new ApiError(422, "Period schedule does not apply to the selected day");
        }
    }
    async ensureUniqueSlot(teacherId, dayOfWeek, periodId, currentId) {
        const existing = await this.repo.list(teacherId);
        if (existing.some((item) => item.id !== currentId &&
            item.dayOfWeek === dayOfWeek &&
            item.periodId === periodId)) {
            throw new ApiError(422, "Teacher availability is already configured for this day and period");
        }
    }
    async create(data) {
        await this.ensureValidSlot(data.teacherId, data.dayOfWeek, data.periodId);
        await this.ensureUniqueSlot(data.teacherId, data.dayOfWeek, data.periodId);
        return await this.repo.create(data);
    }
    async list(teacherId) {
        const teacher = await this.teacherRepo.getTeacherById(teacherId);
        if (!teacher)
            throw new ApiError(404, "Teacher not found");
        return await this.repo.list(teacherId);
    }
    async findById(teacherId, id) {
        return await this.repo.findById(teacherId, id);
    }
    async update(teacherId, id, data) {
        const existing = await this.repo.findById(teacherId, id);
        if (!existing)
            return null;
        await this.ensureValidSlot(teacherId, data.dayOfWeek ?? existing.dayOfWeek, data.periodId ?? existing.periodId);
        await this.ensureUniqueSlot(teacherId, data.dayOfWeek ?? existing.dayOfWeek, data.periodId ?? existing.periodId, id);
        return await this.repo.update(teacherId, id, data);
    }
    async delete(teacherId, id) {
        return await this.repo.delete(teacherId, id);
    }
}
export const teacherAvailabilityService = new TeacherAvailabilityService(teacherAvailabilityRepo, new TeacherRepo());
