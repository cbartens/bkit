import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import setup, { testWorkers } from "../../../../../vitest.test-lock";
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

function startHolder(label = "wrapped gate holder", command = ["sleep", "30"]) {
  const child = spawn("bash", [SCRIPT, "run", label, "--lock", "tests", "--", ...command], {
    env: independentEnv(),
    stdio: "ignore",
    detached: true,
  });
  children.push(child);
  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
  return { child, done };
}

/** The tests slot whose holder file names `label`, or undefined while none does. */
function slotHeldBy(label: string): string | undefined {
  const dir = path.dirname(holderFile);
  if (!fs.existsSync(dir)) return undefined;
  return fs
    .readdirSync(dir)
    .filter((name) => /^tests(\.[0-9]+)?\.lock\.holder$/.test(name))
    .find((name) => fs.readFileSync(path.join(dir, name), "utf-8").includes(label));
}

async function untilHeld(child: ChildProcess, label: string): Promise<string> {
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    const slot = slotHeldBy(label);
    if (slot) return slot;
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error(`${label} exited before acquiring`);
    await delay(20);
  }
  throw new Error(`${label} did not acquire a tests slot`);
}

async function holder(label = "wrapped gate holder") {
  const started = startHolder(label);
  const slot = await untilHeld(started.child, label);
  return { ...started, slot };
}

/** Answer the script's core probe with 10 cores, leave the slots unset and the run local. */
function tenLocalCores(): void {
  const bin = path.join(tmp, "core-probe-10");
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, "getconf"),
    '#!/bin/sh\n[ "$1" = _NPROCESSORS_ONLN ] || exit 1\nprintf "10\\n"\n',
    { mode: 0o755 },
  );
  vi.stubEnv("PATH", prependPath(bin));
  vi.stubEnv("BKIT_RUNTIME", "LOCAL");
  delete process.env.BKIT_TEST_SLOTS;
}

/** Start the global setup and report whether it has settled yet. */
function startSetup() {
  const state = { settled: false };
  const pending = Promise.resolve(setup(PROJECT)).then(
    (value) => {
      state.settled = true;
      return { value, error: null };
    },
    (error: unknown) => {
      state.settled = true;
      return { value: undefined, error };
    },
  );
  return { state, pending };
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

/**
 * Runs the global setup in a node process of its own that then idles like a long test run, so a
 * setup that ends the run does not end this one. Resolves with its exit, or "still running" after
 * 15 s.
 */
async function idleRunAfterSetup(env: NodeJS.ProcessEnv) {
  const script = path.join(tmp, "idle-run.mjs");
  fs.writeFileSync(
    script,
    `const { default: setup } = await import(${JSON.stringify(path.resolve("vitest.test-lock.ts"))});
await setup(${JSON.stringify(PROJECT)});
console.log("locked");
setInterval(() => undefined, 1000);
`,
  );
  const child = spawn(process.execPath, ["--import", "tsx", script], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  children.push(child);
  const output = { stdout: "", stderr: "" };
  child.stdout.on("data", (data: Buffer) => (output.stdout += data.toString()));
  child.stderr.on("data", (data: Buffer) => (output.stderr += data.toString()));
  const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) =>
    child.on("exit", (code, signal) => resolve({ code, signal })),
  );
  const outcome = await Promise.race([exited, delay(15_000).then(() => "still running" as const)]);
  return { outcome, output };
}

describe("raw Vitest global setup against wrapped gates", () => {
  it("the global setup fails the Vitest run at once when its lock holder exits before teardown", async () => {
    const { outcome, output } = await idleRunAfterSetup({
      ...independentEnv(),
      LOCAL_STACK_LOCK_HOLD_S: "1",
      LOCAL_STACK_LOCK_HOLD_GRACE_S: "1",
    });
    expect(output.stdout, output.stderr).toContain("locked");
    expect(outcome, output.stderr).toEqual({ code: 1, signal: null });
    expect(output.stderr).toMatch(/tests lock holder exited before the run finished \(124\)/);
    expect(output.stderr).toContain("LOCAL_STACK_LOCK_HOLD_S limit of 1s");
    expect(probe().status).toBe(0);
  });

  it("testWorkers finds the lock script when the process starts in a subfolder", () => {
    const config = path.resolve("vitest.test-lock.ts");
    const res = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "-e",
        `import(${JSON.stringify(config)}).then((m) => console.log(JSON.stringify(m.testWorkers())))`,
      ],
      { cwd: path.resolve("scripts"), encoding: "utf8" },
    );
    expect(res.stderr).toBe("");
    expect(JSON.parse(res.stdout)).toEqual({ maxWorkers: expect.any(Number) });
  });

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

  it("with slots unset on 10 cores, the global setup takes tests.2.lock beside a tests.lock holder", async () => {
    tenLocalCores();
    const held = await holder();
    expect(held.slot).toBe("tests.lock.holder");
    const acquired = await startSetup().pending;
    teardown = acquired.value;
    expect(acquired.error).toBeNull();
    expect(typeof teardown).toBe("function");
    expect(slotHeldBy("vitest all")).toBe("tests.2.lock.holder");
    expect(held.child.exitCode).toBeNull();
  });

  it("with slots unset on 10 cores, the global setup waits only while both slots are held", async () => {
    tenLocalCores();
    const first = await holder("first gate holder");
    const second = await holder("second gate holder");
    expect([first.slot, second.slot].sort()).toEqual(["tests.2.lock.holder", "tests.lock.holder"]);
    const started = startSetup();
    await delay(200);
    const settledWhileBothHeld = started.state.settled;
    stopHolder(second.child);
    await second.done;
    const acquired = await started.pending;
    teardown = acquired.value;
    expect(settledWhileBothHeld).toBe(false);
    expect(acquired.error).toBeNull();
    expect(slotHeldBy("vitest all")).toBe(second.slot);
    expect(first.child.exitCode).toBeNull();
  });

  it("a gate and a plain vitest global setup started together on 10 cores both hold a slot with four workers each", async () => {
    tenLocalCores();
    const gateWorkers = path.join(tmp, "gate-workers");
    const gate = startHolder("wrapped gate holder", [
      "sh",
      "-c",
      'printf "%s\\n" "$BKIT_TEST_WORKERS" > "$1"; exec sleep 30',
      "gate",
      gateWorkers,
    ]);
    // The gate takes its slot first, so a setup that asks for a single slot would wait on it.
    const gateSlot = await untilHeld(gate.child, "wrapped gate holder");
    const acquired = await startSetup().pending;
    teardown = acquired.value;
    expect(acquired.error).toBeNull();
    const setupSlot = slotHeldBy("vitest all");
    expect([gateSlot, setupSlot].sort()).toEqual(["tests.2.lock.holder", "tests.lock.holder"]);
    expect(testWorkers()).toEqual({ maxWorkers: 4 });
    await vi.waitFor(() => expect(fs.readFileSync(gateWorkers, "utf-8").trim()).toBe("4"), {
      timeout: BUDGET.hookTimeout,
      interval: 20,
    });
    expect(gate.child.exitCode).toBeNull();
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

function prependPath(dir: string): string {
  return dir + path.delimiter + (process.env.PATH ?? "");
}
