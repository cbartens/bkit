// bkit tests run — run the deepest declared local gate, save its full output,
// and report the verdict.
//
// Candidates come in priority order, deepest first: the first one `package.json`
// declares is run, so a shallower gate never wins while a deeper one exists (the
// order is the contract). Nothing declared is its own exit code, never an empty
// command that exits 0 and reads as a clean run. A gate that exits 126 / 127 never
// ran (not executable / not found), so it is not recorded as a failing test.
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
import { CommandError, EXIT, git, type CommandSpec } from "../lib.js";
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

/** Exit code: no candidate gate is declared in package.json. */
export const EXIT_NO_GATE = 3;
/** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
export const EXIT_COULD_NOT_RUN = 4;

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

export type TestFirst =
  | { task: number; kind: "test"; tests: PlannedTest[] }
  | { task: number; kind: "na"; reason: string }
  | { task: number; kind: "missing" | "malformed" };

const TASK_LINE = /^\s*- \[[ xX]\] \*\*Task (\d+):\*\*/;
const TEST_FIRST = "**Test first:**";

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
 * bullet to the next bullet or heading.
 */
export function readTestFirst(plan: string): TestFirst[] {
  const out: TestFirst[] = [];
  const lines = plan.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const head = TASK_LINE.exec(lines[i]!);
    if (!head) continue;
    let text = lines[i]!;
    for (let j = i + 1; j < lines.length && !/^\s*(- |#)/.test(lines[j]!); j++)
      text += ` ${lines[j]}`;
    const task = Number(head[1]);
    const at = text.indexOf(TEST_FIRST);
    if (at < 0) {
      out.push({ task, kind: "missing" });
      continue;
    }
    const rest = text.slice(at + TEST_FIRST.length).trim();
    if (/^n\/a\b/i.test(rest)) {
      out.push({ task, kind: "na", reason: rest.replace(/^n\/a\s*[—–-]?\s*/i, "") });
      continue;
    }
    const entries = splitEntries(rest).map((e) =>
      [...e.matchAll(/`([^`]+)`/g)].map((m) => m[1]!.trim()),
    );
    const tests = entries
      .filter((spans) => spans.length >= 2)
      .map((spans) => ({ test: path.posix.normalize(spans[0]!), name: spans[1]! }));
    out.push(
      tests.length > 0 && !entries.some((spans) => spans.length === 1)
        ? { task, kind: "test", tests }
        : { task, kind: "malformed" },
    );
  }
  return out;
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
  task: number;
  kind: string;
  detail: string;
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
    diffs: Array<{ task: number; test: string; diff: string }>;
    outputs: Array<{ test: string; tail: string }>;
  },
): void {
  const out = [`Enforced: ${o.enforced}`, `Gaps: ${o.gaps.length}`, "", "<!-- verdict:end -->", ""];
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
  for (const g of o.gaps) out.push(`- Task ${g.task} \`${g.kind}\` — ${g.detail}`);
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
      ],
      output: {
        verdict: "PASS | FAIL (null when the gate could not run)",
        exitCode: "the gate's exit code",
        gate: "the script that ran",
        scope: "the command that ran, as status rows record it",
        failures: "0 on PASS; null otherwise — count failing suites from the log",
        log: "where the full output was saved (as given)",
        logBytes: "size of the saved output",
      },
      exitCodes: {
        [EXIT_NO_GATE]: "no candidate gate is declared in package.json",
        [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
      },
      run: (ctx) => {
        const candidates = ctx.flags.gate as string[];
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
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
        ctx.log(`running ${scope} — full output in ${logArg}`);
        const exitCode = runToLog(scriptCommand(gate), top, log);
        for (const line of Number(tailRaw) > 0 ? tailLines(log, Number(tailRaw)) : [])
          ctx.log(line);
        const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
        const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
        ctx.emit({
          verdict,
          exitCode,
          gate,
          scope,
          failures: verdict === "PASS" ? 0 : null,
          log: logArg,
          logBytes: fs.statSync(log).size,
        });
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
        "Audit a sub-plan's test-first evidence (a red per planned test, the test unchanged since, the named test passing now); exit 0 no gaps, 1 gaps.",
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
          name: "log",
          type: "string",
          required: true,
          help: "file the audit report is written to (directories are created)",
        },
      ],
      output: {
        enforced: "false when there is nothing to audit (reason says why)",
        reason: "why test-first is not enforced",
        plan: "the plan file audited",
        gaps: "[{task, kind, detail}]: no-test-first | test-first-malformed | no-red | red-mismatch | red-evidence-missing | test-changed | not-green",
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
        const plan = (ctx.flags.plan as string[]).find((p) =>
          fs.existsSync(path.resolve(ctx.cwd, p)),
        );
        const specs = plan
          ? readTestFirst(fs.readFileSync(path.resolve(ctx.cwd, plan), "utf-8"))
          : [];
        const reason =
          plan === undefined
            ? "no plan file — the build runs from its brief"
            : !specs.some((s) => s.kind !== "missing")
              ? "the plan has no `Test first:` lines"
              : resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) === null
                ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
                : undefined;
        const empty = { rows: [], gaps: [], diffs: [], outputs: [] };
        if (reason !== undefined) {
          writeAuditReport(log, { enforced: false, reason, plan, ...empty });
          ctx.emit({ enforced: false, reason, plan: plan ?? null, gaps: [], log: logArg });
          ctx.log(`test-first not enforced: ${reason}`);
          return EXIT.OK;
        }

        const reds = redRows(statusFile(ctx), workflow, subPlan);
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
              gaps.push({
                task: s.task,
                kind: "red-mismatch",
                detail: `no red for \`${t.test}\` "${t.name}"; reds recorded for ${recorded.join(", ")}`,
              });
            } else if (red === undefined) {
              gaps.push({
                task: s.task,
                kind: "no-red",
                detail: `no red recorded for "${t.name}" — the test was never seen failing before the code`,
              });
            } else {
              row.red = `recorded ${String(red.at)}`;
              const snap = (Array.isArray(red.artifacts) ? red.artifacts : [])
                .map(String)
                .find((a) => a.endsWith(".snapshot"));
              const snapAbs = snap === undefined ? undefined : path.resolve(ctx.cwd, snap);
              const testAbs = path.join(top, t.test);
              if (snapAbs === undefined || !fs.existsSync(snapAbs)) {
                row.changed = "unknown";
                gaps.push({
                  task: s.task,
                  kind: "red-evidence-missing",
                  detail: `the red's test snapshot ${snap ?? "(none recorded)"} is missing`,
                });
              } else if (!fs.existsSync(testAbs)) {
                row.changed = "deleted";
                gaps.push({
                  task: s.task,
                  kind: "test-changed",
                  detail: `\`${t.test}\` no longer exists`,
                });
              } else if (!fs.readFileSync(snapAbs).equals(fs.readFileSync(testAbs))) {
                row.changed = "yes";
                gaps.push({
                  task: s.task,
                  kind: "test-changed",
                  detail: `\`${t.test}\` differs from its red snapshot for "${t.name}" (diff below)`,
                });
                const diff = spawnSync(
                  "git",
                  ["diff", "--no-index", "--no-color", "--", path.relative(top, snapAbs), t.test],
                  { cwd: top, encoding: "utf-8" },
                );
                diffs.push({ task: s.task, test: t.test, diff: diff.stdout.trimEnd() });
              } else row.changed = "no";
            }

            if (!fs.existsSync(path.join(top, t.test))) {
              row.green = "file missing";
              gaps.push({
                task: s.task,
                kind: "not-green",
                detail: `\`${t.test}\` does not exist`,
              });
              continue;
            }
            const green = greenRun(t.test);
            if (green === null) return EXIT_COULD_NOT_RUN;
            const why = judgeGreen(green.cases, t.name);
            row.green = why === null ? "passed" : "not passed";
            if (why !== null) {
              gaps.push({ task: s.task, kind: "not-green", detail: why });
              if (!outputs.some((o) => o.test === t.test))
                outputs.push({ test: t.test, tail: green.tail });
            }
          }
        }
        writeAuditReport(log, { enforced: true, plan, rows, gaps, diffs, outputs });
        ctx.emit({ enforced: true, plan, gaps, log: logArg });
        ctx.log(`test-first audit: ${gaps.length} gap(s) — report in ${logArg}`);
        return gaps.length === 0 ? EXIT.OK : EXIT.NO;
      },
    },
  },
};
