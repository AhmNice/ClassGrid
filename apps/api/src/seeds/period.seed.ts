import {
  DayOfWeek,
  PeriodKind,
  PeriodScheduleKind,
  Prisma,
} from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import { fileURLToPath } from "node:url";

const SCHOOL_START_MINUTES = 8 * 60;

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function createPeriods(
  schoolId: string,
  scheduleId: string,
  duration: number,
  lessonCount: number,
  breakAfterLesson: number,
): Prisma.PeriodCreateManyInput[] {
  const slots: Prisma.PeriodCreateManyInput[] = [];
  let startMinutes = SCHOOL_START_MINUTES;

  for (let lessonNumber = 1; lessonNumber <= lessonCount; lessonNumber++) {
    slots.push({
      schoolId,
      periodScheduleScheduleId: scheduleId,
      name: `Period ${lessonNumber}`,
      kind: PeriodKind.LESSON,
      sequence: slots.length + 1,
      startTime: formatTime(startMinutes),
      endTime: formatTime(startMinutes + duration),
    });
    startMinutes += duration;

    if (lessonNumber === breakAfterLesson) {
      slots.push({
        schoolId,
        periodScheduleScheduleId: scheduleId,
        name: "Break",
        kind: PeriodKind.BREAK,
        sequence: slots.length + 1,
        startTime: formatTime(startMinutes),
        endTime: formatTime(startMinutes + duration),
      });
      startMinutes += duration;
    }
  }

  return slots;
}

async function ensureSchedule(
  school: { id: string; workingDays: DayOfWeek[] },
  name: PeriodScheduleKind,
): Promise<{ scheduleId: string } | null> {
  const applicableDays =
    name === PeriodScheduleKind.FRIDAY_SCHEDULE
      ? [DayOfWeek.FRIDAY]
      : school.workingDays.filter((day) => day !== DayOfWeek.FRIDAY);

  if (applicableDays.length === 0) return null;

  const existing = await prisma.periodSchedule.findFirst({
    where: { schoolId: school.id, name },
    select: { scheduleId: true },
  });
  if (existing) {
    return prisma.periodSchedule.update({
      where: { scheduleId: existing.scheduleId },
      data: { applicableDays },
      select: { scheduleId: true },
    });
  }

  return prisma.periodSchedule.create({
    data: { schoolId: school.id, name, applicableDays },
    select: { scheduleId: true },
  });
}

async function seedPeriodType(
  school: { id: string; name: string; workingDays: DayOfWeek[] },
  scheduleKind: PeriodScheduleKind,
  duration: number,
  lessonCount: number,
  breakAfterLesson: number,
): Promise<number> {
  const schedule = await prisma.periodSchedule.findFirst({
    where: { schoolId: school.id, name: scheduleKind },
    select: { scheduleId: true },
  });
  const ensuredSchedule =
    schedule ?? (await ensureSchedule(school, scheduleKind));

  if (!ensuredSchedule) return 0;

  const existingCount = await prisma.period.count({
    where: {
      schoolId: school.id,
      periodScheduleScheduleId: ensuredSchedule.scheduleId,
      isActive: true,
    },
  });
  if (existingCount > 0) {
    console.log(
      `Skipped ${scheduleKind} periods for "${school.name}": ` +
        "active periods already exist.",
    );
    return 0;
  }

  try {
    await prisma.period.createMany({
      data: createPeriods(
        school.id,
        ensuredSchedule.scheduleId,
        duration,
        lessonCount,
        breakAfterLesson,
      ),
    });
  } catch (error) {
    const target =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.meta?.target
        : undefined;
    const hasSequenceConstraint =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.message.includes("uq_period_active_sequence") ||
        target === "uq_period_active_sequence" ||
        (Array.isArray(target) &&
          target.includes("uq_period_active_sequence")));

    if (hasSequenceConstraint && error.code === "P2002") {
      console.log(
        `Skipped ${scheduleKind} periods for "${school.name}": ` +
          "active period sequences already exist.",
      );
      return 0;
    }
    throw error;
  }
  return lessonCount + 1;
}

export async function seedPeriods(): Promise<void> {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true, workingDays: true },
  });

  if (schools.length === 0) {
    console.log("No schools found. Create a school before seeding periods.");
    return;
  }

  for (const school of schools) {
    const weekdayCount = await seedPeriodType(
      school,
      PeriodScheduleKind.WEEKDAY_SCHEDULE,
      40,
      5,
      3,
    );
    const fridayCount = await seedPeriodType(
      school,
      PeriodScheduleKind.FRIDAY_SCHEDULE,
      30,
      7,
      4,
    );
    console.log(
      `Created ${weekdayCount + fridayCount} period(s) for "${school.name}" ` +
        `(weekday: ${weekdayCount}, Friday: ${fridayCount}).`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedPeriods()
    .catch((error: unknown) => {
      console.error("Failed to seed periods:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
