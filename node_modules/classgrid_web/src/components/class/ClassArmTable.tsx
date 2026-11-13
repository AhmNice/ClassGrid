import { useId } from "react";
import type { IClassArm } from "../../interface/classArm.interface";

interface TableProps {
  title: string;
  data: IClassArm[];
  onSelect: (item: IClassArm) => void;
  selected: IClassArm | null;
}

const TRACK_LABELS: Record<string, string> = {
  SCIENCE: "Science",
  ART: "Art",
};

const TH = "px-space-md py-space-sm text-left text-xs font-medium";
const TD = "px-space-md py-space-sm align-middle text-sm";

const ClassArmTable = ({ title, data, onSelect, selected }: TableProps) => {
  const headingId = useId();
  const count = `${data.length} ${data.length === 1 ? "class arm" : "class arms"}`;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-sm border border-outline-variant/40 bg-surface"
    >
      <header className="flex items-center gap-space-sm border-b border-outline-variant/40 bg-surface-container px-space-md py-space-sm">
        <h3 id={headingId} className="font-heading text-sm font-bold text-primary">
          {title}
        </h3>
        <span className="rounded-full bg-surface-container-high px-space-sm py-space-xs font-mono text-xs font-medium text-on-surface-variant">
          {count}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-144 border-collapse">
          <caption className="sr-only">{title}</caption>
          <thead className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/40">
              <th scope="col" className={TH}>Arm</th>
              <th scope="col" className={TH}>Class</th>
              <th scope="col" className={TH}>Stage</th>
              <th scope="col" className={TH}>Track</th>
              <th scope="col" className={TH}>Status</th>
              <th scope="col" className={`${TH} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-outline-variant/40">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-space-md py-space-xl text-center text-sm text-on-surface-variant"
                >
                  No class arms yet.
                </td>
              </tr>
            ) : (
              data.map((arm) => {
                const isSelected = selected?.id === arm.id;
                return (
                  <tr
                    key={arm.id}
                    onClick={() => onSelect(arm)}
                    aria-selected={isSelected}
                    className={[
                      "cursor-pointer transition-colors motion-reduce:transition-none",
                      // Selected: solid tint + left accent bar.
                      isSelected
                        ? "bg-primary-container/60 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                        : "hover:bg-surface-container-low focus-within:bg-surface-container-low",
                    ].join(" ")}
                  >
                    <th
                      scope="row"
                      className={[
                        TD,
                        "text-left font-medium",
                        isSelected
                          ? "text-on-primary-container"
                          : arm.isActive
                            ? "text-on-surface"
                            : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      {arm.name}
                    </th>
                    <td
                      className={`${TD} ${isSelected ? "text-on-primary-container" : "text-on-surface"}`}
                    >
                      {arm.className}
                    </td>
                    <td className={TD}>
                      <span
                        className={`font-mono text-xs font-medium ${
                          isSelected
                            ? "text-on-primary-container"
                            : "text-on-surface"
                        }`}
                      >
                        {arm.classStage}
                      </span>
                    </td>
                    <td
                      className={`${TD} ${isSelected ? "text-on-primary-container" : "text-on-surface"}`}
                    >
                      {arm.track ? (
                        (TRACK_LABELS[arm.track] ?? arm.track)
                      ) : (
                        <span className="text-on-surface-variant">
                          —<span className="sr-only">No track</span>
                        </span>
                      )}
                    </td>
                    <td className={TD}>
                      <span
                        className={[
                          "rounded-full px-space-sm py-space-xs text-xs font-medium",
                          arm.isActive
                            ? "bg-success-container text-on-success-container"
                            : "bg-surface-container text-on-surface-variant",
                        ].join(" ")}
                      >
                        {arm.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(arm);
                        }}
                        aria-label={`View ${arm.className} ${arm.name}`}
                        aria-pressed={isSelected}
                        className="cursor-pointer rounded-sm border border-outline-variant px-space-md py-space-xs text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none"
                      >
                        {isSelected ? "Selected" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ClassArmTable;