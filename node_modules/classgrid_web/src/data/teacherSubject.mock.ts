/** The few teacher fields this page needs. */
export interface TeacherRow {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
  staffCode: string;
  isActive: boolean;
}

/** One subject a teacher is qualified to teach. */
export interface TeacherSubjectLink {
  id: string;
  teacherId: string;
  subjectId: string;
}

const teacher = (
  id: string,
  title: string | null,
  firstName: string,
  lastName: string,
  staffCode: string,
  isActive = true,
): TeacherRow => ({ id, title, firstName, lastName, staffCode, isActive });

export const MOCK_TEACHERS: TeacherRow[] = [
  teacher("t1", "Mrs", "Amina", "Bello", "TCH-001"),
  teacher("t2", "Mr", "Chinedu", "Okafor", "TCH-002"),
  teacher("t3", "Mr", "Tunde", "Adeyemi", "TCH-003"),
  teacher("t4", "Miss", "Ngozi", "Eze", "TCH-004"),
  teacher("t5", "Dr", "Ibrahim", "Musa", "TCH-005"),
  teacher("t6", "Mrs", "Funke", "Ajayi", "TCH-006"),
  teacher("t7", "Mr", "Emeka", "Nwosu", "TCH-007"),
  teacher("t8", "Mrs", "Halima", "Yusuf", "TCH-008"),
  teacher("t9", "Engr", "Segun", "Balogun", "TCH-009"),
  // No subjects yet, to show that state.
  teacher("t10", null, "Blessing", "Udoh", "TCH-010"),
  teacher("t11", "Mr", "Kelechi", "Obi", "TCH-011"),
  // Switched off, to show that state.
  teacher("t12", "Mrs", "Grace", "Williams", "TCH-012", false),
];

// Subject ids come from assignment.mock.ts.
const SUBJECTS_BY_TEACHER: Record<string, string[]> = {
  t1: ["sub-eng", "sub-lit"],
  t2: ["sub-eng", "sub-civ", "sub-gov"],
  t3: ["sub-mth", "sub-fmt"],
  t4: ["sub-mth", "sub-bus", "sub-acc", "sub-eco"],
  t5: ["sub-phy", "sub-bsc"],
  t6: ["sub-bio", "sub-bsc", "sub-agr"],
  t7: ["sub-che", "sub-btc"],
  t8: ["sub-crs", "sub-civ"],
  t9: ["sub-cmp", "sub-btc"],
  t10: [],
  t11: ["sub-geo", "sub-gov"],
  t12: ["sub-fre", "sub-hec"],
};

export const MOCK_TEACHER_SUBJECTS: TeacherSubjectLink[] = Object.entries(
  SUBJECTS_BY_TEACHER,
).flatMap(([teacherId, subjectIds]) =>
  subjectIds.map((subjectId) => ({
    id: `ts-${teacherId}-${subjectId}`,
    teacherId,
    subjectId,
  })),
);
