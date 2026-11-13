import { ArrowLeft, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import type { ClassStage } from "../interface/class.interface";
import MainLayout from "../layout/MainLayout";
import { useSubjectStore } from "../store/subject.store";
import { useTeacherStore } from "../store/teacher.store";
import type { ITeacher } from "../interface/teacher.interface";
import { useTeacherSubjectStore } from "../store/teacher-subject.store";

/* --------------------------------- helpers -------------------------------- */

const pairKey = (teacherId: string, subjectId: string) =>
  `${teacherId}|${subjectId}`;

const teacherName = (t: ITeacher) =>
  [t.title, t.firstName, t.lastName].filter(Boolean).join(" ");

const initials = (t: ITeacher) =>
  `${t.firstName.charAt(0)}${t.lastName.charAt(0)}`.toUpperCase();

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

const BUTTON =
  "inline-flex cursor-pointer items-center justify-center rounded-sm px-space-lg py-space-sm text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const CHIP =
  "cursor-pointer whitespace-nowrap rounded-sm px-space-md py-space-xs font-mono text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const SEARCH_INPUT =
  "w-full rounded-sm border border-(--input-border) bg-(--input-bg) py-space-sm pl-9 pr-space-md text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type TeacherFilter = "ALL" | "NONE";
type StageFilter = ClassStage | "ALL";

/* ---------------------------------- page ---------------------------------- */

const AssignTeacherSubjects = () => {
  const teacherSearchId = useId();
  const subjectSearchId = useId();

  /* ------------------------------ store reads ------------------------------ */
  const subjects = useSubjectStore((s) => s.subjects);
  const fetchedTeachers = useTeacherStore((s) => s.teachers);
  const getSubjects = useSubjectStore((s) => s.getSubjects);
  const getTeachers = useTeacherStore((s) => s.getTeachers);
  const getTeacherSubjects = useTeacherSubjectStore(
    (s) => s.getTeacherSubjects,
  );
  const updateTeacherSubject = useTeacherSubjectStore(
    (s) => s.updateTeacherSubject,
  );

  /* ------------------------------ local state ------------------------------ */
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [assigned, setAssigned] = useState<Set<string>>(() => new Set());
  const [countsByTeacher, setCountsByTeacher] = useState<
    Record<string, number>
  >({});
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedId, setSelectedId] = useState<string>("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>("ALL");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("ALL");

  /* --------------------------- mount: load data ---------------------------- */
  useEffect(() => {
    if (fetchedTeachers.length === 0) getTeachers();
    if (subjects.length === 0) getSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------- sorted lists (memo) -------------------------- */
  const teachers = useMemo(
    () =>
      [...fetchedTeachers].sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
        ),
      ),
    [fetchedTeachers],
  );

  const allSubjects = useMemo(
    () =>
      subjects
        .filter((s) => s.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [subjects],
  );

  /* ----------------------- default selection on load ----------------------- */
  useEffect(() => {
    if (teachers.length === 0) return;
    if (selectedId && teachers.some((t) => t.id === selectedId)) return;
    queueMicrotask(() => setSelectedId(teachers[0].id));
  }, [teachers, selectedId]);

  /* ------------------- fetch selected teacher's subjects ------------------- */
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    (async () => {
      setIsFetching(true);
      const res = await getTeacherSubjects({ teacherId: selectedId });
      if (cancelled) return;

      setIsFetching(false);
      if (!res.success || !res.data) return;

      const pairs = new Set(
        res.data.map((item) => pairKey(selectedId, item.subjectId)),
      );

      setSaved(pairs);
      setAssigned(new Set(pairs));
      setCountsByTeacher((prev) => ({ ...prev, [selectedId]: pairs.size }));
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, getTeacherSubjects]);

  /* --------------------------------- counts -------------------------------- */
  const withoutSubjects = useMemo(
    () => teachers.filter((t) => countsByTeacher[t.id] === 0).length,
    [teachers, countsByTeacher],
  );

  const addedKeys = [...assigned].filter((k) => !saved.has(k));
  const removedKeys = [...saved].filter((k) => !assigned.has(k));
  const pending = addedKeys.length + removedKeys.length;
  const hasPendingForSelected = pending > 0;

  /* ------------------------------ teacher list ----------------------------- */
  const visibleTeachers = useMemo(() => {
    const q = teacherQuery.trim().toLowerCase();
    return teachers.filter((t) => {
      if (teacherFilter === "NONE" && countsByTeacher[t.id]) return false;
      if (!q) return true;
      return `${teacherName(t)} ${t.staffCode}`.toLowerCase().includes(q);
    });
  }, [teachers, teacherQuery, teacherFilter, countsByTeacher]);

  /* ----------------------------- subject picker ---------------------------- */
  const selected = teachers.find((t) => t.id === selectedId) ?? null;

  const visibleSubjects = useMemo(() => {
    const q = subjectQuery.trim().toLowerCase();
    return allSubjects.filter((s) => {
      if (stageFilter !== "ALL" && !s.classStage.includes(stageFilter)) {
        return false;
      }
      if (!q) return true;
      return `${s.name} ${s.code ?? ""}`.toLowerCase().includes(q);
    });
  }, [allSubjects, subjectQuery, stageFilter]);

  const selectedSubjects = useMemo(
    () =>
      selected
        ? allSubjects.filter((s) => assigned.has(pairKey(selected.id, s.id)))
        : [],
    [selected, allSubjects, assigned],
  );

  const allShownTicked =
    selected !== null &&
    visibleSubjects.length > 0 &&
    visibleSubjects.every((s) => assigned.has(pairKey(selected.id, s.id)));

  /* -------------------------------- changing ------------------------------- */
  const toggle = (teacherId: string, subjectId: string) => {
    const key = pairKey(teacherId, subjectId);
    setAssigned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const setShown = (on: boolean) => {
    if (!selected) return;
    setAssigned((prev) => {
      const next = new Set(prev);
      visibleSubjects.forEach((s) => {
        const key = pairKey(selected.id, s.id);
        if (on) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  };

  const save = async () => {
    if (!selected) return;
    setIsSaving(true);

    const added = addedKeys;
    const removed = removedKeys;
    console.log("Added", added);
    console.log("removed", removed);

    const parse = (key: string) => {
      const [teacherId, subjectId] = key.split("|");
      return { teacherId, subjectId };
    };
    const toAdd = [...assigned].filter((k) => !saved.has(k)).map(parse);
    const toRemove = [...saved].filter((k) => !assigned.has(k)).map(parse);

    try {
      const result = await updateTeacherSubject({
        additions: toAdd as typeof toAdd & {
          teacherId: string;
          subjectId: string;
        },
        removals: toRemove as typeof toRemove & {
          teacherId: string;
          subjectId: string;
        },
      });
      if (!result.success) {
        throw new Error(result.message);
      }
      setSaved(new Set(assigned));
      setCountsByTeacher((prev) => ({
        ...prev,
        [selected.id]: assigned.size,
      }));
    } finally {
      setIsSaving(false);
    }
    toast.success(
      `${plural(added.length, "addition")} · ${plural(removed.length, "removal")} saved`,
    );
  };

  const discard = () => setAssigned(new Set(saved));

  /* --------------------------------- render -------------------------------- */
  const noTeachers = teachers.length === 0;
  const noSubjects = allSubjects.length === 0;

  return (
    <MainLayout>
      <section className="flex flex-col gap-space-md">
        <div className="space-y-space-sm">
          <Link
            to="/assignments"
            className="inline-flex items-center gap-space-xs rounded-sm text-sm text-on-surface-variant transition-colors hover:text-on-surface motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to assignments
          </Link>

          <header className="rounded-sm bg-primary-container p-space-lg">
            <h1 className="font-heading text-2xl font-bold text-on-primary-container">
              Assign Subjects to Teachers
            </h1>
            <p className="mt-space-xs max-w-2xl text-sm leading-relaxed text-on-primary-container">
              Choose the subjects each teacher is qualified to teach. These
              teachers then show up as eligible when you assign teachers to
              classes.
            </p>
          </header>
        </div>

        {noTeachers || noSubjects ? (
          <p
            role="status"
            className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant"
          >
            {noTeachers && noSubjects
              ? "No teachers or subjects exist yet. Add both before assigning."
              : noTeachers
                ? "No teachers exist yet. Add a teacher first."
                : "No active subjects exist yet. Add a subject first."}
          </p>
        ) : (
          <>
            <div className="grid gap-space-md lg:grid-cols-[22rem_minmax(0,1fr)]">
              {/* --------------------------- Teachers --------------------------- */}
              <section
                aria-label="Teachers"
                className="flex flex-col self-start overflow-hidden rounded-sm border border-outline-variant/40 bg-surface"
              >
                <div className="space-y-space-sm border-b border-outline-variant/40 bg-surface-container p-space-md">
                  <div className="relative">
                    <label htmlFor={teacherSearchId} className="sr-only">
                      Search teachers
                    </label>
                    <Search
                      size={16}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant"
                    />
                    <input
                      id={teacherSearchId}
                      type="search"
                      value={teacherQuery}
                      onChange={(e) => setTeacherQuery(e.target.value)}
                      placeholder="Search name or staff code…"
                      autoComplete="off"
                      className={SEARCH_INPUT}
                    />
                  </div>

                  <div
                    role="group"
                    aria-label="Filter teachers"
                    className="flex gap-space-sm"
                  >
                    {(
                      [
                        ["ALL", `All (${teachers.length})`],
                        ["NONE", `No subjects (${withoutSubjects})`],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={teacherFilter === value}
                        onClick={() => setTeacherFilter(value)}
                        className={[
                          CHIP,
                          teacherFilter === value
                            ? "bg-primary text-on-primary"
                            : "bg-surface text-on-surface hover:bg-surface-container-high",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleTeachers.length > 0 ? (
                  <ul className="max-h-[32rem] divide-y divide-outline-variant/40 overflow-y-auto">
                    {visibleTeachers.map((t) => {
                      const count = countsByTeacher[t.id];
                      const isSelected = t.id === selectedId;
                      const teacherHasPending =
                        isSelected && hasPendingForSelected;

                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                hasPendingForSelected &&
                                !window.confirm(
                                  "Discard unsaved changes for this teacher?",
                                )
                              ) {
                                return;
                              }
                              setSelectedId(t.id);
                            }}
                            aria-current={isSelected ? "true" : undefined}
                            className={[
                              "flex w-full cursor-pointer items-center gap-space-md border-l-4 px-space-md py-space-sm text-left transition-colors motion-reduce:transition-none",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                              isSelected
                                ? "border-l-primary bg-primary-container/40"
                                : "border-l-transparent hover:bg-surface-container-low",
                            ].join(" ")}
                          >
                            <span
                              aria-hidden="true"
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-container text-xs font-medium text-on-primary-container"
                            >
                              {initials(t)}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span
                                className={[
                                  "block truncate text-sm font-medium",
                                  t.isActive
                                    ? "text-on-surface"
                                    : "text-on-surface-variant",
                                ].join(" ")}
                              >
                                {teacherName(t)}
                                {teacherHasPending && (
                                  <span
                                    title="Unsaved changes"
                                    className="ml-space-xs text-primary"
                                  >
                                    <span aria-hidden="true">•</span>
                                    <span className="sr-only">
                                      {" "}
                                      (unsaved changes)
                                    </span>
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-xs text-on-surface-variant">
                                {t.staffCode}
                                {!t.isActive && " · Inactive"}
                              </span>
                            </span>

                            <span
                              className={[
                                "shrink-0 rounded-full px-space-sm py-space-xs text-xs font-medium",
                                count === undefined
                                  ? "bg-surface-container text-on-surface-variant"
                                  : count === 0
                                    ? "bg-warning-container text-on-warning-container"
                                    : "bg-surface-container text-on-surface",
                              ].join(" ")}
                            >
                              {count === undefined
                                ? "—"
                                : count === 0
                                  ? "No subjects"
                                  : plural(count, "subject")}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p
                    role="status"
                    className="p-space-xl text-center text-sm text-on-surface-variant"
                  >
                    No teachers match.
                  </p>
                )}
              </section>

              {/* ------------------------ Subject picker ------------------------ */}
              <section
                aria-label="Subjects for the selected teacher"
                className="min-w-0 self-start overflow-hidden rounded-sm border border-outline-variant/40 bg-surface"
              >
                {selected ? (
                  <>
                    <header className="flex items-center gap-space-md border-b border-outline-variant/40 p-space-md">
                      <span
                        aria-hidden="true"
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-base font-medium text-on-primary"
                      >
                        {initials(selected)}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-heading text-lg font-bold text-on-surface">
                          {teacherName(selected)}
                        </h2>
                        <p className="font-mono text-xs text-on-surface-variant">
                          {selected.staffCode}
                          {!selected.isActive && " · Inactive"}
                        </p>
                      </div>
                    </header>

                    {isFetching ? (
                      <p
                        role="status"
                        className="p-space-xl text-center text-sm text-on-surface-variant"
                      >
                        Loading subjects for {teacherName(selected)}…
                      </p>
                    ) : (
                      <>
                        <div className="space-y-space-sm border-b border-outline-variant/40 p-space-md">
                          <p
                            aria-live="polite"
                            className="text-sm font-medium text-on-surface"
                          >
                            Can teach{" "}
                            {plural(selectedSubjects.length, "subject")}
                          </p>

                          {selectedSubjects.length > 0 ? (
                            <ul className="flex flex-wrap gap-space-xs">
                              {selectedSubjects.map((s) => (
                                <li key={s.id}>
                                  <span className="inline-flex items-center gap-space-xs rounded-full bg-primary-container py-space-xs pl-space-sm pr-space-xs text-xs font-medium text-on-primary-container">
                                    {s.name}
                                    <button
                                      type="button"
                                      onClick={() => toggle(selected.id, s.id)}
                                      aria-label={`Remove ${s.name} from ${teacherName(selected)}`}
                                      className="grid h-4 w-4 cursor-pointer place-items-center rounded-full hover:bg-on-primary-container/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                      <X size={12} aria-hidden="true" />
                                    </button>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-on-surface-variant">
                              No subjects yet. Tick the ones this teacher can
                              teach below.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-space-sm p-space-md sm:flex-row sm:items-center sm:justify-between">
                          <div className="relative sm:w-64">
                            <label
                              htmlFor={subjectSearchId}
                              className="sr-only"
                            >
                              Search subjects
                            </label>
                            <Search
                              size={16}
                              aria-hidden="true"
                              className="pointer-events-none absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant"
                            />
                            <input
                              id={subjectSearchId}
                              type="search"
                              value={subjectQuery}
                              onChange={(e) => setSubjectQuery(e.target.value)}
                              placeholder="Search subjects…"
                              autoComplete="off"
                              className={SEARCH_INPUT}
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-space-sm">
                            <div
                              role="group"
                              aria-label="Filter by stage"
                              className="flex gap-space-xs"
                            >
                              {(["ALL", "JSS", "SS"] as const).map((stage) => (
                                <button
                                  key={stage}
                                  type="button"
                                  aria-pressed={stageFilter === stage}
                                  onClick={() => setStageFilter(stage)}
                                  className={[
                                    CHIP,
                                    stageFilter === stage
                                      ? "bg-primary text-on-primary"
                                      : "bg-surface-container text-on-surface hover:bg-surface-container-high",
                                  ].join(" ")}
                                >
                                  {stage === "ALL" ? "All stages" : stage}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => setShown(!allShownTicked)}
                              disabled={visibleSubjects.length === 0}
                              className="cursor-pointer rounded-sm px-space-sm py-space-xs text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {allShownTicked
                                ? "Clear shown"
                                : "Select all shown"}
                            </button>
                          </div>
                        </div>

                        {visibleSubjects.length > 0 ? (
                          <ul className="grid gap-space-sm px-space-md pb-space-md sm:grid-cols-2">
                            {visibleSubjects.map((s) => {
                              const key = pairKey(selected.id, s.id);
                              const isTicked = assigned.has(key);
                              const changed = isTicked !== saved.has(key);

                              return (
                                <li key={s.id}>
                                  <label
                                    className={[
                                      "flex cursor-pointer items-start gap-space-sm rounded-sm border p-space-sm transition-colors motion-reduce:transition-none",
                                      "focus-within:ring-2 focus-within:ring-ring",
                                      isTicked
                                        ? "border-primary bg-primary-container/40"
                                        : "border-outline-variant/40 hover:bg-surface-container-low",
                                    ].join(" ")}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isTicked}
                                      onChange={() => toggle(selected.id, s.id)}
                                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                                    />
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate text-sm font-medium text-on-surface">
                                        {s.name}
                                      </span>
                                      <span className="mt-space-xs flex flex-wrap items-center gap-space-xs">
                                        <span className="font-mono text-xs text-on-surface-variant">
                                          {s.code}
                                        </span>
                                        {s.classStage.map((stage) => (
                                          <span
                                            key={stage}
                                            className="rounded-sm bg-surface-container px-space-xs font-mono text-[10px] text-on-surface-variant"
                                          >
                                            {stage}
                                          </span>
                                        ))}
                                      </span>
                                    </span>
                                    {changed && (
                                      <span
                                        title="Unsaved change"
                                        className="text-primary"
                                      >
                                        <span aria-hidden="true">•</span>
                                        <span className="sr-only">
                                          Unsaved change
                                        </span>
                                      </span>
                                    )}
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p
                            role="status"
                            className="px-space-md pb-space-xl text-center text-sm text-on-surface-variant"
                          >
                            No subjects match.
                          </p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <p
                    role="status"
                    className="p-space-xl text-center text-sm text-on-surface-variant"
                  >
                    Choose a teacher on the left to set their subjects.
                  </p>
                )}
              </section>
            </div>

            {hasPendingForSelected && (
              <div
                role="region"
                aria-label="Unsaved changes"
                className="sticky bottom-space-md z-10 flex flex-wrap items-center justify-between gap-space-sm rounded-sm border border-outline-variant bg-surface p-space-md shadow-lg"
              >
                <p aria-live="polite" className="text-sm text-on-surface">
                  <span className="font-medium">Unsaved changes:</span>{" "}
                  <span className="font-mono text-xs">
                    {addedKeys.length} added · {removedKeys.length} removed
                  </span>
                </p>
                <div className="flex gap-space-sm">
                  <button
                    type="button"
                    onClick={discard}
                    disabled={isSaving}
                    className={`${BUTTON} text-on-surface hover:bg-surface-container`}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={isSaving}
                    className={`${BUTTON} bg-primary text-on-primary hover:bg-primary-hover`}
                  >
                    {isSaving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </MainLayout>
  );
};

export default AssignTeacherSubjects;
