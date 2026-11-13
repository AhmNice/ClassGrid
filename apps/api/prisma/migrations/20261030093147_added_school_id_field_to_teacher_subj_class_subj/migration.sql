/*
  Warnings:

  - Added the required column `schoolId` to the `ClassLevelSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `TeacherSubject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClassLevelSubject" ADD COLUMN     "schoolId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "TeacherSubject" ADD COLUMN     "schoolId" UUID NOT NULL;
