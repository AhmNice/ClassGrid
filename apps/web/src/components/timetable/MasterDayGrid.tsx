import { useMemo } from "react";
import type { IPeriod } from "../../interface/period.interface";
import type { DayOfWeek } from "../../interface/schedule.interface";
import type {
  ITimetableEntryResponse,
} from "../../interface/timetable-entry.interface";

interface ClassArmLite {
  id: string;
  name: string;
  className?: string;
}

interface MasterDayGridProps {
  classArms: ClassArmLite[];
  periods: IPeriod[];
  entries: ITimetableEntryResponse[];
}

const WEEK_DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};

const classArmLabel = (a: ClassArmLite) =>
  [a.className, a.name].filter(Boolean).join(" ");

/** Normalize a day string to uppercase in case the API is inconsistent. */
const normalizeDay = (day: string) => day.toUpperCase() as DayOfWeek;

const MasterDayGrid = ({ classArms, periods, entries }: MasterDayGridProps) => {
  const sortedArms = useMemo(
    () =>
      [...classArms].sort((a, b) =>
        classArmLabel(a).localeCompare(classArmLabel(b)),
      ),
    [classArms],
  );

  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => a.sequence - b.sequence),
    [periods],
  );

  const entryIndex = useMemo(() => {
    const map = new Map<string, ITimetableEntryResponse>();
    for (const e of entries) {
      map.set(`${normalizeDay(e.dayOfWeek)}:${e.classArmId}:${e.periodId}`, e);
    }
    return map;
  }, [entries]);

  const getEntry = (day: DayOfWeek, classArmId: string, periodId: string) =>
    entryIndex.get(`${day}:${classArmId}:${periodId}`);

  if (sortedArms.length === 0 || sortedPeriods.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant">
        No class arms or periods are set up yet.
      </p>
    );
  }

  return (
    <div className="overflow-auto rounded-sm border border-outline-variant/40 bg-surface">
      <table className="w-full min-w-max border-collapse text-sm">
        <colgroup>
          <col className="w-24" />
          <col className="w-28" />
          {sortedPeriods.map((p) => (
            <col key={p.id} className="w-24" />
          ))}
        </colgroup>

        <thead className="sticky top-0 z-20 bg-surface-container">
          <tr>
            <th className="sticky left-0 z-30 bg-surface-container px-space-md py-space-sm text-left text-xs font-medium text-on-surface-variant">
              Day
            </th>
            <th className="sticky left-24 z-30 bg-surface-container px-space-md py-space-sm text-left text-xs font-medium text-on-surface-variant">
              Class
            </th>
            {sortedPeriods.map((p) => (
              <th
                key={p.id}
                className="border-l border-outline-variant/40 px-space-sm py-space-sm text-center font-mono text-xs font-medium text-on-surface-variant"
              >
                <div className="flex flex-col">
                  <span>{p.kind === "BREAK" ? "Break" : `P${p.sequence}`}</span>
                  <span>
                    {p.startTime}-{p.endTime}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {WEEK_DAYS.map((day) => (
            <DayBlock
              key={day}
              day={day}
              classArms={sortedArms}
              periods={sortedPeriods}
              getEntry={getEntry}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ---------------------------- one day = N rows ---------------------------- */

interface DayBlockProps {
  day: DayOfWeek;
  classArms: ClassArmLite[];
  periods: IPeriod[];
  getEntry: (
    day: DayOfWeek,
    classArmId: string,
    periodId: string,
  ) => ITimetableEntryResponse | undefined;
}

const DayBlock = ({ day, classArms, periods, getEntry }: DayBlockProps) => {
  return (
    <>
      {classArms.map((arm, idx) => (
        <tr
          key={`${day}:${arm.id}`}
          className={[
            idx === 0 ? "border-t-2 border-outline-variant/60" : "",
            "hover:bg-surface-container-low/50",
          ].join(" ")}
        >
          {idx === 0 && (
            <th
              scope="rowgroup"
              rowSpan={classArms.length}
              className="sticky left-0 z-10 border-r border-outline-variant/40 bg-surface-container align-top px-space-md py-space-md text-left text-sm font-semibold text-on-surface"
            >
              {DAY_LABEL[day]}
            </th>
          )}

          <th
            scope="row"
            className="sticky left-24 z-10 border-r border-outline-variant/40 bg-surface-container align-middle px-space-md py-space-sm text-left text-xs font-medium text-on-surface-variant"
          >
            {classArmLabel(arm)}
          </th>

          {periods.map((period) => {
            const entry = getEntry(day, arm.id, period.id);
            return (
              <td
                key={period.id}
                className={[
                  "border-l border-outline-variant/40 align-middle px-space-sm py-space-sm text-center",
                  period.kind === "BREAK"
                    ? "bg-surface-container-high/50"
                    : "bg-surface",
                ].join(" ")}
              >
                {entry ? (
                  <span
                    className="block truncate text-xs font-medium text-on-surface"
                    title={getEntryLabel(entry)}
                  >
                    {getEntryLabel(entry)}
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="text-on-surface-variant/40"
                  >
                    ·
                  </span>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

/**
 * Best-effort label for an entry. Adjust to `ITimetableEntry`'s actual shape:
 *  - `entry.subjectName` (flat field)
 *  - `entry.subject.name` (nested)
 *  - `entry.subjectId` (raw id — not user-friendly)
 */
const getEntryLabel = (entry: ITimetableEntryResponse): string => {
  const anyEntry = entry as ITimetableEntryResponse;
  return anyEntry.assignment?.subject?.name ?? "—";
};

export default MasterDayGrid;

