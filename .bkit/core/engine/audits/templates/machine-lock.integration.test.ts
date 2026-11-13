// audits/templates/machine-lock.integration.test.ts — the local stack lock bkit ships as a
// copy-and-own template, run for real: real bash, real perl holder, real flock. Each test points
// XDG_CACHE_HOME at its own folder, so a real run on this machine is never touched or waited on.

import {
  type ChildProcess,
  type ChildProcessByStdio as ProcessByStdio,
  type SpawnOptions,
  spawn,
  spawnSync,
} from "node:child_process";
import type { Readable } from "node:stream";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { tierTimeouts } from "../../../../../vitest.timeout-budget";

const OLD_SCRIPT = path.resolve("tests/fixtures/machine-lock/stack-lock-6.0.0.sh");
const OLD_LOCK_SCRIPT = path.resolve("tests/fixtures/machine-lock/machine-lock-6.1.1.sh");
const BUDGET = tierTimeouts(true);

const SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
const CHECKOUT = spawnSync("git", ["-C", path.dirname(SCRIPT), "rev-parse", "--show-toplevel"], {
  encoding: "utf-8",
}).stdout.trim();

interface Result {
  status: number | null;
  stdout: string;
  stderr: string;
  ms: number;
}

let tmp: string;
let cache: string;
let children: ChildProcess[];
/** A child whose stdout and stderr are pipes. */
type Piped = ProcessByStdio<null, Readable, Readable>;

beforeEach(() => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stack-lock-")));
  cache = path.join(tmp, "cache");
  children = [];
});
afterEach(async () => {
  await Promise.all(children.map(stopGroup));
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
});

/**
 * Starts a child in its own process group and records it for `afterEach`. A lock holder runs a
 * perl process in the background that writes into the test's cache folder after its caller dies,
 * so killing only the child leaves it writing while the folder is removed.
 */
function track(command: string, args: string[], opts: SpawnOptions): Piped {
  const child = spawn(command, args, { ...opts, detached: true }) as Piped;
  children.push(child);
  return child;
}

/** SIGKILLs the child's whole process group, the perl holder included, and waits for the child to exit. */
async function stopGroup(child: ChildProcess): Promise<void> {
  const exited =
    child.exitCode !== null || child.signalCode !== null
      ? Promise.resolve()
      : new Promise<void>((resolve) => child.once("exit", () => resolve()));
  try {
    process.kill(-child.pid!, "SIGKILL");
  } catch (err) {
    // Everything in the group has already exited: ESRCH, or EPERM on macOS when only zombies are left.
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ESRCH" && code !== "EPERM") throw err;
  }
  await exited;
}

/** The test's own lock folder; CI, an inherited owner and a stack name are cleared so the lock really runs. */
function envFor(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, XDG_CACHE_HOME: cache };
  delete env.CI;
  for (const key of Object.keys(env)) {
    if (key.startsWith("LOCAL_STACK_LOCK_OWNER") || key.startsWith("LOCAL_STACK_LOCK_PID")) {
      delete env[key];
    }
  }
  delete env.BKIT_TEST_SLOTS;
  delete env.BKIT_LOCAL_STACK;
  return { ...env, ...extra };
}

/** Runs a bash snippet with `script` sourced. */
function run(
  snippet: string,
  env: NodeJS.ProcessEnv,
  script = SCRIPT,
  cwd = process.cwd(),
): Result {
  const started = Date.now();
  const r = spawnSync("bash", ["-c", `. "${script}"; ${snippet}`], {
    env,
    cwd,
    encoding: "utf-8",
    timeout: BUDGET.testTimeout,
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, ms: Date.now() - started };
}

/** A run that takes the lock and holds it `holdS` seconds; `locked` resolves once it holds it. */
function hold(
  who: string,
  holdS: number,
  env: NodeJS.ProcessEnv,
  script = SCRIPT,
  cwd = process.cwd(),
) {
  const child = track(
    "bash",
    ["-c", `. "${script}"; take_local_stack_lock "${who}" || exit 1; echo locked; sleep ${holdS}`],
    { env, cwd, stdio: ["ignore", "pipe", "pipe"] },
  );
  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
  const lockFile = run("local_stack_lock_file", env, script, cwd);
  const locked = waitForHolder(lockFile.stdout.trim() + ".holder", who, child);
  return { child, locked, done };
}

/** git in `cwd`, failing the test on a non-zero exit. */
function git(cwd: string, args: string[]): void {
  const r = spawnSync(
    "git",
    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
    { cwd, encoding: "utf-8" },
  );
  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
}

async function waitForHolder(file: string, who: string, child: ChildProcess): Promise<void> {
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes(who)) return;
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error("holder " + who + " exited before writing " + file);
    }
    await delay(25);
  }
  throw new Error("holder " + who + " did not write " + file);
}

function holdNamed(
  who: string,
  name: string,
  env: NodeJS.ProcessEnv,
  script = SCRIPT,
  holdS = 30,
  cwd = process.cwd(),
) {
  const child = track(
    "bash",
    [
      "-c",
      '. "' +
        script +
        '"; take_local_stack_lock "' +
        who +
        '" "' +
        name +
        '" || exit 1; sleep ' +
        holdS,
    ],
    { env, cwd, stdio: ["ignore", "pipe", "pipe"] },
  );
  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
  const locked = waitForHolder(
    path.join(cache, "bkit", "machine-lock", name + ".lock.holder"),
    who,
    child,
  );
  return { child, locked, done };
}

function checkout(name: string): { root: string; script: string } {
  const root = path.join(tmp, name);
  const script = path.join(root, "scripts", "ci", "bkit-machine-lock.sh");
  fs.mkdirSync(path.dirname(script), { recursive: true });
  fs.copyFileSync(SCRIPT, script);
  git(tmp, ["init", "-q", "-b", "dev", root]);
  return { root, script };
}

/** Observable subprocess output also works when a holder uses a numbered slot. */
function running(snippet: string, env: NodeJS.ProcessEnv, script = SCRIPT, cwd = process.cwd()) {
  const started = Date.now();
  const child = track("bash", ["-c", `. "${script}"; ${snippet}`], {
    env,
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = { stdout: "", stderr: "" };
  child.stdout.on("data", (data: Buffer) => (output.stdout += data.toString()));
  child.stderr.on("data", (data: Buffer) => (output.stderr += data.toString()));
  const done = new Promise<Result>((resolve) => {
    child.on("close", (status) => resolve({ status, ...output, ms: Date.now() - started }));
  });
  return { child, output, done };
}

async function waitForOutput(process: ReturnType<typeof running>, text: string): Promise<void> {
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    if ((process.output.stdout + process.output.stderr).includes(text)) return;
    if (process.child.exitCode !== null || process.child.signalCode !== null) {
      throw new Error(`process exited before ${text}: ${process.output.stderr}`);
    }
    await delay(20);
  }
  throw new Error(`process did not print ${text}: ${process.output.stderr}`);
}

function slotHolder(who: string, env: NodeJS.ProcessEnv) {
  return running(`take_local_stack_lock "${who}" tests || exit 1; echo acquired; sleep 30`, env);
}

function replyProbeDiagnostic(result: ReturnType<typeof spawnSync>): string {
  return JSON.stringify({
    status: result.status,
    signal: result.signal,
    error: result.error && "code" in result.error ? result.error.code : undefined,
    stdout: result.stdout,
    stderr: result.stderr,
  });
}

function stopReplyProbe(pidFile: string): void {
  if (fs.existsSync(pidFile)) {
    spawnSync("kill", ["-TERM", fs.readFileSync(pidFile, "utf-8").trim()]);
  }
}

describe("machine lock slots, order and wait budgets", () => {
  it("reports a remaining numbered slot under bash -e after the primary slot is released", async () => {
    const env = envFor({ BKIT_TEST_SLOTS: "2" });
    const release = path.join(tmp, "release-primary");
    const first = running(
      `take_local_stack_lock "primary slot" tests || exit 1; echo acquired; while [ ! -f "${release}" ]; do sleep 0.05; done; release_local_stack_lock tests`,
      env,
    );
    await waitForOutput(first, "acquired");
    const second = slotHolder("remaining numbered slot", env);
    await waitForOutput(second, "acquired");
    fs.writeFileSync(release, "release");
    expect((await first.done).status).toBe(0);
    const primary = path.join(cache, "bkit", "machine-lock", "tests.lock.holder");
    await expect
      .poll(() => fs.existsSync(primary), { timeout: BUDGET.hookTimeout, interval: 20 })
      .toBe(false);
    const reported = run("set -e; local_stack_lock_holder tests; echo reported", env);
    expect(reported.status, reported.stderr).toBe(0);
    expect(reported.stdout).toContain("remaining numbered slot");
    expect(reported.stdout).not.toContain("primary slot");
    expect(reported.stdout).toContain("reported");
    expect(reported.stderr).toBe("");
  });

  it("with N slots, N runs hold a named lock at once and run N+1 waits naming every holder", async () => {
    const env = envFor({ BKIT_TEST_SLOTS: "2", LOCAL_STACK_LOCK_WAIT_S: "2" });
    const first = slotHolder("first slot", env);
    await waitForOutput(first, "acquired");
    const second = slotHolder("second slot", env);
    await waitForOutput(second, "acquired");
    const holders = run("local_stack_lock_holder tests", env);
    expect(holders.stdout).toContain("first slot");
    expect(holders.stdout).toContain("second slot");
    const third = commandRun(["third slot", "--lock", "tests", "--", "echo", "entered"], env);
    expect(third.status).toBe(75);
    expect(third.stdout).not.toContain("entered");
    expect(third.stderr).toContain("waiting");
    expect(third.stderr).toContain("first slot");
    expect(third.stderr).toContain("second slot");
  });

  it("a slots value that is not a whole number >= 1 falls back to 1 and says so", async () => {
    const invalid = ["0", "-1", "1.5", "garbage"];
    const notes = invalid.map((value) =>
      run(
        "take_local_stack_lock invalid tests || exit 1; release_local_stack_lock tests; take_local_stack_lock again tests || exit 1; release_local_stack_lock tests",
        envFor({ BKIT_TEST_SLOTS: value }),
      ),
    );
    expect(notes.map((result) => result.status)).toEqual([0, 0, 0, 0]);
    expect(notes.map((result) => result.stderr.match(/BKIT_TEST_SLOTS/g)?.length)).toEqual([
      1, 1, 1, 1,
    ]);
    expect(notes.map((result) => result.stderr)).toEqual(
      invalid.map(() => expect.stringMatching(/(?:fall|using|default).*1/i)),
    );
    const env = envFor({ BKIT_TEST_SLOTS: "0", LOCAL_STACK_LOCK_WAIT_S: "0" });
    const holder = slotHolder("invalid slots holder", env);
    await waitForOutput(holder, "acquired");
    const next = commandRun(["next", "--lock", "tests", "--", "echo", "entered"], env);
    expect(next.status).toBe(75);
    expect(next.stdout).not.toContain("entered");
  });

  it("the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one", () => {
    const bin = path.join(tmp, "bin");
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, "getconf"),
      '#!/bin/sh\n[ "$1" = _NPROCESSORS_ONLN ] || exit 1\nprintf "10\\n"\n',
      { mode: 0o755 },
    );
    const results = ["1", "2", "20"].map((slots) =>
      commandRun(
        ["workers", "--lock", "tests", "--", "bash", "-c", 'printf "%s" "$BKIT_TEST_WORKERS"'],
        envFor({ BKIT_TEST_SLOTS: slots, PATH: bin + path.delimiter + process.env.PATH }),
      ),
    );
    expect(results.map((result) => result.status)).toEqual([0, 0, 0]);
    expect(results.map((result) => result.stdout)).toEqual(["9", "4", "1"]);
  });

  it("a killed tests-lock holder frees its slot within a second and the waiter starts", async () => {
    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "5" });
    const holder = slotHolder("doomed holder", env);
    await waitForOutput(holder, "acquired");
    const waiter = running(
      "take_local_stack_lock waiter tests || exit 1; echo entered; release_local_stack_lock tests",
      env,
    );
    await waitForOutput(waiter, "waiting");
    const killedAt = Date.now();
    holder.child.kill("SIGKILL");
    await waitForOutput(waiter, "entered");
    // Holder detection and waiter acquisition must both fit within the handoff budget.
    expect(Date.now() - killedAt).toBeLessThan(2000);
    expect((await waiter.done).status).toBe(0);
  });

  it("taking the tests lock while holding the stack lock is refused, naming the lock order", () => {
    const result = run(
      'take_local_stack_lock outer || exit 9; take_local_stack_lock inner tests; status=$?; release_local_stack_lock; exit "$status"',
      envFor(),
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/order/i);
    expect(result.stderr).toContain("tests");
    expect(result.stderr).toContain("stack");
    expect(result.ms).toBeLessThan(2000);
  });

  it("taking the tests lock while holding another named lock is refused, naming the lock order", () => {
    const result = run(
      'take_local_stack_lock outer database || exit 9; take_local_stack_lock inner tests; status=$?; release_local_stack_lock database; exit "$status"',
      envFor(),
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/order/i);
    expect(result.stderr).toContain("tests");
    expect(result.stderr).toContain("database");
    expect(result.ms).toBeLessThan(2000);
  });

  it("taking a named lock while holding the stack lock is refused, naming the lock order", () => {
    const result = run(
      'take_local_stack_lock outer || exit 9; take_local_stack_lock inner database; status=$?; release_local_stack_lock; exit "$status"',
      envFor(),
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/order/i);
    expect(result.stderr).toContain("database");
    expect(result.stderr).toContain("stack");
    expect(result.ms).toBeLessThan(2000);
  });

  it("a child of a stack-lock holder asking for the tests lock is refused, naming the lock order", () => {
    const result = run(
      `take_local_stack_lock parent || exit 9; bash "${SCRIPT}" run child --lock tests -- echo entered; status=$?; release_local_stack_lock; exit "$status"`,
      envFor(),
    );
    expect(result.status).toBe(73);
    expect(result.stdout).not.toContain("entered");
    expect(result.stderr).toMatch(/order/i);
    expect(result.stderr).toContain("tests");
    expect(result.stderr).toContain("stack");
    expect(result.ms).toBeLessThan(2000);
  });

  it("a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set", async () => {
    const env = envFor();
    delete env.LOCAL_STACK_LOCK_WAIT_S;
    const holder = slotHolder("budget holder", env);
    await waitForOutput(holder, "acquired");
    const defaultWait = running("take_local_stack_lock default tests", env);
    await waitForOutput(defaultWait, "waiting");
    defaultWait.child.kill("SIGKILL");
    await defaultWait.done;
    expect(defaultWait.output.stderr).toContain("up to 60s");
    const explicit = commandRun(["explicit", "--lock", "tests", "--", "echo", "entered"], {
      ...env,
      LOCAL_STACK_LOCK_WAIT_S: "2",
    });
    expect(explicit.status).toBe(75);
    expect(explicit.stderr).toContain("up to 2s");
    expect(explicit.stderr).toContain("after 2s");
    expect(explicit.stdout).not.toContain("entered");
    expect(explicit.ms).toBeGreaterThanOrEqual(1000);
    expect(explicit.ms).toBeLessThan(4000);
  });

  it("the tests lock records its held time by checkout on release and the next waiting note names the holder's last run", async () => {
    const first = checkout("first-history");
    const second = checkout("second-history");
    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "1" });
    const firstRun = run(
      "take_local_stack_lock first tests || exit 1; sleep 1; release_local_stack_lock tests",
      env,
      first.script,
      first.root,
    );
    expect(firstRun.status).toBe(0);
    const history = path.join(cache, "bkit", "machine-lock", "tests.last");
    expect(fs.readFileSync(history, "utf-8")).toMatch(new RegExp(`${first.root}\\t[1-9][0-9]*`));
    const secondRun = run(
      "take_local_stack_lock second tests || exit 1; sleep 1; release_local_stack_lock tests",
      env,
      second.script,
      second.root,
    );
    expect(secondRun.status).toBe(0);
    expect(fs.readFileSync(history, "utf-8").trim().split("\n")).toHaveLength(2);
    // Distinct recorded durations make choosing the current holder's checkout observable.
    fs.writeFileSync(history, `${first.root}\t610\n${second.root}\t2\n`);
    const holder = running(
      "take_local_stack_lock current tests || exit 1; echo acquired; sleep 30",
      env,
      second.script,
      second.root,
    );
    await waitForOutput(holder, "acquired");
    const waiting = commandRun(
      ["waiting", "--lock", "tests", "--", "echo", "entered"],
      env,
      first.script,
      first.root,
    );
    expect(waiting.status).toBe(75);
    expect(waiting.stderr).toContain("current");
    expect(waiting.stderr).toContain("last run took 0m2s");
    expect(waiting.stderr).not.toContain("last run took 10m10s");
    holder.child.kill("SIGKILL");
    await holder.done;
    const replacement = run(
      "take_local_stack_lock replacement tests || exit 1; release_local_stack_lock tests",
      env,
      first.script,
      first.root,
    );
    expect(replacement.status).toBe(0);
    const rows = fs.readFileSync(history, "utf-8").trim().split("\n");
    expect(rows).toHaveLength(2);
    expect(rows.filter((row) => row.startsWith(first.root + "\t"))).toHaveLength(1);
    expect(rows.filter((row) => row.startsWith(second.root + "\t"))).toHaveLength(1);
  });
});

function commandRun(
  args: string[],
  env: NodeJS.ProcessEnv,
  script = SCRIPT,
  cwd = process.cwd(),
): Result {
  const started = Date.now();
  const result = spawnSync("bash", [script, "run", ...args], {
    env,
    cwd,
    encoding: "utf-8",
    timeout: BUDGET.testTimeout,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    ms: Date.now() - started,
  };
}

function stopGate(pid: number): void {
  try {
    process.kill(pid, "SIGKILL");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ESRCH")) throw error;
  }
}

describe("bkit-machine-lock.sh", { timeout: BUDGET.testTimeout }, () => {
  it("terminating a run wrapper stops its gate before another run acquires the tests lock", async () => {
    const env = envFor({ BKIT_TEST_SLOTS: "1", LOCAL_STACK_LOCK_WAIT_S: "0" });
    const pidFile = path.join(tmp, "gate.pid");
    const wrapper = track(
      "bash",
      [
        SCRIPT,
        "run",
        "cancelled gate",
        "--lock",
        "tests",
        "--",
        "sh",
        "-c",
        'echo $$ > "$1"; exec sleep 30',
        "sh",
        pidFile,
      ],
      { env, stdio: "ignore" },
    );
    await expect.poll(() => fs.existsSync(pidFile), { timeout: BUDGET.hookTimeout }).toBe(true);
    const gatePid = Number(fs.readFileSync(pidFile, "utf-8").trim());
    expect(gatePid).toBeGreaterThan(0);
    try {
      expect(commandRun(["before cancellation", "--lock", "tests", "--", "true"], env).status).toBe(
        75,
      );
      expect(wrapper.kill("SIGTERM")).toBe(true);
      // The current holder checks its owner's liveness once per second.
      await delay(1200);
      const next = commandRun(
        [
          "after cancellation",
          "--lock",
          "tests",
          "--",
          "sh",
          "-c",
          'if kill -0 "$1" 2>/dev/null; then echo gate-still-alive; fi; echo acquired',
          "sh",
          String(gatePid),
        ],
        env,
      );
      // Keeping the lock until the gate stops and cancelling the gate are both safe.
      expect([0, 75], next.stderr).toContain(next.status);
      expect(next.stdout).not.toContain("gate-still-alive");
      const expectedOutput: Record<string, string> = { "0": "acquired\n", "75": "" };
      expect(next.stdout).toBe(expectedOutput[String(next.status)]);
    } finally {
      stopGate(gatePid);
    }
    await expect
      .poll(
        () =>
          commandRun(["after gate stops", "--lock", "tests", "--", "echo", "released"], env).status,
        { timeout: BUDGET.hookTimeout },
      )
      .toBe(0);
  });

  it("punctuation in distinct named locks keeps acquisition and release state separate", () => {
    const result = run(
      'take_local_stack_lock "hyphen holder" a-b || exit 11\n' +
        'take_local_stack_lock "underscore holder" a_b || exit 12\n' +
        "local_stack_lock_holder a-b\nlocal_stack_lock_holder a_b\n" +
        "release_local_stack_lock a-b\n" +
        'printf "remaining: "; local_stack_lock_holder a_b\n' +
        "release_local_stack_lock a_b",
      envFor(),
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("hyphen holder");
    expect(result.stdout).toContain("underscore holder");
    expect(result.stdout).toContain("remaining: underscore holder");
  });

  it.each(["", "tests", "a-b"])("unset owner state is safe under bash -eu for lock %j", (name) => {
    const result = spawnSync(
      "bash",
      [
        "-eu",
        "-c",
        '. "$1"; take_local_stack_lock "strict caller" "$2"; local_stack_lock_holder "$2"; release_local_stack_lock "$2"; release_local_stack_lock "$2"',
        "strict-lock",
        SCRIPT,
        name,
      ],
      {
        env: envFor({ BKIT_LOCAL_STACK: "strict-stack" }),
        encoding: "utf-8",
        timeout: BUDGET.testTimeout,
      },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("strict caller");
    expect(result.stderr).not.toContain("unbound variable");
  });

  it("a second run cannot take the lock while the first holds it, and is told who holds it", async () => {
    const env = envFor();
    const first = hold("first run", 10, env);
    await first.locked;
    const second = run(`try_local_stack_lock "second run"`, env);
    expect(second.status).toBe(1);
    expect(second.stderr).toContain("first run");
    expect(second.stderr).toContain(CHECKOUT);
  });

  it("a killed holder leaves no stale lock", async () => {
    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
    const first = hold("killed run", 60, env);
    await first.locked;
    first.child.kill("SIGKILL");
    await first.done;
    const after = run(`take_local_stack_lock "next run" && echo got-it`, env);
    expect(after.stdout, after.stderr).toContain("got-it");
    expect(after.status).toBe(0);
    expect(after.ms).toBeLessThan(8_000);
  });

  it("a waiting run starts as soon as the holder finishes, having said who it waits for", async () => {
    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "20" });
    const first = hold("short run", 2, env);
    await first.locked;
    const second = run(`take_local_stack_lock "waiting run" && echo got-it`, env);
    await first.done;
    expect(second.stdout, second.stderr).toContain("got-it");
    expect(second.stderr).toContain("waiting run is waiting for the local stack");
    expect(second.stderr).toContain("in use by short run");
    expect(second.ms).toBeGreaterThanOrEqual(1_000);
  });

  it("the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder", async () => {
    const env = envFor();
    const first = hold("long run", 30, env);
    await first.locked;
    const second = run(`take_local_stack_lock "impatient run"`, {
      ...env,
      LOCAL_STACK_LOCK_WAIT_S: "2",
    });
    expect(second.status).toBe(1);
    expect(second.stderr).toMatch(/impatient run gave up after 2s .*long run/);
  });

  it("release frees the lock before the caller exits", () => {
    const r = run(
      `take_local_stack_lock a || exit 1
       release_local_stack_lock
       bash -c '. "${SCRIPT}"; try_local_stack_lock b' || exit 9
       echo released`,
      envFor(),
    );
    expect(r.stdout, r.stderr).toContain("released");
    expect(r.status).toBe(0);
  });

  it("a caller under `set -e` survives a refused try", async () => {
    const env = envFor();
    const first = hold("busy run", 30, env);
    await first.locked;
    const busy = run(`set -e; if try_local_stack_lock a; then :; fi; echo after-busy`, env);
    expect(busy.stdout, busy.stderr).toContain("after-busy");
  });

  it("a caller under `set -e` survives releasing a holder that is already gone", () => {
    const gone = run(
      `set -e; take_local_stack_lock a; kill "$LOCAL_STACK_LOCK_PID"; sleep 0.3; release_local_stack_lock; echo after-release`,
      envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" }),
    );
    expect(gone.stdout, gone.stderr).toContain("after-release");
  });

  it("a runner started by the holder does not wait on its parent", () => {
    const r = run(
      `take_local_stack_lock parent || exit 1
       LOCAL_STACK_LOCK_WAIT_S=2 bash -c '. "${SCRIPT}"; take_local_stack_lock child' && echo nested-ok`,
      envFor(),
    );
    expect(r.stdout, r.stderr).toContain("nested-ok");
    expect(r.stderr).not.toContain("waiting");
    // The parent's wait-mode take made the queue folder; the child reused the parent's lock and
    // left no ticket in it.
    const queue = run("local_stack_lock_file", envFor())
      .stdout.trim()
      .replace(/\.lock$/, ".queue");
    expect(fs.existsSync(queue), "the stack lock's queue folder " + queue).toBe(true);
    expect(fs.readdirSync(queue)).toEqual([]);
  });

  it("a stack named by BKIT_LOCAL_STACK never waits on the shared one", async () => {
    const env = envFor();
    const first = hold("shared run", 30, env);
    await first.locked;
    const r = run(`try_local_stack_lock throwaway && local_stack_lock_file`, {
      ...env,
      BKIT_LOCAL_STACK: "throwaway-test",
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout.trim()).toBe(
      path.join(cache, "bkit", "local-stack-lock", "throwaway-test.lock"),
    );
  });

  it("every worktree of one repo resolves the main checkout's lock, and waits on it", async () => {
    const main = path.join(tmp, "app-main");
    const worktree = path.join(tmp, "app-feature");
    fs.mkdirSync(path.join(main, "scripts", "ci"), { recursive: true });
    fs.copyFileSync(SCRIPT, path.join(main, "scripts", "ci", "bkit-machine-lock.sh"));
    git(tmp, ["init", "-q", "-b", "dev", main]);
    git(main, ["add", "."]);
    git(main, ["commit", "-q", "-m", "init"]);
    git(main, ["worktree", "add", "-q", "-b", "feat", worktree]);
    const inMain = path.join(main, "scripts", "ci", "bkit-machine-lock.sh");
    const inWorktree = path.join(worktree, "scripts", "ci", "bkit-machine-lock.sh");
    const env = envFor();

    const lockFile = path.join(cache, "bkit", "local-stack-lock", "app-main.lock");
    expect(run("local_stack_lock_file", env, inMain, main).stdout.trim()).toBe(lockFile);
    expect(run("local_stack_lock_file", env, inWorktree, worktree).stdout.trim()).toBe(lockFile);

    const first = hold("main run", 30, env, inMain, main);
    await first.locked;
    const second = run(`try_local_stack_lock "worktree run"`, env, inWorktree, worktree);
    expect(second.status).toBe(1);
    expect(second.stderr).toContain(`main run — ${main}`);
  });

  it("outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why", () => {
    const loose = path.join(tmp, "loose");
    fs.mkdirSync(loose);
    fs.copyFileSync(SCRIPT, path.join(loose, "bkit-machine-lock.sh"));
    const r = run(
      `take_local_stack_lock "loose run"`,
      envFor({ GIT_CEILING_DIRECTORIES: tmp }),
      path.join(loose, "bkit-machine-lock.sh"),
      loose,
    );
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("cannot name the local stack");
    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
  });

  it("a holder that stops before it answers fails the take at once instead of hanging", () => {
    const broken = path.join(tmp, "broken-lock.sh");
    const text = fs.readFileSync(SCRIPT, "utf-8");
    expect(text).toContain("/usr/bin/perl -e '\n");
    fs.writeFileSync(
      broken,
      text.replaceAll("/usr/bin/perl -e '\n", "/usr/bin/perl -e 'exit 1;\n"),
    );
    const r = run(`take_local_stack_lock "doomed run"`, envFor({ BKIT_LOCAL_STACK: "x" }), broken);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("stopped before it answered");
    expect(r.ms).toBeLessThan(10_000);
  });

  it.each([
    {
      name: "preserves fragmented successful FIFO replies across timed reads",
      reply: 'print $out "o"; select(undef, undef, undef, 1.2); print $out "k\\n";',
      status: 0,
      stdout: "acquired\nreleased\n",
      stderr: "",
    },
    {
      name: "stops and reaps an acquired holder after a malformed FIFO reply",
      reply: 'print $out "invalid\\n";',
      status: 1,
      stdout: "",
      stderr: "[machine-lock] ❌ could not take the lock for tests: invalid\n",
    },
  ])("$name", ({ reply, status, stdout, stderr }) => {
    const broken = path.join(tmp, "reply-lock.sh");
    const pidFile = path.join(tmp, "reply-holder.pid");
    const text = fs.readFileSync(SCRIPT, "utf-8");
    const original = 'print $out "ok\\n";';
    expect(text).toContain(original);
    fs.writeFileSync(
      broken,
      text.replace(
        original,
        () =>
          'open(my $probe, ">", $ENV{BKIT_LOCK_PROBE_PID}) or die $!; ' +
          'print $probe "$$\\n"; close $probe; ' +
          reply,
      ),
    );
    const env = envFor({ BKIT_LOCK_PROBE_PID: pidFile });
    const result = spawnSync(
      "bash",
      [
        "-c",
        `. "${broken}"; take_local_stack_lock probe tests || exit 1; echo acquired; release_local_stack_lock tests; echo released`,
      ],
      { env, encoding: "utf-8", timeout: 5_000 },
    );
    const diagnostic = replyProbeDiagnostic(result);
    try {
      expect(result.status, diagnostic).toBe(status);
      expect(result.signal, diagnostic).toBeNull();
      expect(result.error, diagnostic).toBeUndefined();
      expect(fs.existsSync(pidFile), diagnostic).toBe(true);
      const pid = fs.readFileSync(pidFile, "utf-8").trim();
      expect(pid, diagnostic).toMatch(/^[1-9]\d*$/);
      expect(() => process.kill(Number(pid), 0), diagnostic).toThrow("ESRCH");
      expect(result.stdout, diagnostic).toBe(stdout);
      expect(result.stderr, diagnostic).toBe(stderr);
      const next = run(
        "try_local_stack_lock next tests && echo reacquired; release_local_stack_lock tests",
        env,
      );
      expect(next.status, next.stderr).toBe(0);
      expect(next.stdout, next.stderr).toContain("reacquired");
    } finally {
      stopReplyProbe(pidFile);
    }
  });

  it.each(["true", "1"])("CI=%s is a no-op that creates no lock file", (ci) => {
    const r = run(`take_local_stack_lock ci-run && echo ok`, envFor({ CI: ci }));
    expect(r.stdout, r.stderr).toContain("ok");
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
  });

  it("`run` holds the lock for the command and passes its exit status on", () => {
    const r = spawnSync(
      "bash",
      [
        SCRIPT,
        "run",
        "pkg script",
        "--",
        "bash",
        "-c",
        'cat "$XDG_CACHE_HOME"/bkit/local-stack-lock/*.holder; exit 3',
      ],
      { env: envFor(), encoding: "utf-8" },
    );
    expect(r.status, r.stderr).toBe(3);
    expect(r.stdout).toContain("pkg script");
  });

  it("`run` with no arguments prints usage and exits 2", () => {
    const r = spawnSync("bash", [SCRIPT], { env: envFor(), encoding: "utf-8" });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("usage");
  });

  it("a named lock is machine-wide: checkouts of two different repos wait on the same named lock", async () => {
    const firstRepo = checkout("first-repo");
    const secondRepo = checkout("second-repo");
    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
    const first = holdNamed("first repo gate", "tests", env, firstRepo.script, 2, firstRepo.root);
    await first.locked;
    const second = run(
      'take_local_stack_lock "second repo gate" tests && echo acquired',
      env,
      secondRepo.script,
      secondRepo.root,
    );
    await first.done;
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toContain("acquired");
    expect(second.stderr).toContain("first repo gate");
    expect(second.stderr).toContain(firstRepo.root);
    expect(second.ms).toBeGreaterThanOrEqual(1_000);
    expect(
      run("local_stack_lock_file tests", env, firstRepo.script, firstRepo.root).stdout.trim(),
    ).toBe(path.join(cache, "bkit", "machine-lock", "tests.lock"));
    expect(
      run("local_stack_lock_file tests", env, secondRepo.script, secondRepo.root).stdout.trim(),
    ).toBe(path.join(cache, "bkit", "machine-lock", "tests.lock"));
  });

  it("copied-repository lock helpers execute in the requested caller checkout", () => {
    const copied = checkout("requested-caller");
    const env = envFor();
    const sourced = run("pwd -P", env, copied.script, copied.root);
    const command = commandRun(
      ["caller cwd probe", "--lock", "cwd-probe", "--", "bash", "-c", "pwd -P"],
      env,
      copied.script,
      copied.root,
    );
    expect(sourced.status, sourced.stderr).toBe(0);
    expect(sourced.stdout.trim()).toBe(copied.root);
    expect(command.status, command.stderr).toBe(0);
    expect(command.stdout.trim()).toBe(copied.root);
  });

  it("one process holds a named lock and the unnamed stack lock side by side", () => {
    const result = run(
      'take_local_stack_lock "named run" example || exit 11\n' +
        'take_local_stack_lock "stack run" || exit 12\n' +
        "local_stack_lock_holder example\n" +
        "local_stack_lock_holder\n" +
        "release_local_stack_lock example\n" +
        "local_stack_lock_holder\n" +
        "release_local_stack_lock\n" +
        "echo both-released",
      envFor(),
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.match(/named run/g)).toHaveLength(1);
    expect(result.stdout.match(/stack run/g)).toHaveLength(2);
    expect(result.stdout).toContain("both-released");
  });

  it("a runner started by a named-lock holder does not wait on that named lock", () => {
    const result = run(
      'take_local_stack_lock "parent named run" tests || exit 11\n' +
        "LOCAL_STACK_LOCK_WAIT_S=0 bash -c '. \"" +
        SCRIPT +
        '"; take_local_stack_lock "child named run" tests && local_stack_lock_holder tests\'',
      envFor(),
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("parent named run");
    expect(result.stdout).not.toContain("child named run");
    expect(result.stderr).not.toContain("waiting");
    expect(result.stderr).not.toContain("gave up");
  });

  it("the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other", async () => {
    const env = envFor({ BKIT_LOCAL_STACK: "compat-stack", LOCAL_STACK_LOCK_WAIT_S: "10" });
    const expected = path.join(cache, "bkit", "local-stack-lock", "compat-stack.lock");
    expect(run("local_stack_lock_file", env).stdout.trim()).toBe(expected);
    expect(run("local_stack_lock_file", env, OLD_SCRIPT).stdout.trim()).toBe(expected);
    const older = hold("older stack run", 30, env, OLD_SCRIPT);
    await older.locked;
    const current = run('try_local_stack_lock "current stack run"', env);
    expect(current.status).toBe(1);
    expect(current.stderr).toContain("older stack run");
    older.child.kill("SIGKILL");
    await older.done;
    const newer = hold("newer stack run", 30, env);
    await newer.locked;
    const oldWaiter = run('try_local_stack_lock "older waiter"', env, OLD_SCRIPT);
    expect(oldWaiter.status).toBe(1);
    expect(oldWaiter.stderr).toContain("newer stack run");
  });

  it("run --lock holds the named lock for the command and passes its exit status on", () => {
    const result = commandRun(
      [
        "named package script",
        "--lock",
        "tests",
        "--",
        "bash",
        "-c",
        '. "' + SCRIPT + '"; local_stack_lock_holder tests; exit 7',
      ],
      envFor(),
    );
    expect(result.status, result.stderr).toBe(7);
    expect(result.stdout).toContain("named package script");
    expect(result.stdout).toContain(CHECKOUT);
    expect(result.stdout).toMatch(/pid \d+/);
  });

  it("run exits 75 when the wait gives up, distinct from the command's own failure", async () => {
    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "0" });
    const holder = holdNamed("blocking tests gate", "tests", env);
    await holder.locked;
    const waiting = commandRun(
      ["waiting tests gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
      env,
    );
    expect(waiting.status, waiting.stderr).toBe(75);
    expect(waiting.stdout).not.toContain("should-not-run");
    expect(waiting.stderr).toContain("waiting tests gate");
    expect(waiting.stderr).toContain("tests");
    expect(waiting.stderr).toContain("blocking tests gate");
    const commandFailure = commandRun(
      ["other named gate", "--lock", "another", "--", "bash", "-c", "echo command-ran; exit 75"],
      env,
    );
    expect(commandFailure.status, commandFailure.stderr).toBe(75);
    expect(commandFailure.stdout).toContain("command-ran");
    expect(commandFailure.stderr).not.toContain("gave up");
  });

  it("run exits 73 naming the path when the lock dir cannot be written", () => {
    const notDirectory = path.join(tmp, "cache-is-a-file");
    fs.writeFileSync(notDirectory, "this blocks mkdir");
    const result = commandRun(
      ["unwritable gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
      envFor({ XDG_CACHE_HOME: notDirectory }),
    );
    expect(result.status).toBe(73);
    expect(result.stdout).not.toContain("should-not-run");
    expect(result.stderr).toContain(notDirectory);
    expect(result.stderr).toContain("tests");
    expect(result.stderr).toMatch(/cannot|could not|not a directory/i);
  });

  it("run exits 73 naming /usr/bin/perl when perl is missing", () => {
    const broken = path.join(tmp, "no-perl-machine-lock.sh");
    const missingPerl = path.join(tmp, "missing-perl");
    const text = fs.readFileSync(SCRIPT, "utf-8");
    expect(text).toContain("/usr/bin/perl");
    fs.writeFileSync(broken, text.replaceAll("/usr/bin/perl", missingPerl));
    const result = commandRun(
      ["no perl gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
      envFor(),
      broken,
    );
    expect(result.status).toBe(73);
    expect(result.stdout).not.toContain("should-not-run");
    expect(result.stderr).toContain(missingPerl);
    expect(result.stderr).toContain("tests");
    expect(result.stderr).toMatch(/not found|missing|not executable/);
  });

  it("a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy", async () => {
    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "0", BKIT_LOCAL_STACK: "shared-stack" });
    const stack = hold("separate stack holder", 30, env);
    await stack.locked;
    const current = run(
      'take_local_stack_lock "tests parent" tests || exit 11\n' +
        "bash -c '. \"" +
        SCRIPT +
        '"; take_local_stack_lock "current child" && echo stack-was-skipped\'\n' +
        'child_status=$?; release_local_stack_lock tests; exit "$child_status"',
      env,
    );
    expect(current.status).toBe(1);
    expect(current.stdout).not.toContain("stack-was-skipped");
    expect(current.stderr).toContain("separate stack holder");
    const older = run(
      'take_local_stack_lock "tests parent" tests || exit 11\n' +
        "bash -c '. \"" +
        OLD_SCRIPT +
        '"; take_local_stack_lock "older child" && echo stack-was-skipped\'\n' +
        'child_status=$?; release_local_stack_lock tests; exit "$child_status"',
      env,
    );
    expect(older.status).toBe(1);
    expect(older.stdout).not.toContain("stack-was-skipped");
    expect(older.stderr).toContain("separate stack holder");
  });

  it("run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name", () => {
    const command = '. "' + SCRIPT + '"; local_stack_lock_holder tests';
    const fromEnvironment = commandRun(
      ["--lock", "tests", "--", "bash", "-c", command],
      envFor({
        LOCAL_STACK_LOCK_WHO: "workflow tests run",
        npm_lifecycle_event: "test:integration",
      }),
    );
    expect(fromEnvironment.status, fromEnvironment.stderr).toBe(0);
    expect(fromEnvironment.stdout).toContain("workflow tests run");
    expect(fromEnvironment.stdout).not.toContain("test:integration");
    const fromPackage = commandRun(
      ["--lock", "tests", "--", "bash", "-c", command],
      envFor({ LOCAL_STACK_LOCK_WHO: "", npm_lifecycle_event: "test:integration" }),
    );
    expect(fromPackage.status, fromPackage.stderr).toBe(0);
    expect(fromPackage.stdout).toContain("test:integration");
    expect(fromPackage.stdout).not.toContain("--lock");
  });
});

// ---- waiters are served in the order they started waiting ----

const TICKET_NAME = /^\d+\.\d{6}-(\d+)$/;
const STACK = "qstack";

/** The queue folder beside a lock: a named lock, or the unnamed stack lock of STACK. */
function queueOf(name?: string): string {
  return name
    ? path.join(cache, "bkit", "machine-lock", name + ".queue")
    : path.join(cache, "bkit", "local-stack-lock", STACK + ".queue");
}

function ticketsIn(queue: string): string[] {
  if (!fs.existsSync(queue)) return [];
  return fs
    .readdirSync(queue)
    .filter((entry) => TICKET_NAME.test(entry))
    .sort();
}

/** The pid in the name of the live ticket whose first line starts with `who — `. */
function ticketPid(queue: string, who: string): number {
  for (const name of ticketsIn(queue)) {
    let line = "";
    try {
      line = fs.readFileSync(path.join(queue, name), "utf-8");
    } catch {
      continue;
    }
    if (line.startsWith(who + " — ")) return Number(TICKET_NAME.exec(name)![1]);
  }
  throw new Error("no ticket for " + who + " in " + queue);
}

async function waitForTicket(queue: string, who: string): Promise<number> {
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    try {
      return ticketPid(queue, who);
    } catch {
      await delay(20);
    }
  }
  return ticketPid(queue, who);
}

/** The held place (`<ticket name>.held`) a waiter that gave up left behind. */
function heldPlaceFor(queue: string, who: string): string {
  let names: string[] = [];
  try {
    names = fs.readdirSync(queue).filter((entry) => entry.endsWith(".held"));
  } catch {
    names = [];
  }
  for (const name of names) {
    const file = path.join(queue, name);
    try {
      if (fs.readFileSync(file, "utf-8").startsWith(who + " — ")) return file;
    } catch {
      continue;
    }
  }
  throw new Error("no held place for " + who + " in " + queue);
}

async function waitForHeldPlace(queue: string, who: string): Promise<string> {
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    try {
      return heldPlaceFor(queue, who);
    } catch {
      await delay(20);
    }
  }
  return heldPlaceFor(queue, who);
}

function readLines(file: string): string[] {
  return fs.existsSync(file)
    ? fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .filter((line) => line !== "")
    : [];
}

/** Plants `<ms>.jump` in the queue, carrying the first line of the live ticket (or held place) of `who`. */
function plantJump(queue: string, who: string, at = Date.now()): string {
  let source: string | undefined;
  for (const name of ticketsIn(queue)) {
    const file = path.join(queue, name);
    try {
      if (fs.readFileSync(file, "utf-8").startsWith(who + " — ")) source = file;
    } catch {
      continue;
    }
  }
  source ??= heldPlaceFor(queue, who);
  const line = fs.readFileSync(source, "utf-8").split("\n")[0]!;
  const marker = path.join(queue, at + ".jump");
  fs.writeFileSync(marker, line + "\n");
  return marker;
}

/** A run wrapper: `bash <script> run <who> [--lock name] -- <command>`, output captured. */
function wrapped(
  who: string,
  env: NodeJS.ProcessEnv,
  command: string,
  opts: { lock?: string; script?: string } = {},
) {
  const started = Date.now();
  const args = [opts.script ?? SCRIPT, "run", who, ...(opts.lock ? ["--lock", opts.lock] : [])];
  const child = track("bash", [...args, "--", "bash", "-c", command], {
    env,
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = { stdout: "", stderr: "" };
  child.stdout.on("data", (data: Buffer) => (output.stdout += data.toString()));
  child.stderr.on("data", (data: Buffer) => (output.stderr += data.toString()));
  const done = new Promise<Result>((resolve) => {
    child.on("close", (status) => resolve({ status, ...output, ms: Date.now() - started }));
  });
  return { child, output, done };
}

/** Holds a lock (named, or the unnamed stack lock) until `release()` is called. */
async function queueHolder(env: NodeJS.ProcessEnv, name?: string, who = "holder") {
  const releaseFile = path.join(tmp, "release-" + who);
  const arg = name ? " " + name : "";
  const proc = running(
    `take_local_stack_lock ${who}${arg} || exit 1; echo acquired; while [ ! -f "${releaseFile}" ]; do sleep 0.05; done; release_local_stack_lock${arg}`,
    env,
  );
  await waitForOutput(proc, "acquired");
  return { proc, release: () => fs.writeFileSync(releaseFile, "release") };
}

/** Starts a waiter that appends its name to `order`, and returns once its ticket is in the queue. */
async function queuedWaiter(
  who: string,
  env: NodeJS.ProcessEnv,
  order: string,
  name?: string,
  command = `echo ${who} >> "${order}"`,
) {
  const waiter = wrapped(who, env, command, { lock: name });
  await waitForTicket(queueOf(name), who);
  return waiter;
}

async function expectAllExit(waiters: { done: Promise<Result> }[]): Promise<void> {
  for (const result of await Promise.all(waiters.map((w) => w.done))) {
    expect(result.status, result.stderr).toBe(0);
  }
}

async function fiveInArrivalOrder(name: string | undefined, env: NodeJS.ProcessEnv) {
  const order = path.join(tmp, "order");
  const holder = await queueHolder(env, name);
  const waiters = [];
  for (const who of ["w1", "w2", "w3", "w4", "w5"]) {
    waiters.push(await queuedWaiter(who, env, order, name));
  }
  holder.release();
  await expectAllExit(waiters);
  return readLines(order);
}

describe("machine lock waiting order", { timeout: BUDGET.testTimeout }, () => {
  const waitEnv = (extra: Record<string, string> = {}) =>
    envFor({ LOCAL_STACK_LOCK_WAIT_S: "60", BKIT_LOCAL_STACK: STACK, ...extra });

  it("tests-lock waiters run their commands in arrival order", async () => {
    expect(await fiveInArrivalOrder("tests", waitEnv())).toEqual(["w1", "w2", "w3", "w4", "w5"]);
  });

  it("stack-lock waiters run their commands in arrival order", async () => {
    expect(await fiveInArrivalOrder(undefined, waitEnv())).toEqual(["w1", "w2", "w3", "w4", "w5"]);
  });

  it("a run that releases the lock and asks again queues behind runs already waiting", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const releaseFile = path.join(tmp, "release-again");
    const again = running(
      `take_local_stack_lock again tests || exit 1; echo acquired; echo again-1 >> "${order}"; while [ ! -f "${releaseFile}" ]; do sleep 0.05; done; release_local_stack_lock tests; take_local_stack_lock again tests || exit 1; echo again-2 >> "${order}"; release_local_stack_lock tests`,
      env,
    );
    await waitForOutput(again, "acquired");
    const waiters = [];
    for (const who of ["w1", "w2", "w3", "w4", "w5"]) {
      waiters.push(await queuedWaiter(who, env, order, "tests"));
    }
    fs.writeFileSync(releaseFile, "release");
    await expectAllExit(waiters);
    expect((await again.done).status).toBe(0);
    expect(readLines(order)).toEqual(["again-1", "w1", "w2", "w3", "w4", "w5", "again-2"]);
  });

  it("with two slots, waiters take freed slots in arrival order", async () => {
    const env = waitEnv({ BKIT_TEST_SLOTS: "2" });
    const order = path.join(tmp, "order");
    const slotA = await queueHolder(env, "tests", "slot-a");
    const slotB = await queueHolder(env, "tests", "slot-b");
    const gate = (who: string) =>
      `echo ${who} >> "${order}"; while [ ! -f "${tmp}/done-${who}" ]; do sleep 0.05; done`;
    const waiters = [];
    for (const who of ["w1", "w2", "w3", "w4"]) {
      waiters.push(await queuedWaiter(who, env, order, "tests", gate(who)));
    }
    slotA.release();
    await expect.poll(() => readLines(order), { timeout: BUDGET.hookTimeout }).toEqual(["w1"]);
    await delay(500);
    expect(readLines(order)).toEqual(["w1"]);
    slotB.release();
    await expect
      .poll(() => readLines(order), { timeout: BUDGET.hookTimeout })
      .toEqual(["w1", "w2"]);
    await delay(500);
    expect(readLines(order)).toEqual(["w1", "w2"]);
    fs.writeFileSync(path.join(tmp, "done-w1"), "");
    await expect
      .poll(() => readLines(order), { timeout: BUDGET.hookTimeout })
      .toEqual(["w1", "w2", "w3"]);
    fs.writeFileSync(path.join(tmp, "done-w2"), "");
    fs.writeFileSync(path.join(tmp, "done-w3"), "");
    fs.writeFileSync(path.join(tmp, "done-w4"), "");
    await expectAllExit(waiters);
    expect(readLines(order)).toEqual(["w1", "w2", "w3", "w4"]);
  });

  it("queued waiters keep their order while a copy without the queue also waits, and no two commands overlap", async () => {
    const env = waitEnv();
    const events = path.join(tmp, "events");
    const span = (who: string) =>
      `echo "start ${who}" >> "${events}"; sleep 0.2; echo "end ${who}" >> "${events}"`;
    const holder = await queueHolder(env, "tests");
    const waiters = [];
    for (const who of ["w1", "w2"]) {
      waiters.push(await queuedWaiter(who, env, events, "tests", span(who)));
    }
    const old = wrapped("old-copy", env, span("old-copy"), {
      lock: "tests",
      script: OLD_LOCK_SCRIPT,
    });
    await waitForOutput(old, "waiting");
    for (const who of ["w3", "w4", "w5"]) {
      waiters.push(await queuedWaiter(who, env, events, "tests", span(who)));
    }
    holder.release();
    await expectAllExit([...waiters, old]);
    const lines = readLines(events);
    expect(lines).toHaveLength(12);
    for (let i = 0; i < lines.length; i += 2) {
      const who = lines[i]!.replace("start ", "");
      expect(lines[i]).toBe("start " + who);
      expect(lines[i + 1]).toBe("end " + who);
    }
    expect(lines.filter((line) => /^start w\d$/.test(line))).toEqual(
      ["w1", "w2", "w3", "w4", "w5"].map((who) => "start " + who),
    );
    expect(lines).toContain("start old-copy");
  });

  it("a waiter that gives up leaves the line and the runs behind it keep their order", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const w2 = await queuedWaiter("w2", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
    const w3 = await queuedWaiter("w3", env, order, "tests");
    const w4 = await queuedWaiter("w4", env, order, "tests");
    const gaveUp = await w2.done;
    expect(gaveUp.status).toBe(75);
    expect(() => ticketPid(queueOf("tests"), "w2")).toThrow(/no ticket for/);
    holder.release();
    await expectAllExit([w1, w3, w4]);
    expect(readLines(order)).toEqual(["w1", "w3", "w4"]);
  });

  it("a waiter whose caller is killed leaves the line and the runs behind it keep their order", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const w2 = await queuedWaiter("w2", env, order, "tests");
    const w3 = await queuedWaiter("w3", env, order, "tests");
    w2.child.kill("SIGKILL");
    await expect
      .poll(() => ticketsIn(queueOf("tests")).length, { timeout: BUDGET.hookTimeout })
      .toBe(2);
    expect(() => ticketPid(queueOf("tests"), "w2")).toThrow(/no ticket for/);
    holder.release();
    await expectAllExit([w1, w3]);
    expect(readLines(order)).toEqual(["w1", "w3"]);
  });

  it("a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const w2 = await queuedWaiter("w2", env, order, "tests");
    const w3 = await queuedWaiter("w3", env, order, "tests");
    process.kill(ticketPid(queueOf("tests"), "w2"), "SIGTERM");
    await expect
      .poll(() => ticketsIn(queueOf("tests")).length, { timeout: 1000, interval: 10 })
      .toBe(2);
    expect(() => ticketPid(queueOf("tests"), "w2")).toThrow(/no ticket for/);
    holder.release();
    await expectAllExit([w1, w3]);
    await w2.done;
    expect(readLines(order)).toEqual(["w1", "w3"]);
  });

  it("a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const w2 = await queuedWaiter("w2", env, order, "tests");
    const w3 = await queuedWaiter("w3", env, order, "tests");
    process.kill(ticketPid(queueOf("tests"), "w2"), "SIGKILL");
    holder.release();
    await expectAllExit([w1, w3]);
    await w2.done;
    expect(readLines(order)).toEqual(["w1", "w3"]);
    await expect
      .poll(() => ticketsIn(queueOf("tests")), { timeout: BUDGET.hookTimeout })
      .toEqual([]);
  });

  it("run exits 73 naming the queue folder when it cannot be created", () => {
    const queue = queueOf("tests");
    fs.mkdirSync(path.dirname(queue), { recursive: true });
    fs.writeFileSync(queue, "a file cannot hold a queue folder");
    const result = commandRun(
      ["queue blocked", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
      envFor(),
    );
    expect(result.status, result.stderr).toBe(73);
    expect(result.stdout).not.toContain("should-not-run");
    expect(result.stderr).toContain(queue);
  });

  it("run exits 73 naming the queue folder when no ticket can be written", () => {
    const queue = queueOf("tests");
    fs.mkdirSync(queue, { recursive: true });
    fs.chmodSync(queue, 0o555);
    try {
      const result = commandRun(
        ["queue read-only", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
        envFor(),
      );
      expect(result.status, result.stderr).toBe(73);
      expect(result.stdout).not.toContain("should-not-run");
      expect(result.stderr).toContain(queue);
    } finally {
      fs.chmodSync(queue, 0o755);
    }
  });

  it("a try while a run waits first in line reports busy even when the lock is free", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const helper = ticketPid(queueOf("tests"), "w1");
    process.kill(helper, "SIGSTOP");
    try {
      holder.release();
      await holder.proc.done;
      const holderFile = path.join(cache, "bkit", "machine-lock", "tests.lock.holder");
      await expect
        .poll(() => fs.existsSync(holderFile), { timeout: BUDGET.hookTimeout })
        .toBe(false);
      const tried = run("try_local_stack_lock prober tests", env);
      expect(tried.status).toBe(1);
      expect(tried.stderr).toContain("1 waiting in line");
      expect(fs.existsSync(holderFile)).toBe(false);
    } finally {
      process.kill(helper, "SIGCONT");
    }
    await expectAllExit([w1]);
    expect(readLines(order)).toEqual(["w1"]);
  });

  it("the waiting note says where the run is in line", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const w2 = await queuedWaiter("w2", env, order, "tests");
    await waitForOutput(w1, "1st in line");
    await waitForOutput(w2, "2nd in line");
    holder.release();
    await expectAllExit([w1, w2]);
    expect(readLines(order)).toEqual(["w1", "w2"]);
  });

  it("a stray file in the queue folder neither blocks the line nor gets deleted", async () => {
    const env = waitEnv();
    const queue = queueOf("tests");
    fs.mkdirSync(queue, { recursive: true });
    fs.writeFileSync(path.join(queue, ".5.tmp"), "half-written ticket");
    fs.writeFileSync(path.join(queue, "notes.txt"), "not a ticket");
    expect(await fiveInArrivalOrder("tests", env)).toEqual(["w1", "w2", "w3", "w4", "w5"]);
    expect(fs.existsSync(path.join(queue, ".5.tmp"))).toBe(true);
    expect(fs.existsSync(path.join(queue, "notes.txt"))).toBe(true);
  });

  it("a stopped first-in-line waiter holds the line while the lock is free", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const w2 = await queuedWaiter("w2", env, order, "tests");
    const helper = ticketPid(queueOf("tests"), "w1");
    process.kill(helper, "SIGSTOP");
    try {
      holder.release();
      await holder.proc.done;
      await delay(800);
      expect(readLines(order)).toEqual([]);
    } finally {
      process.kill(helper, "SIGCONT");
    }
    await expectAllExit([w1, w2]);
    expect(readLines(order)).toEqual(["w1", "w2"]);
  });

  it("a waiter that gives up and asks again within 120 s keeps its place in line", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const queue = queueOf("tests");
    const holder = await queueHolder(env, "tests");
    const first = await queuedWaiter("x", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
    const y = await queuedWaiter("y", env, order, "tests");
    expect((await first.done).status).toBe(75);
    await waitForHeldPlace(queue, "x");
    const again = await queuedWaiter("x", env, order, "tests");
    holder.release();
    await expectAllExit([y, again]);
    expect(readLines(order)).toEqual(["x", "y"]);
  });

  it("a held place older than 120 s is deleted and the re-ask joins the end of the line", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const queue = queueOf("tests");
    const holder = await queueHolder(env, "tests");
    const first = await queuedWaiter("x", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
    const y = await queuedWaiter("y", env, order, "tests");
    expect((await first.done).status).toBe(75);
    const held = await waitForHeldPlace(queue, "x");
    const old = new Date(Date.now() - 300_000);
    fs.utimesSync(held, old, old);
    await expect.poll(() => fs.existsSync(held), { timeout: BUDGET.hookTimeout }).toBe(false);
    expect(() => heldPlaceFor(queue, "x")).toThrow(/no held place for/);
    const again = await queuedWaiter("x", env, order, "tests");
    holder.release();
    await expectAllExit([y, again]);
    expect(readLines(order)).toEqual(["y", "x"]);
  });

  it("a jump marker moves its waiting run to the front of the line", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const waiters = [];
    for (const who of ["w1", "w2", "w3", "w4"]) {
      waiters.push(await queuedWaiter(who, env, order, "tests"));
    }
    plantJump(queueOf("tests"), "w4");
    holder.release();
    await expectAllExit(waiters);
    expect(readLines(order)).toEqual(["w4", "w1", "w2", "w3"]);
  });

  it("the newest jump marker goes first", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const waiters = [];
    for (const who of ["w1", "w2", "w3"]) {
      waiters.push(await queuedWaiter(who, env, order, "tests"));
    }
    plantJump(queueOf("tests"), "w2", Date.now() - 5000);
    plantJump(queueOf("tests"), "w3", Date.now());
    holder.release();
    await expectAllExit(waiters);
    expect(readLines(order)).toEqual(["w3", "w2", "w1"]);
  });

  it("a jump marker that matches no waiting run is deleted", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const queue = queueOf("tests");
    const holder = await queueHolder(env, "tests");
    const w1 = await queuedWaiter("w1", env, order, "tests");
    const marker = path.join(queue, Date.now() + ".jump");
    fs.writeFileSync(marker, "ghost — /nowhere/ghost\n");
    await expect.poll(() => fs.existsSync(marker), { timeout: BUDGET.hookTimeout }).toBe(false);
    holder.release();
    await expectAllExit([w1]);
    expect(readLines(order)).toEqual(["w1"]);
  });

  it("a jumped run that gives up and asks again within 120 s keeps the front", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const queue = queueOf("tests");
    const holder = await queueHolder(env, "tests");
    const z = await queuedWaiter("z", env, order, "tests");
    const first = await queuedWaiter("x", { ...env, LOCAL_STACK_LOCK_WAIT_S: "2" }, order, "tests");
    const y = await queuedWaiter("y", env, order, "tests");
    plantJump(queue, "x");
    expect((await first.done).status).toBe(75);
    await waitForHeldPlace(queue, "x");
    const again = await queuedWaiter("x", env, order, "tests");
    holder.release();
    await expectAllExit([z, y, again]);
    expect(readLines(order)).toEqual(["x", "z", "y"]);
  });

  it("concurrent first takes on a fresh cache exit 0 with no cannot-create refusal", async () => {
    const rounds = 50;
    const takes = 16;
    const results: { round: number; i: number; status: string; err: string }[] = [];
    for (let round = 0; round < rounds; round++) {
      const env = envFor({
        LOCAL_STACK_LOCK_WAIT_S: "60",
        XDG_CACHE_HOME: path.join(tmp, "race-cache-" + round),
      });
      // One shell forks every taker back to back, so they reach the queue folder together.
      const burst = spawnSync(
        "bash",
        [
          "-c",
          `for i in $(seq ${takes}); do ( bash "${SCRIPT}" run race$i --lock tests -- true 2>"$XDG_CACHE_HOME.err$i"; echo $? >"$XDG_CACHE_HOME.st$i" ) & done; wait`,
        ],
        { env, cwd: process.cwd(), encoding: "utf8" },
      );
      expect(burst.error).toBeUndefined();
      for (let i = 1; i <= takes; i++) {
        const base = path.join(tmp, "race-cache-" + round);
        const status = fs.readFileSync(`${base}.st${i}`, "utf8").trim();
        const err = fs.readFileSync(`${base}.err${i}`, "utf8").trim();
        // The "in line" waiting note is normal; only a non-zero exit or a queue-folder refusal counts.
        results.push({ round, i, status, err });
      }
    }
    const refused = results
      .filter((r) => /^exit=(?!0\n)|cannot create|File exists/.test(`exit=${r.status}\n${r.err}`))
      .map((r) => `round ${r.round} take ${r.i} exit ${r.status}: ${r.err}`);
    expect(refused).toEqual([]);
  }, 600_000);

  it("a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP", async () => {
    const env = waitEnv();
    const order = path.join(tmp, "order");
    const holder = await queueHolder(env, "tests");
    const child = track(
      "bash",
      [
        "-c",
        `trap '' HUP; exec bash "${SCRIPT}" run w1 --lock tests -- bash -c 'echo w1 >> "${order}"'`,
      ],
      { env, cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] },
    );
    let stderr = "";
    child.stderr.on("data", (data: Buffer) => (stderr += data.toString()));
    const done = new Promise<number | null>((resolve) =>
      child.on("close", (status) => resolve(status)),
    );
    await waitForTicket(queueOf("tests"), "w1");
    process.kill(ticketPid(queueOf("tests"), "w1"), "SIGHUP");
    await delay(500);
    expect(ticketsIn(queueOf("tests")).length).toBe(1);
    holder.release();
    expect(await done, stderr).toBe(0);
    expect(stderr).not.toContain("stopped before it answered");
    expect(readLines(order)).toEqual(["w1"]);
  });
});
