import { prisma } from "@/lib/prisma.js";
import { seedPeriods } from "./period.seed.js";
import { seedSchool } from "./school.seeds.js";
import { seedSubjects } from "./subject.seed.js";
import { seedTeachers } from "./teacher.seed.js";

async function seedAll(): Promise<void> {
  console.log("Starting database seed...");

  await seedSchool();
  await seedTeachers();
  await seedSubjects();
  await seedPeriods();

  console.log("Database seed completed.");
}

seedAll()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
