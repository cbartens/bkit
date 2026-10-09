// bkit roadmap fold — rewrite the generated region of docs/roadmap.md from
// .bkit/issues.jsonl, its SOLE input.
//
// The status block is a pure projection of the ledger, re-rendered in full, so
// a close never parses the board back. The two `## Notes` blocks and the
// analysis block (written by the roadmap review, which a phase close does not
// run) are carried through verbatim. Everything above the first marker is the
// consumer's and kept; anything after the last marker is folded into
// notes-post so that block stays last. A missing notes pair is seeded with a
// placeholder; a non-empty body is never overwritten. A board with no markers
// is adopted into notes-post, and a mangled pair self-heals without removing a
// byte.
//
// Tracker issues are NOT rendered: a wired tracker already shows them, and a
// regenerated copy can only go stale. Fail-open: this never exits non-zero for
// a bad ledger or an unwritable board, and never gates the caller's close.

import * as fs from "node:fs";
import * as path from "node:path";

import { compareTs, parse } from "../../bkit-telemetry.js";
import { EXIT, type CommandSpec, type RunContext } from "../lib.js";
import { str } from "./status.js";

export const MARKERS = {
  notesPreStart: "<!-- bkit:roadmap-notes-pre start -->",
  notesPreEnd: "<!-- bkit:roadmap-notes-pre end -->",
  statusStart: "<!-- bkit:roadmap-status start -->",
  statusEnd: "<!-- bkit:roadmap-status end -->",
  notesPostStart: "<!-- bkit:roadmap-notes-post start -->",
  notesPostEnd: "<!-- bkit:roadmap-notes-post end -->",
  analysisStart: "<!-- bkit:roadmap-analysis start -->",
  analysisEnd: "<!-- bkit:roadmap-analysis end -->",
} as const;

const ANALYSIS_PLACEHOLDER = "_(no analysis yet — run @bkit-utility-update-roadmap to populate)_";
const NOTES_PRE_PLACEHOLDER = "## Notes\n\n_(above the bkit list — yours, never overwritten)_";
const NOTES_POST_PLACEHOLDER = "## Notes\n\n_(end of the board — yours, never overwritten)_";
const BANNER =
  "> Generated tables — do NOT hand-edit the `bkit` tables; append to `.bkit/issues.jsonl` instead (an `ABANDONED` row hides a FID from every section). `## Notes` blocks are yours and are never overwritten. Everything above the first marker is also yours. notes-post is last. Analysis list length: `package.json` key `bkit.roadmapNext` (positive integer; absent or invalid → 25).";

/** Newest SHIPPED rows on the board; older ones stay in the ledger. */
export const SHIPPED_ON_BOARD = 10;

type Row = Record<string, unknown> & { key: string };

export interface Projection {
  designed: Row[];
  planned: Row[];
  built: Row[];
  debugged: Row[];
  shipped: Row[];
}

const SECTIONS: Array<[keyof Projection, string, string]> = [
  ["designed", "DESIGNED", "### Design"],
  ["planned", "PLANNED", "### Plan"],
  ["built", "BUILT", "### Build"],
  ["debugged", "DEBUGGED", "### Debug"],
  ["shipped", "SHIPPED", `### Shipped _(last ${SHIPPED_ON_BOARD})_`],
];

/** jq's `//`: the right side when the left is null, false or absent. */
const or = (a: unknown, b: unknown) => (a === undefined || a === null || a === false ? b : a);

/**
 * Fold rows by `key`, last write wins (highest `ts`, file order breaking ties),
 * and bucket by folded status. ABANDONED is in no bucket, so it hides a FID from
 * the whole board. SHIPPED ranks on `shippedAt`, falling back to `ts`: `ts` is
 * append time, so a row backfilled today for work shipped months ago would
 * otherwise sort as the newest ship and evict the real ones.
 */
export function project(rows: unknown[]): Projection {
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    if (typeof r !== "object" || r === null || Array.isArray(r)) continue;
    const key = (r as { key?: unknown }).key;
    if (typeof key !== "string") continue;
    groups.set(key, [...(groups.get(key) ?? []), r as Row]);
  }
  const latest = [...groups.keys()]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((k) => [...groups.get(k)!].sort((a, b) => compareTs({ ts: a.ts }, { ts: b.ts })).at(-1)!);
  const by = (status: string) => latest.filter((r) => r.status === status);
  return {
    designed: by("DESIGNED"),
    planned: by("PLANNED"),
    built: by("BUILT"),
    debugged: by("DEBUGGED"),
    shipped: by("SHIPPED")
      .sort((a, b) => compareTs({ ts: or(b.shippedAt, b.ts) }, { ts: or(a.shippedAt, a.ts) }))
      .slice(0, SHIPPED_ON_BOARD),
  };
}

/** jq's string interpolation of a scalar. */
const cell = (v: unknown) =>
  typeof v === "string" ? v : v === undefined ? "null" : JSON.stringify(v);

/**
 * `FID | Title | Last-transition (ts)`. Milestone and blocked-by are not on a
 * feature row, so they would print an em dash on every row of every board.
 */
function table(rows: Row[]): string[] {
  if (rows.length === 0) return ["_(none)_"];
  return [
    "| FID | Title | Last-transition (ts) |",
    "| --- | --- | --- |",
    ...rows.map(
      (r) => `| ${cell(r.key)} | ${cell(or(r.summary, r.key))} | ${cell(or(r.shippedAt, r.ts))} |`,
    ),
  ];
}

export function statusBlock(p: Projection, now: string): string {
  const out = [BANNER, "", "## bkit", "", `_(refreshed ${now})_`];
  for (const [bucket, , heading] of SECTIONS) out.push("", heading, "", ...table(p[bucket]));
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Region surgery on the existing board
// ---------------------------------------------------------------------------

const blank = (s: string) => /^[ \t\n\r\v\f]*$/.test(s);
const stripTrailingNewlines = (s: string) => s.replace(/\n+$/, "");

/** Drop leading and trailing blank lines, so a region read back never gains one per regenerate. */
function trimBlankLines(lines: string[]): string {
  let a = 0;
  while (a < lines.length && blank(lines[a]!)) a++;
  let b = lines.length;
  while (b > a && blank(lines[b - 1]!)) b--;
  return lines.slice(a, b).join("\n");
}

/** Lines as `grep -n` / `sed` number them: a final newline ends the last line. */
const fileLines = (text: string) => (text === "" ? [] : text.replace(/\n$/, "").split("\n"));

const firstWith = (lines: string[], m: string) => lines.findIndex((l) => l.includes(m));
const lastWith = (lines: string[], m: string) => {
  for (let i = lines.length - 1; i >= 0; i--) if (lines[i]!.includes(m)) return i;
  return -1;
};

/** Text strictly between the first `start` and the last `end`; undefined when absent or out of order. */
function between(lines: string[], start: string, end: string): string | undefined {
  const s = firstWith(lines, start);
  const e = lastWith(lines, end);
  if (s === -1 || e === -1 || s >= e) return undefined;
  return stripTrailingNewlines(lines.slice(s + 1, e).join("\n"));
}

const carried = (lines: string[], start: string, end: string, placeholder: string) => {
  const body = between(lines, start, end) ?? "";
  return blank(body) ? placeholder : body;
};

/** `extra` under `base`, blank-separated; never drops `base`. */
function appendNotes(base: string, extra: string): string {
  if (blank(extra)) return stripTrailingNewlines(base);
  if (blank(base)) return stripTrailingNewlines(extra);
  return stripTrailingNewlines(`${base}\n\n${extra}`);
}

export interface FoldResult {
  board: string;
  log: string[];
}

/** The whole new docs/roadmap.md, from the ledger rows and the current board (undefined = none). */
export function foldBoard(p: Projection, current: string | undefined, now: string): FoldResult {
  const log: string[] = [];
  const lines = current === undefined ? [] : fileLines(current);
  const notesPre = carried(
    lines,
    MARKERS.notesPreStart,
    MARKERS.notesPreEnd,
    NOTES_PRE_PLACEHOLDER,
  );
  let notesPost = carried(
    lines,
    MARKERS.notesPostStart,
    MARKERS.notesPostEnd,
    NOTES_POST_PLACEHOLDER,
  );
  const analysisBody = between(lines, MARKERS.analysisStart, MARKERS.analysisEnd) ?? "";
  const analysis = blank(analysisBody) ? ANALYSIS_PLACEHOLDER : analysisBody;

  let head = "";
  let tail = "";
  let adopted = "";
  if (current !== undefined) {
    const starts = [
      MARKERS.notesPreStart,
      MARKERS.statusStart,
      MARKERS.notesPostStart,
      MARKERS.analysisStart,
    ]
      .map((m) => firstWith(lines, m))
      .filter((i) => i !== -1);
    const ends = [MARKERS.notesPreEnd, MARKERS.statusEnd, MARKERS.notesPostEnd, MARKERS.analysisEnd]
      .map((m) => lastWith(lines, m))
      .filter((i) => i !== -1);
    const firstStart = starts.length ? Math.min(...starts) : -1;
    const lastEnd = ends.length ? Math.max(...ends) : -1;
    if (firstStart > 0) head = trimBlankLines(lines.slice(0, firstStart));
    if (lastEnd !== -1) {
      tail = trimBlankLines(lines.slice(lastEnd + 1));
    } else if (firstStart !== -1) {
      // Start marker with no end: where bkit's region stops is unknowable, so
      // everything after it is the consumer's. A self-heal never removes a byte.
      adopted = trimBlankLines(lines.slice(firstStart + 1));
      log.push(
        "repairing mangled marker pair — content below the orphaned start marker preserved under notes-post",
      );
    }
    if (firstStart === -1 && lastEnd === -1) {
      adopted = stripTrailingNewlines(current);
      log.push(
        "pre-existing docs/roadmap.md had no marker pair — its content is preserved under notes-post",
      );
    }
  } else {
    log.push("bootstrapping docs/roadmap.md");
  }

  // The head is the consumer's once the file exists: bkit seeds a title and
  // never rewrites it. The generated-tables warning lives in the status block,
  // so its wording stays true as the region's rules change.
  if (blank(head)) head = "# Roadmap";

  let merge = adopted;
  if (!blank(tail)) merge = appendNotes(merge, tail);
  if (!blank(merge)) notesPost = appendNotes(notesPost, merge);

  const board = [
    `${head}\n`,
    MARKERS.notesPreStart,
    notesPre,
    `${MARKERS.notesPreEnd}\n`,
    MARKERS.statusStart,
    statusBlock(p, now),
    `${MARKERS.statusEnd}\n`,
    MARKERS.analysisStart,
    analysis,
    `${MARKERS.analysisEnd}\n`,
    MARKERS.notesPostStart,
    notesPost,
    MARKERS.notesPostEnd,
  ].join("\n");
  return { board: `${board}\n`, log };
}

/** Whether docs/plans holds a `.md` within two levels — in-flight work the ledger should know about. */
function plansHaveMarkdown(root: string): boolean {
  const plans = path.join(root, "docs", "plans");
  if (!fs.existsSync(plans) || !fs.statSync(plans).isDirectory()) return false;
  return fs
    .readdirSync(plans, { withFileTypes: true })
    .some(
      (e) =>
        e.name.endsWith(".md") ||
        (e.isDirectory() &&
          fs.readdirSync(path.join(plans, e.name)).some((f) => f.endsWith(".md"))),
    );
}

const EMPTY: Projection = { designed: [], planned: [], built: [], debugged: [], shipped: [] };

function fold(ctx: RunContext): number {
  const root = path.resolve(ctx.cwd, str(ctx.flags.root) ?? ".");
  const md = path.join(root, "docs", "roadmap.md");
  const ledger = path.join(root, ".bkit", "issues.jsonl");
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  let projection = EMPTY;
  let malformed = 0;
  const raw = fs.existsSync(ledger) ? fs.readFileSync(ledger, "utf-8") : "";
  if (raw === "") {
    ctx.log(".bkit/issues.jsonl absent or empty — status board will be empty (never blocked)");
    if (plansHaveMarkdown(root)) {
      ctx.log(
        "docs/plans/** has in-flight artifacts but the ledger is empty — run 'bkit telemetry migrate' to bootstrap-seed it",
      );
    }
  } else {
    const parsed = parse(raw);
    malformed = parsed.malformedLineCount;
    // One torn line skips that row only; the board keeps every row that parses.
    if (malformed > 0) ctx.log(`.bkit/issues.jsonl: ${malformed} malformed line(s) skipped`);
    projection = project(parsed.events);
  }

  const current =
    fs.existsSync(md) && fs.statSync(md).isFile() ? fs.readFileSync(md, "utf-8") : undefined;
  const { board, log } = foldBoard(projection, current, now);
  for (const line of log) ctx.log(line);
  const problem = writeBoard(md, board);
  if (problem) ctx.log(`could not write ${md} — board left as-is (fail-open): ${problem}`);
  ctx.emit({
    path: md,
    written: problem === undefined,
    counts: Object.fromEntries(SECTIONS.map(([bucket]) => [bucket, projection[bucket].length])),
    malformed,
  });
  return EXIT.OK;
}

function writeBoard(md: string, board: string): string | undefined {
  const tmp = `${md}.roadmap-tmp.${process.pid}`;
  try {
    fs.mkdirSync(path.dirname(md), { recursive: true });
    fs.writeFileSync(tmp, board);
    fs.renameSync(tmp, md);
    return undefined;
  } catch (err) {
    // Fail-open by contract: the caller logs it and the close carries on.
    fs.rmSync(tmp, { force: true });
    return (err as Error).message;
  }
}

export const roadmapCommand: CommandSpec = {
  noun: "roadmap",
  summary: "Re-render docs/roadmap.md's generated region from .bkit/issues.jsonl (fail-open).",
  verbs: {
    fold: {
      summary: "Rewrite the status tables; carry notes, analysis and the consumer's head through.",
      flags: [
        {
          name: "root",
          type: "string",
          help: "checkout holding docs/ and .bkit/ (default: the working directory)",
        },
      ],
      output: {
        path: "docs/roadmap.md, absolute",
        written: "false when the board could not be written (left as it was)",
        counts: "rows per section: designed, planned, built, debugged, shipped",
        malformed: "ledger lines that did not parse (skipped)",
      },
      run: (ctx) => fold(ctx),
    },
  },
};
