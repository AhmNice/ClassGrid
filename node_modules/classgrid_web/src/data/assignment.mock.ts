import type { ClassStage, IClassLevel } from "../interface/class.interface";
import type { ISubject } from "../interface/subject.interface";
import type { IClassLevelSubject } from "../interface/subject.assignment.interface";

const SCHOOL_ID = "school-stjude";
const stamp = new Date(2026, 5, 1);

/* ------------------------------- class levels ------------------------------ */

const level = (
  id: string,
  name: string,
  rank: number,
  stage: ClassStage,
): IClassLevel => ({
  id,
  schoolId: SCHOOL_ID,
  name,
  rank,
  stage,
  isActive: true,
  createdAt: stamp,
  updatedAt: stamp,
});

export const MOCK_CLASS_LEVELS: IClassLevel[] = [
  level("lvl-jss1", "JSS 1", 1, "JSS"),
  level("lvl-jss2", "JSS 2", 2, "JSS"),
  level("lvl-jss3", "JSS 3", 3, "JSS"),
  level("lvl-ss1", "SS 1", 1, "SS"),
  level("lvl-ss2", "SS 2", 2, "SS"),
  level("lvl-ss3", "SS 3", 3, "SS"),
];

/* --------------------------------- subjects -------------------------------- */

const subject = (
  id: string,
  name: string,
  code: string,
  classStage: ClassStage[],
): ISubject => ({
  id,
  schoolId: SCHOOL_ID,
  name,
  code,
  isActive: true,
  createdAt: stamp,
  updatedAt: stamp,
  classStage,
  Track:["ART"],
  defaultPeriodsPerWeek: 4,
  defaultMaxPeriodsPerDay: 2,
  defaultMaxConsecutive: 2,
  defaultAllowConsecutive: true,
});

const BOTH: ClassStage[] = ["JSS", "SS"];
const JSS: ClassStage[] = ["JSS"];
const SS: ClassStage[] = ["SS"];

export const MOCK_SUBJECTS: ISubject[] = [
  subject("sub-eng", "English Language", "ENG", BOTH),
  subject("sub-mth", "Mathematics", "MTH", BOTH),
  subject("sub-civ", "Civic Education", "CIV", BOTH),
  subject("sub-cmp", "Computer Studies", "CMP", BOTH),
  subject("sub-agr", "Agricultural Science", "AGR", BOTH),
  subject("sub-crs", "Christian Religious Studies", "CRS", BOTH),
  subject("sub-fre", "French", "FRE", BOTH),
  subject("sub-bsc", "Basic Science", "BSC", JSS),
  subject("sub-btc", "Basic Technology", "BTC", JSS),
  subject("sub-bus", "Business Studies", "BUS", JSS),
  subject("sub-hec", "Home Economics", "HEC", JSS),
  subject("sub-phy", "Physics", "PHY", SS),
  subject("sub-che", "Chemistry", "CHE", SS),
  subject("sub-bio", "Biology", "BIO", SS),
  subject("sub-fmt", "Further Mathematics", "FMT", SS),
  subject("sub-eco", "Economics", "ECO", SS),
  subject("sub-gov", "Government", "GOV", SS),
  subject("sub-lit", "Literature in English", "LIT", SS),
  subject("sub-geo", "Geography", "GEO", SS),
  subject("sub-acc", "Financial Accounting", "ACC", SS),
];

/* ------------------------------- assignments ------------------------------- */

// Subjects left out on purpose, so the grid shows some empty cells.
const NOT_OFFERED: Record<string, string[]> = {
  "lvl-jss1": ["sub-fre", "sub-agr"],
  "lvl-jss2": ["sub-fre"],
  "lvl-jss3": [],
  "lvl-ss1": ["sub-fmt", "sub-acc", "sub-geo"],
  "lvl-ss2": ["sub-geo"],
  "lvl-ss3": [],
};

/** Every eligible subject, minus the ones listed above. */
export const MOCK_ASSIGNMENTS: IClassLevelSubject[] = MOCK_CLASS_LEVELS.flatMap(
  (classLevel) =>
    MOCK_SUBJECTS.filter(
      (s) =>
        s.classStage.includes(classLevel.stage) &&
        !NOT_OFFERED[classLevel.id].includes(s.id),
    ).map((s) => ({
      id: `assign-${classLevel.id}-${s.id}`,
      schoolId: SCHOOL_ID,
      classLevelId: classLevel.id,
      subjectId: s.id,
    })),
);
