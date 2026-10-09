import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { THRESHOLDS } from "./counters";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(argv, COMMANDS, {
    classicVerbs: new Set(),
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
    expect((await route("3", "3")).json).toEqual({ exceeded: false, next: "step-8", max: 3 });
    expect((await route("1", "3")).code).toBe(0);
  });

  it("exits 1 one over the cap, naming the counter on stderr", async () => {
    const r = await route("4", "3");
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ exceeded: true, next: "failure-path", max: 3 });
    expect(r.err).toContain("counter VERIFY_ATTEMPT exceeded max=3 (value=4)");
  });

  it("a max of 0 lets value 0 through and stops value 1", async () => {
    expect((await route("0", "0")).code).toBe(0);
    expect((await route("1", "0")).code).toBe(1);
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
    const r = await run([
      "counters",
      "route",
      "--name=x",
      "--value=4",
      "--limit=MAX_VERIFY_ATTEMPT",
    ]);
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ exceeded: true, next: null, max: 3 });
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

describe("bkit counters max", () => {
  it("returns one threshold or all of them", async () => {
    expect((await run(["counters", "max", "--name=MAX_DEV_DISPATCH_ATTEMPTS"])).json).toEqual({
      value: 3,
    });
    expect((await run(["counters", "max"])).json).toEqual({ thresholds: THRESHOLDS });
  });

  it("every threshold is a non-negative integer, and every attempt cap is at least 1", () => {
    for (const [name, value] of Object.entries(THRESHOLDS)) {
      expect(Number.isInteger(value) && value >= 0, name).toBe(true);
      if (name !== "MAX_CHALLENGE_REMEDIATE_ATTEMPT") expect(value, name).toBeGreaterThanOrEqual(1);
    }
  });

  it("bkit-cloud.yml (both copies) declares MAX_DEV_DISPATCH_ATTEMPTS equal to THRESHOLDS", () => {
    for (const rel of [
      "../../../../.github/workflows/bkit-cloud.yml",
      "../../../templates/.github/workflows/bkit-cloud.yml",
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
