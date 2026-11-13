import { useEffect, useMemo, useState } from "react";
import { CalendarSearch, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import TitleCard from "../../components/TitleCard";
import LoadElement from "../../components/Loader/LoadElement";
import QueryField from "../../components/timetable/QueryField";
import TimetableCard from "../../components/timetable/TimetableCard";

import { useAcademicSessionStore } from "../../store/academic-session.store";
import { useTimetableStore } from "../../store/timetable.store";
import type {
  ITimetableCreate,
  ITimetableListItem,
} from "../../interface/timetable.interface";
import CreateTimetableModal from "../../components/modal/CreateTimetable";

interface Iquery {
  sessionId: string;
  termId: string;
}

const Timetables = () => {
  const navigate = useNavigate();

  /* ------------------------------- selection ------------------------------- */
  const [query, setQuery] = useState<Iquery>({ sessionId: "", termId: "" });
  const hasSelection = query.sessionId !== "" && query.termId !== "";

  /* -------------------------------- stores --------------------------------- */
  const sessions = useAcademicSessionStore((a) => a.sessions);
  const getSessions = useAcademicSessionStore((a) => a.getSessions);

  const timeTables = useTimetableStore((s) => s.timeTables);
  const getTimeTables = useTimetableStore((s) => s.getTimeTables);
  const createTimetable = useTimetableStore((s) => s.createTimetable);
  const publishTimetable = useTimetableStore((s) => s.publishTimetable);
  const archiveTimetable = useTimetableStore((s) => s.archiveTimetable);
  const timetablesLoading = useTimetableStore((s) => s.loading);
  const timetablesError = useTimetableStore((s) => s.error);
  const resetErrorState = useTimetableStore((s) => s.resetErrorState);

  const selectedSession = sessions.find((s) => s.id === query.sessionId);

  /* --------------------------------- state --------------------------------- */
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  /* --------------------------- initial session load ------------------------ */
  useEffect(() => {
    let cancelled = false;
    Promise.resolve(getSessions()).finally(() => {
      if (!cancelled) setSessionsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [getSessions]);

  /* ---------------------- fetch timetables on selection -------------------- */
  useEffect(() => {
    if (!hasSelection) return;
    if (timetablesError) resetErrorState();

    let cancelled = false;
    Promise.resolve(getTimeTables(query)).finally(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.sessionId, query.termId]);

  /* ---------------------------- client-side filter ------------------------- */
  // Assumes the API returns all timetables. Replace with server-side filtering
  // by changing getTimeTables to accept `{ sessionId, termId }` and dropping
  // this memo.
  const visibleTimetables = useMemo<ITimetableListItem[]>(() => {
    if (!hasSelection) return [];
    return timeTables.filter((t) => t.termId === query.termId);
  }, [timeTables, hasSelection, query.termId]);

  /* -------------------------------- handlers ------------------------------- */
  const refresh = () => {
    if (!hasSelection) return;
    getTimeTables(query);
  };

  const handleCreate = async (
    data: ITimetableCreate,
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await createTimetable(data);
    if (res.success) {
      setOpenCreate(false);
      refresh();
    }
    return res;
  };

  const handleView = (t: ITimetableListItem) => {
    navigate(`/timetables/${t.id}`);
  };

  const handleEdit = (t: ITimetableListItem) => {
    navigate(`/timetables/${t.id}/edit`);
  };

  const handlePublish = async (t: ITimetableListItem) => {
    const res = await publishTimetable(t.id);
    if (res.success) refresh();
  };

  const handleArchive = async (t: ITimetableListItem) => {
    const res = await archiveTimetable(t.id);
    if (res.success) refresh();
  };

  /* --------------------------------- render -------------------------------- */
  return (
    <MainLayout>
      <section className="flex flex-col gap-space-lg">
        <TitleCard
          title="Timetables"
          description="Build and review class timetables by selecting an academic session and term."
          showActionButton
          actionLabel="Create Timetable"
          onButtonClick={() => setOpenCreate(true)}
          secondaryAction={null}
        />

        {/* Session / term selector */}
        {!sessionsLoaded ? (
          <div
            role="status"
            aria-busy="true"
            className="h-20 rounded-sm bg-surface-container motion-safe:animate-pulse"
          >
            <span className="sr-only">Loading sessions…</span>
          </div>
        ) : sessions.length === 0 ? (
          <p
            role="status"
            className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant"
          >
            There are no academic sessions yet.{" "}
            <Link to="/sessions" className="font-medium text-primary underline">
              Create one first
            </Link>
            .
          </p>
        ) : (
          <QueryField
            setQuery={setQuery}
            sessions={sessions}
            terms={selectedSession?.terms ?? []}
          />
        )}

        {/* Results */}
        {sessionsLoaded && sessions.length > 0 && hasSelection && (
          <>
            {timetablesLoading ? (
              <div className="flex items-center justify-center p-6">
                <LoadElement
                  states={[{ message: "Loading timetables…", loading: true }]}
                />
              </div>
            ) : timetablesError ? (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-space-md rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
              >
                <p>{timetablesError}</p>
                <div className="flex gap-space-sm">
                  <button
                    type="button"
                    onClick={() => {
                      resetErrorState();
                      refresh();
                    }}
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
            ) : visibleTimetables.length === 0 ? (
              <div
                role="status"
                className="flex flex-col items-center gap-space-sm rounded-sm border border-dashed border-outline-variant p-space-xl text-center"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-container text-on-surface-variant">
                  <CalendarSearch size={24} aria-hidden="true" />
                </span>
                <p className="text-sm text-on-surface-variant">
                  No timetables exist for this term yet.
                </p>
                <button
                  type="button"
                  onClick={() => setOpenCreate(true)}
                  className="mt-space-sm inline-flex cursor-pointer items-center gap-space-xs rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus size={14} aria-hidden="true" />
                  Create the first timetable
                </button>
              </div>
            ) : (
              <ul
                role="list"
                className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-3"
              >
                {visibleTimetables.map((timetable) => (
                  <li key={timetable.id}>
                    <TimetableCard
                      timetable={timetable}
                      onView={handleView}
                      onEdit={handleEdit}
                      onPublish={handlePublish}
                      onArchive={handleArchive}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Pre-selection prompt */}
        {sessionsLoaded && sessions.length > 0 && !hasSelection && (
          <div
            role="status"
            className="flex flex-col items-center gap-space-sm rounded-sm border border-dashed border-outline-variant p-space-xl text-center"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-container text-on-surface-variant">
              <CalendarSearch size={24} aria-hidden="true" />
            </span>
            <p className="text-sm text-on-surface-variant">
              Choose an academic session and a term to see its timetables.
            </p>
          </div>
        )}

        {/* Create modal */}
        {openCreate && (
          <CreateTimetableModal
            termId={query.termId}
            onClose={() => setOpenCreate(false)}
            onSubmit={handleCreate}
          />
        )}
      </section>
    </MainLayout>
  );
};

export default Timetables;
