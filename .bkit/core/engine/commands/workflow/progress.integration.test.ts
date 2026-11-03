import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { gatePackage, useGateRunner } from "../../../../../vitest.gate-fixture";
import { runCommand } from "../lib";
import { COMMANDS } from "../registry";

vi.setConfig({ testTimeout: 30_000 });
useGateRunner();

const FID = "825-progress";
const MONTH = "202611";
const LOG = `docs/plans/${MONTH}/logs/${FID}`;
const STATUS = `${LOG}/status.jsonl`;
const PLAN = `docs/plans/${MONTH}/${FID}-plan.md`;
const dirs: string[] = [];
let tick = 0;
const at = () => new Date(Date.UTC(2026, 10, 1, 0, 0, tick++)).toISOString();
const jsonl = (rows: object[]) => rows.map((row) => `${JSON.stringify(row)}\n`).join("");
const git = (cwd: string, ...args: string[]) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
  return result.stdout.trim();
};
const write = (cwd: string, file: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
  fs.writeFileSync(path.join(cwd, file), body);
};
const rowsOf = (cwd: string): Record<string, unknown>[] =>
  fs
    .readFileSync(path.join(cwd, STATUS), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
const domainRows = (cwd: string) => rowsOf(cwd).filter((row) => row.type !== "engine-call");
const started = (workflow: string, limits: Record<string, { ask: boolean; max: number }> = {}) => ({
  type: "workflow-started",
  workflow,
  at: at(),
  limits,
});
const completed = (cwd: string, workflow: string, step: string, extra: object = {}) => ({
  type: "step-done",
  workflow,
  step,
  status: "DONE",
  at: at(),
  parentSha: git(cwd, "rev-parse", "HEAD"),
  artifacts: [],
  ...extra,
});

function repo(workflow = "build", limits: Record<string, { ask: boolean; max: number }> = {}) {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-progress-")));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", `feat/${FID}`);
  git(cwd, "config", "user.email", "test@example.invalid");
  git(cwd, "config", "user.name", "test");
  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
  write(
    cwd,
    "package.json",
    JSON.stringify({
      ...gatePackage,
      name: "progress-fixture",
      private: true,
      bkit: { tracker: { default: "none" } },
    }),
  );
  write(cwd, ".bkit/version", JSON.stringify({ pinnedVersion: "6.0.0" }));
  write(cwd, STATUS, jsonl([started(workflow, limits)]));
  return cwd;
}

function plan(cwd: string, groups: number[]) {
  write(
    cwd,
    PLAN,
    groups
      .map((group, index) =>
        [
          `<!-- bkit:group ${group} start -->`,
          `### TASK GROUP ${group}: Group ${group}`,
          `<!-- bkit:task ${index + 1} start -->`,
          `- [ ] **TASK ${index + 1}:** Implement behavior`,
          "  - **UPDATE:** `source.ts`: behavior.",
          "  - **DONE WHEN:** The behavior exists.",
          "  - **TEST FIRST:** n/a — documentation only.",
          `<!-- bkit:task ${index + 1} end -->`,
          `<!-- bkit:group ${group} end -->`,
        ].join("\n"),
      )
      .join("\n\n"),
  );
}

async function run(cwd: string, args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...args, "--json"], COMMANDS, {
    cwd,
    classicVerbs: new Set(),
    io: { stdout: (text) => out.push(text), stderr: (text) => err.push(text) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, out, err: err.join("") };
}

const doneArgs = (workflow: string, step: string, ...extra: string[]) => [
  "steps",
  "done",
  `--file=${STATUS}`,
  `--workflow=${workflow}`,
  `--step=${step}`,
  "--commit=none",
  ...extra,
];

function loopGroup(group?: number) {
  return group === undefined
    ? { flags: [], fields: {}, suffix: "" }
    : { flags: [`--group=${group}`], fields: { group }, suffix: " · Group 1 of 1" };
}

function shipping() {
  const cwd = repo("ship");
  git(cwd, "branch", "-m", "dev");
  write(cwd, ".gitignore", ".worktrees/\ntmp/\n");
  git(cwd, "add", "-A");
  git(cwd, "commit", "-qm", "fixture");
  const remote = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-progress-remote-")));
  dirs.push(remote);
  git(remote, "init", "-q", "--bare");
  git(cwd, "remote", "add", "origin", remote);
  git(cwd, "push", "-q", "origin", "dev");
  const worktree = path.join(cwd, ".worktrees", FID);
  git(cwd, "worktree", "add", "-q", worktree, "-b", `feat/${FID}`);
  const outbox = path.join(cwd, ".git", "bkit-outbox", FID);
  write(cwd, path.relative(cwd, path.join(outbox, ".worktree-owned")), "");
  return { cwd, remote, worktree, outbox };
}

function invalidInput(kind: string) {
  const cwd = repo();
  const file = path.join(cwd, STATUS);
  if (kind === "malformed-plan")
    write(cwd, PLAN, "<!-- bkit:group 1 start -->\n<!-- bkit:task 1 start -->\n");
  if (kind === "unreadable-plan") fs.mkdirSync(path.join(cwd, PLAN), { recursive: true });
  if (kind === "malformed-status") fs.appendFileSync(file, "not-json\n");
  if (kind === "unreadable-status") {
    fs.rmSync(file);
    fs.mkdirSync(file);
    return {
      cwd,
      snapshot: () => fs.statSync(file).isDirectory(),
      journals: () => 0,
      expectedJournals: 0,
    };
  }
  return {
    cwd,
    snapshot: () =>
      fs
        .readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => !line.includes('"engine-call"'))
        .join("\n"),
    journals: () =>
      fs
        .readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => line.includes('"engine-call"')).length,
    expectedJournals: 1,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe("workflow progress command wiring", () => {
  it("progress uses saved cross-run soak attempts and grants", async () => {
    const cwd = repo("debug", { "debug.soak": { ask: true, max: 3 } });
    fs.appendFileSync(
      path.join(cwd, STATUS),
      jsonl([
        {
          type: "allowance-granted",
          workflow: "debug",
          point: "debug.soak",
          at: at(),
        },
        { type: "workflow-done", workflow: "debug", at: at() },
        started("debug", { "debug.soak": { ask: true, max: 3 } }),
      ]),
    );
    const result = await run(
      cwd,
      doneArgs("debug", "debug-failure-soak", "--attempt=1", "--field=soakAttempt=4"),
    );
    expect(result.code).toBe(0);
    expect(result.json.progressLine).toBe(
      "Progress: ███████░░░ 73% · Step 8/11 Failure Remediate Soak · Attempt 4 of 6",
    );
  });

  it("progress refuses contextless or mismatched numeric gates", async () => {
    const cwd = repo();
    for (const [step, number] of [
      ["unrecognized-bookkeeping", 16],
      ["build-close-workflow", 16],
      ["build-start-workflow", 16],
    ] as const) {
      const result = await run(cwd, [
        "steps",
        "gate",
        "--workflow=build",
        `--step=${step}`,
        `--progress-number=${number}`,
      ]);
      expect.soft(result.code, step).not.toBe(0);
      expect.soft(result.json?.progressLine, step).toBeUndefined();
    }
    expect(domainRows(cwd)).toHaveLength(1);
  });

  it("progress reads fresh plan groups", async () => {
    const cwd = repo();
    plan(cwd, [1, 5]);
    const first = await run(
      cwd,
      doneArgs("build", "build-plan-verify", "--group=5", "--attempt=1"),
    );
    expect(first.code).toBe(0);
    expect(first.json.progressLine).toBe(
      "Progress: ██████░░░░ 58% · Step 8/16 Plan Verify · Group 2 of 2",
    );
    plan(cwd, [1, 5, 9]);
    const second = await run(
      cwd,
      doneArgs("build", "build-plan-verify", "--group=5", "--attempt=1"),
    );
    expect(second.code).toBe(0);
    expect(second.json.progressLine).toBe(
      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3",
    );
    expect(domainRows(cwd).filter((row) => row.type === "step-done")).toHaveLength(2);
    expect(domainRows(cwd).some((row) => "progressLine" in row)).toBe(false);
  });

  it("progress resumes from saved run", async () => {
    const cwd = repo("build", { "build.verify": { ask: true, max: 3 } });
    plan(cwd, [1, 2, 3]);
    const saved = jsonl([
      started("build", { "build.verify": { ask: true, max: 99 } }),
      completed(cwd, "build", "build-plan-verify", { attempt: 17, group: 2 }),
      { type: "workflow-done", workflow: "build", at: at() },
      started("build", { "build.verify": { ask: true, max: 3 } }),
      completed(cwd, "build", "build-plan-verify", { attempt: 1, group: 2 }),
    ]);
    write(cwd, STATUS, saved);
    const args = doneArgs("build", "build-plan-verify", "--group=2", "--attempt=next");
    const first = await run(cwd, args);
    expect(first.code).toBe(0);
    expect(first.json.progressLine).toBe(
      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3 · Attempt 2 of 3",
    );
    write(cwd, STATUS, saved);
    write(
      cwd,
      "package.json",
      JSON.stringify({
        bkit: { workflows: { build: { verify: { ask: true, maxAttempts: 99 } } } },
      }),
    );
    const resumed = await run(cwd, args);
    expect(resumed.code).toBe(0);
    expect(resumed.json.progressLine).toBe(first.json.progressLine);
    expect(resumed.json.row.attempt).toBe(2);
  });

  it("progress loop attempts and grants", async () => {
    const cases = [
      {
        workflow: "debug",
        step: "debug-failure-remediate",
        point: "debug.fix",
        title: "Failure Remediate",
        number: 7,
        total: 11,
        percent: 64,
        bar: "██████░░░░",
      },
      {
        workflow: "debug",
        step: "debug-failure-soak",
        point: "debug.soak",
        title: "Failure Remediate Soak",
        number: 8,
        total: 11,
        percent: 73,
        bar: "███████░░░",
      },
      {
        workflow: "ship",
        step: "ship-merge-pr",
        point: "ship.merge",
        title: "Merge Gate + Merge PR",
        number: 10,
        total: 14,
        percent: 71,
        bar: "███████░░░",
      },
      {
        workflow: "build",
        step: "build-plan-verify",
        point: "build.verify",
        title: "Plan Verify",
        number: 8,
        total: 16,
        percent: 50,
        bar: "█████░░░░░",
        group: 1,
      },
      {
        workflow: "build",
        step: "build-run-tests",
        point: "build.tests",
        title: "Run Tests",
        number: 12,
        total: 16,
        percent: 75,
        bar: "████████░░",
      },
      {
        workflow: "build",
        step: "build-challenge",
        point: "build.challenge",
        title: "Build Challenge",
        number: 11,
        total: 16,
        percent: 69,
        bar: "███████░░░",
      },
    ];
    for (const item of cases) {
      const cwd = repo(item.workflow, { [item.point]: { ask: true, max: 3 } });
      const group = loopGroup(item.group);
      fs.appendFileSync(
        path.join(cwd, STATUS),
        jsonl([
          completed(cwd, item.workflow, item.step, { attempt: 1, ...group.fields }),
          {
            type: "allowance-granted",
            workflow: item.workflow,
            point: item.point,
            at: at(),
            ...group.fields,
          },
        ]),
      );
      const result = await run(
        cwd,
        doneArgs(item.workflow, item.step, "--attempt=next", ...group.flags),
      );
      expect(result.code, item.step).toBe(0);
      expect(result.json.progressLine, item.step).toBe(
        `Progress: ${item.bar} ${item.percent}% · Step ${item.number}/${item.total} ${item.title}${group.suffix} · Attempt 2 of 6`,
      );
      const max = await run(cwd, [
        "counters",
        "max",
        `--file=${STATUS}`,
        `--workflow=${item.workflow}`,
        `--point=${item.point}`,
        ...group.flags,
      ]);
      expect(max.code).toBe(0);
      expect(max.json.value).toBe(6);
    }
  });

  it("progress specialized completion producers", async () => {
    const contextCwd = repo("debug");
    write(contextCwd, ".agents/context.md", "# Context\n<!-- bkit:end -->\n");
    write(contextCwd, `${LOG}/context-related-1.md`, "No related issues.\n");
    const context = await run(contextCwd, [
      "context",
      "finalise",
      `--fid=${FID}`,
      `--month=${MONTH}`,
      "--attempt=1",
      `--file=${STATUS}`,
      "--record",
      "--message=chore(825-progress): context",
    ]);
    expect(context.code).toBe(0);
    expect
      .soft(context.json.progressLine)
      .toBe("Progress: ████░░░░░░ 36% · Step 4/11 Fetch Context");
    expect(context.out).toHaveLength(1);
    expect(domainRows(contextCwd).filter((row) => row.step === "context-fetch")).toHaveLength(1);

    const dispatchCwd = repo();
    const dispatch = await run(dispatchCwd, [
      "runs",
      "dispatch",
      `--fid=${FID}`,
      "--pr=7",
      `--file=${STATUS}`,
      "--workflow=build",
      "--step=build-close-workflow",
      "--poll-result=err",
      "--attempts=6",
      "--all-errored",
    ]);
    expect(dispatch.json.row).toMatchObject({ step: "build-close-workflow", status: "DONE" });
    expect
      .soft(dispatch.json.progressLine)
      .toBe("Progress: ██████████ 100% · Step 16/16 Close Workflow & Create PR");
    expect(dispatch.out).toHaveLength(1);
    expect(
      domainRows(dispatchCwd).filter((row) => row.step === "build-close-workflow"),
    ).toHaveLength(1);

    const closeCwd = repo("design");
    const close = await run(closeCwd, [
      "workflows",
      "close",
      "--workflow=design",
      `--fid=${FID}`,
      `--month=${MONTH}`,
      `--file=${STATUS}`,
      "--record-step",
    ]);
    expect(close.code).toBe(0);
    expect
      .soft(close.json.progressLine)
      .toBe("Progress: ██████████ 100% · Step 12/12 Close Workflow");
    expect(close.out).toHaveLength(1);
    expect(domainRows(closeCwd).filter((row) => row.step === "design-close-workflow")).toHaveLength(
      1,
    );
    expect(domainRows(closeCwd).at(-1)).toMatchObject({
      type: "workflow-done",
      workflow: "design",
    });

    const ship = shipping();
    const flushed = await run(ship.worktree, [
      "workflows",
      "close",
      "--workflow=ship",
      `--fid=${FID}`,
      `--month=${MONTH}`,
      `--file=${STATUS}`,
      "--record-step",
      "--flush",
      "--pr-number=7",
      `--squash-sha=${git(ship.worktree, "rev-parse", "HEAD")}`,
      `--outbox=${ship.outbox}`,
      `--branch=feat/${FID}`,
    ]);
    expect(flushed.code).toBe(0);
    expect
      .soft(flushed.json.progressLine)
      .toBe("Progress: ██████████ 100% · Step 14/14 Close Workflow");
    expect(flushed.out).toHaveLength(1);
    expect(fs.existsSync(ship.worktree)).toBe(false);
    const landed = git(ship.remote, "show", `dev:${STATUS}`)
      .split("\n")
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(landed.filter((row) => row.step === "ship-close-workflow")).toHaveLength(1);
  });

  it("progress accepts the ship base-check regression guard gate", async () => {
    const cwd = repo("ship");
    fs.appendFileSync(
      path.join(cwd, STATUS),
      jsonl([completed(cwd, "ship", "ship-regression-guard")]),
    );
    const before = domainRows(cwd);
    const result = await run(cwd, [
      "steps",
      "gate",
      "--workflow=ship",
      `--file=${STATUS}`,
      "--step=ship-regression-guard",
      "--progress-number=3",
      "--placeholder=BASE_PATH=A",
    ]);
    expect(result.code).toBe(0);
    expect(result.json?.progressLine).toBe("Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check");
    expect(domainRows(cwd)).toEqual(before);
  });

  it("progress gate only completions", async () => {
    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
    vi.stubEnv("GIT_EXEC_PATH", "");
    const cwd = repo("ship");
    const setup = completed(cwd, "ship", "ship-worktree-setup");
    const book = completed(cwd, "ship", "ship-bookkeeping-push");
    fs.appendFileSync(path.join(cwd, STATUS), jsonl([setup, book]));
    const before = domainRows(cwd);
    for (const [step, number, expected] of [
      ["ship-worktree-setup", "3", "Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check"],
      ["ship-bookkeeping-push", "9", "Progress: ██████░░░░ 64% · Step 9/14 Re-validate"],
    ]) {
      const result = await run(cwd, [
        "steps",
        "gate",
        "--workflow=ship",
        `--file=${STATUS}`,
        `--step=${step}`,
        `--progress-number=${number}`,
      ]);
      expect.soft(result.code).toBe(0);
      expect.soft(result.json?.progressLine).toBe(expected);
      expect(domainRows(cwd)).toEqual(before);
    }
    expect(
      rowsOf(cwd)
        .filter((row) => row.type === "engine-call")
        .filter((row) => row.verb === "gate"),
    ).toHaveLength(2);

    const firstCwd = repo();
    const lock = await run(firstCwd, [
      "locks",
      "acquire",
      "--kind=workflow",
      "--workflow=build",
      `--fid=${FID}`,
      `--month=${MONTH}`,
    ]);
    expect(lock.code).toBe(0);
    const startBefore = domainRows(firstCwd);
    const first = await run(firstCwd, [
      "steps",
      "gate",
      "--workflow=build",
      "--step=build-start-workflow",
      `--fid=${FID}`,
      `--month=${MONTH}`,
      `--token=${lock.json.token}`,
      "--issue=825",
      "--progress-number=1",
    ]);
    expect.soft(first.code).toBe(0);
    expect
      .soft(first.json?.progressLine)
      .toBe("Progress: █░░░░░░░░░ 6% · Step 1/16 Start Workflow");
    expect(domainRows(firstCwd)).toEqual(startBefore);
    const released = await run(firstCwd, [
      "locks",
      "release",
      "--kind=workflow",
      "--workflow=build",
      `--fid=${FID}`,
      `--month=${MONTH}`,
      `--token=${lock.json.token}`,
    ]);
    expect(released.code).toBe(0);
  });

  it("progress normal debug attempts span runs", async () => {
    const cwd = repo("debug", { "debug.fix": { ask: true, max: 3 } });
    write(
      cwd,
      STATUS,
      jsonl([
        started("debug", { "debug.fix": { ask: true, max: 3 } }),
        completed(cwd, "debug", "debug-failure-remediate", { attempt: 1 }),
        { type: "workflow-done", workflow: "debug", at: at() },
        started("debug", { "debug.fix": { ask: true, max: 3 } }),
        { type: "workflow-meta", workflow: "debug", at: at(), debugMode: "NORMAL" },
      ]),
    );
    const result = await run(cwd, doneArgs("debug", "debug-failure-remediate", "--attempt=1"));
    expect(result.code).toBe(0);
    expect(result.json.row).toMatchObject({ step: "debug-failure-remediate", attempt: 1 });
    expect(result.json.progressLine).toBe(
      "Progress: ██████░░░░ 64% · Step 7/11 Failure Remediate · Attempt 2 of 3",
    );
    expect(domainRows(cwd).filter((row) => row.step === "debug-failure-remediate")).toHaveLength(2);
  });

  it("progress reuses saved soak counter on later completions", async () => {
    const cwd = repo("debug", { "debug.soak": { ask: true, max: 3 } });
    fs.appendFileSync(
      path.join(cwd, STATUS),
      jsonl([
        { type: "workflow-meta", workflow: "debug", at: at(), debugMode: "SOAK" },
        completed(cwd, "debug", "debug-failure-soak", { attempt: 1, soakAttempt: 4 }),
        { type: "allowance-granted", workflow: "debug", point: "debug.soak", at: at() },
      ]),
    );
    const result = await run(
      cwd,
      doneArgs("debug", "debug-run-tests", "--attempt=2", "--field=scope=unit"),
    );
    expect(result.code).toBe(0);
    expect(result.json.row).toMatchObject({ step: "debug-run-tests", attempt: 2, scope: "unit" });
    expect(result.json.progressLine).toBe(
      "Progress: ███░░░░░░░ 27% · Step 3/11 Run Tests · Attempt 4 of 6",
    );
    expect(domainRows(cwd).filter((row) => row.step === "debug-failure-soak")).toEqual([
      expect.objectContaining({ soakAttempt: 4 }),
    ]);
  });

  it("progress challenge budget follows round rather than report attempt", async () => {
    const cwd = repo("build", { "build.challenge": { ask: true, max: 2 } });
    fs.appendFileSync(
      path.join(cwd, STATUS),
      jsonl([completed(cwd, "build", "build-challenge", { attempt: 1, round: 1 })]),
    );
    const result = await run(
      cwd,
      doneArgs("build", "build-challenge", "--attempt=2", "--field=round=1"),
    );
    expect(result.code).toBe(0);
    expect(result.json.row).toMatchObject({ step: "build-challenge", attempt: 2, round: 1 });
    expect(result.json.progressLine).toBe("Progress: ███████░░░ 69% · Step 11/16 Build Challenge");
    expect(domainRows(cwd).filter((row) => row.step === "build-challenge")).toHaveLength(2);
  });

  it("progress excludes noncompletions", async () => {
    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
    vi.stubEnv("GIT_EXEC_PATH", "");
    const cwd = repo();
    for (const step of ["build-decision", "build-tests-red", "unrecognized-bookkeeping"]) {
      const result = await run(cwd, doneArgs("build", step, "--attempt=1"));
      expect(result.code).toBe(0);
      expect(result.json.progressLine).toBeUndefined();
    }
    const pause = await run(cwd, [
      "status",
      "row",
      "--workflow=build",
      `--file=${STATUS}`,
      "--type=owner-pause",
      "--field=reason=decision",
    ]);
    expect(pause.code).toBe(0);
    expect(pause.json?.progressLine).toBeUndefined();
    const gate = await run(cwd, [
      "steps",
      "gate",
      "--workflow=build",
      "--step=build-decision",
      `--file=${STATUS}`,
      "--attempt=1",
    ]);
    expect(gate.code).toBe(0);
    expect(gate.json.progressLine).toBeUndefined();
    const failed = await run(
      cwd,
      doneArgs("build", "build-plan-verify", "--status=FAILED", "--group=1"),
    );
    expect(failed.code).toBe(0);
    expect(failed.json.progressLine).toBeUndefined();

    for (const bad of [
      "malformed-plan",
      "unreadable-plan",
      "malformed-status",
      "unreadable-status",
    ]) {
      const invalid = invalidInput(bad);
      const broken = invalid.cwd;
      const head = git(broken, "rev-parse", "HEAD");
      const before = invalid.snapshot();
      const result = await run(broken, [
        "steps",
        "done",
        "--workflow=build",
        "--step=build-plan-verify",
        `--file=${STATUS}`,
        "--group=1",
        "--message=chore(825-progress): verify",
      ]);
      expect(result.code, bad).not.toBe(0);
      expect(result.json?.progressLine, bad).toBeUndefined();
      expect(git(broken, "rev-parse", "HEAD"), bad).toBe(head);
      expect(invalid.snapshot(), bad).toEqual(before);
      expect(invalid.journals(), bad).toBe(invalid.expectedJournals);
    }

    const refused = repo();
    write(refused, ".git/hooks/pre-commit", "#!/bin/sh\nexit 1\n");
    fs.chmodSync(path.join(refused, ".git/hooks/pre-commit"), 0o755);
    const head = git(refused, "rev-parse", "HEAD");
    const before = domainRows(refused);
    const refusal = await run(refused, [
      "steps",
      "done",
      "--workflow=build",
      "--step=build-plan-verify",
      `--file=${STATUS}`,
      "--group=1",
      "--message=chore(825-progress): verify",
    ]);
    expect(refusal.code).not.toBe(0);
    expect(refusal.json?.progressLine).toBeUndefined();
    expect(domainRows(refused)).toEqual(before);
    expect(git(refused, "rev-parse", "HEAD")).toBe(head);
    expect(rowsOf(refused).some((row) => row.type === "engine-call")).toBe(true);
  });
});
