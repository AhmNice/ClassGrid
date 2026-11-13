import  { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../layout/MainLayout";
import TitleCard from "../components/TitleCard";
import { Import, Loader2, Pencil, RefreshCw } from "lucide-react";
import SubjectModal from "../components/modal/SubjectModal";
import { schoolName } from "../utils/general";
import SubjectFilter from "../components/subjects/SubjectFilter";
import {
  DEFAULT_SUBJECT_FILTERS,
  type SubjectFilterState,
  type SubjectStatus,
} from "../components/subjects/Subject.type";
import { useSubjectStore } from "../store/subject.store";
import type {
  ISubject,
  ISubjectCreate,
  ISubjectUpdate,
} from "../interface/subject.interface";

const SKELETON_ROWS = 5;

const Subjects = () => {
  const [primaryModal, setPrimaryModal] = useState(false);
  const [toEdit, setToEdit] = useState<ISubject | null>(null);
  const [filters, setFilters] = useState<SubjectFilterState>(
    DEFAULT_SUBJECT_FILTERS,
  );

  const subjects = useSubjectStore((s) => s.subjects);
  const fetchSubjects = useSubjectStore((s) => s.getSubjects);
  const isStoreLoading = useSubjectStore((s) => s.loading);
  const error = useSubjectStore((s) => s.error);
  const createSubject = useSubjectStore((s) => s.createSubject);
  const updateSubject = useSubjectStore((s) => s.updateSubject);

  // ── Local loading state ─────────────────────────────────────────────────
  // `initial`    → first fetch, no data on screen yet → show skeleton
  // `refreshing` → re-fetch with data already visible → show subtle spinner
  const [loading, setLoading] = useState({
    initial: subjects.length === 0,
    refreshing: false,
  });
  // Tracks whether the first fetch has settled (success or failure).
  const [hasLoadedOnce, setHasLoadedOnce] = useState(subjects.length > 0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (mode === "initial") {
        setLoading({ initial: true, refreshing: false });
      } else {
        setLoading((l) => ({ ...l, refreshing: true }));
      }

      try {
        await fetchSubjects();
      } catch {
        // Store already records `error`; keep UI alive.
      } finally {
        if (mountedRef.current) {
          setLoading({ initial: false, refreshing: false });
          setHasLoadedOnce(true);
        }
      }
    },
    [fetchSubjects],
  );

  // First mount: fetch if store is empty.
  useEffect(() => {
    if (subjects.length === 0) {
      queueMicrotask(() => void load("initial"));
    } else {
      queueMicrotask(() => setHasLoadedOnce(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Modal handlers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setToEdit(null);
    setPrimaryModal(true);
  };

  const openEdit = (subject: ISubject) => {
    setToEdit(subject);
    setPrimaryModal(true);
  };

  const closeModal = () => {
    setPrimaryModal(false);
    setToEdit(null);
  };

  /**
   * Single handler for both create and edit.
   * After a successful mutation, trigger a background refresh so the list
   * reflects server-computed fields (e.g. derived codes, timestamps).
   */
  const onSubmit = async (data: ISubjectCreate | ISubjectUpdate) => {
    const res = toEdit
      ? await updateSubject({ ...(data as ISubjectCreate), id: toEdit.id })
      : await createSubject(data as ISubjectCreate);

    if (res?.success !== false) {
      void load("refresh");
    }
    return res;
  };

  // ── Derived data ────────────────────────────────────────────────────────
  const statusOf = (s: ISubject): SubjectStatus =>
    s.isActive ? "ACTIVE" : "INACTIVE";

  const filteredSubjects = useMemo(() => {
    const q = (filters.query ?? "").trim().toLowerCase();
    return subjects.filter((s) => {
      if (filters.isActive !== "ALL" && statusOf(s) !== filters.isActive) {
        return false;
      }
      if (q && !`${s.name} ${s.code ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [subjects, filters]);

  const errorMessage = !error
    ? null
    : typeof error === "string"
      ? error
      : (error as { message?: string }).message ?? "Could not load subjects.";

  // `busy` also covers the store's own loading flag for external refetches.
  const showSkeleton =
    (loading.initial || isStoreLoading) && subjects.length === 0;
  const showRefreshSpinner = loading.refreshing && subjects.length > 0;
  const showEmpty =
    hasLoadedOnce &&
    !showSkeleton &&
    !showRefreshSpinner &&
    !errorMessage &&
    filteredSubjects.length === 0;

  return (
    <MainLayout>
      <section className="flex flex-col gap-3">
        <TitleCard
          title="Subjects & Curriculum Directory"
          description={`Configure subjects, department allocations, weekly period counts, laboratory prerequisites, and cognitive load scheduling constraints for ${schoolName}.`}
          actionLabel="Add Subject"
          onButtonClick={openCreate}
          secondaryAction={{
            label: "Import CSV",
            to: () => {},
            icon: <Import strokeWidth={2} size={16} />,
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <SubjectFilter
            subjects={subjects}
            filters={filters}
            onChange={setFilters}
          />
          <button
            type="button"
            onClick={() => void load("refresh")}
            disabled={loading.refreshing || isStoreLoading}
            aria-label="Refresh subjects"
            className="inline-flex items-center gap-space-xs rounded-sm px-space-sm py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
              className={
                loading.refreshing || isStoreLoading
                  ? "motion-safe:animate-spin"
                  : undefined
              }
            />
            Refresh
          </button>
        </div>

        {/* ── Skeleton (first load) ─────────────────────────────────────── */}
        {showSkeleton && (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="overflow-hidden rounded-xl border border-outline-variant/30"
          >
            <div className="flex items-center justify-center gap-space-sm bg-surface-container p-space-sm text-xs text-on-surface-variant">
              <Loader2
                size={14}
                className="motion-safe:animate-spin"
                aria-hidden="true"
              />
              Loading subjects…
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container text-on-surface-variant">
                <tr>
                  <th className="px-space-md py-space-sm font-medium">Name</th>
                  <th className="px-space-md py-space-sm font-medium">Code</th>
                  <th className="px-space-md py-space-sm font-medium">
                    Class Stage
                  </th>
                  <th className="px-space-md py-space-sm font-medium">
                    Periods / week
                  </th>
                  <th className="px-space-md py-space-sm font-medium">
                    Status
                  </th>
                  <th className="px-space-md py-space-sm font-medium text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-t border-outline-variant/20"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td
                        key={j}
                        className="px-space-md py-space-sm"
                      >
                        <div className="h-3 w-full max-w-[10rem] animate-pulse rounded bg-surface-container-high" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {errorMessage && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-space-sm rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => void load(subjects.length === 0 ? "initial" : "refresh")}
              className="rounded-sm px-space-sm py-1 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty ─────────────────────────────────────────────────────── */}
        {showEmpty && (
          <div className="rounded-xl bg-surface-container p-space-xl text-center text-sm text-on-surface-variant">
            {subjects.length === 0
              ? "No subjects yet. Add one to get started."
              : "No subjects match the current filters."}
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
        {filteredSubjects.length > 0 && (
          <div className="relative overflow-hidden rounded-xl border border-outline-variant/30">
            {/* Refresh bar: never blanks the table, just dims + animates. */}
            {showRefreshSpinner && (
              <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-space-xs bg-surface-container/90 py-1 text-xs text-on-surface-variant backdrop-blur-sm"
              >
                <Loader2
                  size={12}
                  className="motion-safe:animate-spin"
                  aria-hidden="true"
                />
                Refreshing…
              </div>
            )}
            <table
              className={
                "w-full text-left text-sm transition-opacity " +
                (showRefreshSpinner ? "opacity-60" : "opacity-100")
              }
            >
              <thead className="bg-surface-container text-on-surface-variant">
                <tr>
                  <th className="px-space-md py-space-sm font-medium">Name</th>
                  <th className="px-space-md py-space-sm font-medium">Code</th>
                  <th className="px-space-md py-space-sm font-medium">
                    Class Stage
                  </th>
                  <th className="px-space-md py-space-sm font-medium">
                    Periods / week
                  </th>
                  <th className="px-space-md py-space-sm font-medium">
                    Status
                  </th>
                  <th className="px-space-md py-space-sm font-medium text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-outline-variant/20 text-on-surface"
                  >
                    <td className="px-space-md py-space-sm">{s.name}</td>
                    <td className="px-space-md py-space-sm font-mono text-xs">
                      {s.code ?? "—"}
                    </td>
                    <td className="px-space-md py-space-sm">
                      <span className="inline-flex items-center rounded-sm bg-surface-container px-space-sm py-0.5 text-xs">
                        {s.classStage.join(", ")}
                      </span>
                    </td>
                    <td className="px-space-md py-space-sm">
                      {s.defaultPeriodsPerWeek ?? "—"}
                    </td>
                    <td className="px-space-md py-space-sm">
                      <span
                        className={
                          s.isActive
                            ? "text-success"
                            : "text-on-surface-variant"
                        }
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-space-md py-space-sm text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="inline-flex items-center gap-1 rounded-sm px-space-sm py-1 text-xs font-medium text-primary hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Pencil size={14} aria-hidden="true" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {primaryModal && (
          <SubjectModal
            onClose={closeModal}
            onSubmit={onSubmit}
            subject={toEdit ?? undefined}
          />
        )}
      </section>
    </MainLayout>
  );
};

export default Subjects;