import { ApiError } from "@/utils/errorHandler.js";
import { normalize } from "@/utils/cleaner.js";
import { Prisma } from "@/generated/prisma/client.js";
export class TimetableEntryService {
    repo;
    timetableRepo;
    constructor(repo, timetableRepo) {
        this.repo = repo;
        this.timetableRepo = timetableRepo;
    }
    async ensureTimetable(timetableId) {
        const timetable = await this.timetableRepo.findById(timetableId);
        if (!timetable)
            throw new ApiError(404, "Timetable not found");
    }
    async ensureDraftTimetable(timetableId) {
        const timetable = await this.timetableRepo.findById(timetableId);
        if (!timetable)
            throw new ApiError(404, "Timetable not found");
        if (timetable.status !== "DRAFT") {
            throw new ApiError(409, "Only draft timetables can be modified");
        }
    }
    async ensureDraftEntry(entryId) {
        const entry = await this.repo.findById(entryId);
        if (!entry)
            throw new ApiError(404, "Timetable entry not found");
        await this.ensureDraftTimetable(entry.timetableId);
    }
    handleDbClashError(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            const target = String(error.meta?.target ?? "");
            if (target.includes("uq_entry_class_clash")) {
                throw new ApiError(409, "Class cannot have two lessons in one slot");
            }
            if (target.includes("uq_entry_teacher_clash")) {
                throw new ApiError(409, "Teacher cannot teach two lessons in one slot");
            }
            if (target.includes("uq_entry_room_clash")) {
                throw new ApiError(409, "Room cannot host two lessons in one slot");
            }
        }
        throw error;
    }
    /**
     * Create entry resolving classArmId and teacherId securely from the Teaching Assignment.
     */
    async createEntry(data, resolvedAssignment) {
        const cleanData = normalize(data);
        if (!cleanData.timetableId ||
            !cleanData.periodId ||
            !cleanData.assignmentId ||
            !cleanData.dayOfWeek) {
            throw new ApiError(422, "Required timetable entry fields are missing");
        }
        await this.ensureDraftTimetable(cleanData.timetableId);
        try {
            return await this.repo.create({
                ...cleanData,
                classArmId: resolvedAssignment.classArmId,
                teacherId: resolvedAssignment.teacherId,
            });
        }
        catch (error) {
            this.handleDbClashError(error);
        }
    }
    async updateEntry(entryId, data) {
        const cleanData = normalize(data);
        if (Object.keys(cleanData).length === 0) {
            throw new ApiError(400, "At least one field is required");
        }
        await this.ensureDraftEntry(entryId);
        try {
            return await this.repo.update(entryId, cleanData);
        }
        catch (error) {
            this.handleDbClashError(error);
        }
    }
    async deleteEntry(entryId) {
        await this.ensureDraftEntry(entryId);
        return this.repo.delete(entryId);
    }
    async assignRoom(entryId, roomId) {
        if (!roomId || !roomId.trim()) {
            throw new ApiError(422, "Room ID cannot be empty");
        }
        await this.ensureDraftEntry(entryId);
        try {
            return await this.repo.update(entryId, { roomId });
        }
        catch (error) {
            this.handleDbClashError(error);
        }
    }
    async getWeeklyEntries(timetableId) {
        await this.ensureTimetable(timetableId);
        return this.repo.getWeeklyEntries(timetableId);
    }
    async getClassWeeklyEntries(timetableId, classArmId) {
        await this.ensureTimetable(timetableId);
        return this.repo.getClassWeeklyEntries(timetableId, classArmId);
    }
    async getTeacherWeeklyEntries(timetableId, teacherId) {
        await this.ensureTimetable(timetableId);
        return this.repo.getTeacherWeeklyEntries(timetableId, teacherId);
    }
    async getRoomWeeklyEntries(timetableId, roomId) {
        await this.ensureTimetable(timetableId);
        return this.repo.getRoomWeeklyEntries(timetableId, roomId);
    }
}
