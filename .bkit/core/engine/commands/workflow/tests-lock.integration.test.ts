import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useGateRunner } from "../../../../../vitest.gate-fixture";
import { tierTimeouts } from "../../../../../vitest.timeout-budget";
import { requireTsx } from "../../../../../vitest.tsx-bin";

const BUDGET = tierTimeouts(true);
const CLI = path.resolve(".bkit/core/engine/cli.ts");
const TEMPLATE = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
const GATE = "bkit:gate:static-unit";
const TEST = "src/planned.test.ts";
const NAME = "planned failure";

interface Result {
  status: number | null;
  stdout: string;
  stderr: string;
  ms: number;
}
interface GateEvent {
  event: "start" | "end";
  id: string;
  at: number;
  env: Record<string, string>;
  nested: number | null;
}
let tmp: string;
let cwd: string;
let cache: string;
let eventsFile: string;
let env: NodeJS.ProcessEnv;
let children: ChildProcess[];

useGateRunner();

function git(...args: string[]): void {
  const result = spawnSync(
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
  expect(result.status, result.stderr).toBe(0);
}

beforeEach(() => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-lock-")));
  cwd = path.join(tmp, "consumer");
  cache = path.join(tmp, "cache");
  eventsFile = path.join(tmp, "events.jsonl");
  children = [];
  env = {
    ...process.env,
    XDG_CACHE_HOME: cache,
    BKIT_ENGINE_JOURNAL: "off",
    GATE_EVENTS: eventsFile,
  };
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
  fs.mkdirSync(path.join(cwd, "src"));
  fs.copyFileSync(TEMPLATE, path.join(cwd, "scripts", "ci", "bkit-machine-lock.sh"));
  fs.copyFileSync(
    path.resolve("scripts/ci/bkit-test-awake.mjs"),
    path.join(cwd, "scripts", "ci", "bkit-test-awake.mjs"),
  );
  fs.mkdirSync(path.join(cwd, "node_modules"));
  fs.symlinkSync(
    fs.realpathSync(path.resolve("node_modules/cross-spawn")),
    path.join(cwd, "node_modules", "cross-spawn"),
    "dir",
  );
  fs.writeFileSync(path.join(cwd, ".gitignore"), "logs/\nnode_modules/\n");
  fs.writeFileSync(
    path.join(cwd, "package.json"),
    JSON.stringify({
      private: true,
      scripts: {
        [GATE]: "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs",
        "bkit:gate:changed":
          "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs",
        "bkit:test:file": "node report.mjs",
      },
    }),
  );
  fs.writeFileSync(
    path.join(cwd, "gate.mjs"),
    [
      'import fs from "node:fs";',
      'import { spawnSync } from "node:child_process";',
      'import { setTimeout as delay } from "node:timers/promises";',
      'const record = (event, nested = null) => fs.appendFileSync(process.env.GATE_EVENTS, JSON.stringify({event, id: process.env.GATE_ID || "gate", at: Date.now(), env: Object.fromEntries(["BKIT_TEST_WORKERS", "LOCAL_STACK_LOCK_OWNER_tests", "LOCAL_STACK_LOCK_WAIT_S", "LOCAL_STACK_LOCK_WHO"].map(key => [key, process.env[key] || ""])), nested}) + "\\n");',
      'record("start");',
      "const deadline = Date.now() + 30000;",
      'while (process.env.GATE_RELEASE_FILE && !fs.existsSync(process.env.GATE_RELEASE_FILE)) { if (Date.now() >= deadline) throw new Error("gate release timed out"); await delay(20); }',
      'const nested = process.env.GATE_NESTED ? spawnSync("bash", ["scripts/ci/bkit-machine-lock.sh", "run", "nested", "--lock", "tests", "--", "node", "-e", "process.stdout.write(\\\"nested ran\\\")"], {encoding: "utf8", timeout: 3000}) : null;',
      'if (nested) process.stdout.write(nested.stdout || "");',
      'record("end", nested ? nested.status : null);',
      "process.exit(Number(process.env.GATE_EXIT || 0));",
    ].join("\n"),
  );
  fs.writeFileSync(
    path.join(cwd, "report.mjs"),
    `import fs from "node:fs";\nfs.writeFileSync(process.env.BKIT_TEST_REPORT, '<testsuite tests="1" failures="1"><testcase name="${NAME}" file="${TEST}"><failure message="planned assertion">expected one to equal two</failure></testcase></testsuite>');\nprocess.exit(1);\n`,
  );
  fs.writeFileSync(
    path.join(cwd, TEST),
    `import { it, expect } from "vitest";\nit("${NAME}", () => { expect(1).toBe(2); });\n`,
  );
  fs.writeFileSync(
    path.join(cwd, "plan.md"),
    [
      "# Plan",
      "<!-- bkit:group 1 start -->",
      "### TASK GROUP 1: Example",
      "<!-- bkit:task 1 start -->",
      "- [ ] **TASK 1:** Implement the planned behavior",
      "  - **DONE WHEN:** the assertion passes",
      "  - **TEST FIRST:**",
      `    - \`${TEST}\` \`${NAME}\` fails before implementation`,
      "<!-- bkit:task 1 end -->",
      "<!-- bkit:group 1 end -->",
      "",
    ].join("\n"),
  );
  fs.writeFileSync(path.join(cwd, "status.jsonl"), "");
  git("init", "-q", "-b", "dev");
  git("add", "--all");
  git("commit", "-q", "-m", "fixture");
});

afterEach(() => {
  for (const child of children) child.kill("SIGKILL");
  fs.rmSync(tmp, { recursive: true, force: true });
});

function execute(args: string[], extra: Record<string, string> = {}): Result {
  const started = Date.now();
  const result = spawnSync(requireTsx(), [CLI, "tests", ...args, "--json"], {
    cwd,
    env: { ...env, ...extra },
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

function start(args: string[], extra: Record<string, string> = {}) {
  const started = Date.now();
  const child = spawn(requireTsx(), [CLI, "tests", ...args, "--json"], {
    cwd,
    env: { ...env, ...extra },
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(child);
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (data: Buffer) => (stdout += data.toString()));
  child.stderr.on("data", (data: Buffer) => (stderr += data.toString()));
  const done = new Promise<Result>((resolve) =>
    child.on("close", (status) => resolve({ status, stdout, stderr, ms: Date.now() - started })),
  );
  return { child, done };
}

async function waitForFile(file: string, text: string, child: ChildProcess): Promise<void> {
  const until = Date.now() + BUDGET.hookTimeout;
  while (Date.now() < until) {
    if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes(text)) return;
    if (child.exitCode !== null || child.signalCode !== null)
      throw new Error(`process exited before writing ${text} to ${file}`);
    await delay(20);
  }
  throw new Error(`process did not write ${text} to ${file}`);
}

async function hold() {
  const child = spawn(
    "bash",
    [
      "-c",
      '. scripts/ci/bkit-machine-lock.sh; take_local_stack_lock "external holder" tests || exit 1; exec sleep 30',
    ],
    { cwd, env, stdio: "ignore" },
  );
  children.push(child);
  await waitForFile(
    path.join(cache, "bkit", "machine-lock", "tests.lock.holder"),
    "external holder",
    child,
  );
  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
  return { child, done };
}

const runArgs = (log = "logs/run.md") => ["run", `--gate=${GATE}`, `--log=${log}`];
const output = (result: Result): Record<string, unknown> => JSON.parse(result.stdout);
const events = (): GateEvent[] =>
  fs.existsSync(eventsFile)
    ? fs
        .readFileSync(eventsFile, "utf-8")
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line) as GateEvent)
    : [];

/** Replace the gate's work while retaining its sleep-prevention and lock wrappers. */
function gatePrefix(value: string): string {
  const prefix = value.match(
    /^node scripts\/ci\/bkit-test-awake\.mjs bash scripts\/ci\/bkit-machine-lock\.sh run --lock tests -- /,
  )?.[0];
  if (!prefix) throw new Error(`Gate wrappers missing: ${value}`);
  return prefix;
}

describe("tests lock through a consumer's wrapped gate", () => {
  it("a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself", async () => {
    const own = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
      scripts: Record<string, string>;
    };
    const outer = "bkit:gate:static-unit-integration";
    const ready = path.join(tmp, "outer-ready");
    const release = path.join(tmp, "outer-release");
    const manifest = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as {
      scripts: Record<string, string>;
    };
    manifest.scripts[outer] = gatePrefix(own.scripts[outer]!) + "node outer.mjs";
    manifest.scripts[GATE] = gatePrefix(own.scripts[GATE]!) + "node gate.mjs";
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify(manifest));
    fs.writeFileSync(
      path.join(cwd, "outer.mjs"),
      [
        'import fs from "node:fs";',
        'import { spawnSync } from "node:child_process";',
        'import { setTimeout as delay } from "node:timers/promises";',
        `const result = spawnSync("pnpm", ["${GATE}"], { stdio: "inherit", timeout: 5000 });`,
        'fs.writeFileSync(process.env.OUTER_READY, JSON.stringify({owner: process.env.LOCAL_STACK_LOCK_OWNER_tests || "", nested: result.status}));',
        'const until = Date.now() + 30000; while (!fs.existsSync(process.env.OUTER_RELEASE)) { if (Date.now() > until) throw new Error("release timed out"); await delay(20); }',
        "process.exit(result.status ?? 1);",
      ].join("\n"),
    );
    const first = start(["run", `--gate=${outer}`, "--log=logs/outer.md", "--lock-wait-s=2"], {
      OUTER_READY: ready,
      OUTER_RELEASE: release,
    });
    await waitForFile(ready, "nested", first.child);
    const ownership = JSON.parse(fs.readFileSync(ready, "utf-8")) as {
      owner: string;
      nested: number;
    };
    const contrast = execute([...runArgs("logs/contrast.md"), "--lock-wait-s=0"]);
    fs.writeFileSync(release, "release");
    const result = await first.done;
    expect(contrast.status, contrast.stderr).toBe(81);
    expect(result.status, result.stderr).toBe(0);
    expect(ownership.nested).toBe(0);
    expect(ownership.owner).toMatch(/^[1-9][0-9]*$/);
    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
    expect(events()[0]!.env.LOCAL_STACK_LOCK_OWNER_tests).toBe(ownership.owner);
    expect(fs.readFileSync(path.join(cwd, "logs/outer.md"), "utf-8")).not.toContain(
      "waiting for tests",
    );
  });

  it("tests run --file appends no test-run row when it exits 81 on a held tests lock", async () => {
    await hold();
    const result = execute([
      ...runArgs(),
      "--lock-wait-s=0",
      "--file=status.jsonl",
      "--workflow=build",
      "--step=gate",
    ]);
    expect(result.status, result.stderr).toBe(81);
    expect(output(result)).toMatchObject({
      row: null,
      lockHolder: expect.stringContaining("external holder"),
    });
    expect(fs.readFileSync(path.join(cwd, "status.jsonl"), "utf-8")).toBe("");
    expect(events()).toEqual([]);
  });

  it("tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock", async () => {
    await hold();
    fs.appendFileSync(path.join(cwd, TEST), "// a change\n");
    const result = execute(["changed", `--fallback=${GATE}`, "--lock-wait-s=0"]);
    expect(result.status, result.stderr).toBe(81);
    expect(output(result)).toMatchObject({
      gate: "bkit:gate:changed",
      lockHolder: expect.stringContaining("external holder"),
    });
    expect(result.stderr).toContain("external holder");
    expect(events()).toEqual([]);
  });

  it("tests changed with an unwritable lock dir exits 4 naming the path", () => {
    fs.writeFileSync(cache, "a file cannot hold a lock directory");
    fs.appendFileSync(path.join(cwd, TEST), "// a change\n");
    const result = execute(["changed", `--fallback=${GATE}`]);
    expect(result.status, result.stderr).toBe(4);
    expect(result.stderr).toContain(path.join(cache, "bkit", "machine-lock"));
    expect(output(result)).toMatchObject({ verdict: null });
    expect(events()).toEqual([]);
  });

  it("tests run waits for a held tests lock and runs the gate once the holder finishes", async () => {
    const holder = await hold();
    const run = start([...runArgs(), "--lock-wait-s=10"]);
    await waitForFile(path.join(cwd, "logs/run.md"), "waiting for tests", run.child);
    expect(events()).toEqual([]);
    const releasedAt = Date.now();
    holder.child.kill("SIGTERM");
    await holder.done;
    const result = await run.done;
    expect(result.status, result.stderr).toBe(0);
    expect(output(result)).toMatchObject({ verdict: "PASS", lockHolder: null });
    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
    expect(events()[0]!.at).toBeGreaterThanOrEqual(releasedAt);
  });

  it("tests run exits 81 naming the holder when the lock stays held past --lock-wait-s", async () => {
    await hold();
    const result = execute([
      ...runArgs(),
      "--lock-wait-s=1",
      "--artifact=logs/artifact.md",
      "--fid=example",
      "--step=gate",
    ]);
    expect(result.status, result.stderr).toBe(81);
    expect(output(result)).toMatchObject({
      lockHolder: expect.stringContaining("external holder"),
      artifact: null,
    });
    expect(result.stderr).toContain("external holder");
    expect(fs.existsSync(path.join(cwd, "logs/artifact.md"))).toBe(false);
    expect(events()).toEqual([]);
  });

  it("tests run holds the tests lock for the whole gate, so a second tests run waits", async () => {
    const first = start([...runArgs("logs/first.md"), "--lock-wait-s=10"], {
      GATE_ID: "first",
      GATE_RELEASE_FILE: path.join(tmp, "release-first"),
    });
    await waitForFile(eventsFile, '"event":"start"', first.child);
    const second = start([...runArgs("logs/second.md"), "--lock-wait-s=10"], { GATE_ID: "second" });
    await waitForFile(path.join(cwd, "logs/second.md"), "waiting for tests", second.child);
    expect(events().map((event) => event.id)).toEqual(["first"]);
    fs.writeFileSync(path.join(tmp, "release-first"), "release");
    const results = await Promise.all([first.done, second.done]);
    expect(results.map((result) => result.status)).toEqual([0, 0]);
    expect(events().map((event) => `${event.id}:${event.event}`)).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ]);
    expect(events()[2]!.at).toBeGreaterThanOrEqual(events()[1]!.at);
  });

  it("tests red runs its test file without waiting for a held tests lock", async () => {
    const holder = await hold();
    const result = execute([
      "red",
      "--file=status.jsonl",
      "--workflow=build",
      "--group=1",
      "--plan=plan.md",
      "--log=logs/red.md",
    ]);
    expect(result.status, result.stderr).toBe(0);
    expect(output(result)).toMatchObject({
      tests: [expect.objectContaining({ testName: NAME, state: "red" })],
    });
    expect(holder.child.exitCode).toBeNull();
    expect(result.ms).toBeLessThan(BUDGET.testTimeout / 2);
    expect(execute([...runArgs(), "--lock-wait-s=0"]).status).toBe(81);
    expect(events()).toEqual([]);
  });

  it("tests run under CI=true never waits on a held tests lock", async () => {
    const holder = await hold();
    const result = execute(runArgs(), { CI: "true" });
    expect(result.status, result.stderr).toBe(0);
    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
    expect(holder.child.exitCode).toBeNull();
    expect(execute([...runArgs(), "--lock-wait-s=0"]).status).toBe(81);
  });

  it("tests run under CI=1 never waits on a held tests lock", async () => {
    const holder = await hold();
    const result = execute(runArgs(), { CI: "1" });
    expect(result.status, result.stderr).toBe(0);
    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
    expect(holder.child.exitCode).toBeNull();
    expect(events()[0]!.env.LOCAL_STACK_LOCK_OWNER_tests).toBe("");
  });

  it("tests run with an unwritable lock dir exits 4 naming the path", () => {
    fs.writeFileSync(cache, "a file cannot hold a lock directory");
    const result = execute(runArgs());
    expect(result.status, result.stderr).toBe(4);
    expect(result.stderr).toContain(path.join(cache, "bkit", "machine-lock"));
    expect(output(result)).toMatchObject({ verdict: null });
    expect(events()).toEqual([]);
  });

  it("tests run exits 4 naming the queue folder when a regular file blocks it", () => {
    const lockDir = path.join(cache, "bkit", "machine-lock");
    fs.mkdirSync(lockDir, { recursive: true });
    const queue = path.join(lockDir, "tests.queue");
    fs.writeFileSync(queue, "a file cannot hold a queue folder");
    const result = execute(runArgs());
    expect(result.status, result.stderr).toBe(4);
    expect(result.stderr).toContain(queue);
    expect(output(result)).toMatchObject({ verdict: null });
    expect(events()).toEqual([]);
  });

  it("tests run with --lock-wait-s=0 exits 81 at once against a held lock", async () => {
    const holder = await hold();
    const result = execute([...runArgs(), "--lock-wait-s=0"]);
    expect(result.status, result.stderr).toBe(81);
    expect(output(result).lockHolder).toEqual(expect.stringContaining("external holder"));
    expect(result.ms).toBeLessThan(BUDGET.testTimeout / 2);
    expect(holder.child.exitCode).toBeNull();
    expect(events()).toEqual([]);
  });

  it("a gate that itself exits 75 is a FAIL verdict, not a lock wait", () => {
    const result = execute(runArgs(), { GATE_EXIT: "75" });
    expect(result.status, result.stderr).toBe(1);
    expect(output(result)).toMatchObject({ verdict: "FAIL", exitCode: 75 });
    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
    expect(events()[0]!.env.LOCAL_STACK_LOCK_OWNER_tests).toMatch(/^[1-9][0-9]*$/);
  });

  it("the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait", () => {
    const result = execute([...runArgs(), "--lock-wait-s=2", "--fid=example", "--step=gate"], {
      GATE_NESTED: "1",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
    expect(events()[0]!.env).toMatchObject({
      BKIT_TEST_WORKERS: expect.stringMatching(/^[1-9][0-9]*$/),
      LOCAL_STACK_LOCK_OWNER_tests: expect.stringMatching(/^[1-9][0-9]*$/),
      LOCAL_STACK_LOCK_WAIT_S: "2",
      LOCAL_STACK_LOCK_WHO: `bkit tests run ${GATE} example gate`,
    });
    expect(events()[1]!.nested).toBe(0);
    expect(fs.readFileSync(path.join(cwd, "logs/run.md"), "utf-8")).toContain("nested ran");
    expect(fs.readFileSync(path.join(cwd, "logs/run.md"), "utf-8")).not.toContain(
      "waiting for tests",
    );
  });
});

const queueDir = () => path.join(cache, "bkit", "machine-lock", "tests.queue");
const jumpMarkers = () =>
  fs.existsSync(queueDir()) ? fs.readdirSync(queueDir()).filter((n) => n.endsWith(".jump")) : [];

/** Waits until a ticket in the tests queue contains `text`. */
async function waitForQueued(text: string): Promise<void> {
  const queued = () =>
    fs.existsSync(queueDir()) &&
    fs.readdirSync(queueDir()).some((name) => {
      const file = path.join(queueDir(), name);
      return fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes(text);
    });
  const until = Date.now() + BUDGET.hookTimeout;
  while (!queued() && Date.now() < until) await delay(20);
  expect(queued()).toBe(true);
}

describe("bkit tests jump", () => {
  const whoOf = (fid: string) => `bkit tests run ${GATE} ${fid} gate`;
  const waiterArgs = (fid: string) => [
    ...runArgs(`logs/${fid}.md`),
    "--lock-wait-s=30",
    `--fid=${fid}`,
    "--step=gate",
  ];

  it("tests jump moves a waiting run to the front of the tests line", async () => {
    const holder = await hold();
    const runs = [];
    for (const fid of ["a", "b", "c"]) {
      runs.push(start(waiterArgs(fid), { GATE_ID: fid }));
      await waitForFile(path.join(cwd, `logs/${fid}.md`), "waiting for tests", runs.at(-1)!.child);
      await waitForQueued(` ${fid} gate`);
    }
    const jump = execute(["jump", whoOf("c")]);
    expect(jump.status, jump.stderr).toBe(0);
    expect(jumpMarkers()).toHaveLength(1);
    expect(events()).toEqual([]);
    const releasedAt = Date.now();
    holder.child.kill("SIGTERM");
    await holder.done;
    const results = await Promise.all(runs.map((run) => run.done));
    expect(results.map((result) => result.status)).toEqual([0, 0, 0]);
    const starts = events().filter((event) => event.event === "start");
    expect(starts.map((event) => event.id)).toEqual(["c", "a", "b"]);
    expect(starts[0]!.at).toBeGreaterThanOrEqual(releasedAt);
  });

  it("tests jump refuses a run name no waiting run carries", async () => {
    const holder = await hold();
    const run = start(waiterArgs("a"), { GATE_ID: "a" });
    await waitForFile(path.join(cwd, "logs/a.md"), "waiting for tests", run.child);
    const jump = execute(["jump", "nobody-by-that-name"]);
    expect(jump.status, jump.stderr).toBe(1);
    expect(jump.stdout + jump.stderr).toContain("no run named nobody-by-that-name waits for tests");
    expect(jumpMarkers()).toEqual([]);
    holder.child.kill("SIGTERM");
    await holder.done;
    expect((await run.done).status).toBe(0);
  });

  it("tests jump refuses a run name two waiting runs share", async () => {
    const holder = await hold();
    fs.mkdirSync(queueDir(), { recursive: true });
    const shared = "shared gate run";
    fs.writeFileSync(
      path.join(queueDir(), `${Date.now()}.000001-${process.pid}`),
      `${shared} — /checkouts/one\n`,
    );
    fs.writeFileSync(
      path.join(queueDir(), `${Date.now()}.000002-${holder.child.pid}`),
      `${shared} — /checkouts/two\n`,
    );
    const jump = execute(["jump", shared]);
    expect(jump.status, jump.stderr).toBe(1);
    const text = jump.stdout + jump.stderr;
    expect(text).toContain("/checkouts/one");
    expect(text).toContain("/checkouts/two");
    expect(text).toContain("pass --checkout");
    expect(jumpMarkers()).toEqual([]);
    holder.child.kill("SIGTERM");
    await holder.done;
  });
});
