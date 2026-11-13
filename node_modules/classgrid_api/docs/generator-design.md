# Timetable Generator Design

**Status:** Design baseline for Phase 4, Day 17  
**Scope:** CLASSGRID-4.1 through CLASSGRID-4.6  
**Output:** A valid timetable draft, or an actionable explanation of why no valid draft exists.

## 1. Design goals and boundaries

The generator creates a `DRAFT` timetable for one term. It must satisfy every hard
constraint before returning success. Soft constraints influence candidate ordering
and the final score; they must never make an otherwise valid schedule fail.

Generation is deterministic for the same normalized input and seed. The seed is
recorded with the generation attempt so a result can be reproduced while still
allowing a later retry with a different seed. Existing locked entries are treated
as fixed assignments and are not moved.

The generator does not publish a timetable, mutate master data, or silently omit
an assignment. A generated draft is subsequently checked by the existing timetable
validation service before it can enter the publish workflow.

## 2. Generator input model (CLASSGRID-4.1)

The input is a complete, school-scoped snapshot. The service should load and
normalize the following before search begins:

```ts
type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
interface GeneratorInput {
  schoolId: string;
  term: { id: string; sessionId: string; name: "FIRST" | "SECOND" | "THIRD" };
  days: Array<DayOfWeek>;
  periods: Array<{
    id: string;
    sequence: number;
    kind: "LESSON" | "BREAK";
    applicableDays: DayOfWeek[];
    periodScheduleId: string;
  }>;
  periodSchedules: Array<{
    id: string;
    name: "WEEKDAY_SCHEDULE" | "FRIDAY_SCHEDULE";
    applicableDays: DayOfWeek[];
    periodIds: string[];
  }>;
  assignments: Array<{
    id: string;
    teacherId: string;
    subjectId: string;
    classArmId: string;
    periodsPerWeek: number;
    maxPeriodsPerDay?: number | null;
    requiresDoublePeriod: boolean;
    requiredRoomType?: string | null;
  }>;
  teachers: Array<{
    id: string;
    maxPeriodsPerDay?: number | null;
    maxPeriodsPerWeek?: number | null;
    maxConsecutivePeriods?: number | null;
  }>;
  rooms: Array<{ id: string; type: string; capacity?: number | null }>;
  teacherAvailability: Array<{
    teacherId: string;
    dayOfWeek: string;
    periodId: string;
    status: "UNAVAILABLE" | "PREFERRED";
  }>;
  lockedEntries: Array<{
    id: string;
    assignmentId: string;
    teacherId: string;
    classArmId: string;
    dayOfWeek: string;
    periodId: string;
    roomId?: string | null;
  }>;
  preferences?: {
    avoidGaps?: boolean;
    spreadSubjectAcrossDays?: boolean;
    maximizePreferredAvailability?: boolean;
  };
  options?: { seed: number; maxSearchNodes: number };
}
```

`periodSchedules` must contain an active schedule covering every requested day;
in particular, a Friday request requires one `FRIDAY_SCHEDULE`. A period's
`periodScheduleId` must match the schedule that lists it. `assignments` is the complete workload for the term: every assignment must
produce exactly `periodsPerWeek` entries. `periods` excludes `BREAK` periods from
candidate slots. A missing availability row means available; `PREFERRED` is not
an exclusion. The loader must reject cross-school, inactive, missing-reference,
negative-count, duplicate, or otherwise malformed input before search.

The model maps directly to `TeachingAssignment`, `Teacher`, `Room`, `Period`,
`TeacherAvailability`, and `TimetableEntry`. Class-arm availability and room
availability are not currently first-class tables; until they are added, their
availability is represented by occupied slots and the active resource lists.

## 3. Hard constraints (CLASSGRID-4.2)

Every candidate placement must satisfy all of the following:

1. **Complete workload:** each active assignment has exactly its required weekly
   count; no assignment is duplicated beyond that count.
2. **Valid slot:** the period is active, has `kind = LESSON`, belongs to the
   school schedule, and is applicable to the selected day.
3. **Class-arm clash:** one class arm has at most one entry per day and period.
4. **Teacher clash:** one teacher has at most one entry per day and period.
5. **Room clash:** a room has at most one entry per day and period.
6. **Teacher availability:** a slot marked `UNAVAILABLE` cannot be used.
7. **Room requirement:** `requiredRoomType`, when set, matches the selected room.
8. **Workload limits:** teacher weekly and daily maxima are not exceeded.
9. **Assignment daily limit:** an assignment’s `maxPeriodsPerDay`, when set, is
   not exceeded.
10. **Consecutive limits:** a teacher’s `maxConsecutivePeriods` is not exceeded.
    Subject consecutive settings are enforced when supplied by the assignment or
    subject configuration.
11. **Double periods:** `requiresDoublePeriod` uses two adjacent lesson periods on
    the same day, reserves both slots atomically, and cannot cross a break.
12. **Locked entries:** locked entries remain unchanged and themselves must pass
    all conflict checks.
13. **Resource validity:** every teacher, class arm, room, subject, assignment,
    day, and period reference is valid and belongs to the same school/term.

These rules intentionally mirror the existing database uniqueness constraints and
the `TimetableValidationService` checks. A database constraint violation is a
defect in generation or input normalization, not an acceptable partial result.

## 4. Soft constraints and scoring (CLASSGRID-4.3)

Soft constraints are scored only after hard constraints have passed. The initial
weights are configurable and are applied consistently to every candidate:

| Preference                       | Default weight | Scoring rule                                                |
| -------------------------------- | -------------: | ----------------------------------------------------------- |
| Teacher `PREFERRED` availability |             10 | Add points for each preferred slot used                     |
| Spread an assignment across days |              5 | Add points when another occurrence is on a different day    |
| Avoid class gaps                 |              3 | Add points when a class’s occupied periods are contiguous   |
| Avoid teacher gaps               |              2 | Add points when a teacher’s occupied periods are contiguous |
| Balance daily teacher load       |              2 | Add points for a lower daily-load variance                  |

Weights do not override hard constraints and ties are resolved by stable
`dayOfWeek`, period sequence, room id, then assignment id ordering. If a preference
is absent, its weight is zero. The result reports the score and per-preference
breakdown for review.

## 5. Scheduling strategy (CLASSGRID-4.4)

The first implementation uses a **Constraint Satisfaction Problem (CSP) approach** with recursive backtracking, Minimum Remaining Values (MRV), and Forward Checking.

The generator treats each lesson unit as a variable, its valid day/period/room combinations as candidate values, and the hard constraints as rules that every assignment must satisfy.

### Scheduling process

1. **Normalize and validate input:** Validate all scheduling requirements, resolve day-specific period schedules, and place existing locked entries into the occupancy maps. Reject invalid or conflicting locked entries before search begins.

2. **Expand assignments into lesson units:** Expand each teaching assignment into the required number of weekly lesson units. Double-period units remain linked and must be placed atomically.

3. **Generate candidate domains:** For every unplaced lesson unit, calculate all valid day/period/room combinations using the applicable period schedule for each day. Exclude BREAK periods, unavailable teacher slots, occupied class-arm slots, occupied teacher slots, and occupied room slots.

4. **Select the next variable using MRV:** Select the unplaced lesson unit with the fewest remaining valid candidates. Break ties by selecting the unit involving the most constrained resources, then use stable assignment identifiers for deterministic ordering.

5. **Order candidate values:** Rank candidate placements by descending soft-constraint score, followed by stable day, period sequence, room ID, and assignment ID ordering. Soft constraints influence candidate preference only and must never override hard constraints.

6. **Apply a candidate and perform Forward Checking:** Tentatively place the selected lesson unit, update occupancy maps and workload counters, and recalculate the available candidates for affected unplaced units. If any remaining unit has no valid candidate, reject the placement immediately and backtrack.

7. **Backtrack when necessary:** If a candidate leads to an invalid or unsolvable remaining state, undo the placement, restore occupancy and workload counters, and try the next candidate. Continue recursively until a complete valid timetable is found or the search budget is exhausted.

8. **Complete or terminate search:** Return success only when every required lesson unit has been placed without violating hard constraints. Stop with a bounded failure when `maxSearchNodes` is reached. Never return a partial timetable as successful.

### Timetable quality evaluation

After finding a valid timetable, evaluate its quality using configurable soft-constraint weights, including teacher preferred availability, subject distribution across days, class and teacher gaps, and daily teacher workload balance.

The initial implementation prioritizes finding a valid timetable. Quality optimization must operate within a configurable search budget and must never compromise hard constraints. The generator must report the final score and its per-preference breakdown.

### Search diagnostics

The engine should expose:

- Explored search node count.
- Elapsed search time.
- Generation seed.
- Deepest conflict explanation.
- Search termination reason.
- Final soft-constraint score and breakdown.

The same normalized input and seed must produce deterministic search behavior and reproducible results.

Future implementations may replace the search strategy with a more advanced solver, such as Google OR-Tools CP-SAT or an Integer Linear Programming (ILP) solver, without changing the established input, constraint, fixture, or failure contracts.

## 6. Failure scenarios and diagnostics (CLASSGRID-4.5)

Failure is a structured result, not a generic error:

```ts
interface GenerationFailure {
  code:
    | "INVALID_INPUT"
    | "NO_CANDIDATE_SLOT"
    | "CAPACITY_EXCEEDED"
    | "LOCKED_ENTRY_CONFLICT"
    | "SEARCH_LIMIT_REACHED";
  message: string;
  assignmentId?: string;
  conflictingResourceIds?: string[];
  blockedSlots?: Array<{ dayOfWeek: string; periodId: string; reason: string }>;
  diagnostics: { exploredNodes: number; seed: number };
}
```

| Scenario                           | Required explanation                                               |
| ---------------------------------- | ------------------------------------------------------------------ |
| Invalid or incomplete input        | Field/reference errors before search, including the offending ids  |
| Assignment has no legal slot       | Assignment id, all blocked slots, and each blocking rule/resource  |
| Aggregate capacity is insufficient | Required units versus available class/teacher/room capacity        |
| Locked entries conflict            | Locked entry ids and the class, teacher, or room collision         |
| Search limit reached               | Search limit, explored nodes, seed, and the most constrained units |

Diagnostics must be safe to display to an administrator and must not hide an
unscheduled assignment. A retry may use a different seed or a larger search limit,
but changing a hard rule requires an explicit configuration change.

## 7. Fixture contract (CLASSGRID-4.6)

Fixtures are JSON snapshots consumed by generator unit tests. They use stable
human-readable ids, no UUIDs or current timestamps, and include the expected
result. Tests should assert both the outcome and the important reason/constraint,
not a particular incidental search path.

| Fixture                                | Expected result                     | Purpose                                           |
| -------------------------------------- | ----------------------------------- | ------------------------------------------------- |
| `valid-basic.json`                     | `SUCCESS`                           | Places all lessons without conflicts              |
| `preferred-slots.json`                 | `SUCCESS` with preferred-slot score | Proves soft constraints affect ranking only       |
| `impossible-teacher-availability.json` | `FAILURE/NO_CANDIDATE_SLOT`         | Proves `UNAVAILABLE` is hard                      |
| `locked-entry-conflict.json`           | `FAILURE/LOCKED_ENTRY_CONFLICT`     | Proves locked entries are validated before search |
| `capacity-exceeded.json`               | `FAILURE/CAPACITY_EXCEEDED`         | Proves aggregate capacity is diagnosed            |
| `friday-short-schedule.json` | `SUCCESS` | Supports a shorter Friday schedule |
| `friday-break-exclusion.json` | `SUCCESS` with no break entry | Excludes Friday breaks from candidates |
| `friday-double-period.json` | `SUCCESS` with a double period | Requires adjacent Friday lesson periods |
| `missing-friday-schedule.json` | `FAILURE/INVALID_INPUT` | Rejects Friday without a Friday schedule |
| `friday-period-compatibility.json` | `SUCCESS` using Friday periods only | Prevents weekday-only periods on Friday |

The initial snapshots are in `docs/fixtures/generator/`. They are deliberately
small enough to make failures understandable and deterministic.

## 8. Result contract and follow-on implementation

On success the generator returns a draft-ready list of entries, score details,
seed, explored node count, and a normalized input fingerprint. On failure it
returns no entries and one or more structured `GenerationFailure` records.
CLASSGRID-4.7 through CLASSGRID-4.12 should implement these contracts first;
CLASSGRID-4.13 through CLASSGRID-4.19 should add the remaining rule evaluators
without changing the public failure shape.
