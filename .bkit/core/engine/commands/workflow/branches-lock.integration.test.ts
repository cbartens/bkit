import { type ChildProcess, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { spawnGroup, stopGroup } from "../../../../../vitest.process-group";
import { tierTimeouts } from "../../../../../vitest.timeout-budget";
import { requireTsx } from "../../../../../vitest.tsx-bin";

const BUDGET = tierTimeouts(true);
const CLI = path.resolve(".bkit/core/engine/cli.ts");
const TEMPLATE = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
const AWAKE = path.resolve(".bkit/templates/scripts/ci/bkit-test-awake.mjs");
const SHELL_DISPATCHER = path.resolve("tests/fixtures/gh/bin/gh");
const BRANCH = "feat/tests-lock";
let tmp: string;
let cwd: string;
let origin: string;
let cache: string;
let env: NodeJS.ProcessEnv;
let children: ChildProcess[];

function git(...args: string[]) {
  return spawnSync(
    "git",
    [
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.invalid",
      "-c",
      "commit.gpgsign=false",
      ...args,
    ],
    { cwd, env, encoding: "utf-8" },
  );
}

function checkedGit(...args: string[]): void {
  const result = git(...args);
  expect(result.status, result.stderr).toBe(0);
}

beforeEach(() => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-branches-lock-")));
  cwd = path.join(tmp, "consumer");
  origin = path.join(tmp, "origin.git");
  cache = path.join(tmp, "cache");
  children = [];
  env = { ...process.env, XDG_CACHE_HOME: cache, BKIT_ENGINE_JOURNAL: "off" };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith("GIT_") ||
      key.startsWith("LOCAL_STACK_LOCK_") ||
      key.startsWith("BKIT_TEST_") ||
      key === "CI" ||
      key === "BKIT_LOCK_WAIT_S"
    )
      delete env[key];
  }
  fs.mkdirSync(path.join(cwd, "scripts", "ci"), { recursive: true });
  fs.copyFileSync(TEMPLATE, path.join(cwd, "scripts", "ci", "bkit-machine-lock.sh"));
  fs.copyFileSync(AWAKE, path.join(cwd, "scripts", "ci", "bkit-test-awake.mjs"));
  fs.writeFileSync(
    path.join(cwd, "hook-gate.mjs"),
    [
      'import fs from "node:fs";',
      'const values = {wait: process.env.LOCAL_STACK_LOCK_WAIT_S || "", who: process.env.LOCAL_STACK_LOCK_WHO || ""};',
      "fs.writeFileSync(process.env.HOOK_ENV, JSON.stringify(values));",
      'console.log("wait=" + values.wait + " who=" + values.who);',
    ].join("\n"),
  );
  checkedGit("init", "-q", "-b", BRANCH);
  checkedGit("init", "-q", "--bare", origin);
  checkedGit("remote", "add", "origin", origin);
  checkedGit("add", "--all");
  checkedGit("commit", "-q", "-m", "fixture");
  // Git invokes a stable executable; its existing shell dispatcher runs this hook body.
  const hook = path.join(tmp, "pre-push.sh");
  fs.writeFileSync(
    hook,
    "exec bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node hook-gate.mjs\n",
  );
  fs.symlinkSync(SHELL_DISPATCHER, path.join(cwd, ".git", "hooks", "pre-push"));
  env.BKIT_FAKE_TOOL_SCRIPT = hook;
  env.HOOK_ENV = path.join(tmp, "hook-env.json");
});

afterEach(async () => {
  await Promise.all(children.map(stopGroup));
  fs.rmSync(tmp, { recursive: true, force: true });
});

async function hold(): Promise<ChildProcess> {
  const child = spawnGroup(
    "bash",
    [
      "-c",
      '. scripts/ci/bkit-machine-lock.sh; take_local_stack_lock "external push holder" tests || exit 1; exec sleep 30',
    ],
    { cwd, env, stdio: "ignore" },
  );
  children.push(child);
  const file = path.join(cache, "bkit", "machine-lock", "tests.lock.holder");
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes("external push holder"))
      return child;
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error("holder exited before taking the lock");
    await delay(20);
  }
  throw new Error("holder did not take the lock");
}

function push(extra: Record<string, string>) {
  const result = spawnSync(
    requireTsx(),
    [CLI, "branches", "push", "--mode=plain", "--set-upstream", "--json"],
    { cwd, env: { ...env, ...extra }, encoding: "utf-8", timeout: BUDGET.testTimeout },
  );
  return {
    status: result.status,
    stderr: result.stderr,
    json: JSON.parse(result.stdout) as Record<string, unknown>,
  };
}

/** Replace the pre-push hook's body. */
function hookBody(body: string): void {
  fs.writeFileSync(env.BKIT_FAKE_TOOL_SCRIPT!, body);
}

describe("branches push through a real pre-push lock", () => {
  it("branches push exits 81 from the status file when git collapses the hook status", async () => {
    const holder = await hold();
    // The wrapper's printed lines go nowhere: only the status file can name the holder.
    hookBody(
      "exec bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node hook-gate.mjs 2>/dev/null\n",
    );
    const result = push({
      BKIT_LOCK_WAIT_S: "0",
      LOCAL_STACK_LOCK_WAIT_S: "0",
      BKIT_TEST_SLOTS: "1",
    });
    expect(result.status, result.stderr).toBe(81);
    expect(result.stderr).not.toContain("gave up after");
    expect(result.json).toMatchObject({
      pushed: false,
      ref: null,
      lockHolder: expect.stringMatching(/^external push holder — /),
    });
    expect(holder.exitCode).toBeNull();
    expect(
      git("--git-dir", origin, "show-ref", "--verify", "--quiet", `refs/heads/${BRANCH}`).status,
    ).toBe(1);
    expect(fs.existsSync(path.join(tmp, "hook-env.json"))).toBe(false);
  });

  it("branches push with a failing hook and an empty status file is a push failure", () => {
    // The hook prints the wrapper's give-up sentence word for word, but its status file is empty.
    hookBody(
      'if [ -n "${LOCAL_STACK_LOCK_STATUS_FILE:-}" ]; then : > "$LOCAL_STACK_LOCK_STATUS_FILE"; fi\n' +
        `echo "[machine-lock] ❌ bkit branches push ${BRANCH} gave up after 0s waiting for tests, in use by a printed holder" >&2\n` +
        "exit 75\n",
    );
    const result = push({ BKIT_LOCK_WAIT_S: "0" });
    expect(result.status, result.stderr).toBe(8);
    expect(result.json).toMatchObject({ pushed: false, lockHolder: null });
    expect(
      git("--git-dir", origin, "show-ref", "--verify", "--quiet", `refs/heads/${BRANCH}`).status,
    ).toBe(1);
  });

  it("branches push whose hook's status file says the hold limit stopped the gate exits 4, pushing nothing", () => {
    hookBody(
      `printf 'lock=tests\\noutcome=held-too-long\\nholder=bkit branches push ${BRANCH}\\n' > "$LOCAL_STACK_LOCK_STATUS_FILE"\n` +
        "exit 124\n",
    );
    const result = push({ BKIT_LOCK_WAIT_S: "0" });
    expect(result.status, result.stderr).toBe(4);
    expect(result.json).toMatchObject({ pushed: false, lockHolder: null });
    expect(
      git("--git-dir", origin, "show-ref", "--verify", "--quiet", `refs/heads/${BRANCH}`).status,
    ).toBe(1);
  });

  it("branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push", () => {
    const result = push({ BKIT_LOCK_WAIT_S: "2" });
    expect(result.status, result.stderr).toBe(0);
    expect(result.json).toMatchObject({ pushed: true, ref: BRANCH });
    expect(JSON.parse(fs.readFileSync(path.join(tmp, "hook-env.json"), "utf-8"))).toEqual({
      wait: "2",
      who: `bkit branches push ${BRANCH}`,
    });
    expect(git("--git-dir", origin, "rev-parse", `refs/heads/${BRANCH}`).stdout.trim()).toBe(
      git("rev-parse", "HEAD").stdout.trim(),
    );
  });
});
