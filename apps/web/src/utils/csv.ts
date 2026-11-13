/**
 * Splits a CSV file into rows of cells. Handles quoted cells (including commas,
 * line breaks and "" inside them), a leading byte-order mark, and files saved
 * by Excel with semicolons or tabs instead of commas.
 */
export function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "");

  // Pick the separator from the first line.
  const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
  const count = (char: string) => firstLine.split(char).length - 1;
  const delimiter =
    count(";") > count(",") && count(";") >= count("\t")
      ? ";"
      : count("\t") > count(",")
        ? "\t"
        : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // The last line may not end with a line break.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Ignore completely empty lines.
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

const escapeCell = (cell: string) =>
  /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;

/** Saves rows as a CSV file the browser downloads. Opens correctly in Excel. */
export function downloadCsv(filename: string, rows: string[][]): void {
  const content = "\uFEFF" + rows.map((r) => r.map(escapeCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}