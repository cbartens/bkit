#!/usr/bin/env node
// Example. Copy into the repo and own it.
// bkit install does not write this file and does not overwrite a copy.
// bkit-insert-ignore.mjs — wrap every markdown table with `<!-- prettier-ignore -->` and strip
// fixed-width padding from cells and separators. Idempotent. See .bkit/templates.md § Prettier tables.
//
//   node scripts/prettier/bkit-insert-ignore.mjs [--check] [path ...]
//
// Prettier aligns markdown tables with no config toggle; a table edit then rewrites every row and
// the diff hides the change. The per-table escape hatch is `<!-- prettier-ignore -->` directly
// above the table head, no blank line between.
//
// Default paths: `.agents`, `docs`, `README.md`. A directory walk skips `skills/` trees (vendored)
// and `docs/audits/` + `docs/plans/` (records, kept as written); a file named explicitly is always
// processed. Tables inside fenced code blocks (``` / ~~~) and tables already wrapped are skipped.
// `--check` writes nothing and exits 1 if any file would change — use it as a gate.
// Exit 1 also on table damage escaping cannot repair (see auditText), with or without --check —
// except in the record trees, where the damage is printed as a warning: a record holds text quoted
// from elsewhere (issue comments, CI logs), so nobody can fix it there.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEPARATOR_CELL = /^:?-+:?$/;
// Column-delimiter pipes only: `\|` is literal cell content (GFM) and must not split the row —
// prettier preserves it, so we must too, else `a\|b` corrupts to `a\ | b`.
const UNESCAPED_PIPE = /(?<!\\)\|/g;
const INLINE_CODE = /`[^`\n]*`/g;
const DEFAULT_ROOTS = [".agents", "docs", "README.md"];
// Record trees: written once, never reformatted.
const RECORD_DIRS = ["docs/audits", "docs/plans"];
const relTo = (root, p) => path.relative(root, path.resolve(root, p)).split(path.sep).join("/");
const isRecord = (r) => RECORD_DIRS.some((d) => r === d || r.startsWith(`${d}/`));

const stripNl = (line) => line.replace(/\n$/, "");
const leadingSpaces = (line) => /^ */.exec(line)[0];

export function splitCells(inner) {
  return inner.split(UNESCAPED_PIPE).map((c) => c.trim());
}

const innerOf = (line) => stripNl(line).trim().slice(1, -1);

export function isPipeRow(line) {
  const s = line.trim();
  return s.startsWith("|") && s.endsWith("|") && (s.match(/\|/g) ?? []).length >= 2;
}

export function isSeparatorRow(line) {
  const s = line.trim();
  if (!s.startsWith("|") || !s.endsWith("|")) return false;
  const cells = splitCells(s.slice(1, -1));
  if (!cells.length) return false;
  return cells.filter((c) => c !== "").every((c) => SEPARATOR_CELL.test(c));
}

function escapeCodeSpanPipes(line) {
  return line.replace(INLINE_CODE, (span) => span.replace(UNESCAPED_PIPE, "\\|"));
}

// Per GFM a pipe delimits a cell even inside a code span — `|| echo` in a cell is already TWO
// cells, and splitting then rejoining it rewrites it as ` |  | echo`. Escape span pipes only when
// that lands the row exactly on the separator's column count: a span pipe that is already a live
// delimiter (older damage, or a deliberately split cell) stays. The separator's column count
// decides, so repeat runs make the same decision.
function maybeEscape(line, ncols) {
  if (!isPipeRow(line) || !line.includes("`")) return line;
  const escaped = escapeCodeSpanPipes(line);
  if (escaped === line) return line;
  return splitCells(innerOf(escaped)).length === ncols ? escaped : line;
}

function stripCellPadding(line) {
  if (!isPipeRow(line)) return line;
  const nl = line.endsWith("\n") ? "\n" : "";
  const cells = splitCells(stripNl(line).trimEnd().trim().slice(1, -1));
  return `${leadingSpaces(line)}| ${cells.join(" | ")} |${nl}`;
}

function normalizeSeparator(line) {
  if (!isPipeRow(line)) return line;
  const nl = line.endsWith("\n") ? "\n" : "";
  const cells = splitCells(innerOf(line)).map((c) => {
    const left = c.startsWith(":");
    const right = c.endsWith(":");
    return left && right ? ":---:" : right ? "---:" : left ? ":---" : "---";
  });
  return `${leadingSpaces(line)}| ${cells.join(" | ")} |${nl}`;
}

// ``` / ~~~ fences across a line walk. Shared by processText and auditText so they never disagree:
// a table inside a fence is illustrative text, neither rewritten nor reported.
class FenceTracker {
  inFence = false;
  marker = "";

  // True when `line` opens, sits inside, or closes a fence.
  feed(line) {
    const s = line.trimStart();
    if (!this.inFence) {
      if (s.startsWith("```") || s.startsWith("~~~")) {
        this.inFence = true;
        this.marker = s.startsWith("```") ? "```" : "~~~";
        return true;
      }
      return false;
    }
    if (s.startsWith(this.marker)) this.inFence = false;
    return true;
  }
}

const linesWithEnds = (src) => src.match(/[^\n]*\n|[^\n]+$/g) ?? [];

export function processText(src) {
  const lines = linesWithEnds(src);
  const out = [];
  const fence = new FenceTracker();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (fence.feed(line)) {
      out.push(line);
      i++;
      continue;
    }
    const isTableHead = isPipeRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1]);
    if (!isTableHead) {
      out.push(line);
      i++;
      continue;
    }
    // An existing prettier-ignore may sit above trailing blank lines.
    let scan = out.length - 1;
    while (scan >= 0 && out[scan].trim() === "") scan--;
    if (!(scan >= 0 && out[scan].includes("<!-- prettier-ignore"))) {
      // The comment sits directly above the head; keep one blank line above it when content precedes.
      while (out.length && out.at(-1).trim() === "") out.pop();
      if (out.length && stripNl(out.at(-1)).trim() !== "") out.push("\n");
      out.push("<!-- prettier-ignore -->\n");
    }
    // Column count comes from the separator — the one row that cannot hold a code span.
    const sep = lines[i + 1];
    const ncols = splitCells(innerOf(sep)).length;
    out.push(stripCellPadding(maybeEscape(line, ncols)), normalizeSeparator(sep));
    let j = i + 2;
    while (j < lines.length && isPipeRow(lines[j])) {
      out.push(stripCellPadding(maybeEscape(lines[j], ncols)));
      j++;
    }
    i = j;
  }
  return out.join("");
}

// Damage this script reports and does NOT touch. Escaping happens only inside an inline-code span
// (maybeEscape); a bare pipe in plain cell prose ("boundary=browser | network") is left for a
// human. GFM renders both silently wrong:
//   truncated-row     a body row has MORE cells than the separator; GFM drops the overflow.
//   unrendered-table  header cell count != separator; GFM renders the whole block as raw text.
// Run on the POST-format text, so nothing escaping already fixed is reported twice.
export function auditText(src) {
  const lines = src.split("\n");
  const fence = new FenceTracker();
  const problems = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (fence.feed(line)) {
      i++;
      continue;
    }
    if (!(isPipeRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1]))) {
      i++;
      continue;
    }
    const ncols = splitCells(innerOf(lines[i + 1])).length;
    const nhead = splitCells(innerOf(line)).length;
    if (nhead !== ncols) {
      problems.push([
        i + 1,
        "unrendered-table",
        `header has ${nhead} columns, separator has ${ncols} — GFM renders this whole block as raw text, not a table`,
      ]);
    }
    let j = i + 2;
    while (j < lines.length && isPipeRow(lines[j])) {
      const ncells = splitCells(innerOf(lines[j])).length;
      if (ncells > ncols) {
        problems.push([
          j + 1,
          "truncated-row",
          `${ncells} cells in a ${ncols}-column table — GFM drops the last ${ncells - ncols}. ` +
            "If a pipe is cell content, escape it as \\|; otherwise the row carries more values " +
            "than the header has columns.",
        ]);
      }
      j++;
    }
    i = j;
  }
  return problems;
}

// Markdown files under the given roots. Walks skip `skills/` trees (third-party content: any file
// whose PARENT dirs include `skills`, so a file merely named skills.md is kept) and the record trees.
export function collectTargets(args, root = process.cwd()) {
  const walked = (p) => {
    const r = relTo(root, p);
    return !path.dirname(r).split("/").includes("skills") && !isRecord(r);
  };
  const files = [];
  for (const arg of args.length ? args : DEFAULT_ROOTS) {
    const abs = path.resolve(root, arg);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile() && abs.endsWith(".md")) files.push(arg);
    else if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(abs, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
        const file = path.join(entry.parentPath ?? entry.path, entry.name);
        const shown = path.join(arg, path.relative(abs, file));
        if (walked(shown)) files.push(shown);
      }
    }
  }
  return [...new Set(files)].sort();
}

export function main(argv, { root = process.cwd(), log = console.log } = {}) {
  const checkOnly = argv.includes("--check");
  const targets = collectTargets(
    argv.filter((a) => !a.startsWith("-")),
    root,
  );
  let changed = 0;
  const unformatted = [];
  const problems = [];
  const warnings = [];
  for (const file of targets) {
    const abs = path.resolve(root, file);
    const src = fs.readFileSync(abs, "utf8");
    const next = processText(src);
    if (next !== src) {
      if (checkOnly) unformatted.push(file);
      else {
        fs.writeFileSync(abs, next);
        changed++;
        log(`updated: ${file}`);
      }
    }
    const found = isRecord(relTo(root, file)) ? warnings : problems;
    for (const p of auditText(next)) found.push([file, ...p]);
  }
  if (checkOnly) {
    for (const file of unformatted) log(`needs formatting: ${file}`);
    log(`\n${unformatted.length}/${targets.length} files need formatting`);
  } else {
    log(`\n${changed}/${targets.length} files updated`);
  }
  const report = (list) => {
    for (const [file, lineNo, kind, detail] of list) {
      log(`  ${file}:${lineNo}  [${kind}]`);
      log(`      ${detail}`);
    }
  };
  if (problems.length) {
    log(
      `\n${problems.length} table defect(s) escaping cannot repair — a pipe in plain cell\n` +
        "prose is indistinguishable from a column delimiter, so these need a human:\n",
    );
    report(problems);
  }
  if (warnings.length) {
    log(
      `\nWARN: ${warnings.length} table defect(s) in records (${RECORD_DIRS.join(", ")}) — kept as\n` +
        "written, not a failure:\n",
    );
    report(warnings);
  }
  return problems.length || unformatted.length ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
