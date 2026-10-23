import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import type { Step } from "../../ledgers/status";
import { LOOP_PAUSE_THRESHOLDS, THRESHOLDS, loopTrend } from "./counters";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[], cwd?: string) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(argv, COMMANDS, {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return {
    code,
    json: out.length ? JSON.parse(out.join("")) : undefined,
    out: out.join(""),
    err: err.join(""),
  };
}

const started = (workflow: string, at: string) => ({ type: "workflow-started", workflow, at });
const finished = (workflow: string, at: string) => ({ type: "workflow-done", workflow, at });
const done = (workflow: string, step: string, at: string, extra: Record<string, unknown> = {}) => ({
  type: "step-done",
  workflow,
  step,
  status: "DONE",
  at,
  parentSha: (extra.parentSha as string) ?? at,
  artifacts: [],
  ...extra,
});

/** A checkout root holding `package.json` with this `bkit` block. */
function pkgDir(bkit: Record<string, unknown>) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-counters-pkg-"));
  dirs.push(d);
  fs.writeFileSync(path.join(d, "package.json"), JSON.stringify({ name: "x", bkit }));
  return d;
}

function log(rows: object[]) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-counters-"));
  dirs.push(d);
  const file = path.join(d, "status.jsonl");
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  return file;
}

const derive = (file: string, step: string, position: string, ...extra: string[]) =>
  run([
    "counters",
    "derive",
    `--file=${file}`,
    "--workflow=build",
    `--step=${step}`,
    `--position=${position}`,
    ...extra,
  ]);

describe("bkit counters derive", () => {
  const rows = [
    started("build", "2026-10-01T00:00:00Z"),
    done("build", "verify", "2026-10-01T00:01:00Z"),
    done("build", "verify", "2026-10-01T00:02:00Z"),
  ];

  it("next = count + 1, current = count, count = count", async () => {
    const file = log(rows);
    expect((await derive(file, "verify", "next")).json).toEqual({ value: 3, count: 2 });
    expect((await derive(file, "verify", "current")).json).toEqual({ value: 2, count: 2 });
    expect((await derive(file, "verify", "count")).json).toEqual({ value: 2, count: 2 });
  });

  it("current refuses 0 (the step's own row is missing); count allows it", async () => {
    const file = log(rows);
    const cur = await derive(file, "remediate", "current");
    expect(cur.code).toBe(4);
    expect(cur.out).toBe("");
    expect((await derive(file, "remediate", "count")).json).toEqual({ value: 0, count: 0 });
  });

  it("counts only the active run: a fresh run starts at attempt 1", async () => {
    const file = log([
      ...rows,
      finished("build", "2026-10-01T00:03:00Z"),
      started("build", "2026-10-01T00:04:00Z"),
    ]);
    expect((await derive(file, "verify", "next")).json.value).toBe(1);
  });

  it("keeps sub-plans apart", async () => {
    const file = log([
      done("build", "verify", "2026-10-01T00:01:00Z", { subPlan: 1 }),
      done("build", "verify", "2026-10-01T00:02:00Z", { subPlan: 1 }),
      done("build", "verify", "2026-10-01T00:03:00Z", { subPlan: 2 }),
    ]);
    expect((await derive(file, "verify", "count", "--sub-plan=1")).json.value).toBe(2);
    expect((await derive(file, "verify", "count", "--sub-plan=2")).json.value).toBe(1);
    expect((await derive(file, "verify", "count")).json.value).toBe(3);
  });

  it("rejects an empty or non-integer --sub-plan instead of silently counting every sub-plan", async () => {
    const file = log(rows);
    expect((await derive(file, "verify", "count", "--sub-plan=")).code).toBe(2);
    expect((await derive(file, "verify", "count", "--sub-plan=x")).code).toBe(2);
  });

  it("--since counts only rows after the run field's timestamp", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "soak", "2026-10-01T00:01:00Z"),
      {
        type: "workflow-meta",
        workflow: "build",
        at: "2026-10-01T00:02:00Z",
        soakEntryAt: "2026-10-01T00:02:00Z",
      },
      done("build", "soak", "2026-10-01T00:03:00Z"),
    ]);
    expect((await derive(file, "soak", "count", "--since=soakEntryAt")).json.value).toBe(1);
    expect((await derive(file, "soak", "count", "--since=neverSet")).json.value).toBe(2);
  });

  it("--since=decisionAt restarts a route's budget at the newest decision", async () => {
    const decision = (at: string) => ({
      type: "workflow-meta",
      workflow: "build",
      at,
      decisionAt: at,
    });
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "verify", "2026-10-01T00:01:00Z", { subPlan: 1 }),
      decision("2026-10-01T00:02:00Z"),
      done("build", "verify", "2026-10-01T00:03:00Z", { subPlan: 1 }),
      decision("2026-10-01T00:04:00Z"),
      done("build", "verify", "2026-10-01T00:05:00Z", { subPlan: 1 }),
    ]);
    const since = ["--sub-plan=1", "--since=decisionAt"];
    expect((await derive(file, "verify", "count", ...since)).json.value).toBe(1);
    expect((await derive(file, "verify", "count", "--sub-plan=1")).json.value).toBe(3);
  });

  it("two soakEntryAt markers in the same second fold to one marker", async () => {
    const marker = {
      type: "workflow-meta",
      workflow: "build",
      at: "2026-10-01T00:02:00Z",
      soakEntryAt: "2026-10-01T00:02:00Z",
    };
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "soak", "2026-10-01T00:01:00Z", { parentSha: "s1" }),
      marker,
      marker,
      done("build", "soak", "2026-10-01T00:03:00Z", { parentSha: "s2" }),
    ]);
    expect((await derive(file, "soak", "count", "--since=soakEntryAt")).json.value).toBe(1);
    expect((await derive(file, "soak", "next", "--since=soakEntryAt")).json.value).toBe(2);
    expect((await derive(file, "soak", "count")).json.value).toBe(2);
  });

  it("de-dupes: distinct parentSha = two attempts, byte-identical replay = one", async () => {
    const a = done("build", "verify", "2026-10-01T00:01:00Z", { parentSha: "p1" });
    const b = done("build", "verify", "2026-10-01T00:01:00Z", { parentSha: "p2" });
    expect((await derive(log([a, b]), "verify", "count")).json.value).toBe(2);
    expect((await derive(log([a, a]), "verify", "count")).json.value).toBe(1);
  });

  it("treats a step name with shell metacharacters as data", async () => {
    const evil = "x; touch pwned";
    const file = log([done("build", evil, "2026-10-01T00:01:00Z")]);
    expect((await derive(file, evil, "count")).json.value).toBe(1);
    expect((await derive(file, "x", "count")).json.value).toBe(0);
  });

  it("exits 3 on a missing file and 2 on an unknown position", async () => {
    expect(
      (await derive(path.join(os.tmpdir(), "no-such-status.jsonl"), "verify", "next")).code,
    ).toBe(3);
    expect((await derive(log(rows), "verify", "later")).code).toBe(2);
  });

  it("counts only DONE rows: a FAILED row is not an attempt", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "verify", "2026-10-01T00:01:00Z"),
      done("build", "verify", "2026-10-01T00:02:00Z", { status: "FAILED" }),
    ]);
    expect((await derive(file, "verify", "count")).json.value).toBe(1);
    const onlyFailed = log([
      done("build", "remediate", "2026-10-01T00:01:00Z", { status: "FAILED" }),
    ]);
    expect((await derive(onlyFailed, "remediate", "current")).code).toBe(4);
  });

  it("a build resumed after an interleaved finished debug run opens a fresh run: its budget resets", async () => {
    const before = [
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "run-tests", "2026-10-01T00:01:00Z", { parentSha: "b1" }),
      done("build", "run-tests", "2026-10-01T00:02:00Z", { parentSha: "b2" }),
      started("debug", "2026-10-01T00:03:00Z"),
      finished("debug", "2026-10-01T00:04:00Z"),
    ];
    // The paused run, before the resume writes anything, still counts both rows.
    expect((await derive(log(before), "run-tests", "next")).json).toEqual({ value: 3, count: 2 });
    // `counters run` reads the paused build as finished, so the resume starts a new run.
    const runs = await run(["counters", "run", `--file=${log(before)}`, "--workflow=build"]);
    expect(runs.json.run).toBe(2);
    const resumed = log([...before, started("build", "2026-10-01T00:05:00Z")]);
    expect((await derive(resumed, "run-tests", "next")).json).toEqual({ value: 1, count: 0 });
  });

  it("a paused run keeps counting after another workflow's run interleaves", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "verify", "2026-10-01T00:01:00Z"),
      started("debug", "2026-10-01T00:02:00Z"),
      finished("debug", "2026-10-01T00:03:00Z"),
      done("build", "verify", "2026-10-01T00:04:00Z"),
    ]);
    expect((await derive(file, "verify", "count")).json.value).toBe(2);
  });
});

describe("bkit counters run", () => {
  const runOf = async (rows: object[]) =>
    (await run(["counters", "run", `--file=${log(rows)}`, "--workflow=build"])).json.run;

  it("is 1 before any run, and stays the same across the run's own start row", async () => {
    expect(await runOf([])).toBe(1);
    expect(await runOf([started("build", "2026-10-01T00:00:00Z")])).toBe(1);
  });

  it("is n+1 after a finished run, and a resume keeps its number", async () => {
    const first = [
      started("build", "2026-10-01T00:00:00Z"),
      finished("build", "2026-10-01T00:01:00Z"),
    ];
    expect(await runOf(first)).toBe(2);
    expect(await runOf([...first, started("build", "2026-10-01T00:02:00Z")])).toBe(2);
  });

  it("an interleaved debug run makes the paused build run count as finished", async () => {
    const rows = [
      started("build", "2026-10-01T00:00:00Z"),
      started("debug", "2026-10-01T00:01:00Z"),
      finished("debug", "2026-10-01T00:02:00Z"),
    ];
    expect(await runOf(rows)).toBe(2);
  });

  it("is n+1 after a FAILED run too", async () => {
    expect(
      await runOf([
        started("build", "2026-10-01T00:00:00Z"),
        { type: "workflow-failed", workflow: "build", at: "2026-10-01T00:01:00Z" },
      ]),
    ).toBe(2);
  });

  it("counts only this workflow's runs; a union-merge duplicate is one run", async () => {
    const rows = [
      started("plan", "2026-10-01T00:00:00Z"),
      finished("plan", "2026-10-01T00:01:00Z"),
      started("build", "2026-10-02T00:00:00Z"),
      finished("build", "2026-10-02T00:01:00Z"),
      started("debug", "2026-10-03T00:00:00Z"),
    ];
    const file = log([...rows, ...rows]);
    const n = async (w: string) =>
      (await run(["counters", "run", `--file=${file}`, `--workflow=${w}`])).json.run;
    expect(await n("build")).toBe(2);
    expect(await n("plan")).toBe(2);
    expect(await n("ship")).toBe(1);
    expect(await n("debug")).toBe(1);
  });

  it("exits 3 on a missing file", async () => {
    const missing = path.join(os.tmpdir(), "no-such-status.jsonl");
    expect((await run(["counters", "run", `--file=${missing}`, "--workflow=build"])).code).toBe(3);
  });
});

describe("bkit counters route", () => {
  const route = (value: string, max: string, ...extra: string[]) =>
    run([
      "counters",
      "route",
      "--name=VERIFY_ATTEMPT",
      `--value=${value}`,
      `--max=${max}`,
      "--continue=step-8",
      "--exceeded=failure-path",
      ...extra,
    ]);

  it("continues at the cap and below", async () => {
    expect((await route("3", "3")).json).toEqual({
      value: 3,
      exceeded: false,
      next: "step-8",
      max: 3,
      paused: false,
    });
    expect((await route("1", "3")).code).toBe(0);
  });

  it("exits 1 one over the cap, naming the counter on stderr", async () => {
    const r = await route("4", "3");
    expect(r.code).toBe(1);
    expect(r.json).toEqual({
      value: 4,
      exceeded: true,
      next: "failure-path",
      max: 3,
      paused: false,
    });
    expect(r.err).toContain("counter VERIFY_ATTEMPT exceeded max=3 (value=4)");
  });

  it("a max of 0 lets value 0 through and stops value 1", async () => {
    const first = await route("0", "0");
    expect(first.code).toBe(0);
    expect(first.json).toEqual({
      value: 0,
      exceeded: false,
      next: "step-8",
      max: 0,
      paused: false,
    });
    const over = await route("1", "0");
    expect(over.code).toBe(1);
    expect(over.json).toEqual({
      value: 1,
      exceeded: true,
      next: "failure-path",
      max: 0,
      paused: false,
    });
    expect(over.err).toContain("counter VERIFY_ATTEMPT exceeded max=0 (value=1)");
  });

  it.each([[""], ["abc"], ["1.5"], ["-1"]])(
    "refuses value %j (exit 2, nothing on stdout)",
    async (value) => {
      const r = await route(value, "3");
      expect(r.code).toBe(2);
      expect(r.out).toBe("");
    },
  );

  it("refuses an empty or non-integer max with nothing on stdout", async () => {
    for (const max of ["", "abc"]) {
      const r = await route("1", max);
      expect(r.code).toBe(2);
      expect(r.out).toBe("");
    }
  });

  it("takes the max from a threshold name with --limit", async () => {
    const r = await run(
      ["counters", "route", "--name=x", "--value=4", "--limit=MAX_VERIFY_ATTEMPT"],
      pkgDir({ loopPause: false }),
    );
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ value: 4, exceeded: true, next: null, max: 3, paused: false });
  });

  it("needs exactly one of --max and --limit", async () => {
    expect((await run(["counters", "route", "--name=x", "--value=1"])).code).toBe(2);
    expect(
      (
        await run([
          "counters",
          "route",
          "--name=x",
          "--value=1",
          "--max=3",
          "--limit=MAX_TEST_ATTEMPT",
        ])
      ).code,
    ).toBe(2);
    expect(
      (await run(["counters", "route", "--name=x", "--value=1", "--limit=MAX_NOPE"])).code,
    ).toBe(2);
  });
});

describe("bkit counters route --of", () => {
  const rows = () =>
    log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-run-tests", "2026-10-01T00:01:00Z", { attempt: 1 }),
      done("build", "build-run-tests", "2026-10-01T00:02:00Z", { attempt: 2 }),
      done("build", "build-plan-verify", "2026-10-01T00:03:00Z", { subPlan: 2, attempt: 1 }),
    ]);
  const route = (file: string, of: string, max: string, ...extra: string[]) =>
    run([
      "counters",
      "route",
      "--name=TEST_ATTEMPT",
      `--of=${of}`,
      `--file=${file}`,
      "--workflow=build",
      `--max=${max}`,
      "--continue=step-15",
      "--exceeded=failure-path",
      ...extra,
    ]);

  it("derives the value from the active run's DONE rows of the step", async () => {
    const file = rows();
    expect((await route(file, "build-run-tests:current", "2")).json).toEqual({
      value: 2,
      exceeded: false,
      next: "step-15",
      max: 2,
      paused: false,
    });
    const next = await route(file, "build-run-tests:next", "2");
    expect(next.code).toBe(1);
    expect(next.json).toMatchObject({ value: 3, exceeded: true, next: "failure-path" });
  });

  it("counts one sub-plan's rows with --sub-plan", async () => {
    const file = rows();
    expect((await route(file, "build-plan-verify:count", "3", "--sub-plan=2")).json.value).toBe(1);
    expect((await route(file, "build-plan-verify:count", "3", "--sub-plan=1")).json.value).toBe(0);
  });

  it("exits 4 when :current finds the step's own row missing", async () => {
    expect((await route(rows(), "build-failure-diagnose:current", "3")).code).toBe(4);
  });

  it("sums the DONE rows of several steps with <step>,<step>:count", async () => {
    const file = rows();
    const both = await route(file, "build-run-tests,build-plan-verify:count", "2");
    expect(both.code).toBe(1);
    expect(both.json).toMatchObject({ value: 3, exceeded: true, next: "failure-path" });
    const none = await route(file, "build-failure-diagnose,build-failure-remediate:count", "0");
    expect(none.code).toBe(0);
    expect(none.json).toMatchObject({ value: 0, exceeded: false, next: "step-15" });
    expect((await route(file, "build-run-tests,ghost-step:count", "0")).json.value).toBe(2);
  });

  it("refuses a step list off :count, a repeated step, or an empty list entry", async () => {
    const file = rows();
    for (const of of [
      "build-run-tests,build-plan-verify:next",
      "build-run-tests,build-plan-verify:current",
      "build-run-tests,build-run-tests:count",
      "build-run-tests,:count",
      ",build-run-tests:count",
    ]) {
      const r = await route(file, of, "3");
      expect(r.code, of).toBe(2);
      expect(r.out, of).toBe("");
    }
  });

  it("needs exactly one of --value and --of, and --file with --workflow for --of", async () => {
    const file = rows();
    expect((await route(file, "build-run-tests:next", "3", "--value=1")).code).toBe(2);
    expect(
      (await run(["counters", "route", "--name=X", "--of=build-run-tests:next", "--max=3"])).code,
    ).toBe(2);
    expect((await route(file, "build-run-tests", "3")).code).toBe(2);
  });
});

describe("bkit counters route under bkit.loopPause", () => {
  const route = (value: string, limit: string, cwd: string) =>
    run(
      [
        "counters",
        "route",
        "--name=VERIFY_ATTEMPT",
        `--value=${value}`,
        `--limit=${limit}`,
        "--continue=step-8",
        "--exceeded=failure-path",
        "--exceeded-paused=decision-pause",
      ],
      cwd,
    );

  it("loopPause on caps covered limits at 1 and takes --exceeded-paused", async () => {
    for (const cwd of [pkgDir({ loopPause: true }), pkgDir({})]) {
      for (const limit of Object.keys(LOOP_PAUSE_THRESHOLDS)) {
        expect((await route("1", limit, cwd)).json).toEqual({
          value: 1,
          exceeded: false,
          next: "step-8",
          max: 1,
          paused: true,
        });
        const over = await route("2", limit, cwd);
        expect(over.code).toBe(1);
        expect(over.json).toEqual({
          value: 2,
          exceeded: true,
          next: "decision-pause",
          max: 1,
          paused: true,
        });
      }
    }
  });

  it("loopPause off keeps today's limits and --exceeded", async () => {
    const cwd = pkgDir({ loopPause: false });
    expect((await route("3", "MAX_VERIFY_ATTEMPT", cwd)).json).toMatchObject({
      exceeded: false,
      max: 3,
      paused: false,
    });
    expect((await route("4", "MAX_TEST_ATTEMPT", cwd)).json).toMatchObject({
      exceeded: true,
      next: "failure-path",
      paused: false,
    });
  });

  it("falls back to --exceeded when no --exceeded-paused is given", async () => {
    const r = await run(
      [
        "counters",
        "route",
        "--name=x",
        "--value=2",
        "--limit=MAX_MERGE_ATTEMPT",
        "--exceeded=failure-path",
      ],
      pkgDir({}),
    );
    expect(r.json).toMatchObject({ next: "failure-path", max: 1, paused: true });
  });

  it("uncovered limits and --max ignore loopPause", async () => {
    const cwd = pkgDir({});
    for (const limit of ["MAX_REVALIDATE_ATTEMPT", "MAX_NORMAL_ATTEMPT", "MAX_SOAK_ATTEMPT"])
      expect((await route("3", limit, cwd)).json).toMatchObject({ max: 3, paused: false });
    const r = await run(
      ["counters", "route", "--name=x", "--value=2", "--max=3", "--exceeded-paused=decision-pause"],
      cwd,
    );
    expect(r.json).toMatchObject({ exceeded: false, max: 3, paused: false });
  });
});

describe("bkit counters progress", () => {
  const verify = (at: string, failures: number, sha: string, extra: Record<string, unknown> = {}) =>
    done("build", "build-plan-verify", at, { failures, parentSha: sha, subPlan: 1, ...extra });
  const fix = (at: string, strategy: string) =>
    done("build", "build-plan-gaps-remediate", at, { strategy, subPlan: 1 });
  const progress = (file: string, ...extra: string[]) =>
    run([
      "counters",
      "progress",
      `--file=${file}`,
      "--workflow=build",
      "--check=build-plan-verify",
      "--fix=build-plan-gaps-remediate",
      "--sub-plan=1",
      ...extra,
    ]);

  it("reports a falling count as closing and recommends another round", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 5, "a"),
      fix("2026-10-01T00:20:00Z", "STANDARD"),
      verify("2026-10-01T00:30:00Z", 2, "b"),
    ]);
    const r = await progress(file);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      counts: "5 → 2",
      lastStrategy: "STANDARD",
      nextStrategy: "PIVOT",
      finalSpent: false,
      minutesPerRound: 20,
      trend: "closing",
      recommend: "try-again",
    });
    expect(r.json.rounds).toHaveLength(2);
  });

  it("reports the same count as stuck and a rising count as worse", async () => {
    const same = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 21, "a"),
      fix("2026-10-01T00:20:00Z", "PIVOT"),
      verify("2026-10-01T00:30:00Z", 21, "b"),
    ]);
    expect((await progress(same)).json).toMatchObject({ trend: "stuck", recommend: "stop" });
    const rose = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 2, "a"),
      fix("2026-10-01T00:20:00Z", "FINAL"),
      verify("2026-10-01T00:30:00Z", 4, "b"),
    ]);
    expect((await progress(rose)).json).toMatchObject({
      trend: "worse",
      recommend: "stop",
      nextStrategy: "FINAL",
      finalSpent: true,
    });
  });

  it("counts only rounds after --since, and calls a lone round first-round", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 5, "a"),
      fix("2026-10-01T00:20:00Z", "STANDARD"),
      verify("2026-10-01T00:30:00Z", 3, "b"),
      {
        type: "workflow-meta",
        workflow: "build",
        at: "2026-10-01T00:40:00Z",
        decisionAt: "2026-10-01T00:40:00Z",
      },
      verify("2026-10-01T00:50:00Z", 3, "c"),
    ]);
    const r = await progress(file, "--since=decisionAt");
    expect(r.json).toMatchObject({
      counts: "3",
      lastStrategy: null,
      nextStrategy: "PIVOT",
      minutesPerRound: null,
      trend: "first-round",
      recommend: null,
    });
  });

  it("leaves codeChanged null when git cannot compare the rounds", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 5, "nope1"),
      verify("2026-10-01T00:30:00Z", 2, "nope2"),
    ]);
    expect((await progress(file)).json).toMatchObject({ codeChanged: null, trend: "closing" });
  });

  it("judges codeChanged on source only, from the rounds' parent commits", async () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-counters-git-"));
    dirs.push(repo);
    const sh = (...a: string[]) =>
      spawnSync("git", a, {
        cwd: repo,
        encoding: "utf-8",
      }).stdout.trim();
    sh("init", "-q");
    sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "a");
    const a = sh("rev-parse", "HEAD");
    const logs = path.join(repo, "docs", "plans", "202610", "logs", "1-x");
    fs.mkdirSync(logs, { recursive: true });
    fs.writeFileSync(path.join(logs, "note.md"), "log only\n");
    sh("add", "-A");
    sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "logs");
    const b = sh("rev-parse", "HEAD");
    fs.writeFileSync(path.join(repo, "src.ts"), "x\n");
    sh("add", "-A");
    sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "src");
    const c = sh("rev-parse", "HEAD");
    const file = path.join(logs, "status.jsonl");
    const write = (second: string) =>
      fs.writeFileSync(
        file,
        [
          started("build", "2026-10-01T00:00:00Z"),
          verify("2026-10-01T00:10:00Z", 5, a),
          verify("2026-10-01T00:30:00Z", 2, second),
        ]
          .map((x) => JSON.stringify(x))
          .join("\n") + "\n",
      );
    write(b);
    expect((await progress(file)).json).toMatchObject({ codeChanged: false, trend: "stuck" });
    write(c);
    expect((await progress(file)).json).toMatchObject({ codeChanged: true, trend: "closing" });
  });

  it("exits 3 on a missing file", async () => {
    expect((await progress("/nonexistent/status.jsonl")).code).toBe(3);
  });
});

describe("loopTrend", () => {
  const r = (failures?: number) => ({ failures }) as Step;
  it("a fall without a code change is stuck, not closing", () => {
    expect(loopTrend([r(5), r(2)], false)).toBe("stuck");
    expect(loopTrend([r(5), r(2)], true)).toBe("closing");
    expect(loopTrend([r(5), r()], true)).toBe("stuck");
    expect(loopTrend([r(5)], true)).toBe("first-round");
  });
});

describe("bkit counters max", () => {
  it("returns one threshold or all of them", async () => {
    expect((await run(["counters", "max", "--name=MAX_DEV_DISPATCH_ATTEMPTS"])).json).toEqual({
      value: 3,
    });
    expect((await run(["counters", "max"])).json).toEqual({
      thresholds: THRESHOLDS,
      loopPauseThresholds: LOOP_PAUSE_THRESHOLDS,
    });
  });

  it("every threshold is a non-negative integer, and every attempt cap is at least 1", () => {
    const thresholds = Object.entries(THRESHOLDS);
    expect(thresholds.length).toBeGreaterThan(0);
    expect(thresholds.filter(([, value]) => !Number.isInteger(value))).toEqual([]);
    expect(thresholds.filter(([, value]) => value < 0)).toEqual([]);
    const attemptCaps = thresholds.filter(([name]) => name !== "MAX_CHALLENGE_REMEDIATE_ATTEMPT");
    expect(attemptCaps.filter(([, value]) => value < 1)).toEqual([]);
  });

  it("bkit-cloud.yml (both copies) declares MAX_DEV_DISPATCH_ATTEMPTS equal to THRESHOLDS", () => {
    for (const rel of [
      "../../../../../.github/workflows/bkit-cloud.yml",
      "../../../../templates/.github/workflows/bkit-cloud.yml",
    ]) {
      const yml = fs.readFileSync(path.resolve(__dirname, rel), "utf-8");
      const m = /^env:\n {2}MAX_DEV_DISPATCH_ATTEMPTS: (\d+)$/m.exec(yml);
      expect(m, rel).not.toBeNull();
      expect(Number(m![1])).toBe(THRESHOLDS.MAX_DEV_DISPATCH_ATTEMPTS);
    }
  });
});

describe("bkit counters rows", () => {
  const probe = (at: string) => ({ type: "ship-revalidate-dispatch", workflow: "ship", at });
  it("counts rows of the type since the active run's workflow-started row", async () => {
    const file = log([
      started("ship", "2026-10-01T00:00:00Z"),
      probe("2026-10-01T00:01:00Z"),
      finished("ship", "2026-10-01T00:02:00Z"),
      started("ship", "2026-10-02T00:00:00Z"),
      probe("2026-10-02T00:01:00Z"),
      { type: "ship-gate-refusal", workflow: "ship", at: "2026-10-02T00:02:00Z" },
      probe("2026-10-02T00:03:00Z"),
    ]);
    const base = [
      "counters",
      "rows",
      `--file=${file}`,
      "--workflow=ship",
      "--type=ship-revalidate-dispatch",
    ];
    expect((await run([...base, "--position=count"])).json).toEqual({ value: 2, count: 2 });
    expect((await run([...base, "--position=next"])).json).toEqual({ value: 3, count: 2 });
  });

  it("a resumed run does not inherit a crashed run's rows (no workflow-finished between)", async () => {
    const file = log([
      started("ship", "2026-10-01T00:00:00Z"),
      probe("2026-10-01T00:10:00Z"),
      probe("2026-10-01T00:20:00Z"),
      started("ship", "2026-10-02T00:00:00Z"),
    ]);
    const res = await run([
      "counters",
      "rows",
      `--file=${file}`,
      "--workflow=ship",
      "--type=ship-revalidate-dispatch",
      "--position=next",
    ]);
    expect(res.json).toEqual({ value: 1, count: 0 });
  });

  it("starts at 1 on a fresh run, and refuses a bad position or a missing log", async () => {
    const file = log([started("ship", "2026-10-01T00:00:00Z")]);
    const base = [
      "counters",
      "rows",
      `--file=${file}`,
      "--workflow=ship",
      "--type=ship-revalidate-dispatch",
    ];
    expect((await run([...base, "--position=next"])).json.value).toBe(1);
    expect((await run([...base, "--position=current"])).code).toBe(2);
    const missing = [
      "counters",
      "rows",
      "--file=/nonexistent/status.jsonl",
      "--workflow=ship",
      "--type=x",
      "--position=count",
    ];
    expect((await run(missing)).code).toBe(3);
  });
});
