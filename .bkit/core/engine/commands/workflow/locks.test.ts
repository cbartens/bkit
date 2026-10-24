import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { WORKFLOW_LOCK_IDLE_S, locksCommand, monthBuckets } from "./locks";

// Real git repos and worktrees per test; a busy machine needs more than the default 5s.
vi.setConfig({ testTimeout: 30_000 });

const dirs: string[] = [];
afterEach(() => {
  vi.useRealTimers();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const FID = "68-digital-agent-mvp";
const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

function repo() {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-locks-")));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", "dev");
  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
  return cwd;
}

const logDir = (root: string, month: string, fid = FID) =>
  path.join(root, "docs", "plans", month, "logs", fid);

function writeStatus(root: string, month: string, rows: object[], fid = FID) {
  fs.mkdirSync(logDir(root, month, fid), { recursive: true });
  fs.writeFileSync(
    path.join(logDir(root, month, fid), "status.jsonl"),
    rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
  );
}

function writeLock(root: string, month: string, line: string, ageS = 0) {
  fs.mkdirSync(logDir(root, month), { recursive: true });
  const file = path.join(logDir(root, month), ".lock");
  fs.writeFileSync(file, `${line}\n`);
  const t = (Date.now() - ageS * 1000) / 1000;
  fs.utimesSync(file, t, t);
  return file;
}

const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString().replace(/\.\d{3}Z$/, "Z");
const MIN = 60_000;
const started = (workflow: string, msAgo: number) => ({
  type: "workflow-started",
  workflow,
  at: iso(msAgo),
});
const step = (workflow: string, msAgo: number) => ({
  type: "step-done",
  workflow,
  step: `${workflow}-x`,
  status: "DONE",
  at: iso(msAgo),
  parentSha: "0".repeat(40),
  artifacts: [],
});

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["locks", ...argv, "--json"], [locksCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const acquire = (...extra: string[]) => [
  "acquire",
  "--kind=workflow",
  "--workflow=build",
  `--fid=${FID}`,
  ...extra,
];

describe("bkit locks acquire --kind=workflow — month bucket", () => {
  it("takes the feature's existing bucket", async () => {
    const cwd = repo();
    fs.mkdirSync(logDir(cwd, "202605"), { recursive: true });
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.month).toBe("202605");
    expect(r.json.path).toBe(path.join(logDir(cwd, "202605"), ".lock"));
    expect(fs.readFileSync(r.json.path, "utf-8")).toMatch(
      new RegExp(`^\\S+Z build ${FID} ${r.json.token}\\n$`),
    );
  });

  it("ignores other features' buckets, even one sharing the issue digits", async () => {
    const cwd = repo();
    fs.mkdirSync(logDir(cwd, "202605"), { recursive: true });
    fs.mkdirSync(logDir(cwd, "202608", "680-longer-issue"), { recursive: true });
    expect(monthBuckets(cwd, FID)).toEqual(["202605"]);
    expect((await run(cwd, acquire())).json.month).toBe("202605");
  });

  it("refuses a feature split across two buckets and takes no lock", async () => {
    const cwd = repo();
    fs.mkdirSync(logDir(cwd, "202605"), { recursive: true });
    fs.mkdirSync(logDir(cwd, "202608"), { recursive: true });
    const r = await run(cwd, acquire());
    expect(r.code).toBe(7);
    expect(r.err).toContain("202605, 202608");
    expect(fs.existsSync(path.join(logDir(cwd, "202605"), ".lock"))).toBe(false);
    expect(fs.existsSync(path.join(logDir(cwd, "202608"), ".lock"))).toBe(false);
  });

  it("a new feature takes this UTC month, not the local one", async () => {
    // 23:30 on 31 Oct in UTC-5 is already 1 Nov in UTC; design / plan used local `date +%Y%m`.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-31T23:30:00-05:00"));
    const cwd = repo();
    const r = await run(cwd, acquire());
    expect(r.json.month).toBe("202611");
  });

  it("--month is used as given", async () => {
    const cwd = repo();
    expect((await run(cwd, acquire("--month=202601"))).json.month).toBe("202601");
    expect((await run(cwd, acquire("--month=2026-01"))).code).toBe(2);
  });
});

describe("bkit locks acquire --kind=workflow — a lock already there", () => {
  const M = "202610";

  it("refuses while the holder's run stepped in the last 30 minutes", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [started("design", 40 * MIN), step("design", 5 * MIN)]);
    const lock = writeLock(cwd, M, "2026-10-01T00:00:00Z design", 40 * 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/already running .*workflow=design, idle \d+s/);
    expect(fs.readFileSync(lock, "utf-8")).toBe("2026-10-01T00:00:00Z design\n");
  });

  it("reclaims an IN_PROGRESS run idle 30+ minutes", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [started("design", 90 * MIN), step("design", 31 * MIN)]);
    writeLock(cwd, M, "2026-10-01T00:00:00Z design", WORKFLOW_LOCK_IDLE_S + 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.reclaimed).toEqual({ holder: "2026-10-01T00:00:00Z design", reason: "stale" });
  });

  it("reclaims a finished (DONE or FAILED) run's old lock", async () => {
    for (const end of ["workflow-done", "workflow-failed"]) {
      const cwd = repo();
      writeStatus(cwd, M, [
        started("design", 90 * MIN),
        step("design", 80 * MIN),
        { type: end, workflow: "design", at: iso(79 * MIN) },
      ]);
      writeLock(cwd, M, "x design", WORKFLOW_LOCK_IDLE_S + 60);
      const r = await run(cwd, acquire());
      expect(r.code, end).toBe(0);
      expect(r.json.reclaimed.reason).toBe("finished");
    }
  });

  it("reclaims a fresh lock over a finished run: the lock file's age is not checked", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [
      started("design", 90 * MIN),
      { type: "workflow-done", workflow: "design", at: iso(80 * MIN) },
    ]);
    writeLock(cwd, M, "x design", 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.reclaimed).toEqual({ holder: "x design", reason: "finished" });
  });

  it("reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [started("design", 90 * MIN), step("design", 60 * MIN)]);
    writeLock(cwd, M, "x design", 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.reclaimed.reason).toBe("stale");
  });

  it("with no status log, a lock of any age is reclaimed as orphaned", async () => {
    for (const age of [60, WORKFLOW_LOCK_IDLE_S + 60]) {
      const cwd = repo();
      writeLock(cwd, M, "x design", age);
      const r = await run(cwd, acquire());
      expect(r.code, `age ${age}`).toBe(0);
      expect(r.json.reclaimed.reason).toBe("orphaned");
    }
  });

  it("reads the feature worktree's status copy before the main checkout's", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [
      started("design", 90 * MIN),
      { type: "workflow-done", workflow: "design", at: iso(80 * MIN) },
    ]);
    writeStatus(path.join(cwd, ".worktrees", FID), M, [
      started("design", 90 * MIN),
      step("design", 2 * MIN),
    ]);
    writeLock(cwd, M, "x design", WORKFLOW_LOCK_IDLE_S + 60);
    expect((await run(cwd, acquire())).code).toBe(1);
  });
});

describe("bkit locks acquire --kind=workflow — ship", () => {
  it("takes the lock in the main checkout, from the worktree being shipped too", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    const r = await run(wt, [
      "acquire",
      "--kind=workflow",
      "--workflow=ship",
      `--fid=${FID}`,
      "--month=202610",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.path).toBe(path.join(logDir(cwd, "202610"), ".lock"));
  });
});

describe("bkit locks acquire — kinds", () => {
  it("knows only the workflow kind", async () => {
    const cwd = repo();
    expect(
      (await run(cwd, ["acquire", "--kind=dev", "--workflow=ship", `--fid=${FID}`])).code,
    ).toBe(2);
    expect((await run(cwd, ["acquire", "--kind=other", "--workflow=x", "--fid=y"])).code).toBe(2);
  });
});

describe("bkit locks release", () => {
  const rel = (kind: string, workflow: string, ...extra: string[]) => [
    "release",
    `--kind=${kind}`,
    `--workflow=${workflow}`,
    `--fid=${FID}`,
    "--month=202610",
    ...extra,
  ];

  it("removes its own lock, by token or by workflow and fid", async () => {
    const cwd = repo();
    const a = await run(cwd, acquire("--month=202610"));
    const r = await run(cwd, rel("workflow", "build", `--token=${a.json.token}`));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ existed: true, released: true, heldBy: null });
    expect(fs.existsSync(a.json.path)).toBe(false);
    await run(cwd, acquire("--month=202610"));
    expect((await run(cwd, rel("workflow", "build"))).json.released).toBe(true);
  });

  it("leaves another owner's lock in place: other workflow, or other token", async () => {
    const cwd = repo();
    const a = await run(cwd, acquire("--month=202610"));
    const other = await run(cwd, rel("workflow", "design"));
    expect(other.code).toBe(4);
    expect(other.json).toMatchObject({ existed: true, released: false });
    expect(other.json.heldBy).toContain("build");
    expect((await run(cwd, rel("workflow", "build", "--token=deadbeef"))).code).toBe(4);
    expect(fs.existsSync(a.json.path)).toBe(true);
  });

  it("releases an old-format lock line by workflow name", async () => {
    const cwd = repo();
    const file = writeLock(cwd, "202610", "2026-10-01T00:00:00Z design");
    expect((await run(cwd, rel("workflow", "design"))).json.released).toBe(true);
    expect(fs.existsSync(file)).toBe(false);
  });

  it("a missing lock is already released", async () => {
    const r = await run(repo(), rel("workflow", "build"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ existed: false, released: false, heldBy: null });
  });

  it("locks release removes the FID shared-checkout record", async () => {
    const cwd = repo();
    const recordAt = (fid: string) =>
      path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${fid}.json`));
    for (const fid of [FID, "69-other"]) {
      fs.mkdirSync(path.dirname(recordAt(fid)), { recursive: true });
      fs.writeFileSync(
        recordAt(fid),
        JSON.stringify({
          fid,
          branch: "dev",
          startSha: git(cwd, "rev-parse", "HEAD"),
          originSha: null,
          aheadAtStart: 0,
          paths: [],
          commits: [],
        }),
      );
    }
    const a = await run(cwd, acquire("--month=202610"));
    const r = await run(cwd, rel("workflow", "build", `--token=${a.json.token}`));
    expect(r.code).toBe(0);
    expect(r.json.released).toBe(true);
    expect(fs.existsSync(recordAt(FID))).toBe(false);
    expect(fs.existsSync(recordAt("69-other"))).toBe(true);
  });
});
