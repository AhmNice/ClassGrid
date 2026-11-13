-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "defaultAllowConsecutive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultMaxConsecutive" INTEGER,
ADD COLUMN     "defaultMaxPeriodsPerDay" INTEGER,
ADD COLUMN     "defaultPeriodsPerWeek" INTEGER;
