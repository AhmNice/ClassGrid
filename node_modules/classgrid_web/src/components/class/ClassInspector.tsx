import { useId } from "react";
import type { IClassArm, Subject } from "../../interface/classArm.interface";

interface ClassInspectorProps {
  item: IClassArm | null;
}

const TRACK_LABELS: Record<string, string> = {
  SCIENCE: "Science",
  ART: "Art",
};

const STAGE_NAMES: Record<string, string> = {
  JSS: "Junior Secondary",
  SS: "Senior Secondary",
};

/** "SS 2" + "A" -> "SS 2A", but "SS 2" + "Blue" -> "SS 2 Blue". */
const armLabel = (item: IClassArm) =>
  item.name.length === 1
    ? `${item.className}`
    : `${item.className} `;

interface DetailProps {
  label: string;
  children: React.ReactNode;
}

const SmallSubjectCard = ({ item }: { item: Subject }) => (
  <div className="flex items-baseline justify-between gap-2 rounded-e-sm border-l-2 border-l-primary bg-primary-container/40 px-2 py-1">
    <p className="text-xs font-medium text-on-primary-container">{item.name}</p>
    <span className="font-mono text-[11px] text-on-primary-container/70">
      {item.teacher}
    </span>
  </div>
);

const Detail = ({ label, children }: DetailProps) => (
  <div className="flex flex-col py-space-sm">
    <dt className="text-xs text-on-surface-variant font-mono">{label}</dt>
    <dd className="text-left text-xs font-medium text-on-surface truncate">{children}</dd>
  </div>
);

const PILL = "rounded-sm px-space-sm py-space-xs font-mono text-xs";

const ClassInspector = ({ item }: ClassInspectorProps) => {
  const titleId = useId();

  const trackLabel = item?.track
    ? (TRACK_LABELS[item.track] ?? item.track)
    : null;
  const stageName = item
    ? (STAGE_NAMES[item.classStage] ?? item.classStage)
    : "";

  return (
    <section
      aria-labelledby={titleId}
      className="self-start p-space-md gap-2 flex flex-col overflow-hidden rounded-sm border border-outline-variant/40 bg-surface lg:sticky lg:top-20 max-h-min"
    >
      <header className="space-y-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          <span
            className={`${PILL} bg-primary font-bold uppercase tracking-wide text-on-primary`}
          >
            Inspector
          </span>
          {item && (
            <span
              className={`${PILL} font-medium ${
                item.isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {item.isActive ? "Active" : "Inactive"}
            </span>
          )}
        </div>

        <div aria-live="polite" className="space-y-space-xs">
          <h3
            id={titleId}
            className="font-heading text-base font-bold leading-tight text-primary"
          >
            {item
              ? `${armLabel(item)}${trackLabel ? ` — ${trackLabel} Stream` : ""}`
              : "No class arm selected"}
          </h3>
          <p className="font-mono text-xs text-on-surface-variant">
            {item
              ? `${stageName}${trackLabel ? ` (${trackLabel} track)` : ""}`
              : "Choose one from the list to see its details."}
          </p>
        </div>
      </header>

      {item && (
        <dl className="grid grid-cols-2 rounded-sm bg-surface-container p-space-md">
          <Detail label="Class level ID">{item.classLevelId}</Detail>
          <Detail label="Class Room">{item.room ?? "Unassigned"}</Detail>
          <Detail label="Track">{trackLabel ?? "—"}</Detail>
          <Detail label="Created">
            {new Date(item.createdAt).toLocaleDateString()}
          </Detail>
        </dl>
      )}

      {item?.subjects && item.subjects.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="font-heading font-bold text-primary">
            Subject Allocations
          </div>
          <ul className="flex flex-col gap-2">
            {item.subjects.map((sub, i) => (
              <li key={`${sub.name}-${i}`}>
                <SmallSubjectCard item={sub} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ClassInspector;