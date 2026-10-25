import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import type { Step } from "../../ledgers/status";
import { loopTrend } from "./counters";
import { ASK_POINTS } from "../../shared/settings";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[], cwd?: string) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], COMMANDS, {
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

  it("counters isolate by group", async () => {
    const file = log([
      done("build", "verify", "2026-10-01T00:01:00Z", { group: 1 }),
      done("build", "verify", "2026-10-01T00:02:00Z", { group: 1 }),
      done("build", "verify", "2026-10-01T00:03:00Z", { group: 2 }),
    ]);
    expect((await derive(file, "verify", "count", "--group=1")).json.value).toBe(2);
    expect((await derive(file, "verify", "count", "--group=2")).json.value).toBe(1);
    expect((await derive(file, "verify", "count")).json.value).toBe(3);
  });

  it("rejects an empty or non-integer --group instead of silently counting every group", async () => {
    const file = log(rows);
    expect((await derive(file, "verify", "count", "--group=")).code).toBe(2);
    expect((await derive(file, "verify", "count", "--group=x")).code).toBe(2);
  });

  it("a decision row never resets the count, and --since is refused", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "verify", "2026-10-01T00:01:00Z", { group: 1 }),
      { type: "workflow-meta", workflow: "build", at: "2026-10-01T00:02:00Z", decisionAt: "x" },
      done("build", "verify", "2026-10-01T00:03:00Z", { group: 1 }),
    ]);
    expect((await derive(file, "verify", "count", "--group=1")).json.value).toBe(2);
    expect((await derive(file, "verify", "count", "--since=decisionAt")).code).toBe(2);
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
      ask: false,
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
      ask: false,
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
      ask: false,
    });
    const over = await route("1", "0");
    expect(over.code).toBe(1);
    expect(over.json).toEqual({
      value: 1,
      exceeded: true,
      next: "failure-path",
      max: 0,
      ask: false,
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

  it("takes the max from an ask point with --point", async () => {
    const r = await run(
      ["counters", "route", "--name=x", "--value=3", "--point=build.verify"],
      pkgDir({ workflows: { build: { verify: { ask: false } } } }),
    );
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ value: 3, exceeded: true, next: null, max: 2, ask: false });
  });

  it("needs exactly one of --max and --point", async () => {
    expect((await run(["counters", "route", "--name=x", "--value=1"])).code).toBe(2);
    expect(
      (await run(["counters", "route", "--name=x", "--value=1", "--max=3", "--point=build.tests"]))
        .code,
    ).toBe(2);
    expect(
      (await run(["counters", "route", "--name=x", "--value=1", "--point=build.nope"])).code,
    ).toBe(2);
  });
});

describe("bkit counters route --of", () => {
  const rows = () =>
    log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-run-tests", "2026-10-01T00:01:00Z", { attempt: 1 }),
      done("build", "build-run-tests", "2026-10-01T00:02:00Z", { attempt: 2 }),
      done("build", "build-plan-verify", "2026-10-01T00:03:00Z", { group: 2, attempt: 1 }),
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
      ask: false,
    });
    const next = await route(file, "build-run-tests:next", "2");
    expect(next.code).toBe(1);
    expect(next.json).toMatchObject({ value: 3, exceeded: true, next: "failure-path" });
  });

  it("counts one group's rows with --group", async () => {
    const file = rows();
    expect((await route(file, "build-plan-verify:count", "3", "--group=2")).json.value).toBe(1);
    expect((await route(file, "build-plan-verify:count", "3", "--group=1")).json.value).toBe(0);
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

describe("bkit counters route --point", () => {
  const route = (value: string, point: string, cwd: string) =>
    run(
      [
        "counters",
        "route",
        "--name=VERIFY_ATTEMPT",
        `--value=${value}`,
        `--point=${point}`,
        "--continue=step-8",
        "--exceeded=failure-path",
      ],
      cwd,
    );

  const DEFAULT_MAX: Record<string, number> = {
    "design.grill": 6,
    "build.verify": 2,
    "build.challenge": 2,
    "build.tests": 2,
    "debug.fix": 2,
    "debug.soak": 2,
    "ship.merge": 2,
  };

  it("takes each point's default limit and asks when nothing is set", async () => {
    const cwd = pkgDir({});
    expect(Object.keys(DEFAULT_MAX)).toEqual([...ASK_POINTS]);
    for (const point of ASK_POINTS) {
      const max = DEFAULT_MAX[point]!;
      expect((await route(String(max), point, cwd)).json).toEqual({
        value: max,
        exceeded: false,
        next: "step-8",
        max,
        ask: true,
      });
      const over = await route(String(max + 1), point, cwd);
      expect(over.code).toBe(1);
      expect(over.json).toMatchObject({ exceeded: true, next: "failure-path", ask: true });
    }
  });

  it("reads ask and the limit from bkit.workflows", async () => {
    const cwd = pkgDir({
      workflows: {
        build: { verify: { ask: false, maxAttempts: 3 } },
        design: { grill: { maxTurns: 1 } },
      },
    });
    expect((await route("3", "build.verify", cwd)).json).toMatchObject({
      exceeded: false,
      max: 3,
      ask: false,
    });
    expect((await route("2", "design.grill", cwd)).json).toMatchObject({
      exceeded: true,
      max: 1,
      ask: true,
    });
  });

  it("an invalid limit or ask takes its default", async () => {
    const cwd = pkgDir({ workflows: { ship: { merge: { ask: "no", maxAttempts: 0 } } } });
    expect((await route("1", "ship.merge", cwd)).json).toMatchObject({ max: 2, ask: true });
  });

  it("a headless run never asks", async () => {
    vi.stubEnv("BKIT_RUNTIME", "GITHUB_ACTION");
    try {
      expect((await route("1", "debug.fix", pkgDir({}))).json).toMatchObject({ ask: false });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("bkit counters progress", () => {
  const verify = (at: string, failures: number, sha: string, extra: Record<string, unknown> = {}) =>
    done("build", "build-plan-verify", at, { failures, parentSha: sha, group: 1, ...extra });
  const fix = (at: string, strategy: string) =>
    done("build", "build-plan-gaps-remediate", at, { strategy, group: 1 });
  const progress = (file: string, ...extra: string[]) =>
    run([
      "counters",
      "progress",
      `--file=${file}`,
      "--workflow=build",
      "--check=build-plan-verify",
      "--fix=build-plan-gaps-remediate",
      "--group=1",
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
  it("returns one point's limit and ask setting, or every point as set", async () => {
    const cwd = pkgDir({ workflows: { debug: { fix: { ask: false, maxAttempts: 4 } } } });
    expect((await run(["counters", "max", "--point=debug.fix"], cwd)).json).toEqual({
      value: 4,
      ask: false,
    });
    expect((await run(["counters", "max", "--point=design.grill"], cwd)).json).toEqual({
      value: 6,
      ask: true,
    });
    const all = (await run(["counters", "max"], cwd)).json;
    expect(Object.keys(all.points)).toEqual([...ASK_POINTS]);
    expect(all.points["debug.fix"]).toEqual({ ask: false, max: 4 });
    expect(all.points["ship.merge"]).toEqual({ ask: true, max: 2 });
  });

  it("refuses an unknown point", async () => {
    expect((await run(["counters", "max", "--point=build.nope"], pkgDir({}))).code).toBe(2);
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

  it("an engine-action row between counted rows is not counted", async () => {
    const file = log([
      started("ship", "2026-10-02T00:00:00Z"),
      probe("2026-10-02T00:01:00Z"),
      {
        type: "engine-action",
        action: "comment",
        key: "k",
        hash: "h",
        ref: null,
        at: "2026-10-02T00:02:00Z",
      },
    ]);
    const res = await run([
      "counters",
      "rows",
      `--file=${file}`,
      "--workflow=ship",
      "--type=ship-revalidate-dispatch",
      "--position=count",
    ]);
    expect(res.json).toEqual({ value: 1, count: 1 });
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

  it("route --rows derives the value from typed rows of the active run", async () => {
    const file = log([
      started("ship", "2026-10-02T00:00:00Z"),
      probe("2026-10-02T00:01:00Z"),
      probe("2026-10-02T00:03:00Z"),
    ]);
    const route = (rows: string, max: string) =>
      run([
        "counters",
        "route",
        "--name=MERGE_ATTEMPT",
        `--rows=${rows}`,
        `--file=${file}`,
        "--workflow=ship",
        `--max=${max}`,
        "--continue=step-9",
        "--exceeded=failure-path",
      ]);
    const within = await route("ship-revalidate-dispatch:count", "2");
    expect(within.code).toBe(0);
    expect(within.json).toMatchObject({ value: 2, next: "step-9" });
    const over = await route("ship-revalidate-dispatch:count", "1");
    expect(over.code).toBe(1);
    expect(over.json).toMatchObject({ value: 2, next: "failure-path" });
    expect((await route("ship-revalidate-dispatch:next", "2")).code).toBe(2);
    const both = await run([
      "counters",
      "route",
      "--name=X",
      "--value=1",
      "--rows=ship-revalidate-dispatch:count",
      `--file=${file}`,
      "--workflow=ship",
      "--max=3",
    ]);
    expect(both.code).toBe(2);
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
