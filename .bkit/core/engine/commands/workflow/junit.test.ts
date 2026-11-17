import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { LOCK_STATUS_FILE_ENV } from "../lib";
import { logEnv, parseJunit, reportFailures, runGateUnderLock, underTestsLock } from "./junit";

const dirs: string[] = [];
const tmp = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-junit-"));
  dirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

const report = (body: string) => `<testsuite>${body}</testsuite>`;

describe("logEnv", () => {
  it("drops pnpm's silent reporter and keeps every other variable and reporter", () => {
    const silent = logEnv({ npm_config_reporter: "silent", PATH: "/bin" }, { EXTRA: "1" });
    expect(silent).toEqual({ PATH: "/bin", EXTRA: "1" });
    expect(logEnv({ npm_config_reporter: "ndjson" })).toEqual({ npm_config_reporter: "ndjson" });
    expect(logEnv({}, { npm_config_reporter: "silent" })).toEqual({});
  });
});

describe("parseJunit", () => {
  it("reads classname and file as null when a case carries neither", () => {
    expect(parseJunit(report('<testcase name="a"/>'))[0]).toMatchObject({
      name: "a",
      classname: null,
      file: null,
    });
  });
});

describe("reportFailures", () => {
  it("lists failures and errors, [] for a clean report and null with no report", () => {
    const dir = tmp();
    expect(reportFailures(dir)).toBeNull();
    fs.writeFileSync(path.join(dir, "ok.xml"), report('<testcase name="a"/>'));
    expect(reportFailures(dir)).toEqual([]);
    fs.writeFileSync(
      path.join(dir, "bad.xml"),
      report(
        '<testcase name="b"><failure message="x"/></testcase><testcase name="c"><error/></testcase>',
      ),
    );
    expect(reportFailures(dir)?.length).toBe(2);
    expect(reportFailures(dir)?.map((c) => c.name)).toEqual(["b", "c"]);
  });
});

/** A gate that prints a line, writes $STATUS_BODY (when set) to the lock status file, and exits `code`. */
const gate = (code: number) => [
  "sh",
  "-c",
  `echo "gate ran with $GATE_EXTRA"; [ -z "$STATUS_BODY" ] || printf '%s' "$STATUS_BODY" > "$${LOCK_STATUS_FILE_ENV}"; exit ${code}`,
];

describe("runGateUnderLock", () => {
  it.each([
    { name: "ran and passed", code: 0, status: "", lock: "gate", outcome: null },
    { name: "ran and failed", code: 1, status: "", lock: "gate", outcome: null },
    {
      name: "could not take the busy lock (the wait gave up)",
      code: 75,
      status: "lock=tests\noutcome=gave-up\nholder=other run\n",
      lock: "lock-wait",
      outcome: { outcome: "gave-up" },
    },
    {
      name: "could not take the lock at all (refused)",
      code: 73,
      status: "lock=tests\noutcome=refused\nholder=\n",
      lock: "could-not-run",
      outcome: { outcome: "refused" },
    },
    {
      name: "was stopped at the hold limit",
      code: 124,
      status: "lock=tests\noutcome=held-too-long\nholder=this run\n",
      lock: "could-not-run",
      outcome: { outcome: "held-too-long" },
    },
  ])("a gate that $name returns its exit code and lock outcome $lock", (c) => {
    const dir = tmp();
    const log = path.join(dir, "logs", "gate.log");
    const run = runGateUnderLock(gate(c.code), dir, log, {
      GATE_EXTRA: "extra",
      STATUS_BODY: c.status,
    });
    expect(run.exitCode).toBe(c.code);
    expect(run.lock).toBe(c.lock);
    expect(run).toMatchObject({ status: c.outcome });
    expect(fs.readFileSync(log, "utf-8")).toContain("gate ran with extra");
  });

  it("drops pnpm's silent reporter from the gate's environment, as runToLog does", () => {
    const dir = tmp();
    const log = path.join(dir, "gate.log");
    const argv = ["sh", "-c", 'echo "reporter=[$npm_config_reporter]"'];
    const run = runGateUnderLock(
      argv,
      dir,
      log,
      {},
      { base: { ...process.env, npm_config_reporter: "silent" } },
    );
    expect(run.exitCode).toBe(0);
    expect(fs.readFileSync(log, "utf-8")).toContain("reporter=[]");
  });

  it("a missing command exits 127 and says so in the log", () => {
    const dir = tmp();
    const log = path.join(dir, "gate.log");
    const run = runGateUnderLock(["bkit-no-such-command-998"], dir, log);
    expect(run).toMatchObject({ exitCode: 127, lock: "gate", status: null });
    expect(fs.readFileSync(log, "utf-8")).toContain("bkit-no-such-command-998");
  });

  it("copies the status file to forwardStatusTo before reading it", () => {
    const dir = tmp();
    const outer = path.join(dir, "outer-status");
    const body = "lock=tests\noutcome=gave-up\nholder=other run\n";
    const run = runGateUnderLock(
      gate(75),
      dir,
      path.join(dir, "gate.log"),
      { STATUS_BODY: body },
      { forwardStatusTo: outer },
    );
    expect(run.lock).toBe("lock-wait");
    expect(fs.readFileSync(outer, "utf-8")).toBe(body);
  });
});

describe("underTestsLock", () => {
  it("names a fresh status file in the env it hands over and classifies a collapsed exit from the file alone", () => {
    const seen: string[] = [];
    const run = underTestsLock((env) => {
      const file = env[LOCK_STATUS_FILE_ENV]!;
      seen.push(file);
      fs.writeFileSync(file, "lock=tests\noutcome=held-too-long\nholder=\n");
      return null;
    });
    expect(run).toMatchObject({ exitCode: null, lock: "could-not-run" });
    expect(fs.existsSync(seen[0]!)).toBe(false);
    expect(underTestsLock(() => 0)).toEqual({ exitCode: 0, lock: "gate", status: null });
  });
});
