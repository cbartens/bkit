import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { validate } from "../../bkit-telemetry";
import { runCommand } from "../lib";
import { locksCommand } from "./locks";
import { legacyEvents, workflowsCommand } from "./workflows";

// Real git repos and worktrees per test; a busy machine needs more than the default 5s.
vi.setConfig({ testTimeout: 30_000 });

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const FID = "12-export-csv";
const M = "202607";
const REL = `docs/plans/${M}/logs/${FID}`;

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

function repo() {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-")));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", "dev");
  git(cwd, "remote", "add", "origin", "https://github.com/cbartens/bkit.git");
  fs.mkdirSync(path.join(cwd, REL), { recursive: true });
  fs.mkdirSync(path.join(cwd, ".bkit"), { recursive: true });
  fs.writeFileSync(path.join(cwd, ".bkit/version"), JSON.stringify({ pinnedVersion: "4.6.3" }));
  fs.writeFileSync(path.join(cwd, "a.txt"), "base\n");
  git(cwd, "add", "-A");
  git(cwd, "commit", "-qm", "base");
  return cwd;
}

const write = (cwd: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};
const jsonl = (rows: object[]) => rows.map((r) => `${JSON.stringify(r)}\n`).join("");
const rows = (file: string) =>
  fs
    .readFileSync(file, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Record<string, unknown>);
const statusOf = (cwd: string) => path.join(cwd, REL, "status.jsonl");

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(argv, [workflowsCommand, locksCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const wf = (verb: string, workflow: string, ...extra: string[]) => [
  "workflows",
  verb,
  `--workflow=${workflow}`,
  `--fid=${FID}`,
  ...extra,
];
const sha = (n: number) => String(n).padStart(40, "0");

// ---------------------------------------------------------------------------

describe("bkit workflows start", () => {
  it("takes the lock and opens run 1 with a workflow-started row carrying HEAD", async () => {
    const cwd = repo();
    const r = await run(cwd, wf("start", "build"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ resumed: false, migrated: false, run: 1 });
    expect(r.json.lock.month).toBe(M);
    expect(fs.existsSync(r.json.lock.path)).toBe(true);
    expect(rows(statusOf(cwd))).toEqual([
      {
        type: "workflow-started",
        workflow: "build",
        at: r.json.row.at,
        parentSha: git(cwd, "rev-parse", "HEAD"),
      },
    ]);
  });

  it("does not open a new run when resuming the same workflow's IN_PROGRESS run", async () => {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([{ type: "workflow-started", workflow: "build", at: "2026-07-01T00:00:00Z" }]),
    );
    const lock = await run(cwd, [
      "locks",
      "acquire",
      "--kind=workflow",
      "--workflow=build",
      `--fid=${FID}`,
    ]);
    const r = await run(cwd, wf("start", "build", "--lock-held", `--token=${lock.json.token}`));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ resumed: true, row: null, run: 1 });
    expect(rows(statusOf(cwd))).toHaveLength(1);
  });

  it("opens the next run after a finished one, and after another workflow's run", async () => {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([
        { type: "workflow-started", workflow: "build", at: "2026-07-01T00:00:00Z" },
        { type: "workflow-done", workflow: "build", at: "2026-07-01T01:00:00Z" },
        { type: "workflow-started", workflow: "debug", at: "2026-07-02T00:00:00Z" },
      ]),
    );
    const r = await run(cwd, wf("start", "build"));
    expect(r.json).toMatchObject({ resumed: false, run: 2 });
  });

  it("writes workflow-started for ship too, in the main checkout with --dev-pushes", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    const r = await run(wt, wf("start", "ship", "--dev-pushes"));
    expect(r.code).toBe(0);
    expect(r.json.file).toBe(statusOf(cwd));
    expect(rows(statusOf(cwd)).at(-1)).toMatchObject({
      type: "workflow-started",
      workflow: "ship",
    });
  });

  it("design / plan / build / debug book in the current worktree", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    const r = await run(wt, wf("start", "design"));
    expect(r.json.file).toBe(statusOf(wt));
    expect(r.json.lock.path).toBe(path.join(cwd, REL, ".lock"));
  });

  it("refuses when the lock is live, writing no row", async () => {
    const cwd = repo();
    write(cwd, `${REL}/.lock`, "2026-07-01T00:00:00Z design\n");
    const r = await run(cwd, wf("start", "build"));
    expect(r.code).toBe(1);
    expect(fs.existsSync(statusOf(cwd))).toBe(false);
  });

  it("--lock-held checks the lock is ours", async () => {
    const cwd = repo();
    expect((await run(cwd, wf("start", "build", "--lock-held"))).code).toBe(6);
    write(cwd, `${REL}/.lock`, "2026-07-01T00:00:00Z design x abc\n");
    expect((await run(cwd, wf("start", "build", "--lock-held"))).code).toBe(6);
    expect((await run(cwd, wf("start", "design", "--lock-held", "--token=zzz"))).code).toBe(6);
    expect((await run(cwd, wf("start", "design", "--lock-held", "--token=abc"))).code).toBe(0);
    expect((await run(cwd, wf("start", "design", "--token=abc"))).code).toBe(2);
  });

  it("rewrites a legacy status.json as status.jsonl first", async () => {
    const cwd = repo();
    const step = {
      step: "build-x",
      status: "DONE",
      at: "2026-07-01T00:10:00Z",
      parentSha: sha(1),
      artifacts: [],
    };
    write(
      cwd,
      `${REL}/status.json`,
      JSON.stringify([
        { workflow: "build", startedAt: "2026-07-01T00:00:00Z", status: "DONE", steps: [step] },
      ]),
    );
    const r = await run(cwd, wf("start", "build"));
    expect(r.json).toMatchObject({ migrated: true, run: 2 });
    expect(rows(statusOf(cwd)).slice(0, 3)).toEqual([
      { type: "workflow-started", workflow: "build", at: "2026-07-01T00:00:00Z" },
      { type: "step-done", workflow: "build", ...step },
      { type: "workflow-done", workflow: "build", at: "2026-07-01T00:10:00Z" },
    ]);
  });

  it("rejects an unknown workflow", async () => {
    expect((await run(repo(), wf("start", "deploy"))).code).toBe(2);
  });
});

describe("legacyEvents", () => {
  it("emits no closing row for an IN_PROGRESS run, and FAILED ends at its start without steps", () => {
    expect(
      legacyEvents([
        { workflow: "a", startedAt: "t1", status: "IN_PROGRESS", steps: [] },
        { workflow: "b", startedAt: "t2", status: "FAILED", steps: [] },
      ]),
    ).toEqual([
      { type: "workflow-started", workflow: "a", at: "t1" },
      { type: "workflow-started", workflow: "b", at: "t2" },
      { type: "workflow-failed", workflow: "b", at: "t2" },
    ]);
  });
});

// ---------------------------------------------------------------------------

describe("bkit workflows fail", () => {
  it("writes workflow-failed, releases its lock, and reports no handover", async () => {
    const cwd = repo();
    await run(cwd, wf("start", "build"));
    const r = await run(cwd, wf("fail", "build", `--month=${M}`));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      rebaseAborted: false,
      sentinels: [],
      handoverNeeded: false,
      lock: { existed: true, released: true, heldBy: null },
    });
    expect(rows(statusOf(cwd)).at(-1)).toMatchObject({
      type: "workflow-failed",
      workflow: "build",
    });
    expect(fs.existsSync(path.join(cwd, REL, ".lock"))).toBe(false);
  });

  it("writes no row when status.jsonl does not exist", async () => {
    const cwd = repo();
    const r = await run(cwd, wf("fail", "design", `--month=${M}`));
    expect(r.code).toBe(0);
    expect(r.json.row).toBeNull();
    expect(fs.existsSync(statusOf(cwd))).toBe(false);
  });

  it("leaves a lock it never got in place (the Step 1 refusal path)", async () => {
    const cwd = repo();
    write(cwd, `${REL}/.lock`, "2026-07-01T00:00:00Z design 12-export-csv abc\n");
    const r = await run(cwd, wf("fail", "build", `--month=${M}`));
    expect(r.code).toBe(0);
    expect(r.json.lock).toMatchObject({ existed: true, released: false });
    expect(fs.existsSync(path.join(cwd, REL, ".lock"))).toBe(true);
  });

  it("aborts a rebase only when one is in progress", async () => {
    const cwd = repo();
    git(cwd, "checkout", "-q", "-b", "other");
    write(cwd, "a.txt", "theirs\n");
    git(cwd, "commit", "-qam", "theirs");
    git(cwd, "checkout", "-q", "dev");
    write(cwd, "a.txt", "ours\n");
    git(cwd, "commit", "-qam", "ours");
    git(cwd, "rebase", "other");
    const gitDir = git(cwd, "rev-parse", "--absolute-git-dir");
    expect(
      fs.existsSync(path.join(gitDir, "rebase-merge")) ||
        fs.existsSync(path.join(gitDir, "rebase-apply")),
    ).toBe(true);
    const r = await run(cwd, wf("fail", "build", `--month=${M}`));
    expect(r.json.rebaseAborted).toBe(true);
    expect(fs.existsSync(path.join(gitDir, "rebase-merge"))).toBe(false);
    expect((await run(cwd, wf("fail", "build", `--month=${M}`))).json.rebaseAborted).toBe(false);
  });

  it("the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree", async () => {
    // `git rebase --abort` resets the tree, discarding an uncommitted append to a
    // tracked status.jsonl — so the abort must run before the row is written.
    const cwd = repo();
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-started", workflow: "build" }]));
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "status");
    git(cwd, "checkout", "-q", "-b", "other");
    write(cwd, "a.txt", "theirs\n");
    git(cwd, "commit", "-qam", "theirs");
    git(cwd, "checkout", "-q", "dev");
    write(cwd, "a.txt", "ours\n");
    git(cwd, "commit", "-qam", "ours");
    git(cwd, "rebase", "other");
    const r = await run(cwd, wf("fail", "build", `--month=${M}`));
    expect(r.json.rebaseAborted).toBe(true);
    expect(rows(statusOf(cwd)).at(-1)).toMatchObject({
      type: "workflow-failed",
      workflow: "build",
    });
  });

  it("clears .rebase-failed inside the worktree it was created in, and says a handover is due", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    write(wt, `${REL}/.rebase-failed`, "");
    const r = await run(cwd, wf("fail", "build", `--month=${M}`));
    expect(r.json.sentinels).toEqual([
      { name: ".rebase-failed", path: path.join(wt, REL, ".rebase-failed") },
    ]);
    expect(r.json.handoverNeeded).toBe(true);
    expect(fs.existsSync(path.join(wt, REL, ".rebase-failed"))).toBe(false);
  });

  it("clears ship's .deferred-blocked under the book root", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    write(cwd, `${REL}/.deferred-blocked`, "");
    const r = await run(wt, wf("fail", "ship", `--month=${M}`, "--dev-pushes"));
    expect(r.json.sentinels).toEqual([
      { name: ".deferred-blocked", path: path.join(cwd, REL, ".deferred-blocked") },
    ]);
    expect(r.json.handoverNeeded).toBe(true);
  });

  it("--max-exceeded says a handover is due without any sentinel", async () => {
    const r = await run(repo(), wf("fail", "build", `--month=${M}`, "--max-exceeded"));
    expect(r.json.handoverNeeded).toBe(true);
  });
});

// ---------------------------------------------------------------------------

describe("bkit workflows close", () => {
  /** A run that started at a fixed past time from `base`, then committed some work. */
  function closable(workflow = "build") {
    const cwd = repo();
    const base = git(cwd, "rev-parse", "HEAD");
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([{ type: "workflow-started", workflow, at: "2020-01-01T00:00:00Z", parentSha: base }]),
    );
    write(
      cwd,
      ".bkit/friction.jsonl",
      jsonl([
        { ts: 1577836801000, kind: "friction", workflow, key: "fr1" },
        { ts: 1577836799000, kind: "friction", workflow, key: "before-start" },
        { ts: 1577836802000, kind: "friction", workflow: "other", key: "other-workflow" },
      ]),
    );
    write(cwd, "a.txt", "base\nline1\n");
    write(cwd, "b.txt", "new\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "work");
    return cwd;
  }

  it("writes workflow-done and schema-valid counter + outcome rows", async () => {
    const cwd = closable();
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    expect(rows(statusOf(cwd)).at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
    const stats = rows(path.join(cwd, ".bkit/stats.jsonl"));
    expect(stats).toHaveLength(2);
    const [counter, outcome] = stats;
    for (const row of stats) expect(validate(row)).toEqual({ ok: true });
    expect(counter).toMatchObject({
      kind: "counter",
      step: "build-close-workflow",
      counterName: "BUILD_ATTEMPT",
      counterValue: 1,
      counterSource: "shell-bus",
      repo: "cbartens/bkit",
      bkitVersion: "4.6.3",
      parentSha: git(cwd, "rev-parse", "HEAD"),
    });
    expect(outcome).toMatchObject({
      kind: "outcome",
      workflow: "build",
      step: "build-close-workflow",
      // a.txt +1, b.txt +1, and the status / friction logs committed with the work (+1, +3)
      linesAdded: 6,
      linesDeleted: 0,
      linesChanged: 6,
      filesChanged: 4,
      frictionAdded: 1,
      deferralsAdded: 0,
      failuresAdded: 0,
      deferrals: 0,
      failures: 0,
      taskCount: 0,
    });
    expect(outcome!.durationSeconds).toBeGreaterThan(0);
    expect(outcome!.prNumber).toBeUndefined();
    expect(outcome!.planSource).toBeUndefined();
    expect(r.json).toMatchObject({
      telemetryWritten: true,
      complyNeeded: true,
      roadmapFoldNeeded: true,
      featureStatus: "BUILT",
    });
    expect(r.json.report.length).toBeGreaterThan(0);
  });

  it("carries planSource from this run's workflow-meta, counts plan tasks and ledger totals", async () => {
    const cwd = closable();
    fs.appendFileSync(
      statusOf(cwd),
      jsonl([
        { type: "workflow-meta", workflow: "build", at: "2019-12-31T00:00:00Z", planSource: "old" },
        {
          type: "workflow-meta",
          workflow: "build",
          at: "2020-01-01T00:00:01Z",
          planSource: "brief",
        },
      ]),
    );
    write(cwd, `docs/plans/${M}/${FID}-plan.md`, "- [ ] one\n- [x] two\n  - [ ] nested\n");
    write(cwd, `docs/plans/${M}/${FID}-plan-2.md`, "- [ ] three\n");
    write(
      cwd,
      "docs/deferrals.jsonl",
      jsonl([
        { kind: "deferral", key: "d1", workflow: "plan", ts: 1 },
        { kind: "deferral", key: "d1", workflow: "plan", ts: 2 },
        { kind: "deferral", key: "d2", workflow: "build", ts: 1577836805000 },
      ]) + "not json\n",
    );
    const r = await run(cwd, wf("close", "build"));
    const outcome = r.json.outcomeRow;
    expect(outcome).toMatchObject({
      planSource: "brief",
      taskCount: 3,
      deferrals: 2,
      deferralsAdded: 1,
    });
  });

  it("always writes the telemetry, whatever the runtime", async () => {
    const cwd = closable("design");
    const r = await run(cwd, wf("close", "design"));
    expect(r.code).toBe(0);
    expect(rows(path.join(cwd, ".bkit/stats.jsonl")).map((x) => x.kind)).toEqual([
      "counter",
      "outcome",
    ]);
    expect(r.json.featureStatus).toBe("DESIGNED");
  });

  it("with no workflow-started row: duration 0, per-run counts omitted, attempt 1", async () => {
    const cwd = repo();
    write(cwd, `${REL}/status.jsonl`, "");
    const r = await run(cwd, wf("close", "debug"));
    expect(r.code).toBe(0);
    expect(r.json.outcomeRow.durationSeconds).toBe(0);
    expect(r.json.outcomeRow).not.toHaveProperty("frictionAdded");
    expect(r.json.counterRow.counterValue).toBe(1);
  });

  it("counts attempts from distinct workflow-started rows (a union merge may duplicate one)", async () => {
    const cwd = closable();
    const first = rows(statusOf(cwd))[0];
    fs.appendFileSync(
      statusOf(cwd),
      jsonl([first!, { type: "workflow-started", workflow: "build", at: "2020-01-02T00:00:00Z" }]),
    );
    expect((await run(cwd, wf("close", "build"))).json.counterRow.counterValue).toBe(2);
  });

  it("an unwritable stats path is logged and never fails the close", async () => {
    const cwd = closable();
    fs.rmSync(path.join(cwd, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".bkit"), "");
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    expect(r.json.telemetryWritten).toBe(false);
    expect(r.err).toContain("[bkit-telemetry] append failed");
    expect(r.json.outcomeRow.bkitVersion).toBe("unknown");
  });

  it("refuses without status.jsonl and writes nothing", async () => {
    const cwd = repo();
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(3);
    expect(fs.existsSync(path.join(cwd, ".bkit/stats.jsonl"))).toBe(false);
  });

  it("ship: prNumber, size of the squash commit, and coverage", async () => {
    const cwd = closable("ship");
    write(cwd, "c.txt", "1\n2\n3\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "squash");
    const squash = git(cwd, "rev-parse", "HEAD");
    write(
      cwd,
      "coverage/unit/coverage-summary.json",
      JSON.stringify({
        total: {
          lines: { pct: 91.5 },
          branches: { pct: 80 },
          functions: { pct: 70 },
          statements: { pct: 90 },
        },
      }),
    );
    write(
      cwd,
      "coverage/e2e/coverage-summary.json",
      JSON.stringify({ total: { lines: { pct: "n/a" } } }),
    );
    const r = await run(
      cwd,
      wf("close", "ship", "--dev-pushes", "--pr-number=42", `--squash-sha=${squash}`),
    );
    expect(r.code).toBe(0);
    expect(r.json.outcomeRow).toMatchObject({
      prNumber: 42,
      linesAdded: 3,
      filesChanged: 1,
      coverage: { unit: { lines: 91.5, branches: 80, functions: 70, statements: 90 } },
    });
    expect(validate(r.json.outcomeRow).ok).toBe(true);
    expect((await run(cwd, wf("close", "ship", "--squash-sha=HEAD"))).code).toBe(2);
  });

  it("lists the feature's docs and this workflow's logs on the ref as links", async () => {
    const cwd = closable("design");
    write(cwd, `docs/plans/${M}/${FID}-design.md`, "d\n");
    write(cwd, `docs/plans/${M}/99-other-design.md`, "d\n");
    write(cwd, `docs/plans/${M}/archive/20260101T000000Z-${FID}-design.md`, "d\n");
    write(cwd, `${REL}/design-summary.md`, "s\n");
    write(cwd, `${REL}/plan-summary.md`, "s\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "docs");
    const r = await run(cwd, wf("close", "design"));
    expect(r.json.artifacts.map((a: { path: string }) => a.path)).toEqual([
      `docs/plans/${M}/${FID}-design.md`,
      `${REL}/design-summary.md`,
    ]);
    expect(r.json.artifactLinks).toBe(
      [
        `- [${FID}-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/${M}/${FID}-design.md)`,
        `- [design-summary.md](https://github.com/cbartens/bkit/blob/dev/${REL}/design-summary.md)`,
      ].join("\n"),
    );
    const other = await run(cwd, wf("close", "design", "--ref=feat/x", "--owner-repo=o/r"));
    expect(other.json.artifacts).toEqual([]);
  });

  it("per-run counts are distinct keys; failures come from docs/failures.jsonl", async () => {
    const cwd = closable();
    fs.appendFileSync(
      path.join(cwd, ".bkit/friction.jsonl"),
      jsonl([{ ts: 1577836801500, kind: "friction", workflow: "build", key: "fr1" }]),
    );
    write(
      cwd,
      "docs/failures.jsonl",
      jsonl([
        { ts: 1, kind: "failure", workflow: "plan", key: "x0" },
        { ts: 1577836803000, kind: "failure", workflow: "build", key: "x1" },
        { ts: 1577836804000, kind: "failure", workflow: "build", key: "x1" },
      ]),
    );
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    expect(r.json.outcomeRow).toMatchObject({ frictionAdded: 1, failures: 2, failuresAdded: 1 });
    expect(validate(r.json.outcomeRow).ok).toBe(true);
  });

  it("absent ledgers still give a schema-valid row with zero per-run counts", async () => {
    const cwd = closable("design");
    fs.rmSync(path.join(cwd, ".bkit/friction.jsonl"));
    const r = await run(cwd, wf("close", "design"));
    expect(r.code).toBe(0);
    expect(r.json.outcomeRow).toMatchObject({
      frictionAdded: 0,
      deferralsAdded: 0,
      failuresAdded: 0,
      deferrals: 0,
      failures: 0,
    });
    expect(validate(r.json.outcomeRow).ok).toBe(true);
  });
});
