-- CreateEnum
CREATE TYPE "PeriodScheduleKind" AS ENUM ('WEEKDAY_SCHEDULE', 'FRIDAY_SCHEDULE');

-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "periodScheduleScheduleId" UUID;

-- CreateTable
CREATE TABLE "PeriodSchedule" (
    "scheduleId" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "name" "PeriodScheduleKind" NOT NULL,
    "applicableDays" "DayOfWeek"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PeriodSchedule_pkey" PRIMARY KEY ("scheduleId")
);

-- CreateIndex
CREATE INDEX "PeriodSchedule_schoolId_isActive_idx" ON "PeriodSchedule"("schoolId", "isActive");

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_periodScheduleScheduleId_fkey" FOREIGN KEY ("periodScheduleScheduleId") REFERENCES "PeriodSchedule"("scheduleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodSchedule" ADD CONSTRAINT "PeriodSchedule_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
