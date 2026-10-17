import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { validate } from "../../ledgers/telemetry";
import { runCommand } from "../lib";
import { locksCommand } from "./locks";
import { workflowsCommand } from "./workflows";

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
  // The commands commit too, without the `-c` identity the helper passes.
  git(cwd, "config", "user.email", "t@t");
  git(cwd, "config", "user.name", "t");
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

// ---------------------------------------------------------------------------

describe("bkit workflows start", () => {
  it("takes the lock and opens run 1 with a workflow-started row carrying HEAD", async () => {
    const cwd = repo();
    const r = await run(cwd, wf("start", "build"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ resumed: false, run: 1 });
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
    const at = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const log = jsonl([
      { type: "workflow-started", workflow: "design", at },
      { type: "step-done", workflow: "design", step: "design-context", status: "DONE", at },
    ]);
    write(cwd, `${REL}/status.jsonl`, log);
    write(cwd, `${REL}/.lock`, "2026-07-01T00:00:00Z design\n");
    const r = await run(cwd, wf("start", "build"));
    expect(r.code).toBe(1);
    expect(fs.readFileSync(statusOf(cwd), "utf-8")).toBe(log);
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

  it("rejects an unknown workflow", async () => {
    expect((await run(repo(), wf("start", "deploy"))).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------

describe("bkit workflows fail", () => {
  it("writes workflow-failed, releases its lock, and reports no handover", async () => {
    const cwd = repo();
    const started = await run(cwd, wf("start", "build"));
    const r = await run(
      cwd,
      wf("fail", "build", `--month=${M}`, `--token=${started.json.lock.token}`),
    );
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
    const r = await run(cwd, wf("fail", "design", `--month=${M}`, "--token=t"));
    expect(r.code).toBe(0);
    expect(r.json.row).toBeNull();
    expect(fs.existsSync(statusOf(cwd))).toBe(false);
  });

  it("leaves a lock it never got in place (the Step 1 refusal path)", async () => {
    const cwd = repo();
    write(cwd, `${REL}/.lock`, "2026-07-01T00:00:00Z design 12-export-csv abc\n");
    const r = await run(cwd, wf("fail", "build", `--month=${M}`, "--token=not-abc"));
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
    const r = await run(cwd, wf("fail", "build", `--month=${M}`, "--token=t"));
    expect(r.json.rebaseAborted).toBe(true);
    expect(fs.existsSync(path.join(gitDir, "rebase-merge"))).toBe(false);
    expect(
      (await run(cwd, wf("fail", "build", `--month=${M}`, "--token=t"))).json.rebaseAborted,
    ).toBe(false);
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
    const r = await run(cwd, wf("fail", "build", `--month=${M}`, "--token=t"));
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
    const r = await run(cwd, wf("fail", "build", `--month=${M}`, "--token=t"));
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
    const r = await run(wt, wf("fail", "ship", `--month=${M}`, "--dev-pushes", "--token=t"));
    expect(r.json.sentinels).toEqual([
      { name: ".deferred-blocked", path: path.join(cwd, REL, ".deferred-blocked") },
    ]);
    expect(r.json.handoverNeeded).toBe(true);
  });

  it("--max-exceeded says a handover is due without any sentinel", async () => {
    const r = await run(repo(), wf("fail", "build", `--month=${M}`, "--max-exceeded", "--token=t"));
    expect(r.json.handoverNeeded).toBe(true);
  });

  it("without --token changes nothing: the failure came before Step 1 locked", async () => {
    const cwd = repo();
    const started = await run(cwd, wf("start", "build"));
    write(cwd, `${REL}/.rebase-failed`, "");
    const r = await run(cwd, wf("fail", "build", `--month=${M}`, "--max-exceeded"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ row: null, lock: null, sentinels: [], handoverNeeded: false });
    expect(rows(statusOf(cwd)).at(-1)).toMatchObject({ type: "workflow-started" });
    expect(fs.existsSync(started.json.lock.path)).toBe(true);
    expect(fs.existsSync(path.join(cwd, REL, ".rebase-failed"))).toBe(true);
  });

  it("treats empty --fid / --token / --month (placeholders not held yet) as absent", async () => {
    const r = await run(repo(), [
      "workflows",
      "fail",
      "--workflow=build",
      "--fid=",
      "--token=",
      "--month=",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.row).toBeNull();
    expect((await run(repo(), ["workflows", "fail", "--workflow=build", "--token=t"])).code).toBe(
      2,
    );
  });

  it("computes the bkit:failed label set and its Linear state", async () => {
    const r = await run(repo(), wf("fail", "build", "--label=bkit:build", "--label=bkit:auto"));
    expect(r.json.labels).toEqual(
      expect.arrayContaining(["bkit:build", "bkit:auto", "bkit:failed"]),
    );
    expect(r.json.prState).toBeNull();
    expect(typeof r.json.linearState).toBe("string");
  });

  it("prints the failure comment from --error-file, naming a lock it could not remove", async () => {
    const cwd = repo();
    write(cwd, "tmp/error.md", "tests failed: 3\n\n");
    const r = await run(
      cwd,
      wf(
        "fail",
        "build",
        "--step-number=14",
        "--step-title=Run Tests",
        "--sub-step=2",
        "--error-file=tmp/error.md",
      ),
    );
    expect(r.json.comment).toContain("### Workflow Failure");
    expect(r.json.comment).toContain("Step: 14 — Run Tests; Sub-step: 2");
    expect(r.json.comment).toContain("Error: tests failed: 3");
    expect((await run(cwd, wf("fail", "build"))).json.comment).toBeNull();
  });

  it("a debug run in SOAK mode always needs a handover", async () => {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([
        { type: "workflow-started", workflow: "debug", at: "2026-07-01T00:00:00Z" },
        { type: "workflow-meta", workflow: "debug", at: "2026-07-01T00:00:01Z", debugMode: "SOAK" },
      ]),
    );
    const r = await run(cwd, wf("fail", "debug", `--month=${M}`, "--token=t"));
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
    const all = rows(path.join(cwd, ".bkit/stats.jsonl"));
    // The grader's compliance rows come first: the report below must carry this run's grade.
    expect(all.map((x) => x.kind)).toEqual(["compliance", "compliance", "counter", "outcome"]);
    const stats = all.slice(2);
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
      compliance: 0,
      roadmapFoldNeeded: true,
      featureStatus: "BUILT",
      commit: null,
      comment: null,
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
      "compliance",
      "compliance",
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

// ---------------------------------------------------------------------------

describe("bkit workflows close — commit, outbox, comment", () => {
  function started(workflow = "build") {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([{ type: "workflow-started", workflow, at: "2020-01-01T00:00:00Z" }]),
    );
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "start");
    return cwd;
  }

  it("--message commits everything, and bkit:auto appends the auto-route marker", async () => {
    const cwd = started();
    const parent = git(cwd, "rev-parse", "HEAD");
    const r = await run(
      cwd,
      wf("close", "build", "--message=chore(12-export-csv): close-workflow", "--label=bkit:auto"),
    );
    expect(r.code).toBe(0);
    expect(r.json.parentSha).toBe(parent);
    expect(r.json.commit).toBe(git(cwd, "rev-parse", "HEAD"));
    expect(git(cwd, "log", "-1", "--format=%s")).toBe(
      "chore(12-export-csv): close-workflow bkit [auto route]",
    );
    expect(git(cwd, "status", "--porcelain")).toBe("");
  });

  it("an exact bkit:auto match only — a near-miss label leaves the subject alone", async () => {
    const cwd = started();
    await run(cwd, wf("close", "build", "--message=m", "--label=bkit:auto-paused"));
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("m");
  });

  it("--verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL", async () => {
    const cwd = started("debug");
    fs.appendFileSync(
      statusOf(cwd),
      jsonl([
        { type: "workflow-meta", workflow: "debug", at: "2020-01-01T00:00:01Z", pushMode: "LOCAL" },
      ]),
    );
    await run(cwd, wf("close", "debug", "--message=m", "--verbose-ci-local"));
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("m bkit [verbose ci]");
  });

  it("--record-step writes the close step's row before workflow-done", async () => {
    const cwd = started("design");
    await run(cwd, wf("close", "design", "--record-step"));
    const kinds = rows(statusOf(cwd)).map((x) => `${x.type}:${x.step ?? ""}`);
    expect(kinds.slice(-2)).toEqual(["step-done:design-close-workflow", "workflow-done:"]);
  });

  it("--outbox writes the artifact links and telemetry, and --number prints the close comment", async () => {
    const cwd = started();
    const outbox = path.join(cwd, "tmp", "outbox");
    const r = await run(
      cwd,
      wf("close", "build", `--outbox=${outbox}`, "--number=18", "--title=Close Workflow"),
    );
    expect(r.code).toBe(0);
    expect(fs.existsSync(path.join(outbox, "close-artifacts.md"))).toBe(true);
    expect(fs.readFileSync(path.join(outbox, "close-telemetry.md"), "utf-8")).toBe(
      `${r.json.report.join("\n")}\n`,
    );
    expect(r.json.comment).toContain("Step 18 — Close Workflow");
    expect(r.json.comment).toContain("#### Telemetry");
  });

  it("--number without --outbox is a usage error", async () => {
    expect((await run(started(), wf("close", "build", "--number=18", "--title=t"))).code).toBe(2);
  });

  it("--flush is ship only", async () => {
    expect((await run(started(), wf("close", "build", "--flush", "--outbox=tmp/o"))).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------

describe("bkit workflows handover", () => {
  function withRemote() {
    const cwd = repo();
    const remote = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-remote-")),
    );
    dirs.push(remote);
    git(remote, "init", "-q", "--bare");
    git(cwd, "remote", "set-url", "origin", remote);
    git(cwd, "checkout", "-q", "-b", `feat/${FID}`);
    git(cwd, "push", "-q", "origin", `feat/${FID}`);
    return { cwd, remote };
  }

  it("--push refuses with exit 8 when the handover is missing, committing nothing", async () => {
    const { cwd } = withRemote();
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, wf("handover", "build", `--month=${M}`, "--push", "--open-pr=none"));
    expect(r.code).toBe(8);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("--push commits the aborted subject, pushes, and links the handover in the comment", async () => {
    const { cwd, remote } = withRemote();
    write(cwd, `${REL}/build-handover.md`, "# Handover\n\nWhat broke.\n");
    const r = await run(
      cwd,
      wf("handover", "build", `--month=${M}`, "--push", "--open-pr=none", "--owner-repo=o/r"),
    );
    expect(r.code).toBe(0);
    expect(git(cwd, "log", "-1", "--format=%s")).toBe(
      "docs(12-export-csv): build aborted bkit [skip ci]",
    );
    expect(git(remote, "rev-parse", `feat/${FID}`)).toBe(git(cwd, "rev-parse", "HEAD"));
    expect(r.json).toMatchObject({
      handover: `${REL}/build-handover.md`,
      pushed: true,
      ref: `feat/${FID}`,
    });
    expect(r.json.comment).toContain("What broke.");
    expect(r.json.comment).toContain(
      `https://github.com/o/r/blob/feat/${FID}/${REL}/build-handover.md`,
    );
  });

  it("--push keeps the remote head when the branch has an open PR (exit 9, no link)", async () => {
    const { cwd, remote } = withRemote();
    const before = git(remote, "rev-parse", `feat/${FID}`);
    write(cwd, `${REL}/debug-handover.md`, "# Handover\n");
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push", "--open-pr=7"));
    expect(r.code).toBe(9);
    expect(git(remote, "rev-parse", `feat/${FID}`)).toBe(before);
    expect(r.json.pushed).toBe(false);
    expect(r.json.comment).not.toContain("https://github.com");
  });

  it("--flush (ship, no dev pushes) makes ONE FAILED commit on the current branch and pushes it", async () => {
    const { cwd, remote } = withRemote();
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "ship" }]));
    const r = await run(cwd, wf("handover", "ship", `--month=${M}`, "--flush"));
    expect(r.code).toBe(0);
    expect(git(cwd, "log", "-1", "--format=%s")).toBe(
      "chore(12-export-csv): ship FAILED bkit [skip ci]",
    );
    expect(git(remote, "rev-parse", `feat/${FID}`)).toBe(git(cwd, "rev-parse", "HEAD"));
    expect(r.json).toMatchObject({
      pushed: true,
      ref: `feat/${FID}`,
      handover: null,
      comment: null,
    });
  });

  it("--flush with nothing to record commits and pushes nothing", async () => {
    const { cwd } = withRemote();
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, wf("handover", "ship", `--month=${M}`, "--flush"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: false, skipped: "nothing-to-commit" });
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("--flush copies the worktree's logs into the book root before committing", async () => {
    const { cwd } = withRemote();
    git(cwd, "checkout", "-q", "dev");
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, `feat/${FID}`);
    git(cwd, "checkout", "-q", "-b", "book");
    write(wt, `${REL}/ship-handover.md`, "# Handover\n");
    const r = await run(cwd, wf("handover", "ship", `--month=${M}`, "--flush", `--worktree=${wt}`));
    expect(fs.existsSync(path.join(cwd, REL, "ship-handover.md"))).toBe(true);
    expect(r.json.handover).toBe(`${REL}/ship-handover.md`);
  });

  it("rejects --push with --flush, and --flush outside ship", async () => {
    const cwd = repo();
    expect((await run(cwd, wf("handover", "build", "--push", "--flush"))).code).toBe(2);
    expect((await run(cwd, wf("handover", "build", "--flush"))).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------

describe("bkit workflows promote", () => {
  const runtimeRow = (baseSha: string) =>
    jsonl([{ type: "runtime-resolved", workflow: "design", at: "2026-07-01T00:00:00Z", baseSha }]);

  it("--resolve prints the highest versioned draft and copies nothing", async () => {
    const cwd = repo();
    write(cwd, `${REL}/design-v1-draft.md`, "1\n");
    write(cwd, `${REL}/design-v3-organised.md`, "3\n");
    write(cwd, `${REL}/design-v2-reviewed.md`, "2\n");
    const r = await run(cwd, wf("promote", "design", `--month=${M}`, "--resolve"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ final: `${REL}/design-v3-organised.md`, canonical: null });
    expect(fs.existsSync(path.join(cwd, `docs/plans/${M}/${FID}-design.md`))).toBe(false);
  });

  it("exits 12 when there is no versioned draft", async () => {
    expect((await run(repo(), wf("promote", "design", `--month=${M}`))).code).toBe(12);
  });

  it("archives a changed canonical, then writes the highest draft as the canonical", async () => {
    const cwd = repo();
    write(cwd, `${REL}/status.jsonl`, runtimeRow(""));
    write(cwd, `${REL}/design-v2-reviewed.md`, "NEW\n");
    write(cwd, `docs/plans/${M}/${FID}-design.md`, "OLD\n");
    const r = await run(cwd, wf("promote", "design", `--month=${M}`));
    expect(r.code).toBe(0);
    expect(fs.readFileSync(path.join(cwd, `docs/plans/${M}/${FID}-design.md`), "utf-8")).toBe(
      "NEW\n",
    );
    expect(r.json.archived).toHaveLength(1);
    expect(r.json.archived[0]).toMatch(new RegExp(`archive/\\d{8}T\\d{6}Z-${FID}-design\\.md$`));
    expect(r.json.baseSha).toBeNull();
  });

  it("stamps the anchor from the runtime-resolved base commit", async () => {
    const cwd = repo();
    const base = git(cwd, "rev-parse", "HEAD");
    write(cwd, `${REL}/status.jsonl`, runtimeRow(base));
    write(cwd, `${REL}/design-v1-draft.md`, "# Design\n");
    const r = await run(cwd, wf("promote", "design", `--month=${M}`));
    expect(r.json.baseSha).toBe(base);
    expect(fs.readFileSync(path.join(cwd, `docs/plans/${M}/${FID}-design.md`), "utf-8")).toContain(
      base,
    );
  });

  it("stamps the bkit release, and the outdated warning when a newer one is out", async () => {
    const cwd = repo();
    const base = git(cwd, "rev-parse", "HEAD");
    write(cwd, `${REL}/status.jsonl`, runtimeRow(base));
    write(cwd, `${REL}/design-v1-draft.md`, "# Design\n");
    const doc = path.join(cwd, `docs/plans/${M}/${FID}-design.md`);

    await run(cwd, wf("promote", "design", `--month=${M}`));
    expect(fs.readFileSync(doc, "utf-8")).toContain(
      "bkitVersion: 4.6.3\nbkitLatest: \n-->\n# Design",
    );

    vi.stubEnv("BKIT_NO_UPDATE_CHECK", "");
    try {
      const cache = path.join(cwd, ".git", "bkit-latest-version.json");
      fs.writeFileSync(cache, JSON.stringify({ latest: "4.7.0", checkedAt: Date.now() }));
      write(cwd, `${REL}/design-v1-draft.md`, "# Design\n");
      await run(cwd, wf("promote", "design", `--month=${M}`));
      expect(fs.readFileSync(doc, "utf-8")).toMatch(
        /bkitLatest: 4\.7\.0\n-->\n\n> \*\*Outdated bkit:\*\* generated with bkit 4\.6\.3 while 4\.7\.0 was out.*<!-- bkit:outdated -->\n\n# Design\n$/,
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("plan: copies the split's children as canonical sub-plans and renames working names", async () => {
    const cwd = repo();
    write(cwd, `${REL}/plan-v4-split.md`, "see plan-v4-1.md and plan-v4-2.md\n");
    write(cwd, `${REL}/plan-v4-1.md`, "child of plan-v4-split.md\n");
    write(cwd, `${REL}/plan-v4-2.md`, "two\n");
    write(cwd, `${REL}/plan-v3-checked.md`, "older\n");
    const r = await run(cwd, wf("promote", "plan", `--month=${M}`));
    expect(r.code).toBe(0);
    expect(r.json.subPlans).toEqual([
      `docs/plans/${M}/${FID}-plan-1.md`,
      `docs/plans/${M}/${FID}-plan-2.md`,
    ]);
    expect(fs.readFileSync(path.join(cwd, `docs/plans/${M}/${FID}-plan.md`), "utf-8")).toBe(
      `see ${FID}-plan-1.md and ${FID}-plan-2.md\n`,
    );
    expect(fs.readFileSync(path.join(cwd, `docs/plans/${M}/${FID}-plan-1.md`), "utf-8")).toBe(
      `child of ${FID}-plan.md\n`,
    );
  });

  it("rejects a workflow other than design or plan", async () => {
    expect((await run(repo(), wf("promote", "build", `--month=${M}`))).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------

describe("bkit workflows links", () => {
  it("lists the feature's docs and this workflow's logs on the ref, and prints the close comment", async () => {
    const cwd = repo();
    write(cwd, `docs/plans/${M}/${FID}-plan.md`, "p\n");
    write(cwd, `${REL}/plan-summary.md`, "s\n");
    write(cwd, `${REL}/design-summary.md`, "s\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "docs");
    const outbox = path.join(cwd, "tmp", "outbox");
    write(cwd, "tmp/outbox/close-telemetry.md", "telemetry line\n");
    const r = await run(
      cwd,
      wf(
        "links",
        "plan",
        `--month=${M}`,
        `--outbox=${outbox}`,
        "--number=12",
        "--title=Close Workflow",
      ),
    );
    expect(r.code).toBe(0);
    expect(r.json.artifacts.map((a: { path: string }) => a.path)).toEqual([
      `docs/plans/${M}/${FID}-plan.md`,
      `${REL}/plan-summary.md`,
    ]);
    expect(fs.readFileSync(path.join(outbox, "close-artifacts.md"), "utf-8")).toBe(
      `${r.json.artifactLinks}\n`,
    );
    expect(r.json.comment).toContain("#### Artifacts");
    expect(r.json.comment).toContain("telemetry line");
  });

  it("names the branch, not the remote-tracking ref, in each URL", async () => {
    const cwd = repo();
    write(cwd, `docs/plans/${M}/${FID}-design.md`, "d\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "docs");
    git(cwd, "update-ref", "refs/remotes/origin/dev", "HEAD");
    const r = await run(
      cwd,
      wf("links", "design", `--month=${M}`, "--ref=origin/dev", "--owner-repo=o/r"),
    );
    expect(r.json.artifacts[0].url).toBe(
      `https://github.com/o/r/blob/dev/docs/plans/${M}/${FID}-design.md`,
    );
    expect(r.json.comment).toBeNull();
  });
});
