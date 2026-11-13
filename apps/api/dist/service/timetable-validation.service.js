export class TimetableValidationService {
    entryRepo;
    constructor(entryRepo) {
        this.entryRepo = entryRepo;
    }
    /**
     * Run full audit for publishing checklist (CLASSGRID-3.31 to 3.36)
     */
    async validateTimetable(timetableId, teachingAssignments, teacherAvailabilities, rooms) {
        const errors = [];
        const entries = await this.entryRepo.getWeeklyEntries(timetableId);
        // 1. CLASSGRID-3.31 & 3.32: Validate Weekly Lesson Requirements & Unscheduled Assignments
        for (const assignment of teachingAssignments) {
            const scheduledCount = entries.filter((e) => e.assignmentId === assignment.id).length;
            if (scheduledCount < assignment.periodsPerWeek) {
                errors.push({
                    code: "UNSCHEDULED_LESSONS",
                    category: "CURRICULUM",
                    message: `Teaching assignment is missing ${assignment.periodsPerWeek - scheduledCount} periods.`,
                    details: {
                        assignmentId: assignment.id,
                        scheduled: scheduledCount,
                        required: assignment.periodsPerWeek,
                    },
                });
            }
        }
        // 2. CLASSGRID-3.25, 3.26, 3.33: Slot-by-Slot Conflict Audit (Class, Teacher, Room)
        const classSlotMap = new Set();
        const teacherSlotMap = new Set();
        const roomSlotMap = new Set();
        for (const entry of entries) {
            const classKey = `${entry.classArmId}_${entry.dayOfWeek}_${entry.periodId}`;
            const teacherKey = `${entry.teacherId}_${entry.dayOfWeek}_${entry.periodId}`;
            const roomKey = entry.roomId
                ? `${entry.roomId}_${entry.dayOfWeek}_${entry.periodId}`
                : null;
            if (classSlotMap.has(classKey)) {
                errors.push({
                    code: "CLASS_CLASH",
                    category: "CONFLICT",
                    message: `Class arm has multiple lessons scheduled in the same period slot.`,
                    details: {
                        classArmId: entry.classArmId,
                        dayOfWeek: entry.dayOfWeek,
                        periodId: entry.periodId,
                    },
                });
            }
            if (teacherSlotMap.has(teacherKey)) {
                errors.push({
                    code: "TEACHER_CLASH",
                    category: "TEACHER",
                    message: `Teacher assigned to multiple classes in the same period slot.`,
                    details: {
                        teacherId: entry.teacherId,
                        dayOfWeek: entry.dayOfWeek,
                        periodId: entry.periodId,
                    },
                });
            }
            if (roomKey && roomSlotMap.has(roomKey)) {
                errors.push({
                    code: "ROOM_CLASH",
                    category: "ROOM",
                    message: `Room booked for multiple classes in the same period slot.`,
                    details: {
                        roomId: entry.roomId,
                        dayOfWeek: entry.dayOfWeek,
                        periodId: entry.periodId,
                    },
                });
            }
            classSlotMap.add(classKey);
            teacherSlotMap.add(teacherKey);
            if (roomKey)
                roomSlotMap.add(roomKey);
            // 3. CLASSGRID-3.35: Teacher Availability Check (Optional)
            if (teacherAvailabilities && teacherAvailabilities.length > 0) {
                const isUnavailable = teacherAvailabilities.some((a) => a.teacherId === entry.teacherId &&
                    a.dayOfWeek === entry.dayOfWeek &&
                    a.periodId === entry.periodId &&
                    a.status === "UNAVAILABLE");
                if (isUnavailable) {
                    errors.push({
                        code: "TEACHER_UNAVAILABLE",
                        category: "AVAILABILITY",
                        message: `Teacher is marked unavailable during this period slot.`,
                        details: { teacherId: entry.teacherId, periodId: entry.periodId },
                    });
                }
            }
        }
        // 4. CLASSGRID-3.36: Generate Structured Validation Summary
        return {
            isValid: errors.length === 0,
            totalErrors: errors.length,
            errorsByCategory: {
                curriculum: errors.filter((e) => e.category === "CURRICULUM").length,
                conflicts: errors.filter((e) => e.category === "CONFLICT" ||
                    e.category === "TEACHER" ||
                    e.category === "ROOM").length,
                rooms: errors.filter((e) => e.category === "ROOM").length,
                teachers: errors.filter((e) => e.category === "TEACHER" || e.category === "AVAILABILITY").length,
            },
            errors,
        };
    }
}
