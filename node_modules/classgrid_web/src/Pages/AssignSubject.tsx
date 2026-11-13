import { ArrowLeft, Loader, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SubjectMatrix, { cellKey } from "../components/SubjectMatrix";

import MainLayout from "../layout/MainLayout";
import TitleCard from "../components/TitleCard";
import { useSubjectStore } from "../store/subject.store";
import { useClassStore } from "../store/class.store";
import LoadElement from "../components/Loader/LoadElement";
import { useAssignmentStore } from "../store/assignment.store";

const STAGE_ORDER = { JSS: 0, SS: 1 } as const;

const BUTTON =
  "inline-flex cursor-pointer items-center justify-center rounded-sm px-space-lg py-space-sm text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const AssignSubjects = () => {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── Store data ────────────────────────────────────────────────────────────
  const fetchedSubjects = useSubjectStore((s) => s.subjects);
  const fetchedClassLevel = useClassStore((s) => s.classes);
  const assignments = useAssignmentStore((s) => s.subjectAssignments);
  const getAssignments = useAssignmentStore((s) => s.getSubjectAssignments);
  const getSubjects = useSubjectStore((s) => s.getSubjects);
  const getClassLevels = useClassStore((s) => s.getClassLevels);

  const updateSubjectAssignments = useAssignmentStore(
    (s) => s.updateSubjectAssignments,
  );

  // ── Per-request loading flags. Start `true` only when we have no data yet.
  const [loading, setLoading] = useState({
    subjects: fetchedSubjects.length === 0,
    classLevels: fetchedClassLevel.length === 0,
    assignments: assignments.length === 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSubjects = async () => {
      if (fetchedSubjects.length > 0) return;
      setLoading((l) => ({ ...l, subjects: true }));
      try {
        await getSubjects();
      } finally {
        if (!cancelled) {
          setLoading((l) => ({ ...l, subjects: false }));
        }
      }
    };

    const loadClassLevels = async () => {
      if (fetchedClassLevel.length > 0) return;
      setLoading((l) => ({ ...l, classLevels: true }));
      try {
        await getClassLevels();
      } finally {
        if (!cancelled) {
          setLoading((l) => ({ ...l, classLevels: false }));
        }
      }
    };

    const loadAssignments = async () => {
      if (assignments.length > 0) return;
      setLoading((l) => ({ ...l, assignments: true }));
      try {
        await getAssignments();
      } finally {
        if (!cancelled) {
          setLoading((l) => ({ ...l, assignments: false }));
        }
      }
    };

    loadSubjects();
    loadClassLevels();
    loadAssignments();

    return () => {
      cancelled = true;
    };
    // Intentionally run once; the guards above handle "already loaded".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for subjects, levels, AND assignments before rendering the matrix,
  // otherwise the matrix would mount with an empty `saved` set and never
  // reflect the fetched assignments.
  const isInitialLoading =
    loading.subjects || loading.classLevels || loading.assignments;

  // ── Derived data. Depend on the real arrays so this recomputes on fetch.
  const levels = useMemo(
    () =>
      fetchedClassLevel
        .filter((l) => l.isActive)
        .sort(
          (a, b) =>
            STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || a.rank - b.rank,
        ),
    [fetchedClassLevel],
  );

  const allSubjects = useMemo(
    () =>
      fetchedSubjects
        .filter((s) => s.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [fetchedSubjects],
  );

  // ── Selection state. Starts empty; hydrated by the effect below once the
  //    store has real assignments.
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [assigned, setAssigned] = useState<Set<string>>(() => new Set());

  // Track whether we've hydrated at least once, so a store refetch doesn't
  // silently discard a user's in-progress edits.
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Skip if we've already seeded from the store — protects unsaved edits.
    if (hydratedRef.current) return;
    // Nothing to hydrate yet.
    if (assignments.length === 0) return;

    const next = new Set(
      assignments.map((a) => cellKey(a.classLevelId, a.subjectId)),
    );
    queueMicrotask(()=> setSaved(next));
    queueMicrotask(()=> setAssigned(new Set(next)));
    hydratedRef.current = true;
  }, [assignments]);

  const subjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSubjects;
    return allSubjects.filter((s) =>
      `${s.name} ${s.code ?? ""}`.toLowerCase().includes(q),
    );
  }, [allSubjects, query]);

  const added = useMemo(
    () => [...assigned].filter((k) => !saved.has(k)).length,
    [assigned, saved],
  );
  const removed = useMemo(
    () => [...saved].filter((k) => !assigned.has(k)).length,
    [assigned, saved],
  );
  const pending = added + removed;

  const toggle = (classLevelId: string, subjectId: string) => {
    const key = cellKey(classLevelId, subjectId);
    setAssigned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleMany = (keys: string[], on: boolean) => {
    setAssigned((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
      return next;
    });
  };

  const save = async () => {
    setIsSaving(true);
    const parse = (key: string) => {
      const [classLevelId, subjectId] = key.split("|");
      return { classLevelId, subjectId };
    };

    const toAdd = [...assigned].filter((k) => !saved.has(k)).map(parse);
    const toRemove = [...saved].filter((k) => !assigned.has(k)).map(parse);

    try {
      const result = await updateSubjectAssignments({
        additions: toAdd,
        removals: toRemove,
      });
      if (!result.success) {
        throw new Error(result.message || "Failed to save assignments.");
      }
      // Snapshot the current selection as the new baseline.
      const snapshot = new Set(assigned);
      setSaved(snapshot);
      setAssigned(new Set(snapshot));
    } finally {
      setIsSaving(false);
    }
  };

  const discard = () => setAssigned(new Set(saved));

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

          <TitleCard
            showActionButton={false}
            description="Tick the subjects each class level offers. A choice applies to every arm in that level, so JSS 1 A, B and C all share it. A dash means the subject isn’t taught at that stage."
            title="Assign Subjects to Class Levels"
            secondaryAction={null}
          />
        </div>

        {/* Only the matrix area is replaced by the loader, not the whole page. */}
        {isInitialLoading ? (
          <LoadElement
            states={[
              { message: "Loading subjects…", loading: loading.subjects },
              {
                message: "Loading class levels…",
                loading: loading.classLevels,
              },
              {
                message: "Loading assignments…",
                loading: loading.assignments,
              },
            ]}
          />
        ) : (
          <>
            <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="relative sm:w-72">
                <label htmlFor={searchId} className="sr-only">
                  Search subjects
                </label>
                <Search
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search subjects…"
                  autoComplete="off"
                  className="w-full rounded-sm border border-(--input-border) bg-(--input-bg) py-space-sm pl-9 pr-space-md text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <p aria-live="polite" className="text-sm text-on-surface-variant">
                Showing {subjects.length} of {allSubjects.length} subjects
                across {levels.length} class levels
              </p>
            </div>

            {subjects.length > 0 ? (
              <SubjectMatrix
                levels={levels}
                subjects={subjects}
                assigned={assigned}
                saved={saved}
                onToggle={toggle}
                onToggleMany={toggleMany}
              />
            ) : (
              <p
                role="status"
                className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant"
              >
                No subjects match “{query.trim()}”.
              </p>
            )}

            {pending > 0 && (
              <div
                role="region"
                aria-label="Unsaved changes"
                className="sticky bottom-space-md z-10 flex flex-wrap items-center justify-between gap-space-sm rounded-sm border border-outline-variant bg-surface p-space-md shadow-lg"
              >
                <p aria-live="polite" className="text-sm text-on-surface">
                  <span className="font-medium">Unsaved changes:</span>{" "}
                  <span className="font-mono text-xs">
                    {added} added · {removed} removed
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
                    {isSaving ? (
                      <>
                        <Loader
                          size={16}
                          strokeWidth={2}
                          className="motion-safe:animate-spin"
                          aria-hidden="true"
                        />
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
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

export default AssignSubjects;