/*
  Warnings:

  - Added the required column `examEndDate` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examStartDate` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `midTermEndDate` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `midTermStartDate` to the `Term` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "examEndDate" DATE NOT NULL,
ADD COLUMN     "examStartDate" DATE NOT NULL,
ADD COLUMN     "midTermEndDate" DATE NOT NULL,
ADD COLUMN     "midTermStartDate" DATE NOT NULL;
