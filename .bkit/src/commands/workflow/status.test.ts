import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";

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
  const code = await runCommand(argv, COMMANDS, {
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

describe("bkit status fold", () => {
  it("folds to no runs when the file does not exist", async () => {
    const r = await run([
      "status",
      "fold",
      `--file=${path.join(tmp(), "none.jsonl")}`,
      "--workflow=build",
    ]);
    expect(r.json).toEqual({ runs: [], latest: null, last: null });
  });

  it("returns every run, the latest of any workflow, and the latest of --workflow", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-plan-verify", "2026-10-01T00:01:00Z"),
      started("debug", "2026-10-01T00:02:00Z"),
    ]);
    const r = await run(["status", "fold", `--file=${file}`, "--workflow=build"]);
    expect(r.json.runs).toHaveLength(2);
    expect(r.json.latest.workflow).toBe("debug");
    expect(r.json.last.steps).toHaveLength(1);
  });

  it("refuses a malformed line rather than folding around it", async () => {
    const file = log([started("build", "2026-10-01T00:00:00Z")]);
    fs.appendFileSync(file, "{not json\n");
    const r = await run(["status", "fold", `--file=${file}`]);
    expect(r.code).toBe(3);
    expect(r.err).toContain("line 2 is not JSON");
  });

  it("keeps an additive step field (ciDispatch) through the fold unchanged", async () => {
    const ciDispatch = { outcome: "dispatched", head: SHA, attempts: 1, retrigger: false };
    const file = log([
      started("build", "2026-06-16T10:00:00Z"),
      done("build", "build-close-workflow", "2026-06-16T10:01:00Z", { ciDispatch }),
    ]);
    const r = await run(["status", "fold", `--file=${file}`, "--workflow=build"]);
    const step = r.json.last.steps.find((s: { step: string }) => s.step === "build-close-workflow");
    expect(step.ciDispatch).toEqual(ciDispatch);
    expect(step).not.toHaveProperty("type");
    expect(step).not.toHaveProperty("workflow");
  });
});

describe("bkit status route", () => {
  const base = ["status", "route"];

  it("reads the last verdict and failures of a step in the active run, per sub-plan", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-plan-verify", "2026-10-01T00:01:00Z", {
        verdict: "FAIL",
        failures: 2,
        subPlan: 1,
      }),
      done("build", "build-plan-verify", "2026-10-01T00:02:00Z", {
        verdict: "PASS",
        failures: 0,
        subPlan: 2,
      }),
    ]);
    const r = await run([
      ...base,
      `--file=${file}`,
      "--workflow=build",
      "--step=build-plan-verify",
      "--sub-plan=1",
    ]);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: 2 });
  });

  it("counts absent failures as 0 when a verdict is present", async () => {
    const file = log([done("build", "s", "2026-10-01T00:01:00Z", { verdict: "CONCERNS" })]);
    expect(
      (await run([...base, `--file=${file}`, "--workflow=build", "--step=s"])).json.failures,
    ).toBe(0);
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

  it("reads strategy per sub-plan, from the step's last DONE row, within its own workflow", async () => {
    const file = log([
      done("build", "s", "2026-10-01T00:01:00Z", { subPlan: 1, strategy: "PIVOT" }),
      done("build", "s", "2026-10-01T00:02:00Z", { subPlan: 2 }),
      done("debug", "s", "2026-10-01T00:03:00Z", { strategy: "FINAL" }),
    ]);
    const q = async (...f: string[]) =>
      (await run([...base, `--file=${file}`, "--workflow=build", "--step=s", ...f])).json;
    expect(await q("--sub-plan=1")).toMatchObject({ strategy: "PIVOT", nextStrategy: "FINAL" });
    expect(await q("--sub-plan=2")).toMatchObject({ strategy: null, nextStrategy: "STANDARD" });
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

  it("records soakEntryAt at the row's own time, openedPr and planSource", async () => {
    const file = log([started("debug", "2026-10-01T00:00:00Z")]);
    const w = await run([
      "status",
      "meta",
      `--file=${file}`,
      "--workflow=debug",
      "--soak-entry",
      "--opened-pr",
      "--plan-source=brief",
    ]);
    expect(w.code).toBe(0);
    expect(w.json.row).toMatchObject({ openedPr: true, planSource: "brief" });
    expect(w.json.row.soakEntryAt).toBe(w.json.row.at);
  });

  it.each([
    [["--plan-source=guess"], 2],
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
