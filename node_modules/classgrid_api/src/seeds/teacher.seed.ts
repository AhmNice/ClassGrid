import type { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import { fileURLToPath } from "node:url";

const TEACHERS: Omit<Prisma.TeacherCreateManyInput, "schoolId">[] = [
  {
    title: "Mr.",
    firstName: "Adewale",
    lastName: "Adebayo",
    email: "adewale.adebayo@example.com",
    phone: "+2348000000001",
    staffCode: "T001",
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 28,
    maxConsecutivePeriods: 3,
  },
  {
    title: "Mrs.",
    firstName: "Chioma",
    lastName: "Okafor",
    email: "chioma.okafor@example.com",
    phone: "+2348000000002",
    staffCode: "T002",
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 28,
    maxConsecutivePeriods: 3,
  },
  {
    title: "Mr.",
    firstName: "Ibrahim",
    lastName: "Musa",
    email: "ibrahim.musa@example.com",
    phone: "+2348000000003",
    staffCode: "T003",
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 28,
    maxConsecutivePeriods: 3,
  },
  {
    title: "Mrs.",
    firstName: "Ngozi",
    lastName: "Eze",
    email: "ngozi.eze@example.com",
    phone: "+2348000000004",
    staffCode: "T004",
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 28,
    maxConsecutivePeriods: 3,
  },
  {
    title: "Dr.",
    firstName: "Samuel",
    lastName: "Adeyemi",
    email: "samuel.adeyemi@example.com",
    phone: "+2348000000005",
    staffCode: "T005",
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 24,
    maxConsecutivePeriods: 2,
  },
  {
    title: "Mrs.",
    firstName: "Fatima",
    lastName: "Abdullahi",
    email: "fatima.abdullahi@example.com",
    phone: "+2348000000006",
    staffCode: "T006",
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 28,
    maxConsecutivePeriods: 3,
  },
  {
    title: "Mr.",
    firstName: "Emeka",
    lastName: "Nwosu",
    email: "emeka.nwosu@example.com",
    phone: "+2348000000007",
    staffCode: "T007",
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 28,
    maxConsecutivePeriods: 3,
  },
  {
    title: "Mrs.",
    firstName: "Grace",
    lastName: "Okoro",
    email: "grace.okoro@example.com",
    phone: "+2348000000008",
    staffCode: "T008",
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 24,
    maxConsecutivePeriods: 2,
  },
];

export async function seedTeachers(): Promise<void> {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true },
  });

  if (schools.length === 0) {
    console.log("No schools found. Create a school before seeding teachers.");
    return;
  }

  for (const school of schools) {
    const existing = await prisma.teacher.findMany({
      where: { schoolId: school.id },
      select: { staffCode: true },
    });
    const existingStaffCodes = new Set(
      existing
        .map((teacher) => teacher.staffCode)
        .filter((staffCode): staffCode is string => staffCode !== null),
    );

    const teachers = TEACHERS.filter(
      (teacher) => !existingStaffCodes.has(teacher.staffCode ?? ""),
    ).map((teacher) => ({ ...teacher, schoolId: school.id }));

    if (teachers.length === 0) {
      console.log(`Teachers already seeded for "${school.name}".`);
      continue;
    }

    await prisma.teacher.createMany({ data: teachers });
    console.log(`Created ${teachers.length} teacher(s) for "${school.name}".`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedTeachers()
    .catch((error: unknown) => {
      console.error("Failed to seed teachers:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
