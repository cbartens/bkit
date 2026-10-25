import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { CommandError, runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { readRuns } from "./status";

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
    const other = ["status", "route", "--workflow=build", `--prompt-file=${p}`];
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
