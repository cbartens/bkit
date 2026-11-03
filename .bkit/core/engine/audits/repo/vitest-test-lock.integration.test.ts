import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import setup from "../../../../../vitest.test-lock";
import { tierTimeouts } from "../../../../../vitest.timeout-budget";

const BUDGET = tierTimeouts(true);
const SCRIPT = path.resolve("scripts/ci/bkit-machine-lock.sh");
const PROJECT = { vitest: { config: { filters: [], watch: false } } };
let tmp: string;
let holderFile: string;
let children: ChildProcess[];
let teardown: Awaited<ReturnType<typeof setup>>;

beforeEach(() => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-vitest-lock-")));
  holderFile = path.join(tmp, "bkit", "machine-lock", "tests.lock.holder");
  children = [];
  teardown = undefined;
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("LOCAL_STACK_LOCK_OWNER") || key.startsWith("LOCAL_STACK_LOCK_PID"))
      vi.stubEnv(key, "");
  }
  vi.stubEnv("LOCAL_STACK_LOCK_OWNER_tests", "");
  vi.stubEnv("XDG_CACHE_HOME", tmp);
  vi.stubEnv("CI", "");
  vi.stubEnv("BKIT_TEST_SLOTS", "1");
  vi.stubEnv("BKIT_TEST_WORKERS", "");
  vi.stubEnv("LOCAL_STACK_LOCK_WAIT_S", "5");
});

afterEach(async () => {
  try {
    if (typeof teardown === "function") await teardown();
  } finally {
    for (const child of children) stopHolder(child);
    vi.unstubAllEnvs();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

function stopHolder(child: ChildProcess): void {
  if (child.pid === undefined) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ESRCH")) throw error;
  }
}

async function finishSetup(): Promise<void> {
  if (typeof teardown !== "function") throw new Error("setup returned no teardown");
  await teardown();
  teardown = undefined;
}

/** Independent callers must not inherit setup's owner and bypass its real flock. */
function independentEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith("LOCAL_STACK_LOCK_OWNER") || key.startsWith("LOCAL_STACK_LOCK_PID"))
      delete env[key];
  }
  return env;
}

async function holder() {
  const child = spawn(
    "bash",
    [SCRIPT, "run", "wrapped gate holder", "--lock", "tests", "--", "sleep", "30"],
    { env: independentEnv(), stdio: "ignore", detached: true },
  );
  children.push(child);
  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    if (
      fs.existsSync(holderFile) &&
      fs.readFileSync(holderFile, "utf-8").includes("wrapped gate holder")
    )
      return { child, done };
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error("wrapped holder exited before acquiring");
    await delay(20);
  }
  throw new Error("wrapped holder did not acquire the tests lock");
}

function probe() {
  return spawnSync(
    "bash",
    [SCRIPT, "run", "independent probe", "--lock", "tests", "--", "printf", "probe ran"],
    {
      env: { ...independentEnv(), LOCAL_STACK_LOCK_WAIT_S: "0" },
      encoding: "utf-8",
      timeout: BUDGET.testTimeout,
    },
  );
}

describe("raw Vitest global setup against wrapped gates", () => {
  it("the global setup waits for a held tests lock and takes it once the holder ends", async () => {
    const held = await holder();
    let settled = false;
    const pending = Promise.resolve(setup(PROJECT)).then(
      (value) => {
        settled = true;
        return { value, error: null };
      },
      (error: unknown) => {
        settled = true;
        return { value: undefined, error };
      },
    );
    await delay(200);
    const settledWhileHeld = settled;
    const originalHolder = fs.readFileSync(holderFile, "utf-8");
    stopHolder(held.child);
    await held.done;
    const acquired = await pending;
    teardown = acquired.value;
    expect(settledWhileHeld).toBe(false);
    expect(originalHolder).toContain("wrapped gate holder");
    expect(acquired.error).toBeNull();
    expect(typeof teardown).toBe("function");
    expect(process.env.LOCAL_STACK_LOCK_OWNER_tests).toMatch(/^[1-9][0-9]*$/);
    expect(fs.readFileSync(holderFile, "utf-8")).toContain("vitest all");
    expect(fs.readFileSync(holderFile, "utf-8")).toContain(
      `pid ${process.env.LOCAL_STACK_LOCK_OWNER_tests}`,
    );
    expect(probe().status).toBe(75);
  });

  it("the global setup throws naming the holder when the wait gives up", async () => {
    const held = await holder();
    const line = fs.readFileSync(holderFile, "utf-8").trim();
    vi.stubEnv("LOCAL_STACK_LOCK_WAIT_S", "0");
    const result = await Promise.resolve(setup(PROJECT)).then(
      (value) => {
        teardown = value;
        return null;
      },
      (error: unknown) => error,
    );
    expect(result).toBeInstanceOf(Error);
    expect(String(result)).toContain("75");
    expect(String(result)).toContain(line);
    expect(held.child.exitCode).toBeNull();
    expect(probe().status).toBe(75);
  });

  it("the global setup's teardown frees the tests lock", async () => {
    teardown = await setup(PROJECT);
    expect(typeof teardown).toBe("function");
    const held = fs.readFileSync(holderFile, "utf-8");
    expect(held).toContain("vitest all");
    const busy = probe();
    expect(busy.status, busy.stderr).toBe(75);
    expect(busy.stdout).not.toContain("probe ran");
    const nested = await setup(PROJECT);
    expect(nested).toBeUndefined();
    expect(fs.readFileSync(holderFile, "utf-8")).toBe(held);
    await finishSetup();
    const released = probe();
    expect(released.status, released.stderr).toBe(0);
    expect(released.stdout).toBe("probe ran");
    const config = fs
      .readFileSync(path.resolve("vitest.config.ts"), "utf-8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    expect(config).toMatch(/globalSetup:\s*\["\.\/vitest\.test-lock\.ts"\]/);
    expect(config).toMatch(/\.\.\.testWorkers\(\)/);
  });
});
