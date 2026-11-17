// JUnit reading, the one-file test runner and the one gate runner under the tests lock
// (`runGateUnderLock`, its status-file half `underTestsLock`). A leaf module: it imports none of
// `tests.ts`, `steps.ts` or `runs.ts`, so any of them may import it.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
import { scriptCommand, testCommand } from "../../shared/package-manager.js";
import {
  classifyLockOutcome,
  LOCK_STATUS_FILE_ENV,
  type LockOutcome,
  type LockStatus,
  lockStatusFile,
  readLockStatus,
} from "../lib.js";

/** The env var naming the JUnit report path `bkit:test:file` must write. */
export const REPORT_ENV = "BKIT_TEST_REPORT";

/**
 * The environment `runToLog` hands its command: the caller's, plus `env`, without
 * pnpm's silent reporter. `pnpm -s` passes `npm_config_reporter=silent` to every
 * child, which leaves out pnpm's own lines (the script run and its failure exit code);
 * the log is the step's evidence, so it keeps them however bkit was started.
 */
export function logEnv(base: NodeJS.ProcessEnv, env?: Record<string, string>): NodeJS.ProcessEnv {
  const merged = { ...base, ...env };
  if (merged.npm_config_reporter === "silent") delete merged.npm_config_reporter;
  return merged;
}

/**
 * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`): a file path, or
 * an open file descriptor such as 2 to pass the output straight on. `base` is the environment
 * `env` is added to. Exit 127 when the binary is missing; 128 + n when killed by signal n.
 */
export function runToLog(
  argv: string[],
  cwd: string,
  log: string | number,
  env?: Record<string, string>,
  base: NodeJS.ProcessEnv = process.env,
): number {
  if (typeof log === "string") fs.mkdirSync(path.dirname(log), { recursive: true });
  const fd = typeof log === "string" ? fs.openSync(log, "w") : log;
  const protectedArgv = testCommand(argv);
  const res = spawnSync(protectedArgv[0]!, protectedArgv.slice(1), {
    cwd,
    stdio: ["ignore", fd, fd],
    env: logEnv(base, env),
  });
  if (typeof log === "string") fs.closeSync(fd);
  if (res.error) {
    const line = `${argv[0]}: not found on PATH (${res.error.message})\n`;
    if (typeof log === "string") fs.appendFileSync(log, line);
    else fs.writeSync(log, line);
    return 127;
  }
  if (res.status !== null) return res.status;
  return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
}

/** One run under the tests lock: its exit code, the lock's status file, and the two read together. */
export interface LockedRun<Code extends number | null = number> {
  /** The run's exit code; null when a caller in between (git running a pre-push hook) collapsed it. */
  exitCode: Code;
  /** What the lock wrapper wrote to its status file, null when it wrote none. */
  status: LockStatus | null;
  /** `gate` the gate's own result, `lock-wait` the wait gave up, `could-not-run` the lock refused or stopped the run. */
  lock: LockOutcome;
}

/**
 * Hand `run` the environment naming a fresh tests-lock status file, then read and delete that
 * file and classify the run. With `forwardStatusTo`, the file is first copied there, for a
 * caller further out that asked for it.
 */
export function underTestsLock<Code extends number | null>(
  run: (env: Record<string, string>) => Code,
  forwardStatusTo?: string,
): LockedRun<Code> {
  const statusPath = lockStatusFile();
  const exitCode = run({ [LOCK_STATUS_FILE_ENV]: statusPath });
  if (forwardStatusTo && fs.statSync(statusPath, { throwIfNoEntry: false })?.isFile())
    fs.copyFileSync(statusPath, forwardStatusTo);
  const status = readLockStatus(statusPath);
  return { exitCode, status, lock: classifyLockOutcome(exitCode, status) };
}

/**
 * Run a gate under the tests lock with its output in `log` (see `runToLog`): the gate's exit
 * code, the lock's status file, and the lock outcome the two give.
 */
export function runGateUnderLock(
  argv: string[],
  cwd: string,
  log: string | number,
  env: Record<string, string> = {},
  opts: { base?: NodeJS.ProcessEnv; forwardStatusTo?: string } = {},
): LockedRun {
  return underTestsLock(
    (lockEnv) => runToLog(argv, cwd, log, { ...env, ...lockEnv }, opts.base),
    opts.forwardStatusTo,
  );
}

/**
 * The failing plus erroring cases across every `*.xml` under `dir`: `[]` for reports with
 * none, null when there is no report.
 */
export function reportFailures(dir: string): JunitCase[] | null {
  const xml = (fs.readdirSync(dir, { recursive: true }) as string[]).filter(
    (f) => f.endsWith(".xml") && fs.statSync(path.join(dir, f)).isFile(),
  );
  if (xml.length === 0) return null;
  return xml
    .flatMap((f) => parseJunit(fs.readFileSync(path.join(dir, f), "utf-8")))
    .filter((c) => c.state === "failure" || c.state === "error");
}

export type CaseState = "passed" | "failure" | "error" | "skipped";
export interface JunitCase {
  name: string;
  state: CaseState;
  /** The case's `classname` attribute, null when absent. */
  classname: string | null;
  /** The case's `file` attribute, null when absent. */
  file: string | null;
  /** The failure element's `message` attribute: the runner's one-line summary. */
  message: string;
  /** The failure element's text: the assertion output, where some runners put the detail. */
  detail: string;
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

/** CDATA text as escaped character data, so a tag inside it never ends an element early. */
const escapeCdata = (xml: string) =>
  xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  );

/** Every `<testcase>` in a JUnit report: its name, outcome, first failure message and detail. */
export function parseJunit(xml: string): JunitCase[] {
  const body = escapeCdata(xml).replace(/<!--[\s\S]*?-->/g, "");
  const cases: JunitCase[] = [];
  const testcase = new RegExp(String.raw`<testcase${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/testcase>)`, "g");
  const outcome = new RegExp(
    String.raw`<(failure|error|skipped)${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/\1>)`,
  );
  for (const m of body.matchAll(testcase)) {
    const child = outcome.exec(m[2] ?? "");
    cases.push({
      name: attr(m[1] ?? "", "name") ?? "",
      classname: attr(m[1] ?? "", "classname") ?? null,
      file: attr(m[1] ?? "", "file") ?? null,
      state: child ? (child[1] as CaseState) : "passed",
      message: child ? (attr(child[2] ?? "", "message") ?? "") : "",
      detail: child ? decodeXml((child[3] ?? "").replace(/<[^>]*>/g, "")).trim() : "",
    });
  }
  return cases;
}

/** Run one test file through `bkit:test:file`; the report is read and removed. */
export function runTestFile(
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
