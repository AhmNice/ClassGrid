import MainLayout from "../layout/MainLayout";
import TitleCard from "../components/TitleCard";
import ConfirmModal from "../components/modal/ConfirmModal";
import { PlusCircle, SquareLibrary } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PeriodModal from "../components/modal/PeriodModal";
import PeriodTimeline from "../components/PeriodTimeline";
import { cx } from "../Pages/auth/authUi";
import { usePeriodStore } from "../store/period.store";
import type { IPeriod } from "../interface/period.interface";
import {
  buildScheduleOptions,
  durationOf,
  formatDuration,
  groupOf,
  sortPeriods,
} from "../utils/PeriodUtils";

// Display names for schedules, keyed by schedule id. Until the page loads names
// from the API, add one line per schedule, for example:
//   "237e91aa-194c-416b-a418-4725fb58a7cd": "Standard Instructional Day",
// A schedule with no name here shows as "Schedule 1", "Schedule 2"…
const SCHEDULE_NAMES: Record<string, string> = {};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-on-surface-variant">{label}</dt>
    <dd className="font-mono text-sm font-medium text-on-surface">{value}</dd>
  </div>
);

/** Totals worked out from the periods, not typed in. */
const PeriodSummaryCard = ({ periods }: { periods: IPeriod[] }) => {
  const active = sortPeriods(periods.filter((p) => p.isActive));

  const lessons = active.filter((p) => groupOf(p.kind) === "LESSON");
  const breaks = active.filter((p) => groupOf(p.kind) === "BREAK");
  const teachingMinutes = lessons.reduce((sum, p) => sum + durationOf(p), 0);

  const first = active[0];
  const last = active[active.length - 1];

  return (
    <div className="flex items-center gap-space-md rounded-sm border border-outline-variant/40 bg-surface p-space-md">
      <div className="rounded-sm bg-primary p-space-sm text-on-primary">
        <SquareLibrary size={24} strokeWidth={2} aria-hidden="true" />
      </div>
      <dl className="grid flex-1 grid-cols-2 gap-space-md sm:grid-cols-4">
        <Stat label="Lessons" value={String(lessons.length)} />
        <Stat label="Breaks" value={String(breaks.length)} />
        <Stat
          label="School day"
          value={first && last ? `${first.startTime} – ${last.endTime}` : "—"}
        />
        <Stat label="Teaching time" value={formatDuration(teachingMinutes)} />
      </dl>
    </div>
  );
};

const Period = () => {
  const [openModal, setOpenModal] = useState(false);
  /** The period being edited. `null` means the modal is creating a new one. */
  const [editingPeriod, setEditingPeriod] = useState<IPeriod | null>(null);
  /** The period awaiting delete confirmation. `null` means no dialog. */
  const [pendingDelete, setPendingDelete] = useState<IPeriod | null>(null);
  // `null` until the user picks one. Then the first schedule is used.
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );

  const periods = usePeriodStore((s) => s.periods);
  const fetchPeriods = usePeriodStore((s) => s.getPeriods);
  const deletePeriod = usePeriodStore((s) => s.deletePeriod);

  // Starts true so the page doesn't flash "No periods configured yet".
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchPeriods();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPeriods]);

  // One chip per schedule found in the data.
  const scheduleOptions = useMemo(
    () => buildScheduleOptions(periods, SCHEDULE_NAMES),
    [periods],
  );

  // If nothing is picked yet, or the picked schedule is gone, use the first.
  const activeScheduleId = scheduleOptions.some(
    (option) => option.id === selectedScheduleId,
  )
    ? selectedScheduleId
    : (scheduleOptions[0]?.id ?? null);

  // A day follows one schedule, so only that schedule's periods are shown.
  const visiblePeriods = useMemo(
    () => periods.filter((p) => p.periodScheduleScheduleId === activeScheduleId),
    [periods, activeScheduleId],
  );

  /* ------------------------------ modal control ---------------------------- */

  const openCreate = () => {
    setEditingPeriod(null);
    setOpenModal(true);
  };

  const openEdit = (period: IPeriod) => {
    setEditingPeriod(period);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingPeriod(null);
  };

  /* ---------------------------- delete flow -------------------------------- */

  // Called from the edit modal's "Delete" button. Closes the edit modal first
  // so only the confirm dialog is on screen.
  const requestDelete = (period: IPeriod) => {
    closeModal();
    setPendingDelete(period);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const res = await deletePeriod(pendingDelete.id);
    if (res.success) setPendingDelete(null);
  };

  return (
    <MainLayout>
      <section className="flex flex-col gap-4">
        <TitleCard
          title="Periods & Bell Schedule Configuration"
          description="Configure daily instructional timelines, period durations, morning recess, lunch breaks, and day-specific variations such as condensed Friday schedules for Senior & Junior divisions."
          actionLabel="Save Schedule Rules"
          PrimaryIcon={PlusCircle}
          secondaryAction={{
            label: "Add Custom Period Slot",
            icon: <PlusCircle size={16} strokeWidth={2} />,
            to: openCreate,
          }}
        />

        {/* Only worth showing when there is more than one schedule to pick. */}
        {scheduleOptions.length > 1 && (
          <div
            role="group"
            aria-label="Filter by schedule"
            className="flex flex-wrap gap-2 rounded-md bg-surface-container p-1.5"
          >
            {scheduleOptions.map((option) => {
              const isActive = activeScheduleId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedScheduleId(option.id)}
                  className={cx(
                    "flex flex-row gap-2 items-center rounded-sm px-2.5 py-1.5 text-left transition-colors font-mono",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary text-on-primary"
                      : "bg-surface text-on-surface hover:bg-surface-container-high",
                  )}
                >
                  <span className="text-xs font-medium">{option.label}</span>
                  <span
                    className={cx(
                      "text-[10px] font-mono",
                      isActive ? "text-on-primary/80" : "text-on-surface-variant",
                    )}
                  >
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div
            role="status"
            aria-busy="true"
            className="h-24 rounded-sm bg-surface-container motion-safe:animate-pulse"
          >
            <span className="sr-only">Loading periods…</span>
          </div>
        ) : periods.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-space-md rounded-sm border border-dashed border-outline-variant p-space-xl text-center">
            <p className="text-sm text-on-surface-variant">
              No periods configured yet.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="cursor-pointer rounded-sm bg-primary px-space-md py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Add the first period
            </button>
          </div>
        ) : (
          <>
            <PeriodSummaryCard periods={visiblePeriods} />
            <PeriodTimeline periods={visiblePeriods} onEdit={openEdit} />
          </>
        )}

        {openModal && (
          <PeriodModal
            onClose={closeModal}
            period={editingPeriod ?? undefined}
            onDelete={editingPeriod ? () => requestDelete(editingPeriod) : undefined}
          />
        )}

        {pendingDelete && (
          <ConfirmModal
            title="Delete period?"
            message={`Delete "${pendingDelete.name}" (P${pendingDelete.sequence}, ${pendingDelete.startTime}–${pendingDelete.endTime})? This cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            destructive
            onClose={() => setPendingDelete(null)}
            onConfirm={confirmDelete}
          />
        )}
      </section>
    </MainLayout>
  );
};

export default Period;