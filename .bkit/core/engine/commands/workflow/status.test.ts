import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CommandError, runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { runStatusRows, stepsBlock } from "./run-facts";
import { readRuns, readStatusEvents, readStatusRows } from "./status";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function tmp() {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-status-cmd-")));
  dirs.push(d);
  return d;
}

async function run(argv: string[], cwd = process.cwd()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], COMMANDS, {
    classicVerbs: new Set(["status"]),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const SHA = "a".repeat(40);
const started = (workflow: string, at: string) => ({ type: "workflow-started", workflow, at });
const done = (workflow: string, step: string, at: string, extra: Record<string, unknown> = {}) => ({
  type: "step-done",
  workflow,
  step,
  status: "DONE",
  at,
  parentSha: SHA,
  artifacts: [],
  ...extra,
});

function log(rows: object[]) {
  const file = path.join(tmp(), "status.jsonl");
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  return file;
}

const ciStateSelection = (extra: Record<string, unknown> = {}) => ({
  mode: "ci",
  provider: "github",
  repo: "example/example",
  runId: "123",
  runAttempt: 2,
  runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
  workflowId: "456",
  workflowPath: ".github/workflows/consumer-ci.yml",
  headBranch: "fix/ci",
  headSha: SHA,
  conclusion: "failure",
  redTiers: ["integration"],
  via: "prompt-run",
  ...extra,
});
const ciStateMeta = (generation = 1, extra: Record<string, unknown> = {}) => ({
  type: "workflow-meta",
  workflow: "debug",
  at: "2026-10-01T00:00:01Z",
  ciSelection: ciStateSelection(),
  ciGeneration: generation,
  ...extra,
});
const ciStateRoute = (file: string, text = "/bkit-debug 7-x", cwd = process.cwd()) => {
  const prompt = path.join(tmp(), "prompt.md");
  fs.writeFileSync(prompt, text);
  return run(
    ["status", "route", `--file=${file}`, "--workflow=debug", `--prompt-file=${prompt}`],
    cwd,
  );
};
const ciStateWrite = (file: string, selection: object) => {
  const input = path.join(tmp(), "selection.json");
  fs.writeFileSync(input, JSON.stringify(selection));
  return run([
    "status",
    "meta",
    `--file=${file}`,
    "--workflow=debug",
    `--ci-selection-file=${input}`,
  ]);
};

describe("debug evidence state", () => {
  it("persists atomic selections and preserves identical evidence generations", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z")]);
    const selection = ciStateSelection();
    const first = await ciStateWrite(file, selection);
    expect(first.code).toBe(0);
    expect(first.json.row).toMatchObject({ ciSelection: selection, ciGeneration: 1 });
    const repeated = await ciStateWrite(file, { ...selection, via: "issue-run" });
    expect(repeated.code).toBe(0);
    expect(repeated.json.row.ciGeneration).toBe(1);
    expect(readRuns(file).at(-1)).toMatchObject({
      ciSelection: { mode: "ci", runId: "123" },
      ciGeneration: 1,
    });
    const local = { mode: "local", reason: "explicit-local" };
    expect((await ciStateWrite(file, local)).code).toBe(0);
    expect(readRuns(file).at(-1)).toMatchObject({ ciSelection: local, ciGeneration: 2 });
    expect(readRuns(file).at(-1)?.ciSelection).toEqual(local);
    const before = fs.readFileSync(file, "utf-8");
    expect((await ciStateWrite(file, { ...selection, runAttempt: 0 })).code).not.toBe(0);
    expect(fs.readFileSync(file, "utf-8")).toBe(before);
  });

  it("resumes saved evidence and replaces it only on explicit new selection", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z"), ciStateMeta()]);
    const before = fs.readFileSync(file, "utf-8");
    const resume = await ciStateRoute(file);
    expect(resume.code).toBe(0);
    expect(resume.json).toMatchObject({ ciRun: "123", ciGeneration: 1, redTiers: ["integration"] });
    expect((await ciStateRoute(file)).json).toMatchObject({ ciRun: "123", ciGeneration: 1 });
    expect(fs.readFileSync(file, "utf-8")).toBe(before);
    const next = ciStateSelection({
      runAttempt: 3,
      runUrl: "https://github.com/example/example/actions/runs/123/attempts/3",
    });
    expect((await ciStateWrite(file, next)).code).toBe(0);
    expect((await ciStateRoute(file)).json).toMatchObject({
      ciRun: "123",
      ciGeneration: 2,
      ciFixDone: false,
      ciReproduced: false,
    });
    expect(
      (
        await ciStateWrite(file, {
          ...next,
          runId: "124",
          runUrl: "https://github.com/example/example/actions/runs/124/attempts/3",
        })
      ).code,
    ).toBe(0);
    expect((await ciStateRoute(file)).json).toMatchObject({ ciRun: "124", ciGeneration: 3 });
  });

  it("clears saved CI routing immediately for explicit local selection", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z"), ciStateMeta()]);
    const before = fs.readFileSync(file, "utf-8");
    const route = await ciStateRoute(
      file,
      "/bkit-debug 7-x [local] https://github.com/example/example/actions/runs/999",
    );
    expect(route.code).toBe(0);
    expect(route.json).toMatchObject({
      ciRun: null,
      redTiers: [],
      ciFixDone: false,
      ciReproduced: false,
    });
    expect(fs.readFileSync(file, "utf-8")).toBe(before);
    expect((await ciStateWrite(file, { mode: "local", reason: "explicit-local" })).code).toBe(0);
    expect((await ciStateRoute(file)).json).toMatchObject({
      ciRun: null,
      redTiers: [],
      ciGeneration: 2,
    });
    expect(readRuns(file).at(-1)?.ciSelection).toEqual({ mode: "local", reason: "explicit-local" });
  });

  it("counts reproduction and fixes only in the active generation", async () => {
    const file = log([
      started("build", "2026-08-01T00:00:00Z"),
      started("debug", "2026-09-01T00:00:00Z"),
      done("debug", "debug-failure-remediate", "2026-09-01T00:01:00Z", { ciGeneration: 2 }),
      done("debug", "debug-failure-reproduce", "2026-09-01T00:02:00Z", {
        ciGeneration: 2,
        reproduced: "YES",
      }),
      { type: "workflow-done", workflow: "debug", at: "2026-09-01T00:03:00Z" },
      started("debug", "2026-10-01T00:00:00Z"),
      ciStateMeta(2),
      done("debug", "debug-failure-remediate", "2026-10-01T00:01:00Z", { ciGeneration: 1 }),
      done("debug", "debug-failure-reproduce", "2026-10-01T00:02:00Z", {
        ciGeneration: 1,
        reproduced: "YES",
      }),
      done("build", "debug-failure-soak", "2026-10-01T00:03:00Z", { ciGeneration: 2 }),
    ]);
    const root = tmp();
    fs.writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ bkit: { workflows: { debug: { fix: { maxAttempts: 2 } } } } }),
    );
    const noCurrent = await ciStateRoute(file, "/bkit-debug 7-x [repro]", root);
    expect(noCurrent.json).toMatchObject({
      ciFixDone: false,
      ciReproduced: false,
      debugMode: "SOAK",
    });
    fs.appendFileSync(
      file,
      JSON.stringify(
        done("debug", "debug-failure-reproduce", "2026-10-01T00:04:00Z", {
          ciGeneration: 2,
          reproduced: "YES",
        }),
      ) + "\n",
    );
    fs.appendFileSync(
      file,
      JSON.stringify(
        done("debug", "debug-failure-remediate", "2026-10-01T00:05:00Z", { ciGeneration: 2 }),
      ) + "\n",
    );
    expect((await ciStateRoute(file)).json).toMatchObject({ ciFixDone: true, ciReproduced: true });
    fs.appendFileSync(
      file,
      JSON.stringify({ type: "workflow-done", workflow: "debug", at: "2026-10-01T00:06:00Z" }) +
        "\n",
    );
    expect((await ciStateRoute(file)).json).toMatchObject({
      ciRun: null,
      redTiers: [],
      ciFixDone: false,
      ciReproduced: false,
    });
  });

  it("orders covering gates for red tiers and preserves live off", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      ciStateMeta(1, { ciSelection: ciStateSelection({ redTiers: ["unit"] }) }),
    ]);
    const unit = await ciStateRoute(file);
    expect(unit.json.gates[0]).toBe("bkit:gate:static-unit");
    expect(new Set(unit.json.gates).size).toBe(unit.json.gates.length);
    const integrationFile = log([started("debug", "2026-10-01T00:00:00Z"), ciStateMeta()]);
    expect((await ciStateRoute(integrationFile)).json.gates[0]).toBe(
      "bkit:gate:static-unit-integration",
    );
    const off = await ciStateRoute(integrationFile, "/bkit-debug 7-x [live=off]");
    expect(off.json.gates.some((gate: string) => gate.endsWith("-live"))).toBe(false);
    const unknownFile = log([
      started("debug", "2026-10-01T00:00:00Z"),
      ciStateMeta(1, { ciSelection: ciStateSelection({ redTiers: [] }) }),
    ]);
    expect((await ciStateRoute(unknownFile)).json.gates[0]).toBe(
      "bkit:gate:static-unit-integration-e2e-live",
    );
  });
});

describe("bkit status path", () => {
  it("returns the main checkout's path outside a worktree, and whether it exists", async () => {
    const root = tmp();
    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
    const r = await run(["status", "path", "--workflow=plan", "--fid=7-x", "--month=202610"], root);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      path: path.join(root, "docs/plans/202610/logs/7-x/status.jsonl"),
      bookRoot: root,
      exists: false,
    });
  });

  it("rejects a month that is not YYYYMM", async () => {
    expect(
      (await run(["status", "path", "--workflow=plan", "--fid=x", "--month=2026-10"])).code,
    ).toBe(2);
  });
});

describe("the status fold", () => {
  it("skips a row it does not model (no type, an unknown type) and folds the rest", () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      { workflow: "build", at: "2026-10-01T00:00:30Z" },
      { type: "runtime-resolved", workflow: "build", at: "2026-10-01T00:00:40Z", runtime: "LOCAL" },
      { type: 7, workflow: "build", at: "2026-10-01T00:00:50Z" },
      done("build", "build-plan-verify", "2026-10-01T00:01:00Z"),
    ]);
    const runs = readRuns(file);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.workflow).toBe("build");
    expect(runs[0]!.steps.map((s) => s.step)).toEqual(["build-plan-verify"]);
  });

  it("ignores a row type it does not know", () => {
    const rows = [
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-a", "2026-10-01T00:01:00Z"),
      {
        type: "engine-call",
        workflow: "build",
        at: "2026-10-01T00:02:00Z",
        noun: "steps",
        verb: "finish",
        flags: [],
      },
      { type: "completeness", workflow: "build", at: "2026-10-01T00:03:00Z", verdict: "complete" },
      { type: "future-row", workflow: "build", at: "2026-10-01T00:04:00Z" },
      done("build", "build-b", "2026-10-01T00:05:00Z"),
    ];
    const file = log(rows);
    expect(readStatusRows(file)).toHaveLength(rows.length);
    const runs = readRuns(file);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.steps.map((s) => s.step)).toEqual(["build-a", "build-b"]);
    const kept = runStatusRows(readStatusEvents(file), "build", "2026-10-01T00:00:00Z");
    expect(kept.map((r) => r.type)).toEqual([
      "workflow-started",
      "step-done",
      "engine-call",
      "completeness",
      "future-row",
      "step-done",
    ]);
    expect(stepsBlock(kept).total.n).toBe(2);
  });

  it("refuses a line that is not JSON rather than folding around it (exit 3)", () => {
    const file = log([started("build", "2026-10-01T00:00:00Z")]);
    fs.appendFileSync(file, "{not json\n");
    let thrown: unknown;
    try {
      readRuns(file);
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(CommandError);
    expect((thrown as CommandError).code).toBe(3);
    expect((thrown as CommandError).message).toContain("line 2 is not JSON");
  });

  it("a command reading the log reports the malformed line with exit 3", async () => {
    const file = log([started("build", "2026-10-01T00:00:00Z")]);
    fs.appendFileSync(file, "{not json\n");
    const r = await run([
      "counters",
      "derive",
      `--file=${file}`,
      "--workflow=build",
      "--step=build-plan-verify",
      "--position=next",
    ]);
    expect(r.code).toBe(3);
    expect(r.err).toContain("line 2 is not JSON");
  });
});

describe("bkit status route", () => {
  const base = ["status", "route"];

  it("reads the last verdict and failures of a step in the active run, per group", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-plan-verify", "2026-10-01T00:01:00Z", {
        verdict: "FAIL",
        failures: 2,
        group: 1,
      }),
      done("build", "build-plan-verify", "2026-10-01T00:02:00Z", {
        verdict: "PASS",
        failures: 0,
        group: 2,
      }),
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=build",
      "--step=build-plan-verify",
      "--group=1",
    ]);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: 2 });
  });

  it("reads a build-plan-execute row written before the step rename as build-plan-tasks", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-plan-execute", "2026-10-01T00:01:00Z", {
        verdict: "PASS",
        failures: 0,
        group: 1,
      }),
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=build",
      "--step=build-plan-tasks",
      "--group=1",
    ]);
    expect(r.json).toMatchObject({ verdict: "PASS", failures: 0, parentSha: SHA });
    // The row on disk is history and keeps its name.
    expect(fs.readFileSync(file, "utf-8")).toContain('"step":"build-plan-execute"');
  });

  it("prints the parentSha of the step's last row in the active run, per group", async () => {
    const g1 = "1".repeat(40);
    const g2 = "2".repeat(40);
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-group-start", "2026-10-01T00:01:00Z", { group: 1, parentSha: g1 }),
      done("build", "build-group-start", "2026-10-01T00:02:00Z", { group: 2, parentSha: g2 }),
    ]);
    const at = (group: string) =>
      run([...base, `--file=${file}`, "--workflow=build", "--step=build-group-start", group]);
    expect((await at("--group=1")).json.parentSha).toBe(g1);
    expect((await at("--group=2")).json.parentSha).toBe(g2);
    const none = await run([...base, `--file=${file}`, "--workflow=build"]);
    expect(none.json.parentSha).toBeNull();
  });

  it("counts absent failures as 0 when a verdict is present", async () => {
    const file = log([done("build", "s", "2026-10-01T00:01:00Z", { verdict: "CONCERNS" })]);
    expect(
      (await run([...base, `--file=${file}`, "--workflow=build", "--step=s"])).json.failures,
    ).toBe(0);
  });

  it("reads an absent failures count on FAIL as null: the count is unknown, not 0", async () => {
    const file = log([done("build", "s", "2026-10-01T00:01:00Z", { verdict: "FAIL" })]);
    const r = await run([...base, `--file=${file}`, "--workflow=build", "--step=s"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: null });
  });

  it("does not leak a completed run's verdict into a fresh run", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "s", "2026-10-01T00:01:00Z", { verdict: "PASS", failures: 0 }),
      { type: "workflow-done", workflow: "build", at: "2026-10-01T00:02:00Z" },
      started("build", "2026-10-01T00:03:00Z"),
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=build",
      "--step=s",
      "--require=verdict",
    ]);
    expect(r.code).toBe(4);
    expect(r.json.verdict).toBeNull();
    expect(r.err).toContain("no DONE s row in the active build run");
  });

  it("reads strategy across ALL runs and gives the next rung", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "s", "2026-10-01T00:01:00Z", { strategy: "STANDARD" }),
      { type: "workflow-failed", workflow: "build", at: "2026-10-01T00:02:00Z" },
      started("build", "2026-10-01T00:03:00Z"),
    ]);
    const r = await run([...base, `--file=${file}`, "--workflow=build", "--step=s"]);
    expect(r.json).toMatchObject({ strategy: "STANDARD", nextStrategy: "PIVOT" });
  });

  it("starts the ladder at STANDARD when no strategy is recorded", async () => {
    const file = log([done("build", "s", "2026-10-01T00:01:00Z")]);
    expect(
      (await run([...base, `--file=${file}`, "--workflow=build", "--step=s"])).json.nextStrategy,
    ).toBe("STANDARD");
  });

  it("prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      done("debug", "debug-run-tests", "2026-10-01T00:01:00Z", { debugMode: "NORMAL" }),
      {
        type: "workflow-meta",
        workflow: "debug",
        at: "2026-10-01T00:02:00Z",
        debugMode: "SOAK",
        pushMode: "PR",
        debugAttempt: 2,
      },
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=debug",
      "--require=debugMode",
      "--require=pushMode",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ debugMode: "SOAK", pushMode: "PR", debugAttempt: 2 });
  });

  it("fails a --require'd mode that is missing or invalid", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      { type: "workflow-meta", workflow: "debug", at: "2026-10-01T00:01:00Z", debugMode: "TURBO" },
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=debug",
      "--require=debugMode",
      "--require=pushMode",
    ]);
    expect(r.code).toBe(4);
    expect(r.err).toContain('debugMode "TURBO" is not NORMAL|SOAK');
    expect(r.err).toContain("pushMode not recorded");
  });

  it("is a usage error to require a step field without --step", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z")]);
    expect(
      (await run([...base, `--file=${file}`, "--workflow=debug", "--require=verdict"])).code,
    ).toBe(2);
  });

  it("exits 3 when status.jsonl is missing", async () => {
    expect((await run([...base, `--file=${path.join(tmp(), "x")}`, "--workflow=debug"])).code).toBe(
      3,
    );
  });

  it("falls back to the last step carrying debugMode / pushMode when no workflow-meta sets it", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      done("debug", "debug-worktree-setup", "2026-10-01T00:01:00Z", {
        debugMode: "NORMAL",
        pushMode: "LOCAL",
      }),
      { type: "workflow-meta", workflow: "debug", at: "2026-10-01T00:02:00Z", debugMode: "SOAK" },
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=debug",
      "--require=debugMode",
      "--require=pushMode",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ debugMode: "SOAK", pushMode: "LOCAL" });
  });

  it("reports an invalid mode as null, never as a mode", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      { type: "workflow-meta", workflow: "debug", at: "2026-10-01T00:01:00Z", debugMode: "TURBO" },
    ]);
    expect((await run([...base, `--file=${file}`, "--workflow=debug"])).json.debugMode).toBeNull();
  });

  it.each([
    ["PIVOT", "FINAL"],
    ["FINAL", "FINAL"],
  ])("climbs the ladder: %s -> %s", async (prior, next) => {
    const file = log([done("build", "s", "2026-10-01T00:01:00Z", { strategy: prior })]);
    expect(
      (await run([...base, `--file=${file}`, "--workflow=build", "--step=s"])).json,
    ).toMatchObject({ strategy: prior, nextStrategy: next });
  });

  it("fails a --require'd strategy outside the ladder", async () => {
    const file = log([done("build", "s", "2026-10-01T00:01:00Z", { strategy: "YOLO" })]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=build",
      "--step=s",
      "--require=strategy",
    ]);
    expect(r.code).toBe(4);
    expect(r.json.strategy).toBeNull();
    expect(r.err).toContain('s strategy "YOLO" is not STANDARD|PIVOT|FINAL');
  });

  it("fails a --require'd verdict when the last DONE row carries none", async () => {
    const file = log([
      done("build", "s", "2026-10-01T00:01:00Z", { verdict: "PASS", failures: 0 }),
      done("build", "s", "2026-10-01T00:02:00Z"),
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=build",
      "--step=s",
      "--require=verdict",
      "--require=failures",
    ]);
    expect(r.code).toBe(4);
    expect(r.json).toMatchObject({ verdict: null, failures: null });
  });

  it("reads strategy per group, from the step's last DONE row, within its own workflow", async () => {
    const file = log([
      done("build", "s", "2026-10-01T00:01:00Z", { group: 1, strategy: "PIVOT" }),
      done("build", "s", "2026-10-01T00:02:00Z", { group: 2 }),
      done("debug", "s", "2026-10-01T00:03:00Z", { strategy: "FINAL" }),
    ]);
    const q = async (...f: string[]) =>
      (await run([...base, `--file=${file}`, "--workflow=build", "--step=s", ...f])).json;
    expect(await q("--group=1")).toMatchObject({ strategy: "PIVOT", nextStrategy: "FINAL" });
    expect(await q("--group=2")).toMatchObject({ strategy: null, nextStrategy: "STANDARD" });
    expect(await q()).toMatchObject({ strategy: null, nextStrategy: "STANDARD" });
  });

  it("a non-numeric debugAttempt reads as 0", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      {
        type: "workflow-meta",
        workflow: "debug",
        at: "2026-10-01T00:01:00Z",
        debugAttempt: "x[$(touch pwned)]",
      },
    ]);
    expect((await run([...base, `--file=${file}`, "--workflow=debug"])).json.debugAttempt).toBe(0);
  });
});

describe("bkit status route --prompt-file (debug Step 1)", () => {
  const GATES = [
    "bkit:gate:static-unit-integration-e2e-live",
    "bkit:gate:static-unit-integration-e2e",
    "bkit:gate:static-unit-integration",
    "bkit:gate:static-unit",
  ];
  const prompt = (text: string) => {
    const f = path.join(tmp(), "prompt.md");
    fs.writeFileSync(f, text);
    return f;
  };
  const route = (file: string, promptText = "/bkit-debug 7-x", ...extra: string[]) =>
    run([
      "status",
      "route",
      `--file=${file}`,
      "--workflow=debug",
      `--prompt-file=${prompt(promptText)}`,
      ...extra,
    ]);
  const fixRound = (at: string) => done("debug", "debug-failure-remediate", at);
  const closed = (at: string) => ({ type: "workflow-done", workflow: "debug", at });
  const soak = (at: string) => done("debug", "debug-failure-soak", at);

  it("a fresh run: attempt 1, NORMAL, no repro, every gate", async () => {
    const r = await route(path.join(tmp(), "status.jsonl"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      debugAttempt: 1,
      debugMode: "NORMAL",
      repro: false,
      gates: GATES,
    });
  });

  it("a resumed run keeps its attempt number", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      closed("2026-10-01T00:01:00Z"),
      started("debug", "2026-10-01T00:02:00Z"),
    ]);
    expect((await route(file)).json).toMatchObject({ debugAttempt: 2, debugMode: "NORMAL" });
  });

  it("fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      fixRound("2026-10-01T00:01:00Z"),
      closed("2026-10-01T00:02:00Z"),
      started("debug", "2026-10-01T00:03:00Z"),
      fixRound("2026-10-01T00:04:00Z"),
      closed("2026-10-01T00:05:00Z"),
    ]);
    expect((await route(file)).json).toMatchObject({ debugAttempt: 3, debugMode: "SOAK" });
  });

  it("the fix limit comes from bkit.workflows.debug.fix.maxAttempts", async () => {
    const cwd = tmp();
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { workflows: { debug: { fix: { maxAttempts: 3 } } } } }),
    );
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      fixRound("2026-10-01T00:01:00Z"),
      fixRound("2026-10-01T00:02:00Z"),
    ]);
    const args = ["status", "route", `--file=${file}`, "--workflow=debug"];
    const at = async () =>
      (await run([...args, `--prompt-file=${prompt("/bkit-debug 7-x")}`], cwd)).json.debugMode;
    expect(await at()).toBe("NORMAL");
    fs.appendFileSync(file, JSON.stringify(fixRound("2026-10-01T00:03:00Z")) + "\n");
    expect(await at()).toBe("SOAK");
  });

  it("[soak] and [repro] in the prompt", async () => {
    const r = await route(path.join(tmp(), "status.jsonl"), "/bkit-debug 7-x [soak] [repro]");
    expect(r.json).toMatchObject({ debugMode: "SOAK", repro: true });
  });

  it("a resumed run that soaked continues in SOAK", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z"), soak("2026-10-01T00:01:00Z")]);
    expect((await route(file)).json).toMatchObject({
      debugAttempt: 1,
      debugMode: "SOAK",
    });
  });

  it("soak rows of a finished run do not force SOAK on the next run", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      soak("2026-10-01T00:01:00Z"),
      closed("2026-10-01T00:02:00Z"),
    ]);
    expect((await route(file)).json).toMatchObject({
      debugAttempt: 2,
      debugMode: "NORMAL",
    });
  });

  it("an escalation recorded only in workflow-meta survives a resume", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      {
        type: "workflow-meta",
        workflow: "debug",
        at: "2026-10-01T00:00:01Z",
        debugMode: "NORMAL",
      },
      {
        type: "workflow-meta",
        workflow: "debug",
        at: "2026-10-01T00:05:00Z",
        debugMode: "SOAK",
      },
    ]);
    expect((await route(file)).json).toMatchObject({ debugMode: "SOAK" });
  });

  it("[live=off] in the prompt drops the live gate; the issue body is not read", async () => {
    const off = await route(path.join(tmp(), "status.jsonl"), "/bkit-debug 7-x [live=off]");
    expect(off.json.gates).toEqual(GATES.slice(1));
    const body = path.join(tmp(), "issue-description.md");
    fs.writeFileSync(body, "please run with [live=off]");
    expect((await route(path.join(tmp(), "status.jsonl"))).json.gates).toEqual(GATES);
  });

  it("finds status.jsonl from --fid and --month", async () => {
    const root = tmp();
    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
    const dir = path.join(root, "docs/plans/202610/logs/7-x");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "status.jsonl"),
      JSON.stringify(started("debug", "2026-10-01T00:00:00Z")) + "\n",
    );
    const argv = ["status", "route", "--workflow=debug", `--prompt-file=${prompt("x")}`];
    const r = await run([...argv, "--fid=7-x", "--month=202610"], root);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ debugAttempt: 1 });
    expect((await run([...argv, "--fid=8-y", "--month=202610"], root)).json.debugAttempt).toBe(1);
  });

  it("refuses --prompt-file for another workflow, and a missing --file without --fid", async () => {
    const p = prompt("x");
    const other = ["status", "route", "--workflow=ship", `--prompt-file=${p}`];
    expect((await run([...other, `--file=${path.join(tmp(), "s.jsonl")}`])).code).toBe(2);
    expect((await run(["status", "route", "--workflow=debug", `--prompt-file=${p}`])).code).toBe(2);
    expect((await run(["status", "route", "--workflow=debug"])).code).toBe(2);
  });

  it("a missing prompt file is a usage error", async () => {
    const r = await run([
      "status",
      "route",
      `--file=${path.join(tmp(), "status.jsonl")}`,
      "--workflow=debug",
      `--prompt-file=${path.join(tmp(), "nope.md")}`,
    ]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("nope.md");
  });
});

describe("bkit status route --workflow=build publish", () => {
  const runtimeRow = (runtime: string) => ({
    type: "runtime-resolved",
    workflow: "build",
    at: "2026-10-01T00:00:01Z",
    runtime,
    runtimeWorktrees: true,
    runtimeDevPushes: true,
    runtimeGithubCli: true,
  });
  const setup = (rows: object[], promptText: string, config?: object) => {
    const root = tmp();
    if (config)
      fs.writeFileSync(
        path.join(root, "package.json"),
        JSON.stringify({ bkit: { workflows: { build: { publish: config } } } }),
      );
    const file = path.join(root, "status.jsonl");
    fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
    const prompt = path.join(root, "prompt.md");
    fs.writeFileSync(prompt, promptText);
    return { root, file, prompt };
  };
  const route = (s: ReturnType<typeof setup>) =>
    run(
      ["status", "route", `--file=${s.file}`, "--workflow=build", `--prompt-file=${s.prompt}`],
      s.root,
    );
  const rows = (runtime: string) => [started("build", "2026-10-01T00:00:00Z"), runtimeRow(runtime)];

  it("lets the publish token override publish.local", async () => {
    const r = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=true", { local: false }));
    expect(r.json).toMatchObject({ publish: true, publishSource: "token" });
    const h = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=false"));
    expect(h.json).toMatchObject({ publish: false, publishSource: "token" });
  });

  it("reads publish.local on LOCAL without a token", async () => {
    const r = await route(setup(rows("LOCAL"), "/bkit-build 7", { local: false }));
    expect(r.json).toMatchObject({ publish: false, publishSource: "local" });
  });

  it("coerces publish false to true on a non-LOCAL runtime", async () => {
    const r = await route(setup(rows("CLOUD_CLAUDE"), "/bkit-build 7 publish=false"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ publish: true, publishSource: "coerced" });
  });

  it("accepts --prompt-file with --workflow=build", async () => {
    const r = await route(setup(rows("LOCAL"), "/bkit-build 7"));
    expect(r.code).toBe(0);
    expect(r.json.debugMode).toBeNull();
    expect(r.json.gates).toBeUndefined();
  });

  it("ignores publish=maybe and falls through to config", async () => {
    const r = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=maybe", { local: false }));
    expect(r.json).toMatchObject({ publish: false, publishSource: "local" });
  });

  it("refuses publish without a runtime-resolved row", async () => {
    const r = await route(setup([started("build", "2026-10-01T00:00:00Z")], "/bkit-build 7"));
    expect(r.code).toBe(4);
    expect(r.err).toContain("Step 2");
  });

  it("prints publishSource for token, local, remote and coerced", async () => {
    const sources = [
      (await route(setup(rows("LOCAL"), "publish=false"))).json.publishSource,
      (await route(setup(rows("LOCAL"), "x"))).json.publishSource,
      (await route(setup(rows("GITHUB_ACTION"), "x"))).json.publishSource,
      (await route(setup(rows("GITHUB_ACTION"), "publish=false"))).json.publishSource,
    ];
    expect(sources).toEqual(["token", "local", "remote", "coerced"]);
  });
});

describe("bkit status route --expect", () => {
  const file = () =>
    log([
      started("debug", "2026-10-01T00:00:00Z"),
      {
        type: "workflow-meta",
        workflow: "debug",
        at: "2026-10-01T00:00:01Z",
        debugMode: "NORMAL",
        pushMode: "PR",
      },
      done("debug", "debug-failure-diagnose", "2026-10-01T00:01:00Z", {
        verdict: "PASS",
        strategy: "STANDARD",
      }),
    ]);
  const route = (f: string, ...extra: string[]) =>
    run(["status", "route", `--file=${f}`, "--workflow=debug", ...extra]);

  it("passes when every field holds the expected value", async () => {
    const r = await route(file(), "--expect=debugMode=NORMAL", "--expect=pushMode=PR");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ debugMode: "NORMAL", pushMode: "PR" });
  });

  it("exits 4 naming a field that holds another value", async () => {
    const r = await route(file(), "--expect=debugMode=SOAK");
    expect(r.code).toBe(4);
    expect(r.err).toContain("debugMode is NORMAL, expected SOAK");
  });

  it("an expected field is also required: missing exits 4", async () => {
    const f = log([started("debug", "2026-10-01T00:00:00Z")]);
    expect((await route(f, "--expect=pushMode=PR")).code).toBe(4);
  });

  it("checks a step field with --step, and refuses an unknown field", async () => {
    const f = file();
    expect((await route(f, "--step=debug-failure-diagnose", "--expect=verdict=PASS")).code).toBe(0);
    expect((await route(f, "--expect=colour=red")).code).toBe(2);
    expect((await route(f, "--expect=verdict")).code).toBe(2);
  });
});

describe("bkit status meta", () => {
  it("appends a workflow-meta row the route read then sees", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z")]);
    const w = await run([
      "status",
      "meta",
      `--file=${file}`,
      "--workflow=debug",
      "--debug-mode=SOAK",
      "--debug-attempt=2",
    ]);
    expect(w.code).toBe(0);
    expect(w.json.row).toMatchObject({
      type: "workflow-meta",
      workflow: "debug",
      debugMode: "SOAK",
      debugAttempt: 2,
    });
    expect(w.json.row.at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    const r = await run(["status", "route", `--file=${file}`, "--workflow=debug"]);
    expect(r.json).toMatchObject({ debugMode: "SOAK", debugAttempt: 2 });
  });

  it("records openedPr, and refuses the removed --soak-entry and --decision", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z")]);
    const meta = (...flags: string[]) =>
      run(["status", "meta", `--file=${file}`, "--workflow=debug", ...flags]);
    const w = await meta("--opened-pr");
    expect(w.code).toBe(0);
    expect(w.json.row).toMatchObject({ openedPr: true });
    expect((await meta("--soak-entry")).code).toBe(2);
    expect((await meta("--decision")).code).toBe(2);
  });

  it("--debug-attempt=run records the active run's number", async () => {
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      { type: "workflow-done", workflow: "debug", at: "2026-10-01T01:00:00Z" },
      started("debug", "2026-10-02T00:00:00Z"),
    ]);
    const w = await run([
      "status",
      "meta",
      `--file=${file}`,
      "--workflow=debug",
      "--debug-attempt=run",
    ]);
    expect(w.code).toBe(0);
    expect(w.json.row).toMatchObject({ debugAttempt: 2 });
  });

  it("meta refuses --plan-source", async () => {
    const file = log([started("build", "2026-10-01T00:00:00Z")]);
    const w = await run([
      "status",
      "meta",
      `--file=${file}`,
      "--workflow=build",
      "--plan-source=brief",
    ]);
    expect(w.code).toBe(2);
    expect(w.err).toContain("unknown flag --plan-source");
  });

  it.each([
    [["--debug-mode=TURBO"], 2],
    [["--push-mode=REMOTE"], 2],
    [["--debug-attempt=0"], 2],
    [[], 2],
  ])("rejects %j", async (flags, code) => {
    const file = log([started("debug", "2026-10-01T00:00:00Z")]);
    expect(
      (await run(["status", "meta", `--file=${file}`, "--workflow=debug", ...flags])).code,
    ).toBe(code);
  });

  it("never starts a log", async () => {
    const file = path.join(tmp(), "status.jsonl");
    expect(
      (await run(["status", "meta", `--file=${file}`, "--workflow=debug", "--push-mode=PR"])).code,
    ).toBe(3);
    expect(fs.existsSync(file)).toBe(false);
  });
});

describe("bkit status row", () => {
  it("appends a typed row with fields parsed as JSON where they are JSON", async () => {
    const file = log([started("ship", "2026-10-01T00:00:00Z")]);
    const r = await run([
      "status",
      "row",
      `--file=${file}`,
      "--workflow=ship",
      "--type=ship-gate-refusal",
      "--field=exitCode=11",
      "--field=head=abc123",
      "--field=dispatched=true",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({
      type: "ship-gate-refusal",
      workflow: "ship",
      exitCode: 11,
      head: "abc123",
      dispatched: true,
    });
    const last = JSON.parse(fs.readFileSync(file, "utf-8").trim().split("\n").at(-1)!);
    expect(last).toEqual(r.json.row);
  });

  it.each([
    [["--type=step-done"], 2],
    [["--type=Ship_Gate"], 2],
    [["--type=x", "--field=at=now"], 2],
    [["--type=x", "--field=Bad=1"], 2],
  ])("refuses %j", async (flags, code) => {
    const file = log([started("ship", "2026-10-01T00:00:00Z")]);
    expect((await run(["status", "row", `--file=${file}`, "--workflow=ship", ...flags])).code).toBe(
      code,
    );
  });

  it("never starts a log (exit 3)", async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-row-")), "status.jsonl");
    expect(
      (await run(["status", "row", `--file=${file}`, "--workflow=ship", "--type=x"])).code,
    ).toBe(3);
    expect(fs.existsSync(file)).toBe(false);
  });
});

describe("bkit status row owner-pause friction", () => {
  beforeEach(() => vi.stubEnv("BKIT_ENGINE_JOURNAL", "on"));
  afterEach(() => vi.unstubAllEnvs());
  const at = (s: number) => `2026-11-01T00:00:${String(s).padStart(2, "0")}Z`;

  /** A git checkout holding one IN_PROGRESS run's status.jsonl in the docs/plans layout. */
  function book(workflow: string) {
    const root = tmp();
    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
    const file = path.join(root, "docs/plans/202611/logs/802-x/status.jsonl");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(started(workflow, at(0)))}\n`);
    return { root, file };
  }
  const friction = (root: string) => {
    const f = path.join(root, ".bkit", "friction.jsonl");
    if (!fs.existsSync(f)) return [];
    return fs
      .readFileSync(f, "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
  };
  const row = (root: string, file: string, workflow: string, type: string, ...fields: string[]) =>
    run(
      [
        "status",
        "row",
        `--file=${file}`,
        `--workflow=${workflow}`,
        `--type=${type}`,
        ...fields.map((f) => `--field=${f}`),
      ],
      root,
    );
  const pause = (root: string, file: string, workflow: string, reason: string) =>
    row(root, file, workflow, "owner-pause", `reason=${reason}`);
  const stepDone = (file: string, workflow: string, step: string) =>
    fs.appendFileSync(file, `${JSON.stringify(done(workflow, step, at(30)))}\n`);

  it("status row owner-pause appends one human-confirm friction row", async () => {
    const { root, file } = book("debug");
    const r = await pause(root, file, "debug", "foreign-path");
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({
      type: "owner-pause",
      workflow: "debug",
      reason: "foreign-path",
    });
    const rows = friction(root);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "friction",
      key: "owner-pause/debug.foreign-path",
      category: "human-confirm",
      by: { workflow: "debug", step: "owner-pause" },
      recurrenceCount: 1,
    });
  });

  it("status row owner-pause skips the friction row when no step-done follows the last owner-pause with the same reason", async () => {
    const { root, file } = book("build");
    expect((await pause(root, file, "build", "decision")).code).toBe(0);
    expect((await row(root, file, "build", "owner-answer")).code).toBe(0);
    expect((await pause(root, file, "build", "decision")).code).toBe(0);
    expect((await pause(root, file, "build", "decision")).code).toBe(0);
    expect(friction(root)).toHaveLength(1);
    const pauses = readStatusRows(file).filter((r) => r.type === "owner-pause");
    expect(pauses).toHaveLength(3);
  });

  it("status row owner-pause with a new reason appends its own row with no step-done in between", async () => {
    const { root, file } = book("design");
    for (const reason of ["grill", "grill", "draft", "grill", "draft"]) {
      expect((await pause(root, file, "design", reason)).code).toBe(0);
    }
    const rows = friction(root);
    expect(rows.map((r) => r["key"])).toEqual([
      "owner-pause/design.grill",
      "owner-pause/design.draft",
    ]);
    expect(rows.map((r) => r["recurrenceCount"])).toEqual([1, 1]);
  });

  it("status row owner-pause in a later pause appends a same-key recurrence", async () => {
    const { root, file } = book("build");
    expect((await pause(root, file, "build", "decision")).code).toBe(0);
    stepDone(file, "build", "build-decisions");
    expect((await pause(root, file, "build", "decision")).code).toBe(0);
    const rows = friction(root);
    expect(rows.map((r) => r["key"])).toEqual([
      "owner-pause/build.decision",
      "owner-pause/build.decision",
    ]);
    expect(rows.map((r) => r["recurrenceCount"])).toEqual([1, 2]);
    expect(rows[0]).not.toHaveProperty("lastConfirmed");
    expect(rows[1]!["lastConfirmed"]).toBe(rows[1]!["ts"]);
  });

  it("status row writes no friction row for other types or with BKIT_ENGINE_JOURNAL=off", async () => {
    const { root, file } = book("ship");
    expect((await row(root, file, "ship", "ship-gate-refusal", "exitCode=11")).code).toBe(0);
    expect((await row(root, file, "ship", "owner-answer")).code).toBe(0);
    expect(friction(root)).toHaveLength(0);
    vi.stubEnv("BKIT_ENGINE_JOURNAL", "off");
    expect((await pause(root, file, "ship", "merge")).code).toBe(0);
    expect(friction(root)).toHaveLength(0);
    expect(readStatusRows(file).filter((r) => r.type === "owner-pause")).toHaveLength(1);
  });

  it("status row owner-pause keeps the status row and exits 4 when the friction row cannot be written", async () => {
    const { root, file } = book("build");
    fs.writeFileSync(path.join(root, ".bkit"), "not a directory");
    const r = await pause(root, file, "build", "decision");
    expect(r.code).toBe(4);
    expect(r.err).toContain("friction");
    expect(readStatusRows(file).filter((r) => r.type === "owner-pause")).toHaveLength(1);
  });
});

describe("bkit status invocation", () => {
  const REL = "docs/plans/202611/logs/860-x/status.jsonl";
  const runRepo = (rows: object[] = [started("build", "2026-11-09T10:00:00Z")]) => {
    const root = tmp();
    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
    fs.mkdirSync(path.dirname(path.join(root, REL)), { recursive: true });
    fs.writeFileSync(path.join(root, REL), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
    return root;
  };

  it("issues invocation metadata from an explicit run and registered step", async () => {
    const root = runRepo();
    const statusBefore = fs.readFileSync(path.join(root, REL), "utf-8");
    const r = await run(
      [
        "status",
        "invocation",
        "--workflow=build",
        "--step=build-branch-sync",
        `--file=${REL}`,
        "--agent=bkit-build-plan-tests",
        "--host=claude",
        "--configured-model=sonnet",
      ],
      root,
    );
    expect(r.code).toBe(0);
    // Number, title and paths come from the step table and the explicit run, not the caller.
    expect(r.json).toMatchObject({
      workflow: "build",
      step: "build-branch-sync",
      number: 3,
      title: "Branch Sync",
      run: 1,
      scope: "run",
      statusPath: path.join(root, REL),
      bookRoot: root,
      agent: "bkit-build-plan-tests",
      host: "claude",
      configuredModel: "sonnet",
    });
    expect(typeof r.json.invocation).toBe("string");
    expect(r.json.invocation).not.toBe("");
    // Issuing mutates no run state; the receipt lives in the outbox.
    expect(fs.readFileSync(path.join(root, REL), "utf-8")).toBe(statusBefore);
    expect(fs.existsSync(String(r.json.receipt))).toBe(true);
    expect(String(r.json.receipt)).toContain("bkit-outbox");

    // An unregistered step, and a step of another workflow, are refused.
    const bad = await run(
      ["status", "invocation", "--workflow=build", "--step=not-a-step", `--file=${REL}`],
      root,
    );
    expect(bad.code).toBe(2);
    const cross = await run(
      ["status", "invocation", "--workflow=build", "--step=plan-generate", `--file=${REL}`],
      root,
    );
    expect(cross.code).toBe(2);

    // A runless audit gets scoped outbox authority without a fabricated run or status file.
    const bare = tmp();
    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: bare });
    const audit = await run(
      ["status", "invocation", "--standalone=audit", "--name=bkit-audit-example"],
      bare,
    );
    expect(audit.code).toBe(0);
    expect(audit.json).toMatchObject({ scope: "outbox", run: null, statusPath: null });
    expect(fs.existsSync(String(audit.json.receipt))).toBe(true);
    expect(fs.existsSync(path.join(bare, "docs"))).toBe(false);
  });

  it("binds group and attempt and registers setup, remediation and ship steps", async () => {
    const root = runRepo([
      started("build", "2026-11-09T10:00:00Z"),
      started("ship", "2026-11-09T10:30:00Z"),
    ]);
    const issue = (workflow: string, step: string, extra: string[] = []) =>
      run(
        [
          "status",
          "invocation",
          `--workflow=${workflow}`,
          `--step=${step}`,
          `--file=${REL}`,
          ...extra,
        ],
        root,
      );

    const remediate = await issue("build", "build-plan-gaps-remediate", [
      "--group=2",
      "--attempt=3",
      "--agent=bkit-build-plan-gaps-remediate",
    ]);
    expect(remediate.code).toBe(0);
    expect(remediate.json).toMatchObject({
      scope: "run",
      group: "2",
      attempt: "3",
      agent: "bkit-build-plan-gaps-remediate",
      bookRoot: root,
    });
    // An agent with no reported model is recorded unavailable.
    expect(remediate.json.observedModel).toBe("unavailable");

    const setup = await issue("build", "build-worktree-setup");
    expect(setup.json).toMatchObject({
      number: 2,
      group: null,
      attempt: null,
      observedModel: null,
    });

    const ship = await issue("ship", "ship-summary");
    expect(ship.code).toBe(0);
    expect(ship.json).toMatchObject({ workflow: "ship", number: 6, bookRoot: root });

    const debug = await issue("debug", "debug-run-tests");
    expect(debug.code).toBe(0);
    expect(debug.json).toMatchObject({ workflow: "debug", number: 3 });

    // Malformed ids and standalone calls with a group are refused.
    expect((await issue("build", "build-branch-sync", ["--group=a/b"])).code).toBe(2);
    expect((await issue("build", "build-branch-sync", ["--agent=Bad Name"])).code).toBe(2);
    const bare = await run(
      ["status", "invocation", "--standalone=utility", "--name=u", "--group=1"],
      root,
    );
    expect(bare.code).toBe(2);
    const runless = await run(
      ["status", "invocation", "--standalone=audit", "--name=bkit-audit-x", "--agent=bkit-audit-x"],
      root,
    );
    expect(runless.json).toMatchObject({
      declaredStep: "audit:bkit-audit-x",
      allowedAgent: "bkit-audit-x",
      observedModel: "unavailable",
    });
  });
});
