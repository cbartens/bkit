// audits/templates/local-stack-lock.integration.test.ts — the local stack lock bkit ships as a
// copy-and-own template, run for real: real bash, real perl holder, real flock. Each test points
// XDG_CACHE_HOME at its own folder, so a real run on this machine is never touched or waited on.

import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-local-stack-lock.sh");
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
  delete env.LOCAL_STACK_LOCK_OWNER;
  delete env.BKIT_LOCAL_STACK;
  return { ...env, ...extra };
}

/** Runs a bash snippet with `script` sourced. */
function run(snippet: string, env: NodeJS.ProcessEnv, script = SCRIPT): Result {
  const started = Date.now();
  const r = spawnSync("bash", ["-c", `. "${script}"; ${snippet}`], {
    env,
    encoding: "utf-8",
    timeout: 30_000,
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, ms: Date.now() - started };
}

/** A run that takes the lock and holds it `holdS` seconds; `locked` resolves once it holds it. */
function hold(who: string, holdS: number, env: NodeJS.ProcessEnv, script = SCRIPT) {
  const child = spawn(
    "bash",
    ["-c", `. "${script}"; take_local_stack_lock "${who}" || exit 1; echo locked; sleep ${holdS}`],
    { env, stdio: ["ignore", "pipe", "pipe"] },
  );
  children.push(child);
  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
  const locked = new Promise<void>((resolve, reject) => {
    child.stdout.on("data", (d: Buffer) => {
      if (String(d).includes("locked")) resolve();
    });
    child.on("exit", (code) => reject(new Error(`holder exited ${code} before taking the lock`)));
  });
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

describe("bkit-local-stack-lock.sh", () => {
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
    fs.copyFileSync(SCRIPT, path.join(main, "scripts", "ci", "bkit-local-stack-lock.sh"));
    git(tmp, ["init", "-q", "-b", "dev", main]);
    git(main, ["add", "."]);
    git(main, ["commit", "-q", "-m", "init"]);
    git(main, ["worktree", "add", "-q", "-b", "feat", worktree]);
    const inMain = path.join(main, "scripts", "ci", "bkit-local-stack-lock.sh");
    const inWorktree = path.join(worktree, "scripts", "ci", "bkit-local-stack-lock.sh");
    const env = envFor();

    const lockFile = path.join(cache, "bkit", "local-stack-lock", "app-main.lock");
    expect(run("local_stack_lock_file", env, inMain).stdout.trim()).toBe(lockFile);
    expect(run("local_stack_lock_file", env, inWorktree).stdout.trim()).toBe(lockFile);

    const first = hold("main run", 30, env, inMain);
    await first.locked;
    const second = run(`try_local_stack_lock "worktree run"`, env, inWorktree);
    expect(second.status).toBe(1);
    expect(second.stderr).toContain(`main run — ${main}`);
  });

  it("outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why", () => {
    const loose = path.join(tmp, "loose");
    fs.mkdirSync(loose);
    fs.copyFileSync(SCRIPT, path.join(loose, "bkit-local-stack-lock.sh"));
    const r = run(
      `take_local_stack_lock "loose run"`,
      envFor({ GIT_CEILING_DIRECTORIES: tmp }),
      path.join(loose, "bkit-local-stack-lock.sh"),
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
});
