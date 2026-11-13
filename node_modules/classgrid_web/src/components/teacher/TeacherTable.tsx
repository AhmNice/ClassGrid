import { useId } from "react";
import type { ITeacher } from "../../interface/teacher.interface";

interface TableProps {
  title: string;
  data: ITeacher[];
  onSelect: (item: ITeacher) => void;
  selected: ITeacher | null;
}

/** Common honorifics → display label. Fallback to the raw value if unknown. */
const TITLE_LABELS: Record<string, string> = {
  Mr: "Mr.",
  Mrs: "Mrs.",
  Miss: "Miss",
  Dr: "Dr.",
  Prof: "Prof.",
  Engr: "Engr.",
};

const TH = "px-space-md py-space-sm text-left text-xs font-medium";
const TD = "px-space-md py-space-sm align-middle text-sm";

const fullName = (t: ITeacher) => {
  const prefix = t.title ? `${TITLE_LABELS[t.title] ?? t.title} ` : "";
  return `${prefix}${t.firstName} ${t.lastName}`;
};

const initials = (t: ITeacher) =>
  `${t.firstName.charAt(0)}${t.lastName.charAt(0)}`.toUpperCase();

const TeacherTable = ({ title, data, onSelect, selected }: TableProps) => {
  const headingId = useId();
  const count = `${data.length} ${data.length === 1 ? "teacher" : "teachers"}`;

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
        <table className="w-full min-w-192 border-collapse">
          <caption className="sr-only">{title}</caption>
          <thead className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/40">
              <th scope="col" className={TH}>Teacher</th>
              <th scope="col" className={TH}>Staff Code</th>
              <th scope="col" className={TH}>Email</th>
              <th scope="col" className={TH}>Contact</th>
              <th scope="col" className={TH}>Periods / Week</th>
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
                  colSpan={7}
                  className="px-space-md py-space-xl text-center text-sm text-on-surface-variant"
                >
                  No teachers yet.
                </td>
              </tr>
            ) : (
              data.map((teacher) => {
                const isSelected = selected?.id === teacher.id;
                return (
                  <tr
                    key={teacher.id}
                    onClick={() => onSelect(teacher)}
                    aria-selected={isSelected}
                    className={[
                      "cursor-pointer transition-colors motion-reduce:transition-none",
                      isSelected
                        ? "bg-primary-container/60 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                        : "hover:bg-surface-container-low focus-within:bg-surface-container-low",
                    ].join(" ")}
                  >
                    {/* Name — row header, with avatar initial */}
                    <th
                      scope="row"
                      className={[
                        TD,
                        "text-left font-medium",
                        isSelected
                          ? "text-on-primary-container"
                          : teacher.isActive
                            ? "text-on-surface"
                            : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-space-sm">
                        <span
                          aria-hidden="true"
                          className={[
                            "flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold",
                            isSelected
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-high text-on-surface-variant",
                          ].join(" ")}
                        >
                          {initials(teacher)}
                        </span>
                        <span className="truncate">{fullName(teacher)}</span>
                      </div>
                    </th>

                    <td className={TD}>
                      {teacher.staffCode ? (
                        <span
                          className={`font-mono text-xs ${
                            isSelected
                              ? "text-on-primary-container"
                              : "text-on-surface"
                          }`}
                        >
                          {teacher.staffCode}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">
                          —<span className="sr-only">No staff code</span>
                        </span>
                      )}
                    </td>

                    <td className={`${TD} max-w-64 truncate`}>
                      {teacher.email ? (
                        <a
                          href={`mailto:${teacher.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`truncate hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected
                              ? "text-on-primary-container"
                              : "text-on-surface"
                          }`}
                        >
                          {teacher.email}
                        </a>
                      ) : (
                        <span className="text-on-surface-variant">
                          —<span className="sr-only">No email</span>
                        </span>
                      )}
                    </td>

                    <td className={TD}>
                      {teacher.phone ? (
                        <a
                          href={`tel:${teacher.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`font-mono text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected
                              ? "text-on-primary-container"
                              : "text-on-surface"
                          }`}
                        >
                          {teacher.phone}
                        </a>
                      ) : (
                        <span className="text-on-surface-variant">
                          —<span className="sr-only">No phone</span>
                        </span>
                      )}
                    </td>

                    {/* Weekly workload — shows "n / max" if a max is set */}
                    <td className={TD}>
                      {teacher.maxPeriodsPerWeek == null ? (
                        <span className="text-on-surface-variant">
                          —<span className="sr-only">Not set</span>
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-xs font-medium ${
                            isSelected
                              ? "text-on-primary-container"
                              : "text-on-surface"
                          }`}
                        >
                          {teacher.maxPeriodsPerWeek}
                          <span className="text-on-surface-variant"> max</span>
                        </span>
                      )}
                    </td>

                    <td className={TD}>
                      <span
                        className={[
                          "rounded-full px-space-sm py-space-xs text-xs font-medium",
                          teacher.isActive
                            ? "bg-success-container text-on-success-container"
                            : "bg-surface-container text-on-surface-variant",
                        ].join(" ")}
                      >
                        {teacher.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(teacher);
                        }}
                        aria-label={`View ${fullName(teacher)}`}
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

export default TeacherTable;