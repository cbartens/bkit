import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import type { Step } from "../../ledgers/status";
import { loopProgress, loopTrend } from "./counters";
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

  it("a build resumed after an interleaved finished debug run keeps its run and its budget", async () => {
    const before = [
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "run-tests", "2026-10-01T00:01:00Z", { parentSha: "b1" }),
      done("build", "run-tests", "2026-10-01T00:02:00Z", { parentSha: "b2" }),
      started("debug", "2026-10-01T00:03:00Z"),
      finished("debug", "2026-10-01T00:04:00Z"),
    ];
    expect((await derive(log(before), "run-tests", "next")).json).toEqual({ value: 3, count: 2 });
    const runs = await run(["counters", "run", `--file=${log(before)}`, "--workflow=build"]);
    expect(runs.json.run).toBe(1);
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

  it("an interleaved debug run leaves the paused build run in progress", async () => {
    const rows = [
      started("build", "2026-10-01T00:00:00Z"),
      started("debug", "2026-10-01T00:01:00Z"),
      finished("debug", "2026-10-01T00:02:00Z"),
    ];
    expect(await runOf(rows)).toBe(1);
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
    expect(r.json).toEqual({
      value: 3,
      exceeded: true,
      next: null,
      max: 2,
      ask: false,
      limitsFrom: "package.json",
    });
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
        limitsFrom: "package.json",
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

  /** route over a status log whose active build run started with `start`. */
  const routeRun = (value: string, start: Record<string, unknown>, cwd: string) =>
    run(
      [
        "counters",
        "route",
        "--name=VERIFY_ATTEMPT",
        `--value=${value}`,
        "--point=build.verify",
        `--file=${log([{ ...started("build", "2026-10-01T00:00:00Z"), ...start }])}`,
        "--workflow=build",
      ],
      cwd,
    );

  it("takes the limit the run froze at its start, not package.json's live value", async () => {
    const cwd = pkgDir({ workflows: { build: { verify: { ask: true, maxAttempts: 5 } } } });
    const frozen = { limits: { "build.verify": { ask: false, max: 2 } } };
    const r = await routeRun("3", frozen, cwd);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ exceeded: true, max: 2, ask: false, limitsFrom: "run" });
  });

  it("reads package.json when the run froze no limit for the point", async () => {
    const cwd = pkgDir({ workflows: { build: { verify: { maxAttempts: 5 } } } });
    for (const start of [{}, { limits: { "build.tests": { ask: true, max: 1 } } }])
      expect((await routeRun("3", start, cwd)).json).toMatchObject({
        exceeded: false,
        max: 5,
        limitsFrom: "package.json",
      });
  });

  it("max --point takes the run's frozen limit with --file and --workflow, else package.json", async () => {
    const cwd = pkgDir({ workflows: { build: { verify: { ask: true, maxAttempts: 5 } } } });
    const file = log([
      {
        ...started("build", "2026-10-01T00:00:00Z"),
        limits: { "build.verify": { ask: false, max: 2 } },
      },
    ]);
    const max = (...extra: string[]) =>
      run(["counters", "max", "--point=build.verify", ...extra], cwd);
    expect((await max(`--file=${file}`, "--workflow=build")).json).toMatchObject({
      value: 2,
      ask: false,
      limitsFrom: "run",
    });
    expect((await max()).json).toMatchObject({ value: 5, limitsFrom: "package.json" });
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

describe("bkit counters grant", () => {
  const start = started("build", "2026-10-01T00:00:00Z");
  const verify = (at: string) => done("build", "build-plan-verify", at, { group: 1 });
  const grant = (file: string, cwd: string, ...extra: string[]) =>
    run(
      [
        "counters",
        "grant",
        "--name=VERIFY_ATTEMPT",
        "--of=build-plan-verify:current",
        `--file=${file}`,
        "--workflow=build",
        "--point=build.verify",
        "--group=1",
        ...extra,
      ],
      cwd,
    );
  const route = (file: string, cwd: string, ...extra: string[]) =>
    run(
      [
        "counters",
        "route",
        "--name=VERIFY_ATTEMPT",
        "--of=build-plan-verify:next",
        `--file=${file}`,
        "--workflow=build",
        "--point=build.verify",
        "--group=1",
        ...extra,
      ],
      cwd,
    );

  it("grants one more full allowance at the used-up limit, and route counts it", async () => {
    const cwd = pkgDir({});
    const file = log([start, verify("2026-10-01T00:10:00Z"), verify("2026-10-01T00:20:00Z")]);
    const before = await route(file, cwd);
    expect(before.code).toBe(1);
    expect(before.json).toMatchObject({ value: 3, max: 2, grants: 0, allowance: 2 });
    const granted = await grant(file, cwd);
    expect(granted.code).toBe(0);
    expect(granted.json).toEqual({ granted: true, reason: null, value: 2, max: 4, grants: 1 });
    const row = JSON.parse(fs.readFileSync(file, "utf-8").trim().split("\n").at(-1)!);
    expect(row).toMatchObject({
      type: "allowance-granted",
      workflow: "build",
      point: "build.verify",
      group: 1,
      value: 2,
    });
    const after = await route(file, cwd);
    expect(after.code).toBe(0);
    expect(after.json).toMatchObject({ value: 3, max: 4, exceeded: false, grants: 1 });
    expect(
      (
        await run(
          ["counters", "max", "--point=build.verify", `--file=${file}`, "--workflow=build"],
          cwd,
        )
      ).json,
    ).toMatchObject({ value: 4, grants: 1 });
  });

  it("grants nothing below the limit, and nothing when nobody can agree", async () => {
    const cwd = pkgDir({});
    const below = log([start, verify("2026-10-01T00:10:00Z")]);
    expect((await grant(below, cwd)).json).toMatchObject({ granted: false, reason: "below-limit" });
    const used = log([start, verify("2026-10-01T00:10:00Z"), verify("2026-10-01T00:20:00Z")]);
    const off = pkgDir({ workflows: { build: { verify: { ask: false, maxAttempts: 2 } } } });
    const r = await grant(used, off);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ granted: false, reason: "ask-off" });
    vi.stubEnv("BKIT_RUNTIME", "GITHUB_ACTION");
    try {
      expect((await grant(used, cwd)).json).toMatchObject({ granted: false, reason: "ask-off" });
    } finally {
      vi.unstubAllEnvs();
    }
    expect(fs.readFileSync(used, "utf-8")).not.toContain("allowance-granted");
  });

  it("a grant raises only the loop it was given for", async () => {
    const cwd = pkgDir({});
    const file = log([
      start,
      verify("2026-10-01T00:10:00Z"),
      verify("2026-10-01T00:20:00Z"),
      {
        type: "allowance-granted",
        workflow: "build",
        at: "2026-10-01T00:30:00Z",
        point: "build.verify",
        group: 2,
      },
      {
        type: "allowance-granted",
        workflow: "build",
        at: "2026-10-01T00:31:00Z",
        point: "build.tests",
      },
    ]);
    expect((await route(file, cwd)).json).toMatchObject({ max: 2, grants: 0, exceeded: true });
    const group2 = await run(
      [
        "counters",
        "route",
        "--name=VERIFY_ATTEMPT",
        "--value=3",
        `--file=${file}`,
        "--workflow=build",
        "--point=build.verify",
        "--group=2",
      ],
      cwd,
    );
    expect(group2.json).toMatchObject({ max: 4, grants: 1 });
  });

  it("counts grants of the active run only, unless --all-runs", async () => {
    const cwd = pkgDir({});
    const file = log([
      started("debug", "2026-10-01T00:00:00Z"),
      {
        type: "allowance-granted",
        workflow: "debug",
        at: "2026-10-01T00:10:00Z",
        point: "debug.soak",
      },
      started("debug", "2026-10-02T00:00:00Z"),
    ]);
    const soak = (...extra: string[]) =>
      run(
        [
          "counters",
          "route",
          "--name=SOAK_ATTEMPT",
          "--value=3",
          `--file=${file}`,
          "--workflow=debug",
          "--point=debug.soak",
          ...extra,
        ],
        cwd,
      );
    expect((await soak()).json).toMatchObject({ max: 2, grants: 0, exceeded: true });
    expect((await soak("--all-runs")).json).toMatchObject({ max: 4, grants: 1, exceeded: false });
  });
});

describe("bkit counters route --since-clean", () => {
  const start = started("build", "2026-10-01T00:00:00Z");
  const holistic = (at: string, verdict: string, failures: number) =>
    done("build", "build-plan-verify-holistic", at, { verdict, failures });
  const grantRow = (at: string, group?: number) => ({
    type: "allowance-granted",
    workflow: "build",
    at,
    point: "build.verify",
    ...(group === undefined ? {} : { group }),
  });
  const route = (file: string, cwd: string, ...extra: string[]) =>
    run(
      [
        "counters",
        "route",
        "--name=HOLISTIC_ROUNDS",
        "--of=build-plan-verify-holistic:current",
        `--file=${file}`,
        "--workflow=build",
        "--point=build.verify",
        ...extra,
      ],
      cwd,
    );

  it("counts only the rounds after the step's last clean round", async () => {
    const cwd = pkgDir({});
    const file = log([
      start,
      holistic("2026-10-01T00:10:00Z", "FAIL", 2),
      holistic("2026-10-01T00:20:00Z", "CONCERNS", 1),
      holistic("2026-10-01T00:30:00Z", "PASS", 0),
      holistic("2026-10-01T00:40:00Z", "FAIL", 1),
    ]);
    expect((await route(file, cwd)).json).toMatchObject({ value: 4, exceeded: true });
    expect((await route(file, cwd, "--since-clean")).json).toMatchObject({
      value: 1,
      max: 2,
      exceeded: false,
    });
  });

  it("a CONCERNS round with 0 failures is clean, one with failures is not", async () => {
    const cwd = pkgDir({});
    const rounds = (verdict: string, failures: number) =>
      log([
        start,
        holistic("2026-10-01T00:10:00Z", "FAIL", 1),
        holistic("2026-10-01T00:20:00Z", verdict, failures),
        holistic("2026-10-01T00:30:00Z", "FAIL", 1),
      ]);
    expect((await route(rounds("CONCERNS", 0), cwd, "--since-clean")).json.value).toBe(1);
    expect((await route(rounds("CONCERNS", 1), cwd, "--since-clean")).json.value).toBe(3);
  });

  it("counts only the grants after the last clean round, and only those without a group", async () => {
    const cwd = pkgDir({});
    const file = log([
      start,
      holistic("2026-10-01T00:10:00Z", "FAIL", 1),
      grantRow("2026-10-01T00:11:00Z"),
      holistic("2026-10-01T00:20:00Z", "PASS", 0),
      grantRow("2026-10-01T00:25:00Z", 3),
      holistic("2026-10-01T00:30:00Z", "FAIL", 1),
      grantRow("2026-10-01T00:31:00Z"),
    ]);
    expect((await route(file, cwd)).json).toMatchObject({ grants: 3, max: 8 });
    expect((await route(file, cwd, "--since-clean")).json).toMatchObject({
      value: 1,
      grants: 1,
      max: 4,
    });
  });

  it("refuses --since-clean without one --of step, or with --all-runs", async () => {
    const cwd = pkgDir({});
    const file = log([start, holistic("2026-10-01T00:10:00Z", "FAIL", 1)]);
    const value = await run(
      [
        "counters",
        "route",
        "--name=X",
        "--value=1",
        `--file=${file}`,
        "--workflow=build",
        "--point=build.verify",
        "--since-clean",
      ],
      cwd,
    );
    expect(value.code).toBe(2);
    expect(value.out).toBe("");
    expect((await route(file, cwd, "--since-clean", "--all-runs")).code).toBe(2);
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

  it("a round with no count reports unknown and no recommendation", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 5, "a"),
      fix("2026-10-01T00:20:00Z", "STANDARD"),
      done("build", "build-plan-verify", "2026-10-01T00:30:00Z", { parentSha: "b", group: 1 }),
    ]);
    const r = await progress(file);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ counts: "5 → ?", trend: "unknown", recommend: null });
  });

  const scoped = (at: string, scope: string, failures: number | null, sha: string) =>
    done("build", "build-plan-verify", at, {
      scope,
      parentSha: sha,
      group: 1,
      ...(failures === null ? {} : { failures }),
    });
  const GATE = "pnpm bkit:gate:static-unit";

  it("does not compare a CI round with a local gate round", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      scoped("2026-10-01T00:10:00Z", "ci:123", 3, "a"),
      scoped("2026-10-01T00:30:00Z", GATE, 3, "b"),
    ]);
    const r = await progress(file);
    expect(r.json).toMatchObject({ trend: "unknown", recommend: null });
  });

  it("compares the last round with the earliest round of the same scope", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      scoped("2026-10-01T00:10:00Z", "ci:123", 2, "a"),
      scoped("2026-10-01T00:20:00Z", GATE, 5, "b"),
      scoped("2026-10-01T00:30:00Z", GATE, 2, "c"),
    ]);
    const r = await progress(file);
    expect(r.json).toMatchObject({ trend: "closing", recommend: "try-again" });
  });

  it("measures minutesPerRound over all rounds, not only the compared same-scope ones", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      scoped("2026-10-01T00:10:00Z", "ci:123", 2, "a"),
      scoped("2026-10-01T00:20:00Z", GATE, 5, "b"),
      scoped("2026-10-01T00:50:00Z", GATE, 2, "c"),
    ]);
    const r = await progress(file);
    expect(r.json.minutesPerRound).toBe(20);
  });

  it("reports each round's scope", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      scoped("2026-10-01T00:10:00Z", "ci:123", 2, "a"),
      verify("2026-10-01T00:30:00Z", 2, "b"),
    ]);
    const r = await progress(file);
    expect(r.json.rounds.map((x: { scope: string | null }) => x.scope)).toEqual(["ci:123", null]);
  });

  it("judges codeChanged between the compared same-scope rounds", async () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-counters-git-"));
    dirs.push(repo);
    const sh = (...a: string[]) =>
      spawnSync("git", a, { cwd: repo, encoding: "utf-8" }).stdout.trim();
    const commit = (m: string) =>
      sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", m);
    sh("init", "-q");
    commit("a");
    const a = sh("rev-parse", "HEAD");
    fs.writeFileSync(path.join(repo, "src.ts"), "x\n");
    sh("add", "-A");
    commit("src");
    const b = sh("rev-parse", "HEAD");
    const logs = path.join(repo, "docs", "plans", "202610", "logs", "1-x");
    fs.mkdirSync(logs, { recursive: true });
    fs.writeFileSync(path.join(logs, "note.md"), "log only\n");
    sh("add", "-A");
    commit("logs");
    const c = sh("rev-parse", "HEAD");
    const file = path.join(logs, "status.jsonl");
    fs.writeFileSync(
      file,
      [
        started("build", "2026-10-01T00:00:00Z"),
        scoped("2026-10-01T00:10:00Z", "ci:123", 9, a),
        scoped("2026-10-01T00:20:00Z", GATE, 5, b),
        scoped("2026-10-01T00:30:00Z", GATE, 2, c),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const r = await progress(file);
    expect(r.json).toMatchObject({ codeChanged: false, trend: "stuck" });
  });

  it("trendLine names an unknown count instead of claiming no fewer failures", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 5, "a"),
      done("build", "build-plan-verify", "2026-10-01T00:30:00Z", { parentSha: "b", group: 1 }),
    ]);
    const r = await progress(file);
    expect(r.json.trendLine).toContain("recorded no count");
    expect(r.json.trendLine).not.toContain("no fewer");
  });

  it("trendLine says the rounds ran different tests", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      scoped("2026-10-01T00:10:00Z", "ci:123", 3, "a"),
      scoped("2026-10-01T00:30:00Z", GATE, 3, "b"),
    ]);
    const r = await progress(file);
    expect(r.json.trendLine).toContain("ran different tests");
  });

  it("trendLine for a fall without a code change says no source code changed", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 5, "nope1"),
      verify("2026-10-01T00:30:00Z", 2, "nope2"),
    ]);
    const base = (await progress(file)).json;
    expect(base.codeChanged).toBeNull();
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-counters-git-"));
    dirs.push(repo);
    const sh = (...a: string[]) =>
      spawnSync("git", a, { cwd: repo, encoding: "utf-8" }).stdout.trim();
    sh("init", "-q");
    sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "a");
    const a = sh("rev-parse", "HEAD");
    const logs = path.join(repo, "docs", "plans", "202610", "logs", "1-x");
    fs.mkdirSync(logs, { recursive: true });
    fs.writeFileSync(path.join(logs, "note.md"), "log only\n");
    sh("add", "-A");
    sh("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "logs");
    const b = sh("rev-parse", "HEAD");
    const gitFile = path.join(logs, "status.jsonl");
    fs.writeFileSync(
      gitFile,
      [
        started("build", "2026-10-01T00:00:00Z"),
        verify("2026-10-01T00:10:00Z", 5, a),
        verify("2026-10-01T00:30:00Z", 2, b),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const r = await progress(gitFile);
    expect(r.json.trend).toBe("stuck");
    expect(r.json.trendLine).toContain("no source code changed");
  });

  it("trendLine for the same count states both counts", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 21, "a"),
      fix("2026-10-01T00:20:00Z", "PIVOT"),
      verify("2026-10-01T00:30:00Z", 21, "b"),
    ]);
    const r = await progress(file);
    expect(r.json.trendLine).toContain("(21 → 21)");
  });

  it("trendLine prefers different scopes over a missing count", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      scoped("2026-10-01T00:10:00Z", "ci:123", 2, "a"),
      scoped("2026-10-01T00:30:00Z", GATE, null, "b"),
    ]);
    const r = await progress(file);
    expect(r.json.trendLine).toContain("ran different tests");
    expect(r.json.trendLine).not.toContain("recorded no count");
  });

  it("--since-clean over unscoped holistic rounds still compares them", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      done("build", "build-holistic-check", "2026-10-01T00:05:00Z", {
        failures: 0,
        parentSha: "z",
      }),
      verify("2026-10-01T00:10:00Z", 5, "a"),
      verify("2026-10-01T00:30:00Z", 2, "b"),
    ]);
    const r = await progress(file, "--since-clean");
    expect(r.code).toBe(0);
    expect(r.json.counts).toBe("5 → 2");
    expect(r.json.trend).not.toBe("unknown");
  });

  it("exits 3 on a missing file", async () => {
    expect((await progress("/nonexistent/status.jsonl")).code).toBe(3);
  });
});

describe("loopProgress with a gate", () => {
  const verify = (at: string, attempt: number, failures: number) =>
    done("build", "build-plan-verify", at, {
      failures,
      attempt,
      group: 1,
      parentSha: `sha${attempt}`,
    });
  const gate = (
    at: string,
    attempt: number,
    verdict: string,
    failures: number | null,
    step = "build-group-gate-1",
  ) => ({
    type: "test-run",
    workflow: "build",
    at,
    step,
    attempt,
    run: 1,
    verdict,
    exitCode: verdict === "FAIL" ? 1 : 0,
    failures,
    scope: "gate",
    log: "x.log",
  });
  const progress = (file: string) => ({
    code: 0,
    json: loopProgress(
      file,
      path.dirname(file),
      "build",
      "build-plan-verify",
      "build-plan-gaps-remediate",
      1,
      false,
      "build-group-gate",
    ),
  });

  it("adds the group gate's failing tests to each verify round", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      gate("2026-10-01T00:09:00Z", 1, "FAIL", 3),
      verify("2026-10-01T00:10:00Z", 1, 0),
      gate("2026-10-01T00:29:00Z", 2, "FAIL", 3),
      verify("2026-10-01T00:30:00Z", 2, 0),
    ]);
    const r = progress(file);
    expect(r.code).toBe(0);
    expect(r.json.counts).toBe("3 → 3");
    expect(r.json.gateCounts).toBe("3 → 3");
    expect(r.json.rounds.map((x: { gateFailures?: number | null }) => x.gateFailures)).toEqual([
      3, 3,
    ]);
  });

  it("a red gate row with no failure count makes the round unknown", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 1, 2),
      gate("2026-10-01T00:29:00Z", 2, "FAIL", null),
      verify("2026-10-01T00:30:00Z", 2, 0),
    ]);
    const r = progress(file);
    expect(r.json.counts).toBe("2 → ?");
    expect(r.json.rounds[1].failures).toBeNull();
    expect(r.json.trend).toBe("unknown");
    expect(r.json.recommend).toBeNull();
  });

  it("a red gate row with 0 counted failures makes the round unknown", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 1, 2),
      gate("2026-10-01T00:29:00Z", 2, "FAIL", 0),
      verify("2026-10-01T00:30:00Z", 2, 0),
    ]);
    const r = progress(file);
    expect(r.json.counts).toBe("2 → ?");
    expect(r.json.trend).toBe("unknown");
    expect(r.json.recommend).toBeNull();
  });

  it("a verify round whose gate did not run adds no gate failures", async () => {
    const file = log([
      started("build", "2026-10-01T00:00:00Z"),
      verify("2026-10-01T00:10:00Z", 1, 0),
      gate("2026-10-01T00:29:00Z", 2, "FAIL", 3),
      verify("2026-10-01T00:30:00Z", 2, 0),
    ]);
    const r = progress(file);
    expect(r.json.gateCounts).toBe("0 → 3");
    expect(r.json.counts).toBe("0 → 3");
  });
});

describe("loopTrend", () => {
  const r = (failures?: number) => ({ failures }) as Step;
  it("a fall without a code change is stuck, not closing", () => {
    expect(loopTrend([r(5), r(2)], false)).toBe("stuck");
    expect(loopTrend([r(5), r(2)], true)).toBe("closing");
    expect(loopTrend([r(5)], true)).toBe("first-round");
  });

  it("a missing count is unknown, not stuck", () => {
    expect(loopTrend([r(5), r()], true)).toBe("unknown");
    expect(loopTrend([r(), r(5)], true)).toBe("unknown");
    expect(loopTrend([r(), r()], false)).toBe("unknown");
  });
});

describe("bkit counters max", () => {
  it("returns one point's limit and ask setting, or every point as set", async () => {
    const cwd = pkgDir({ workflows: { debug: { fix: { ask: false, maxAttempts: 4 } } } });
    expect((await run(["counters", "max", "--point=debug.fix"], cwd)).json).toEqual({
      value: 4,
      ask: false,
      limitsFrom: "package.json",
    });
    expect((await run(["counters", "max", "--point=design.grill"], cwd)).json).toEqual({
      value: 6,
      ask: true,
      limitsFrom: "package.json",
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

describe("bkit counters correction", () => {
  const correct = (file: string, scope: string, operation: string, ...extra: string[]) =>
    run([
      "counters",
      "correction",
      `--file=${file}`,
      "--workflow=plan",
      `--scope=${scope}`,
      `--operation=${operation}`,
      ...extra,
    ]);
  const candidates = (file: string) =>
    fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((r) => r["type"] === "correction-candidate");

  it("shares correction budget across candidate operations and honors specific limits", async () => {
    const file = log([started("plan", "2026-11-01T00:00:00Z")]);
    const scope = "ledgers-append:failures:append";

    // Two corrected retries by default, each candidate under a fresh operation id.
    const first = await correct(file, scope, "op-1");
    expect(first.code).toBe(0);
    expect(first.json).toMatchObject({ allowed: true, used: 1, limit: 2, remaining: 1 });
    const second = await correct(file, scope, "op-2");
    expect(second.json).toMatchObject({ allowed: true, used: 2, limit: 2, remaining: 0 });

    // A third fresh operation, as a helper or a new tool call would mint, gains nothing.
    const third = await correct(file, scope, "op-3");
    expect(third.code).toBe(1);
    expect(third.json).toMatchObject({ allowed: false, used: 2, limit: 2, remaining: 0 });
    expect(candidates(file).map((r) => r["operation"])).toEqual(["op-1", "op-2"]);

    // Asking again for an operation already counted is a replay: it spends nothing.
    const replay = await correct(file, scope, "op-2");
    expect(replay.code).toBe(0);
    expect(replay.json).toMatchObject({ allowed: true, used: 2, replayed: true });

    // A resume and other counter calls in between reset nothing.
    fs.appendFileSync(
      file,
      `${JSON.stringify({ type: "workflow-meta", workflow: "plan", at: "2026-11-01T00:05:00Z", resumed: true })}\n${JSON.stringify(done("plan", "plan-review", "2026-11-01T00:06:00Z"))}\n`,
    );
    expect((await derive(file, "plan-review", "next")).code).toBe(0);
    const afterResume = await correct(file, scope, "op-4");
    expect(afterResume.code).toBe(1);
    expect(afterResume.json).toMatchObject({ allowed: false, used: 2 });

    // Another scope has its own budget.
    const other = await correct(file, "ledgers-append:knowledge:append", "op-5");
    expect(other.json).toMatchObject({ allowed: true, used: 1, limit: 2 });

    // A route with a stricter limit of one never gains a second correction.
    const strict = "ledgers-append:decisions:append";
    expect((await correct(file, strict, "op-a", "--limit=1")).json).toMatchObject({
      allowed: true,
      used: 1,
      limit: 1,
      remaining: 0,
    });
    const denied = await correct(file, strict, "op-b", "--limit=1");
    expect(denied.code).toBe(1);
    expect(denied.json).toMatchObject({ allowed: false, used: 1, limit: 1 });
    // Asking again under yet another operation id still gains nothing.
    expect((await correct(file, strict, "op-c", "--limit=1")).code).toBe(1);

    // A limit of zero permits no correction at all.
    const none = await correct(file, "ledgers-append:roadmap:append", "op-z", "--limit=0");
    expect(none.code).toBe(1);
    expect(none.json).toMatchObject({ allowed: false, used: 0, limit: 0 });
  });

  it("refuses a reused correction candidate id with different rows", async () => {
    const file = log([started("plan", "2026-11-01T00:00:00Z")]);
    const scope = "ledgers-append:failures:append";
    const withRows = (operation: string, hash: string) =>
      correct(file, scope, operation, `--request-hash=${hash}`);

    // The first candidate under op-b is spent once.
    const first = await withRows("op-b", "hash-1");
    expect(first.code).toBe(0);
    expect(first.json).toMatchObject({ allowed: true, used: 1, limit: 2, remaining: 1 });

    // The same id with the same request is a free replay.
    const replay = await withRows("op-b", "hash-1");
    expect(replay.code).toBe(0);
    expect(replay.json).toMatchObject({ allowed: true, used: 1, replayed: true });

    // The same id carrying other rows is refused and writes nothing: it is no replay and no new spend.
    const changed = await withRows("op-b", "hash-2");
    expect(changed.code).toBe(1);
    expect(changed.json).toMatchObject({ allowed: false });
    expect(changed.json).not.toMatchObject({ replayed: true });
    expect(candidates(file)).toHaveLength(1);

    // Distinct requests under their own ids spend the budget, and the limit then holds.
    const second = await withRows("op-c", "hash-3");
    expect(second.json).toMatchObject({ allowed: true, used: 2, remaining: 0 });
    const final = await withRows("op-d", "hash-4");
    expect(final.code).toBe(1);
    expect(final.json).toMatchObject({ allowed: false, used: 2, limit: 2, remaining: 0 });
    expect(candidates(file)).toHaveLength(2);
  });
});
