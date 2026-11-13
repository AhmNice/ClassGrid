import { DayOfWeek, PeriodScheduleKind, } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
const WEEKDAYS = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
];
async function seedPeriodSchedules() {
    const schools = await prisma.school.findMany({
        select: { id: true, workingDays: true, name: true },
    });
    for (const school of schools) {
        const existing = await prisma.periodSchedule.findMany({
            where: { schoolId: school.id },
            select: { name: true },
        });
        const existingNames = new Set(existing.map((schedule) => schedule.name));
        const weekdayDays = school.workingDays.filter((day) => day !== DayOfWeek.FRIDAY);
        const schedules = [];
        if (weekdayDays.length > 0 &&
            !existingNames.has(PeriodScheduleKind.WEEKDAY_SCHEDULE)) {
            schedules.push({
                schoolId: school.id,
                name: PeriodScheduleKind.WEEKDAY_SCHEDULE,
                applicableDays: weekdayDays,
            });
        }
        if (school.workingDays.includes(DayOfWeek.FRIDAY) &&
            !existingNames.has(PeriodScheduleKind.FRIDAY_SCHEDULE)) {
            schedules.push({
                schoolId: school.id,
                name: PeriodScheduleKind.FRIDAY_SCHEDULE,
                applicableDays: [DayOfWeek.FRIDAY],
            });
        }
        if (schedules.length > 0) {
            await prisma.periodSchedule.createMany({ data: schedules });
            console.log(`Created ${schedules.length} period schedule(s) for "${school.name}".`);
        }
    }
    if (schools.length === 0) {
        console.log("No schools found. Create a school before seeding schedules.");
    }
}
seedPeriodSchedules()
    .catch((error) => {
    console.error("Failed to seed period schedules:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
