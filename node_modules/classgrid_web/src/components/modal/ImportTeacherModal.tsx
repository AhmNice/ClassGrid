import {
  AlertTriangle,
  CircleCheck,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ITeacherCreate } from "../../interface/teacher.interface";
import { downloadCsv, parseCsv } from "../../utils/csv";
import {
  validateTeacherRow,
  type RawTeacherRow,
} from "../../utils/Teacher.validation";

/* ---------------------------------- types --------------------------------- */

/** What the server reports back after trying to create the teachers. */
export interface TeacherImportResult {
  created: number;
  /** `index` is the position in the list that was sent. */
  failed: { index: number; message: string }[];
}

interface ImportTeachersModalProps {
  onClose: () => void;
  /** Sends the valid teachers to the server. Throw an Error if it can't. */
  onImport: (teachers: ITeacherCreate[]) => Promise<TeacherImportResult>;
}

type Step = "upload" | "review" | "importing" | "done";

interface ImportRow {
  /** The row number in the spreadsheet (the heading row is row 1). */
  line: number;
  name: string;
  email: string;
  staffCode: string;
  teacher: ITeacherCreate | null;
  errors: string[];
}

interface FailedRow {
  line: number;
  name: string;
  message: string;
}

/* --------------------------------- columns -------------------------------- */

type ColumnKey = keyof RawTeacherRow;

const COLUMNS: {
  key: ColumnKey;
  label: string;
  required: boolean;
  /** Other headings we accept for the same column, lowercase, letters only. */
  aliases: string[];
}[] = [
  { key: "title", label: "Title", required: true, aliases: ["title"] },
  {
    key: "firstName",
    label: "First Name",
    required: true,
    aliases: ["firstname", "first", "givenname"],
  },
  {
    key: "lastName",
    label: "Last Name",
    required: true,
    aliases: ["lastname", "last", "surname", "familyname"],
  },
  {
    key: "email",
    label: "Email",
    required: true,
    aliases: ["email", "emailaddress"],
  },
  {
    key: "phone",
    label: "Phone",
    required: true,
    aliases: ["phone", "phonenumber", "mobile", "telephone"],
  },
  {
    key: "staffCode",
    label: "Staff Code",
    required: true,
    aliases: ["staffcode", "staffid", "staffnumber", "code"],
  },
  {
    key: "maxPeriodsPerDay",
    label: "Max Periods Per Day",
    required: false,
    aliases: ["maxperiodsperday", "periodsperday", "maxperday"],
  },
  {
    key: "maxPeriodsPerWeek",
    label: "Max Periods Per Week",
    required: false,
    aliases: ["maxperiodsperweek", "periodsperweek", "maxperweek"],
  },
  {
    key: "maxConsecutivePeriods",
    label: "Max Consecutive Periods",
    required: false,
    aliases: ["maxconsecutiveperiods", "consecutiveperiods", "inarow"],
  },
  {
    key: "isActive",
    label: "Active",
    required: false,
    aliases: ["active", "isactive", "status"],
  },
];

const TEMPLATE_ROWS = [
  COLUMNS.map((c) => c.label),
  ["Mr", "Chinedu", "Okafor", "chinedu.okafor@school.com", "08030000000", "TCH-001", "6", "30", "3", "Yes"],
  ["Mrs", "Amina", "Bello", "amina.bello@school.com", "08030000001", "TCH-002", "", "", "", "Yes"],
];

const MAX_ROWS = 500;
const MAX_FILE_BYTES = 1024 * 1024;

const normalizeHeading = (heading: string) =>
  heading.toLowerCase().replace(/[^a-z0-9]/g, "");

/* ----------------------------- reading the file --------------------------- */

/** Turns the rows of the file into checked rows, or explains what's wrong. */
const buildRows = (grid: string[][]): { rows: ImportRow[] } | { error: string } => {
  const [heading, ...data] = grid;
  if (!heading) return { error: "The file is empty." };

  // Which column of the file holds which field.
  const position = new Map<ColumnKey, number>();
  heading.forEach((text, index) => {
    const column = COLUMNS.find((c) => c.aliases.includes(normalizeHeading(text)));
    if (column && !position.has(column.key)) position.set(column.key, index);
  });

  const missing = COLUMNS.filter((c) => c.required && !position.has(c.key)).map(
    (c) => c.label,
  );
  if (missing.length > 0) {
    return { error: `The file is missing these columns: ${missing.join(", ")}.` };
  }
  if (data.length === 0) {
    return { error: "The file has headings but no teachers in it." };
  }
  if (data.length > MAX_ROWS) {
    return {
      error: `This file has ${data.length} rows. Import up to ${MAX_ROWS} at a time.`,
    };
  }

  const rows: ImportRow[] = data.map((cells, i) => {
    const cell = (key: ColumnKey) => {
      const index = position.get(key);
      return index === undefined ? "" : (cells[index] ?? "");
    };

    const raw = Object.fromEntries(
      COLUMNS.map((c) => [c.key, cell(c.key)]),
    ) as unknown as RawTeacherRow;

    const { teacher, errors } = validateTeacherRow(raw);
    return {
      line: i + 2,
      name: [raw.title, raw.firstName, raw.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" "),
      email: raw.email.trim(),
      staffCode: raw.staffCode.trim(),
      teacher,
      errors,
    };
  });

  // The same email or staff code twice in one file: keep the first, flag the rest.
  const emails = new Map<string, number>();
  const codes = new Map<string, number>();
  for (const row of rows) {
    const email = row.email.toLowerCase();
    const code = row.staffCode.toLowerCase();

    if (email) {
      const first = emails.get(email);
      if (first !== undefined) {
        row.errors.push(`Same email as row ${first}`);
        row.teacher = null;
      } else {
        emails.set(email, row.line);
      }
    }
    if (code) {
      const first = codes.get(code);
      if (first !== undefined) {
        row.errors.push(`Same staff code as row ${first}`);
        row.teacher = null;
      } else {
        codes.set(code, row.line);
      }
    }
  }

  return { rows };
};

/* --------------------------------- helpers -------------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const SECONDARY_BUTTON = cx(
  "inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm border border-outline-variant px-space-lg py-space-sm text-sm font-medium text-on-surface",
  "transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
  FOCUS_RING,
);

const PRIMARY_BUTTON = cx(
  "inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary",
  "transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
  FOCUS_RING,
);

const TH = "px-space-md py-space-sm text-left text-xs font-medium";
const TD = "px-space-md py-space-sm align-top text-sm";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

/* ---------------------------------- modal --------------------------------- */

const ImportTeachersModal = ({ onClose, onImport }: ImportTeachersModalProps) => {
  const uid = useId();
  const titleId = `${uid}-title`;
  const fileId = `${uid}-file`;

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [created, setCreated] = useState(0);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);

  const ready = rows.filter((row) => row.teacher);
  const problems = rows.length - ready.length;
  const isImporting = step === "importing";

  // Lock page scroll and restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  // Move focus to the heading on each step so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const close = () => {
    if (!isImporting) onClose();
  };

  // Escape closes; Tab stays inside the dialog.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])",
      ) ?? [],
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* ------------------------------- choosing a file ------------------------- */

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileError(null);

    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setFileError(
        "That isn’t a CSV file. In Excel, choose File > Save As > CSV, then upload that.",
      );
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("That file is larger than 1 MB.");
      return;
    }

    try {
      const result = buildRows(parseCsv(await file.text()));
      if ("error" in result) {
        setFileError(result.error);
        return;
      }
      setFileName(file.name);
      setRows(result.rows);
      setOnlyProblems(false);
      setStep("review");
    } catch {
      setFileError("We couldn’t read that file. Check that it’s a valid CSV.");
    }
  };

  const startOver = () => {
    setRows([]);
    setFileName("");
    setFileError(null);
    setImportError(null);
    setStep("upload");
  };

  /* -------------------------------- importing ------------------------------ */

  const runImport = async () => {
    setImportError(null);
    setStep("importing");

    try {
      const result = await onImport(ready.map((row) => row.teacher!));

      setCreated(result.created);
      setFailedRows(
        result.failed.map(({ index, message }) => ({
          line: ready[index]?.line ?? 0,
          name: ready[index]?.name ?? "Unknown row",
          message,
        })),
      );
      setStep("done");
    } catch (err) {
      // Back to the review step so nothing the user did is lost.
      setImportError(
        err instanceof Error ? err.message : "The import failed. Try again.",
      );
      setStep("review");
    }
  };

  /* ---------------------------------- view ---------------------------------- */

  const visibleRows = onlyProblems ? rows.filter((row) => !row.teacher) : rows;

  const subtitle =
    step === "upload"
      ? "Add many teachers at once from a spreadsheet."
      : step === "done"
        ? "Import finished."
        : fileName;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay-bg) p-space-lg"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-surface shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-space-md border-b border-outline-variant/30 p-space-lg">
          <div className="min-w-0">
            <h2
              id={titleId}
              ref={headingRef}
              tabIndex={-1}
              className="font-heading text-lg font-semibold text-on-surface outline-none"
            >
              Import teachers
            </h2>
            <p className="mt-space-xs truncate text-sm text-on-surface-variant">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={isImporting}
            aria-label="Close"
            className={cx(
              "grid h-8 w-8 shrink-0 place-items-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-60 motion-reduce:transition-none",
              FOCUS_RING,
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-space-lg" aria-live="polite">
          {/* ----- Step 1: choose a file ----- */}
          {step === "upload" && (
            <div className="space-y-space-lg">
              {fileError && (
                <p
                  role="alert"
                  className="flex items-start gap-space-sm rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
                >
                  <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {fileError}
                </p>
              )}

              <label
                htmlFor={fileId}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                className={cx(
                  "flex cursor-pointer flex-col items-center gap-space-sm rounded-sm border-2 border-dashed p-space-xl text-center transition-colors motion-reduce:transition-none",
                  "focus-within:ring-2 focus-within:ring-ring",
                  dragging
                    ? "border-primary bg-primary-container/40"
                    : "border-outline-variant hover:bg-surface-container-low",
                )}
              >
                <input
                  id={fileId}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    // Lets the same file be chosen again after a fix.
                    e.target.value = "";
                  }}
                />
                <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-container text-on-surface-variant">
                  <Upload size={22} aria-hidden="true" />
                </span>
                <span className="text-sm text-on-surface">
                  Drop a CSV file here, or{" "}
                  <span className="font-medium text-primary underline">browse</span>
                </span>
                <span className="text-xs text-on-surface-variant">
                  CSV only, up to 1 MB and {MAX_ROWS} teachers
                </span>
              </label>

              <div className="space-y-space-sm rounded-sm bg-surface-container p-space-md">
                <div className="flex flex-wrap items-center justify-between gap-space-sm">
                  <p className="flex items-center gap-space-sm text-sm font-medium text-on-surface">
                    <FileSpreadsheet size={16} aria-hidden="true" />
                    Not sure how to set it up?
                  </p>
                  <button
                    type="button"
                    onClick={() => downloadCsv("teachers-template.csv", TEMPLATE_ROWS)}
                    className={SECONDARY_BUTTON}
                  >
                    <Download size={16} aria-hidden="true" />
                    Download template
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant">
                  <span className="font-medium text-on-surface">Required:</span>{" "}
                  {COLUMNS.filter((c) => c.required).map((c) => c.label).join(", ")}.
                </p>
                <p className="text-sm text-on-surface-variant">
                  <span className="font-medium text-on-surface">Optional:</span>{" "}
                  {COLUMNS.filter((c) => !c.required).map((c) => c.label).join(", ")}.
                  Leave a limit empty for no limit. Active is Yes or No, and
                  defaults to Yes.
                </p>
              </div>
            </div>
          )}

          {/* ----- Step 2: review ----- */}
          {(step === "review" || step === "importing") && (
            <div className="space-y-space-md">
              {importError && (
                <p
                  role="alert"
                  className="flex items-start gap-space-sm rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
                >
                  <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {importError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-space-sm">
                <span className="rounded-full bg-surface-container px-space-sm py-space-xs text-xs font-medium text-on-surface">
                  {plural(rows.length, "row")}
                </span>
                <span className="rounded-full bg-success-container px-space-sm py-space-xs text-xs font-medium text-on-success-container">
                  {ready.length} ready
                </span>
                {problems > 0 && (
                  <span className="rounded-full bg-error-container px-space-sm py-space-xs text-xs font-medium text-on-error-container">
                    {plural(problems, "row")} with problems
                  </span>
                )}

                {problems > 0 && (
                  <label className="ml-auto flex cursor-pointer items-center gap-space-sm text-sm text-on-surface">
                    <input
                      type="checkbox"
                      checked={onlyProblems}
                      onChange={(e) => setOnlyProblems(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    Show only rows with problems
                  </label>
                )}
              </div>

              {problems > 0 && (
                <p className="text-sm text-on-surface-variant">
                  Rows with problems will be skipped. Fix them in your file and
                  import again, or import the ready rows now and add the rest
                  later.
                </p>
              )}

              <div className="max-h-80 overflow-auto rounded-sm border border-outline-variant/40">
                <table className="w-full min-w-xl border-collapse">
                  <caption className="sr-only">Teachers found in the file</caption>
                  <thead className="sticky top-0 bg-surface-container text-on-surface-variant">
                    <tr>
                      <th scope="col" className={TH}>Row</th>
                      <th scope="col" className={TH}>Teacher</th>
                      <th scope="col" className={TH}>Staff code</th>
                      <th scope="col" className={TH}>Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {visibleRows.map((row) => (
                      <tr key={row.line} className={row.teacher ? undefined : "bg-error-container/30"}>
                        <td className={`${TD} font-mono text-xs text-on-surface-variant`}>
                          {row.line}
                        </td>
                        <td className={TD}>
                          <p className="font-medium text-on-surface">
                            {row.name || "—"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {row.email || "No email"}
                          </p>
                        </td>
                        <td className={`${TD} font-mono text-xs text-on-surface`}>
                          {row.staffCode || "—"}
                        </td>
                        <td className={TD}>
                          {row.teacher ? (
                            <span className="inline-flex items-center gap-space-xs rounded-full bg-success-container px-space-sm py-space-xs text-xs font-medium text-on-success-container">
                              <CircleCheck size={14} aria-hidden="true" />
                              Ready
                            </span>
                          ) : (
                            <ul className="space-y-space-xs text-xs text-error">
                              {row.errors.map((message) => (
                                <li key={message}>{message}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----- Step 3: result ----- */}
          {step === "done" && (
            <div className="space-y-space-lg">
              <div className="flex flex-col items-center gap-space-sm py-space-lg text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-success-container text-on-success-container">
                  <CircleCheck size={24} aria-hidden="true" />
                </span>
                <p className="font-heading text-lg font-semibold text-on-surface">
                  {created === 1 ? "1 teacher imported" : `${created} teachers imported`}
                </p>
                {(problems > 0 || failedRows.length > 0) && (
                  <p className="text-sm text-on-surface-variant">
                    {problems > 0 && `${plural(problems, "row")} skipped because of problems in the file. `}
                    {failedRows.length > 0 &&
                      `${plural(failedRows.length, "row")} couldn’t be saved.`}
                  </p>
                )}
              </div>

              {failedRows.length > 0 && (
                <div className="rounded-sm border border-outline-variant/40">
                  <p className="border-b border-outline-variant/40 bg-surface-container px-space-md py-space-sm text-sm font-medium text-on-surface">
                    Not saved
                  </p>
                  <ul className="max-h-48 divide-y divide-outline-variant/40 overflow-auto">
                    {failedRows.map((row) => (
                      <li key={`${row.line}-${row.message}`} className="px-space-md py-space-sm text-sm">
                        <span className="font-mono text-xs text-on-surface-variant">
                          Row {row.line}
                        </span>{" "}
                        <span className="font-medium text-on-surface">{row.name}</span>
                        <p className="text-xs text-error">{row.message}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-space-sm border-t border-outline-variant/30 p-space-lg">
          {step === "upload" && (
            <button type="button" onClick={close} className={SECONDARY_BUTTON}>
              Cancel
            </button>
          )}

          {(step === "review" || step === "importing") && (
            <>
              <button
                type="button"
                onClick={startOver}
                disabled={isImporting}
                className={SECONDARY_BUTTON}
              >
                Choose a different file
              </button>
              <button
                type="button"
                onClick={runImport}
                disabled={isImporting || ready.length === 0}
                className={PRIMARY_BUTTON}
              >
                {isImporting ? (
                  <>
                    <Loader2
                      size={16}
                      aria-hidden="true"
                      className="motion-safe:animate-spin"
                    />
                    Importing…
                  </>
                ) : (
                  `Import ${plural(ready.length, "teacher")}`
                )}
              </button>
            </>
          )}

          {step === "done" && (
            <button type="button" onClick={onClose} className={PRIMARY_BUTTON}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ImportTeachersModal;