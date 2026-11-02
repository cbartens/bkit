// audits/templates/machine-lock.integration.test.ts — the local stack lock bkit ships as a
// copy-and-own template, run for real: real bash, real perl holder, real flock. Each test points
// XDG_CACHE_HOME at its own folder, so a real run on this machine is never touched or waited on.

import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { tierTimeouts } from "../../../../../vitest.timeout-budget";

const OLD_SCRIPT = path.resolve("tests/fixtures/machine-lock/stack-lock-6.0.0.sh");
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

beforeEach(() => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stack-lock-")));
  cache = path.join(tmp, "cache");
  children = [];
});
afterEach(() => {
  for (const child of children) child.kill("SIGKILL");
  fs.rmSync(tmp, { recursive: true, force: true });
});

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
  const child = spawn(
    "bash",
    ["-c", `. "${script}"; take_local_stack_lock "${who}" || exit 1; echo locked; sleep ${holdS}`],
    { env, cwd, stdio: ["ignore", "pipe", "pipe"] },
  );
  children.push(child);
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
  const child = spawn(
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
  children.push(child);
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

describe("bkit-machine-lock.sh", { timeout: BUDGET.testTimeout }, () => {
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
    fs.writeFileSync(broken, text.replace("/usr/bin/perl -e '\n", "/usr/bin/perl -e 'exit 1;\n"));
    const r = run(`take_local_stack_lock "doomed run"`, envFor({ BKIT_LOCAL_STACK: "x" }), broken);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("stopped before it answered");
    expect(r.ms).toBeLessThan(10_000);
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
