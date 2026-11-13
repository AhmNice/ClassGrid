import { readdirSync, readFileSync } from "node:fs";
import { join, extname, relative } from "node:path";

const ROOT = process.argv[2] ?? "src";
const FAIL_ON_FOUND = process.argv.includes("--fail");
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".prisma", ".sql"]);
const IGNORED_DIRS = new Set(["node_modules", "dist", "build", ".git", "coverage"]);

// Matches TODO/FIXME/HACK/XXX only when they follow a comment marker,
// so variables like `todoList` or strings are not picked up.
const PATTERN = /(?:\/\/|\/\*+|^\s*\*|--|#)\s*(TODO|FIXME|HACK|XXX)\b\s*(?:\([^)]*\))?\s*[:\-]?\s*(.*)/;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) yield* walk(join(dir, entry.name));
    } else if (EXTENSIONS.has(extname(entry.name))) {
      yield join(dir, entry.name);
    }
  }
}

const results = [];

for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const match = line.match(PATTERN);
    if (match) {
      results.push({
        file: relative(process.cwd(), file),
        line: i + 1,
        tag: match[1],
        text: match[2].replace(/\*\/\s*$/, "").trim(),
      });
    }
  });
}

if (results.length === 0) {
  console.log(`No TODO comments found in ${ROOT}/`);
  process.exit(0);
}

// Group by file
const byFile = Map.groupBy(results, (r) => r.file);
for (const [file, items] of byFile) {
  console.log(`\n${file}`);
  for (const r of items) {
    console.log(`  ${String(r.line).padStart(4)}  [${r.tag}] ${r.text || "(no description)"}`);
  }
}

// Summary by tag
const counts = Object.entries(Object.groupBy(results, (r) => r.tag))
  .map(([tag, items]) => `${tag}: ${items.length}`)
  .join("  ");
console.log(`\n${results.length} found in ${byFile.size} file(s)  (${counts})`);

if (FAIL_ON_FOUND) process.exit(1);