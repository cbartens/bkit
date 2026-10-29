import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validate } from "../../ledgers/telemetry";
import { runCommand } from "../lib";
import { tipsText } from "../tips";
import { newRecord, writeRecord } from "./ledgers";
import { locksCommand } from "./locks";
import { chatFingerprint } from "./run-facts";
import { workflowsCommand } from "./workflows";

// Real git repos and worktrees per test; a busy machine needs more than the default 5s.
vi.setConfig({ testTimeout: 30_000 });

/** A hook run as `removeWorktree` is entered, before it removes anything. */
const removing = vi.hoisted(() => ({ onEnter: null as null | (() => void) }));
vi.mock("./worktrees", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./worktrees")>();
  return {
    ...actual,
    removeWorktree: (...args: Parameters<typeof actual.removeWorktree>) => {
      removing.onEnter?.();
      return actual.removeWorktree(...args);
    },
  };
});
/** Makes the completeness checker throw when a test sets a flag; otherwise the real one. */
const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));
vi.mock("../../checks/status-holes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../checks/status-holes")>();
  return {
    ...actual,
    check: (...args: Parameters<typeof actual.check>) => {
      if (holes.throwCheck) throw new Error("forced checker failure");
      // A verdict the row write cannot serialise: the write throws, the check does not.
      if (holes.unserialisable) return { ...actual.check(...args), extra: 1n };
      return actual.check(...args);
    },
    readCompleteness: (...args: Parameters<typeof actual.readCompleteness>) => {
      if (holes.throwRead) throw new Error("forced checker failure");
      return actual.readCompleteness(...args);
    },
  };
});
afterEach(() => {
  removing.onEnter = null;
  holes.throwCheck = false;
  holes.throwRead = false;
  holes.unserialisable = false;
});

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
/** True while git holds a rebase open (merge-backend or apply-backend state dir). */
const rebaseInProgress = (gitDir: string) =>
  fs.existsSync(path.join(gitDir, "rebase-merge")) ||
  fs.existsSync(path.join(gitDir, "rebase-apply"));
const statusOf = (cwd: string) => path.join(cwd, REL, "status.jsonl");
/** A `package.json` whose worktree copy list also names a file outside the checkout. */
const outsideCopy = { bkit: { workflows: { worktree: { copy: [".env", "../shared/.env"] } } } };

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], [workflowsCommand, locksCommand], {
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

/**
 * A Linear GraphQL stub: `commentCreate` appends to the issue's comments and to the
 * returned `sent`; any other query answers the issue with those comments.
 */
function linearCommentServer(): string[] {
  const sent: string[] = [];
  const comments: Array<{ body: string; createdAt: string }> = [];
  const create = (body: string) => {
    sent.push(body);
    comments.push({ body, createdAt: "2026-10-24T00:00:00Z" });
    return { data: { commentCreate: { success: true, comment: { url: "https://l/c" } } } };
  };
  const read = () => ({
    data: {
      issue: {
        identifier: "ENG-4",
        title: "t",
        url: "u",
        description: "",
        state: { name: "Todo" },
        labels: { nodes: [] },
        comments: { nodes: comments },
      },
    },
  });
  const answers: Record<string, (q: { variables: any }) => object> = {
    create: (q) => create(q.variables.input.body),
    read,
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_u: string, init: RequestInit) => {
      const q = JSON.parse(String(init.body)) as { query: string; variables: any };
      const kind = ["read", "create"][Number(q.query.includes("commentCreate"))]!;
      return new Response(JSON.stringify(answers[kind]!(q)));
    }),
  );
  return sent;
}

// ---------------------------------------------------------------------------

describe("bkit workflows start", () => {
  /** A closed build run that recorded only its close step: a step hole on every other required step. */
  const holeyBuild = [
    { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z" },
    {
      type: "step-done",
      workflow: "build",
      step: "build-close-workflow",
      status: "DONE",
      at: "2020-01-01T00:59:00Z",
      parentSha: "x",
      artifacts: [],
    },
    { type: "workflow-done", workflow: "build", at: "2020-01-01T01:00:00Z" },
  ];
  const warnings = (err: string) =>
    err.split("\n").filter((l) => l.includes("[bkit-workflows]") && l.includes("previous run"));

  it("warns when the previous run for this fid was holey", async () => {
    const cwd = repo();
    write(cwd, `${REL}/status.jsonl`, jsonl(holeyBuild));
    const r = await run(cwd, wf("start", "design"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ resumed: false, run: 1 });
    const lines = warnings(r.err);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("build");
    expect(lines[0]).toContain("run 1");
    expect(lines[0]).toContain("2020-01-01T01:00:00Z");
    expect(lines[0]).toContain("bkit completeness check");
  });

  it("prints nothing when the previous run is clean, absent, or unreadable", async () => {
    // Positive control: the same fixture warns while the checker works.
    const control = repo();
    write(control, `${REL}/status.jsonl`, jsonl(holeyBuild));
    expect(warnings((await run(control, wf("start", "design"))).err)).toHaveLength(1);

    // Absent: the first run of a feature has no previous run.
    const first = await run(repo(), wf("start", "design"));
    expect(first.code).toBe(0);
    expect(warnings(first.err)).toHaveLength(0);

    // Clean: a stored CLEAN verdict.
    const clean = repo();
    write(
      clean,
      `${REL}/status.jsonl`,
      jsonl([
        ...holeyBuild.slice(0, 2),
        { type: "completeness", workflow: "build", at: "2020-01-01T01:00:00Z", verdict: "CLEAN" },
        holeyBuild[2]!,
      ]),
    );
    const c = await run(clean, wf("start", "design"));
    expect(c.code).toBe(0);
    expect(warnings(c.err)).toHaveLength(0);

    // Unreadable: the checker throws at start.
    holes.throwRead = true;
    const broken = repo();
    write(broken, `${REL}/status.jsonl`, jsonl(holeyBuild));
    const b = await run(broken, wf("start", "design"));
    expect(b.code).toBe(0);
    expect(b.err).not.toMatch(/forced checker failure|error/i);
    expect(warnings(b.err)).toHaveLength(0);
    expect(b.json).toMatchObject({ resumed: false, run: 1 });
  });

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

  describe("start records the chat that runs the workflow", () => {
    const A = "0a0a0a0a-1111-2222-3333-444455556666";
    const B = "0b0b0b0b-1111-2222-3333-444455556666";
    const fp = (id: string) => chatFingerprint("claude-code", id);
    const sessions = (cwd: string) => rows(statusOf(cwd)).filter((x) => x.type === "session");
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("writes one session row per chat; a resume in the same chat adds none", async () => {
      const cwd = repo();
      vi.stubEnv("CLAUDE_CODE_SESSION_ID", A);
      const token = `--token=${(await run(cwd, wf("start", "build"))).json.lock.token}`;
      expect((await run(cwd, wf("start", "build", "--lock-held", token))).json.resumed).toBe(true);
      expect(sessions(cwd)).toEqual([
        expect.objectContaining({ workflow: "build", platform: "claude-code", session: fp(A) }),
      ]);
      vi.stubEnv("CLAUDE_CODE_SESSION_ID", B);
      expect((await run(cwd, wf("start", "build", "--lock-held", token))).code).toBe(0);
      expect(sessions(cwd).map((x) => x.session)).toEqual([fp(A), fp(B)]);
      expect(JSON.stringify(rows(statusOf(cwd)))).not.toContain(A);
    });

    it("a new run in the same chat gets its own session row", async () => {
      const cwd = repo();
      write(
        cwd,
        `${REL}/status.jsonl`,
        jsonl([
          { type: "workflow-started", workflow: "build", at: "2026-07-01T00:00:00Z" },
          { type: "session", workflow: "build", at: "2026-07-01T00:00:01Z", session: fp(A) },
          { type: "workflow-done", workflow: "build", at: "2026-07-01T01:00:00Z" },
        ]),
      );
      vi.stubEnv("CLAUDE_CODE_SESSION_ID", A);
      await run(cwd, wf("start", "build"));
      expect(sessions(cwd)).toHaveLength(2);
    });

    it("writes none outside Claude Code", async () => {
      const cwd = repo();
      vi.stubEnv("CLAUDE_CODE_SESSION_ID", "");
      await run(cwd, wf("start", "build"));
      expect(sessions(cwd)).toEqual([]);
    });
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

  it("writes workflow-started for ship in the worktree being shipped, its lock in the main checkout", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    const r = await run(wt, wf("start", "ship"));
    expect(r.code).toBe(0);
    expect(r.json.file).toBe(statusOf(wt));
    expect(r.json.lock.path).toBe(path.join(cwd, REL, ".lock"));
    expect(rows(statusOf(wt)).at(-1)).toMatchObject({
      type: "workflow-started",
      workflow: "ship",
    });
    expect(fs.existsSync(statusOf(cwd))).toBe(false);
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

  it("--branch refuses a checkout on another branch (exit 15), writing no row and taking no lock", async () => {
    const cwd = repo();
    const r = await run(cwd, wf("start", "ship", "--branch=feat/other"));
    expect(r.code).toBe(15);
    expect(r.err).toContain("not on feat/other");
    expect(fs.existsSync(statusOf(cwd))).toBe(false);
    expect(fs.existsSync(path.join(cwd, REL, ".lock"))).toBe(false);
    expect((await run(cwd, wf("start", "ship", "--branch=dev"))).code).toBe(0);
  });

  it("ship clears stale sentinels beside status.jsonl; other workflows leave them", async () => {
    const cwd = repo();
    write(cwd, `${REL}/.rebase-failed`, "");
    write(cwd, `${REL}/.deferred-blocked`, "");
    const build = await run(cwd, wf("start", "build"));
    expect(build.code).toBe(0);
    expect(fs.existsSync(path.join(cwd, REL, ".rebase-failed"))).toBe(true);
    await run(cwd, ["locks", "release", "--kind=workflow", "--workflow=build", `--fid=${FID}`]);
    const ship = await run(cwd, wf("start", "ship"));
    expect(ship.code).toBe(0);
    expect(fs.existsSync(path.join(cwd, REL, ".rebase-failed"))).toBe(false);
    expect(fs.existsSync(path.join(cwd, REL, ".deferred-blocked"))).toBe(false);
  });
});

describe("bkit workflows start — resume facts", () => {
  const started = (at: string) => ({ type: "workflow-started", workflow: "build", at });
  const done = (step: string, at: string, extra: object = {}) => ({
    type: "step-done",
    workflow: "build",
    step,
    status: "DONE",
    at,
    parentSha: "x",
    artifacts: [],
    ...extra,
  });
  const writeDecision = (cwd: string, run: number, n: number, header: string[]) =>
    write(cwd, `${REL}/build-decision-${run}-${n}.md`, `${header.join("\n")}\n\n**Q1 — x:** y\n`);

  it("a new run has no last step and no open decision", async () => {
    const r = await run(repo(), wf("start", "build"));
    expect(r.json).toMatchObject({ lastDoneStep: null, openDecision: null });
  });

  it("a resumed run prints its last DONE step; a closed decision is not open", async () => {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([
        started("2026-07-01T00:00:00Z"),
        done("build-start-workflow", "2026-07-01T00:01:00Z"),
        done("build-worktree-setup", "2026-07-01T00:02:00Z"),
        { ...done("build-plan-execute", "2026-07-01T00:03:00Z"), status: "FAILED" },
      ]),
    );
    writeDecision(cwd, 1, 1, ["Status: DECIDED", "Question: CHALLENGE", "From: challenge"]);
    const r = await run(cwd, wf("start", "build"));
    expect(r.json).toMatchObject({
      resumed: true,
      lastDoneStep: "build-worktree-setup",
      openDecision: null,
    });
  });

  it("an OPEN decision of an earlier run never resurfaces", async () => {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([
        started("2026-07-01T00:00:00Z"),
        { type: "workflow-done", workflow: "build", at: "2026-07-01T01:00:00Z" },
        started("2026-07-02T00:00:00Z"),
        done("build-start-workflow", "2026-07-02T00:01:00Z"),
      ]),
    );
    writeDecision(cwd, 1, 1, ["Status: OPEN", "Question: CHALLENGE", "From: challenge"]);
    const r = await run(cwd, wf("start", "build"));
    expect(r.json).toMatchObject({ resumed: true, run: 2, openDecision: null });
  });

  it("an OPEN decision mid-build prints its header fields", async () => {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([
        started("2026-07-01T00:00:00Z"),
        done("build-start-workflow", "2026-07-01T00:01:00Z"),
        done("build-plan-verify", "2026-07-01T00:05:00Z", { group: 2, attempt: 3 }),
      ]),
    );
    writeDecision(cwd, 1, 1, ["Status: DECIDED", "Question: CHALLENGE", "From: challenge"]);
    writeDecision(cwd, 1, 2, [
      "Status: OPEN",
      "Question: VERIFY_LOOP",
      "From: verify",
      "Pause step: 7",
      "Group: 2",
      "Verify attempt: 3",
      `Plan: docs/plans/${M}/${FID}-plan.md`,
    ]);
    const r = await run(cwd, wf("start", "build"));
    expect(r.code).toBe(0);
    expect(r.json.lastDoneStep).toBe("build-plan-verify");
    expect(r.json.openDecision).toEqual({
      file: `${REL}/build-decision-1-2.md`,
      decision: 2,
      question: "VERIFY_LOOP",
      from: "verify",
      pauseStep: 7,
      group: 2,
      verifyAttempt: 3,
      testAttempt: null,
      plan: `docs/plans/${M}/${FID}-plan.md`,
    });
  });

  it("reads Test attempt from a tests pause", async () => {
    const cwd = repo();
    write(cwd, `${REL}/status.jsonl`, jsonl([started("2026-07-01T00:00:00Z")]));
    writeDecision(cwd, 1, 1, [
      "Status: OPEN",
      "Question: TESTS_LOOP",
      "From: tests",
      "Pause step: 11",
      "Test attempt: 4",
      `Plan: docs/plans/${M}/${FID}-plan.md`,
    ]);
    const r = await run(cwd, wf("start", "build"));
    expect(r.json.openDecision).toMatchObject({
      decision: 1,
      from: "tests",
      pauseStep: 11,
      verifyAttempt: null,
      testAttempt: 4,
    });
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
    expect(rebaseInProgress(gitDir)).toBe(true);
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

  it("clears ship's .deferred-blocked in the worktree being shipped", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    write(wt, `${REL}/.deferred-blocked`, "");
    const r = await run(wt, wf("fail", "ship", `--month=${M}`, "--token=t"));
    expect(r.json.sentinels).toEqual([
      { name: ".deferred-blocked", path: path.join(wt, REL, ".deferred-blocked") },
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

  it("computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker", async () => {
    const r = await run(repo(), wf("fail", "build", "--label=bkit:build", "--label=bkit:auto"));
    expect(r.json.labels).toEqual(
      expect.arrayContaining(["bkit:build", "bkit:auto", "bkit:failed"]),
    );
    expect(r.json.add).toEqual(["bkit:failed"]);
    expect(r.json.prState).toBeNull();
    expect(r.json.trackerState).toBeNull();
    const again = await run(
      repo(),
      wf("fail", "build", "--label=bkit:build", "--label=bkit:failed"),
    );
    expect(again.json.add).toEqual([]);
  });

  it.each([
    [{ tracker: { default: "linear" } }, "In Review"],
    [{ tracker: { default: "linear", linear: { review: "Code Review" } } }, "Code Review"],
    [{ tracker: { default: "jira" } }, "In Review"],
    [{ tracker: { default: "jira", jira: { review: "QA" } } }, "QA"],
    [{ tracker: { default: "github" } }, null],
  ])("a failed issue under %j moves to review status %j", async (bkit, state) => {
    const cwd = repo();
    write(cwd, "package.json", JSON.stringify({ bkit }));
    const r = await run(cwd, wf("fail", "build", "--label=bkit:build"));
    expect(r.json.trackerState).toBe(state);
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

  /** The close's rows as `ledgers append` wrote them to `.bkit/stats.jsonl`. */
  const statsOf = (cwd: string) => rows(path.join(cwd, ".bkit/stats.jsonl"));
  const writtenOutcome = (cwd: string) => statsOf(cwd).find((x) => x.kind === "outcome");
  const NO_LINES = { added: 0, deleted: 0, files: 0 };

  // A close reads the running Claude Code session's transcripts: tests run inside one.
  beforeEach(() => {
    vi.stubEnv("CLAUDE_CODE_SESSION_ID", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("context peaks", () => {
    const SID = "0f0e0d0c-1111-2222-3333-444455556666";
    /** A Claude config dir whose session SID ran one `bkit-build-plan-execute` subagent. */
    function claudeDir() {
      const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-claude-")));
      dirs.push(dir);
      const sub = path.join(dir, "projects", "-repo", SID, "subagents");
      fs.mkdirSync(sub, { recursive: true });
      const line = {
        type: "assistant",
        timestamp: "2026-01-01T00:00:00.000Z",
        message: {
          id: "m1",
          model: "m",
          usage: { input_tokens: 1, cache_creation_input_tokens: 2, cache_read_input_tokens: 3 },
        },
      };
      fs.writeFileSync(path.join(sub, "agent-a.jsonl"), `${JSON.stringify(line)}\n`);
      fs.writeFileSync(
        path.join(sub, "agent-a.meta.json"),
        JSON.stringify({ agentType: "bkit-build-plan-execute" }),
      );
      return dir;
    }

    it("records each agent type's peak from the closing Claude Code session", async () => {
      vi.stubEnv("CLAUDE_CONFIG_DIR", claudeDir());
      vi.stubEnv("CLAUDE_CODE_SESSION_ID", SID);
      const cwd = closable();
      expect((await run(cwd, wf("close", "build"))).code).toBe(0);
      const outcome = writtenOutcome(cwd);
      expect(outcome?.context).toEqual({
        host: "claude-code",
        byAgent: { "bkit-build-plan-execute": { peak: 6, runs: 1 } },
      });
      expect(validate(outcome)).toEqual({ ok: true });
    });

    it("counts subagents of an earlier chat the run's session rows name", async () => {
      vi.stubEnv("CLAUDE_CONFIG_DIR", claudeDir());
      vi.stubEnv("CLAUDE_CODE_SESSION_ID", "");
      const cwd = closable();
      fs.appendFileSync(
        statusOf(cwd),
        jsonl([
          {
            type: "session",
            workflow: "build",
            at: "2020-01-01T00:00:01Z",
            platform: "claude-code",
            session: chatFingerprint("claude-code", SID),
          },
        ]),
      );
      expect((await run(cwd, wf("close", "build"))).code).toBe(0);
      expect(writtenOutcome(cwd)?.context).toEqual({
        host: "claude-code",
        byAgent: { "bkit-build-plan-execute": { peak: 6, runs: 1 } },
      });
    });

    it("records no context block, and still closes, outside a Claude Code session", async () => {
      vi.stubEnv("CLAUDE_CONFIG_DIR", claudeDir());
      vi.stubEnv("CLAUDE_CODE_SESSION_ID", "");
      const cwd = closable();
      expect((await run(cwd, wf("close", "build"))).code).toBe(0);
      expect(writtenOutcome(cwd)).not.toHaveProperty("context");
    });
  });

  it("writes workflow-done and schema-valid counter + outcome rows", async () => {
    const cwd = closable();
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    // The run's join key on its status row: what `runs dispatch` restates the outcome by.
    expect(rows(statusOf(cwd)).at(-1)).toMatchObject({
      type: "workflow-done",
      workflow: "build",
      parentSha: head,
    });
    const all = statsOf(cwd);
    // The grader's compliance rows come first: the report below must carry this run's grade.
    expect(all.map((x) => x.kind)).toEqual(["compliance", "compliance", "counter", "outcome"]);
    for (const row of all) expect(validate(row)).toEqual({ ok: true });
    const [counter, outcome] = all.slice(2);
    expect(counter).toMatchObject({
      schema: 3,
      kind: "counter",
      repo: "cbartens/bkit",
      bkit: { version: "4.6.3" },
      by: { workflow: "build", step: "build-close-workflow" },
      run: { parentSha: head },
      counter: { name: "BUILD_ATTEMPT", value: 1, source: "shell-bus" },
    });
    expect(outcome).toMatchObject({
      schema: 3,
      kind: "outcome",
      by: { workflow: "build", step: "build-close-workflow" },
      run: { parentSha: head },
      ending: "done",
      // a.txt +1, b.txt +1; the status / friction logs committed with the work are left out
      lines: {
        total: { added: 2, deleted: 0, changed: 2, files: 2 },
        code: { added: 2, deleted: 0, files: 2 },
        tests: NO_LINES,
        docs: NO_LINES,
        merges: 0,
      },
      ledgers: {
        deferrals: { repo: 0, added: 0 },
        failures: { repo: 0, added: 0 },
        friction: { added: 1 },
      },
      build: { verify: [], gapsRemediate: [], holistic: null, challenge: null, redTests: 0 },
    });
    expect((outcome!.time as { totalMinutes: number }).totalMinutes).toBeGreaterThan(0);
    expect(outcome!.run).not.toHaveProperty("pr");
    expect(outcome).not.toHaveProperty("plan");
    expect(outcome).not.toHaveProperty("taskCount");
    // The printed rows are the drafts the ledger copies were written from.
    expect(r.json.outcomeRow).toMatchObject({ kind: "outcome", run: { parentSha: head } });
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

  it("stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step", async () => {
    const cwd = closable();
    expect((await run(cwd, wf("close", "build"))).code).toBe(0);
    const all = statsOf(cwd);
    const head = git(cwd, "rev-parse", "HEAD");
    expect(all.map((x) => (x.run as { parentSha: string }).parentSha)).toEqual([
      head,
      head,
      head,
      head,
    ]);
    for (const row of all) {
      expect(row.by).toEqual({ workflow: "build", step: "build-close-workflow" });
    }
  });

  it("writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts", async () => {
    const cwd = closable();
    fs.appendFileSync(
      statusOf(cwd),
      jsonl([
        {
          type: "workflow-meta",
          workflow: "build",
          at: "2020-01-01T00:00:01Z",
          planSource: "brief",
        },
        {
          type: "step-done",
          workflow: "build",
          step: "build-plan-convert",
          at: "2020-01-01T00:00:02Z",
          parentSha: "0".repeat(40),
          attempt: 1,
          artifacts: [`docs/plans/${M}/${FID}-plan.md`],
        },
      ]),
    );
    write(
      cwd,
      `docs/plans/${M}/${FID}-plan.md`,
      "<!-- bkit:group 1 start -->\n### GROUP 1: Work\n<!-- bkit:task 1 start -->\n- [ ] **TASK 1:** One.\n<!-- bkit:task 1 end -->\n<!-- bkit:group 1 end -->\n",
    );
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
    expect(r.code).toBe(0);
    const outcome = writtenOutcome(cwd);
    expect(validate(outcome)).toEqual({ ok: true });
    expect(outcome!.plan).toEqual({
      source: "converted",
      total: { tasks: 1, kb: 0 },
      groups: [{ tasks: [{ tests: null, testFiles: null }] }],
    });
    expect((outcome!.ledgers as Record<string, unknown>).deferrals).toEqual({ repo: 2, added: 1 });
  });

  it("counts plan tasks from the task headings, never the sub-step checkboxes", async () => {
    const cwd = closable();
    const taskBlock = (n: number) =>
      [
        `<!-- bkit:task ${n} start -->`,
        `- [ ] **TASK ${n}:** Do ${n}.`,
        "  - **DONE WHEN:** done.",
        "  - **TEST FIRST:**",
        `    - \`a.test.ts\` \`t${n}\``,
        ...[1, 2, 3].map((i) => `  - [ ] Step ${n}.${i}`),
        `<!-- bkit:task ${n} end -->`,
      ].join("\n");
    const group = (g: number, ...ns: number[]) =>
      `<!-- bkit:group ${g} start -->\n### GROUP ${g}: Work\n${ns.map(taskBlock).join("\n")}\n<!-- bkit:group ${g} end -->`;
    write(cwd, `docs/plans/${M}/${FID}-plan.md`, `# Plan\n\n${group(1, 1, 2)}\n${group(2, 3)}\n`);
    expect((await run(cwd, wf("close", "build"))).code).toBe(0);
    const outcome = writtenOutcome(cwd);
    expect(validate(outcome)).toEqual({ ok: true });
    // Twelve `- [` lines, three tasks.
    expect(outcome!.plan).toMatchObject({
      source: "file",
      total: { tasks: 3 },
      groups: [
        {
          tasks: [
            { tests: 1, testFiles: 1 },
            { tests: 1, testFiles: 1 },
          ],
        },
        { tasks: [{ tests: 1, testFiles: 1 }] },
      ],
    });
  });

  it("always writes the telemetry, whatever the runtime", async () => {
    const cwd = closable("design");
    const r = await run(cwd, wf("close", "design"));
    expect(r.code).toBe(0);
    expect(statsOf(cwd).map((x) => x.kind)).toEqual([
      "compliance",
      "compliance",
      "counter",
      "outcome",
    ]);
    expect(r.json.featureStatus).toBe("DESIGNED");
  });

  it("with no workflow-started row: time null, per-run counts omitted, attempt 1", async () => {
    const cwd = repo();
    write(cwd, `${REL}/status.jsonl`, "");
    const r = await run(cwd, wf("close", "debug"));
    expect(r.code).toBe(0);
    const outcome = writtenOutcome(cwd);
    expect(validate(outcome)).toEqual({ ok: true });
    expect(outcome!.time).toBeNull();
    expect(outcome!.ledgers).toEqual({
      deferrals: { repo: 0 },
      failures: { repo: 0 },
      friction: {},
    });
    expect(r.json.counterRow.counter.value).toBe(1);
  });

  it("counts attempts from distinct workflow-started rows (a union merge may duplicate one)", async () => {
    const cwd = closable();
    const first = rows(statusOf(cwd))[0];
    fs.appendFileSync(
      statusOf(cwd),
      jsonl([first!, { type: "workflow-started", workflow: "build", at: "2020-01-02T00:00:00Z" }]),
    );
    expect((await run(cwd, wf("close", "build"))).json.counterRow.counter.value).toBe(2);
  });

  it("an unwritable stats path is logged and never fails the close", async () => {
    const cwd = closable();
    fs.rmSync(path.join(cwd, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".bkit"), "");
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    expect(r.json.telemetryWritten).toBe(false);
    expect(r.err).toContain("[bkit-telemetry] stats rows not written");
    expect(r.json.outcomeRow).toBeNull();
    expect(r.json.counterRow).toBeNull();
  });

  it("appends the completeness row before the workflow-done row", async () => {
    const cwd = closable("build");
    const r = await run(cwd, wf("close", "build", "--record-step"));
    expect(r.code).toBe(0);
    const all = rows(statusOf(cwd));
    const at = all.findIndex((x) => x.type === "completeness");
    expect(at).toBeGreaterThan(-1);
    expect(all[at]).toMatchObject({ workflow: "build", journalSuspect: true });
    expect(["CLEAN", "HOLEY"]).toContain(all[at]!.verdict);
    expect(all[at - 1]).toMatchObject({ type: "step-done", step: "build-close-workflow" });
    expect(all[at + 1]).toMatchObject({ type: "workflow-done", workflow: "build" });
  });

  it("prints one telemetry line on stderr when the journal looks dead at close", async () => {
    const cwd = closable("build");
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    const lines = r.err.split("\n").filter((l) => l.includes("journal looks dead"));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("[bkit-telemetry] journal looks dead at close");
    // stdout is still the one output object, with no journal field.
    expect(JSON.stringify(r.json)).not.toContain("journal looks dead");
    expect(r.json).not.toHaveProperty("journalSuspect");
  });

  it("writes one completeness row per close", async () => {
    const cwd = closable("build");
    expect((await run(cwd, wf("close", "build"))).code).toBe(0);
    expect((await run(cwd, wf("close", "build"))).code).toBe(0);
    const all = rows(statusOf(cwd));
    expect(all.filter((x) => x.type === "completeness")).toHaveLength(2);
    expect(all.filter((x) => x.type === "workflow-done")).toHaveLength(2);
    expect(all.map((x) => x.type).slice(-4)).toEqual([
      "completeness",
      "workflow-done",
      "completeness",
      "workflow-done",
    ]);
  });

  it("still closes when the completeness check throws", async () => {
    const cwd = closable("build");
    holes.throwCheck = true;
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    const all = rows(statusOf(cwd));
    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
    expect(all.some((x) => x.type === "completeness")).toBe(false);
    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("forced checker failure");
  });

  it("still closes when the completeness row write throws", async () => {
    const cwd = closable("build");
    holes.unserialisable = true;
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(0);
    const all = rows(statusOf(cwd));
    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
    expect(all.some((x) => x.type === "completeness")).toBe(false);
    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
    expect(lines).toHaveLength(1);
  });

  it("refuses without status.jsonl and writes nothing", async () => {
    const cwd = repo();
    const r = await run(cwd, wf("close", "build"));
    expect(r.code).toBe(3);
    expect(fs.existsSync(path.join(cwd, ".bkit/stats.jsonl"))).toBe(false);
  });

  it("ship: run.pr, size of the squash commit, and coverage", async () => {
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
    const r = await run(cwd, wf("close", "ship", "--pr-number=42", `--squash-sha=${squash}`));
    expect(r.code).toBe(0);
    const outcome = writtenOutcome(cwd);
    expect(outcome).toMatchObject({
      run: { pr: 42 },
      lines: { total: { added: 3, files: 1 } },
      ship: { coverage: { unit: { lines: 91.5, branches: 80, functions: 70, statements: 90 } } },
    });
    expect(validate(outcome)).toEqual({ ok: true });
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
    const outcome = writtenOutcome(cwd);
    expect(outcome!.ledgers).toMatchObject({
      friction: { added: 1 },
      failures: { repo: 2, added: 1 },
    });
    expect(validate(outcome)).toEqual({ ok: true });
  });

  it("absent ledgers still give a schema-valid row with zero per-run counts", async () => {
    const cwd = closable("design");
    fs.rmSync(path.join(cwd, ".bkit/friction.jsonl"));
    const r = await run(cwd, wf("close", "design"));
    expect(r.code).toBe(0);
    const outcome = writtenOutcome(cwd);
    expect(outcome!.ledgers).toEqual({
      deferrals: { repo: 0, added: 0 },
      failures: { repo: 0, added: 0 },
      friction: { added: 0 },
    });
    expect(validate(outcome)).toEqual({ ok: true });
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

  it("--message never commits the bkit.workflows.worktree.copy entries (.env)", async () => {
    const cwd = started();
    write(cwd, ".env", "SECRET=1\n");
    write(cwd, "a.txt", "changed\n");
    expect((await run(cwd, wf("close", "build", "--message=m"))).code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).not.toContain(".env");
    expect(git(cwd, "status", "--porcelain")).toBe("?? .env");
  });

  it("--message commits when bkit.workflows.worktree.copy names a path outside the checkout", async () => {
    const cwd = started();
    write(cwd, "package.json", JSON.stringify(outsideCopy));
    git(cwd, "add", "package.json");
    git(cwd, "commit", "-qm", "outside copy entry");
    write(cwd, ".env", "SECRET=1\n");
    write(cwd, "a.txt", "changed\n");
    const r = await run(cwd, wf("close", "build", "--message=m"));
    expect(r.code).toBe(0);
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("m");
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("a.txt");
    expect(git(cwd, "status", "--porcelain")).toBe("?? .env");
  });

  it("an exact bkit:auto match only — a near-miss label leaves the subject alone", async () => {
    const cwd = started();
    await run(cwd, wf("close", "build", "--message=m", "--label=bkit:auto-paused"));
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("m");
  });

  it("--verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL", async () => {
    const cwd = started("build");
    fs.appendFileSync(
      statusOf(cwd),
      jsonl([
        { type: "workflow-meta", workflow: "build", at: "2020-01-01T00:00:01Z", pushMode: "LOCAL" },
      ]),
    );
    await run(cwd, wf("close", "build", "--message=m", "--verbose-ci-local"));
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("m bkit [verbose ci]");
  });

  it("--record-step writes the close step's row before workflow-done", async () => {
    const cwd = started("design");
    await run(cwd, wf("close", "design", "--record-step"));
    const kinds = rows(statusOf(cwd)).map((x) => [x.type, x.step].join(":"));
    expect(kinds.slice(-3)).toEqual([
      "step-done:design-close-workflow",
      "completeness:",
      "workflow-done:",
    ]);
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
    expect(fs.readFileSync(r.json.commentFile, "utf-8")).toBe(r.json.comment);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).not.toContain("tmp/bkit-comment-");
  });

  it("--number without --outbox is a usage error", async () => {
    expect((await run(started(), wf("close", "build", "--number=18", "--title=t"))).code).toBe(2);
  });

  it("--flush is ship only", async () => {
    expect((await run(started(), wf("close", "build", "--flush", "--outbox=tmp/o"))).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------

/** A run's status rows: started at `start` (ms), then failed. */
const startedThenFailed = (workflow: string, start: number) =>
  jsonl([
    { type: "workflow-started", workflow, at: new Date(start).toISOString() },
    { type: "workflow-failed", workflow, at: new Date(start + 500).toISOString() },
  ]);

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

  it("--push commits and pushes the record on the feature branch without a handover", async () => {
    const { cwd, remote } = withRemote();
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "design" }]));
    const r = await run(cwd, wf("handover", "design", `--month=${M}`, "--push", "--open-pr=none"));
    expect(r.code).toBe(0);
    expect(git(remote, "log", "-1", "--format=%s", `feat/${FID}`)).toBe(
      "docs(12-export-csv): design aborted bkit [skip ci]",
    );
    expect(git(remote, "show", `feat/${FID}:${REL}/status.jsonl`)).toContain("workflow-failed");
    expect(r.json).toMatchObject({
      handover: null,
      pushed: true,
      ref: `feat/${FID}`,
      comment: null,
    });
  });

  it("--push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not", async () => {
    const { cwd, remote } = withRemote();
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "build" }]));
    write(cwd, ".env", "SECRET=1\n");
    const r = await run(cwd, wf("handover", "build", `--month=${M}`, "--push", "--open-pr=none"));
    expect(r.code).toBe(0);
    expect(git(remote, "show", "--name-only", "--format=", `feat/${FID}`)).toBe(
      `${REL}/status.jsonl`,
    );
    expect(git(cwd, "status", "--porcelain")).toBe("?? .env");
  });

  it("handover --push commits the record when a copy entry points outside the checkout", async () => {
    const { cwd, remote } = withRemote();
    write(cwd, "package.json", JSON.stringify(outsideCopy));
    git(cwd, "add", "package.json");
    git(cwd, "commit", "-qm", "outside copy entry");
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "build" }]));
    write(cwd, ".env", "SECRET=1\n");
    const r = await run(cwd, wf("handover", "build", `--month=${M}`, "--push", "--open-pr=none"));
    expect(r.code).toBe(0);
    expect(r.err).not.toContain("git add failed");
    expect(git(remote, "show", "--name-only", "--format=", `feat/${FID}`)).toBe(
      `${REL}/status.jsonl`,
    );
    expect(git(remote, "show", `feat/${FID}:${REL}/status.jsonl`)).toContain("workflow-failed");
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
    expect(fs.readFileSync(r.json.commentFile, "utf-8")).toBe(r.json.comment);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).not.toContain("tmp/bkit-comment-");
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

  it("--list-stray names untracked and modified paths outside the run's logs, and writes nothing", async () => {
    const cwd = repo();
    git(cwd, "checkout", "-q", "-b", `feat/${FID}`);
    write(cwd, "a.txt", "changed\n");
    write(cwd, "tmp/scratch.txt", "x\n");
    write(cwd, `${REL}/build-handover.md`, "# Handover\n");
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, wf("handover", "build", `--month=${M}`, "--list-stray"));
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ shared: false, modified: ["a.txt"], untracked: ["tmp/scratch.txt"] });
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(git(cwd, "status", "--porcelain")).toContain("?? tmp/");
  });

  it("--list-stray on dev reports shared: true; it refuses --push alongside", async () => {
    const cwd = repo();
    const r = await run(cwd, wf("handover", "build", `--month=${M}`, "--list-stray"));
    expect(r.json).toEqual({ shared: true, modified: [], untracked: [] });
    expect(
      (await run(cwd, wf("handover", "build", `--month=${M}`, "--list-stray", "--push"))).code,
    ).toBe(2);
  });

  /** A remote carrying dev and feat/{FID}, the main checkout on dev, the feature in its worktree. */
  function withDevRemote() {
    const { cwd, remote } = withRemote();
    git(cwd, "checkout", "-q", "dev");
    git(cwd, "push", "-q", "origin", "dev");
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, `feat/${FID}`);
    return { cwd, remote, wt };
  }
  const devSubject = (remote: string) => git(remote, "log", "-1", "--format=%s", "dev");

  it("--flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched", async () => {
    const { cwd, remote, wt } = withDevRemote();
    write(wt, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "ship" }]));
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(wt, wf("handover", "ship", `--month=${M}`, "--flush"));
    expect(r.code).toBe(0);
    expect(devSubject(remote)).toBe("chore(12-export-csv): ship FAILED bkit [skip ci]");
    expect(git(remote, "show", `dev:${REL}/status.jsonl`)).toContain("workflow-failed");
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(git(cwd, "branch", "--show-current")).toBe("dev");
    expect(fs.existsSync(path.join(cwd, ".worktrees", `_land-${FID}`))).toBe(false);
    expect(r.json).toMatchObject({ pushed: true, ref: "dev", handover: null, comment: null });
  });

  it("--flush with nothing to record commits and pushes nothing", async () => {
    const { remote, wt } = withDevRemote();
    const before = git(remote, "rev-parse", "dev");
    const r = await run(wt, wf("handover", "ship", `--month=${M}`, "--flush"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: false, skipped: "nothing-to-commit" });
    expect(git(remote, "rev-parse", "dev")).toBe(before);
  });

  it("--flush carries the named worktree's logs into the dev commit", async () => {
    const { cwd, remote, wt } = withDevRemote();
    write(wt, `${REL}/ship-handover.md`, "# Handover\n");
    const r = await run(cwd, wf("handover", "ship", `--month=${M}`, "--flush", `--worktree=${wt}`));
    expect(r.code).toBe(0);
    expect(git(remote, "show", `dev:${REL}/ship-handover.md`)).toBe("# Handover");
    expect(fs.existsSync(path.join(cwd, REL, "ship-handover.md"))).toBe(false);
    expect(r.json.handover).toBe(`${REL}/ship-handover.md`);
  });

  it("--flush refused by dev keeps the record in the book and exits 10", async () => {
    const { remote, wt } = withDevRemote();
    const hook = path.join(remote, "hooks", "pre-receive");
    fs.writeFileSync(hook, "#!/bin/sh\necho protected >&2\nexit 1\n", { mode: 0o755 });
    const before = git(remote, "rev-parse", "dev");
    write(wt, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "ship" }]));
    const r = await run(wt, wf("handover", "ship", `--month=${M}`, "--flush"));
    expect(r.code).toBe(10);
    expect(r.json).toMatchObject({ pushed: false, ref: null });
    expect(r.err).toContain(`ship FAILED record kept in ${wt}`);
    expect(git(remote, "rev-parse", "dev")).toBe(before);
    expect(fs.existsSync(path.join(wt, REL, "status.jsonl"))).toBe(true);
  });

  it("--push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code", async () => {
    const { cwd, remote } = withDevRemote();
    const head = git(cwd, "rev-parse", "HEAD");
    write(cwd, "src.ts", "half-done fix\n");
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "debug" }]));
    write(cwd, `${REL}/debug-handover.md`, "# Handover\n");
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push", "--owner-repo=o/r"));
    expect(r.code).toBe(0);
    expect(devSubject(remote)).toBe("chore(12-export-csv): debug FAILED bkit [skip ci]");
    expect(git(remote, "show", `dev:${REL}/debug-handover.md`)).toBe("# Handover");
    expect(git(remote, "ls-tree", "--name-only", "dev")).not.toContain("src.ts");
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(git(cwd, "status", "--porcelain")).toContain("src.ts");
    expect(r.json).toMatchObject({ pushed: true, ref: "dev" });
    expect(r.json.comment).toContain(`https://github.com/o/r/blob/dev/${REL}/debug-handover.md`);
  });

  it("--push on dev hands the landed record back, so local dev fast-forwards onto it", async () => {
    const { cwd } = withDevRemote();
    write(cwd, "docs/decisions.jsonl", jsonl([{ key: "a" }]));
    git(cwd, "add", "docs/decisions.jsonl");
    git(cwd, "commit", "-qm", "ledger");
    git(cwd, "push", "-q", "origin", "dev");
    const start = Date.now() - 1000;
    fs.appendFileSync(
      path.join(cwd, "docs/decisions.jsonl"),
      jsonl([{ key: "b", workflow: "debug", ts: start + 1 }]),
    );
    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
    write(cwd, `${REL}/debug-handover.md`, "# Handover\n");
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    expect(r.err).toContain("handed back 3 file(s) now on dev");
    expect(git(cwd, "status", "--porcelain", "--", "docs")).toBe("");
    git(cwd, "fetch", "-q", "origin", "dev");
    git(cwd, "merge", "-q", "--ff-only", "origin/dev");
    expect(git(cwd, "log", "-1", "--format=%s")).toBe(
      "chore(12-export-csv): debug FAILED bkit [skip ci]",
    );
    expect(fs.readFileSync(path.join(cwd, "docs/decisions.jsonl"), "utf-8")).toContain('"b"');
  });

  it("--push on dev keeps a staged ledger in the checkout and names it", async () => {
    const { cwd } = withDevRemote();
    const start = Date.now() - 1000;
    write(cwd, "docs/decisions.jsonl", jsonl([{ key: "a", workflow: "debug", ts: start + 1 }]));
    git(cwd, "add", "docs/decisions.jsonl");
    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    expect(r.err).toContain("kept in");
    expect(r.err).toContain("docs/decisions.jsonl");
    expect(git(cwd, "diff", "--cached", "--name-only")).toBe("docs/decisions.jsonl");
    expect(fs.existsSync(path.join(cwd, REL, "status.jsonl"))).toBe(false);
  });

  it("--push on dev carries only this run's rows: other sessions' rows and older rows stay put", async () => {
    const { cwd, remote } = withDevRemote();
    write(cwd, "docs/decisions.jsonl", jsonl([{ key: "a" }]));
    git(cwd, "add", "docs/decisions.jsonl");
    git(cwd, "commit", "-qm", "ledger");
    git(cwd, "push", "-q", "origin", "dev");
    // Local dev ahead of origin/dev with unpushed work: never published.
    git(cwd, "commit", "-q", "--allow-empty", "-m", "local wip");
    const start = Date.now() - 1000;
    const mine = { key: "mine", workflow: "debug", ts: start + 1 };
    const older = { key: "older", workflow: "debug", ts: start - 60_000 };
    const other = { key: "other", workflow: "build", ts: start + 2 };
    fs.appendFileSync(path.join(cwd, "docs/decisions.jsonl"), jsonl([mine, older, other]));
    write(cwd, ".bkit/friction.jsonl", jsonl([{ id: "f", workflow: "debug", ts: start + 3 }]));
    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
    write(cwd, "src.ts", "half-done fix\n");
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    const onDev = git(remote, "show", "dev:docs/decisions.jsonl");
    expect(onDev).toContain('"mine"');
    expect(onDev).not.toContain('"older"');
    expect(onDev).not.toContain('"other"');
    expect(git(remote, "show", "dev:.bkit/friction.jsonl")).toContain('"f"');
    expect(git(remote, "log", "--format=%s", "dev")).not.toContain("local wip");
    // The hand-back removes exactly the carried lines; the rest stay as they were.
    const left = fs.readFileSync(path.join(cwd, "docs/decisions.jsonl"), "utf-8");
    expect(left).not.toContain('"mine"');
    expect(left).toContain('"older"');
    expect(left).toContain('"other"');
    expect(fs.existsSync(path.join(cwd, ".bkit/friction.jsonl"))).toBe(false);
    expect(fs.readFileSync(path.join(cwd, "src.ts"), "utf-8")).toBe("half-done fix\n");
  });

  it("--push on dev never carries the stats script's chat and run rows, whatever their workflow", async () => {
    const { cwd, remote } = withDevRemote();
    const start = Date.now() - 1000;
    const outcome = { kind: "outcome", workflow: "debug", ts: start + 1 };
    const scanned = [
      { kind: "run", key: "other-feature", workflow: "debug", ts: start + 2 },
      { kind: "chat", key: "c", workflow: "debug", ts: start + 3 },
    ];
    write(cwd, ".bkit/stats.jsonl", jsonl([outcome, ...scanned]));
    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    const onDev = git(remote, "show", "dev:.bkit/stats.jsonl");
    expect(onDev).toContain('"outcome"');
    expect(onDev).not.toContain('"other-feature"');
    expect(onDev).not.toContain('"chat"');
    const left = fs.readFileSync(path.join(cwd, ".bkit/stats.jsonl"), "utf-8");
    expect(left).toContain('"other-feature"');
    expect(left).toContain('"chat"');
  });

  it("--push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas", async () => {
    const { cwd, remote } = withDevRemote();
    const head = git(cwd, "rev-parse", "HEAD");
    const startSha = "e".repeat(40);
    const start = Date.now() - 1000;
    const by = { workflow: "debug", step: "debug-close-workflow" };
    const stats = [
      // Rows written without schema, joined by their top-level parentSha.
      { kind: "compliance", workflow: "debug", ts: start + 1, parentSha: head, rule: "mine-head" },
      {
        kind: "outcome",
        workflow: "debug",
        ts: start + 2,
        parentSha: "f".repeat(40),
        x: "theirs-1",
      },
      // Rows in the current shape, joined by run.parentSha.
      {
        schema: 2,
        kind: "counter",
        by,
        ts: start + 3,
        run: { parentSha: startSha },
        x: "mine-start",
      },
      {
        schema: 2,
        kind: "outcome",
        by,
        ts: start + 4,
        run: { parentSha: "d".repeat(40) },
        x: "theirs-2",
      },
    ];
    write(cwd, ".bkit/stats.jsonl", jsonl(stats));
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([
        {
          type: "workflow-started",
          workflow: "debug",
          at: new Date(start).toISOString(),
          parentSha: startSha,
        },
        { type: "workflow-failed", workflow: "debug", at: new Date(start + 500).toISOString() },
      ]),
    );
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    const onDev = git(remote, "show", "dev:.bkit/stats.jsonl");
    expect(onDev).not.toContain('"theirs-1"');
    expect(onDev).not.toContain('"theirs-2"');
    expect(onDev).toContain('"mine-head"');
    expect(onDev).toContain('"mine-start"');
    const left = fs.readFileSync(path.join(cwd, ".bkit/stats.jsonl"), "utf-8");
    expect(left).toContain('"theirs-1"');
    expect(left).toContain('"theirs-2"');
    expect(left).not.toContain('"mine-head"');
  });

  it("--push on dev never carries a row whose references name another feature", async () => {
    const { cwd, remote } = withDevRemote();
    const start = Date.now() - 1000;
    const deferral = (key: string, references: string[], ts: number) => ({
      kind: "deferral",
      key,
      workflow: "debug",
      ts: start + ts,
      references,
    });
    write(
      cwd,
      "docs/deferrals.jsonl",
      jsonl([
        deferral("mine-fid", [FID, "BAR-217"], 1),
        deferral("mine-number", ["12"], 2),
        deferral("no-feature-ref", ["src/a.ts", "KN-14"], 3),
        deferral("mine-among-others", ["99-other-thing", FID], 4),
        deferral("theirs-fid", ["99-other-thing"], 5),
        deferral("theirs-number", ["7"], 6),
      ]),
    );
    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    const onDev = git(remote, "show", "dev:docs/deferrals.jsonl");
    for (const key of ["mine-fid", "mine-number", "no-feature-ref", "mine-among-others"]) {
      expect(onDev).toContain(`"${key}"`);
    }
    expect(onDev).not.toContain('"theirs-fid"');
    expect(onDev).not.toContain('"theirs-number"');
    const left = fs.readFileSync(path.join(cwd, "docs/deferrals.jsonl"), "utf-8");
    expect(left).toContain('"theirs-fid"');
    expect(left).toContain('"theirs-number"');
  });

  it("--push on dev with no start row carries no shared-ledger row, and says so", async () => {
    const { cwd, remote } = withDevRemote();
    write(cwd, "docs/decisions.jsonl", jsonl([{ key: "x", workflow: "debug", ts: Date.now() }]));
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "debug" }]));
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    expect(r.err).toContain("no shared-ledger row carried");
    expect(git(remote, "show", "dev:docs/decisions.jsonl")).toBe("");
    expect(git(remote, "show", `dev:${REL}/status.jsonl`)).toContain("workflow-failed");
  });

  it("a second --push on dev lands the run's rewritten log, not only new files", async () => {
    const { cwd, remote } = withDevRemote();
    const start = Date.now() - 1000;
    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
    write(cwd, `${REL}/debug-handover.md`, "# Handover v1\n");
    expect((await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"))).code).toBe(0);
    git(cwd, "fetch", "-q", "origin", "dev");
    git(cwd, "merge", "-q", "--ff-only", "origin/dev");
    write(cwd, `${REL}/debug-handover.md`, "# Handover v2\n");
    expect((await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"))).code).toBe(0);
    expect(git(remote, "show", `dev:${REL}/debug-handover.md`)).toBe("# Handover v2");
  });

  it("--push on dev refused keeps the record in the checkout and exits 10", async () => {
    const { cwd, remote } = withDevRemote();
    const hook = path.join(remote, "hooks", "pre-receive");
    fs.writeFileSync(hook, "#!/bin/sh\necho protected >&2\nexit 1\n", { mode: 0o755 });
    write(cwd, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "build" }]));
    const r = await run(cwd, wf("handover", "build", `--month=${M}`, "--push"));
    expect(r.code).toBe(10);
    expect(r.err).toContain(`build FAILED record kept in ${cwd}`);
    expect(fs.existsSync(path.join(cwd, REL, "status.jsonl"))).toBe(true);
  });

  it("--push commits in the named worktree, not the checkout it runs from", async () => {
    const { cwd, remote, wt } = withDevRemote();
    write(wt, `${REL}/status.jsonl`, jsonl([{ type: "workflow-failed", workflow: "plan" }]));
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(
      cwd,
      wf("handover", "plan", `--month=${M}`, "--push", "--open-pr=none", `--worktree=${wt}`),
    );
    expect(r.code).toBe(0);
    expect(git(remote, "log", "-1", "--format=%s", `feat/${FID}`)).toBe(
      "docs(12-export-csv): plan aborted bkit [skip ci]",
    );
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("rejects --push with --flush, and --flush outside ship", async () => {
    const cwd = repo();
    expect((await run(cwd, wf("handover", "build", "--push", "--flush"))).code).toBe(2);
    expect((await run(cwd, wf("handover", "build", "--flush"))).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------

describe("bkit workflows close --flush (ship)", () => {
  /** Remote with dev; the main checkout on dev; the feature in `.worktrees/{FID}` with a started run. */
  function shipping(owned: boolean) {
    const cwd = repo();
    const remote = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-remote-")),
    );
    dirs.push(remote);
    git(remote, "init", "-q", "--bare");
    git(cwd, "remote", "set-url", "origin", remote);
    git(cwd, "push", "-q", "origin", "dev");
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    write(
      wt,
      `${REL}/status.jsonl`,
      jsonl([{ type: "workflow-started", workflow: "ship", at: "2020-01-01T00:00:00Z" }]),
    );
    const marker = path.join(cwd, ".git", "bkit-outbox", FID, ".worktree-owned");
    if (owned) write(cwd, path.relative(cwd, marker), "");
    const outbox = path.join(cwd, ".git", "bkit-outbox", FID);
    fs.mkdirSync(outbox, { recursive: true });
    const close = [
      ...wf("close", "ship", `--month=${M}`, `--file=${statusOf(wt)}`),
      "--pr-number=42",
      `--squash-sha=${git(wt, "rev-parse", "HEAD")}`,
      `--outbox=${outbox}`,
      "--flush",
      `--branch=feat/${FID}`,
    ];
    return { cwd, remote, wt, close };
  }

  it("lands ONE DONE commit on dev carrying the book, then removes the worktree and branch", async () => {
    const { cwd, remote, wt, close } = shipping(true);
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(wt, close);
    expect(r.code).toBe(0);
    expect(git(remote, "log", "-1", "--format=%s", "dev")).toBe(
      "docs(12-export-csv): ship DONE bkit [skip ci]",
    );
    const landed = git(remote, "show", `dev:${REL}/status.jsonl`);
    expect(landed).toContain('"workflow-done"');
    expect(landed).toContain('"ship-close-workflow"');
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(r.json.landed).toEqual({ ref: "dev", via: "head-push" });
    expect(r.json.worktree).toMatchObject({ removed: true, branchDeleted: true });
    expect(fs.existsSync(wt)).toBe(false);
    expect(git(cwd, "branch", "--list", `feat/${FID}`)).toBe("");
    expect(fs.existsSync(path.join(cwd, ".worktrees", `_land-${FID}`))).toBe(false);
  });

  it("a close that did not land keeps the lock, the worktree and the branch for the Failure Path", async () => {
    const { cwd, wt, close } = shipping(true);
    const lock = await run(cwd, [
      "locks",
      "acquire",
      "--kind=workflow",
      "--workflow=ship",
      `--fid=${FID}`,
    ]);
    git(cwd, "remote", "set-url", "--push", "origin", path.join(cwd, "no-such-remote"));
    const r = await run(wt, [...close, `--token=${lock.json.token}`]);
    expect(r.code).toBe(10);
    expect(fs.existsSync(path.join(cwd, REL, ".lock"))).toBe(true);
    expect(fs.existsSync(wt)).toBe(true);
    expect(git(cwd, "branch", "--list", `feat/${FID}`)).not.toBe("");
  });

  it("a close that landed releases the lock", async () => {
    const { cwd, wt, close } = shipping(true);
    const lock = await run(cwd, [
      "locks",
      "acquire",
      "--kind=workflow",
      "--workflow=ship",
      `--fid=${FID}`,
    ]);
    const r = await run(wt, [...close, `--token=${lock.json.token}`]);
    expect(r.code).toBe(0);
    expect(fs.existsSync(path.join(cwd, REL, ".lock"))).toBe(false);
  });

  it("removes the worktree before it releases the lock", async () => {
    const { cwd, wt, close } = shipping(true);
    const lock = await run(cwd, [
      "locks",
      "acquire",
      "--kind=workflow",
      "--workflow=ship",
      `--fid=${FID}`,
    ]);
    const seen: { lock: boolean; worktree: boolean }[] = [];
    removing.onEnter = () =>
      seen.push({ lock: fs.existsSync(path.join(cwd, REL, ".lock")), worktree: fs.existsSync(wt) });
    const r = await run(wt, [...close, `--token=${lock.json.token}`]);
    expect(r.code).toBe(0);
    expect(seen).toEqual([{ lock: true, worktree: true }]);
    expect(fs.existsSync(wt)).toBe(false);
    expect(fs.existsSync(path.join(cwd, REL, ".lock"))).toBe(false);
  });

  describe("close PR (dev refused the push)", () => {
    /** A bare remote that refuses every push to dev, and a gh on PATH that records its calls. */
    function refusedDev(base: "dev" | "none") {
      const s = shipping(true);
      fs.writeFileSync(
        path.join(s.remote, "hooks", "pre-receive"),
        '#!/bin/sh\nwhile read o n ref; do [ "$ref" = refs/heads/dev ] && { echo "dev is protected" >&2; exit 1; }; done\nexit 0\n',
        { mode: 0o755 },
      );
      const bin = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-gh-")));
      dirs.push(bin);
      const baseField = base === "dev" ? ',"baseRefName":"dev"' : "";
      fs.writeFileSync(
        path.join(bin, "gh"),
        [
          "#!/bin/sh",
          `echo "$*" >> "${bin}/calls"`,
          'case "$1 $2" in',
          '  "pr create") exit 0 ;;',
          `  "pr list") echo '[{"number":9,"url":"https://github.com/o/r/pull/9","state":"OPEN"${baseField},"headRefName":"ship-close/${FID}"}]' ;;`,
          `  "pr view") if [ -f "${bin}/merged" ]; then echo '{"number":9,"state":"MERGED","baseRefName":"dev","mergeCommit":{"oid":"abc"}}'; else echo '{"number":9,"state":"OPEN"${baseField}}'; fi ;;`,
          `  "pr merge") : > "${bin}/merged"; exit 0 ;;`,
          "esac",
          "",
        ].join("\n"),
        { mode: 0o755 },
      );
      const calls = () =>
        fs.existsSync(path.join(bin, "calls"))
          ? fs.readFileSync(path.join(bin, "calls"), "utf-8").trim().split("\n")
          : [];
      return { ...s, bin, calls };
    }
    const withGh = async <T>(bin: string, fn: () => Promise<T>) => {
      const saved = process.env.PATH;
      process.env.PATH = `${bin}${path.delimiter}${saved ?? ""}`;
      try {
        return await fn();
      } finally {
        process.env.PATH = saved;
      }
    };

    it("closePr with base dev still merges", async () => {
      const { wt, close, bin, calls } = refusedDev("dev");
      const r = await withGh(bin, () => run(wt, close));
      expect(r.code).toBe(0);
      expect(r.json.landed).toEqual({ ref: `ship-close/${FID}`, via: "close-pr" });
      expect(calls().some((c) => c.startsWith("pr merge"))).toBe(true);
    });

    it("closePr refuses when the PR base is unknown", async () => {
      const { wt, close, bin, calls } = refusedDev("none");
      const r = await withGh(bin, () => run(wt, close));
      expect(r.code).toBe(0);
      expect(r.json.landed).toEqual({ ref: `ship-close/${FID}`, via: "close-pr-open" });
      expect(r.err).toContain("not merged");
      expect(calls().filter((c) => c.startsWith("pr merge"))).toEqual([]);
    });
  });

  it("leaves a worktree no workflow created, and its branch, in place", async () => {
    const { cwd, wt, close } = shipping(false);
    const r = await run(wt, close);
    expect(r.code).toBe(0);
    expect(r.json.worktree).toMatchObject({ removed: false, reason: "not-owned" });
    expect(fs.realpathSync(String(r.json.worktree.branchBlockedBy))).toBe(fs.realpathSync(wt));
    expect(fs.existsSync(wt)).toBe(true);
    expect(git(cwd, "branch", "--list", `feat/${FID}`)).not.toBe("");
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

  it("promote copies the plan only", async () => {
    const cwd = repo();
    const bucket = path.join(cwd, `docs/plans/${M}`);
    write(cwd, `${REL}/plan-v2-reviewed.md`, "NEW, see plan-v2-1.md\n");
    write(cwd, `${REL}/plan-v2-1.md`, "stray child\n");
    write(cwd, `docs/plans/${M}/${FID}-plan.md`, "OLD\n");
    write(cwd, `docs/plans/${M}/${FID}-plan-2.md`, "stray sub-plan\n");
    const r = await run(cwd, wf("promote", "plan", `--month=${M}`));
    expect(r.code).toBe(0);
    expect(r.json).not.toHaveProperty("subPlans");
    expect(fs.readFileSync(path.join(bucket, `${FID}-plan.md`), "utf-8")).toBe(
      "NEW, see plan-v2-1.md\n",
    );
    expect(r.json.archived).toHaveLength(1);
    expect(r.json.archived[0]).toMatch(new RegExp(`-${FID}-plan\\.md$`));
    expect(fs.readFileSync(path.join(bucket, `${FID}-plan-2.md`), "utf-8")).toBe(
      "stray sub-plan\n",
    );
    expect(fs.existsSync(path.join(bucket, `${FID}-plan-1.md`))).toBe(false);
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
    expect(fs.readFileSync(r.json.commentFile, "utf-8")).toBe(r.json.comment);
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
    expect(r.json.commentFile).toBeNull();
  });
});

describe("--post on fail / links", () => {
  const saved = process.env.BKIT_LINEAR_API_KEY;
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
    else process.env.BKIT_LINEAR_API_KEY = saved;
  });

  it("fail --post: needs --step-number; tracker none is skipped, exit unchanged", async () => {
    const cwd = repo();
    expect((await run(cwd, wf("fail", "build", "--post"))).code).toBe(2);
    const r = await run(
      cwd,
      wf("fail", "build", "--post", "--step-number=3", "--step-title=Plan Verify", "--error=x"),
    );
    expect(r.code).toBe(0);
    expect(r.json.tracker).toEqual({ skipped: "tracker-none" });
    expect(r.json.labelsWrite).toEqual({ skipped: "tracker-none" });
  });

  it("fail --post writes bkit:failed onto the labels it reads, and the review state", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = repo();
    write(
      cwd,
      "package.json",
      JSON.stringify({ bkit: { tracker: { default: "linear", linear: { review: "In Review" } } } }),
    );
    const bodies: Array<{ query: string; variables: any }> = [];
    const answers: Record<string, object> = {
      commentCreate: { data: { commentCreate: { success: true, comment: { url: "c" } } } },
      comments: {
        data: {
          issue: {
            title: "t",
            url: "u",
            description: "",
            state: { name: "Todo" },
            labels: { nodes: [] },
            comments: { nodes: [] },
          },
        },
      },
      labels: {
        data: { issue: { labels: { nodes: [{ name: "bkit:build" }, { name: "human" }] } } },
      },
      issueLabels: {
        data: {
          issue: {
            id: "u4",
            team: { id: "t", states: { nodes: [{ id: "s9", name: "In Review" }] } },
          },
          issueLabels: { nodes: [{ id: "l-failed", name: "bkit:failed", team: null }] },
        },
      },
      issueUpdate: { data: { issueUpdate: { success: true } } },
    };
    const kindOf = (q: string) =>
      ["commentCreate", "issueUpdate", "issueLabels", "comments", "labels"].find((k) =>
        q.includes(k),
      )!;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_u: string, init: RequestInit) => {
        const q = JSON.parse(String(init.body)) as { query: string; variables: any };
        bodies.push(q);
        return new Response(JSON.stringify(answers[kindOf(q.query)]));
      }),
    );
    const r = await run(
      cwd,
      wf("fail", "build", "--post", "--step-number=3", "--step-title=Plan Verify", "--error=x").map(
        (a) => a.replace(`--fid=${FID}`, "--fid=eng-4-x"),
      ),
    );
    expect(r.json.labelsWrite).toEqual({ done: true, action: "labels", url: null });
    const updates = bodies
      .filter((b) => b.query.includes("issueUpdate"))
      .map((b) => b.variables.input);
    expect(updates).toEqual([
      { addedLabelIds: ["l-failed"], removedLabelIds: [] },
      { stateId: "s9" },
    ]);
  });

  it("fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = repo();
    write(cwd, "package.json", JSON.stringify({ bkit: { tracker: { default: "linear" } } }));
    git(cwd, "commit", "-qam", "linear");
    const fid = "eng-4-x";
    const started = await run(cwd, [
      "workflows",
      "start",
      "--workflow=build",
      `--fid=${fid}`,
      `--month=${M}`,
    ]);
    const posted = linearCommentServer();
    const args = [
      "workflows",
      "fail",
      "--workflow=build",
      `--fid=${fid}`,
      `--month=${M}`,
      `--token=${started.json.lock.token}`,
      "--post",
      "--step-number=3",
      "--step-title=Plan Verify",
      "--error=line one\nline two",
    ];
    const first = await run(cwd, args);
    expect(first.json.tracker).toEqual({ done: true, action: "comment", url: "https://l/c" });
    expect(fs.readFileSync(first.json.commentFile, "utf-8")).toBe(first.json.comment);
    const status = path.join(cwd, `docs/plans/${M}/logs/${fid}/status.jsonl`);
    const row = rows(status).find((r: any) => r.type === "engine-action");
    expect(row).toMatchObject({ action: "comment", key: "build/1/failure/3/-/comment" });
    const again = await run(cwd, args);
    expect(again.json.tracker).toMatchObject({ done: true, deduped: true });
    expect(posted).toEqual([first.json.comment]);
  });

  it("links --post posts the close comment once: an identical latest comment is not posted again", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = repo();
    write(cwd, "package.json", JSON.stringify({ bkit: { tracker: { default: "linear" } } }));
    const outbox = path.join(cwd, "tmp", "outbox");
    write(cwd, "tmp/outbox/close-telemetry.md", "telemetry line\n");
    const posted = linearCommentServer();
    const args = [
      "workflows",
      "links",
      "--workflow=plan",
      "--fid=eng-4-x",
      `--month=${M}`,
      `--outbox=${outbox}`,
      "--number=12",
      "--title=Close Workflow",
      "--post",
    ];
    const first = await run(cwd, args);
    expect(first.json.tracker).toEqual({ done: true, action: "comment", url: "https://l/c" });
    const again = await run(cwd, args);
    expect(again.json.tracker).toMatchObject({ done: true, deduped: true });
    expect(posted).toEqual([first.json.comment]);
  });
});

describe("bkit workflows close / handover — a debug run in place on dev that shares its checkout", () => {
  const recordAt = (cwd: string) =>
    path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${FID}.json`));
  const committed = (cwd: string) =>
    git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");

  /** dev with an open debug run, foreign work in flight, the run's record, and the run's own log. */
  function shared() {
    const cwd = repo();
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([{ type: "workflow-started", workflow: "debug", at: new Date().toISOString() }]),
    );
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "start");
    write(cwd, "a.txt", "base\nforeign\n");
    write(cwd, "notes.md", "foreign notes\n");
    writeRecord(cwd, newRecord(cwd, FID, "dev"));
    write(cwd, `${REL}/verify-1.md`, "Verdict: PASS\n");
    return cwd;
  }
  const close = (cwd: string) =>
    run(cwd, wf("close", "debug", "--message=chore(12-export-csv): close-workflow"));

  it("close with a shared-checkout record never commits a recorded path", async () => {
    const cwd = shared();
    const r = await close(cwd);
    expect(r.code).toBe(0);
    expect(committed(cwd)).toContain(`${REL}/verify-1.md`);
    expect(committed(cwd)).not.toContain("a.txt");
    expect(committed(cwd)).not.toContain("notes.md");
    expect(fs.readFileSync(path.join(cwd, "a.txt"), "utf-8")).toBe("base\nforeign\n");
    expect(git(cwd, "status", "--porcelain", "--", "a.txt", "notes.md").split("\n")).toHaveLength(
      2,
    );
  });

  /** Bytes of the files a refused close must leave alone. */
  const ledgerBytes = (cwd: string) =>
    [`${REL}/status.jsonl`, ".bkit/stats.jsonl"].map((f) =>
      fs.existsSync(path.join(cwd, f)) ? fs.readFileSync(path.join(cwd, f), "utf-8") : null,
    );

  it("close exits 10 when a recorded path changed during the run, writing no row and committing nothing", async () => {
    const cwd = shared();
    write(cwd, "a.txt", "base\nforeign\nedited mid-run\n");
    const head = git(cwd, "rev-parse", "HEAD");
    const before = ledgerBytes(cwd);
    const r = await close(cwd);
    expect(r.code).toBe(10);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(ledgerBytes(cwd)).toEqual(before);
  });

  it("close exits 14 when the run has no shared-checkout record, writing no row and committing nothing", async () => {
    const cwd = shared();
    fs.rmSync(recordAt(cwd));
    const head = git(cwd, "rev-parse", "HEAD");
    const before = ledgerBytes(cwd);
    const r = await close(cwd);
    expect(r.code).toBe(14);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(ledgerBytes(cwd)).toEqual(before);
    expect(committed(cwd)).not.toContain("a.txt");
  });

  it("a second run's record does not let this FID's close commit", async () => {
    const cwd = shared();
    fs.rmSync(recordAt(cwd));
    writeRecord(cwd, newRecord(cwd, "another-run", "dev"));
    const head = git(cwd, "rev-parse", "HEAD");
    expect((await close(cwd)).code).toBe(14);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("record is present after workflows close and before the push", async () => {
    const cwd = shared();
    expect((await close(cwd)).code).toBe(0);
    expect(fs.existsSync(recordAt(cwd))).toBe(true);
    const rec = JSON.parse(fs.readFileSync(recordAt(cwd), "utf-8")) as { commits: string[] };
    expect(rec.commits.at(-1)).toBe(git(cwd, "rev-parse", "HEAD"));
  });

  it("failed handover from dev removes the record and keeps recorded paths", async () => {
    const cwd = repo();
    const remote = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-remote-")),
    );
    dirs.push(remote);
    git(remote, "init", "-q", "--bare");
    git(cwd, "remote", "set-url", "origin", remote);
    write(cwd, "docs/decisions.jsonl", jsonl([{ key: "a" }]));
    git(cwd, "add", "docs/decisions.jsonl");
    git(cwd, "commit", "-qm", "ledger");
    git(cwd, "push", "-q", "origin", "dev");
    const start = Date.now() - 1000;
    // A foreign row that looks like the run's own: same workflow, inside the run's window.
    fs.appendFileSync(
      path.join(cwd, "docs/decisions.jsonl"),
      jsonl([{ key: "foreign", workflow: "debug", ts: start + 1 }]),
    );
    fs.mkdirSync(path.dirname(recordAt(cwd)), { recursive: true });
    fs.writeFileSync(
      recordAt(cwd),
      JSON.stringify({
        fid: FID,
        branch: "dev",
        startSha: git(cwd, "rev-parse", "HEAD"),
        originSha: git(cwd, "rev-parse", "HEAD"),
        aheadAtStart: 0,
        paths: [
          {
            path: "docs/decisions.jsonl",
            hash: git(cwd, "hash-object", "--", "docs/decisions.jsonl"),
            lines: 2,
          },
        ],
        commits: [],
      }),
    );
    fs.appendFileSync(
      path.join(cwd, "docs/decisions.jsonl"),
      jsonl([{ key: "mine", workflow: "debug", ts: start + 2 }]),
    );
    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
    expect(r.code).toBe(0);
    expect(fs.existsSync(recordAt(cwd))).toBe(false);
    const left = fs.readFileSync(path.join(cwd, "docs/decisions.jsonl"), "utf-8");
    expect(left).toContain('"foreign"');
    expect(left).not.toContain('"mine"');
    const onDev = git(remote, "show", "dev:docs/decisions.jsonl");
    expect(onDev).toContain('"mine"');
    expect(onDev).not.toContain('"foreign"');
  });
});

describe("bkit workflows input", () => {
  const input = (workflow: string, ...extra: string[]) => [
    "workflows",
    "input",
    `--workflow=${workflow}`,
    `--fid=${FID}`,
    `--month=${M}`,
    "--run=2",
    "--prompt-file=s/prompt.md",
    ...extra,
  ];

  function withIssue() {
    const cwd = repo();
    write(cwd, "s/prompt.md", "/bkit-design #12\n\nplease\n");
    write(cwd, "s/issue-description.md", "The ask.\n");
    write(
      cwd,
      "s/issue-comments.json",
      JSON.stringify([
        { body: "later", createdAt: "2026-10-02T00:00:00Z" },
        { body: "###### bkit:generated\n### Step 1", createdAt: "2026-10-01T12:00:00Z" },
        { body: "earlier", createdAt: "2026-10-01T00:00:00Z" },
      ]),
    );
    return cwd;
  }
  const ISSUE = [
    "--description-file=s/issue-description.md",
    "--comments-file=s/issue-comments.json",
  ];

  const PROMPT =
    "## Session Prompt — this run's, newer than everything below\n\n/bkit-design #12\n\nplease\n";
  /** The author date git records for the last commit of `rel`, in UTC. */
  const authored = (cwd: string, rel: string) =>
    new Date(git(cwd, "log", "-1", "--format=%aI", "--", rel)).toISOString();
  const commitAt = (cwd: string, rel: string, at: string) => {
    git(cwd, "add", "--", rel);
    spawnSync("git", ["commit", "-qm", rel, "--", rel], {
      cwd,
      env: { ...process.env, GIT_AUTHOR_DATE: at, GIT_COMMITTER_DATE: at },
    });
  };

  it("writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated", async () => {
    const cwd = withIssue();
    const r = await run(cwd, input("design", ...ISSUE));
    expect(r.code).toBe(0);
    const rel = `${REL}/design-input-2.md`;
    const text = fs.readFileSync(path.join(cwd, rel), "utf-8");
    expect(r.json).toEqual({ path: rel, bytes: Buffer.byteLength(text), newerThanPlan: 0 });
    expect(text).toBe(
      `${PROMPT}\n## Issue description — oldest\n\nThe ask.\n\n` +
        "## Issue comment — posted 2026-10-01T00:00:00.000Z\n\nearlier\n\n" +
        "## Issue comment — posted 2026-10-02T00:00:00.000Z\n\nlater\n",
    );
  });

  it("the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest", async () => {
    const cwd = withIssue();
    write(
      cwd,
      "s/issue-comments.json",
      JSON.stringify([
        { body: "dropped", createdAt: "2026-10-01T00:00:00Z" },
        {
          body: "also dropped\n###### bkit:ignore-earlier\nkept",
          createdAt: "2026-10-02T00:00:00Z",
        },
        "undated",
      ]),
    );
    await run(cwd, input("design", ...ISSUE));
    expect(fs.readFileSync(path.join(cwd, REL, "design-input-2.md"), "utf-8")).toBe(
      `${PROMPT}\n## Issue comment — posted 2026-10-02T00:00:00.000Z\n\nkept\n\n` +
        "## Issue comment — no date, counts as oldest\n\nundated\n",
    );
  });

  it("a run with no issue holds the prompt alone", async () => {
    const cwd = withIssue();
    await run(cwd, input("design"));
    expect(fs.readFileSync(path.join(cwd, REL, "design-input-2.md"), "utf-8")).toBe(PROMPT);
  });

  it("plan appends the parent design and the audit reports in order, each dated; a missing one exits 13", async () => {
    const cwd = withIssue();
    write(cwd, "docs/plans/202606/9-parent-design.md", "# Design\n");
    commitAt(cwd, "docs/plans/202606/9-parent-design.md", "2026-09-30T08:00:00+10:00");
    write(cwd, "docs/audits/a.md", "A report\n");
    write(cwd, "docs/audits/b.md", "B report\n");
    const r = await run(
      cwd,
      input(
        "plan",
        "--design=docs/plans/202606/9-parent-design.md",
        "--audit=docs/audits/b.md",
        "--audit=docs/audits/a.md",
      ),
    );
    expect(r.code).toBe(0);
    expect(fs.readFileSync(path.join(cwd, REL, "plan-input-2.md"), "utf-8")).toBe(
      `${PROMPT}\n` +
        "## Design — docs/plans/202606/9-parent-design.md — last committed 2026-09-29T22:00:00.000Z\n\n# Design\n\n" +
        "## Audit Report — docs/audits/b.md — uncommitted changes, newer than any commit\n\nB report\n\n" +
        "## Audit Report — docs/audits/a.md — uncommitted changes, newer than any commit\n\nA report\n",
    );
    const missing = await run(cwd, input("plan", "--design=docs/plans/202606/gone.md"));
    expect(missing.code).toBe(13);
    expect((await run(cwd, input("plan", "--audit=docs/audits/gone.md"))).code).toBe(13);
  });

  it("--plan is appended when the file exists and skipped when it does not", async () => {
    const cwd = withIssue();
    write(cwd, `docs/plans/${M}/${FID}-plan.md`, "# Plan\n");
    await run(cwd, input("build", `--plan=docs/plans/${M}/${FID}-plan.md`));
    expect(fs.readFileSync(path.join(cwd, REL, "build-input-2.md"), "utf-8")).toContain(
      `## Plan — docs/plans/${M}/${FID}-plan.md — uncommitted changes, newer than any commit\n\n# Plan\n`,
    );
    const r = await run(cwd, input("ship", `--plan=docs/plans/${M}/none.md`));
    expect(r.code).toBe(0);
    expect(fs.readFileSync(path.join(cwd, REL, "ship-input-2.md"), "utf-8")).not.toContain(
      "## Plan",
    );
  });

  it("newerThanPlan counts the comments posted after the plan's last commit, by author date", async () => {
    const cwd = withIssue();
    const plan = `docs/plans/${M}/${FID}-plan.md`;
    write(cwd, plan, "# Plan\n");
    commitAt(cwd, plan, "2026-10-01T06:00:00Z");
    // A rebase rewrites the committer date; the author date stays the plan's own.
    expect(authored(cwd, plan)).toBe("2026-10-01T06:00:00.000Z");
    const r = await run(cwd, input("build", ...ISSUE, `--plan=${plan}`));
    expect(r.json).toMatchObject({ newerThanPlan: 1 });
    expect(fs.readFileSync(path.join(cwd, REL, "build-input-2.md"), "utf-8")).toContain(
      `## Plan — ${plan} — last committed 2026-10-01T06:00:00.000Z\n`,
    );
    // Uncommitted edits make the plan the newest text: nothing is newer.
    write(cwd, plan, "# Plan, edited\n");
    expect((await run(cwd, input("build", ...ISSUE, `--plan=${plan}`))).json).toMatchObject({
      newerThanPlan: 0,
    });
  });

  it("a missing prompt file exits 13", async () => {
    const cwd = repo();
    expect((await run(cwd, input("design"))).code).toBe(13);
  });
});

/** What `bkit tips --workflow=build` prints, under its heading; nothing when no tip fires. */
function tipsBlock(cwd: string): string[] {
  const tips = tipsText(false, "build", cwd);
  return tips === "" ? [] : ["## bkit Tips", tips];
}

describe("bkit workflows close --final-return", () => {
  function closable() {
    const cwd = repo();
    const base = git(cwd, "rev-parse", "HEAD");
    write(
      cwd,
      `${REL}/status.jsonl`,
      jsonl([
        {
          type: "workflow-started",
          workflow: "build",
          at: "2020-01-01T00:00:00Z",
          parentSha: base,
        },
      ]),
    );
    write(cwd, "out/build-summary.md", "# Build Summary\n\nAll green.\n");
    return cwd;
  }
  const PLAIN =
    "Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.";

  it("prints the summary verbatim, the issue link, the suggested replies and the tips", async () => {
    const cwd = closable();
    const common = git(cwd, "rev-parse", "--path-format=absolute", "--git-common-dir");
    const session = path.join(common, "bkit-outbox", "sessions", "20261024T010203Z-0a1b2c3d");
    write(
      session,
      "issue-facts.json",
      JSON.stringify({ title: "Export CSV", url: "https://github.com/cbartens/bkit/issues/12" }),
    );
    const r = await run(
      cwd,
      wf(
        "close",
        "build",
        "--final-return",
        "--summary-file=out/build-summary.md",
        "--warning=No issue was found for this run.",
        "--suggest=Want me to ask you the open questions one by one?",
        `--session-dir=${session}`,
      ),
    );
    expect(r.code).toBe(0);
    expect(r.json.finalReturn).toBe(
      [
        "No issue was found for this run.",
        "# Build Summary\n\nAll green.",
        "[Export CSV](https://github.com/cbartens/bkit/issues/12)",
        "## Suggested Replies",
        "Want me to ask you the open questions one by one?",
        PLAIN,
        ...tipsBlock(cwd),
      ].join("\n\n"),
    );
    // The facts were read before the session folder went.
    expect(r.json.sessionRemoved).toBe(true);
  });

  it("without facts or a warning prints the summary, the replies and the tips only", async () => {
    const cwd = closable();
    const r = await run(
      cwd,
      wf("close", "build", "--final-return", "--summary-file=out/build-summary.md"),
    );
    expect(
      r.json.finalReturn.startsWith("# Build Summary\n\nAll green.\n\n## Suggested Replies\n\n"),
    ).toBe(true);
    expect(r.json.finalReturn).toContain(PLAIN);
  });

  it("puts each --line after the summary, in flag order", async () => {
    const cwd = closable();
    const r = await run(
      cwd,
      wf(
        "close",
        "build",
        "--final-return",
        "--summary-file=out/build-summary.md",
        "--line=First.",
        "--line=Second.",
      ),
    );
    expect(
      r.json.finalReturn.startsWith(
        "# Build Summary\n\nAll green.\n\nFirst.\n\nSecond.\n\n## Suggested Replies",
      ),
    ).toBe(true);
  });

  it("refuses --final-return without --summary-file", async () => {
    const r = await run(closable(), wf("close", "build", "--final-return"));
    expect(r.code).toBe(2);
  });

  it("--summary prints the file and keeps a copy in --outbox", async () => {
    const cwd = closable();
    const outbox = path.join(cwd, "box");
    const r = await run(
      cwd,
      wf(
        "close",
        "build",
        "--final-return",
        "--summary=out/build-summary.md",
        "--summary-missing=PR was already merged — no ship summary this run.",
        `--outbox=${outbox}`,
      ),
    );
    expect(r.code).toBe(0);
    expect(r.json.finalReturn.startsWith("# Build Summary\n\nAll green.\n\n")).toBe(true);
    expect(fs.readFileSync(path.join(outbox, "build-summary.md"), "utf-8")).toBe(
      "# Build Summary\n\nAll green.\n",
    );
  });

  it("--summary on a missing file prints the --summary-missing line instead of exiting 13", async () => {
    const cwd = closable();
    const outbox = path.join(cwd, "box");
    write(cwd, "box/none.md", "stale summary from an earlier run\n");
    const r = await run(
      cwd,
      wf(
        "close",
        "build",
        "--final-return",
        "--summary=out/none.md",
        "--summary-missing=PR was already merged — no ship summary this run.",
        `--outbox=${outbox}`,
      ),
    );
    expect(r.code).toBe(0);
    expect(
      r.json.finalReturn.startsWith("PR was already merged — no ship summary this run.\n\n"),
    ).toBe(true);
    expect(fs.readFileSync(path.join(outbox, "none.md"), "utf-8")).toBe(
      "PR was already merged — no ship summary this run.\n",
    );
  });

  it("--summary and --summary-file are exclusive; --summary needs --summary-missing", async () => {
    const cwd = closable();
    const both = wf(
      "close",
      "build",
      "--final-return",
      "--summary=out/build-summary.md",
      "--summary-file=out/build-summary.md",
      "--summary-missing=x",
    );
    expect((await run(cwd, both)).code).toBe(2);
    const bare = wf("close", "build", "--final-return", "--summary=out/build-summary.md");
    expect((await run(cwd, bare)).code).toBe(2);
  });

  it("a missing summary file exits 13 before anything is written", async () => {
    const cwd = closable();
    const r = await run(cwd, wf("close", "build", "--final-return", "--summary-file=out/none.md"));
    expect(r.code).toBe(13);
    expect(rows(statusOf(cwd)).map((x) => x.type)).toEqual(["workflow-started"]);
  });
});

describe("--session-dir on fail / close", () => {
  const sessionIn = (cwd: string) => {
    const common = git(cwd, "rev-parse", "--path-format=absolute", "--git-common-dir");
    const dir = path.join(common, "bkit-outbox", "sessions", "20261024T010203Z-0a1b2c3d");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "prompt.md"), "p\n");
    return dir;
  };

  it("fail deletes the run's session folder", async () => {
    const cwd = repo();
    const dir = sessionIn(cwd);
    const r = await run(cwd, wf("fail", "build", `--session-dir=${dir}`));
    expect(r.code).toBe(0);
    expect(r.json.sessionRemoved).toBe(true);
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("a folder outside the outbox sessions folder is kept", async () => {
    const cwd = repo();
    write(cwd, "keep/prompt.md", "p\n");
    const r = await run(cwd, wf("fail", "build", "--session-dir=keep"));
    expect(r.json.sessionRemoved).toBe(false);
    expect(fs.existsSync(path.join(cwd, "keep/prompt.md"))).toBe(true);
    expect(r.err).toContain("not a session folder");
  });

  it("without --session-dir prints no sessionRemoved", async () => {
    const r = await run(repo(), wf("fail", "build"));
    expect(r.json).not.toHaveProperty("sessionRemoved");
  });
});

describe("bkit workflows summary", () => {
  const SFID = "682-summary-verb";
  const SREL = `docs/plans/${M}/logs/${SFID}`;
  const START = "2020-01-01T00:00:00Z";
  const START_MS = Date.parse(START);
  const done = (step: string, at: string, extra: object = {}) => ({
    type: "step-done",
    workflow: "build",
    step,
    status: "DONE",
    at,
    attempt: 1,
    ...extra,
  });
  const task = (n: number, ticked: boolean) =>
    [
      `<!-- bkit:task ${n} start -->`,
      `- [${ticked ? "x" : " "}] **TASK ${n}:** Do ${n}.`,
      "  - **DONE WHEN:** done.",
      "  - **TEST FIRST:**",
      `    - \`a.test.ts\` \`t${n}\``,
      `<!-- bkit:task ${n} end -->`,
    ].join("\n");
  /** A plan holding `tasks` in GROUP 1. */
  const planOf = (...tasks: string[]) =>
    `# Plan\n\n<!-- bkit:group 1 start -->\n### GROUP 1: Work\n${tasks.join("\n")}\n<!-- bkit:group 1 end -->\n`;

  /** A github-tracked tree with one build run's status rows. */
  function tree(steps: object[], plan?: string) {
    const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-summary-")));
    dirs.push(cwd);
    write(cwd, "package.json", JSON.stringify({ bkit: { tracker: { default: "github" } } }));
    write(
      cwd,
      `${SREL}/status.jsonl`,
      jsonl([{ type: "workflow-started", workflow: "build", at: START }, ...steps]),
    );
    if (plan !== undefined) write(cwd, `docs/plans/${M}/${SFID}-plan.md`, plan);
    return cwd;
  }
  const summarize = (cwd: string, workflow = "build") =>
    run(cwd, [
      "workflows",
      "summary",
      `--workflow=${workflow}`,
      `--file=${path.join(cwd, SREL, "status.jsonl")}`,
    ]);

  it("summary is FAIL when a plan task is not done", async () => {
    const cwd = tree(
      [done("build-plan-verify", "2020-01-01T00:10:00Z", { verdict: "PASS", failures: 0 })],
      planOf(task(1, true), task(2, false)),
    );
    const r = await summarize(cwd);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("FAIL");
    expect(r.json.failures).toBeGreaterThanOrEqual(1);
    expect(r.json.file).toBe(`${SREL}/build-summary.md`);
    const md = fs.readFileSync(path.join(cwd, SREL, "build-summary.md"), "utf-8");
    expect(md.startsWith("Verdict: FAIL\nFailures: ")).toBe(true);
    expect(md).toContain("<!-- verdict:end -->");
  });

  it("summary is CONCERNS when a deferral was written", async () => {
    const cwd = tree(
      [done("build-plan-verify", "2020-01-01T00:10:00Z", { verdict: "PASS", failures: 0 })],
      planOf(task(1, true)),
    );
    write(
      cwd,
      "docs/deferrals.jsonl",
      jsonl([
        { kind: "deferral", key: "old", by: { workflow: "build" }, ts: START_MS - 1 },
        { kind: "deferral", key: "new", by: { workflow: "build" }, ts: START_MS + 5 },
      ]),
    );
    const r = await summarize(cwd);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("CONCERNS");
    expect(r.json.failures).toBe(0);
  });

  it("summary recommends /bkit-debug on FAIL", async () => {
    const failed = tree(
      [done("build-run-tests", "2020-01-01T00:10:00Z", { verdict: "FAIL", failures: 2 })],
      planOf(task(1, true)),
    );
    const r = await summarize(failed);
    expect(r.json.verdict).toBe("FAIL");
    expect(r.json.nextStep).toBe("/bkit-debug #682");

    const passed = tree(
      [done("build-run-tests", "2020-01-01T00:10:00Z", { verdict: "PASS", failures: 0 })],
      planOf(task(1, true)),
    );
    const p = await summarize(passed);
    expect(p.json.verdict).toBe("PASS");
    expect(p.json.nextStep).toBe("/bkit-ship #682");
  });

  it("summary reports the last attempt", async () => {
    const cwd = tree(
      [
        done("build-plan-verify", "2020-01-01T00:10:00Z", {
          verdict: "FAIL",
          failures: 1,
          group: 1,
        }),
        done("build-plan-verify", "2020-01-01T00:20:00Z", {
          verdict: "PASS",
          failures: 0,
          group: 1,
          attempt: 2,
        }),
      ],
      planOf(task(1, true)),
    );
    const r = await summarize(cwd);
    expect(r.json.verdict).not.toBe("FAIL");
    const md = fs.readFileSync(path.join(cwd, SREL, "build-summary.md"), "utf-8");
    const line = md.split("\n").find((l) => l.startsWith("| build-plan-verify"));
    expect(line).toMatch(/\| PASS \| 0 \| 2 \|/);
  });

  it("summary is CONCERNS when a step recorded CONCERNS", async () => {
    const cwd = tree(
      [done("build-plan-verify-holistic", "2020-01-01T00:10:00Z", { verdict: "CONCERNS" })],
      planOf(task(1, true)),
    );
    const r = await summarize(cwd);
    expect(r.json.verdict).toBe("CONCERNS");
    expect(r.json.reasons).toContain("build-plan-verify-holistic CONCERNS");
  });

  it("a design summary carries the organised design's open questions", async () => {
    const cwd = tree([]);
    write(
      cwd,
      `${SREL}/status.jsonl`,
      jsonl([{ type: "workflow-started", workflow: "design", at: START }]),
    );
    write(
      cwd,
      `${SREL}/design-v3-organised.md`,
      "# Design\n\n## Risks & Open Questions\n\n- Which store? Recommended: A.\n\n## Suggested Workstreams\n\nNone\n",
    );
    const r = await summarize(cwd, "design");
    expect(r.code).toBe(0);
    const md = fs.readFileSync(path.join(cwd, SREL, "design-summary.md"), "utf-8");
    expect(md).toContain("## Open Questions\n\n- Which store? Recommended: A.\n");
  });

  it("refuses a status file with no run of the workflow, and a missing one", async () => {
    const cwd = tree([]);
    expect((await summarize(cwd, "ship")).code).toBe(16);
    fs.rmSync(path.join(cwd, SREL, "status.jsonl"));
    expect((await summarize(cwd)).code).toBe(3);
    expect((await summarize(cwd, "release")).code).toBe(2);
  });
});
