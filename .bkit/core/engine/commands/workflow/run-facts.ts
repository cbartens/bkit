// The measured blocks of a workflow run's `outcome` row (`.bkit/core/.bkit/jsonl.md`
// § Shared blocks): lines, steps, ci, plan and build, from git, the run's
// `status.jsonl` rows and its log folder. `scripts/stats/bkit-chat-stats.mjs`
// computes the same blocks for its `run` rows, with the same rules.

import * as fs from "node:fs";
import * as path from "node:path";

import type { StatusEvent } from "../../ledgers/status.js";
import {
  foldFrom,
  type BuildBlock,
  CiDispatch,
  LineCounts,
  LinesBlock,
  PlanBlock,
  PlanTask,
  StepsBlock,
  type TimeBlock,
} from "../../ledgers/telemetry.js";
import { git } from "../lib.js";
import { appendLedgerRows } from "./ledgers.js";
import { readStatusEvents } from "./status.js";
import {
  MAX_TASKS_PER_PLAN,
  MAX_TEST_FILES_PER_TASK,
  MAX_TESTS_PER_TASK,
  readTestFirst,
} from "./tests.js";

type Row = StatusEvent & Record<string, unknown>;

const msOf = (iso: unknown) => (typeof iso === "string" ? Date.parse(iso) : NaN);
/** Minutes to one decimal. */
export const minutesOf = (ms: number) => Math.round(ms / 6000) / 10;

/** `start` to `end`, unix ms. */
export function timeBlock(start: number, end: number): TimeBlock {
  return { start, end, totalMinutes: minutesOf(end - start) };
}

/** Left out of a run's line counts: plans and run logs, and the ledgers. */
const LINES_EXCLUDE = [
  ":(exclude)docs/plans/**",
  ":(exclude,glob)docs/*.jsonl",
  ":(exclude,glob).bkit/*.jsonl",
];
const TEST_PATH =
  /(^|\/)(__tests__|tests?|spec|e2e)\/|[._-](test|spec)\.[^/]+$|_test\.[^/]+$|(^|\/)test_[^/]+\.py$/i;
const DOCS_PATH = /\.mdx?$|(^|\/)docs\//i;

/** `code`, `tests` or `docs`, from a changed file's path. */
export const lineClass = (file: string): "code" | "tests" | "docs" =>
  TEST_PATH.test(file) ? "tests" : DOCS_PATH.test(file) ? "docs" : "code";

/**
 * Lines changed from `first` to `last`, cut at each merge on the first-parent
 * chain (a dev sync) so merged-in work is not counted, each stretch diffed on its
 * own. Null when git lacks either commit or `first` is not an ancestor of `last`.
 */
export function runLines(cwd: string, first: string, last: string): LinesBlock | null {
  if (!first || !last) return null;
  if (git(cwd, ["merge-base", "--is-ancestor", first, last]) === null) return null;
  const chain = git(cwd, [
    "rev-list",
    "--first-parent",
    "--reverse",
    "--parents",
    `${first}..${last}`,
  ]);
  if (chain === null) return null;
  const stretches: Array<[string, string]> = [];
  let from = first;
  for (const line of chain.split("\n").filter(Boolean)) {
    const [sha, parent, ...merged] = line.split(" ");
    if (merged.length === 0) continue;
    stretches.push([from, parent!]);
    from = sha!;
  }
  stretches.push([from, last]);
  const blank = (): LineCounts => ({ added: 0, deleted: 0, files: 0 });
  const parts = { code: blank(), tests: blank(), docs: blank() };
  for (const [a, b] of stretches) {
    if (a === b) continue;
    const stat = git(cwd, ["diff", "--numstat", a, b, "--", ".", ...LINES_EXCLUDE]);
    if (stat === null) return null;
    for (const line of stat.split("\n").filter(Boolean)) {
      const [added, deleted, file] = line.split("\t");
      const c = parts[lineClass(file ?? "")];
      c.files++;
      // Binary files: `-` for both counts.
      if (added !== "-") {
        c.added += Number(added);
        c.deleted += Number(deleted);
      }
    }
  }
  const sum = (k: keyof LineCounts) => parts.code[k] + parts.tests[k] + parts.docs[k];
  const added = sum("added");
  const deleted = sum("deleted");
  return {
    total: { added, deleted, changed: added + deleted, files: sum("files") },
    ...parts,
    merges: stretches.length - 1,
  };
}

/** The run's status rows of `workflow` from its start row on, in `at` order. */
export function runStatusRows(events: StatusEvent[], workflow: string, startAt: string): Row[] {
  return (events as Row[])
    .filter((e) => e.workflow === workflow && typeof e.at === "string" && e.at >= startAt)
    .sort((a, b) => msOf(a.at) - msOf(b.at));
}

/** Per step: its step-done rows and the minutes since the row before each. */
export function stepsBlock(rows: Row[]): StepsBlock {
  const ms: Record<string, { n: number; ms: number }> = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]!;
    if (r.type !== "step-done" || typeof r.step !== "string") continue;
    const s = (ms[r.step] ??= { n: 0, ms: 0 });
    s.n++;
    s.ms += Math.max(0, msOf(r.at) - msOf(rows[i - 1]!.at));
  }
  const byStep = Object.fromEntries(
    Object.entries(ms).map(([k, v]) => [k, { n: v.n, totalMinutes: minutesOf(v.ms) }]),
  );
  const parts = Object.values(byStep);
  return {
    total: {
      n: parts.reduce((a, p) => a + p.n, 0),
      totalMinutes: Math.round(parts.reduce((a, p) => a + p.totalMinutes, 0) * 10) / 10,
    },
    byStep,
  };
}

/** Every close step's CI dispatch, in order. */
export function ciList(rows: Row[]): CiDispatch[] {
  return rows
    .filter((r) => r.type === "step-done" && /-close-workflow$/.test(String(r.step ?? "")))
    .map((r) => r.ciDispatch as Record<string, unknown> | undefined)
    .filter((d) => d !== undefined && d !== null)
    .map((d) => ciEntry(d!));
}

/** One `ciDispatch` value as a `ci` entry. */
export function ciEntry(d: Record<string, unknown>): CiDispatch {
  return {
    status: typeof d.outcome === "string" ? d.outcome : null,
    reason: typeof d.reason === "string" ? d.reason : null,
    attempts: typeof d.attempts === "number" ? d.attempts : null,
  };
}

const kbOf = (file: string) => Math.round(fs.statSync(file).size / 1024);

/** Per task, its `Test first` tests and distinct test files; null when the task has no such field. */
function planTasks(text: string): PlanTask[] {
  return readTestFirst(text).map((s) =>
    s.kind === "test"
      ? { tests: s.tests.length, testFiles: new Set(s.tests.map((t) => t.test)).size }
      : s.kind === "missing"
        ? { tests: null, testFiles: null }
        : { tests: 0, testFiles: 0 },
  );
}

/** Why `plan-complexity-check` split a plan: `over-12-tasks`, `task-N-over-10-tests`, `task-N-over-3-test-files`. */
function splitReasons(text: string): string[] {
  const specs = readTestFirst(text);
  const out = specs.length > MAX_TASKS_PER_PLAN ? [`over-${MAX_TASKS_PER_PLAN}-tasks`] : [];
  for (const s of specs) {
    if (s.kind !== "test") continue;
    if (s.tests.length > MAX_TESTS_PER_TASK)
      out.push(`task-${s.task}-over-${MAX_TESTS_PER_TASK}-tests`);
    if (new Set(s.tests.map((t) => t.test)).size > MAX_TEST_FILES_PER_TASK)
      out.push(`task-${s.task}-over-${MAX_TEST_FILES_PER_TASK}-test-files`);
  }
  return out;
}

/**
 * The plan the run worked from: `{FID}-plan-{N}.md` sub-plans in N order, else
 * `{FID}-plan.md`; `complexity` from the log folder's `plan-complexity-check.md`
 * and the plan it read (`plan-v3-checked.md`). Undefined when no plan file exists.
 */
export function planBlock(
  tree: string,
  month: string,
  fid: string,
  logDir: string,
  source: string | undefined,
): PlanBlock | undefined {
  if (source === "brief") return { source: "brief" };
  const dir = path.join(tree, "docs", "plans", month);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const sub = new RegExp(`^${fid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-plan-(\\d+)\\.md$`);
  const subs = files
    .map((f) => sub.exec(f))
    .filter((m) => m !== null)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((m) => m[0]);
  const chosen = subs.length > 0 ? subs : files.filter((f) => f === `${fid}-plan.md`);
  if (chosen.length === 0) return undefined;
  const subPlans = chosen.map((f) => {
    const file = path.join(dir, f);
    return { kb: kbOf(file), tasks: planTasks(fs.readFileSync(file, "utf-8")) };
  });
  const plan: PlanBlock = {
    source: "file",
    total: {
      tasks: subPlans.reduce((a, s) => a + s.tasks.length, 0),
      kb: subPlans.reduce((a, s) => a + s.kb, 0),
    },
    subPlans,
  };
  const check = path.join(logDir, "plan-complexity-check.md");
  if (fs.existsSync(check)) {
    const verdict = /^Verdict:\s*(\w+)/m.exec(fs.readFileSync(check, "utf-8"))?.[1] ?? null;
    const checked = path.join(logDir, "plan-v3-checked.md");
    const text = fs.existsSync(checked) ? fs.readFileSync(checked, "utf-8") : null;
    plan.complexity = {
      verdict,
      tasksChecked: text === null ? null : readTestFirst(text).length,
      reasons: text === null || verdict !== "SPLIT" ? [] : splitReasons(text),
    };
  }
  return plan;
}

const TEST_ORDER_GAP =
  /—\s*(no-red|late-red|red-mismatch|red-evidence-missing|test-changed)\s*—\s*not fixable/g;
/** A reconciled challenge finding: a heading whose first severity word is the finding's. */
const FINDING_HEADING = /^#{3,4} [^\n]*?\b(CRITICAL|HIGH|MEDIUM|LOW)\b/gm;

const field = (r: Row, k: string) => (r[k] === undefined ? null : r[k]);
const num = (v: unknown) => (typeof v === "number" ? v : null);
const str = (v: unknown) => (typeof v === "string" ? v : null);

/**
 * Build-only facts from the run's step rows and its log folder: every verify and
 * gaps-remediate round, the holistic verify, the challenge (findings counted from
 * the reconciled report) and the red-test runs. A verify report counts its
 * test-order gaps only when its verdict and failure count match the round's row.
 */
export function buildBlock(rows: Row[], logDir: string): BuildBlock {
  const read = (file: string) => {
    const f = path.join(logDir, file);
    return fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null;
  };
  const steps = rows.filter((r) => r.type === "step-done");
  const verify = steps
    .filter((r) => r.step === "build-plan-verify")
    .map((r) => {
      const v = {
        subPlan: field(r, "subPlan"),
        attempt: field(r, "attempt"),
        verdict: field(r, "verdict"),
        failures: field(r, "failures"),
        testOrderGaps: null as number | null,
      };
      const text = read(`build-plan-verify-${String(v.subPlan)}-${String(v.attempt)}.md`);
      if (
        text !== null &&
        /^Verdict:\s*(\w+)/m.exec(text)?.[1] === v.verdict &&
        Number(/^Failures:\s*(\d+)/m.exec(text)?.[1]) === v.failures
      )
        v.testOrderGaps = [...text.matchAll(TEST_ORDER_GAP)].length;
      return v;
    });
  const gapsRemediate = steps
    .filter((r) => r.step === "build-plan-gaps-remediate")
    .map((r) => ({
      subPlan: field(r, "subPlan"),
      attempt: field(r, "attempt"),
      verdict: field(r, "verdict"),
      strategy: field(r, "strategy"),
    }));
  const lastOf = (step: string) => steps.filter((r) => r.step === step).at(-1);
  const hol = lastOf("build-plan-verify-holistic");
  const ch = lastOf("build-challenge");
  const reconciled = steps.some((r) => r.step === "build-challenge-reconcile");
  const chText = reconciled ? read("build-challenge.md") : null;
  let findings: NonNullable<NonNullable<BuildBlock["challenge"]>["findings"]> | null = null;
  if (chText !== null) {
    const f = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const m of chText.matchAll(FINDING_HEADING)) f[m[1] as keyof typeof f]++;
    findings = { total: f.CRITICAL + f.HIGH + f.MEDIUM + f.LOW, ...f };
  }
  return {
    verify,
    gapsRemediate,
    holistic: hol ? { verdict: str(hol.verdict), failures: num(hol.failures) } : null,
    challenge: ch ? { verdict: str(ch.verdict), findings } : null,
    redTests: steps.filter((r) => r.step === "build-task-red").length,
  };
}

/**
 * After the close's CI dispatch: append the run's `outcome` row again with the
 * dispatch added to `ci`, and `ending` `close-failed` when CI never started
 * (`unresolved`). The run is the last `workflow-done` row of `workflow` in
 * `status`; its `parentSha` names the outcome row. The newer row supersedes the
 * close's under fold. Best-effort: a missing row or a refused append is logged.
 */
export function restateOutcome(
  tree: string,
  status: string,
  workflow: string,
  dispatch: Record<string, unknown>,
  log: (m: string) => void,
): boolean {
  const done = readStatusEvents(status)
    .filter((e) => e.type === "workflow-done" && e.workflow === workflow)
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
    .at(-1) as Record<string, unknown> | undefined;
  const sha = done?.parentSha;
  if (typeof sha !== "string") {
    log(`[bkit-telemetry] no ${workflow} workflow-done row with parentSha — outcome not restated`);
    return false;
  }
  const stats = path.join(tree, ".bkit", "stats.jsonl");
  const outcome = fs.existsSync(stats)
    ? [...foldFrom([stats]).state.values()]
        .filter(
          (e) => e.kind === "outcome" && e.by?.workflow === workflow && e.run?.parentSha === sha,
        )
        .at(-1)
    : undefined;
  if (outcome === undefined) {
    log(
      `[bkit-telemetry] no ${workflow} outcome row for ${sha.slice(0, 12)} — outcome not restated`,
    );
    return false;
  }
  const { schema: _s, ts: _t, bkit: _b, ...draft } = outcome as unknown as Record<string, unknown>;
  const entry = ciEntry(dispatch);
  const ci = [...((draft.ci as CiDispatch[] | undefined) ?? []), entry];
  try {
    appendLedgerRows(tree, "stats", [
      { ...draft, ending: entry.status === "unresolved" ? "close-failed" : "done", ci },
    ]);
    return true;
  } catch (err) {
    // Telemetry never gates a dispatch: report the refused append and carry on.
    log(`[bkit-telemetry] outcome not restated: ${(err as Error).message}`);
    return false;
  }
}
