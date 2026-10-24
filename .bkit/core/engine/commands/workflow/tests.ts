// bkit tests run — run the deepest declared local gate, save its full output,
// and report the verdict.
//
// Candidates come in priority order, deepest first: the first one `package.json`
// declares is run, so a shallower gate never wins while a deeper one exists (the
// order is the contract). Nothing declared is its own exit code, never an empty
// command that exits 0 and reads as a clean run. A gate that exits 126 / 127 never
// ran (not executable / not found), so it is not recorded as a failing test.
// The failure count comes from the JUnit reports the gate's runners write into
// `{log}.reports/` (`BKIT_TEST_REPORT_DIR`), never from reading the log.
//
// bkit tests red / green — test-first evidence for build tasks. Both run one test
// file through the consumer's `bkit:test:file` script and judge its JUnit report,
// never its exit code alone: a misspelled path, a syntax error and an import of
// unwritten code all exit non-zero exactly like a real failure. A red counts only
// when the NAMED test ran and failed; green only when it ran and passed.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
import { clampLogPath } from "../../ledgers/clamp-log.js";
import { CommandError, EXIT, git, runGit, type CommandSpec } from "../lib.js";
import { readPackageJson } from "../../shared/package-json.js";
import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
import {
  FILE_FLAG,
  SUB_PLAN_FLAG,
  WORKFLOW_FLAG,
  positiveInt,
  readStatusRows,
  statusFile,
  str,
} from "./status.js";
import { writeStepRow } from "./steps.js";
import { appendRecord, clampFile, type ClampRecord } from "./context.js";

/** Exit code: no candidate gate is declared in package.json. */
export const EXIT_NO_GATE = 3;
/** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
export const EXIT_COULD_NOT_RUN = 4;
/** Exit code: --artifact could not be written, trimmed or recorded. */
export const EXIT_ARTIFACT_STEP = 5;

/** The env var naming the folder every runner a gate calls writes its JUnit XML into. */
export const REPORT_DIR_ENV = "BKIT_TEST_REPORT_DIR";

const NO_REPORT_HINT =
  `no JUnit report in $${REPORT_DIR_ENV} — failures unknown; turn on each test runner's JUnit ` +
  `reporter in the gate and point its output into $${REPORT_DIR_ENV} ` +
  "(.bkit/workflows.md § Local gate scripts)";

const DEFAULT_TAIL = 40;

const NO_GATE_HINT =
  "declare a bkit:gate:* script in package.json that runs your stack's checks " +
  "(.bkit/workflows.md § Local gate scripts lists the names and what each covers)";

/**
 * The first candidate `package.json` declares as a non-empty script, or null.
 * An empty script runs nothing and exits 0, which is the false green this guards.
 */
export function resolveGate(dir: string, candidates: readonly string[]): string | null {
  const read = readPackageJson(dir);
  const scripts = read.ok ? read.pkg.scripts : undefined;
  if (typeof scripts !== "object" || scripts === null) return null;
  const declared = scripts as Record<string, unknown>;
  return (
    candidates.find((g) => {
      const body = declared[g];
      return typeof body === "string" && body.trim() !== "";
    }) ?? null
  );
}

/** The scope string the status rows record: the package runner plus the script name. */
export const gateScope = (gate: string) => scriptCommand(gate).join(" ");

/**
 * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`).
 * Exit 127 when the binary is missing; 128 + n when killed by signal n.
 */
export function runToLog(
  argv: string[],
  cwd: string,
  log: string,
  env?: Record<string, string>,
): number {
  fs.mkdirSync(path.dirname(log), { recursive: true });
  const fd = fs.openSync(log, "w");
  const res = spawnSync(argv[0]!, argv.slice(1), {
    cwd,
    stdio: ["ignore", fd, fd],
    env: env === undefined ? process.env : { ...process.env, ...env },
  });
  fs.closeSync(fd);
  if (res.error) {
    fs.appendFileSync(log, `${argv[0]}: not found on PATH (${res.error.message})\n`);
    return 127;
  }
  if (res.status !== null) return res.status;
  return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
}

/** `{log}.reports`, emptied: a previous attempt's reports never count toward this one. */
function freshReportDir(log: string): string {
  const dir = `${log}.reports`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Failing plus erroring test cases across every `*.xml` under `dir`; null when there is none. */
export function countReportFailures(dir: string): number | null {
  const xml = (fs.readdirSync(dir, { recursive: true }) as string[]).filter(
    (f) => f.endsWith(".xml") && fs.statSync(path.join(dir, f)).isFile(),
  );
  if (xml.length === 0) return null;
  return xml
    .flatMap((f) => parseJunit(fs.readFileSync(path.join(dir, f), "utf-8")))
    .filter((c) => c.state === "failure" || c.state === "error").length;
}

const tailLines = (file: string, n: number) =>
  fs.readFileSync(file, "utf-8").replace(/\n$/, "").split("\n").slice(-n);

// ---------------------------------------------------------------------------
// Test-first: JUnit reading, plan `Test first:` lines, red / green judgement
// ---------------------------------------------------------------------------

/** The env var naming the JUnit report path `bkit:test:file` must write. */
export const REPORT_ENV = "BKIT_TEST_REPORT";
/** The status row step a recorded red writes. */
export const RED_STEP = "build-task-red";

const NO_TEST_FILE_HINT =
  `declare "${BKIT_TEST_FILE_SCRIPT}" in package.json: it runs the one test file passed as its ` +
  `argument and writes a JUnit report to $${REPORT_ENV} ` +
  "(.bkit/workflows.md § Local gate scripts)";

export type CaseState = "passed" | "failure" | "error" | "skipped";
export interface JunitCase {
  name: string;
  state: CaseState;
  message: string;
}

const XML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, e: string) => {
    if (!e.startsWith("#")) return XML_ENTITIES[e.toLowerCase()] ?? whole;
    const cp = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
  });
}

const ATTRS = String.raw`((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)`;

function attr(attrs: string, name: string): string | undefined {
  const m = new RegExp(String.raw`\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)')`).exec(attrs);
  return m ? decodeXml(m[1] ?? m[2] ?? "") : undefined;
}

/** Every `<testcase>` in a JUnit report: its name, outcome and first failure message. */
export function parseJunit(xml: string): JunitCase[] {
  const body = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const cases: JunitCase[] = [];
  const testcase = new RegExp(String.raw`<testcase${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/testcase>)`, "g");
  const outcome = new RegExp(String.raw`<(failure|error|skipped)${ATTRS}`);
  for (const m of body.matchAll(testcase)) {
    const child = outcome.exec(m[2] ?? "");
    cases.push({
      name: attr(m[1] ?? "", "name") ?? "",
      state: child ? (child[1] as CaseState) : "passed",
      message: child ? (attr(child[2] ?? "", "message") ?? "") : "",
    });
  }
  return cases;
}

/** A report case is the named test when its name is the name, or ends with it as the last segment. */
export const isNamedCase = (caseName: string, want: string) =>
  caseName === want || caseName.endsWith(` ${want}`);

const caseNames = (cases: JunitCase[]) =>
  cases.length === 0
    ? "the report holds no tests"
    : `the report holds ${cases
        .slice(0, 5)
        .map((c) => `"${c.name}"`)
        .join(", ")}${cases.length > 5 ? ", …" : ""}`;

/** Why a run is not a red: `passed` means the code under test already exists. */
export type RedRefusal = "no-report" | "not-run" | "passed" | "skipped" | "exit-mismatch";

/** Why a run is not a valid red for `want` (kind + reason), or null when it is one. */
export function judgeRed(
  exitCode: number,
  cases: JunitCase[] | null,
  want: string,
): { kind: RedRefusal; reason: string } | null {
  if (cases === null)
    return {
      kind: "no-report",
      reason: `no JUnit report at $${REPORT_ENV} — ${BKIT_TEST_FILE_SCRIPT} must write one`,
    };
  const named = cases.filter((c) => isNamedCase(c.name, want));
  if (named.length === 0)
    return { kind: "not-run", reason: `the named test "${want}" did not run; ${caseNames(cases)}` };
  if (named.some((c) => c.state === "passed"))
    return {
      kind: "passed",
      reason: `"${want}" passed — a red must fail before the task's code exists`,
    };
  if (named.some((c) => c.state === "skipped"))
    return { kind: "skipped", reason: `"${want}" was skipped, not run` };
  if (exitCode === 0)
    return {
      kind: "exit-mismatch",
      reason: `"${want}" failed in the report but the script exited 0`,
    };
  return null;
}

/** Why a run is not green for `want`, or null when every case of the named test passed. */
export function judgeGreen(cases: JunitCase[] | null, want: string): string | null {
  if (cases === null)
    return `no JUnit report at $${REPORT_ENV} — ${BKIT_TEST_FILE_SCRIPT} must write one`;
  const named = cases.filter((c) => isNamedCase(c.name, want));
  if (named.length === 0) return `the named test "${want}" did not run; ${caseNames(cases)}`;
  const bad = named.find((c) => c.state !== "passed");
  return bad === undefined
    ? null
    : `"${want}" ${bad.state}${bad.message ? `: ${bad.message}` : ""}`;
}

export interface PlannedTest {
  test: string;
  name: string;
}

/** A human-recorded acceptance of a task's test-order gaps: the tests it covers, its 1-based plan lines. */
export interface TestOrderException {
  tests: PlannedTest[];
  lines: number[];
}

export type TestFirst =
  | { task: number; kind: "test"; tests: PlannedTest[]; exception?: TestOrderException }
  | { task: number; kind: "na"; reason: string }
  | { task: number; kind: "missing" | "malformed" };

/** A runbook task's bullet: `**Task N:**`, `**Task N — {title}.**`, `**Task N.**` or `**Task N**`. */
const TASK_LINE = /^\s*- \[[ xX]\] \*\*Task (\d+)(?=[\s:.*—–-])/;
/** A checkbox whose label is `Test first` itself: the template's Gate 2 item, a checklist line, never a test entry. */
const GATE_TEST_FIRST_LINE = /^\s*- \[[ xX]\] \*\*Test first:\*\*/;
const TEST_FIRST = "**Test first:**";
const TEST_ORDER_EXCEPTION = "**Test-order exception:**";

/** Plan-time caps (`.bkit/workflows.md` § Test-first): over any one → the plan is split before build. */
export const MAX_TASKS_PER_PLAN = 12;
export const MAX_TESTS_PER_TASK = 10;
export const MAX_TEST_FILES_PER_TASK = 3;

/** Per `;`-separated entry, the backticked spans; an entry with two or more names a test. */
const entrySpans = (text: string) =>
  splitEntries(text).map((e) => [...e.matchAll(/`([^`]+)`/g)].map((m) => m[1]!.trim()));
const plannedTests = (entries: string[][]): PlannedTest[] =>
  entries
    .filter((spans) => spans.length >= 2)
    .map((spans) => ({ test: path.posix.normalize(spans[0]!), name: spans[1]! }));

/** `text` split on `;` outside backticks. */
function splitEntries(text: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of text) {
    if (ch === "`") quoted = !quoted;
    if (ch === ";" && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  return [...out, cur];
}

/**
 * Each runbook task's `Test first:` line: one or more tests separated by `;` (per entry,
 * first backticked span = file, second = test name), `n/a — {reason}`, missing, or
 * malformed (an entry with one span, or no test at all). A task's text runs from its
 * bullet to the next bullet or heading. A `Test-order exception:` line inside it ends
 * the `Test first` text and names, in the same entry form, the tests it covers.
 */
export function readTestFirst(plan: string): TestFirst[] {
  const out: TestFirst[] = [];
  const lines = plan.split("\n");
  for (const { task, start: i, end } of taskSpans(lines)) {
    const own = lines.slice(i, end);
    const text = own.join(" ");
    const at = text.indexOf(TEST_FIRST);
    if (at < 0) {
      out.push({ task, kind: "missing" });
      continue;
    }
    const cut = text.indexOf(TEST_ORDER_EXCEPTION, at);
    const rest = text.slice(at + TEST_FIRST.length, cut < 0 ? undefined : cut).trim();
    if (/^n\/a\b/i.test(rest)) {
      out.push({ task, kind: "na", reason: rest.replace(/^n\/a\s*[—–-]?\s*/i, "") });
      continue;
    }
    const entries = entrySpans(rest);
    const tests = plannedTests(entries);
    if (tests.length === 0 || entries.some((spans) => spans.length === 1)) {
      out.push({ task, kind: "malformed" });
      continue;
    }
    const first = own.findIndex((l) => l.includes(TEST_ORDER_EXCEPTION));
    const excepted =
      cut < 0 ? [] : plannedTests(entrySpans(text.slice(cut + TEST_ORDER_EXCEPTION.length)));
    if (first < 0 || excepted.length === 0) {
      out.push({ task, kind: "test", tests });
      continue;
    }
    let last = own.length - 1;
    while (last > first && own[last]!.trim() === "") last--;
    const span = Array.from({ length: last - first + 1 }, (_, k) => i + first + k + 1);
    out.push({ task, kind: "test", tests, exception: { tests: excepted, lines: span } });
  }
  return out;
}

/** Each task bullet's number and its 0-based line span: the bullet to the next bullet or heading. */
function taskSpans(lines: string[]): Array<{ task: number; start: number; end: number }> {
  const out: Array<{ task: number; start: number; end: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    const head = TASK_LINE.exec(lines[i]!);
    if (!head) continue;
    let end = i + 1;
    while (end < lines.length && !/^\s*(- |#)/.test(lines[end]!)) end++;
    out.push({ task: Number(head[1]), start: i, end });
  }
  return out;
}

/**
 * 1-based lines carrying `**Test first:**` that no task bullet claims, so `readTestFirst`
 * never reads them. Mentions inside inline code or a fenced block are prose, not entries;
 * a checkbox labelled `Test first` itself (the template's Gate 2 item) is a checklist
 * line, not an entry.
 */
export function unclaimedTestFirst(plan: string): number[] {
  const lines = plan.split("\n");
  const claimed = new Set(
    taskSpans(lines).flatMap(({ start, end }) =>
      Array.from({ length: end - start }, (_, k) => start + k),
    ),
  );
  const out: number[] = [];
  let fence: string | null = null;
  for (const [i, line] of lines.entries()) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker !== undefined && (fence === null || marker.startsWith(fence))) {
      fence = fence === null ? marker : null;
      continue;
    }
    if (fence !== null || claimed.has(i)) continue;
    if (GATE_TEST_FIRST_LINE.test(line)) continue;
    if (line.replace(/(`+)[\s\S]*?\1/g, "").includes(TEST_FIRST)) out.push(i + 1);
  }
  return out;
}

export interface TaskSize {
  task: number;
  tests: number;
  files: number;
}

/** Per task, the planned tests and distinct test files it names (`n/a`, missing and malformed count 0). */
export const taskSizes = (specs: TestFirst[]): TaskSize[] =>
  specs.map((s) =>
    s.kind === "test"
      ? { task: s.task, tests: s.tests.length, files: new Set(s.tests.map((t) => t.test)).size }
      : { task: s.task, tests: 0, files: 0 },
  );

/** True when `after` keeps every non-blank line of `before`, in order, ignoring whitespace: lines were only added. */
export function onlyAddsLines(before: string, after: string): boolean {
  const norm = (text: string) =>
    text
      .split("\n")
      .map((l) => l.replace(/\s+/g, ""))
      .filter(Boolean);
  const want = norm(before);
  let kept = 0;
  for (const line of norm(after)) if (kept < want.length && line === want[kept]) kept++;
  return kept === want.length;
}

/** `test` as a repo-relative path inside `top`; usage error when absolute, outside, or absent. */
function repoTestPath(top: string, test: string): string {
  const rel = path.relative(top, path.resolve(top, test));
  if (path.isAbsolute(test) || rel.startsWith("..") || rel === "")
    throw new CommandError(EXIT.USAGE, `--test must be a path inside the repo, got "${test}"`);
  if (!fs.statSync(path.join(top, rel), { throwIfNoEntry: false })?.isFile())
    throw new CommandError(EXIT.USAGE, `--test ${rel} is not a file`);
  return rel.split(path.sep).join("/");
}

/** Run one test file through `bkit:test:file`; the report is read and removed. */
function runTestFile(
  top: string,
  test: string,
  log: string,
): { exitCode: number; cases: JunitCase[] | null } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-report-"));
  const report = path.join(dir, "junit.xml");
  const exitCode = runToLog([...scriptCommand(BKIT_TEST_FILE_SCRIPT), test], top, log, {
    [REPORT_ENV]: report,
  });
  const cases = fs.existsSync(report) ? parseJunit(fs.readFileSync(report, "utf-8")) : null;
  fs.rmSync(dir, { recursive: true, force: true });
  return { exitCode, cases };
}

const couldNotRunMessage = (exitCode: number) =>
  `${gateScope(BKIT_TEST_FILE_SCRIPT)} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no test executed`;

/** The copy of the test file a red keeps beside its log. */
export const snapshotPath = (log: string) => `${log.replace(/\.md$/, "")}.snapshot`;

const toplevel = (cwd: string) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;

/** A fence longer than any backtick run in `text`. */
const fenceFor = (text: string) =>
  "`".repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));

interface Gap {
  /** null for a plan-level gap (`test-first-unread`). */
  task: number | null;
  kind: string;
  detail: string;
}

/** Gaps about when a test was seen failing; no edit made after the task's code can close one. */
export const TEST_ORDER_GAPS: ReadonlySet<string> = new Set([
  "no-red",
  "late-red",
  "red-mismatch",
  "red-evidence-missing",
  "test-changed",
]);

/** The status row step plan-execute's finish writes; its commit carries the code of each task its log records DONE. */
export const PLAN_EXECUTE_STEP = "build-plan-execute";

const repoRel = (top: string, cwd: string, p: string) =>
  path.relative(top, path.resolve(cwd, p)).split(path.sep).join("/");

/**
 * Per task, the first plan-execute step commit whose log records the task `DONE` — the
 * commit that first holds the task's code. `steps finish` writes the row then commits
 * everything, so a row's commit is the first commit after its `parentSha` touching the status file.
 */
function taskCodeCommits(
  top: string,
  cwd: string,
  file: string,
  workflow: string,
  subPlan: number | undefined,
): Map<number, string> {
  const statusRel = repoRel(top, cwd, file);
  const commits = new Map<number, string>();
  for (const r of readStatusRows(file) as Array<Record<string, unknown>>) {
    if (r.type !== "step-done" || r.workflow !== workflow || r.step !== PLAN_EXECUTE_STEP) continue;
    if (subPlan !== undefined && r.subPlan !== subPlan) continue;
    const log = Array.isArray(r.artifacts) ? r.artifacts.map(String)[0] : undefined;
    if (typeof r.parentSha !== "string" || log === undefined) continue;
    const range = `${r.parentSha}..HEAD`;
    const commit = git(top, ["rev-list", "--reverse", "--ancestry-path", range, "--", statusRel])
      ?.split("\n")
      .find(Boolean);
    const text =
      commit === undefined ? null : git(top, ["show", `${commit}:${repoRel(top, cwd, log)}`]);
    if (commit === undefined || text === null) continue;
    for (const m of text.matchAll(/^DONE\s*[—–-]+\s*Task\s+(\d+)\b/gm))
      if (!commits.has(Number(m[1]))) commits.set(Number(m[1]), commit);
  }
  return commits;
}

/**
 * Why a task's `Test-order exception:` lines do not count, or null when they do: every
 * line committed, and last changed by a commit that does not write the status file.
 * Every workflow step commit writes it, so a line riding one is refused; agents are
 * barred from committing, so the remaining commits are human-made.
 */
function exceptionRefusal(
  top: string,
  plan: string,
  lines: number[],
  statusRel: string,
): string | null {
  const blame = git(top, ["blame", "--porcelain", "-L", `${lines[0]},${lines.at(-1)}`, "--", plan]);
  if (blame === null) return "the plan file is not committed";
  const shas = new Set([...blame.matchAll(/^([0-9a-f]{40}) \d+ \d+/gm)].map((m) => m[1]!));
  if ([...shas].some((s) => /^0+$/.test(s)))
    return "the line is not committed — a human commits it before the build re-runs";
  for (const sha of shas) {
    const files = git(top, ["show", "--name-only", "--format=", sha])?.split("\n") ?? [];
    if (files.includes(statusRel))
      return `last changed by ${sha.slice(0, 7)}, a workflow step commit (it also writes \`${statusRel}\`) — commit the line in a commit that does not touch it`;
  }
  return null;
}

interface ExceptionResult {
  task: number;
  refusal: string | null;
  cleared: string[];
}

interface AuditRow {
  task: number;
  test: string;
  red: string;
  changed: string;
  green: string;
}

/** The red rows of status.jsonl for this workflow and sub-plan, oldest first. */
function redRows(file: string, workflow: string, subPlan: number | undefined) {
  return readStatusRows(file).filter((r) => {
    const row = r as Record<string, unknown>;
    return (
      row.type === "step-done" &&
      row.workflow === workflow &&
      row.step === RED_STEP &&
      (subPlan === undefined || row.subPlan === subPlan)
    );
  }) as Array<Record<string, unknown>>;
}

function writeAuditReport(
  log: string,
  o: {
    enforced: boolean;
    reason?: string;
    plan?: string;
    rows: AuditRow[];
    gaps: Gap[];
    testOrderOnly: boolean;
    exceptions: ExceptionResult[];
    lateUnchecked: number[];
    diffs: Array<{ task: number; test: string; diff: string }>;
    outputs: Array<{ test: string; tail: string }>;
  },
): void {
  const out = [
    `Enforced: ${o.enforced}`,
    `Gaps: ${o.gaps.length}`,
    `Test order only: ${o.testOrderOnly}`,
    "",
    "<!-- verdict:end -->",
    "",
  ];
  out.push("# Test-First Audit", "");
  if (o.plan) out.push(`Plan: \`${o.plan}\``, "");
  if (!o.enforced) out.push(`Not enforced: ${o.reason}.`, "");
  if (o.rows.length > 0) {
    out.push(
      "| Task | Test | Red | Changed since red | Green |",
      "| --- | --- | --- | --- | --- |",
    );
    for (const r of o.rows)
      out.push(`| ${r.task} | ${r.test} | ${r.red} | ${r.changed} | ${r.green} |`);
    out.push("");
  }
  out.push("## Gaps", "");
  if (o.gaps.length === 0) out.push("None.");
  for (const g of o.gaps)
    out.push(`- ${g.task === null ? "Plan" : `Task ${g.task}`} \`${g.kind}\` — ${g.detail}`);
  if (o.exceptions.length > 0) out.push("", "## Test-order exceptions", "");
  for (const e of o.exceptions)
    out.push(
      e.refusal === null
        ? `- Task ${e.task} — honoured; cleared ${e.cleared.length > 0 ? e.cleared.join(", ") : "nothing"}`
        : `- Task ${e.task} — not honoured: ${e.refusal}`,
    );
  if (o.lateUnchecked.length > 0) out.push("", "## Late-red check", "");
  for (const task of o.lateUnchecked)
    out.push(
      `- Task ${task} — not checked: no plan-execute step commit's log records \`DONE — Task ${task}\`, so when its code landed is unknown`,
    );
  for (const d of o.diffs) {
    const fence = fenceFor(d.diff);
    out.push(
      "",
      `## Diff since red — Task ${d.task} \`${d.test}\``,
      "",
      `${fence}diff`,
      d.diff,
      fence,
    );
  }
  for (const t of o.outputs) {
    const fence = fenceFor(t.tail);
    out.push("", `## Runner output — \`${t.test}\``, "", fence, t.tail, fence);
  }
  fs.mkdirSync(path.dirname(log), { recursive: true });
  fs.writeFileSync(log, `${out.join("\n")}\n`);
}

export const testsCommand: CommandSpec = {
  noun: "tests",
  summary:
    "Run the deepest declared local gate, or one test file to record a red and audit a green.",
  verbs: {
    run: {
      summary: "Run the first declared --gate; exit 0 PASS, 1 FAIL, 4 could not run.",
      flags: [
        {
          name: "gate",
          type: "string",
          required: true,
          repeatable: true,
          help: "candidate package.json script, deepest first; the first declared one runs",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "file the full test output is saved to (directories are created)",
        },
        {
          name: "tail",
          type: "string",
          help: `lines of the log echoed to stderr afterwards (default ${DEFAULT_TAIL}; 0 for none)`,
        },
        {
          name: "artifact",
          type: "string",
          help: "copy the log here, trim the copy (debug-evidence) and record the clamp; needs --fid and --step",
        },
        { name: "fid", type: "string", help: "--artifact: feature id, for the clamp log" },
        { name: "step", type: "string", help: "--artifact: step name, for the clamp log" },
        { name: "attempt", type: "string", help: "--artifact: attempt, for the clamp log" },
      ],
      output: {
        verdict: "PASS | FAIL (null when the gate could not run)",
        exitCode: "the gate's exit code",
        gate: "the script that ran",
        scope: "the command that ran, as status rows record it",
        failures: `0 on PASS; on FAIL the failing + erroring test cases in the JUnit reports, or null when no report counts any (unknown, never 0)`,
        reports: `{log}.reports — emptied before the run and passed to the gate as $${REPORT_DIR_ENV}`,
        log: "where the full output was saved (as given); the untouched original",
        logBytes: "size of the saved output",
        artifact: "--artifact as given, else null",
        clamp: "the artifact's clamp record (raw = the log, source = scope), else null",
      },
      textOmit: ["clamp"],
      exitCodes: {
        [EXIT_NO_GATE]: "no candidate gate is declared in package.json",
        [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
        [EXIT_ARTIFACT_STEP]: "--artifact could not be written, trimmed or recorded",
      },
      run: (ctx) => {
        const candidates = ctx.flags.gate as string[];
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
        const artifact = str(ctx.flags.artifact);
        const fid = str(ctx.flags.fid);
        const step = str(ctx.flags.step);
        const attempt = positiveInt(ctx.flags.attempt, "attempt");
        if (artifact !== undefined && (!fid || !step))
          throw new CommandError(EXIT.USAGE, "--artifact needs --fid and --step");
        const tailRaw = str(ctx.flags.tail) ?? String(DEFAULT_TAIL);
        if (!/^[0-9]+$/.test(tailRaw)) {
          throw new CommandError(
            EXIT.USAGE,
            `--tail must be a non-negative integer, got "${tailRaw}"`,
          );
        }
        // Gates are declared and run at the top of the checkout being tested (the
        // feature worktree), wherever in it the caller happens to stand.
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const gate = resolveGate(top, candidates);
        if (gate === null) {
          const read = readPackageJson(top);
          if (!read.ok) ctx.log(`package.json at ${top} is ${read.reason}`);
          ctx.log(
            `no bkit:gate:* script declared (looked for ${candidates.join(", ")}) — ${NO_GATE_HINT}`,
          );
          return EXIT_NO_GATE;
        }
        const scope = gateScope(gate);
        const log = path.resolve(ctx.cwd, logArg);
        const reports = freshReportDir(log);
        ctx.log(`running ${scope} — full output in ${logArg}`);
        const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
        const exitCode = runToLog(scriptCommand(gate), top, log, { [REPORT_DIR_ENV]: reports });
        for (const line of Number(tailRaw) > 0 ? tailLines(log, Number(tailRaw)) : [])
          ctx.log(line);
        const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
        const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
        const counted = countReportFailures(reports);
        if (counted === null) ctx.log(NO_REPORT_HINT);
        else if (verdict === "FAIL" && counted === 0)
          ctx.log(
            `the JUnit reports in $${REPORT_DIR_ENV} hold no failing case — the gate failed outside its reported tests; failures unknown`,
          );
        const failures = verdict === "PASS" ? 0 : counted !== null && counted > 0 ? counted : null;
        let clamp: ClampRecord | null = null;
        let artifactFailed: string | null = null;
        if (artifact !== undefined) {
          try {
            const out = path.resolve(ctx.cwd, artifact);
            fs.mkdirSync(path.dirname(out), { recursive: true });
            fs.copyFileSync(log, out);
            const clampLog = clampLogPath(ctx.cwd, fid!, step!, attempt);
            fs.mkdirSync(path.dirname(clampLog), { recursive: true });
            fs.writeFileSync(clampLog, "");
            clamp = clampFile(out, "debug-evidence", artifact, {
              rawDir: null,
              source: scope,
              fetchedAt,
              original: log,
            });
            appendRecord(clampLog, clamp);
          } catch (err) {
            // The verdict stands; the step's artifact is what failed.
            clamp = null;
            artifactFailed = (err as Error).message;
          }
        }
        ctx.emit({
          verdict,
          exitCode,
          gate,
          scope,
          failures,
          reports: `${logArg}.reports`,
          log: logArg,
          logBytes: fs.statSync(log).size,
          artifact: artifact ?? null,
          clamp,
        });
        if (artifactFailed !== null) {
          ctx.log(`--artifact ${artifact}: ${artifactFailed}`);
          return EXIT_ARTIFACT_STEP;
        }
        if (couldNotRun) {
          ctx.log(
            `${scope} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`,
          );
          return EXIT_COULD_NOT_RUN;
        }
        ctx.log(`verdict ${verdict} (exit ${exitCode})`);
        return verdict === "PASS" ? EXIT.OK : EXIT.NO;
      },
    },
    red: {
      summary:
        "Run a task's new test before its code exists; exit 0 red recorded, 1 not a red (the named test did not run, passed, or was skipped).",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        SUB_PLAN_FLAG,
        {
          name: "task",
          type: "string",
          required: true,
          help: "plan task number (positive integer)",
        },
        {
          name: "test",
          type: "string",
          required: true,
          help: "the test file, repo-relative — passed whole to bkit:test:file",
        },
        {
          name: "name",
          type: "string",
          required: true,
          help: "the test's name as the runner reports it, or its last segment",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "file the runner output is saved to; the test file's copy lands beside it as .snapshot",
        },
      ],
      output: {
        recorded: "true when the red row was written, or already recorded for this unchanged test",
        already:
          "true when an earlier red for this task, test and name stands (test unchanged); nothing ran",
        refused: "no-report | not-run | passed | skipped | exit-mismatch (when recorded is false)",
        reason: "why the run is not a red (when recorded is false)",
        exitCode: "the script's exit code",
        row: "the build-task-red row written (when recorded)",
        log: "where the runner output was saved (as given)",
      },
      exitCodes: {
        [EXIT_NO_GATE]: `${BKIT_TEST_FILE_SCRIPT} is not declared in package.json`,
        [EXIT_COULD_NOT_RUN]: "the script could not run (exit 126 / 127)",
      },
      run: (ctx) => {
        const workflow = String(ctx.flags.workflow);
        const subPlan = positiveInt(ctx.flags.subPlan, "sub-plan");
        const task = positiveInt(ctx.flags.task, "task")!;
        const name = String(ctx.flags.name).trim();
        if (name === "") throw new CommandError(EXIT.USAGE, "--name must be non-empty");
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
        const top = toplevel(ctx.cwd);
        if (resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) === null) {
          ctx.log(`${BKIT_TEST_FILE_SCRIPT} is not declared — ${NO_TEST_FILE_HINT}`);
          return EXIT_NO_GATE;
        }
        const test = repoTestPath(top, String(ctx.flags.test));
        const blob = git(top, ["hash-object", "--", test]);
        const status = statusFile(ctx);
        const prior = fs.existsSync(status)
          ? redRows(status, workflow, subPlan)
              .reverse()
              .find((r) => r.task === task && r.test === test && r.testName === name)
          : undefined;
        if (prior !== undefined && prior.testBlob === blob) {
          const priorLog = Array.isArray(prior.artifacts) ? String(prior.artifacts[0]) : null;
          ctx.emit({ recorded: true, already: true, row: prior, log: priorLog });
          ctx.log(`red already recorded for task ${task}: "${name}" (test unchanged since)`);
          return EXIT.OK;
        }
        const log = path.resolve(ctx.cwd, logArg);
        const { exitCode, cases } = runTestFile(top, test, log);
        if (COULD_NOT_RUN_EXIT_CODES.has(exitCode)) {
          ctx.log(couldNotRunMessage(exitCode));
          return EXIT_COULD_NOT_RUN;
        }
        const refusal = judgeRed(exitCode, cases, name);
        if (refusal !== null) {
          ctx.emit({
            recorded: false,
            refused: refusal.kind,
            reason: refusal.reason,
            exitCode,
            log: logArg,
          });
          ctx.log(`not a red (${refusal.kind}): ${refusal.reason} — full output in ${logArg}`);
          return EXIT.NO;
        }
        const snapshot = snapshotPath(log);
        fs.copyFileSync(path.join(top, test), snapshot);
        const failed = cases!.find((c) => isNamedCase(c.name, name))!;
        const written = writeStepRow(
          ctx.cwd,
          {
            file: statusFile(ctx),
            workflow,
            step: RED_STEP,
            subPlan,
            artifacts: [path.relative(ctx.cwd, log), path.relative(ctx.cwd, snapshot)],
            extras: {
              task,
              test,
              testName: name,
              testBlob: blob,
              exitCode,
              failure: failed.message.slice(0, 200),
            },
            commit: "none",
          },
          ctx.log,
        );
        ctx.emit({ recorded: true, exitCode, row: written.row, log: logArg });
        ctx.log(`red recorded for task ${task}: "${name}" failed (${failed.state})`);
        return EXIT.OK;
      },
    },
    green: {
      summary:
        "Audit a sub-plan's test-first evidence (a red per planned test recorded before the task's code commit, the test only added to since, the named test passing now); exit 0 no gaps, 1 gaps.",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        SUB_PLAN_FLAG,
        {
          name: "plan",
          type: "string",
          required: true,
          repeatable: true,
          help: "candidate plan file; the first that exists is audited",
        },
        {
          name: "brief",
          type: "string",
          help: "the build input, audited when no plan file exists and it carries `**Task N:**` lines with `Test first:`",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "file the audit report is written to (directories are created)",
        },
      ],
      output: {
        enforced: "false when there is nothing to audit (reason says why)",
        reason: "why test-first is not enforced",
        plan: "the plan file audited (the brief when no plan file exists and it carries Test first lines)",
        gaps: "[{task, kind, detail}]: no-test-first | test-first-malformed | test-first-unread (task null) | no-red | late-red | red-mismatch | red-evidence-missing | test-changed | not-green",
        testOrderOnly:
          "true when there are gaps and every one is a test-order gap (no-red | late-red | red-mismatch | red-evidence-missing | test-changed)",
        lateRedUnchecked:
          "tasks with a red but no plan-execute step commit whose log records `DONE — Task N`: the late-red check could not run for them",
        log: "where the report was written (as given)",
      },
      exitCodes: {
        [EXIT_COULD_NOT_RUN]: `${BKIT_TEST_FILE_SCRIPT} could not run (exit 126 / 127)`,
      },
      run: (ctx) => {
        const workflow = String(ctx.flags.workflow);
        const subPlan = positiveInt(ctx.flags.subPlan, "sub-plan");
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
        const log = path.resolve(ctx.cwd, logArg);
        const top = toplevel(ctx.cwd);
        const exists = (p: string) => fs.existsSync(path.resolve(ctx.cwd, p));
        const planFile = (ctx.flags.plan as string[]).find(exists);
        const briefArg = str(ctx.flags.brief);
        const brief =
          planFile === undefined && briefArg !== undefined && exists(briefArg)
            ? briefArg
            : undefined;
        const plan = planFile ?? brief;
        const planText = plan ? fs.readFileSync(path.resolve(ctx.cwd, plan), "utf-8") : "";
        const specs = readTestFirst(planText);
        // A `Test first:` line no task bullet claims keeps the audit on: the plan has
        // test-first entries this reader cannot place, never "nothing to audit".
        const unread = unclaimedTestFirst(planText);
        const reason =
          plan === undefined
            ? "no plan file — the build runs from its brief"
            : !specs.some((s) => s.kind !== "missing") && unread.length === 0
              ? brief !== undefined
                ? "no plan file, and the brief has no `**Task N:**` lines with `Test first:`"
                : "the plan has no `Test first:` lines"
              : resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) === null
                ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
                : undefined;
        const empty = {
          rows: [],
          gaps: [],
          testOrderOnly: false,
          exceptions: [],
          lateUnchecked: [],
          diffs: [],
          outputs: [],
        };
        if (reason !== undefined) {
          writeAuditReport(log, { enforced: false, reason, plan, ...empty });
          ctx.emit({
            enforced: false,
            reason,
            plan: plan ?? null,
            gaps: [],
            testOrderOnly: false,
            lateRedUnchecked: [],
            log: logArg,
          });
          ctx.log(`test-first not enforced: ${reason}`);
          return EXIT.OK;
        }

        const reds = redRows(statusFile(ctx), workflow, subPlan);
        const statusRel = repoRel(top, ctx.cwd, statusFile(ctx));
        const codeCommits = taskCodeCommits(top, ctx.cwd, statusFile(ctx), workflow, subPlan);
        const exceptions: ExceptionResult[] = [];
        const lateUnchecked = new Set<number>();
        const gaps: Gap[] = [];
        const rows: AuditRow[] = [];
        const diffs: Array<{ task: number; test: string; diff: string }> = [];
        const outputs: Array<{ test: string; tail: string }> = [];
        const greens = new Map<string, { cases: JunitCase[] | null; tail: string }>();
        /** One run per test file; null when the script could not run. */
        const greenRun = (test: string) => {
          const cached = greens.get(test);
          if (cached !== undefined) return cached;
          const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-green-"));
          const runLog = path.join(dir, "output.log");
          const { exitCode, cases } = runTestFile(top, test, runLog);
          const tail = tailLines(runLog, DEFAULT_TAIL).join("\n");
          fs.rmSync(dir, { recursive: true, force: true });
          if (COULD_NOT_RUN_EXIT_CODES.has(exitCode)) {
            ctx.log(couldNotRunMessage(exitCode));
            return null;
          }
          const run = { cases, tail };
          greens.set(test, run);
          return run;
        };
        for (const s of specs) {
          if (s.kind === "na") continue;
          if (s.kind !== "test") {
            gaps.push({
              task: s.task,
              kind: s.kind === "missing" ? "no-test-first" : "test-first-malformed",
              detail:
                s.kind === "missing"
                  ? "the task has no `Test first:` line"
                  : "`Test first:` is neither `n/a — {reason}` nor `;`-separated entries of a backticked test file and test name",
            });
            continue;
          }
          const excepted = s.exception;
          const exception: ExceptionResult | undefined =
            excepted === undefined
              ? undefined
              : {
                  task: s.task,
                  refusal: exceptionRefusal(
                    top,
                    repoRel(top, ctx.cwd, plan!),
                    excepted.lines,
                    statusRel,
                  ),
                  cleared: [],
                };
          if (exception !== undefined) exceptions.push(exception);
          const taskReds = reds.filter((r) => r.task === s.task);
          const planned = (r: Record<string, unknown>) =>
            s.tests.some((t) => t.test === r.test && t.name === r.testName);
          for (const t of s.tests) {
            const row: AuditRow = {
              task: s.task,
              test: `\`${t.test}\` "${t.name}"`,
              red: "missing",
              changed: "—",
              green: "—",
            };
            rows.push(row);
            const clearing =
              exception?.refusal === null &&
              excepted!.tests.some((e) => e.test === t.test && e.name === t.name)
                ? exception
                : undefined;
            const gap = (kind: string, detail: string) => {
              if (clearing !== undefined && TEST_ORDER_GAPS.has(kind))
                clearing.cleared.push(`\`${kind}\` for \`${t.test}\` "${t.name}"`);
              else gaps.push({ task: s.task, kind, detail });
            };
            const red = [...taskReds]
              .reverse()
              .find((r) => r.test === t.test && r.testName === t.name);
            const unplanned = taskReds.filter((r) => !planned(r));
            if (red === undefined && unplanned.length > 0) {
              const recorded: string[] = [];
              for (const r of unplanned) {
                const rTest = String(r.test);
                const rName = String(r.testName);
                let now = "file missing";
                if (fs.existsSync(path.join(top, rTest))) {
                  const run = greenRun(rTest);
                  if (run === null) return EXIT_COULD_NOT_RUN;
                  const why = judgeGreen(run.cases, rName);
                  now = why === null ? "passes now" : `not passing: ${why}`;
                }
                recorded.push(`\`${rTest}\` "${rName}" (${now})`);
              }
              gap(
                "red-mismatch",
                `no red for \`${t.test}\` "${t.name}"; reds recorded for ${recorded.join(", ")}`,
              );
            } else if (red === undefined) {
              gap(
                "no-red",
                `no red recorded for "${t.name}" — the test was never seen failing before the code`,
              );
            } else {
              row.red = `recorded ${String(red.at)}`;
              const code = codeCommits.get(s.task);
              const on = typeof red.parentSha === "string" ? red.parentSha : undefined;
              if (code === undefined || on === undefined) lateUnchecked.add(s.task);
              else if (runGit(top, ["merge-base", "--is-ancestor", code, on]).ok) {
                row.red = `late — ${row.red}`;
                gap(
                  "late-red",
                  `the red for "${t.name}" was recorded on ${on.slice(0, 7)}, on or after ${code.slice(0, 7)}, the first commit whose plan-execute log records Task ${s.task} DONE — the task's code already existed`,
                );
              }
              const snap = (Array.isArray(red.artifacts) ? red.artifacts : [])
                .map(String)
                .find((a) => a.endsWith(".snapshot"));
              const snapAbs = snap === undefined ? undefined : path.resolve(ctx.cwd, snap);
              const testAbs = path.join(top, t.test);
              if (snapAbs === undefined || !fs.existsSync(snapAbs)) {
                row.changed = "unknown";
                gap(
                  "red-evidence-missing",
                  `the red's test snapshot ${snap ?? "(none recorded)"} is missing`,
                );
              } else if (!fs.existsSync(testAbs)) {
                row.changed = "deleted";
                gap("test-changed", `\`${t.test}\` no longer exists`);
              } else if (!fs.readFileSync(snapAbs).equals(fs.readFileSync(testAbs))) {
                const added = onlyAddsLines(
                  fs.readFileSync(snapAbs, "utf-8"),
                  fs.readFileSync(testAbs, "utf-8"),
                );
                row.changed = added ? "added lines only" : "yes";
                if (!added)
                  gap(
                    "test-changed",
                    `\`${t.test}\` differs from its red snapshot for "${t.name}" (diff below)`,
                  );
                const diff = runGit(top, [
                  "diff",
                  "--no-index",
                  "--no-color",
                  "--",
                  path.relative(top, snapAbs),
                  t.test,
                ]);
                diffs.push({ task: s.task, test: t.test, diff: diff.stdout });
              } else row.changed = "no";
            }

            if (!fs.existsSync(path.join(top, t.test))) {
              row.green = "file missing";
              gap("not-green", `\`${t.test}\` does not exist`);
              continue;
            }
            const green = greenRun(t.test);
            if (green === null) return EXIT_COULD_NOT_RUN;
            const why = judgeGreen(green.cases, t.name);
            row.green = why === null ? "passed" : "not passed";
            if (why !== null) {
              gap("not-green", why);
              if (!outputs.some((o) => o.test === t.test))
                outputs.push({ test: t.test, tail: green.tail });
            }
          }
        }
        for (const line of unread)
          gaps.push({
            task: null,
            kind: "test-first-unread",
            detail: `\`${plan}:${line}\` carries \`**Test first:**\` outside every task bullet (\`- [ ] **Task N:**\`), so its tests were not audited — the plan's task line needs fixing`,
          });
        const testOrderOnly = gaps.length > 0 && gaps.every((g) => TEST_ORDER_GAPS.has(g.kind));
        writeAuditReport(log, {
          enforced: true,
          plan,
          rows,
          gaps,
          testOrderOnly,
          exceptions,
          lateUnchecked: [...lateUnchecked].sort((a, b) => a - b),
          diffs,
          outputs,
        });
        ctx.emit({
          enforced: true,
          plan,
          gaps,
          testOrderOnly,
          lateRedUnchecked: [...lateUnchecked].sort((a, b) => a - b),
          log: logArg,
        });
        ctx.log(`test-first audit: ${gaps.length} gap(s) — report in ${logArg}`);
        return gaps.length === 0 ? EXIT.OK : EXIT.NO;
      },
    },
    "plan-check": {
      summary:
        "Count a plan's tasks and each task's Test first tests and test files against the caps, and find Test first lines no task claims; prints SINGLE | SPLIT; exit 0 read, 1 unread lines (or, with --children, a sub-plan still over a cap).",
      flags: [
        {
          name: "plan",
          type: "string",
          required: true,
          repeatable: true,
          help: "candidate plan file; the first that exists is checked, with its `{stem}-{N}.md` sub-plans when any exist",
        },
        {
          name: "brief",
          type: "string",
          help: "the build input, checked when no plan file exists",
        },
        {
          name: "children",
          type: "boolean",
          help: "check only the sub-plans `{stem}-{N}.md` beside the first --plan `{stem}.md` (that file need not exist); each must fit (SINGLE)",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "file the report is written to, `Verdict:` header first (directories are created)",
        },
      ],
      output: {
        verdict: `SPLIT when a plan has more than ${MAX_TASKS_PER_PLAN} tasks or a task names more than ${MAX_TESTS_PER_TASK} tests or ${MAX_TEST_FILES_PER_TASK} test files; else SINGLE`,
        plans:
          "[{plan, tasks, sizes: [{task, tests, files}], overCap: [{task, tests, files}], unread: [line], quotes: [line text]}]: every file checked; [] when none exists",
        unread: "count of `**Test first:**` lines no task bullet claims, across every file",
        log: "where the report was written (as given)",
      },
      run: (ctx) => {
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
        const exists = (p: string) => fs.existsSync(path.resolve(ctx.cwd, p));
        const briefArg = str(ctx.flags.brief);
        /** `{stem}-{N}.md` beside `base` (`{stem}.md`), in N order; `base` itself need not exist. */
        const siblings = (base: string): string[] => {
          const dir = path.dirname(base);
          const stem = path.basename(base, ".md");
          const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const child = new RegExp(`^${escaped}-(\\d+)\\.md$`);
          const abs = path.resolve(ctx.cwd, dir);
          return (fs.existsSync(abs) ? fs.readdirSync(abs) : [])
            .map((f) => child.exec(f))
            .filter((m) => m !== null)
            .sort((a, b) => Number(a[1]) - Number(b[1]))
            .map((m) => path.posix.join(dir.split(path.sep).join("/"), m[0]));
        };
        const planArgs = ctx.flags.plan as string[];
        const children = ctx.flags.children === true;
        let files: string[];
        if (children) {
          files = siblings(planArgs[0]!);
          if (files.length === 0) {
            const stem = path.basename(planArgs[0]!, ".md");
            throw new CommandError(
              EXIT.USAGE,
              `no sub-plans \`${stem}-{N}.md\` in ${path.dirname(planArgs[0]!)}`,
            );
          }
        } else {
          // A split feature's master plan holds no tasks: its sub-plans carry them, so they
          // are checked with it. The brief never has sub-plans.
          const plan = planArgs.find(exists);
          const brief = briefArg !== undefined && exists(briefArg) ? briefArg : undefined;
          files =
            plan !== undefined ? [plan, ...siblings(plan)] : brief !== undefined ? [brief] : [];
        }
        const plans = files.map((plan) => {
          const text = fs.readFileSync(path.resolve(ctx.cwd, plan), "utf-8");
          const sizes = taskSizes(readTestFirst(text));
          const overCap = sizes.filter(
            (t) => t.tests > MAX_TESTS_PER_TASK || t.files > MAX_TEST_FILES_PER_TASK,
          );
          const unread = unclaimedTestFirst(text);
          const lines = text.split("\n");
          const quotes = unread.map((n) => lines[n - 1]!.trim());
          return { plan, tasks: sizes.length, sizes, overCap, unread, quotes };
        });
        const tooBig = plans.filter((p) => p.tasks > MAX_TASKS_PER_PLAN || p.overCap.length > 0);
        const verdict = tooBig.length > 0 ? "SPLIT" : "SINGLE";
        const unread = plans.reduce((n, p) => n + p.unread.length, 0);

        const caps = `${MAX_TASKS_PER_PLAN} tasks per plan, ${MAX_TESTS_PER_TASK} \`Test first\` tests and ${MAX_TEST_FILES_PER_TASK} test files per task`;
        const why = (p: (typeof plans)[number]) => [
          ...(p.tasks > MAX_TASKS_PER_PLAN ? [`${p.tasks} tasks`] : []),
          ...p.overCap.map(
            (t) => `Task ${t.task} names ${t.tests} tests across ${t.files} test files`,
          ),
        ];
        const fit =
          plans.length === 0
            ? "No plan file or brief exists, so nothing was checked."
            : tooBig.length === 0
              ? `${plans.map((p) => `\`${p.plan}\`: ${p.tasks} tasks`).join("; ")}; every task within the caps (${caps}).`
              : `Over the caps (${caps}): ${tooBig.map((p) => `\`${p.plan}\` — ${why(p).join("; ")}`).join(". ")}.`;
        const out = [
          `Verdict: ${verdict}`,
          `Unread: ${unread}`,
          "",
          "<!-- verdict:end -->",
          "",
          "# Plan Check",
          "",
          "## Session Fit Estimate",
          "",
          fit,
        ];
        for (const p of plans) {
          const { sizes } = p;
          out.push("", `## Tasks — \`${p.plan}\``, "");
          if (sizes.length === 0) out.push("No task bullets read.");
          else {
            out.push("| Task | Tests | Test files | Over cap |", "| --- | --- | --- | --- |");
            for (const t of sizes) {
              const over = [
                ...(t.tests > MAX_TESTS_PER_TASK ? [`tests > ${MAX_TESTS_PER_TASK}`] : []),
                ...(t.files > MAX_TEST_FILES_PER_TASK
                  ? [`files > ${MAX_TEST_FILES_PER_TASK}`]
                  : []),
              ];
              out.push(
                `| ${t.task} | ${t.tests} | ${t.files} | ${over.length ? over.join(", ") : "no"} |`,
              );
            }
          }
        }
        out.push("", "## Unread `Test first` lines", "");
        if (unread === 0) out.push("None.");
        for (const p of plans) {
          p.unread.forEach((line, i) =>
            out.push(
              `- \`${p.plan}:${line}\` — \`**Test first:**\` outside every task bullet; write the task as \`- [ ] **Task N:** … **Test first:** …\``,
              `  > ${p.quotes[i]}`,
            ),
          );
          if (p.tasks === 0 && p.unread.length > 0)
            out.push(
              `- \`${p.plan}\`: no \`- [ ] **Task N:**\` bullet was read. Tasks labelled another way (\`**T1:**\`, a \`**Test first:**\` sub-bullet under the task) are not tasks to the engine; relabel each as \`- [ ] **Task N:** … **Test first:** …\` on one bullet.`,
            );
        }
        const log = path.resolve(ctx.cwd, logArg);
        fs.mkdirSync(path.dirname(log), { recursive: true });
        fs.writeFileSync(log, `${out.join("\n")}\n`);
        ctx.emit({ verdict, plans, unread, log: logArg });
        ctx.log(
          `plan check: ${verdict}, ${unread} unread \`Test first\` line(s) — report in ${logArg}`,
        );
        return unread > 0 || (children && verdict === "SPLIT") ? EXIT.NO : EXIT.OK;
      },
    },
  },
};
