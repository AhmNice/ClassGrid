DROP INDEX IF EXISTS "uq_period_active_sequence";

CREATE UNIQUE INDEX "uq_period_active_sequence"
ON "Period" ("schoolId", "periodScheduleScheduleId", "sequence")
WHERE "isActive" = true;
