import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import TitleCard from "../../components/TitleCard";
import LoadElement from "../../components/Loader/LoadElement";
import { useClassStore } from "../../store/class.store";
import TeachingAssignmentModal from "../../components/modal/AssignTeacherModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { useAcademicSessionStore } from "../../store/academic-session.store";
import { useAssignmentStore } from "../../store/assignment.store";
import AssignmentCard from "../../components/card/AssignmentCard";
import type {
  SubjectWithTeachers,
  TeachingAssignmentSummary,
} from "../../interface/Teaching-assignment.interface";

type ModalState =
  | { mode: "assign"; subject: SubjectWithTeachers }
  | {
      mode: "change";
      subject: SubjectWithTeachers;
      assignment: TeachingAssignmentSummary;
    }
  | null;

/** What the confirm modal is asking about. Null = closed. */
type ConfirmState =
  | {
      subject: SubjectWithTeachers;
      assignment: TeachingAssignmentSummary;
    }
  | null;

const EMPTY_BOX =
  "rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant";

const SELECT_CLASS =
  "w-full rounded-sm border border-(--input-border) bg-(--input-bg) px-space-md py-space-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const AssignTeachers = () => {
  /* -------------------------------- stores -------------------------------- */
  const fetchedClassLevel = useClassStore((s) => s.classes);
  const classArms = useClassStore((s) => s.classArms);
  const getClassLevels = useClassStore((s) => s.getClassLevels);
  const getClassArms = useClassStore((s) => s.getClassArms);

  const sessions = useAcademicSessionStore((s) => s.sessions);
  const getAcademicSessions = useAcademicSessionStore((s) => s.getSessions);

  const teachingAssignments = useAssignmentStore((s) => s.teachingAssignments);
  const getTeachingAssignments = useAssignmentStore(
    (s) => s.getTeachingAssignments,
  );
  const resetErrorState = useAssignmentStore((s) => s.resetErrorState);
  const assignmentsLoading = useAssignmentStore((s) => s.isLoading);
  const assignmentsError = useAssignmentStore((s) => s.error);

  /* -------------------------------- local UI ------------------------------ */
  const [selectedClassArm, setSelectedClassArm] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  /**
   * The "session:arm" key whose request has finished (success OR failure).
   * Loading is derived from this, so a failed or mismatched response can
   * never leave the spinner running forever.
   */
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  /* ------------------------------ initial load ---------------------------- */
  const [loading, setLoading] = useState({
    classLevels: fetchedClassLevel.length === 0,
    classArms: classArms.length === 0,
    sessions: sessions.length === 0,
  });
  const [loaded, setLoaded] = useState({
    classArms: classArms.length > 0,
    sessions: sessions.length > 0,
  });

  const fetchedRef = useRef({
    classLevels: fetchedClassLevel,
    classArms,
    sessions,
  });

  useEffect(() => {
    fetchedRef.current = { classLevels: fetchedClassLevel, classArms, sessions };
    let cancelled = false;
    const run = async (
      key: keyof typeof loading,
      isLoaded: () => boolean,
      fetch: () => Promise<unknown>,
    ) => {
      if (isLoaded()) {
        if (!cancelled) setLoaded((l) => ({ ...l, [key]: true }));
        return;
      }
      setLoading((l) => ({ ...l, [key]: true }));
      try {
        await fetch();
      } finally {
        if (!cancelled) {
          setLoading((l) => ({ ...l, [key]: false }));
          setLoaded((l) => ({ ...l, [key]: true }));
        }
      }
    };
    run(
      "sessions",
      () => fetchedRef.current.sessions.length > 0,
      getAcademicSessions,
    );
    run(
      "classLevels",
      () => fetchedRef.current.classLevels.length > 0,
      getClassLevels,
    );
    run(
      "classArms",
      () => fetchedRef.current.classArms.length > 0,
      getClassArms,
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------- derived data ----------------------------- */
  const levelById = useMemo(() => {
    const map = new Map<string, (typeof fetchedClassLevel)[number]>();
    fetchedClassLevel.forEach((l) => map.set(l.id, l));
    return map;
  }, [fetchedClassLevel]);

  const sortedArms = useMemo(
    () =>
      [...classArms].sort((a, b) => {
        const la = levelById.get(a.classLevelId)?.name ?? "";
        const lb = levelById.get(b.classLevelId)?.name ?? "";
        return la.localeCompare(lb) || a.name.localeCompare(b.name);
      }),
    [classArms, levelById],
  );

  const selectedArm = useMemo(
    () => sortedArms.find((a) => a.id === selectedClassArm) ?? null,
    [sortedArms, selectedClassArm],
  );

  const hasSelection = !!selectedClassArm && !!selectedSession;
  const currentKey = hasSelection ? `${selectedSession}:${selectedClassArm}` : null;

  /* -------------------------- assignment fetching ------------------------- */
  const fetchAssignments = async () => {
    if (!currentKey || !selectedArm || !selectedSession || !selectedClassArm) {
      return;
    }
    const key = currentKey;
    try {
      await getTeachingAssignments({
        sessionId: selectedSession,
        classLevelId: selectedArm.classLevelId,
        classArmId: selectedClassArm,
      });
    } catch {
      // The store records the error; we only need to know the request settled.
    } finally {
      // Safe even if the selection changed meanwhile: a stale key simply
      // won't equal the current key, so loading stays true for the new one.
      setFetchedKey(key);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, selectedArm?.classLevelId]);

  /* -------------------- clear stale error when selection changes ----------- */
  useEffect(() => {
    // Changing selection means the old error no longer applies.
    if (assignmentsError) resetErrorState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassArm, selectedSession]);

  /* ------------------------- assignments → subjects ----------------------- */
  // Compare as strings so a number/string mismatch can't hide valid data.
  const freshAssignments =
    teachingAssignments &&
    selectedClassArm &&
    String(teachingAssignments.classArm?.id) === String(selectedClassArm)
      ? teachingAssignments
      : null;

  const subjects: SubjectWithTeachers[] = freshAssignments?.subjects ?? [];

  /* ------------------------------ UI states ------------------------------- */
  const initialLoading = !loaded.classArms;
  const initialStates = [
    { message: "Loading class arms...", loading: initialLoading },
  ];

  // Loading means "the request for THIS selection hasn't settled yet".
  // Missing data after it settles is an error/empty state, not loading.
  const gridLoading =
    hasSelection && (assignmentsLoading || fetchedKey !== currentKey);

  /* ------------------------------ handlers -------------------------------- */
  const handleRetry = () => {
    resetErrorState();
    fetchAssignments();
  };

  const handleConfirmRemove = () => {
    if (!confirmState) return;
    // TODO: await removeAssignment(confirmState.assignment.id);
    void confirmState;
    setConfirmState(null);
    // After the real remove succeeds, refetch:
    // fetchAssignments();
  };

  /* ------------------------------ grid content ---------------------------- */
  const renderGrid = () => {
    if (!hasSelection) {
      return sortedArms.length > 0 ? (
        <p role="status" className={EMPTY_BOX}>
          Pick a class arm and an academic session to manage assignments.
        </p>
      ) : null;
    }

    if (gridLoading) {
      return (
        <div className="flex items-center justify-center p-6">
          <LoadElement
            states={[{ message: "Loading assignments...", loading: true }]}
          />
        </div>
      );
    }

    if (assignmentsError) {
      return (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-space-md rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
        >
          <p>{assignmentsError}</p>
          <div className="flex gap-space-sm">
            <button
              type="button"
              onClick={handleRetry}
              className="cursor-pointer rounded-sm px-space-sm py-space-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={resetErrorState}
              className="cursor-pointer rounded-sm px-space-sm py-space-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Dismiss
            </button>
          </div>
        </div>
      );
    }

    if (!freshAssignments) {
      return (
        <p role="status" className={EMPTY_BOX}>
          Couldn&apos;t load assignments for this selection.{" "}
          <button
            type="button"
            onClick={handleRetry}
            className="cursor-pointer rounded-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </p>
      );
    }

    if (subjects.length === 0) {
      return (
        <p role="status" className={EMPTY_BOX}>
          No subjects are attached to this class arm yet. Add subjects to the
          class level first.
        </p>
      );
    }

    return (
      <ul
        role="list"
        className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-3"
      >
        {subjects.map((subject) => (
          <li key={subject.id}>
            <AssignmentCard
              subject={subject}
              onAssign={(s) => setModalState({ mode: "assign", subject: s })}
              onChange={(s, a) =>
                setModalState({ mode: "change", subject: s, assignment: a })
              }
              onRemove={(s, a) => setConfirmState({ subject: s, assignment: a })}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <MainLayout>
      <section className="flex flex-col gap-space-md">
        {initialLoading ? (
          <div className="flex items-center justify-center p-4">
            <LoadElement states={initialStates} />
          </div>
        ) : (
          <>
            <TitleCard
              showActionButton={false}
              secondaryAction={null}
              title="Assign Teachers"
              description="Assign teachers to subjects offered by each class arm"
            />

            {sortedArms.length === 0 ? (
              <p role="status" className={EMPTY_BOX}>
                No class arms are available yet. Create a class arm first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-space-md">
                {/* Class arm */}
                <div className="flex flex-col gap-space-xs sm:w-80">
                  <label
                    htmlFor="class-arm-select"
                    className="text-sm font-medium text-on-surface"
                  >
                    Class arm
                  </label>
                  <select
                    id="class-arm-select"
                    value={selectedClassArm ?? ""}
                    onChange={(e) => {
                      setSelectedClassArm(e.target.value || null);
                      setModalState(null);
                      setConfirmState(null);
                    }}
                    className={SELECT_CLASS}
                  >
                    <option value="" disabled>
                      Select a class arm…
                    </option>
                    {sortedArms.map((arm) => {
                      const levelName = levelById.get(arm.classLevelId)?.name;
                      return (
                        <option key={arm.id} value={arm.id}>
                          {levelName ? `${levelName} ${arm.name}` : arm.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Session */}
                <div className="flex flex-col gap-space-xs sm:w-80">
                  <label
                    htmlFor="academic-session-select"
                    className="text-sm font-medium text-on-surface"
                  >
                    Academic session
                  </label>
                  <select
                    id="academic-session-select"
                    value={selectedSession ?? ""}
                    onChange={(e) => {
                      setSelectedSession(e.target.value || null);
                      setModalState(null);
                      setConfirmState(null);
                    }}
                    className={SELECT_CLASS}
                  >
                    <option value="" disabled>
                      Select academic session
                    </option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Grid */}
            {renderGrid()}
          </>
        )}

        {/* Assign / change modal */}
        {modalState && selectedClassArm && selectedSession && selectedArm && (
          <TeachingAssignmentModal
            onClose={() => setModalState(null)}
            sessionId={selectedSession}
            classLevelId={selectedArm.classLevelId}
            classArmId={selectedClassArm}
            subject={modalState.subject}
            existingAssignment={
              modalState.mode === "change" ? modalState.assignment : undefined
            }
            onSaved={() => {
              setModalState(null);
              fetchAssignments();
            }}
          />
        )}

        {/* Remove confirmation */}
        {confirmState && (
          <ConfirmModal
            title="Remove teacher?"
            message={`Remove the teacher from ${confirmState.subject.name}? This cannot be undone.`}
            confirmLabel="Remove"
            cancelLabel="Cancel"
            destructive={true}
            onClose={() => setConfirmState(null)}
            onConfirm={handleConfirmRemove}
          />
        )}
      </section>
    </MainLayout>
  );
};

export default AssignTeachers;