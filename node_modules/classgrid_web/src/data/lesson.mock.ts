import type { IPeriod } from "../interface/period.interface";
import type { IRoom, RoomType } from "../interface/room.interface";
import type { DayOfWeek } from "../interface/schedule.interface";
import type { LessonAssignment, PlacedEntry } from "../utils/slotCheck";

const SCHOOL_ID = "school-stjude";
const stamp = new Date(2026, 5, 1);

export const TIMETABLE_ID = "timetable-term1-v1";
export const CLASS_ARM = { id: "arm-jss1a", name: "JSS 1 A" };

export const ARM_LABELS: Record<string, string> = {
  "arm-jss1a": "JSS 1 A",
  "arm-jss2a": "JSS 2 A",
  "arm-jss2b": "JSS 2 B",
  "arm-jss3a": "JSS 3 A",
};

/* --------------------------------- periods --------------------------------- */

const period = (
  id: string,
  name: string,
  kind: string,
  sequence: number,
  startTime: string,
  endTime: string,
): IPeriod =>
  ({
    id,
    schoolId: SCHOOL_ID,
    periodScheduleScheduleId: "sched-standard",
    name,
    kind,
    sequence,
    startTime,
    endTime,
    isActive: true,
    createdAt: stamp,
    updatedAt: stamp,
  }) as IPeriod;

export const MOCK_LESSON_PERIODS: IPeriod[] = [
  period("p1", "Period 1", "LESSON", 1, "08:00", "08:40"),
  period("p2", "Period 2", "LESSON", 2, "08:40", "09:20"),
  period("p3", "Period 3", "LESSON", 3, "09:20", "10:00"),
  period("p4", "Period 4", "LESSON", 4, "10:00", "10:40"),
  period("brk", "Recess", "BREAK", 5, "10:40", "11:10"),
  period("p5", "Period 5", "LESSON", 6, "11:10", "11:50"),
  period("p6", "Period 6", "LESSON", 7, "11:50", "12:30"),
  period("p7", "Period 7", "LESSON", 8, "12:30", "13:10"),
  period("p8", "Period 8", "LESSON", 9, "13:10", "13:50"),
];

/* ---------------------------------- rooms ---------------------------------- */

const room = (
  id: string,
  name: string,
  type: RoomType,
  capacity: number | null,
): IRoom => ({
  id,
  schoolId: SCHOOL_ID,
  name,
  type,
  capacity,
  isActive: true,
  createdAt: stamp,
  updatedAt: stamp,
});

export const MOCK_LESSON_ROOMS: IRoom[] = [
  room("r-101", "Room 101", "CLASSROOM", 40),
  room("r-102", "Room 102", "CLASSROOM", 40),
  room("r-phy", "Physics Laboratory", "SCIENCE_LAB", 30),
  room("r-che", "Chemistry Laboratory", "SCIENCE_LAB", 30),
  room("r-ict", "ICT Laboratory", "COMPUTER_LAB", 35),
  room("r-hall", "Assembly Hall", "HALL", 400),
];

/* ------------------------------- assignments ------------------------------- */

const assignment = (
  id: string,
  subject: LessonAssignment["subject"],
  teacherId: string,
  teacher: LessonAssignment["teacher"],
  periodsPerWeek: number,
  maxPeriodsPerDay: number | null,
  requiresDoublePeriod: boolean,
  requiredRoomType: RoomType | null,
): LessonAssignment => ({
  id,
  subjectId: `subject-${id}`,
  teacherId,
  subject,
  teacher,
  periodsPerWeek,
  maxPeriodsPerDay,
  requiresDoublePeriod,
  requiredRoomType,
});

/** What JSS 1 A studies, and who teaches each subject. */
export const MOCK_LESSON_ASSIGNMENTS: LessonAssignment[] = [
  assignment("a-eng", { name: "English Language", code: "ENG" }, "t1",
    { title: "Mrs", firstName: "Amina", lastName: "Bello" }, 5, 2, false, null),
  assignment("a-mth", { name: "Mathematics", code: "MTH" }, "t3",
    { title: "Mr", firstName: "Tunde", lastName: "Adeyemi" }, 5, 2, false, null),
  assignment("a-bsc", { name: "Basic Science", code: "BSC" }, "t5",
    { title: "Dr", firstName: "Ibrahim", lastName: "Musa" }, 4, 2, true, "SCIENCE_LAB"),
  assignment("a-cmp", { name: "Computer Studies", code: "CMP" }, "t9",
    { title: "Engr", firstName: "Segun", lastName: "Balogun" }, 2, null, true, "COMPUTER_LAB"),
  assignment("a-civ", { name: "Civic Education", code: "CIV" }, "t2",
    { title: "Mr", firstName: "Chinedu", lastName: "Okafor" }, 2, 1, false, null),
  assignment("a-crs", { name: "Christian Religious Studies", code: "CRS" }, "t8",
    { title: "Mrs", firstName: "Halima", lastName: "Yusuf" }, 2, 1, false, null),
  assignment("a-btc", { name: "Basic Technology", code: "BTC" }, "t7",
    { title: "Mr", firstName: "Emeka", lastName: "Nwosu" }, 2, 2, true, null),
  assignment("a-agr", { name: "Agricultural Science", code: "AGR" }, "t6",
    { title: "Mrs", firstName: "Funke", lastName: "Ajayi" }, 2, 1, false, null),
];

/* --------------------------- lessons already placed ------------------------ */

const placed = (
  dayOfWeek: DayOfWeek,
  periodId: string,
  assignmentId: string,
  teacherId: string,
  classArmId: string,
  roomId: string | null = null,
): PlacedEntry => ({ dayOfWeek, periodId, assignmentId, teacherId, classArmId, roomId });

export const MOCK_PLACED_ENTRIES: PlacedEntry[] = [
  // JSS 1 A: Mathematics 3 of 5, English 5 of 5 (complete), Civic 1 of 2.
  placed("MONDAY", "p1", "a-mth", "t3", "arm-jss1a"),
  placed("MONDAY", "p2", "a-mth", "t3", "arm-jss1a"),
  placed("WEDNESDAY", "p1", "a-mth", "t3", "arm-jss1a"),
  placed("MONDAY", "p3", "a-eng", "t1", "arm-jss1a"),
  placed("TUESDAY", "p1", "a-eng", "t1", "arm-jss1a"),
  placed("WEDNESDAY", "p2", "a-eng", "t1", "arm-jss1a"),
  placed("THURSDAY", "p1", "a-eng", "t1", "arm-jss1a"),
  placed("FRIDAY", "p1", "a-eng", "t1", "arm-jss1a"),
  placed("TUESDAY", "p2", "a-civ", "t2", "arm-jss1a"),

  // Other classes, set up to cause clashes on Tuesday.
  // Mr Adeyemi (Maths) and Room 101 are busy in Tuesday P3.
  placed("TUESDAY", "p3", "b-mth", "t3", "arm-jss2b", "r-101"),
  // Dr Musa (Basic Science) and the Physics Laboratory are busy in Tuesday P3.
  placed("TUESDAY", "p3", "x-bsc", "t5", "arm-jss2a", "r-phy"),
  // Engr Balogun (Computer Studies) and the ICT Laboratory are busy in Tuesday P4.
  placed("TUESDAY", "p4", "y-cmp", "t9", "arm-jss3a", "r-ict"),
];