// commands/workflow/step-base.ts — the commit a run's last step began after.
//
// A subagent may commit its edits or leave them uncommitted. A check that measures from
// HEAD or HEAD~1 answers differently in the two cases; one that measures from the commit
// holding the previous `step-done` row answers the same. Imports neither tests-changed.ts
// nor branches.ts, so both can import it.

import * as path from "node:path";

import { git, resolveActiveRun } from "../lib.js";
import { readStatusRows } from "./status.js";

/** The step a refused `steps finish` writes into the step being measured (`TAKEOVER_STEP` in tests.ts; not imported, since tests.ts imports this module's callers). */
const TAKEOVER = "build-takeover";

/** The FID a `feat/{FID}` branch names; undefined on any other branch. */
function branchFid(cwd: string): string | undefined {
  const branch = git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const m = branch === null ? null : /^feat\/(.+)$/.exec(branch);
  return m === null || m === undefined ? undefined : m[1];
}

/** Branches a feature branch is cut from, tried in order when looking for its merge base. */
const BASE_BRANCHES = ["dev", "origin/dev", "main", "origin/main"];

/**
 * The one in-progress run whose `status.jsonl` this checkout changed (commits since the
 * merge base with the trunk branch, working tree, or untracked); undefined when none or
 * several. Finds the checkout's own run on a branch that is not `feat/{FID}`.
 */
function ownChangedRun(cwd: string): ReturnType<typeof resolveActiveRun> {
  const top = git(cwd, ["rev-parse", "--show-toplevel"]);
  if (top === null) return undefined;
  const spec = ":(glob)docs/plans/*/logs/*/status.jsonl";
  const changed = new Set<string>();
  const add = (out: string | null): void => {
    for (const l of (out ?? "").split("\n")) if (l.trim() !== "") changed.add(l.trim());
  };
  let mb: string | null = null;
  for (const b of BASE_BRANCHES) {
    mb = git(top, ["merge-base", "HEAD", b]);
    if (mb !== null && mb !== "") break;
    mb = null;
  }
  add(git(top, ["diff", "--name-only", mb ?? "HEAD", "--", spec]));
  add(git(top, ["ls-files", "--others", "--exclude-standard", "--", spec]));
  const runs = new Map<string, NonNullable<ReturnType<typeof resolveActiveRun>>>();
  for (const rel of changed) {
    const run = resolveActiveRun({ cwd: top, file: path.join(top, rel) });
    if (run !== undefined) runs.set(run.file, run);
  }
  return runs.size === 1 ? [...runs.values()][0] : undefined;
}

/** The earliest commit that adds a row stamped `at` to `file`; null when none does. */
function commitOfRow(file: string, at: unknown): string | null {
  if (typeof at !== "string" || at === "") return null;
  const out = git(path.dirname(file), [
    "log",
    "--reverse",
    "--format=%H",
    `-S${at}`,
    "--",
    path.basename(file),
  ]);
  const first = out?.split("\n").find((l) => l !== "");
  return first === undefined ? null : first;
}

/** The run `stepBase` measures: the `feat/{FID}` branch's run, else the run `file` or the lone in-progress run, else the checkout's own changed run. */
export function stepRun(opts: { cwd: string; file?: string }): ReturnType<typeof resolveActiveRun> {
  const fid = opts.file === undefined ? branchFid(opts.cwd) : undefined;
  return (
    (fid === undefined ? undefined : resolveActiveRun({ cwd: opts.cwd, fid })) ??
    resolveActiveRun({ cwd: opts.cwd, file: opts.file }) ??
    (opts.file === undefined && fid === undefined ? ownChangedRun(opts.cwd) : undefined)
  );
}

/**
 * The commit the active run's current step began after: the commit that holds the last
 * `step-done` row (found by the row's `at` in the status file's history, else the row's
 * `parentSha`). With `step`, the commit of the `step-done` row before that step's latest
 * row (a step with no row yet measures from the last `step-done` row). A row stamped `uncommitted`
 * always yields its `parentSha`: a later commit may sweep the row in, and that commit is not the base. No `step-done` row → the commit that
 * holds the run's `workflow-started` row. Null with no active run or no such commit.
 */
export function stepBase(opts: { cwd: string; step?: string; file?: string }): string | null {
  const run = stepRun(opts);
  if (run === undefined) return null;
  const rows = readStatusRows(run.file);
  let start = -1;
  rows.forEach((r, i) => {
    if (r.type === "workflow-started" && r.workflow === run.workflow) start = i;
  });
  const inRun = rows.slice(start + 1).filter((r) => r.workflow === run.workflow);
  let done = inRun.filter((r) => r.type === "step-done" && r.step !== TAKEOVER);
  if (opts.step !== undefined) {
    const at = done.map((r) => r.step).lastIndexOf(opts.step);
    if (at >= 0) done = done.slice(0, at);
  }
  const prior = done.at(-1);
  if (prior !== undefined) {
    if (prior.uncommitted === true && typeof prior.parentSha === "string" && prior.parentSha !== "")
      return prior.parentSha;
    const found = commitOfRow(run.file, prior.at);
    if (found !== null) return found;
    if (typeof prior.parentSha === "string" && prior.parentSha !== "") return prior.parentSha;
  }
  const started = start >= 0 ? rows[start] : undefined;
  return started === undefined ? null : commitOfRow(run.file, started.at);
}
