import { useEffect, useMemo, useState } from "react";
import { Calendar, Plus, Star, UserX, X } from "lucide-react";
import MainLayout from "../../layout/MainLayout";
import TitleCard from "../../components/TitleCard";
import ConfirmModal from "../../components/modal/ConfirmModal";
import TeacherAvailabilityModal from "../../components/modal/TeacherAvailabilityModal";
import { useTeacherStore } from "../../store/teacher.store";
import { usePeriodStore } from "../../store/period.store";
import { useTeacherAvailabilityStore } from "../../store/teacher-availability.store";
import type {
  AvailabilityStatus,
  DayOfWeek,
  ITeacherAvailability,
  ITeacherAvailabilityCreate,
} from "../../interface/teacher-availability.interface";
import type { IPeriod } from "../../interface/period.interface";
import SearchableSelect from "../../components/form/SearchableSelect";

/* -------------------------------------------------------------------------- */
/*                              Skeleton helpers                              */
/* -------------------------------------------------------------------------- */

const Skeleton = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`block rounded-sm bg-surface-container-high motion-safe:animate-pulse ${className}`}
  />
);

const BootSkeleton = () => (
  <div className="flex flex-col gap-space-md">
    <div className="flex flex-col gap-1">
      <Skeleton className="h-2.5 w-14" />
      <Skeleton className="h-8 w-full" />
    </div>
    <div className="rounded-sm border border-outline-variant/40 bg-surface p-4">
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

const MobileAvailabilitySkeleton = () => (
  <div className="flex flex-col gap-space-md md:hidden">
    <div className="flex gap-1.5 border-b border-outline-variant/30 pb-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex shrink-0 items-center gap-2 px-4 py-2.5">
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between px-1">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-28" />
    </div>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="flex items-center justify-between gap-space-sm rounded-sm border border-outline-variant/40 bg-surface p-3.5"
      >
        <div className="flex flex-1 items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
        <Skeleton className="h-7 w-14 shrink-0" />
      </div>
    ))}
  </div>
);

const TableSkeleton = ({ columns }: { columns: number }) => (
  <div className="overflow-hidden rounded-sm border border-outline-variant/40 bg-surface">
    <table className="w-full min-w-max border-collapse">
      <thead className="bg-surface-container">
        <tr>
          <th className="border-r border-outline-variant/40 px-space-md py-space-sm text-left">
            <Skeleton className="h-3 w-10" />
          </th>
          {Array.from({ length: columns }).map((_, i) => (
            <th
              key={i}
              className="border-l border-outline-variant/40 px-space-sm py-space-sm"
            >
              <div className="flex justify-center">
                <Skeleton className="h-3 w-6" />
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[0, 1, 2, 3, 4].map((row) => (
          <tr key={row} className="border-t border-outline-variant/40">
            <th className="border-r border-outline-variant/40 bg-surface-container px-space-md py-space-sm text-left">
              <Skeleton className="h-3 w-14" />
            </th>
            {Array.from({ length: columns }).map((_, col) => (
              <td
                key={col}
                className="border-l border-outline-variant/40 p-0 align-middle"
              >
                <div className="flex h-16 items-center justify-center">
                  <Skeleton className="h-3 w-8" />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const DAYS: { value: DayOfWeek; label: string; short: string; schedule: string }[] = [
  { value: "MONDAY", label: "Monday", short: "Mon", schedule: "WEEKDAY_SCHEDULE" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue", schedule: "WEEKDAY_SCHEDULE" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed", schedule: "WEEKDAY_SCHEDULE" },
  { value: "THURSDAY", label: "Thursday", short: "Thu", schedule: "WEEKDAY_SCHEDULE" },
  { value: "FRIDAY", label: "Friday", short: "Fri", schedule: "FRIDAY_SCHEDULE" },
];

const WEEKDAY_DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
const FRIDAY_DAYS: DayOfWeek[] = ["FRIDAY"];

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  {
    bg: string;
    border: string;
    text: string;
    label: string;
    icon: React.ReactNode;
    symbol: string;
  }
> = {
  UNAVAILABLE: {
    bg: "bg-error-container/40",
    border: "border-error/30",
    text: "text-on-error-container",
    label: "Unavailable",
    icon: <X size={14} className="text-error" />,
    symbol: "✕",
  },
  PREFERRED: {
    bg: "bg-info-container/40",
    border: "border-info/30",
    text: "text-on-info-container",
    label: "Preferred",
    icon: <Star size={14} className="text-info fill-info/20" />,
    symbol: "★",
  },
};

const teacherName = (t: {
  title: string | null;
  firstName: string;
  lastName: string;
}) => [t.title, t.firstName, t.lastName].filter(Boolean).join(" ");

type ModalTarget = {
  day: DayOfWeek;
  periodId: string;
} | null;

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

const TeacherAvailability = () => {
  const teachers = useTeacherStore((s) => s.teachers);
  const getTeachers = useTeacherStore((s) => s.getTeachers);
  const periods = usePeriodStore((s) => s.periods);
  const getPeriods = usePeriodStore((s) => s.getPeriods);

  const availabilities = useTeacherAvailabilityStore((s) => s.availabilities);
  const loading = useTeacherAvailabilityStore((s) => s.loading);
  const error = useTeacherAvailabilityStore((s) => s.error);
  const getAvailabilities = useTeacherAvailabilityStore((s) => s.getAvailabilities);
  const createAvailability = useTeacherAvailabilityStore((s) => s.createAvailability);
  const deleteAvailability = useTeacherAvailabilityStore((s) => s.deleteAvailability);
  const resetErrorState = useTeacherAvailabilityStore((s) => s.resetErrorState);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("MONDAY");
  const [openModal, setOpenModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<ModalTarget>(null);
  const [pendingDelete, setPendingDelete] = useState<ITeacherAvailability | null>(null);

  const [loaded, setLoaded] = useState({
    teachers: teachers.length > 0,
    periods: periods.length > 0,
  });

  useEffect(() => {
    let cancelled = false;
    const run = async (
      key: keyof typeof loaded,
      isLoaded: () => boolean,
      fetch: () => Promise<unknown>,
    ) => {
      if (isLoaded()) {
        if (!cancelled) setLoaded((l) => ({ ...l, [key]: true }));
        return;
      }
      try {
        await fetch();
      } finally {
        if (!cancelled) setLoaded((l) => ({ ...l, [key]: true }));
      }
    };
    run("teachers", () => teachers.length > 0, getTeachers);
    run("periods", () => periods.length > 0, getPeriods);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTeacherId) return;
    getAvailabilities(selectedTeacherId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacherId]);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) ?? null;

  /* ----------------------- group periods by schedule ----------------------- */
  // Each period carries `periodScheduleName` — either WEEKDAY_SCHEDULE or
  // FRIDAY_SCHEDULE. Split them so every day row uses the right columns.
  const { weekdayPeriods, fridayPeriods, periodsByDay } = useMemo(() => {
    const weekday = [...periods]
      .filter((p) => p.periodScheduleName === "WEEKDAY_SCHEDULE")
      .sort((a, b) => a.sequence - b.sequence);
    const friday = [...periods]
      .filter((p) => p.periodScheduleName === "FRIDAY_SCHEDULE")
      .sort((a, b) => a.sequence - b.sequence);

    const byDay: Record<DayOfWeek, IPeriod[]> = {
      MONDAY: weekday,
      TUESDAY: weekday,
      WEDNESDAY: weekday,
      THURSDAY: weekday,
      FRIDAY: friday,
    };
    return { weekdayPeriods: weekday, fridayPeriods: friday, periodsByDay: byDay };
  }, [periods]);

  /* --------------------------- availability index -------------------------- */
  const availabilityIndex = useMemo(() => {
    const map = new Map<string, ITeacherAvailability>();
    for (const a of availabilities) {
      map.set(`${a.dayOfWeek}:${a.periodId}`, a);
    }
    return map;
  }, [availabilities]);

  const existingKeys = useMemo(
    () => new Set(availabilityIndex.keys()),
    [availabilityIndex],
  );

  const periodById = useMemo(() => {
    const m = new Map<string, IPeriod>();
    for (const p of periods) m.set(p.id, p);
    return m;
  }, [periods]);

  const dayLabel = (day: DayOfWeek) =>
    DAYS.find((d) => d.value === day)?.label ?? day;

  /* ------------------------------ handlers -------------------------------- */
  const handleCreate = async (
    data: ITeacherAvailabilityCreate,
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await createAvailability(data);
    if (res.success) {
      setOpenModal(false);
      setModalTarget(null);
    }
    return res;
  };

  const handleCellClick = (day: DayOfWeek, periodId: string) => {
    if (!selectedTeacherId) return;
    const existing = availabilityIndex.get(`${day}:${periodId}`);
    if (existing) {
      setPendingDelete(existing);
      return;
    }
    setModalTarget({ day, periodId });
    setOpenModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !selectedTeacherId) return;
    await deleteAvailability(pendingDelete.id, selectedTeacherId);
    setPendingDelete(null);
  };

  const openAddFromHeader = () => {
    const dayPeriods = periodsByDay[selectedDay];
    setModalTarget({ day: selectedDay, periodId: dayPeriods[0]?.id ?? "" });
    setOpenModal(true);
  };

  const pendingDeletePeriod = pendingDelete
    ? periodById.get(pendingDelete.periodId)
    : null;
  const pendingDeleteLabel = pendingDelete
    ? `${dayLabel(pendingDelete.dayOfWeek)}${
        pendingDeletePeriod ? ` · P${pendingDeletePeriod.sequence}` : ""
      } (${STATUS_CONFIG[pendingDelete.status].label.toLowerCase()})`
    : "";

  const exceptionsPerDay = useMemo(() => {
    const counts: Record<DayOfWeek, number> = {
      MONDAY: 0,
      TUESDAY: 0,
      WEDNESDAY: 0,
      THURSDAY: 0,
      FRIDAY: 0,
    };
    for (const a of availabilities) {
      if (counts[a.dayOfWeek] !== undefined) counts[a.dayOfWeek]++;
    }
    return counts;
  }, [availabilities]);

  const bootLoading = !loaded.teachers || !loaded.periods;
  const teacherSelected = !!selectedTeacherId;
  const availabilityLoading = teacherSelected && loading;
  const availabilityReady = teacherSelected && !loading && !bootLoading;

  const noSchedulesConfigured =
    !bootLoading && weekdayPeriods.length === 0 && fridayPeriods.length === 0;

  /* -------------------------------- render -------------------------------- */
  return (
    <MainLayout>
      <section className="flex flex-col gap-space-lg">
        <TitleCard
          title="Teacher Availability"
          description="Mark periods a teacher is unavailable or prefers. The timetable generator uses this to avoid clashes."
          showActionButton={availabilityReady}
          actionLabel="Add Exception"
          onButtonClick={openAddFromHeader}
          secondaryAction={null}
        />

        {bootLoading ? (
          <BootSkeleton />
        ) : noSchedulesConfigured ? (
          <p
            role="status"
            className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant"
          >
            No period schedules are set up yet. Create a weekday and/or Friday
            schedule before setting availability.
          </p>
        ) : (
          <>
            <SearchableSelect
              label="Teacher"
              placeholder="Select a teacher…"
              searchPlaceholder="Search by name or staff code…"
              value={selectedTeacherId}
              onChange={setSelectedTeacherId}
              emptyMessage="No teachers exist yet."
              options={teachers.map((t) => ({
                value: t.id,
                label: teacherName(t),
                hint: t.staffCode ?? undefined,
              }))}
            />

            {!selectedTeacherId ? (
              <p className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant">
                Pick a teacher to view and edit their schedule preferences.
              </p>
            ) : availabilityLoading ? (
              <>
                <div className="flex flex-wrap gap-x-space-md gap-y-space-xs text-xs text-on-surface-variant">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <MobileAvailabilitySkeleton />
                <div className="hidden flex-col gap-space-md md:flex">
                  <TableSkeleton columns={weekdayPeriods.length || 8} />
                  <TableSkeleton columns={fridayPeriods.length || 6} />
                </div>
              </>
            ) : error ? (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-space-md rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
              >
                <p>{error}</p>
                <div className="flex gap-space-sm">
                  <button
                    type="button"
                    onClick={() => {
                      resetErrorState();
                      if (selectedTeacherId) getAvailabilities(selectedTeacherId);
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
            ) : (
              <div className="flex flex-col gap-space-md">
                {/* Legend */}
                <div className="flex flex-wrap gap-x-space-md gap-y-space-xs text-xs text-on-surface-variant">
                  {(Object.keys(STATUS_CONFIG) as AvailabilityStatus[]).map((s) => (
                    <span key={s} className="flex items-center gap-space-xs">
                      <span
                        className={`inline-block h-3 w-3 rounded-sm border ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].border}`}
                      />
                      {STATUS_CONFIG[s].label}
                    </span>
                  ))}
                  <span className="flex items-center gap-space-xs">
                    <span className="inline-block h-3 w-3 rounded-sm border border-dashed border-outline-variant/60" />
                    Available (default)
                  </span>
                </div>

                {/* ========================= Mobile (tabs) ========================= */}
                <div className="flex flex-col gap-space-md md:hidden">
                  <div className="flex gap-1.5 overflow-x-auto border-b border-outline-variant/30 pb-1">
                    {DAYS.map((d) => {
                      const count = exceptionsPerDay[d.value];
                      const isActive = selectedDay === d.value;
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setSelectedDay(d.value)}
                          aria-pressed={isActive}
                          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-sm px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${
                            isActive
                              ? "bg-surface border-primary text-primary shadow-xs"
                              : "bg-surface-container/50 border-transparent text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          <span>{d.short}</span>
                          {count > 0 && (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                isActive
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="flex items-center gap-2 text-sm font-medium text-on-surface">
                        <Calendar size={15} className="text-primary" />
                        {dayLabel(selectedDay)} Schedule
                      </h3>
                      <span className="text-[11px] font-mono text-on-surface-variant/70">
                        {DAYS.find((d) => d.value === selectedDay)?.schedule}
                      </span>
                    </div>

                    {periodsByDay[selectedDay].length === 0 ? (
                      <p className="rounded-sm border border-dashed border-outline-variant p-space-md text-center text-xs text-on-surface-variant">
                        No periods configured for this day.
                      </p>
                    ) : (
                      periodsByDay[selectedDay].map((period) => {
                        const key = `${selectedDay}:${period.id}`;
                        const availability = availabilityIndex.get(key);
                        const isBreak = period.kind === "BREAK";
                        const config = availability
                          ? STATUS_CONFIG[availability.status]
                          : null;

                        if (isBreak) {
                          return (
                            <div
                              key={period.id}
                              className="flex items-center justify-between rounded-sm border border-outline-variant/20 bg-surface-container-high/30 px-4 py-3 text-xs text-on-surface-variant/60"
                            >
                              <span className="font-mono font-medium uppercase tracking-wider">
                                Break Period
                              </span>
                              <span className="text-[11px] italic">
                                No classes scheduled
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={period.id}
                            className={`flex items-center justify-between gap-space-sm rounded-sm border p-3.5 transition-all ${
                              config
                                ? `${config.bg} ${config.border}`
                                : "bg-surface border-outline-variant/40"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleCellClick(selectedDay, period.id)}
                              className="flex flex-1 items-center gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                              aria-label={
                                availability
                                  ? `${dayLabel(selectedDay)} P${period.sequence}: ${config!.label}${availability.reason ? `, ${availability.reason}` : ""}. Tap to remove.`
                                  : `${dayLabel(selectedDay)} P${period.sequence}: available. Tap to add exception.`
                              }
                            >
                              <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-sm border border-outline-variant/30 bg-surface-container font-mono text-xs font-semibold text-on-surface">
                                P{period.sequence}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-on-surface">
                                  Period {period.sequence}
                                </div>
                                {config ? (
                                  <div
                                    className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${config.text}`}
                                  >
                                    {config.icon}
                                    <span>{config.label}</span>
                                    {availability?.reason && (
                                      <span className="truncate font-normal text-on-surface-variant">
                                        — {availability.reason}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-0.5 text-[11px] text-on-surface-variant/70">
                                    Available (default)
                                  </div>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCellClick(selectedDay, period.id);
                              }}
                              className={`shrink-0 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                                config
                                  ? "border border-outline-variant/40 bg-surface text-on-surface hover:border-error hover:bg-error hover:text-on-error"
                                  : "bg-primary/10 text-primary hover:bg-primary hover:text-on-primary"
                              }`}
                            >
                              {config ? "Remove" : "+ Set"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* ======================== Desktop (two tables) ======================== */}
                <div className="hidden flex-col gap-space-lg md:flex">
                  <ScheduleTable
                    title="Weekday Schedule"
                    subtitle="Monday – Thursday"
                    days={WEEKDAY_DAYS}
                    periods={weekdayPeriods}
                    availabilityIndex={availabilityIndex}
                    onCellClick={handleCellClick}
                  />
                  <ScheduleTable
                    title="Friday Schedule"
                    subtitle="Friday"
                    days={FRIDAY_DAYS}
                    periods={fridayPeriods}
                    availabilityIndex={availabilityIndex}
                    onCellClick={handleCellClick}
                  />
                </div>

                {availabilities.length === 0 && (
                  <p className="flex items-center justify-center gap-space-xs rounded-sm border border-dashed border-outline-variant p-space-md text-center text-xs text-on-surface-variant">
                    <UserX size={14} aria-hidden="true" />
                    No exceptions set — this teacher is assumed available for all
                    periods across all days.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {openModal && selectedTeacher && (
          <TeacherAvailabilityModal
            teacherId={selectedTeacher.id}
            teacherName={teacherName(selectedTeacher)}
            periods={periodsByDay[modalTarget?.day ?? selectedDay] ?? []}
            existingKeys={existingKeys}
            initialDay={modalTarget?.day}
            initialPeriodId={modalTarget?.periodId}
            onClose={() => {
              setOpenModal(false);
              setModalTarget(null);
            }}
            onSubmit={handleCreate}
          />
        )}

        {pendingDelete && (
          <ConfirmModal
            title="Remove availability?"
            message={`Clear ${pendingDeleteLabel} for ${
              selectedTeacher ? teacherName(selectedTeacher) : "this teacher"
            }? The teacher will be treated as available for this slot.`}
            confirmLabel="Remove"
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

/* -------------------------------------------------------------------------- */
/*                        Reusable desktop schedule table                     */
/* -------------------------------------------------------------------------- */

interface ScheduleTableProps {
  title: string;
  subtitle: string;
  days: DayOfWeek[];
  periods: IPeriod[];
  availabilityIndex: Map<string, ITeacherAvailability>;
  onCellClick: (day: DayOfWeek, periodId: string) => void;
}

const ScheduleTable = ({
  title,
  subtitle,
  days,
  periods,
  availabilityIndex,
  onCellClick,
}: ScheduleTableProps) => {
  if (periods.length === 0) {
    return (
      <section className="space-y-space-sm">
        <ScheduleHeader title={title} subtitle={subtitle} />
        <p className="rounded-sm border border-dashed border-outline-variant p-space-md text-center text-xs text-on-surface-variant">
          No {title.toLowerCase()} periods configured.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-space-sm">
      <ScheduleHeader title={title} subtitle={subtitle} />

      <div className="overflow-auto rounded-sm border border-outline-variant/40 bg-surface">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-container">
            <tr>
              <th className="sticky left-0 z-20 border-r border-outline-variant/40 bg-surface-container px-space-md py-space-sm text-left text-xs font-medium text-on-surface-variant">
                Day
              </th>
              {periods.map((p) => (
                <th
                  key={p.id}
                  className="border-l border-outline-variant/40 px-space-sm py-space-sm text-center font-mono text-xs font-medium text-on-surface-variant"
                >
                  {p.kind === "BREAK" ? "Break" : `P${p.sequence}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr
                key={day}
                className="border-t border-outline-variant/40"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-outline-variant/40 bg-surface-container px-space-md py-space-sm text-left text-xs font-medium text-on-surface-variant"
                >
                  {DAYS.find((d) => d.value === day)?.label ?? day}
                </th>
                {periods.map((period) => {
                  const key = `${day}:${period.id}`;
                  const availability = availabilityIndex.get(key);
                  const isBreak = period.kind === "BREAK";
                  const config = availability
                    ? STATUS_CONFIG[availability.status]
                    : null;

                  return (
                    <td
                      key={period.id}
                      className={[
                        "border-l border-outline-variant/40 p-0 text-center align-middle",
                        isBreak ? "bg-surface-container-high/40" : "",
                      ].join(" ")}
                    >
                      {isBreak ? (
                        <span className="block py-space-sm text-xs text-on-surface-variant">
                          BREAK
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onCellClick(day, period.id)}
                          className={[
                            "flex h-16 w-full cursor-pointer items-center justify-center text-xs transition-colors motion-reduce:transition-none",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                            config
                              ? `${config.bg} ${config.border} border font-medium ${config.text}`
                              : "bg-surface text-on-surface-variant hover:bg-surface-container-low",
                          ].join(" ")}
                          aria-label={
                            availability
                              ? `${DAY_LABEL(day)} P${period.sequence}: ${config!.label}. Click to remove.`
                              : `${DAY_LABEL(day)} P${period.sequence}: not set. Click to add.`
                          }
                          title={
                            availability?.reason
                              ? `${config!.label} — ${availability.reason}`
                              : config?.label ?? "Click to add"
                          }
                        >
                          {config ? (
                            <span className="flex flex-col items-center gap-0.5">
                              <span aria-hidden="true" className="text-base">
                                {config.symbol}
                              </span>
                              <span className="text-[10px]">{config.label}</span>
                            </span>
                          ) : (
                            <Plus
                              size={14}
                              className="opacity-50"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ScheduleHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-baseline justify-between gap-space-sm">
    <h3 className="font-heading text-sm font-semibold text-on-surface">
      {title}
    </h3>
    <span className="font-mono text-[11px] text-on-surface-variant/70">
      {subtitle}
    </span>
  </div>
);

const DAY_LABEL = (day: DayOfWeek) =>
  DAYS.find((d) => d.value === day)?.label ?? day;

export default TeacherAvailability;