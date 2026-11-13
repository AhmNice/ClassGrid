type Lesson = {
  name: string;
  teacher: string;
  classArm: string;
};

type LessonOptions = {
  lesson: Lesson;
  periods: string[];
};
const mathematics: Lesson = {
  name: "Mathematics",
  teacher: "Mr A",
  classArm: "JSS1A",
};

const english: Lesson = {
  name: "English",
  teacher: "Mr A",
  classArm: "JSS1A",
};

const computerStudies: Lesson = {
  name: "Computer Studies",
  teacher: "Mr B",
  classArm: "JSS1B",
};
const domains: LessonOptions[] = [
  {
    lesson: mathematics,
    periods: ["P1", "P2"],
  },
  {
    lesson: english,
    periods: ["P1", "P2", "P3"],
  },
  {
    lesson: computerStudies,
    periods: ["P1", "P3"],
  },
];
function hasTeacherConflict(
  placedLesson: Lesson,
  placedPeriod: string,
  otherLesson: Lesson,
  otherPeriod: string,
): boolean {
  console.log(
    `Checking conflict between ${placedLesson.name} (${placedPeriod}) and ${otherLesson.name} (${otherPeriod})`,
  );
  console.log(
    placedLesson.teacher === otherLesson.teacher &&
      placedPeriod === otherPeriod,
  );
  return (
    placedLesson.teacher === otherLesson.teacher && placedPeriod === otherPeriod
  );
}
// Expected: true
// hasTeacherConflict(mathematics, "P1", english, "P1");

// Expected: false
// hasTeacherConflict(mathematics, "P1", english, "P2");

// Expected: false
// hasTeacherConflict(mathematics, "P1", computerStudies, "P1");

// hasTeacherConflict(mathematics, "P1", computerStudies, "P1");
const remainingDomains: LessonOptions[] = [
  {
    lesson: english,
    periods: ["P1", "P2", "P3"],
  },
  {
    lesson: computerStudies,
    periods: ["P1", "P3"],
  },
];
function hasClassArmConflict(
  placedLesson: Lesson,
  placedPeriod: string,
  otherLesson: Lesson,
  otherPeriod: string,
): boolean {
  console.log(
    `Checking conflict between ${placedLesson.name} (${placedPeriod}) and ${otherLesson.name} (${otherPeriod})`,
  );
  console.log(
    placedLesson.classArm === otherLesson.classArm &&
      placedPeriod === otherPeriod,
  );
  return (
    placedLesson.classArm === otherLesson.classArm &&
    placedPeriod === otherPeriod
  );
}
function hasConflict(
  placedLesson: Lesson,
  placedPeriod: string,
  otherLesson: Lesson,
  otherPeriod: string,
): boolean {
  return (
    hasTeacherConflict(placedLesson, placedPeriod, otherLesson, otherPeriod) ||
    hasClassArmConflict(placedLesson, placedPeriod, otherLesson, otherPeriod)
  );
}
const englishDomain = domains[1];

const updatedPeriods = englishDomain.periods.filter((period) => {
  return !hasConflict(mathematics, "P1", englishDomain.lesson, period);
});

console.log("Updated periods after filtering:", updatedPeriods);
// hasClassArmConflict(mathematics, "P1", english, "P1"); // Expected: true

function forwardCheck(
  domains: LessonOptions[],
  placedLesson: Lesson,
  placedPeriod: string,
): LessonOptions[] | null {
  const updatedDomain = domains.map((domain) => {
    const updatedPeriods = domain.periods.filter((period) => {
      return !hasConflict(placedLesson, placedPeriod, domain.lesson, period);
    });

    return {
      lesson: domain.lesson,
      periods: updatedPeriods,
    };
  });
  if (updatedDomain.some((domain) => domain.periods.length === 0)) {
    console.log("Forward checking failed: A domain has no valid periods left.");
    return null;
  }
  return updatedDomain;
}

const updatedDomains = forwardCheck(remainingDomains, mathematics, "P1");
console.log("Updated domains after forward checking:", updatedDomains);

function selectNextLesson(domains: LessonOptions[]): LessonOptions | null {
  const isEmpty = domains.some((domain) => domain.periods.length === 0);
  if (isEmpty) {
    console.log(
      "Cannot select next lesson: A domain has no valid periods left.",
    );
    return null;
  }
  const minDomain = domains.reduce((min, domain) => {
    return domain.periods.length < min.periods.length ? domain : min;
  }, domains[0]);
  console.log("Selected next lesson:", minDomain.lesson.name);
  return minDomain;
}
function schedule(
  domains: LessonOptions[],
  timetable: ScheduledLesson[],
): boolean {
  // Base case goes here
  if (domains.length === 0) {
    return true;
  }
  const selected = selectNextLesson(domains);
  if (!selected) {
    return false;
  }
  const { lesson, periods } = selected;
  const remainingDomains = domains.filter(
    (domain) => domain.lesson.name !== lesson.name,
  );
  for (const period of periods) {
    const updatedDomains = forwardCheck(remainingDomains, lesson, period);
    if (updatedDomains) {
      timetable.push({ lesson, period });
      if (schedule(updatedDomains, timetable)) {
        return true;
      }
      timetable.pop();
    }
  }
  return false;
}
