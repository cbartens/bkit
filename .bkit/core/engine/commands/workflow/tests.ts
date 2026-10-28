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
import { parseJson } from "../../shared/json.js";
import { readPackageJson } from "../../shared/package-json.js";
import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
import { CONFIG_DEFAULTS, readBkitConfig, type TaskCaps } from "../../shared/settings.js";
import {
  FILE_FLAG,
  GROUP_FLAG,
  WORKFLOW_FLAG,
  positiveInt,
  readStatusRows,
  statusFile,
  str,
} from "./status.js";
import {
  NO_MARKERS_REASON,
  derivedTestMatrix,
  fenceNeverClosed,
  parsePlanBlocks,
  reuseInventory,
  supersessionInventory,
  type PlanTaskBlock,
} from "./plan-blocks.js";
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
  fs
    .readFileSync(file, "utf-8")
    .replace(/\r?\n$/, "")
    .split(/\r?\n/)
    .slice(-n);

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

/** The task field naming a task's tests, and the one recording an accepted test-order gap. */
export const TEST_FIRST = "**TEST FIRST:**";
export const TEST_EXCEPTION = "**TEST EXCEPTION:**";

/** The plan caps `package.json` `bkit.workflows.tasks` sets for the checkout `cwd` sits in. */
export const planCaps = (cwd: string): TaskCaps => readBkitConfig(toplevel(cwd)).tasks;

/** The caps as the plan-check report and help state them. */
export const capsText = (c: TaskCaps) =>
  `${c.maxPerGroup} tasks and ${c.maxTestsPerGroup} TEST FIRST tests per group; ${c.maxTestsPerTask} tests across ${c.maxTestFilesPerTask} test files per task`;

/** A task block's TEST FIRST read as one `TestFirst`; a TEST EXCEPTION with no TEST FIRST is its `n/a`. */
function testFirstOf(t: PlanTaskBlock): TestFirst {
  const { task, testFirst: tf, testException: exc } = t;
  const plain = (tests: PlannedTest[]) => tests.map(({ test, name }) => ({ test, name }));
  if (tf === undefined)
    return exc === undefined ? { task, kind: "missing" } : { task, kind: "na", reason: exc.text };
  if (tf.malformed.length > 0 || (tf.tests.length === 0 && tf.na === undefined))
    return { task, kind: "malformed" };
  if (tf.tests.length === 0) return { task, kind: "na", reason: tf.na! };
  const tests = plain(tf.tests);
  return exc === undefined || exc.tests.length === 0
    ? { task, kind: "test", tests }
    : { task, kind: "test", tests, exception: { tests: plain(exc.tests), lines: exc.lines } };
}

/**
 * Each task block's TEST FIRST field (`plan-blocks.ts`): one test per sub-bullet (first
 * backticked span = file, second = test name), `n/a — {reason}`, missing, or malformed
 * (an entry with fewer than two spans, or no entry). A TEST EXCEPTION field names, in
 * the same entry form, the tests whose test-order gaps it accepts. `group` narrows to
 * one group's tasks.
 */
export function readTestFirst(plan: string, group?: number): TestFirst[] {
  return parsePlanBlocks(plan)
    .tasks.filter((t) => group === undefined || t.group === group)
    .map(testFirstOf);
}

export interface TaskSize {
  task: number;
  group: number;
  tests: number;
  files: number;
}

/** Per task, the planned tests and distinct test files it names (`n/a`, missing and malformed count 0). */
export const taskSizes = (specs: TestFirst[]): Array<Omit<TaskSize, "group">> =>
  specs.map((s) =>
    s.kind === "test"
      ? { task: s.task, tests: s.tests.length, files: new Set(s.tests.map((t) => t.test)).size }
      : { task: s.task, tests: 0, files: 0 },
  );

export interface GroupSize {
  group: number;
  title: string;
  tasks: number;
  /** Planned TEST FIRST tests, summed over the group's tasks. */
  tests: number;
  /** The group block's size, KB to one decimal. */
  kb: number;
}

export interface PlanProblem {
  /** 1-based plan line. */
  line: number;
  kind:
    | "format"
    | "stray"
    | "field"
    | "depends"
    | "cap"
    | "inventory"
    | "matrix"
    | "supersession"
    | "markers";
  message: string;
}

export interface PlanCheck {
  groups: GroupSize[];
  sizes: TaskSize[];
  /** Tasks naming more than `maxTestsPerTask` tests or `maxTestFilesPerTask` test files. */
  overCap: TaskSize[];
  /** Every reason the plan is refused, in line order; the existence check is `planExistence`. */
  problems: PlanProblem[];
}

/**
 * Files with a NEW row in the plan's Reuse Inventory table (`reuseInventory`): the
 * paths in the `File` cell of each row whose `Decision` cell reads NEW.
 */
export function inventoryNewFiles(text: string): Set<string> {
  const rows = reuseInventory(text)?.rows ?? [];
  return new Set(rows.filter((r) => /^\**new\b/i.test(r.decision)).flatMap((r) => r.files));
}

const kb1 = (bytes: number) => Math.round((bytes / 1024) * 10) / 10;

/**
 * One plan's groups and tasks against the caps and the block format: parse errors and
 * task-like text outside every block, a task without DONE WHEN or without TEST FIRST and
 * TEST EXCEPTION, a malformed TEST FIRST, a DEPENDS ON naming a missing task or one in a
 * later group, a group or task over a cap in `caps`, a CREATE file with no NEW Reuse
 * Inventory row, a `Derived Test Matrix` row naming no task / an undefined task / two
 * tasks or a test-bearing task no row names, and a DELETE file with no Supersession row.
 */
export function checkPlanText(text: string, caps: TaskCaps = CONFIG_DEFAULTS.tasks): PlanCheck {
  const blocks = parsePlanBlocks(text);
  const lines = text.split(/\r?\n/);
  const problems: PlanProblem[] = blocks.errors.map((e) => ({
    line: e.line,
    kind: e.kind,
    message: e.message,
  }));
  if (blocks.tasks.length === 0 && blocks.fenceOpen === undefined)
    problems.push({
      line: 1,
      kind: "markers",
      message:
        "no task markers: write each task as a `<!-- bkit:task N start -->` block inside a `<!-- bkit:group N start -->` block",
    });
  const specs = new Map(blocks.tasks.map((t) => [t.task, testFirstOf(t)]));
  const sizes: TaskSize[] = blocks.tasks.map((t) => {
    const s = specs.get(t.task)!;
    const tests = s.kind === "test" ? s.tests : [];
    return {
      task: t.task,
      group: t.group,
      tests: tests.length,
      files: new Set(tests.map((x) => x.test)).size,
    };
  });
  const overCap = sizes.filter(
    (t) => t.tests > caps.maxTestsPerTask || t.files > caps.maxTestFilesPerTask,
  );
  const byTask = new Map(blocks.tasks.map((t) => [t.task, t]));
  const newFiles = inventoryNewFiles(text);
  for (const t of blocks.tasks) {
    const field = (message: string, line = t.line) =>
      problems.push({ line, kind: "field", message: `TASK ${t.task}: ${message}` });
    if (t.doneWhen === undefined || t.doneWhen === "") field("has no **DONE WHEN:** field");
    const s = specs.get(t.task)!;
    if (s.kind === "missing") field("has neither **TEST FIRST:** nor **TEST EXCEPTION:**");
    for (const line of t.testFirst?.malformed ?? [])
      field("TEST FIRST entry is neither `test file` `test name` nor `n/a — {reason}`", line);
    if (s.kind === "malformed" && (t.testFirst?.malformed.length ?? 0) === 0)
      field("TEST FIRST names no test", t.testFirst!.line);
    for (const d of t.dependsOn) {
      const dep = byTask.get(d);
      const message =
        d === t.task
          ? `TASK ${t.task} depends on itself`
          : dep === undefined
            ? `TASK ${t.task} depends on TASK ${d}, but TASK ${d} does not exist`
            : dep.group > t.group
              ? `TASK ${t.task} depends on TASK ${d}, which is in a later group (GROUP ${dep.group}); groups build in order`
              : undefined;
      if (message !== undefined) problems.push({ line: t.line, kind: "depends", message });
    }
    const size = sizes.find((x) => x.task === t.task)!;
    if (size.tests > caps.maxTestsPerTask)
      problems.push({
        line: t.line,
        kind: "cap",
        message: `TASK ${t.task} names ${size.tests} TEST FIRST tests, over the cap of ${caps.maxTestsPerTask}`,
      });
    if (size.files > caps.maxTestFilesPerTask)
      problems.push({
        line: t.line,
        kind: "cap",
        message: `TASK ${t.task} names ${size.files} test files, over the cap of ${caps.maxTestFilesPerTask}`,
      });
    for (const c of t.create)
      if (!newFiles.has(path.posix.normalize(c.file)))
        problems.push({
          line: c.line,
          kind: "inventory",
          message: `TASK ${t.task}: CREATE in \`${c.file}\` has no NEW row naming it in the Reuse Inventory's File column`,
        });
  }
  // The matrix maps each row to one task and each test-bearing task to a row. A plan with no
  // matrix section yields no problem: the refusal is on a row, and issue-form plans carry none.
  const matrix = derivedTestMatrix(text);
  if (matrix !== null) {
    if (matrix.taskColumn === null)
      problems.push({
        line: matrix.line,
        kind: "matrix",
        message:
          "the Derived Test Matrix header has no `Task` column; add one naming the task each row's test belongs to",
      });
    else {
      const mapped = new Set<number>();
      for (const row of matrix.rows) {
        const named = row.tasks.map((n) => `TASK ${n}`);
        if (row.tasks.length === 0)
          problems.push({
            line: row.number,
            kind: "matrix",
            message: `Derived Test Matrix row maps to no task: name one in its \`Task\` cell`,
          });
        else if (row.tasks.length > 1)
          problems.push({
            line: row.number,
            kind: "matrix",
            message: `Derived Test Matrix row maps to ${named.join(" and ")}; name exactly one task`,
          });
        else {
          const n = row.tasks[0]!;
          if (!byTask.has(n))
            problems.push({
              line: row.number,
              kind: "matrix",
              message: `Derived Test Matrix row maps to TASK ${n}, which the plan does not define`,
            });
          mapped.add(n);
        }
      }
      for (const t of blocks.tasks)
        if (specs.get(t.task)!.kind === "test" && !mapped.has(t.task))
          problems.push({
            line: t.line,
            kind: "matrix",
            message: `TASK ${t.task} names TEST FIRST tests but no Derived Test Matrix row maps to it`,
          });
    }
  }
  const superseded = new Set((supersessionInventory(text) ?? []).flatMap((r) => r.files));
  for (const t of blocks.tasks)
    for (const d of t.delete)
      if (!superseded.has(path.posix.normalize(d.file)))
        problems.push({
          line: d.line,
          kind: "supersession",
          message: `TASK ${t.task}: DELETE in \`${d.file}\` has no row naming it in the Supersession Inventory`,
        });
  const groups: GroupSize[] = blocks.groups.map((g) => {
    const tests = sizes.filter((s) => s.group === g.group).reduce((n, s) => n + s.tests, 0);
    const bytes = Buffer.byteLength(lines.slice(g.line - 1, g.end).join("\n"));
    return { group: g.group, title: g.title, tasks: g.tasks.length, tests, kb: kb1(bytes) };
  });
  for (const g of groups) {
    const at = blocks.groups.find((x) => x.group === g.group)!.line;
    if (g.tasks > caps.maxPerGroup)
      problems.push({
        line: at,
        kind: "cap",
        message: `GROUP ${g.group} has ${g.tasks} tasks, over the cap of ${caps.maxPerGroup}`,
      });
    if (g.tests > caps.maxTestsPerGroup)
      problems.push({
        line: at,
        kind: "cap",
        message: `GROUP ${g.group} has ${g.tests} TEST FIRST tests, over the cap of ${caps.maxTestsPerGroup}`,
      });
  }
  problems.sort((a, b) => a.line - b.line);
  return { groups, sizes, overCap, problems };
}

export interface ExistenceFinding {
  line: number;
  task: number;
  message: string;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wordIn = (body: string, word: string) =>
  new RegExp(`(?<![\\w$])${escapeRe(word)}(?![\\w$])`).test(body);

/** The 1-based lines of `body` that are a Markdown heading reading exactly `heading`. */
const headingLines = (body: string, heading: string): number[] =>
  body.split(/\r?\n/).flatMap((l, i) => {
    const h = /^#{1,6}\s+(.*?)(?:\s+#+)?\s*$/.exec(l);
    return h !== null && h[1]!.trim() === heading ? [i + 1] : [];
  });

/** A key path's segments nested in indented `key:` lines (YAML): each one inside the block of the one before. */
function nestedKeys(body: string, segs: string[]): boolean {
  const lines = body.split(/\r?\n/);
  const indent = (l: string) => /^\s*/.exec(l)![0].length;
  const walk = (from: number, to: number, k: number, above: number): boolean => {
    const key = new RegExp(`^\\s*["']?${escapeRe(segs[k]!)}["']?\\s*:`);
    for (let i = from; i < to; i++) {
      const l = lines[i]!;
      if (l.trim() === "" || indent(l) <= above || !key.test(l)) continue;
      if (k === segs.length - 1) return true;
      let end = i + 1;
      while (end < to && (lines[end]!.trim() === "" || indent(lines[end]!) > indent(l))) end++;
      if (walk(i + 1, end, k + 1, indent(l))) return true;
    }
    return false;
  };
  return walk(0, lines.length, 0, -1);
}

/** A key path as a `[table]` header holding its first segments and a `key =` line for the rest (TOML). */
function tableKey(body: string, segs: string[]): boolean {
  const lines = body.split(/\r?\n/);
  for (let k = 1; k < segs.length; k++) {
    const table = segs.slice(0, k).join(".");
    const key = segs.slice(k).join(".");
    const start = lines.findIndex((l) => l.trim() === `[${table}]`);
    if (start < 0) continue;
    const end = lines.findIndex((l, i) => i > start && /^\s*\[/.test(l));
    const keyRe = new RegExp(`^\\s*${escapeRe(key)}\\s*=`);
    if (lines.slice(start + 1, end < 0 ? undefined : end).some((l) => keyRe.test(l))) return true;
  }
  return false;
}

/** Config files whose dotted keys must be there as the whole key path. */
const CONFIG_EXTS = new Set([".json", ".jsonc", ".yaml", ".yml", ".toml"]);

/** Whether parsed JSON `value` holds `segs` as nested object keys. */
function jsonPath(value: unknown, segs: string[]): boolean {
  let at = value;
  for (const s of segs) {
    if (typeof at !== "object" || at === null || Array.isArray(at) || !Object.hasOwn(at, s))
      return false;
    at = (at as Record<string, unknown>)[s];
  }
  return true;
}

/**
 * Whether config `body` of `file` holds the dotted key `bare` as the whole key path: a
 * `.json` file that parses is walked as JSON; otherwise the key is written whole, nested
 * in indented `key:` / `"key":` lines (YAML, indented JSON), or a `[table]` and its
 * `key =` line (TOML).
 */
function hasDottedKey(file: string, body: string, bare: string): boolean {
  const segs = bare.split(".");
  const json =
    path.posix.extname(file).toLowerCase() === ".json" ? parseJson(body) : { ok: false as const };
  if (json.ok) return jsonPath(json.value, segs);
  return wordIn(body, bare) || nestedKeys(body, segs) || tableKey(body, segs);
}

/**
 * Each READ / UPDATE / DELETE line of an unticked task whose file or symbol is not
 * there, read from `root`: a plain word-boundary search in the named file. `§ heading`
 * must equal one of the file's heading lines; a dotted key in a config file (`CONFIG_EXTS`)
 * must be there as the whole key path, and in any other file matches on its last segment;
 * a file-only line checks the file exists. A line naming
 * what the task itself or a task it DEPENDS ON creates is not checked: it does not
 * exist yet.
 */
export function planExistence(text: string, root: string): ExistenceFinding[] {
  const blocks = parsePlanBlocks(text);
  const byTask = new Map(blocks.tasks.map((t) => [t.task, t]));
  const out: ExistenceFinding[] = [];
  const cache = new Map<string, string | null>();
  const read = (file: string) => {
    if (!cache.has(file)) {
      const abs = path.resolve(root, file);
      const inside = !path.relative(root, abs).startsWith("..");
      cache.set(
        file,
        inside && fs.statSync(abs, { throwIfNoEntry: false })?.isFile()
          ? fs.readFileSync(abs, "utf-8")
          : null,
      );
    }
    return cache.get(file)!;
  };
  for (const t of blocks.tasks) {
    if (t.done) continue;
    const created = [t, ...t.dependsOn.map((d) => byTask.get(d)).filter((d) => d !== undefined)]
      .flatMap((d) => d.create)
      .map((c) => ({ file: path.posix.normalize(c.file), symbol: c.symbol }));
    for (const ref of [...t.read, ...t.update, ...t.delete]) {
      const file = path.posix.normalize(ref.file);
      if (
        created.some((c) => c.file === file && (c.symbol === undefined || c.symbol === ref.symbol))
      )
        continue;
      const body = read(file);
      const miss = (message: string) => out.push({ line: ref.line, task: t.task, message });
      if (body === null) {
        miss(`TASK ${t.task}: \`${ref.file}\` does not exist`);
        continue;
      }
      if (ref.symbol === undefined) continue;
      if (ref.symbol.startsWith("§")) {
        const heading = ref.symbol.replace(/^§\s*/, "").trim();
        if (headingLines(body, heading).length === 0)
          miss(`TASK ${t.task}: no heading \`${heading}\` in \`${ref.file}\``);
        continue;
      }
      const bare = ref.symbol.replace(/\(\)$/, "");
      const key = bare.split(".").at(-1)!;
      if (bare.includes(".") && CONFIG_EXTS.has(path.posix.extname(file).toLowerCase())) {
        if (!hasDottedKey(file, body, bare))
          miss(`TASK ${t.task}: \`${bare}\` is not in \`${ref.file}\``);
      } else if (!wordIn(body, key))
        miss(
          key === bare
            ? `TASK ${t.task}: \`${key}\` is not in \`${ref.file}\``
            : `TASK ${t.task}: \`${key}\` (last segment of \`${ref.symbol}\`) is not in \`${ref.file}\``,
        );
    }
  }
  return out.sort((a, b) => a.line - b.line);
}

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

/**
 * Every gap the audit emits, and the verifier's `Fixable` for it: `null` = the
 * answer needs a diff read, which only the verifier can make.
 */
const GAP_FIXABLE = {
  "not-green": true,
  "delete-still-referenced": null,
  "test-changed": null,
  "red-mismatch": null,
  "no-red": false,
  "late-red": false,
  "no-test-first": false,
  "test-first-malformed": false,
  "test-first-unread": false,
  "red-evidence-missing": false,
  "exception-refused": false,
} as const satisfies Record<string, boolean | null>;

type GapKind = keyof typeof GAP_FIXABLE;

interface Gap {
  /** null for a plan-level gap (`test-first-unread`). */
  task: number | null;
  kind: GapKind;
  detail: string;
  fixable: boolean | null;
  /** The line the verifier appends, carrying `Fixable: null` for a decision it makes itself. */
  logLine: string;
}

/** One gap, with the `fixable` its kind settles and the ready-to-append log line. */
function gapOf(
  task: number | null,
  kind: GapKind,
  detail: string,
  test?: { file: string; name: string },
): Gap {
  const fixable = GAP_FIXABLE[kind];
  const subject = test === undefined ? "" : `\`${test.file}\` \`${test.name}\` — `;
  return {
    task,
    kind,
    detail,
    fixable,
    logLine: `${task === null ? "Plan" : `TASK ${task}`}: ${subject}${kind} — Fixable: ${fixable}`,
  };
}

/** The report's verdict from its gaps: a decision one gap still needs (`null`) outranks one it refuses. */
const verdictOf = (gaps: Gap[]): "PASS" | "FAIL" | "CONCERNS" | null =>
  gaps.length === 0
    ? "PASS"
    : gaps.some((g) => g.fixable === null)
      ? null
      : gaps.some((g) => g.fixable === false)
        ? "FAIL"
        : "CONCERNS";

/** Gaps about when a test was seen failing; no edit made after the task's code can close one. */
export const TEST_ORDER_GAPS: ReadonlySet<string> = new Set([
  "no-red",
  "late-red",
  "red-mismatch",
  "red-evidence-missing",
  "test-changed",
]);

/** The gap for a task whose only test field is a TEST EXCEPTION that is not honoured. */
export const EXCEPTION_REFUSED = "exception-refused";

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
): Map<number, string> {
  const statusRel = repoRel(top, cwd, file);
  const commits = new Map<number, string>();
  for (const r of readStatusRows(file) as Array<Record<string, unknown>>) {
    if (r.type !== "step-done" || r.workflow !== workflow || r.step !== PLAN_EXECUTE_STEP) continue;
    const log = Array.isArray(r.artifacts) ? r.artifacts.map(String)[0] : undefined;
    if (typeof r.parentSha !== "string" || log === undefined) continue;
    const range = `${r.parentSha}..HEAD`;
    const commit = git(top, ["rev-list", "--reverse", "--ancestry-path", range, "--", statusRel])
      ?.split("\n")
      .find(Boolean);
    const text =
      commit === undefined ? null : git(top, ["show", `${commit}:${repoRel(top, cwd, log)}`]);
    if (commit === undefined || text === null) continue;
    for (const n of doneTasks(text)) if (!commits.has(n)) commits.set(n, commit);
  }
  return commits;
}

/**
 * The task numbers a plan-execute log records `DONE — TASK N` for, in log order. `verbs`
 * widens the reader to the log's other closing lines (`BLOCKED`), so one parser serves
 * every caller; the default reads `DONE` only, which is what "the task is done" means.
 */
export function doneTasks(log: string, verbs: readonly string[] = ["DONE"]): number[] {
  const closing = verbs.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return [...log.matchAll(new RegExp(`^(?:${closing})\\s*[—–-]+\\s*TASK\\s+(\\d+)\\b`, "gim"))].map(
    (m) => Number(m[1]),
  );
}

/**
 * Why a task's `TEST EXCEPTION` lines do not count, or null when they do: every
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

const withoutExt = (p: string) => p.replace(/\.[^./]*$/, "");

/**
 * Whether a grep hit for `stem` in `file` refers to something other than the files of
 * `targets` (repo-relative): false for a hit inside a target, or a line whose every
 * path-like mention of `stem` resolves to a target. A `./` or `../` path resolves
 * against `file`'s folder; any other path with a `/` matches a target ending in it.
 */
function namesOldPath(stem: string, targets: string[]) {
  const bare = targets.map(withoutExt);
  const isTarget = (token: string, file: string) => {
    const t = withoutExt(token);
    if (t.startsWith("./") || t.startsWith("../"))
      return bare.includes(path.posix.join(path.posix.dirname(file), t));
    return t.includes("/") && bare.some((b) => b === t || b.endsWith(`/${t}`));
  };
  return (file: string, text: string) => {
    if (targets.includes(file)) return false;
    const mentions = text
      .split(/[^\w./@-]+/)
      .filter((tok) => path.posix.basename(withoutExt(tok)) === stem);
    return mentions.length === 0 || mentions.some((tok) => !isTarget(tok, file));
  };
}

/** The gap for a DELETE line whose file or symbol the tree still holds or refers to. */
export const DELETE_STILL_REFERENCED = "delete-still-referenced";

/**
 * One `delete-still-referenced` gap per DELETE line of `tasks` the tree at `top` still
 * holds: a file-only line whose file exists, or whose file name (no extension) a tracked
 * or untracked file names as a word; a symbol (a dotted key's last segment) named as a
 * word; a `§ heading` written as `§ heading`, or still a heading of its file. The plan
 * file and the folder it sits in are not searched. A line naming what a task of
 * `planTasks` CREATEs is a move, not checked. A file-only line whose file name a CREATE
 * of `planTasks` reuses is a file move: the created file, and lines whose every mention
 * of the name is a path to the created file, are not references. A word search hits
 * other things of the same name, so this is a gap for verify to judge, never a refusal.
 */
function deleteGaps(
  top: string,
  planRel: string,
  tasks: PlanTaskBlock[],
  planTasks: PlanTaskBlock[],
): Gap[] {
  const created = planTasks.flatMap((t) => t.create);
  const planDir = path.posix.dirname(planRel);
  const excludes = [`:(exclude)${planRel}`, ...(planDir === "." ? [] : [`:(exclude)${planDir}`])];
  const grep = (term: string, word: boolean, keep?: (file: string, text: string) => boolean) => {
    const res = spawnSync(
      "git",
      [
        "grep",
        "-n",
        "-z",
        "-I",
        "--untracked",
        ...(word ? ["-w"] : []),
        "-F",
        "-e",
        term,
        "--",
        ".",
        ...excludes,
      ],
      { cwd: top, encoding: "utf-8" },
    );
    if (res.status === 1) return { hits: [] as string[] };
    if (res.status !== 0)
      return {
        failed: `git grep exited ${res.status ?? res.signal}: ${(res.stderr ?? "").trim()}`,
      };
    const hits = res.stdout
      .split("\n")
      .filter(Boolean)
      .map((l) => l.split("\0"))
      .filter(([file, , text]) => keep === undefined || keep(file!, text ?? ""))
      .map((parts) => parts.slice(0, 2).join(":"));
    return { hits };
  };
  const listed = (hits: string[]) =>
    hits
      .slice(0, 5)
      .map((h) => `\`${h}\``)
      .join(", ") + (hits.length > 5 ? `, and ${hits.length - 5} more` : "");
  const gaps: Gap[] = [];
  for (const t of tasks)
    for (const ref of t.delete) {
      const file = path.posix.normalize(ref.file);
      const moved = created.some((c) =>
        ref.symbol === undefined ? path.posix.normalize(c.file) === file : c.symbol === ref.symbol,
      );
      if (moved) continue;
      const movedTo =
        ref.symbol === undefined
          ? created
              .filter(
                (c) =>
                  c.symbol === undefined &&
                  path.posix.basename(path.posix.normalize(c.file)) === path.posix.basename(file),
              )
              .map((c) => path.posix.normalize(c.file))
          : [];
      const gap = (detail: string) => gaps.push(gapOf(t.task, DELETE_STILL_REFERENCED, detail));
      const abs = path.join(top, file);
      const exists = fs.statSync(abs, { throwIfNoEntry: false })?.isFile() === true;
      let what: string;
      let found: { hits?: string[]; failed?: string };
      if (ref.symbol === undefined) {
        if (exists) {
          gap(`DELETE \`${ref.file}\`: the file still exists`);
          continue;
        }
        const stem = path.posix.basename(file).replace(/\.[^.]*$/, "");
        what = `DELETE \`${ref.file}\` is still referenced as \`${stem}\``;
        found = grep(stem, true, movedTo.length === 0 ? undefined : namesOldPath(stem, movedTo));
      } else if (ref.symbol.startsWith("§")) {
        const heading = ref.symbol.replace(/^§\s*/, "").trim();
        what = `DELETE ${ref.symbol} in \`${ref.file}\` is still referenced`;
        found = grep(`§ ${heading}`, false);
        if (exists && found.hits !== undefined)
          found.hits.push(
            ...headingLines(fs.readFileSync(abs, "utf-8"), heading).map((n) => `${file}:${n}`),
          );
      } else {
        const bare = ref.symbol.replace(/\(\)$/, "");
        what = `DELETE \`${ref.symbol}\` in \`${ref.file}\` is still referenced`;
        found = grep(bare.split(".").at(-1)!, true);
      }
      if (found.failed !== undefined)
        gap(
          `${what.replace(/ is still referenced.*$/, "")}: references not checked — ${found.failed}`,
        );
      else if (found.hits!.length > 0) gap(`${what}: ${listed([...new Set(found.hits)].sort())}`);
    }
  return gaps;
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

/**
 * The red rows of status.jsonl for this workflow, oldest first. Task numbers are unique
 * across the plan, so a red matches its task by number whatever group recorded it.
 */
export function redRows(file: string, workflow: string) {
  return readStatusRows(file).filter((r) => {
    const row = r as Record<string, unknown>;
    return row.type === "step-done" && row.workflow === workflow && row.step === RED_STEP;
  }) as Array<Record<string, unknown>>;
}

function writeAuditReport(
  log: string,
  o: {
    enforced: boolean;
    reason?: string;
    plan?: string;
    verdict: "PASS" | "FAIL" | "CONCERNS" | null;
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
    `Verdict: ${o.verdict}`,
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
    out.push(
      `- ${g.task === null ? "Plan" : `Task ${g.task}`} \`${g.kind}\` — ${g.detail} — Fixable: ${g.fixable} — log: ${g.logLine}`,
    );
  if (o.exceptions.length > 0) out.push("", "## Test exceptions", "");
  for (const e of o.exceptions)
    out.push(
      e.refusal === null
        ? `- Task ${e.task} — honoured; cleared ${e.cleared.length > 0 ? e.cleared.join(", ") : "nothing"}`
        : `- Task ${e.task} — not honoured: ${e.refusal}`,
    );
  if (o.lateUnchecked.length > 0) out.push("", "## Late-red check", "");
  for (const task of o.lateUnchecked)
    out.push(
      `- Task ${task} — not checked: no plan-execute step commit's log records \`DONE — TASK ${task}\`, so when its code landed is unknown`,
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
        GROUP_FLAG,
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
        const group = positiveInt(ctx.flags.group, "group");
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
          ? redRows(status, workflow)
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
            group,
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
        "Audit a plan's test-first evidence (a red per TEST FIRST test recorded before the task's code commit, the test only added to since, the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers.",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        { ...GROUP_FLAG, help: "audit only this task group's tasks (positive integer)" },
        {
          name: "plan",
          type: "string",
          required: true,
          repeatable: true,
          help: "candidate plan file; the first that exists is audited",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "file the audit report is written to (directories are created)",
        },
      ],
      output: {
        enforced:
          "false when the audit could not run: no plan file, a plan with no task markers (exit 1), or the test-file script undeclared (exit 0)",
        reason: "why test-first is not enforced",
        plan: "the plan file audited",
        verdict:
          "PASS no gaps | FAIL a gap's fixable is false | CONCERNS every gap's fixable is true | null when a gap needs a diff read, or the audit could not run",
        gaps: "[{task, kind, detail, fixable, logLine}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | no-red | late-red | red-mismatch | red-evidence-missing | test-changed | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree); fixable is null when the gap needs a diff read; logLine is the line the verifier appends",
        testOrderOnly:
          "true when there are gaps and every one is a test-order gap (no-red | late-red | red-mismatch | red-evidence-missing | test-changed)",
        lateRedUnchecked:
          "tasks with a red but no plan-execute step commit whose log records `DONE — TASK N`: the late-red check could not run for them",
        log: "where the report was written (as given)",
      },
      exitCodes: {
        [EXIT_COULD_NOT_RUN]: `${BKIT_TEST_FILE_SCRIPT} could not run (exit 126 / 127)`,
      },
      run: (ctx) => {
        const workflow = String(ctx.flags.workflow);
        const group = positiveInt(ctx.flags.group, "group");
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
        const log = path.resolve(ctx.cwd, logArg);
        const top = toplevel(ctx.cwd);
        const exists = (p: string) => fs.existsSync(path.resolve(ctx.cwd, p));
        const plan = (ctx.flags.plan as string[]).find(exists);
        const planText = plan ? fs.readFileSync(path.resolve(ctx.cwd, plan), "utf-8") : "";
        const parsed = parsePlanBlocks(planText);
        const specs = readTestFirst(planText, group);
        // A plan with no task markers is an old-format plan: nothing it says can be audited,
        // and passing it would let its tests go unchecked.
        const refusal =
          plan === undefined
            ? `no plan file; ${NO_MARKERS_REASON}`
            : parsed.tasks.length === 0
              ? parsed.fenceOpen === undefined
                ? NO_MARKERS_REASON
                : fenceNeverClosed(parsed.fenceOpen)
              : undefined;
        if (refusal === undefined && group !== undefined) {
          const g = parsed.groups.find((x) => x.group === group);
          if (g === undefined) throw new CommandError(EXIT.USAGE, `the plan has no GROUP ${group}`);
          if (g.tasks.length === 0)
            throw new CommandError(EXIT.USAGE, `GROUP ${group} has no tasks; nothing to audit`);
        }
        const reason =
          refusal ??
          (resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) === null
            ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
            : undefined);
        const empty = {
          verdict: null,
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
            verdict: null,
            gaps: [],
            testOrderOnly: false,
            lateRedUnchecked: [],
            log: logArg,
          });
          ctx.log(`test-first not enforced: ${reason}`);
          return refusal === undefined ? EXIT.OK : EXIT.NO;
        }

        const reds = redRows(statusFile(ctx), workflow);
        const statusRel = repoRel(top, ctx.cwd, statusFile(ctx));
        const codeCommits = taskCodeCommits(top, ctx.cwd, statusFile(ctx), workflow);
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
          if (s.kind === "na") {
            const block = parsed.tasks.find((t) => t.task === s.task)!;
            if (block.testFirst !== undefined || block.testException === undefined) continue;
            const refused = exceptionRefusal(
              top,
              repoRel(top, ctx.cwd, plan!),
              block.testException.lines,
              statusRel,
            );
            exceptions.push({
              task: s.task,
              refusal: refused,
              cleared: refused === null ? ["the task's `TEST FIRST` check"] : [],
            });
            if (refused !== null)
              gaps.push(
                gapOf(
                  s.task,
                  EXCEPTION_REFUSED,
                  `the task's only test field is a \`**TEST EXCEPTION:**\`, not honoured: ${refused}`,
                ),
              );
            continue;
          }
          if (s.kind !== "test") {
            gaps.push(
              gapOf(
                s.task,
                s.kind === "missing" ? "no-test-first" : "test-first-malformed",
                s.kind === "missing"
                  ? "the task has neither a `**TEST FIRST:**` nor a `**TEST EXCEPTION:**` field"
                  : "`**TEST FIRST:**` is neither `n/a — {reason}` nor one sub-bullet per test naming a backticked test file and test name",
              ),
            );
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
            const gap = (kind: GapKind, detail: string) => {
              if (clearing !== undefined && TEST_ORDER_GAPS.has(kind))
                clearing.cleared.push(`\`${kind}\` for \`${t.test}\` "${t.name}"`);
              else gaps.push(gapOf(s.task, kind, detail, { file: t.test, name: t.name }));
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
                  `the red for "${t.name}" was recorded on ${on.slice(0, 7)}, on or after ${code.slice(0, 7)}, the first commit whose plan-execute log records TASK ${s.task} DONE — the task's code already existed`,
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
                gap(
                  "test-changed",
                  added
                    ? `\`${t.test}\` gained lines since its red snapshot for "${t.name}" (diff below)`
                    : `\`${t.test}\` differs from its red snapshot for "${t.name}" (diff below)`,
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
        gaps.push(
          ...deleteGaps(
            top,
            repoRel(top, ctx.cwd, plan!),
            parsed.tasks.filter((t) => group === undefined || t.group === group),
            parsed.tasks,
          ),
        );
        for (const e of parsed.errors)
          gaps.push(
            gapOf(
              null,
              "test-first-unread",
              `\`${plan}:${e.line}\` ${e.message} — tests there were not audited; the plan's blocks need fixing`,
            ),
          );
        const testOrderOnly = gaps.length > 0 && gaps.every((g) => TEST_ORDER_GAPS.has(g.kind));
        const verdict = verdictOf(gaps);
        writeAuditReport(log, {
          enforced: true,
          plan,
          verdict,
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
          verdict,
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
      summary: `Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json \`bkit.workflows.tasks\` (defaults: ${capsText(CONFIG_DEFAULTS.tasks)}), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a \`Task\` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused.`,
      flags: [
        {
          name: "plan",
          type: "string",
          required: true,
          help: "the plan file checked",
        },
        {
          name: "existence",
          type: "string",
          help: "refuse (default): a missing READ / UPDATE / DELETE file or symbol refuses the plan; report: it is listed only",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "file the report is written to, `Problems:` header first (directories are created)",
        },
      ],
      output: {
        plan: "the plan file checked (as given)",
        groups:
          "[{group, title, tasks, tests, kb}]: each group's tasks, planned TEST FIRST tests and size",
        tasks: "[{task, group, tests, files}]: each task's planned tests and distinct test files",
        problems:
          "[{line, kind, message}]: format | stray | field | depends | cap | inventory | matrix | supersession | markers — each refuses the plan",
        existence:
          "[{line, task, message}]: READ / UPDATE / DELETE files or symbols not found; refuses only with --existence=refuse",
        log: "where the report was written (as given)",
      },
      run: (ctx) => {
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
        const existenceArg = str(ctx.flags.existence) ?? "refuse";
        if (existenceArg !== "refuse" && existenceArg !== "report")
          throw new CommandError(
            EXIT.USAGE,
            `--existence must be refuse or report, got "${existenceArg}"`,
          );
        const plan = String(ctx.flags.plan);
        const planAbs = path.resolve(ctx.cwd, plan);
        if (!fs.statSync(planAbs, { throwIfNoEntry: false })?.isFile())
          throw new CommandError(EXIT.USAGE, `--plan ${plan} does not exist`);
        const text = fs.readFileSync(planAbs, "utf-8");
        const caps = planCaps(ctx.cwd);
        const { groups, sizes, problems } = checkPlanText(text, caps);
        const existence = planExistence(text, toplevel(ctx.cwd));
        const refused = problems.length > 0 || (existenceArg === "refuse" && existence.length > 0);

        const out = [
          `Problems: ${problems.length}`,
          `Existence: ${existence.length}`,
          "",
          "<!-- verdict:end -->",
          "",
          "# Plan Check",
          "",
          `Plan: \`${plan}\`. Caps: ${capsText(caps)}.`,
          "",
          "## Groups",
          "",
        ];
        if (groups.length === 0) out.push("No group blocks read.");
        else {
          out.push(
            "| Group | Title | Tasks | TEST FIRST tests | KB |",
            "| --- | --- | --- | --- | --- |",
          );
          for (const g of groups)
            out.push(`| ${g.group} | ${g.title} | ${g.tasks} | ${g.tests} | ${g.kb.toFixed(1)} |`);
        }
        if (sizes.length > 0) {
          out.push(
            "",
            "## Tasks",
            "",
            "| Task | Group | Tests | Test files |",
            "| --- | --- | --- | --- |",
          );
          for (const t of sizes) out.push(`| ${t.task} | ${t.group} | ${t.tests} | ${t.files} |`);
        }
        out.push("", "## Problems", "");
        if (problems.length === 0) out.push("None.");
        for (const p of problems) out.push(`- \`${plan}:${p.line}\` \`${p.kind}\` — ${p.message}`);
        out.push(
          "",
          `## Existence (${existenceArg === "refuse" ? "refuses the plan" : "reported only"})`,
          "",
        );
        if (existence.length === 0) out.push("None.");
        for (const e of existence) out.push(`- \`${plan}:${e.line}\` — ${e.message}`);
        const log = path.resolve(ctx.cwd, logArg);
        fs.mkdirSync(path.dirname(log), { recursive: true });
        fs.writeFileSync(log, `${out.join("\n")}\n`);
        ctx.emit({ plan, groups, tasks: sizes, problems, existence, log: logArg });
        ctx.log(
          `plan check: ${problems.length} problem(s), ${existence.length} existence finding(s)${refused ? " — refused" : ""}; report in ${logArg}`,
        );
        return refused ? EXIT.NO : EXIT.OK;
      },
    },
  },
};
