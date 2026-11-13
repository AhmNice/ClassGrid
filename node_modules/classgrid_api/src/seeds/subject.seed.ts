import { ClassStage, type Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import { fileURLToPath } from "node:url";

const SUBJECTS: Omit<Prisma.SubjectCreateManyInput, "schoolId">[] = [
  {
    name: "Mathematics",
    code: "MTH",
    classStage: [ClassStage.JSS, ClassStage.SS],
    defaultPeriodsPerWeek: 5,
    defaultMaxPeriodsPerDay: 2,
    defaultMaxConsecutive: 2,
  },
  {
    name: "English Language",
    code: "ENG",
    classStage: [ClassStage.JSS, ClassStage.SS],
    defaultPeriodsPerWeek: 5,
    defaultMaxPeriodsPerDay: 2,
    defaultMaxConsecutive: 2,
  },
  {
    name: "Basic Science",
    code: "BSC",
    classStage: [ClassStage.JSS],
    defaultPeriodsPerWeek: 3,
    defaultMaxPeriodsPerDay: 1,
    defaultMaxConsecutive: 1,
  },
  {
    name: "Basic Technology",
    code: "BTE",
    classStage: [ClassStage.JSS],
    defaultPeriodsPerWeek: 3,
    defaultMaxPeriodsPerDay: 1,
    defaultMaxConsecutive: 1,
  },
  {
    name: "Physics",
    code: "PHY",
    classStage: [ClassStage.SS],
    defaultPeriodsPerWeek: 4,
    defaultMaxPeriodsPerDay: 2,
    defaultMaxConsecutive: 2,
  },
  {
    name: "Chemistry",
    code: "CHE",
    classStage: [ClassStage.SS],
    defaultPeriodsPerWeek: 4,
    defaultMaxPeriodsPerDay: 2,
    defaultMaxConsecutive: 2,
  },
  {
    name: "Biology",
    code: "BIO",
    classStage: [ClassStage.SS],
    defaultPeriodsPerWeek: 4,
    defaultMaxPeriodsPerDay: 2,
    defaultMaxConsecutive: 2,
  },
  {
    name: "Computer Studies",
    code: "CST",
    classStage: [ClassStage.JSS, ClassStage.SS],
    defaultPeriodsPerWeek: 2,
    defaultMaxPeriodsPerDay: 1,
    defaultMaxConsecutive: 1,
  },
  {
    name: "Social Studies",
    code: "SOS",
    classStage: [ClassStage.JSS],
    defaultPeriodsPerWeek: 3,
    defaultMaxPeriodsPerDay: 1,
    defaultMaxConsecutive: 1,
  },
  {
    name: "Civic Education",
    code: "CVE",
    classStage: [ClassStage.JSS, ClassStage.SS],
    defaultPeriodsPerWeek: 2,
    defaultMaxPeriodsPerDay: 1,
    defaultMaxConsecutive: 1,
  },
];

export async function seedSubjects(): Promise<void> {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true },
  });

  if (schools.length === 0) {
    console.log("No schools found. Create a school before seeding subjects.");
    return;
  }

  for (const school of schools) {
    const existing = await prisma.subject.findMany({
      where: { schoolId: school.id },
      select: { code: true, name: true },
    });
    const existingKeys = new Set(
      existing.flatMap((subject) =>
        [subject.name, subject.code].filter(Boolean),
      ),
    );

    const subjects = SUBJECTS.filter(
      (subject) =>
        !existingKeys.has(subject.name) &&
        !existingKeys.has(subject.code ?? ""),
    ).map((subject) => ({ ...subject, schoolId: school.id }));

    if (subjects.length === 0) {
      console.log(`Subjects already seeded for "${school.name}".`);
      continue;
    }

    await prisma.subject.createMany({ data: subjects });
    console.log(`Created ${subjects.length} subject(s) for "${school.name}".`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedSubjects()
    .catch((error: unknown) => {
      console.error("Failed to seed subjects:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
