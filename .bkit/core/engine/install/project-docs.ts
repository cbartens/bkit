// install/project-docs.ts — the ten project documents bkit recommends (`docs/architecture.md` …
// `docs/setup.md`): the topic catalog, the legacy-starter digests, the ownership migration for a
// document an older release installed as a managed block, and the `Project Documents` index
// (`.agents/docs.md`, below the closing `bkit:end`) that lists the project's own copies.
//
// The starters ship in `.bkit/templates/docs/`; the project copies a starter to `docs/` and owns
// it. Nothing here creates a project document. Every write is one of two surgical edits: removing
// the exact ownership-wrapper lines of a legacy managed document, or inserting a table row into
// `Project Documents`. Anything ambiguous or unsafe is left byte-for-byte and reported.

import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { LOG_PREFIX } from "../shared/log-prefix.js";
import { findLineAnchoredMarkers, stripManagedWrapper } from "./managed-block.js";
import type { WrapperProblem } from "./managed-block.js";

// ---------------------------------------------------------------------------
// Topic catalog
// ---------------------------------------------------------------------------

/** The ten topics, in index order. */
export const PROJECT_DOC_TOPICS = [
  "architecture",
  "technology",
  "security",
  "data-schema",
  "testing",
  "deployments",
  "observability",
  "design",
  "noise",
  "setup",
] as const;

export type ProjectDocTopic = (typeof PROJECT_DOC_TOPICS)[number];

interface TopicInfo {
  /** Phase cells in the order Design, Plan, Build, Debug, Ship. */
  phases: readonly [string, string, string, string, string];
  scope: string;
}

const TOPIC_INFO: Record<ProjectDocTopic, TopicInfo> = {
  architecture: {
    phases: ["●", "●", "●", "○", "○"],
    scope: "System design — service boundaries, deployment topology, integration sketch.",
  },
  technology: {
    phases: ["●", "●", "○", "○", "○"],
    scope:
      "Chosen frameworks, libraries, styling systems, coding conventions. Why a choice was made goes in `decisions.jsonl`.",
  },
  security: {
    phases: ["●", "●", "●", "○", "○"],
    scope:
      "Authentication, authorization, input validation, rate limiting, secrets management, PII handling.",
  },
  "data-schema": {
    phases: ["○", "○", "●", "○", "○"],
    scope:
      "Active production database schema — entities / tables, fields, access policies (e.g. RLS), indices, functions, triggers.",
  },
  testing: {
    phases: ["○", "●", "●", "●", "—"],
    scope:
      "Testing strategy — tier boundaries, framework choices, naming conventions, CI lane graph (names, needs, when a lane runs).",
  },
  deployments: {
    phases: ["○", "○", "○", "●", "●"],
    scope:
      "Deployment / CI/CD — secrets, branch protection, one-run concurrency, push base, promote after the capstone.",
  },
  observability: {
    phases: ["○", "○", "●", "●", "○"],
    scope: "Logging architecture, correlation tracing, telemetry pipelines, log drains.",
  },
  design: {
    phases: ["○", "○", "○", "—", "—"],
    scope: "Design system — palette, typography, components, spacing, a11y, layout tokens.",
  },
  noise: {
    phases: ["—", "—", "○", "●", "○"],
    scope:
      "Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds.",
  },
  setup: {
    phases: ["—", "—", "—", "—", "—"],
    scope: "Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.",
  },
};

/** The recommended repo-relative path of a topic's project document. */
export function projectDocPath(topic: ProjectDocTopic): string {
  return `docs/${topic}.md`;
}

/** Repo-relative path of the document index that holds the `Project Documents` table. */
export const PROJECT_INDEX_PATH = ".agents/docs.md";

/** Repo-relative path of a topic's starter copy under the consumer's `.bkit/`. */
export function starterPath(topic: ProjectDocTopic): string {
  return `.bkit/templates/docs/${topic}.md`;
}

/** The topic a repo-relative path is the recommended document of, or null. */
export function topicOfPath(rel: string): ProjectDocTopic | null {
  return PROJECT_DOC_TOPICS.find((t) => projectDocPath(t) === rel) ?? null;
}

// ---------------------------------------------------------------------------
// Legacy starter digests
//
// Releases up to 6.1.x installed these ten documents as managed blocks. Digests of that shipped
// text let a later check tell an untouched legacy starter from a document the project wrote.
//
//   Source revision : `.bkit/shared/docs/<topic>.md` as committed at 45f4254bd.
//   Rendering rules : install rendered `{{BKIT_MANAGED_MARKER}}` into the `bkit:managed` notice
//                     line and `{{DEFAULT_BRANCH}}` into the default branch (`main` here). The
//                     other `{{...}}` text in the sources is prose and stayed literal.
//   Normalization   : see `normalizeLegacyText`. Digests cover text a project may not have
//                     touched, never the ownership lines, line endings or blank-line runs.
//
// A copy rendered with another default branch does not match, so it reads as "differs", which
// callers treat as a candidate for assessment, never as proof of content.
// ---------------------------------------------------------------------------

/** Commit the legacy starter text was read from. */
export const LEGACY_STARTER_SOURCE_REVISION = "45f4254bd";

const LEGACY_NOTICE_RE =
  /^<!-- bkit:managed v\S+ — do not edit; run `bkit upgrade` to refresh -->$/;

/**
 * Normalize a document for comparison with a legacy starter: LF line endings, the former
 * ownership lines (`bkit:start`, `bkit:end`, the `bkit:managed` notice and the unrendered
 * `{{BKIT_MANAGED_MARKER}}` token) dropped, the default-branch token rendered as `main`,
 * trailing spaces trimmed and runs of blank lines collapsed.
 */
export function normalizeLegacyText(text: string): string {
  const kept: string[] = [];
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.replace(/\{\{DEFAULT_BRANCH\}\}/g, "main").replace(/[ \t]+$/, "");
    if (line === "<!-- bkit:start -->" || line === "<!-- bkit:end -->") continue;
    if (line === "{{BKIT_MANAGED_MARKER}}" || LEGACY_NOTICE_RE.test(line)) continue;
    kept.push(line);
  }
  return kept
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** sha256 of the normalized text. */
export function legacyDigest(text: string): string {
  return crypto.createHash("sha256").update(normalizeLegacyText(text)).digest("hex");
}

/** Digest of each topic's normalized legacy starter. */
export const LEGACY_STARTER_DIGESTS: Readonly<Record<ProjectDocTopic, string>> = {
  architecture: "b949b773e10f9d0a797189c942a5884a4c971805da43520883138118226ad845",
  technology: "723fd7fa4c001c1c3d562bd9de18f9830df3beebdcd45b54afeee159ce7bf2f0",
  security: "bdc2046e0f1b91a88fe272c8a1f5260429bb07ad548d57721b6a8b2fc623e345",
  "data-schema": "2cd1f2eedc508af1d609ce5b53b0e1836cc33c8fd4e67fb2ad4c821f83043c5f",
  testing: "075dec5a758e911f11077296eee0c6008be68415105a18df5cbdd76defb22bab",
  deployments: "723cedf74544ac377877a5ea9498622cadec41b81b8e8accd33cedf7eea44630",
  observability: "bebf67757c55db829ed4c429cefadf28b31175361f40e253b014d50e73dd5a65",
  design: "2e680b2857679af9672b1112cf06d7e1282c75c739e36428e49cf13be33bfc92",
  noise: "64ddcda2d9ee14efbe1a210c1f5177e6cc4dfa10417d410825d8765628307773",
  setup: "7da0f1a4e639ee2a2194c11a0ba762e9f4014826e1d01f7f61f9391de8c462a8",
};

/** The topic whose legacy starter `text` equals once normalized, or null. */
export function legacyStarterTopic(text: string): ProjectDocTopic | null {
  const digest = legacyDigest(text);
  return PROJECT_DOC_TOPICS.find((t) => LEGACY_STARTER_DIGESTS[t] === digest) ?? null;
}

// ---------------------------------------------------------------------------
// Safe file access
// ---------------------------------------------------------------------------

export type FileState = "absent" | "regular" | { unsafe: string };

/**
 * Whether `rel` under `root` is a regular file bkit may read or edit. A symlink (to anywhere), a
 * directory, anything other than a regular file, and a path whose parent directory resolves
 * outside the repository are `unsafe` with the reason.
 */
export function inspectRepoFile(root: string, rel: string): FileState {
  const abs = path.join(root, rel);
  const stat = fs.lstatSync(abs, { throwIfNoEntry: false });
  if (stat === undefined) return "absent";
  if (stat.isSymbolicLink()) return { unsafe: "it is a symbolic link" };
  if (!stat.isFile()) return { unsafe: "it is not a regular file" };
  const realRoot = fs.realpathSync(root);
  const realParent = fs.realpathSync(path.dirname(abs));
  if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) {
    return { unsafe: "it resolves outside the repository" };
  }
  return "regular";
}

// ---------------------------------------------------------------------------
// The Project Documents index
// ---------------------------------------------------------------------------

/** One data row of the `Project Documents` table. */
export interface IndexRow {
  /** First cell, backticks removed. */
  path: string;
  /** Last cell. */
  scope: string;
}

export type ProjectIndex =
  | { status: "missing" }
  | { status: "unreadable"; reason: string }
  | {
      status: "ok";
      text: string;
      eol: string;
      rows: IndexRow[];
      /** Offset just past the last table line (including its terminator, when it has one). */
      insertAt: number;
      /** True when the last table line has no terminator. */
      needsEol: boolean;
    };

const ROW_RE = /^\|\s*`([^`]+)`\s*\|/;

/** The `Project Documents` table of the index: the heading below the last `bkit:end`, then the first table. */
export function readProjectIndex(root: string): ProjectIndex {
  const state = inspectRepoFile(root, PROJECT_INDEX_PATH);
  if (state === "absent") return { status: "missing" };
  if (state !== "regular") {
    return { status: "unreadable", reason: `${PROJECT_INDEX_PATH} is not a safe regular file` };
  }
  const text = fs.readFileSync(path.join(root, PROJECT_INDEX_PATH), "utf-8");
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const ends = findLineAnchoredMarkers(text.replace(/\r/g, ""), "<!-- bkit:end -->");
  if (ends.length === 0) {
    return { status: "unreadable", reason: "no closing `bkit:end` marker above Project Documents" };
  }
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  let offset = 0;
  let afterEnd = false;
  let headingSeen = false;
  let tableStart = -1;
  let tableEnd = -1;
  let needsEol = false;
  const rows: IndexRow[] = [];
  for (const line of lines) {
    const bare = line.replace(/\r?\n$/, "");
    const lineEnd = offset + line.length;
    if (!afterEnd) {
      if (bare === "<!-- bkit:end -->") afterEnd = true;
    } else if (!headingSeen) {
      if (bare === "## Project Documents") headingSeen = true;
    } else if (tableEnd === -1) {
      if (bare.startsWith("|")) {
        if (tableStart === -1) tableStart = offset;
        const match = ROW_RE.exec(bare);
        if (match && tableStart !== offset) {
          const cells = bare.split("|");
          rows.push({
            path: match[1]!,
            scope: (cells[cells.length - 2] ?? "").trim(),
          });
        }
        needsEol = !line.endsWith("\n");
        // The table ends at the first non-table line, so keep scanning.
        offset = lineEnd;
        continue;
      } else if (tableStart !== -1) {
        tableEnd = offset;
      } else if (bare.startsWith("## ")) {
        break;
      }
    }
    offset = lineEnd;
  }
  if (!headingSeen || tableStart === -1) {
    return {
      status: "unreadable",
      reason: "no `## Project Documents` heading with a table below the closing `bkit:end`",
    };
  }
  if (tableEnd === -1) tableEnd = offset;
  return { status: "ok", text, eol, rows, insertAt: tableEnd, needsEol };
}

/** Row text for a project document, in the table's column order. */
export function projectDocRow(topic: ProjectDocTopic): string {
  const info = TOPIC_INFO[topic];
  return `| \`${projectDocPath(topic)}\` | ${info.phases.join(" | ")} | ${info.scope} |`;
}

/**
 * The indexed document that already covers `topic` at another path: a same-basename row, or a
 * row whose Scope names the recommended path as its equivalent (`Equivalent to docs/x.md`).
 */
export function findIndexedEquivalent(
  rows: readonly IndexRow[],
  topic: ProjectDocTopic,
): string | null {
  const recommended = projectDocPath(topic);
  const base = `${topic}.md`;
  for (const row of rows) {
    if (row.path === recommended) continue;
    if (path.posix.basename(row.path) === base) return row.path;
    const mentions = new RegExp(
      `equivalent\\s+to\\s+\`?${recommended.replace(".", "\\.")}\`?`,
      "i",
    );
    if (mentions.test(row.scope)) return row.path;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Synchronisation: migrate legacy wrappers, then register present documents
// ---------------------------------------------------------------------------

export interface ProjectDocsReport {
  /** Documents whose ownership wrapper was removed (or would be, on a dry run). */
  migrated: string[];
  /** Documents with markers that could not be removed safely, and why. */
  ambiguous: Array<{ path: string; problem: WrapperProblem }>;
  /** Documents bkit refused to read or register, and why. */
  unsafe: Array<{ path: string; reason: string }>;
  /** Documents registered (or that would be) in `Project Documents`. */
  registered: string[];
  /** Present default documents left alone because an indexed equivalent covers the topic. */
  equivalent: Array<{ path: string; indexed: string }>;
  /** Why the index could not take rows, when a row was due. */
  indexProblem: string | null;
}

const PROBLEM_TEXT: Record<WrapperProblem, string> = {
  "missing-partner": "one of `bkit:start` / `bkit:end` is missing",
  inverted: "`bkit:end` comes before `bkit:start`",
  multiple: "more than one `bkit:start` / `bkit:end` marker",
  "inside-fence": "a marker line sits inside a code fence",
  "multiple-notices": "more than one generated `bkit:managed` notice",
};

/**
 * Bring the project documents under the project's ownership and into its index, for install
 * and upgrade. Per present default document:
 *   1. a legacy `bkit:start` / `bkit:end` wrapper and its `bkit:managed` notice are removed,
 *      every other byte kept; an unclear wrapper is left as it is and reported;
 *   2. the path gets a `Project Documents` row when no row names that exact path, unless a
 *      different indexed document already covers the topic. A document migrated in this run
 *      gets its own row either way.
 * Missing documents stay missing. An index that cannot be read as a table is left untouched and
 * reported. A dry run writes nothing and prints what a real run would do. Safe to repeat.
 */
export function syncProjectDocs(root: string, opts: { dryRun: boolean }): ProjectDocsReport {
  const report: ProjectDocsReport = {
    migrated: [],
    ambiguous: [],
    unsafe: [],
    registered: [],
    equivalent: [],
    indexProblem: null,
  };
  const tag = opts.dryRun ? "[dry-run] " : "";
  const present: ProjectDocTopic[] = [];

  for (const topic of PROJECT_DOC_TOPICS) {
    const rel = projectDocPath(topic);
    const state = inspectRepoFile(root, rel);
    if (state === "absent") continue;
    if (state !== "regular") {
      report.unsafe.push({ path: rel, reason: state.unsafe });
      continue;
    }
    present.push(topic);
    const abs = path.join(root, rel);
    const before = fs.readFileSync(abs, "utf-8");
    const result = stripManagedWrapper(before);
    if (result.status === "ambiguous") {
      report.ambiguous.push({ path: rel, problem: result.problem });
    } else if (result.status === "removed") {
      if (!opts.dryRun) fs.writeFileSync(abs, result.content, "utf-8");
      report.migrated.push(rel);
    }
  }

  let index = readProjectIndex(root);
  const edits: string[] = [];
  const migrated = new Set(report.migrated);
  for (const topic of present) {
    const rel = projectDocPath(topic);
    if (report.ambiguous.some((a) => a.path === rel)) continue;
    if (index.status === "ok") {
      if (index.rows.some((r) => r.path === rel)) continue;
      const indexed = findIndexedEquivalent(index.rows, topic);
      if (indexed !== null && !migrated.has(rel)) {
        report.equivalent.push({ path: rel, indexed });
        continue;
      }
    }
    edits.push(rel);
  }

  if (edits.length > 0) {
    if (index.status !== "ok") {
      report.indexProblem =
        index.status === "missing"
          ? `${PROJECT_INDEX_PATH} does not exist`
          : `${PROJECT_INDEX_PATH} has no readable Project Documents table (${index.reason})`;
    } else {
      const rows = edits.map((rel) => projectDocRow(topicOfPath(rel)!));
      const insertion = (index.needsEol ? index.eol : "") + rows.join(index.eol) + index.eol;
      const next =
        index.text.slice(0, index.insertAt) + insertion + index.text.slice(index.insertAt);
      if (!opts.dryRun) fs.writeFileSync(path.join(root, PROJECT_INDEX_PATH), next, "utf-8");
      report.registered.push(...edits);
      index = { ...index, text: next };
    }
  }

  logReport(report, tag);
  return report;
}

function logReport(report: ProjectDocsReport, tag: string): void {
  for (const rel of report.migrated) {
    console.log(
      `${LOG_PREFIX} ${tag}migrate: ${rel} — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)`,
    );
  }
  for (const rel of report.registered) {
    console.log(
      `${LOG_PREFIX} ${tag}register: ${rel} in ${PROJECT_INDEX_PATH} (Project Documents)`,
    );
  }
  for (const a of report.ambiguous) {
    console.warn(
      `${LOG_PREFIX} ${a.path}: left as it is — ${PROBLEM_TEXT[a.problem]}, so bkit cannot tell its wrapper from your text. Delete any \`bkit:start\` / \`bkit:end\` / \`bkit:managed\` lines by hand; the file is yours.`,
    );
  }
  for (const u of report.unsafe) {
    console.warn(
      `${LOG_PREFIX} ${u.path}: skipped — ${u.reason}. bkit neither reads nor indexes it.`,
    );
  }
  if (report.indexProblem !== null) {
    console.warn(
      `${LOG_PREFIX} ${PROJECT_INDEX_PATH}: not edited — ${report.indexProblem}. Add a row for ${report.migrated.length + report.registered.length > 0 ? "each project document" : "the project documents you copied"} under a \`## Project Documents\` table below \`<!-- bkit:end -->\` by hand.`,
    );
  }
}
