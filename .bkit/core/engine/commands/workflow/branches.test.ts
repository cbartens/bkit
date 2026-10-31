import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import * as prettier from "prettier";
import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { LOCKFILE_REGENERATE, PACKAGE_RUNNER } from "../../shared/package-manager";
import {
  LEDGERS,
  branchesCommand,
  classifyConflict,
  disabledTestsIn,
  readAnchor,
  replayBuild,
  stampAnchor,
} from "./branches";
import { appendRecordCommit, newRecord, writeRecord } from "./ledgers";

// `branches land` retries without waiting, three tries in all.
vi.mock("../../shared/timeouts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../shared/timeouts")>();
  return {
    TIMEOUTS: {
      ...actual.TIMEOUTS,
      LAND_ATTEMPTS: 3,
      LAND_BACKOFF_START_S: 0,
    },
  };
});

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const GITATTRIBUTES = path.join(REPO_ROOT, ".bkit/shared/.gitattributes");

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const tmp = (name: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), `bkit-branches-${name}-`)));
  dirs.push(d);
  return d;
};

const git = (cwd: string, ...args: string[]) => {
  const r = spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: r.stderr ?? "" };
};
const sha = (cwd: string, rev = "HEAD") => git(cwd, "rev-parse", rev).out;
const read = (cwd: string, rel: string) => fs.readFileSync(path.join(cwd, rel), "utf-8");
const write = (cwd: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};

/** Run with extra env (PATH prepends, other keys set) for the spawned tools. */
async function run(cwd: string, argv: string[], env: Record<string, string> = {}) {
  const saved = { ...process.env };
  for (const [k, v] of Object.entries(env)) process.env[k] = v;
  const out: string[] = [];
  const err: string[] = [];
  try {
    const code = await runCommand(["branches", ...argv, "--json"], [branchesCommand], {
      classicVerbs: new Set(),
      cwd,
      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
    });
    return {
      code,
      json: out.length ? (JSON.parse(out.join("")) as Record<string, unknown>) : undefined,
      err: err.join(""),
    };
  } finally {
    process.env = saved;
  }
}

/** A directory of fake executables, `name` → shell body. */
function stubBin(scripts: Record<string, string>): string {
  const bin = tmp("bin");
  for (const [name, body] of Object.entries(scripts)) {
    fs.writeFileSync(path.join(bin, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
  }
  return bin;
}
const withBin = (bin: string) => `${bin}${path.delimiter}${process.env.PATH ?? ""}`;
// Each case drives several real git processes; a busy machine needs more than the 5s default.
const GIT_TIMEOUT = 60_000;
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A repo on `main` with a base commit (the rebase-resolve fixture). */
function makeRepo(name: string): string {
  const dir = tmp(name);
  git(dir, "init", "-q", "-b", "main");
  git(dir, "config", "user.email", "t@t");
  git(dir, "config", "user.name", "t");
  write(dir, "docs/knowledge.jsonl", '{"key":"A","ts":1}\n');
  write(dir, "src.txt", "code v0\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "base");
  return dir;
}

/** Diverge main and feat; leave feat checked out (rebase NOT started). */
function divergeOnly(dir: string, feat: Record<string, string>, main: Record<string, string>) {
  git(dir, "checkout", "-q", "-b", "feat");
  for (const [f, body] of Object.entries(feat)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.appendFileSync(path.join(dir, f), body);
  }
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "feat");
  git(dir, "checkout", "-q", "main");
  for (const [f, body] of Object.entries(main)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.appendFileSync(path.join(dir, f), body);
  }
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "main");
  git(dir, "checkout", "-q", "feat");
}

/** Diverge, then rebase feat onto main so it stops on the conflict. */
function diverge(dir: string, feat: Record<string, string>, main: Record<string, string>) {
  divergeOnly(dir, feat, main);
  git(dir, "rebase", "main");
}

const inRebase = (dir: string) =>
  fs.existsSync(path.join(dir, ".git/rebase-merge")) ||
  fs.existsSync(path.join(dir, ".git/rebase-apply"));

/** A bare `origin` with `dev`, and a clone of it on `dev`. */
function withOrigin(name: string): { origin: string; clone: string } {
  const origin = tmp(`${name}-origin`);
  git(origin, "init", "-q", "--bare", "-b", "dev");
  const seed = tmp(`${name}-seed`);
  git(seed, "init", "-q", "-b", "dev");
  write(seed, "docs/testing.md", "testing v0\n");
  write(seed, "docs/knowledge.jsonl", '{"key":"A","ts":1}\n');
  write(seed, "src.txt", "code v0\n");
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "base");
  git(seed, "push", "-q", origin, "dev");
  const clone = tmp(`${name}-clone`);
  git(clone, "clone", "-q", "-b", "dev", origin, ".");
  git(clone, "config", "user.email", "t@t");
  git(clone, "config", "user.name", "t");
  return { origin, clone };
}

/** Land a commit on origin's dev from a separate clone. */
function landOnDev(origin: string, files: Record<string, string>, message = "dev change") {
  const other = tmp("other");
  git(other, "clone", "-q", "-b", "dev", origin, ".");
  for (const [f, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(other, f)), { recursive: true });
    fs.appendFileSync(path.join(other, f), body);
  }
  git(other, "add", "-A");
  git(other, "commit", "-q", "-m", message);
  git(other, "push", "-q", "origin", "dev");
}

function commit(dir: string, files: Record<string, string>, message: string) {
  for (const [f, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.appendFileSync(path.join(dir, f), body);
  }
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", message);
}

/** The paths a .gitattributes file marks merge=union (comment lines skipped). */
function mergeUnionPaths(gitattributes: string): string[] {
  return gitattributes
    .split("\n")
    .filter((l) => !l.trim().startsWith("#") && /\bmerge=union\b/.test(l))
    .map((l) => l.trim().split(/\s+/)[0]!);
}

// ---------------------------------------------------------------------------
// rebase — classification
// ---------------------------------------------------------------------------

describe("branches rebase: classification", () => {
  it("ledger list does not drift from .gitattributes merge=union", () => {
    const union = mergeUnionPaths(fs.readFileSync(GITATTRIBUTES, "utf-8"));
    for (const p of union) expect(LEDGERS, `${p} carries merge=union`).toContain(p);
    // The one extra: friction ships unlisted but is resolved at rebase time.
    expect(LEDGERS.filter((l) => !union.includes(l))).toEqual([".bkit/friction.jsonl"]);
  });

  it.each([
    "docs/knowledge.jsonl",
    "docs/decisions.jsonl",
    "docs/deferrals.jsonl",
    "docs/failures.jsonl",
    ".bkit/issues.jsonl",
    "docs/roadmap.md",
    ".bkit/stats.jsonl",
    ".bkit/friction.jsonl",
    "docs/plans/202608/logs/234-x/status.jsonl",
  ])("classifies %s as an auto-resolvable ledger", (p) => {
    expect(classifyConflict(p)).toBe("ledger");
  });

  it("classifies every lockfile with a regenerate command as the lockfile shape", () => {
    const names = Object.keys(LOCKFILE_REGENERATE);
    expect(names.length).toBeGreaterThan(1);
    for (const name of names) expect(classifyConflict(name), name).toBe("lockfile");
  });

  it.each([
    "src.txt",
    "package.json",
    ".bkit/config.json",
    "docs/testing.md",
    "docs/plans/202608/234-plan.md",
    // A consumer's own .jsonl is not append-only by assumption.
    "apps/web/data.jsonl",
    "docs/plans/202608/logs/234-x/other.jsonl",
    // A lockfile below the root: the regenerate runs at the root, so refuse.
    "packages/a/Cargo.lock",
  ])("refuses %s", (p) => {
    expect(classifyConflict(p)).toBe("refuse");
  });

  it("matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match", () => {
    expect(classifyConflict("docs/plans/a/b/c/status.jsonl")).toBe("ledger");
    expect(classifyConflict("docs/plans/status.jsonl")).toBe("refuse");
    expect(classifyConflict("docs/knowledgexjsonl")).toBe("refuse");
    expect(classifyConflict("xdocs/knowledge.jsonl")).toBe("refuse");
  });

  it.each([
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "Cargo.lock",
    "go.sum",
    "uv.lock",
  ])("classifies %s (every manager bkit recognises) as the lockfile shape", (p) => {
    expect(classifyConflict(p)).toBe("lockfile");
  });
});

// ---------------------------------------------------------------------------
// rebase — behaviour against real git
// ---------------------------------------------------------------------------

describe("branches rebase: behaviour", { timeout: GIT_TIMEOUT }, () => {
  it("resolves a ledger conflict and completes the rebase, with no .gitattributes", async () => {
    const dir = makeRepo("ledger");
    diverge(
      dir,
      { "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' },
      { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      outcome: "resolved",
      resolved: [{ path: "docs/knowledge.jsonl", how: "union" }],
      refused: null,
    });
    const rows = read(dir, "docs/knowledge.jsonl").split("\n").filter(Boolean);
    expect(rows).toHaveLength(3);
    for (const row of rows) expect(() => JSON.parse(row)).not.toThrow();
    expect(git(dir, "status", "--porcelain").out).toBe("");
    expect(inRebase(dir)).toBe(false);
    expect(r.err).toContain("RESOLVED docs/knowledge.jsonl — union (append-only ledger)");
    expect(r.err).toContain("COMPLETE");
  });

  it("refuses a code conflict and aborts the rebase on the spot", async () => {
    const dir = makeRepo("code");
    diverge(dir, { "src.txt": "feat\n" }, { "src.txt": "main\n" });
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ outcome: "refused", refused: "src.txt", aborted: true });
    expect(r.err).toContain("REFUSE src.txt");
    expect(r.err).toContain("ABORTED");
    expect(inRebase(dir)).toBe(false);
    expect(git(dir, "status", "--porcelain").out).toBe("");
    expect(git(dir, "branch", "--show-current").out).toBe("feat");
    expect(read(dir, "src.txt")).toBe("code v0\nfeat\n");
  });

  it("a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log", async () => {
    const dir = makeRepo("abort-fails");
    diverge(dir, { "src.txt": "feat\n" }, { "src.txt": "main\n" });
    const bin = stubBin({
      git: `case "$*" in *"rebase --abort"*) echo "fatal: abort blocked" >&2; exit 1 ;; esac\nexec "${REAL_GIT}" "$@"`,
    });
    const r = await run(
      dir,
      ["rebase", "--sentinel=logs/.rebase-failed", "--log-file=logs/rebase-resolve-log.md"],
      { PATH: withBin(bin) },
    );
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ outcome: "refused", refused: "src.txt", aborted: false });
    expect(r.err).toContain("ABORT FAILED");
    expect(read(dir, "logs/rebase-resolve-log.md")).toContain(
      "[bkit-rebase] ABORT FAILED — git rebase --abort: fatal: abort blocked",
    );
    expect(read(dir, "logs/.rebase-failed")).toBe("");
    // Nothing aborted it, so the rebase is still in progress for a human.
    expect(inRebase(dir)).toBe(true);
  });

  it("refuses a mixed set without mutating the resolvable ledger in it", async () => {
    const dir = makeRepo("mixed");
    diverge(
      dir,
      { "src.txt": "feat\n", "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' },
      { "src.txt": "main\n", "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ refused: "src.txt", resolved: [], aborted: true });
    expect(read(dir, "docs/knowledge.jsonl")).toBe('{"key":"A","ts":1}\n{"key":"B","ts":2}\n');
  });

  it("--hand-resolve resolves the ledger in a mixed stop and leaves the code path conflicted, the rebase in progress", async () => {
    const dir = makeRepo("hand-mixed");
    diverge(
      dir,
      { "src.txt": "feat\n", "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' },
      { "src.txt": "main\n", "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    const r = await run(dir, ["rebase", "--hand-resolve", "--sentinel=logs/.rebase-failed"]);
    expect(r.code).toBe(24);
    expect(r.json).toMatchObject({
      outcome: "pending",
      resolved: [{ path: "docs/knowledge.jsonl", how: "union" }],
      pending: ["src.txt"],
      refused: "src.txt",
      aborted: false,
      sentinel: null,
    });
    expect(r.err).toContain("PENDING src.txt");
    expect(inRebase(dir)).toBe(true);
    expect(git(dir, "diff", "--name-only", "--diff-filter=U").out).toBe("src.txt");
    expect(fs.existsSync(path.join(dir, "logs/.rebase-failed"))).toBe(false);

    // The hand resolution, then the next call continues the rebase to the end.
    write(dir, "src.txt", "code v0\nmain\nfeat\n");
    git(dir, "add", "src.txt");
    const next = await run(dir, ["rebase", "--hand-resolve"]);
    expect(next.code).toBe(0);
    expect(next.json).toMatchObject({ outcome: "resolved", pending: [] });
    expect(inRebase(dir)).toBe(false);
    expect(read(dir, "docs/knowledge.jsonl").split("\n").filter(Boolean)).toHaveLength(3);
  });

  it("--hand-resolve stops again at each later commit that conflicts", async () => {
    const dir = makeRepo("hand-multi");
    const replace = (body: string, message: string) => {
      write(dir, "src.txt", body);
      git(dir, "commit", "-q", "-am", message);
    };
    git(dir, "checkout", "-q", "-b", "feat");
    replace("feat 1\n", "feat 1");
    replace("feat 2\n", "feat 2");
    git(dir, "checkout", "-q", "main");
    replace("main\n", "main");
    git(dir, "checkout", "-q", "feat");
    git(dir, "rebase", "main");
    const first = await run(dir, ["rebase", "--hand-resolve"]);
    expect(first.code).toBe(24);
    // Keeping both sides here makes the second commit conflict in turn.
    write(dir, "src.txt", "main and feat 1\n");
    git(dir, "add", "src.txt");
    const second = await run(dir, ["rebase", "--hand-resolve"]);
    expect(second.code).toBe(24);
    expect(second.json).toMatchObject({ outcome: "pending", pending: ["src.txt"] });
    write(dir, "src.txt", "feat 2\n");
    git(dir, "add", "src.txt");
    const third = await run(dir, ["rebase", "--hand-resolve"]);
    expect(third.code).toBe(0);
    expect(inRebase(dir)).toBe(false);
    expect(read(dir, "src.txt")).toBe("feat 2\n");
  });

  it("produces byte-identical output to merge=union", async () => {
    const divergeKnowledge = (dir: string) =>
      diverge(
        dir,
        { "docs/knowledge.jsonl": '{"key":"B","ts":5}\n{"key":"B2","ts":6}\n' },
        { "docs/knowledge.jsonl": '{"key":"C","ts":7}\n' },
      );
    // The native git merge driver: .gitattributes names merge=union and git resolves it.
    const attrDir = makeRepo("attr");
    write(attrDir, ".gitattributes", "docs/knowledge.jsonl merge=union\n");
    git(attrDir, "add", "-A");
    git(attrDir, "commit", "-q", "-m", "attr");
    divergeKnowledge(attrDir);
    // bkit's own resolver: no .gitattributes, `bkit branches rebase` resolves the ledger.
    const cmdDir = makeRepo("cmd");
    divergeKnowledge(cmdDir);
    expect((await run(cmdDir, ["rebase"])).code).toBe(0);
    expect(read(cmdDir, "docs/knowledge.jsonl")).toBe(read(attrDir, "docs/knowledge.jsonl"));
  });

  it("restores a trailing newline so the next append starts on its own line", async () => {
    const dir = makeRepo("noeol");
    diverge(
      dir,
      { "docs/knowledge.jsonl": '{"key":"B","ts":2}' },
      { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    expect((await run(dir, ["rebase"])).code).toBe(0);
    const body = read(dir, "docs/knowledge.jsonl");
    expect(body.endsWith("\n")).toBe(true);
    for (const row of body.split("\n").filter(Boolean)) expect(() => JSON.parse(row)).not.toThrow();
  });

  it("skips a commit the resolution emptied instead of stalling the rebase", async () => {
    const dir = makeRepo("empty");
    diverge(
      dir,
      { "docs/knowledge.jsonl": '{"key":"SAME","ts":2}\n' },
      { "docs/knowledge.jsonl": '{"key":"SAME","ts":2}\n{"key":"D","ts":4}\n' },
    );
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ outcome: "resolved", skippedCommits: 1 });
    expect(r.err).toContain("SKIPPED");
    expect(
      read(dir, "docs/knowledge.jsonl")
        .split("\n")
        .filter((l) => l.includes("SAME")),
    ).toHaveLength(1);
  });

  it("keeps going when the skip lands on a next commit that conflicts again", async () => {
    // Deviation from the shell, which refused here: `git rebase --skip` exits
    // non-zero when the commit after the skipped one conflicts, which is just
    // the next round, not a stuck rebase.
    const dir = makeRepo("skip-then-conflict");
    git(dir, "checkout", "-q", "-b", "feat");
    commit(dir, { "docs/knowledge.jsonl": '{"key":"SAME","ts":2}\n' }, "feat 1");
    commit(dir, { "docs/knowledge.jsonl": '{"key":"B","ts":5}\n' }, "feat 2");
    git(dir, "checkout", "-q", "main");
    commit(dir, { "docs/knowledge.jsonl": '{"key":"SAME","ts":2}\n{"key":"D","ts":4}\n' }, "main");
    git(dir, "checkout", "-q", "feat");
    git(dir, "rebase", "main");
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ outcome: "resolved", skippedCommits: 1 });
    expect(inRebase(dir)).toBe(false);
    const rows = read(dir, "docs/knowledge.jsonl").split("\n").filter(Boolean);
    expect(rows.map((l) => (JSON.parse(l) as { key: string }).key).sort()).toEqual([
      "A",
      "B",
      "D",
      "SAME",
    ]);
  });

  it("refuses a union that leaves a line which is not JSON", async () => {
    const dir = makeRepo("torn");
    diverge(
      dir,
      { "docs/knowledge.jsonl": "not json\n" },
      { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ refused: "docs/knowledge.jsonl", reason: "resolution failed" });
    expect(inRebase(dir)).toBe(false);
  });

  it("unions docs/roadmap.md without de-duplicating its repeated lines", async () => {
    const dir = makeRepo("roadmap");
    write(dir, "docs/roadmap.md", "# Roadmap\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "roadmap");
    diverge(dir, { "docs/roadmap.md": "## A\n## A\n" }, { "docs/roadmap.md": "## B\n" });
    expect((await run(dir, ["rebase"])).code).toBe(0);
    const body = read(dir, "docs/roadmap.md");
    expect(body.split("\n").filter((l) => l === "## A")).toHaveLength(2);
    expect(body).toContain("## B");
  });

  it("resolves a lockfile from the rebase target's copy, then regenerates it", async () => {
    // Deviation from the shell, whose `--theirs` took the feature branch's copy:
    // during a rebase `--theirs` is the commit being replayed.
    const lockfile = "uv.lock";
    const tool = LOCKFILE_REGENERATE[lockfile]![0]!;
    const bin = stubBin({ [tool]: `echo "# regenerated" >> ${lockfile}` });
    const dir = makeRepo("lockfile");
    write(dir, lockfile, "lock v0\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "lock");
    diverge(dir, { [lockfile]: "feat pin\n" }, { [lockfile]: "dev pin\n" });
    const r = await run(dir, ["rebase"], { PATH: withBin(bin) });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ resolved: [{ path: lockfile, how: "lockfile" }] });
    expect(read(dir, lockfile)).toBe("lock v0\ndev pin\n# regenerated\n");
  });

  it("refuses a lockfile whose regenerate command fails", async () => {
    const lockfile = "uv.lock";
    const bin = stubBin({ [LOCKFILE_REGENERATE[lockfile]![0]!]: "exit 1" });
    const dir = makeRepo("lockfail");
    write(dir, lockfile, "lock v0\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "lock");
    diverge(dir, { [lockfile]: "feat\n" }, { [lockfile]: "dev\n" });
    const r = await run(dir, ["rebase"], { PATH: withBin(bin) });
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ refused: lockfile, reason: "resolution failed" });
  });

  it("--sentinel and --log-file record a refusal and survive the abort", async () => {
    const dir = makeRepo("sentinel-write");
    diverge(dir, { "src.txt": "feat\n" }, { "src.txt": "main\n" });
    write(dir, "logs/.rebase-failed", "stale");
    const r = await run(dir, [
      "rebase",
      "--sentinel=logs/.rebase-failed",
      "--log-file=logs/rebase-resolve-log.md",
    ]);
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ outcome: "refused", sentinel: "logs/.rebase-failed" });
    expect(inRebase(dir)).toBe(false);
    expect(read(dir, "logs/.rebase-failed")).toBe("");
    expect(read(dir, "logs/rebase-resolve-log.md")).toMatch(/^\[bkit-rebase\] REFUSE src\.txt/);
    expect(read(dir, "logs/rebase-resolve-log.md")).toContain("[bkit-rebase] ABORTED");
  });

  it("removes a stale sentinel when the rebase succeeds", async () => {
    const dir = makeRepo("sentinel-clear");
    diverge(
      dir,
      { "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' },
      { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' },
    );
    write(dir, "logs/.rebase-failed", "");
    const r = await run(dir, ["rebase", "--sentinel=logs/.rebase-failed"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ sentinel: null });
    expect(fs.existsSync(path.join(dir, "logs/.rebase-failed"))).toBe(false);
  });

  it("exits 4 when no rebase is in progress", async () => {
    const dir = makeRepo("none");
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(4);
    expect(r.json).toBeUndefined();
  });

  it("resolves two ledgers conflicting in the same commit in one pass", async () => {
    const dir = makeRepo("two-ledgers");
    write(dir, ".bkit/friction.jsonl", '{"key":"F","ts":1}\n');
    write(dir, "docs/plans/202610/logs/1-x/status.jsonl", '{"key":"S","ts":1}\n');
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "ledgers");
    diverge(
      dir,
      {
        ".bkit/friction.jsonl": '{"key":"F2","ts":2}\n',
        "docs/plans/202610/logs/1-x/status.jsonl": '{"key":"S2","ts":2}\n',
      },
      {
        ".bkit/friction.jsonl": '{"key":"F3","ts":3}\n',
        "docs/plans/202610/logs/1-x/status.jsonl": '{"key":"S3","ts":3}\n',
      },
    );
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ outcome: "resolved", skippedCommits: 0 });
    expect((r.json?.resolved as Array<{ path: string }>).map((x) => x.path).sort()).toEqual([
      ".bkit/friction.jsonl",
      "docs/plans/202610/logs/1-x/status.jsonl",
    ]);
    expect(inRebase(dir)).toBe(false);
    for (const [f, keys] of [
      [".bkit/friction.jsonl", ["F", "F2", "F3"]],
      ["docs/plans/202610/logs/1-x/status.jsonl", ["S", "S2", "S3"]],
    ] as const) {
      const got = read(dir, f)
        .split("\n")
        .filter(Boolean)
        .map((l) => (JSON.parse(l) as { key: string }).key);
      expect(got.sort(), f).toEqual([...keys]);
    }
  });

  it("resolves a conflict in each of two replayed commits across rounds", async () => {
    const dir = makeRepo("two-commits");
    git(dir, "checkout", "-q", "-b", "feat");
    commit(dir, { "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' }, "feat 1");
    commit(dir, { "docs/knowledge.jsonl": '{"key":"B3","ts":4}\n' }, "feat 2");
    git(dir, "checkout", "-q", "main");
    commit(dir, { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' }, "main");
    git(dir, "checkout", "-q", "feat");
    git(dir, "rebase", "main");
    const r = await run(dir, ["rebase"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ outcome: "resolved", skippedCommits: 0 });
    expect(inRebase(dir)).toBe(false);
    expect(git(dir, "log", "--format=%s", "main..HEAD").out).toBe("feat 2\nfeat 1");
    const keys = read(dir, "docs/knowledge.jsonl")
      .split("\n")
      .filter(Boolean)
      .map((l) => (JSON.parse(l) as { key: string }).key);
    expect(keys.sort()).toEqual(["A", "B", "B3", "C"]);
  });
});

// ---------------------------------------------------------------------------
// anchor-stamp / anchor-read
// ---------------------------------------------------------------------------

describe("branches anchor-stamp", () => {
  it("prepends a well-formed block to an unstamped file", async () => {
    const dir = tmp("anchor");
    write(dir, "design.md", "# Some Design\n\nBody.\n");
    const r = await run(dir, ["anchor-stamp", "--file=design.md", "--base-sha=abc123def"]);
    expect(r.code).toBe(0);
    expect(read(dir, "design.md")).toBe(
      "<!-- bkit:anchor\nbaseSha: abc123def\nbaseRef: origin/dev\n-->\n# Some Design\n\nBody.\n",
    );
    expect(r.json).toEqual({
      file: "design.md",
      baseSha: "abc123def",
      baseRef: "origin/dev",
      designPath: null,
      designBaseSha: null,
      bkitVersion: null,
      bkitLatest: null,
      bkitOutdated: null,
      bkitAdvisory: null,
      changed: true,
    });
  });

  it("records the bkit release, and warns visibly under the block when it is outdated", async () => {
    const dir = tmp("anchor");
    git(dir, "init", "-q");
    write(dir, ".bkit/version", JSON.stringify({ pinnedVersion: "5.0.0", canonicalHashes: {} }));
    const cache = path.join(dir, ".git", "bkit-latest-version.json");
    fs.writeFileSync(cache, JSON.stringify({ latest: "5.1.0", checkedAt: Date.now() }));
    write(dir, "report.md", "<!-- Note: report -->\n# Audit\n");
    const r = await run(
      dir,
      ["anchor-stamp", "--file=report.md", "--base-sha=abc", "--base-ref=dev"],
      { BKIT_NO_UPDATE_CHECK: "" },
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ bkitVersion: "5.0.0", bkitLatest: "5.1.0", bkitOutdated: true });
    expect(r.err).toContain("running bkit 5.0.0; 5.1.0 is out");
    const stamped = read(dir, "report.md");
    expect(stamped).toMatch(
      /^<!-- bkit:anchor\nbaseSha: abc\nbaseRef: dev\nbkitVersion: 5\.0\.0\nbkitLatest: 5\.1\.0\n-->\n\n> \*\*Outdated bkit:\*\* generated with bkit 5\.0\.0 while 5\.1\.0 was out.*<!-- bkit:outdated -->\n\n<!-- Note: report -->\n# Audit\n$/,
    );
    const back = await run(dir, ["anchor-read", "--file=report.md", "--field=bkitVersion"], {
      BKIT_NO_UPDATE_CHECK: "",
    });
    expect(back.json).toMatchObject({ value: "5.0.0", bkitLatest: "5.1.0" });

    // After an upgrade the next stamp drops the warning instead of stacking a second.
    write(dir, ".bkit/version", JSON.stringify({ pinnedVersion: "5.1.0", canonicalHashes: {} }));
    const again = await run(
      dir,
      ["anchor-stamp", "--file=report.md", "--base-sha=abc", "--base-ref=dev"],
      { BKIT_NO_UPDATE_CHECK: "" },
    );
    expect(again.json).toMatchObject({ bkitOutdated: false, bkitAdvisory: null });
    expect(read(dir, "report.md")).toBe(
      "<!-- bkit:anchor\nbaseSha: abc\nbaseRef: dev\nbkitVersion: 5.1.0\nbkitLatest: 5.1.0\n-->\n\n<!-- Note: report -->\n# Audit\n",
    );
  });

  it("writes the outdated warning the way prettier formats it, and re-stamps it stably", async () => {
    const outdated = { version: "5.0.0", latest: "5.1.0", outdated: true, advisory: "x" };
    const current = { version: "5.1.0", latest: "5.1.0", outdated: false, advisory: null };
    const options = {
      ...(await prettier.resolveConfig(path.join(REPO_ROOT, "README.md"))),
      parser: "markdown",
    };
    for (const body of ["# Title\n\nBody.\n", "\n# Title\n\nBody.\n"]) {
      const once = stampAnchor(body, "abc", undefined, "dev", outdated);
      expect(await prettier.check(once, options)).toBe(true);
      expect(stampAnchor(once, "abc", undefined, "dev", outdated)).toBe(once);
      expect(
        await prettier.check(stampAnchor(once, "abc", undefined, "dev", current), options),
      ).toBe(true);
    }
  });

  it("stamps an empty bkitLatest and no warning when the newest release is unknown", async () => {
    const dir = tmp("anchor");
    write(dir, ".bkit/version", JSON.stringify({ pinnedVersion: "5.0.0", canonicalHashes: {} }));
    write(dir, "design.md", "# D\n");
    const r = await run(dir, ["anchor-stamp", "--file=design.md", "--base-sha=abc"], {
      BKIT_NO_UPDATE_CHECK: "1",
    });
    expect(r.json).toMatchObject({ bkitVersion: "5.0.0", bkitLatest: null, bkitOutdated: null });
    expect(read(dir, "design.md")).toBe(
      "<!-- bkit:anchor\nbaseSha: abc\nbaseRef: origin/dev\nbkitVersion: 5.0.0\nbkitLatest: \n-->\n# D\n",
    );
  });

  it("--base-ref stamps the given ref instead of origin/dev (audit reports)", async () => {
    const dir = tmp("anchor");
    write(dir, "report.md", "<!-- Note: report -->\n# Audit\n");
    const r = await run(dir, [
      "anchor-stamp",
      "--file=report.md",
      "--base-sha=abc123def",
      "--base-ref=feat/x",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ baseSha: "abc123def", baseRef: "feat/x" });
    expect(read(dir, "report.md")).toBe(
      "<!-- bkit:anchor\nbaseSha: abc123def\nbaseRef: feat/x\n-->\n<!-- Note: report -->\n# Audit\n",
    );
    const back = await run(dir, ["anchor-read", "--file=report.md", "--field=baseRef"]);
    expect(back.json).toMatchObject({ value: "feat/x" });
  });

  it("is idempotent: stamping twice with the same args is byte-identical", async () => {
    const dir = tmp("anchor");
    write(dir, "design.md", "# Some Design\n\nBody.\n");
    await run(dir, ["anchor-stamp", "--file=design.md", "--base-sha=abc123def"]);
    const once = read(dir, "design.md");
    const r = await run(dir, ["anchor-stamp", "--file=design.md", "--base-sha=abc123def"]);
    expect(r.code).toBe(0);
    expect(read(dir, "design.md")).toBe(once);
    expect(r.json?.changed).toBe(false);
  });

  it("re-stamping with a different base replaces the block instead of adding a second", async () => {
    const dir = tmp("anchor");
    write(dir, "design.md", "# Some Design\n");
    await run(dir, ["anchor-stamp", "--file=design.md", "--base-sha=abc123"]);
    await run(dir, ["anchor-stamp", "--file=design.md", "--base-sha=zzz999"]);
    const body = read(dir, "design.md");
    expect(body.split("\n").filter((l) => l === "<!-- bkit:anchor")).toHaveLength(1);
    expect(body).toContain("baseSha: zzz999\n");
    expect(body).not.toContain("baseSha: abc123\n");
  });

  it("plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither", async () => {
    const dir = tmp("anchor");
    write(dir, "docs/plans/202608/x-design.md", "# Design\n");
    write(dir, "plan.md", "# Plan\n");
    await run(dir, ["anchor-stamp", "--file=docs/plans/202608/x-design.md", "--base-sha=def456"]);
    const r = await run(dir, [
      "anchor-stamp",
      "--file=plan.md",
      "--base-sha=abc123",
      "--design=docs/plans/202608/x-design.md",
    ]);
    expect(r.json).toMatchObject({
      designPath: "docs/plans/202608/x-design.md",
      designBaseSha: "def456",
    });
    expect(read(dir, "plan.md")).toContain(
      "designPath: docs/plans/202608/x-design.md\ndesignBaseSha: def456\n-->\n",
    );
    const design = read(dir, "docs/plans/202608/x-design.md");
    expect(design).not.toContain("designPath:");
    expect(design).not.toContain("designBaseSha:");
  });

  it("--design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha", async () => {
    const dir = tmp("anchor");
    write(dir, "plan.md", "# Plan\n");
    await run(dir, ["anchor-stamp", "--file=plan.md", "--base-sha=abc", "--design=nope.md"]);
    expect(read(dir, "plan.md")).not.toContain("designPath:");
    write(dir, "old-design.md", "# Old design, no anchor\n");
    const r = await run(dir, [
      "anchor-stamp",
      "--file=plan.md",
      "--base-sha=abc",
      "--design=old-design.md",
    ]);
    expect(r.json).toMatchObject({ designPath: "old-design.md", designBaseSha: "" });
    expect(read(dir, "plan.md")).toContain("designBaseSha: \n");
  });

  it("fails closed on an empty --base-sha and writes nothing", async () => {
    const dir = tmp("anchor");
    write(dir, "plan.md", "# Plan\n");
    const r = await run(dir, ["anchor-stamp", "--file=plan.md", "--base-sha="]);
    expect(r.code).toBe(2);
    expect(read(dir, "plan.md")).toBe("# Plan\n");
  });

  it("fails closed on a missing file", async () => {
    const dir = tmp("anchor");
    const r = await run(dir, ["anchor-stamp", "--file=does-not-exist.md", "--base-sha=abc123"]);
    expect(r.code).toBe(13);
    expect(fs.existsSync(path.join(dir, "does-not-exist.md"))).toBe(false);
  });

  it("two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard)", async () => {
    const dir = tmp("anchor");
    write(dir, "a.md", "# Same content\n\nBody.\n");
    write(dir, "b.md", "# Same content\n\nBody.\n");
    await run(dir, ["anchor-stamp", "--file=a.md", "--base-sha=abc123"]);
    await run(dir, ["anchor-stamp", "--file=b.md", "--base-sha=abc123"]);
    expect(read(dir, "a.md")).toBe(read(dir, "b.md"));
  });

  it("strips an unterminated block to the end of the file, as sed's range does", () => {
    expect(stampAnchor("# T\n<!-- bkit:anchor\nbaseSha: x\nrest\n", "n")).toBe(
      "<!-- bkit:anchor\nbaseSha: n\nbaseRef: origin/dev\n-->\n# T\n",
    );
  });

  const STAMPED = "<!-- bkit:anchor\nbaseSha: n\nbaseRef: origin/dev\n-->\n";
  it.each([
    ["empty file", "", STAMPED],
    ["no trailing newline (kept as-is)", "# Title\nlast line", `${STAMPED}# Title\nlast line`],
    [
      "two blocks (both removed)",
      "<!-- bkit:anchor\nbaseSha: one\n-->\n# Doc\n<!-- bkit:anchor\nbaseSha: two\n-->\ntail\n",
      `${STAMPED}# Doc\ntail\n`,
    ],
    [
      "close on the line after open (body line kept)",
      "<!-- bkit:anchor\n-->\nbaseSha: outside\n",
      `${STAMPED}baseSha: outside\n`,
    ],
    [
      "inline lookalike marker is not a block",
      "# Plan\n\nbaseSha: x\n<!-- bkit:anchor -->\n",
      `${STAMPED}# Plan\n\nbaseSha: x\n<!-- bkit:anchor -->\n`,
    ],
    ["empty field block", "<!-- bkit:anchor\nbaseSha: \n-->\n", STAMPED],
  ])("stampAnchor: %s", (_, input, expected) => {
    expect(stampAnchor(input, "n")).toBe(expected);
  });
});

describe("branches anchor-read", { timeout: GIT_TIMEOUT }, () => {
  it("round-trips every field", async () => {
    const dir = tmp("anchor");
    write(dir, "d.md", "# D\n");
    await run(dir, ["anchor-stamp", "--file=d.md", "--base-sha=def456"]);
    write(dir, "plan.md", "# Plan\n");
    await run(dir, ["anchor-stamp", "--file=plan.md", "--base-sha=abc123", "--design=d.md"]);
    const r = await run(dir, ["anchor-read", "--file=plan.md", "--field=baseRef"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      baseSha: "abc123",
      baseRef: "origin/dev",
      designPath: "d.md",
      designBaseSha: "def456",
      bkitVersion: null,
      bkitLatest: null,
      value: "origin/dev",
      skip: null,
      landed: null,
    });
  });

  it("is silent on an unstamped file: a baseSha-shaped body line is not the anchor", async () => {
    const dir = tmp("anchor");
    write(dir, "plan.md", "# Plan\n\nbaseSha: not-really-an-anchor\n");
    const r = await run(dir, ["anchor-read", "--file=plan.md", "--field=baseSha"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ baseSha: null, value: null });
  });

  it("matches only inside the block, and the first occurrence wins", () => {
    expect(
      readAnchor("baseSha: body\n<!-- bkit:anchor\nbaseSha: one\nbaseSha: two\n-->\n"),
    ).toEqual({
      baseSha: "one",
    });
  });

  it("exits 13 on a missing file and 2 on an unknown field", async () => {
    const dir = tmp("anchor");
    expect((await run(dir, ["anchor-read", "--file=nope.md"])).code).toBe(13);
    write(dir, "p.md", "# P\n");
    expect((await run(dir, ["anchor-read", "--file=p.md", "--field=bogus"])).code).toBe(2);
  });

  describe("--against (build's Plan Current trigger)", () => {
    async function planRepo() {
      const { origin, clone } = withOrigin("against");
      const base = sha(clone);
      write(clone, "docs/plans/202610/1-x-plan.md", "# Plan\n");
      await run(clone, [
        "anchor-stamp",
        "--file=docs/plans/202610/1-x-plan.md",
        `--base-sha=${base}`,
      ]);
      return { origin, clone, base, plan: "docs/plans/202610/1-x-plan.md" };
    }

    it("skips (12) with no plan file", async () => {
      const { clone } = await planRepo();
      const r = await run(clone, ["anchor-read", "--file=missing-plan.md", "--against=origin/dev"]);
      expect(r.code).toBe(12);
      expect(r.json).toMatchObject({ skip: "no-file" });
    });

    it("skips (12) with no anchor", async () => {
      const { clone } = await planRepo();
      write(clone, "bare-plan.md", "# Plan\n");
      const r = await run(clone, ["anchor-read", "--file=bare-plan.md", "--against=origin/dev"]);
      expect(r.code).toBe(12);
      expect(r.json).toMatchObject({ skip: "no-anchor" });
    });

    it("skips (12) when the base is unreachable in this clone", async () => {
      const { clone } = await planRepo();
      write(clone, "p.md", "# P\n");
      await run(clone, ["anchor-stamp", "--file=p.md", `--base-sha=${"f".repeat(40)}`]);
      const r = await run(clone, ["anchor-read", "--file=p.md", "--against=origin/dev"]);
      expect(r.code).toBe(12);
      expect(r.json).toMatchObject({ skip: "unreachable" });
    });

    it("skips (12) when nothing landed since the base", async () => {
      const { clone, plan } = await planRepo();
      const r = await run(clone, ["anchor-read", `--file=${plan}`, "--against=origin/dev"]);
      expect(r.code).toBe(12);
      expect(r.json).toMatchObject({ skip: "nothing-landed" });
    });

    it("runs (0) with the landed path count once dev moved", async () => {
      const { origin, clone, plan, base } = await planRepo();
      landOnDev(origin, { "src.txt": "moved\n", "new.txt": "n\n" });
      git(clone, "fetch", "-q", "origin", "dev");
      const r = await run(clone, ["anchor-read", `--file=${plan}`, "--against=origin/dev"]);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ baseSha: base, skip: null, landed: 2 });
    });

    it("errors (2) when the --against ref does not exist, instead of skipping", async () => {
      const { clone, plan } = await planRepo();
      const r = await run(clone, ["anchor-read", `--file=${plan}`, "--against=origin/nope"]);
      expect(r.code).toBe(2);
    });
  });

  it.each([
    [
      "two blocks: the first block's value wins",
      "<!-- bkit:anchor\nbaseSha: one\n-->\n# Doc\n<!-- bkit:anchor\nbaseSha: two\n-->\ntail\n",
      { baseSha: "one" },
    ],
    [
      "an unterminated block runs to the end of the file",
      "# Doc\n<!-- bkit:anchor\nbaseSha: x\nbody after\n",
      { baseSha: "x" },
    ],
    [
      "a field after the close line is outside the block",
      "<!-- bkit:anchor\n-->\nbaseSha: outside\n",
      {},
    ],
    [
      "an empty field reads as the empty string",
      "<!-- bkit:anchor\nbaseSha: \n-->\n",
      { baseSha: "" },
    ],
    ["an empty file has no fields", "", {}],
  ])("readAnchor: %s", (_, input, expected) => {
    expect(readAnchor(input)).toEqual(expected);
  });
});

// ---------------------------------------------------------------------------
// push
// ---------------------------------------------------------------------------

describe("branches push", { timeout: GIT_TIMEOUT }, () => {
  const ghStub = () =>
    stubBin({
      gh: 'echo "$@" >> "$GH_STUB_LOG"\nprintf \'%s\' "$GH_STUB_OUT"\nexit "${GH_STUB_EXIT:-0}"',
    });

  function feature(name: string) {
    const { origin, clone } = withOrigin(name);
    git(clone, "checkout", "-q", "-b", "feat/1-x");
    commit(clone, { "a.txt": "a\n" }, "feat(1-x): work");
    return { origin, clone };
  }
  const remoteSha = (origin: string, ref: string) => git(origin, "rev-parse", ref).out;

  it("pushes a feature branch with --force-with-lease and reports the ref pushed", async () => {
    const { origin, clone } = feature("push-feat");
    const r = await run(clone, ["push", "--mode=feature"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      pushed: true,
      ref: "feat/1-x",
      sha: sha(clone),
      forced: true,
      skipped: null,
      prNumber: null,
      replayed: false,
    });
    expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
    // A rebased (rewritten) branch still pushes: that is what the lease is for.
    git(clone, "commit", "-q", "--amend", "-m", "feat(1-x): reworded");
    expect((await run(clone, ["push", "--mode=feature"])).code).toBe(0);
    expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
  });

  it("refuses a dev push with no shared-checkout record (exit 20) and pushes nothing", async () => {
    const { origin, clone } = withOrigin("push-dev-norecord");
    const before = sha(origin, "dev");
    commit(clone, { "a.txt": "a\n" }, "docs: x");
    const r = await run(clone, ["push", "--mode=dev"]);
    expect(r.code).toBe(20);
    expect(r.json).toMatchObject({ pushed: false, ref: null });
    expect(sha(origin, "dev")).toBe(before);
    const named = await run(clone, ["push", "--mode=dev", "--fid=gone"]);
    expect(named.code).toBe(20);
    expect(sha(origin, "dev")).toBe(before);
  });

  it("a feature-mode push of an amended dev is refused rather than forced", async () => {
    const { origin, clone } = withOrigin("push-dev-amended");
    commit(clone, { "a.txt": "a\n" }, "docs: x");
    git(clone, "push", "-q", "origin", "dev");
    git(clone, "commit", "-q", "--amend", "-m", "docs: rewritten");
    const again = await run(clone, ["push", "--mode=feature"]);
    expect(again.code).toBe(8);
    expect(again.json).toMatchObject({ pushed: false, ref: null });
    expect(sha(origin, "dev")).not.toBe(sha(clone));
  });

  it("pushes when the pre-push hook prints more than Node's 1MB default", async () => {
    const { origin, clone } = feature("push-chatty-hook");
    const hook = path.join(clone, ".git", "hooks", "pre-push");
    fs.writeFileSync(hook, "#!/bin/sh\nhead -c 2097152 /dev/zero | tr '\\0' x\necho\nexit 0\n");
    fs.chmodSync(hook, 0o755);
    const r = await run(clone, ["push", "--mode=feature"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, ref: "feat/1-x" });
    expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
  });

  it("runs exactly one git push", async () => {
    const { clone } = feature("push-once");
    const log = path.join(tmp("log"), "calls");
    const bin = stubBin({
      git: `[ "$1" = push ] && echo push >> "${log}"\nexec "${REAL_GIT}" "$@"`,
    });
    expect(
      (await run(clone, ["push", "--mode=feature", "--set-upstream"], { PATH: withBin(bin) })).code,
    ).toBe(0);
    expect(fs.readFileSync(log, "utf-8")).toBe("push\n");
  });

  it("--set-upstream records the upstream", async () => {
    const { clone } = feature("push-u");
    await run(clone, ["push", "--mode=feature", "--set-upstream"]);
    expect(git(clone, "config", "branch.feat/1-x.remote").out).toBe("origin");
  });

  it("refuses with no branch checked out", async () => {
    const { clone } = feature("push-detached");
    git(clone, "checkout", "-q", "--detach");
    const r = await run(clone, ["push", "--mode=feature"]);
    expect(r.code).toBe(5);
  });

  it("--mode=dev refuses a feature checkout", async () => {
    const { clone } = feature("push-notdev");
    expect((await run(clone, ["push", "--mode=dev"])).code).toBe(9);
  });

  it("--require-ci refuses a HEAD carrying a skip-CI token, in any spelling", async () => {
    const { origin, clone } = feature("push-skipci");
    for (const token of ["[skip ci]", "[CI SKIP]", "[no ci]", "[skip actions]", "[actions skip]"]) {
      git(clone, "commit", "-q", "--allow-empty", "-m", `chore(1-x): close bkit ${token}`);
      const r = await run(clone, ["push", "--mode=feature", "--require-ci"]);
      expect(r.code, token).toBe(6);
      expect(r.json).toMatchObject({ pushed: false, skipped: "skip-ci" });
    }
    expect(git(origin, "rev-parse", "--verify", "--quiet", "feat/1-x").ok).toBe(false);
    git(clone, "commit", "-q", "--allow-empty", "-m", "chore(1-x): close-workflow");
    expect((await run(clone, ["push", "--mode=feature", "--require-ci"])).code).toBe(0);
  });

  it("--require-ci also reads the message body, as the HEAD-Subject Assertion did", async () => {
    const { clone } = feature("push-body");
    git(clone, "commit", "-q", "--allow-empty", "-m", "chore(1-x): close", "-m", "body [skip ci]");
    expect((await run(clone, ["push", "--mode=feature", "--require-ci"])).code).toBe(6);
  });

  it("--mode=abort never pushes into an open PR, and says what was not pushed", async () => {
    const { origin, clone } = feature("abort-open");
    const log = path.join(tmp("log"), "gh");
    const r = await run(clone, ["push", "--mode=abort"], {
      PATH: withBin(ghStub()),
      GH_STUB_LOG: log,
      GH_STUB_OUT: '[{"number":12,"state":"OPEN"}]',
    });
    expect(r.code).toBe(7);
    expect(r.json).toEqual({
      pushed: false,
      ref: null,
      sha: null,
      forced: false,
      skipped: "open-pr",
      prNumber: 12,
      replayed: false,
    });
    expect(fs.readFileSync(log, "utf-8")).toContain(
      "pr list --head feat/1-x --state open --json number,state",
    );
    expect(git(origin, "rev-parse", "--verify", "--quiet", "feat/1-x").ok).toBe(false);
  });

  it("--mode=abort pushes when the branch has no open PR", async () => {
    const { clone } = feature("abort-none");
    const r = await run(clone, ["push", "--mode=abort"], {
      PATH: withBin(ghStub()),
      GH_STUB_LOG: path.join(tmp("log"), "gh"),
      GH_STUB_OUT: "[]",
    });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, ref: "feat/1-x", forced: true });
  });

  it("--mode=abort hands the probe to MCP (80) when gh fails", async () => {
    const { origin, clone } = feature("abort-ghfail");
    const r = await run(clone, ["push", "--mode=abort"], {
      PATH: withBin(ghStub()),
      GH_STUB_LOG: path.join(tmp("log"), "gh"),
      GH_STUB_OUT: "",
      GH_STUB_EXIT: "1",
    });
    expect(r.code).toBe(80);
    expect(r.err).toContain("--open-pr");
    expect(git(origin, "rev-parse", "--verify", "--quiet", "feat/1-x").ok).toBe(false);
  });

  it("--mode=abort hands the probe to MCP (80) when gh is not installed", async () => {
    const { clone } = feature("abort-nogh");
    const bin = tmp("only-git");
    fs.symlinkSync(REAL_GIT, path.join(bin, "git"));
    const r = await run(clone, ["push", "--mode=abort"], { PATH: bin });
    expect(r.code).toBe(80);
    expect(r.err).toContain("gh is not available");
  });

  it("--open-pr carries the MCP answer and skips gh", async () => {
    const { clone } = feature("abort-mcp");
    const log = path.join(tmp("log"), "gh");
    const env = { PATH: withBin(ghStub()), GH_STUB_LOG: log, GH_STUB_OUT: "garbage" };
    const open = await run(clone, ["push", "--mode=abort", "--open-pr=5"], env);
    expect(open.code).toBe(7);
    expect(open.json).toMatchObject({ prNumber: 5 });
    expect((await run(clone, ["push", "--mode=abort", "--open-pr=none"], env)).code).toBe(0);
    expect(fs.existsSync(log)).toBe(false);
    expect((await run(clone, ["push", "--mode=abort", "--open-pr=abc"], env)).code).toBe(2);
  });

  it("--mode=abort on dev pushes plainly without probing", async () => {
    const { clone } = withOrigin("abort-dev");
    commit(clone, { "a.txt": "a\n" }, "docs: x");
    const log = path.join(tmp("log"), "gh");
    const r = await run(clone, ["push", "--mode=abort"], {
      PATH: withBin(ghStub()),
      GH_STUB_LOG: log,
      GH_STUB_OUT: "[]",
    });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ ref: "dev", forced: false });
    expect(fs.existsSync(log)).toBe(false);
  });

  it("rejects an unknown mode", async () => {
    const { clone } = feature("push-mode");
    expect((await run(clone, ["push", "--mode=sideways"])).code).toBe(2);
  });
});

describe(
  "branches push — in place on dev with a shared-checkout record",
  { timeout: GIT_TIMEOUT },
  () => {
    const FID = "650-own-push";
    const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").out.split("\n");

    /** A clone on dev with one foreign commit already ahead; the run starts after it. */
    function started(name: string) {
      const { origin, clone } = withOrigin(name);
      commit(clone, { "foreign-before.txt": "f\n" }, "foreign: made before the run");
      writeRecord(clone, newRecord(clone, FID, "dev"));
      return { origin, clone };
    }
    /** A commit the run made: recorded the way the engine records it. */
    function runCommit(clone: string, files: Record<string, string>, message: string) {
      commit(clone, files, message);
      appendRecordCommit(clone, FID, sha(clone));
      return sha(clone);
    }

    it("push after a replay reports the pushToDev sha not HEAD", async () => {
      const { origin, clone } = started("replay-sha");
      runCommit(clone, { "run.txt": "r\n" }, "fix: the run's commit");
      const r = await run(clone, ["push", "--mode=dev"]);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ pushed: true, ref: "dev", forced: false, replayed: true });
      expect(r.json?.sha).toBe(sha(origin, "dev"));
      expect(r.json?.sha).not.toBe(sha(clone));
      expect(remoteLog(origin)).toContain("fix: the run's commit");
      expect(remoteLog(origin)).not.toContain("foreign: made before the run");
      expect(r.err).toContain("git pull --rebase origin dev");
    });

    it("replay build callback cherry-picks exactly the recorded SHAs", () => {
      const { origin, clone } = started("replay-build");
      const first = runCommit(clone, { "one.txt": "1\n" }, "run one");
      commit(clone, { "foreign-mid.txt": "m\n" }, "foreign: mid-run");
      const second = runCommit(clone, { "two.txt": "2\n" }, "run two");
      git(clone, "fetch", "-q", "origin", "dev");
      const dir = path.join(tmp("replay-dir"), "wt");
      git(clone, "worktree", "add", "--detach", dir, "origin/dev");
      replayBuild([first, second])(dir);
      expect(git(dir, "log", "--format=%s", "origin/dev..HEAD").out).toBe("run two\nrun one");
      expect(fs.existsSync(path.join(dir, "foreign-mid.txt"))).toBe(false);
      expect(fs.existsSync(path.join(dir, "two.txt"))).toBe(true);
      expect(sha(origin, "dev")).toBe(sha(dir, "origin/dev"));
    });

    it("replay conflict exits non-zero naming the paths and removes the throwaway checkout", async () => {
      const { origin, clone } = withOrigin("replay-conflict");
      commit(clone, { "src.txt": "foreign line\n" }, "foreign: touches src.txt");
      writeRecord(clone, newRecord(clone, FID, "dev"));
      // The run's commit rewrites the foreign line, so it cannot apply without it.
      fs.writeFileSync(path.join(clone, "src.txt"), "code v0\nrun rewrote it\n");
      git(clone, "add", "-A");
      git(clone, "commit", "-q", "-m", "fix: depends on the foreign commit");
      appendRecordCommit(clone, FID, sha(clone));
      const before = sha(origin, "dev");
      const r = await run(clone, ["push", "--mode=dev"]);
      expect(r.code).toBe(11);
      expect(r.err).toContain("src.txt");
      expect(sha(origin, "dev")).toBe(before);
      expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
      expect(git(clone, "worktree", "list", "--porcelain").out).not.toContain("_land-");
    });

    it("a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal", async () => {
      const { origin, clone } = started("replay-refused");
      runCommit(clone, { "run.txt": "r\n" }, "fix: refused");
      fs.writeFileSync(
        path.join(origin, "hooks", "pre-receive"),
        '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
        { mode: 0o755 },
      );
      const calls = path.join(tmp("calls"), "git");
      const bin = stubBin({
        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
      });
      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
      expect(r.code).toBe(8);
      expect(r.err).toContain("dev is protected");
      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
      expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
      expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
    });

    it("skip-ci HEAD on the replay is refused", async () => {
      const { origin, clone } = started("replay-skipci");
      runCommit(clone, { "run.txt": "r\n" }, "chore(650): close bkit [skip ci]");
      commit(clone, { "foreign-top.txt": "t\n" }, "foreign: top commit, no token");
      const refused = await run(clone, ["push", "--mode=dev", "--require-ci"]);
      expect(refused.code).toBe(6);
      expect(refused.json).toMatchObject({ pushed: false, skipped: "skip-ci" });
      expect(remoteLog(origin)).not.toContain("chore(650): close bkit [skip ci]");
    });

    it("a skip-ci foreign HEAD does not block a replay whose last run commit is clean", async () => {
      const { origin, clone } = started("replay-skipci-foreign");
      runCommit(clone, { "run.txt": "r\n" }, "fix: the run's last commit");
      commit(clone, { "foreign-top.txt": "t\n" }, "foreign: wip [skip ci]");
      const r = await run(clone, ["push", "--mode=dev", "--require-ci"]);
      expect(r.code).toBe(0);
      expect(remoteLog(origin)).toContain("fix: the run's last commit");
    });

    it("abort mode on dev with a record pushes only recorded SHAs", async () => {
      const { origin, clone } = started("replay-abort");
      runCommit(clone, { "run.txt": "r\n" }, "fix: recorded");
      commit(clone, { "foreign-mid.txt": "m\n" }, "foreign: mid-run");
      const calls = path.join(tmp("calls"), "git");
      const bin = stubBin({
        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
      });
      const r = await run(clone, ["push", "--mode=abort"], { PATH: withBin(bin) });
      expect(r.code).toBe(0);
      expect(remoteLog(origin)).toContain("fix: recorded");
      expect(remoteLog(origin)).not.toContain("foreign: mid-run");
      expect(fs.readFileSync(calls, "utf-8")).not.toContain("push origin dev");
    });

    it("a level local dev is a plain push, recording nothing extra", async () => {
      const { origin, clone } = withOrigin("replay-level");
      writeRecord(clone, newRecord(clone, FID, "dev"));
      runCommit(clone, { "run.txt": "r\n" }, "fix: only the run");
      const r = await run(clone, ["push", "--mode=dev"]);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ pushed: true, replayed: false, sha: sha(clone) });
      expect(sha(origin, "dev")).toBe(sha(clone));
    });

    it("a record with no commits pushes nothing", async () => {
      const { origin, clone } = started("replay-empty");
      const before = sha(origin, "dev");
      const r = await run(clone, ["push", "--mode=dev"]);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ pushed: false, skipped: "no-run-commits" });
      expect(sha(origin, "dev")).toBe(before);
    });

    it("without a record the dev push is refused (exit 20), pushing nothing", async () => {
      const { origin, clone } = withOrigin("replay-none");
      const before = sha(origin, "dev");
      commit(clone, { "a.txt": "a\n" }, "docs: x");
      const r = await run(clone, ["push", "--mode=dev"]);
      expect(r.code).toBe(20);
      expect(r.json).toMatchObject({ pushed: false });
      expect(sha(origin, "dev")).toBe(before);
    });
  },
);

// ---------------------------------------------------------------------------
// sync
// ---------------------------------------------------------------------------

/** A feature branch `feat/1-x` one commit ahead of origin/dev. */
function featureBranch(name: string) {
  const { origin, clone } = withOrigin(name);
  git(clone, "checkout", "-q", "-b", "feat/1-x");
  commit(clone, { "a.txt": "a\n" }, "feat(1-x): work");
  return { origin, clone };
}

/** A status.jsonl outside the clone, so `git add -A` never sweeps it into a commit. */
const statusOutside = () => path.join(tmp("status"), "status.jsonl");
const actionRows = (file: string) =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Record<string, unknown>)
        .filter((r) => r.type === "engine-action")
    : [];

describe("branches push --mode=plain", { timeout: GIT_TIMEOUT }, () => {
  it("pushes the branch without a force flag and records the upstream", async () => {
    const { origin, clone } = featureBranch("plain-push");
    const log = path.join(tmp("log"), "calls");
    const bin = stubBin({
      git: `[ "$1" = push ] && echo "$@" >> "${log}"\nexec "${REAL_GIT}" "$@"`,
    });
    const r = await run(clone, ["push", "--mode=plain", "--set-upstream"], { PATH: withBin(bin) });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, ref: "feat/1-x", sha: sha(clone), forced: false });
    expect(fs.readFileSync(log, "utf-8")).toBe("push -u origin feat/1-x\n");
    expect(git(origin, "rev-parse", "feat/1-x").out).toBe(sha(clone));
    expect(git(clone, "config", "branch.feat/1-x.remote").out).toBe("origin");
  });

  it("a rewritten branch is refused, never forced", async () => {
    const { origin, clone } = featureBranch("plain-rewritten");
    expect((await run(clone, ["push", "--mode=plain"])).code).toBe(0);
    git(clone, "commit", "-q", "--amend", "-m", "feat(1-x): reworded");
    const r = await run(clone, ["push", "--mode=plain"]);
    expect(r.code).toBe(8);
    expect(git(origin, "rev-parse", "feat/1-x").out).not.toBe(sha(clone));
  });

  it("refuses dev and main with exit 21 and pushes nothing", async () => {
    const { origin, clone } = withOrigin("plain-dev");
    const before = sha(origin, "dev");
    commit(clone, { "a.txt": "a\n" }, "docs: x");
    const r = await run(clone, ["push", "--mode=plain"]);
    expect(r.code).toBe(21);
    expect(r.err).toContain("Nothing to ship");
    expect(sha(origin, "dev")).toBe(before);
  });

  it("--ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21)", async () => {
    const { origin, clone } = withOrigin("plain-ahead");
    git(clone, "checkout", "-q", "-b", "feat/1-x");
    const none = await run(clone, ["push", "--mode=plain", "--ahead-of=origin/dev"]);
    expect(none.code).toBe(21);
    expect(none.err).toContain("no commits ahead of origin/dev");
    expect(git(origin, "rev-parse", "--verify", "--quiet", "feat/1-x").ok).toBe(false);

    commit(clone, { "a.txt": "a\n" }, "feat(1-x): work");
    landOnDev(origin, { "b.txt": "b\n" });
    const r = await run(clone, ["push", "--mode=plain", "--ahead-of=origin/dev"]);
    expect(r.code).toBe(0);
    // The fetch brought origin/dev up to the remote's dev.
    expect(sha(clone, "origin/dev")).toBe(git(origin, "rev-parse", "dev").out);
  });

  it("refuses a detached HEAD (exit 5)", async () => {
    const { clone } = featureBranch("plain-detached");
    git(clone, "checkout", "-q", "--detach");
    expect((await run(clone, ["push", "--mode=plain"])).code).toBe(5);
  });
});

describe("branches push --commit", { timeout: GIT_TIMEOUT }, () => {
  const args = (file: string, ...more: string[]) => [
    "push",
    "--mode=feature",
    "--require-ci",
    "--commit=chore(1-x): create-pr bkit [verbose ci]",
    `--file=${file}`,
    "--workflow=debug",
    ...more,
  ];

  it("stages everything, makes the marker commit with the auto-route suffix, and pushes it", async () => {
    const { origin, clone } = featureBranch("commit-push");
    write(clone, "new.txt", "n\n");
    const file = statusOutside();
    const r = await run(clone, args(file, "--label=bkit:auto", "--label=bug"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, ref: "feat/1-x", sha: sha(clone) });
    expect(git(clone, "log", "-1", "--pretty=%s").out).toBe(
      "chore(1-x): create-pr bkit [verbose ci] bkit [auto route]",
    );
    expect(git(clone, "show", "--name-only", "--format=", "HEAD").out).toBe("new.txt");
    expect(git(origin, "rev-parse", "feat/1-x").out).toBe(sha(clone));
    expect(actionRows(file)).toEqual([
      expect.objectContaining({ action: "commit", ref: sha(clone) }),
    ]);
  });

  it("the marker commit leaves out a copied-in worktree.copy entry (.env)", async () => {
    const { origin, clone } = featureBranch("commit-copy");
    write(clone, ".env", "SECRET=1\n");
    const r = await run(clone, args(statusOutside()));
    expect(r.code).toBe(0);
    expect(git(clone, "show", "--name-only", "--format=", "HEAD").out).not.toContain(".env");
    expect(git(origin, "show", "--name-only", "--format=", "feat/1-x").out).not.toContain(".env");
    expect(git(clone, "status", "--porcelain").out).toBe("?? .env");
  });

  it("an empty tree still gets the marker commit, without the suffix when bkit:auto is absent", async () => {
    const { clone } = featureBranch("commit-empty");
    const before = sha(clone);
    const r = await run(clone, args(statusOutside()));
    expect(r.code).toBe(0);
    expect(sha(clone, "HEAD~1")).toBe(before);
    expect(git(clone, "log", "-1", "--pretty=%s").out).toBe(
      "chore(1-x): create-pr bkit [verbose ci]",
    );
  });

  it("a re-run after the commit landed pushes again without a second marker commit", async () => {
    const { origin, clone } = featureBranch("commit-rerun");
    const file = statusOutside();
    expect((await run(clone, args(file))).code).toBe(0);
    const first = sha(clone);
    const again = await run(clone, args(file));
    expect(again.code).toBe(0);
    expect(again.json).toMatchObject({ deduped: true });
    expect(sha(clone)).toBe(first);
    expect(git(origin, "rev-parse", "feat/1-x").out).toBe(first);
    expect(actionRows(file)).toHaveLength(1);
  });

  it("--commit needs --file and --workflow, and refuses a skip-CI token in the message", async () => {
    const { clone } = featureBranch("commit-usage");
    expect(
      (await run(clone, ["push", "--mode=feature", "--commit=chore: x", "--workflow=debug"])).code,
    ).toBe(2);
    const before = sha(clone);
    const r = await run(clone, [
      "push",
      "--mode=feature",
      "--require-ci",
      "--commit=chore(1-x): x [skip ci]",
      `--file=${statusOutside()}`,
      "--workflow=debug",
    ]);
    expect(r.code).toBe(6);
    expect(sha(clone)).toBe(before);
  });
});

describe("branches fast-forward", { timeout: GIT_TIMEOUT }, () => {
  it("fetches and fast-forwards onto the remote branch", async () => {
    const { origin, clone } = featureBranch("ff-ok");
    git(clone, "push", "-q", "origin", "feat/1-x");
    const other = tmp("ff-other");
    git(other, "clone", "-q", "-b", "feat/1-x", origin, ".");
    commit(other, { "b.txt": "b\n" }, "feat(1-x): more");
    git(other, "push", "-q", "origin", "feat/1-x");
    const r = await run(clone, ["fast-forward", "--onto=origin/feat/1-x"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ moved: true, head: sha(other) });
    expect(sha(clone)).toBe(sha(other));
  });

  it("an up-to-date branch is a no-op", async () => {
    const { clone } = featureBranch("ff-same");
    git(clone, "push", "-q", "origin", "feat/1-x");
    const r = await run(clone, ["fast-forward", "--onto=origin/feat/1-x"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ moved: false });
  });

  it("refuses a diverged branch with exit 22 and leaves HEAD where it was", async () => {
    const { origin, clone } = featureBranch("ff-diverged");
    git(clone, "push", "-q", "origin", "feat/1-x");
    const other = tmp("ff-div-other");
    git(other, "clone", "-q", "-b", "feat/1-x", origin, ".");
    commit(other, { "b.txt": "b\n" }, "feat(1-x): theirs");
    git(other, "push", "-q", "origin", "feat/1-x");
    commit(clone, { "c.txt": "c\n" }, "feat(1-x): mine");
    const before = sha(clone);
    const r = await run(clone, ["fast-forward", "--onto=origin/feat/1-x"]);
    expect(r.code).toBe(22);
    expect(r.err).toContain("diverged");
    expect(sha(clone)).toBe(before);
  });

  it("a fetch that fails exits 10", async () => {
    const { clone } = featureBranch("ff-nofetch");
    const r = await run(clone, ["fast-forward", "--onto=origin/feat/never-pushed"]);
    expect(r.code).toBe(10);
  });
});

describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
  it("--paths finds a changed path matching the pattern (exit 0) and names it", async () => {
    const { clone } = featureBranch("scan-paths");
    commit(clone, { "db/migrations/001.sql": "create\n" }, "feat(1-x): migrate");
    const r = await run(clone, [
      "scan-diff",
      "--base=origin/dev",
      "--paths=(^|/)(migrations|migrate)/",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ found: true, paths: ["db/migrations/001.sql"] });
  });

  it("--paths with no match exits 1", async () => {
    const { clone } = featureBranch("scan-nopaths");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--paths=(^|/)migrations/"]);
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ found: false, paths: [] });
  });

  it("--paths that is not a valid pattern is a usage error (exit 2)", async () => {
    const { clone } = featureBranch("scan-badpaths");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--paths=(unclosed"]);
    expect(r.code).toBe(2);
  });

  it("--marker finds an added line carrying the marker outside docs/plans", async () => {
    const { clone } = featureBranch("scan-marker");
    commit(clone, { "docs/plans/p.md": "[DEBUG-OBSERVE] note\n" }, "docs");
    const clean = await run(clone, ["scan-diff", "--base=origin/dev", "--marker=[DEBUG-OBSERVE]"]);
    expect(clean.code).toBe(1);
    commit(clone, { "src/x.ts": "log('[DEBUG-OBSERVE] x')\n" }, "probe");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--marker=[DEBUG-OBSERVE]"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
  });

  it("--marker reads a diff over 1 MiB", async () => {
    const { clone } = featureBranch("scan-bigdiff");
    const big = `${"x".repeat(99)}\n`.repeat(12_000);
    commit(clone, { "pnpm-lock.yaml": big, "src/x.ts": "log('[DEBUG-OBSERVE] x')\n" }, "big");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--marker=[DEBUG-OBSERVE]"]);
    expect(r.err).toBe("");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
  });

  it("--expect-none turns the answer round: 0 when nothing matched, 1 naming the hits", async () => {
    const { clone } = featureBranch("scan-expect-none");
    const args = ["scan-diff", "--base=origin/dev", "--marker=[DEBUG-OBSERVE]", "--expect-none"];
    const clean = await run(clone, args);
    expect(clean.code).toBe(0);
    expect(clean.json).toEqual({ found: false, paths: [] });
    commit(clone, { "src/x.ts": "log('[DEBUG-OBSERVE] x')\n" }, "probe");
    const r = await run(clone, args);
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
    expect(r.err).toContain("src/x.ts");
  });

  it("--code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed", async () => {
    const { clone } = featureBranch("scan-code");
    commit(clone, { "docs/plans/202610/logs/1-x/log.md": "x\n", "docs/k.jsonl": "{}\n" }, "logs");
    expect((await run(clone, ["scan-diff", "--base=HEAD~1", "--code"])).code).toBe(1);
    commit(clone, { "src/y.ts": "y\n" }, "code");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--code"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ found: true, paths: ["src/y.ts"] });
  });

  // The fixture's skip marker is spelled in two pieces, as the slop plugin spells its own
  // patterns: this file then carries no skip marker of its own for the scanner to find.
  const SKIP = `${"it"}.${"skip"}`;
  /** A test file: one passing test, then `extra` lines after it. */
  const testFile = (...extra: string[]) =>
    ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ...extra, ""].join("\n");

  it("scan-diff finds an added skip", async () => {
    const { clone } = featureBranch("scan-disabled");
    write(clone, "src/a.test.ts", testFile());
    commit(clone, {}, "test");
    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
    commit(clone, {}, "skip");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
    expect(r.code).toBe(1);
  });

  it("scan-diff ignores a skip predating the base", async () => {
    const { clone } = featureBranch("scan-disabled-old");
    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
    commit(clone, {}, "skip");
    write(clone, "src/b.ts", "b\n");
    commit(clone, {}, "other");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(0);
  });

  it("scan-diff reports a disabled test with its line", async () => {
    const { clone } = featureBranch("scan-disabled-line");
    write(clone, "src/a.test.ts", testFile());
    commit(clone, {}, "test");
    write(clone, "src/a.test.ts", testFile(`${SKIP}('drops b', () => {});`));
    commit(clone, {}, "skip");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
    expect(r.code).toBe(1);
    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 4, test: "drops b" }]);
  });

  it("scan-diff exits 0 on a diff that adds no disabled test", async () => {
    const { clone } = featureBranch("scan-disabled-none");
    write(clone, "src/a.test.ts", testFile());
    commit(clone, {}, "test");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
    expect(r.code).toBe(0);
    expect(r.json?.disabled).toEqual([]);
  });

  it("scan-diff ignores a removed comment in a test file", async () => {
    const { clone } = featureBranch("scan-disabled-comment");
    write(clone, "src/a.test.ts", testFile("// should not be reached"));
    commit(clone, {}, "test");
    write(clone, "src/a.test.ts", testFile());
    commit(clone, {}, "comment gone");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(0);
    expect(r.json?.disabled).toEqual([]);
  });

  it("scan-diff ignores an assertion moved within the file", async () => {
    const { clone } = featureBranch("scan-disabled-move");
    write(
      clone,
      "src/a.test.ts",
      [
        "it('keeps a', () => {",
        "  expect(1).toBe(1);",
        "});",
        "",
        "it('keeps b', () => {",
        "  expect(2).toBe(2);",
        "});",
        "",
      ].join("\n"),
    );
    commit(clone, {}, "test");
    write(
      clone,
      "src/a.test.ts",
      [
        "it('keeps a', () => {",
        "  expect(1).toBe(1);",
        "  expect(2).toBe(2);",
        "});",
        "",
        "it('keeps b', () => {",
        "  doSomething();",
        "});",
        "",
      ].join("\n"),
    );
    commit(clone, {}, "move");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(0);
    expect(r.json?.disabled).toEqual([]);
  });

  it("scan-diff still reports a removed assertion", async () => {
    const { clone } = featureBranch("scan-disabled-drop");
    write(
      clone,
      "src/a.test.ts",
      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join(
        "\n",
      ),
    );
    commit(clone, {}, "test");
    write(
      clone,
      "src/a.test.ts",
      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
    );
    commit(clone, {}, "drop");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(1);
    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 3, test: "keeps a" }]);
  });

  it("scan-diff reports an assertion re-added only outside the test file", async () => {
    const { clone } = featureBranch("scan-disabled-cross-file");
    write(
      clone,
      "src/a.test.ts",
      ["it('keeps a', () => {", "  expect(1).toBe(1);", "  expect(2).toBe(2);", "});", ""].join(
        "\n",
      ),
    );
    commit(clone, {}, "test");
    write(
      clone,
      "src/a.test.ts",
      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
    );
    write(clone, "src/notes.md", ["# Notes", "", "  expect(2).toBe(2);", ""].join("\n"));
    commit(clone, {}, "drop");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(1);
    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 3, test: "keeps a" }]);
  });

  it("scan-diff finds an added pytest mark skip", async () => {
    const { clone } = featureBranch("scan-disabled-pytest");
    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
    commit(clone, {}, "test");
    write(
      clone,
      "tests/test_a.py",
      ['@pytest.mark.skip(reason="flaky")', "def test_a():", "    assert 1 == 1", ""].join("\n"),
    );
    commit(clone, {}, "skip");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
    expect(r.code).toBe(1);
    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 1, test: "test_a" }]);
  });

  it("scan-diff finds an added unittest skip", async () => {
    const { clone } = featureBranch("scan-disabled-unittest");
    const body = (decorator: string[]) =>
      [
        "import unittest",
        "",
        "class A(unittest.TestCase):",
        ...decorator,
        "    def test_a(self):",
        "        self.assertEqual(1, 1)",
        "",
      ].join("\n");
    write(clone, "tests/test_a.py", body([]));
    commit(clone, {}, "test");
    write(clone, "tests/test_a.py", body(['    @unittest.skip("flaky")']));
    commit(clone, {}, "skip");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(1);
    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 4, test: "test_a" }]);
  });

  it("scan-diff finds an added bare skip call", async () => {
    const { clone } = featureBranch("scan-disabled-pyskip");
    write(clone, "tests/test_a.py", "def test_a():\n    assert 1 == 1\n");
    commit(clone, {}, "test");
    write(
      clone,
      "tests/test_a.py",
      ["def test_a():", '    pytest.skip("flaky")', "    assert 1 == 1", ""].join("\n"),
    );
    commit(clone, {}, "skip");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(1);
    expect(r.json?.disabled).toEqual([{ file: "tests/test_a.py", line: 2, test: "test_a" }]);
  });

  it("scan-diff ignores a quoted skip in a documentation file", async () => {
    const { clone } = featureBranch("scan-disabled-doc");
    // Spelled in pieces, as the slop plugin spells its own patterns: this file then carries
    // no skip marker of its own for either scanner to find.
    const quoted = `${"test"}.${"skip"}`;
    const nested = `${"describe"}.${"skip"}`;
    write(
      clone,
      "docs/guide.md",
      [
        "# Testing",
        "",
        `Never call \`${quoted}\` in a spec; a \`${nested}\` hides regressions`,
        "",
      ].join("\n"),
    );
    commit(clone, {}, "docs");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
    expect(r.code).toBe(0);
    expect(r.json?.disabled).toEqual([]);
  });

  it("scan-diff ignores a marker literal in a non-test source file", async () => {
    const { clone } = featureBranch("scan-disabled-literal");
    write(clone, "src/markers.ts", "const MARKERS = [/@Disabled\\b/];\n");
    commit(clone, {}, "markers");
    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
    expect(r.code).toBe(0);
    expect(r.json?.disabled).toEqual([]);
  });

  it("scan-diff ignores an assertion whose expectation changed", async () => {
    const { clone } = featureBranch("scan-disabled-expect");
    write(
      clone,
      "src/a.test.ts",
      ["it('a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
    );
    commit(clone, {}, "test");
    write(
      clone,
      "src/a.test.ts",
      ["it('a', () => {", "  expect(1).toBe(2);", "});", ""].join("\n"),
    );
    commit(clone, {}, "tighten");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(0);
    expect(r.json?.disabled).toEqual([]);
  });

  it("scan-diff ignores an assertion replaced by another in the same test", async () => {
    const { clone } = featureBranch("scan-disabled-replace");
    write(
      clone,
      "src/a.test.ts",
      ["it('a', () => {", "  expect(a).toEqual([]);", "});", ""].join("\n"),
    );
    commit(clone, {}, "test");
    write(
      clone,
      "src/a.test.ts",
      ["it('a', () => {", "  expect(a).toEqual([expect.objectContaining({})]);", "});", ""].join(
        "\n",
      ),
    );
    commit(clone, {}, "replace");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(0);
    expect(r.json?.disabled).toEqual([]);
  });

  it("scan-diff reports a deleted test file", async () => {
    const { clone } = featureBranch("scan-disabled-deleted");
    write(
      clone,
      "src/a.test.ts",
      ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ""].join("\n"),
    );
    commit(clone, {}, "test");
    git(clone, "rm", "-q", "src/a.test.ts");
    commit(clone, {}, "rm");
    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
    expect(r.code).toBe(1);
    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 2, test: "keeps a" }]);
  });

  it("scan-diff never opens a symlinked test file's outside target", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-scan-link-"));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-scan-outside-"));
    const skip = `${"test"}.${"skip"};`;
    try {
      fs.writeFileSync(path.join(outside, "secret"), "it('leaked secret line', () => {\n\n");
      fs.mkdirSync(path.join(root, "src"));
      fs.symlinkSync(path.join(outside, "secret"), path.join(root, "src", "a.test.ts"));
      fs.writeFileSync(path.join(root, "src", "b.test.ts"), "it('in repo', () => {\n  x;\n");
      const diff = (file: string) =>
        [
          `diff --git a/${file} b/${file}`,
          `--- a/${file}`,
          `+++ b/${file}`,
          "@@ -1,0 +2,1 @@",
          `+  ${skip}`,
        ].join("\n");
      const found = disabledTestsIn(
        [diff("src/a.test.ts"), diff("src/b.test.ts"), ""].join("\n"),
        root,
      );
      expect(found.map((d) => d.test)).toEqual([skip, "in repo"]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it("needs exactly one of --paths, --marker, --code; an unknown base exits 23", async () => {
    const { clone } = featureBranch("scan-usage");
    expect((await run(clone, ["scan-diff", "--base=origin/dev"])).code).toBe(2);
    expect(
      (await run(clone, ["scan-diff", "--base=origin/dev", "--code", "--marker=x"])).code,
    ).toBe(2);
    expect((await run(clone, ["scan-diff", "--base=nope", "--code"])).code).toBe(23);
  });
});

describe("branches force-build", { timeout: GIT_TIMEOUT }, () => {
  /** gh stub: `pr list` prints GH_STUB_LIST, `pr view` prints GH_STUB_VIEW, every call is logged. */
  const ghPr = () =>
    stubBin({
      gh: [
        'echo "$@" >> "$GH_STUB_LOG"',
        'case "$1 $2" in',
        '  "pr list") printf \'%s\' "$GH_STUB_LIST" ;;',
        '  "pr view") printf \'%s\' "$GH_STUB_VIEW" ;;',
        '  "pr edit") exit "${GH_STUB_EDIT_EXIT:-0}" ;;',
        "esac",
      ].join("\n"),
    });
  const pr = (title: string) =>
    JSON.stringify({ number: 9, title, url: "u", state: "OPEN", headRefOid: "x" });
  const args = (file: string, ...more: string[]) => [
    "force-build",
    "--fid=1-x",
    `--file=${file}`,
    "--workflow=build",
    ...more,
  ];

  it("with an open PR: adds the marker to the title, then pushes the empty marker commit", async () => {
    const { origin, clone } = featureBranch("fb-pr");
    git(clone, "push", "-q", "origin", "feat/1-x");
    const log = path.join(tmp("log"), "gh");
    const file = statusOutside();
    const r = await run(clone, args(file, "--label=bkit:auto"), {
      PATH: withBin(ghPr()),
      GH_STUB_LOG: log,
      GH_STUB_LIST: `[${pr("feat(1-x): thing")}]`,
    });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      prNumber: 9,
      titleChanged: true,
      pushed: true,
      deduped: false,
      commit: sha(clone),
    });
    expect(fs.readFileSync(log, "utf-8")).toContain(
      "pr edit 9 --title feat(1-x): thing bkit [force build]",
    );
    expect(git(clone, "log", "-1", "--pretty=%s").out).toBe(
      "chore(1-x): force build bkit [force build] bkit [auto route]",
    );
    expect(git(clone, "diff", "--name-only", "HEAD~1", "HEAD").out).toBe("");
    expect(git(origin, "rev-parse", "feat/1-x").out).toBe(sha(clone));
    expect(actionRows(file)).toHaveLength(1);
  });

  it("a title that already carries the marker is left alone", async () => {
    const { clone } = featureBranch("fb-titled");
    const log = path.join(tmp("log"), "gh");
    const r = await run(clone, args(statusOutside()), {
      PATH: withBin(ghPr()),
      GH_STUB_LOG: log,
      GH_STUB_LIST: `[${pr("feat(1-x): thing bkit [force build]")}]`,
    });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ titleChanged: false, pushed: true });
    expect(fs.readFileSync(log, "utf-8")).not.toContain("pr edit");
  });

  it("with no open PR: pushes the marker commit and edits no title", async () => {
    const { origin, clone } = featureBranch("fb-nopr");
    const log = path.join(tmp("log"), "gh");
    const r = await run(clone, args(statusOutside()), {
      PATH: withBin(ghPr()),
      GH_STUB_LOG: log,
      GH_STUB_LIST: "[]",
    });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ prNumber: null, titleChanged: false, pushed: true });
    expect(git(clone, "log", "-1", "--pretty=%s").out).toBe(
      "chore(1-x): force build bkit [force build]",
    );
    expect(git(origin, "rev-parse", "feat/1-x").out).toBe(sha(clone));
  });

  it("a re-run is deduped: no second marker commit", async () => {
    const { clone } = featureBranch("fb-rerun");
    const file = statusOutside();
    const env = {
      PATH: withBin(ghPr()),
      GH_STUB_LOG: path.join(tmp("log"), "gh"),
      GH_STUB_LIST: "[]",
    };
    expect((await run(clone, args(file), env)).code).toBe(0);
    const first = sha(clone);
    const again = await run(clone, args(file), env);
    expect(again.code).toBe(0);
    expect(again.json).toMatchObject({ deduped: true, commit: first });
    expect(sha(clone)).toBe(first);
    expect(actionRows(file)).toHaveLength(1);
  });

  it("keys the row on the run that just closed, so the next run makes its own commit", async () => {
    const { clone } = featureBranch("fb-runkey");
    const file = statusOutside();
    const started = '{"type":"workflow-started","workflow":"build","at":"2026-10-01T00:00:00Z"}\n';
    const done = '{"type":"workflow-done","workflow":"build","at":"2026-10-01T01:00:00Z"}\n';
    fs.writeFileSync(file, started + done);
    const env = {
      PATH: withBin(ghPr()),
      GH_STUB_LOG: path.join(tmp("log"), "gh"),
      GH_STUB_LIST: "[]",
    };
    expect((await run(clone, args(file), env)).code).toBe(0);
    expect(actionRows(file).map((r) => r.key)).toEqual(["build/1/force-build"]);
    const first = sha(clone);
    fs.appendFileSync(file, started.replace("00:00:00", "02:00:00"));
    const second = await run(clone, args(file), env);
    expect(second.code).toBe(0);
    expect(second.json).toMatchObject({ deduped: false });
    expect(sha(clone)).not.toBe(first);
    expect(actionRows(file).map((r) => r.key)).toEqual([
      "build/1/force-build",
      "build/2/force-build",
    ]);
  });

  it("gh unavailable hands the PR to MCP (80) before committing anything", async () => {
    const { clone } = featureBranch("fb-nogh");
    const bin = tmp("only-git");
    fs.symlinkSync(REAL_GIT, path.join(bin, "git"));
    const before = sha(clone);
    const r = await run(clone, args(statusOutside()), { PATH: bin });
    expect(r.code).toBe(80);
    expect(r.err).toContain("--title-set");
    expect(sha(clone)).toBe(before);
  });

  it("--title-set skips gh entirely", async () => {
    const { clone } = featureBranch("fb-titleset");
    const bin = tmp("only-git");
    fs.symlinkSync(REAL_GIT, path.join(bin, "git"));
    const r = await run(clone, args(statusOutside(), "--title-set"), { PATH: bin });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ prNumber: null, titleChanged: false, pushed: true });
  });

  it("refuses dev and main (exit 21)", async () => {
    const { clone } = withOrigin("fb-dev");
    expect((await run(clone, args(statusOutside(), "--title-set"))).code).toBe(21);
  });
});

describe("branches sync", { timeout: GIT_TIMEOUT }, () => {
  function feature(name: string) {
    const { origin, clone } = withOrigin(name);
    git(clone, "checkout", "-q", "-b", "feat/1-x");
    commit(clone, { "a.txt": "a\n" }, "feat: work");
    return { origin, clone };
  }

  it("Path A when origin/dev is an ancestor of HEAD", async () => {
    const { clone } = feature("sync-a");
    const r = await run(clone, ["sync"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      branch: "feat/1-x",
      basePath: "A",
      behind: 0,
      docsBehind: 0,
      merged: false,
    });
  });

  it("Path B once dev moved; --head checks a given commit", async () => {
    const { origin, clone } = feature("sync-b");
    const entry = sha(clone);
    landOnDev(origin, { "src.txt": "moved\n" });
    const r = await run(clone, ["sync", `--head=${entry}`]);
    expect(r.json).toMatchObject({ head: entry, basePath: "B", behind: 1, docsBehind: 0 });
  });

  it("Path B once dev moved, from a clone whose fetch refspec omits dev", async () => {
    const { origin, clone } = feature("sync-narrow");
    git(clone, "config", "remote.origin.fetch", "+refs/heads/main:refs/remotes/origin/main");
    landOnDev(origin, { "src.txt": "moved\n" });
    const r = await run(clone, ["sync"]);
    expect(r.json).toMatchObject({ basePath: "B", behind: 1 });
  });

  it("--merge-docs merges dev when docs/ is behind", async () => {
    const { origin, clone } = feature("sync-merge");
    landOnDev(origin, { "docs/testing.md": "dev docs\n" });
    const r = await run(clone, ["sync", "--merge-docs"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ docsBehind: 1, merged: true, resolved: [] });
    expect(read(clone, "docs/testing.md")).toBe("testing v0\ndev docs\n");
    expect(r.json?.head).toBe(sha(clone));
  });

  it("--merge-docs leaves the branch alone when only code moved on dev", async () => {
    const { origin, clone } = feature("sync-codeonly");
    const before = sha(clone);
    landOnDev(origin, { "src.txt": "moved\n" });
    const r = await run(clone, ["sync", "--merge-docs"]);
    expect(r.json).toMatchObject({ behind: 1, docsBehind: 0, merged: false });
    expect(sha(clone)).toBe(before);
  });

  it("--merge-docs never merges on dev itself", async () => {
    const { origin, clone } = withOrigin("sync-ondev");
    landOnDev(origin, { "docs/testing.md": "dev docs\n" });
    const r = await run(clone, ["sync", "--merge-docs"]);
    expect(r.json).toMatchObject({ branch: "dev", docsBehind: 1, merged: false });
  });

  it("--merge-docs takes dev's side for a conflicted docs/ file", async () => {
    const { origin, clone } = feature("sync-docs-conflict");
    commit(clone, { "docs/testing.md": "branch docs\n" }, "docs: branch");
    landOnDev(origin, { "docs/testing.md": "dev docs\n" });
    const r = await run(clone, ["sync", "--merge-docs"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      merged: true,
      resolved: [{ path: "docs/testing.md", how: "dev" }],
    });
    expect(read(clone, "docs/testing.md")).toBe("testing v0\ndev docs\n");
    expect(git(clone, "status", "--porcelain").out).toBe("");
  });

  it("--merge-docs unions a conflicted ledger instead of dropping the branch's rows", async () => {
    // Ledgers union, unlike "prefer dev for docs/": every row this branch appended survives.
    const { origin, clone } = feature("sync-ledger");
    commit(clone, { "docs/knowledge.jsonl": '{"key":"B","ts":2}\n' }, "docs: branch row");
    landOnDev(origin, { "docs/knowledge.jsonl": '{"key":"C","ts":3}\n' });
    const r = await run(clone, ["sync", "--merge-docs"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ resolved: [{ path: "docs/knowledge.jsonl", how: "union" }] });
    const keys = read(clone, "docs/knowledge.jsonl")
      .split("\n")
      .filter(Boolean)
      .map((l) => (JSON.parse(l) as { key: string }).key);
    expect(keys.sort()).toEqual(["A", "B", "C"]);
  });

  it("--merge-docs aborts (11) on a conflict outside docs/", async () => {
    const { origin, clone } = feature("sync-code-conflict");
    commit(clone, { "src.txt": "branch\n" }, "feat: code");
    const before = sha(clone);
    landOnDev(origin, { "src.txt": "dev\n", "docs/testing.md": "dev docs\n" });
    const r = await run(clone, ["sync", "--merge-docs"]);
    expect(r.code).toBe(11);
    expect(sha(clone)).toBe(before);
    expect(fs.existsSync(path.join(clone, ".git/MERGE_HEAD"))).toBe(false);
    expect(git(clone, "status", "--porcelain").out).toBe("");
  });

  it("exits 10 when the fetch fails", async () => {
    const { clone } = feature("sync-nofetch");
    git(clone, "remote", "set-url", "origin", path.join(tmp("gone"), "missing"));
    expect((await run(clone, ["sync"])).code).toBe(10);
  });

  it("refuses --merge-docs with --head, and an unknown --head", async () => {
    const { clone } = feature("sync-usage");
    expect((await run(clone, ["sync", "--merge-docs", "--head=HEAD"])).code).toBe(2);
    expect((await run(clone, ["sync", "--head=nope"])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// sync-dev
// ---------------------------------------------------------------------------

describe("branches sync-dev", { timeout: GIT_TIMEOUT }, () => {
  /** A clone on feat/1-x whose local dev is one squash-merge behind origin/dev. */
  function shipped(name: string) {
    const { origin, clone } = withOrigin(name);
    git(clone, "checkout", "-q", "-b", "feat/1-x");
    commit(clone, { "a.txt": "a\n" }, "feat: work");
    landOnDev(origin, { "a.txt": "a\n" }, "feat(1-x): squash-merged");
    return { origin, clone };
  }

  it("fast-forwards local dev without checking it out", async () => {
    const { origin, clone } = shipped("sync-ff");
    const r = await run(clone, ["sync-dev"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ devLocal: "fast-forwarded", branch: "feat/1-x", installed: null });
    expect(sha(clone, "dev")).toBe(git(origin, "rev-parse", "dev").out);
    expect(currentBranchOf(clone)).toBe("feat/1-x");
  });

  it("on dev: moves the checkout too, and installs only because dev moved", async () => {
    const { origin, clone } = shipped("sync-on-dev");
    git(clone, "checkout", "-q", "dev");
    write(clone, "package.json", "{}\n");
    const env = { PATH: withBin(stubBin({ [PACKAGE_RUNNER]: "exit 0" })) };
    const r = await run(clone, ["sync-dev"], env);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ devLocal: "fast-forwarded", branch: "dev", installed: true });
    expect(sha(clone)).toBe(git(origin, "rev-parse", "dev").out);
    const again = await run(clone, ["sync-dev"], env);
    expect(again.json).toEqual({ devLocal: "current", branch: "dev", installed: null });
  });

  it("a failed install stops ship (16)", async () => {
    const { clone } = shipped("sync-install-fail");
    git(clone, "checkout", "-q", "dev");
    write(clone, "package.json", "{}\n");
    const r = await run(clone, ["sync-dev"], {
      PATH: withBin(stubBin({ [PACKAGE_RUNNER]: "exit 1" })),
    });
    expect(r.code).toBe(16);
    expect(r.json).toMatchObject({ devLocal: "fast-forwarded", installed: false });
    expect(r.err).toContain("dependency install failed");
  });

  it("lists local-only dev commits with the command to publish them, and pushes nothing", async () => {
    const { origin, clone } = shipped("sync-ahead");
    git(clone, "checkout", "-q", "dev");
    commit(clone, { "src.txt": "local code\n" }, "feat: local code");
    git(clone, "checkout", "-q", "feat/1-x");
    const local = sha(clone, "dev");
    const remoteBefore = git(origin, "rev-parse", "dev").out;
    const r = await run(clone, ["sync-dev"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ devLocal: "skipped" });
    expect(r.err).toContain("feat: local code");
    expect(r.err).toContain("git pull --rebase origin dev && git push origin dev");
    expect(git(origin, "rev-parse", "dev").out).toBe(remoteBefore);
    expect(sha(clone, "dev")).toBe(local);
  });

  it("fast-forwards local dev from a clone whose fetch refspec omits dev", async () => {
    const { origin, clone } = shipped("sync-narrow");
    git(clone, "config", "remote.origin.fetch", "+refs/heads/main:refs/remotes/origin/main");
    const r = await run(clone, ["sync-dev"]);
    expect(r.json).toMatchObject({ devLocal: "fast-forwarded" });
    expect(sha(clone, "dev")).toBe(git(origin, "rev-parse", "dev").out);
  });

  it("exits 10 when the fetch fails", async () => {
    const { clone } = shipped("sync-nofetch");
    git(clone, "remote", "set-url", "origin", path.join(tmp("gone"), "missing"));
    expect((await run(clone, ["sync-dev"])).code).toBe(10);
  });
});

const currentBranchOf = (cwd: string) => git(cwd, "branch", "--show-current").out;

describe("branches land", { timeout: GIT_TIMEOUT }, () => {
  const FID = "12-x";
  const M = "202610";
  /** A main checkout on dev with a bare remote, feat/12-x carrying this run's design. */
  function fixture() {
    const remote = tmp("land-remote");
    const repo = tmp("land-repo");
    git(remote, "init", "-q", "--bare", "-b", "dev");
    git(repo, "init", "-q", "-b", "dev");
    git(repo, "config", "user.email", "t@t");
    git(repo, "config", "user.name", "t");
    write(repo, ".gitignore", "docs/plans/*/logs/**/.lock\n");
    write(repo, "docs/roadmap.md", "# Roadmap\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "init");
    git(repo, "remote", "add", "origin", remote);
    git(repo, "push", "-q", "origin", "dev");
    git(repo, "checkout", "-q", "-b", `feat/${FID}`);
    write(repo, `docs/plans/${M}/${FID}-design.md`, "# design\n");
    write(
      repo,
      `docs/plans/${M}/logs/${FID}/status.jsonl`,
      '{"type":"workflow-started","workflow":"design"}\n',
    );
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "design");
    return { repo, remote };
  }
  const land = (cwd: string, env: Record<string, string>, ...extra: string[]) =>
    run(cwd, ["land", "--workflow=design", `--fid=${FID}`, `--month=${M}`, ...extra], env);

  it("refuses a workflow other than design or plan", async () => {
    const { repo } = fixture();
    expect(
      (await run(repo, ["land", "--workflow=build", `--fid=${FID}`, `--month=${M}`])).code,
    ).toBe(2);
  });

  it("local: stops (17) when this run's artifacts were written to the main checkout, untracked", async () => {
    const { repo } = fixture();
    git(repo, "checkout", "-q", "dev");
    write(repo, `docs/plans/${M}/logs/${FID}/stray.md`, "oops\n");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(17);
    expect(r.err).toContain("written to the main checkout instead of the worktree");
  });

  /** The bare remote refuses every push to dev, the way a protected branch does. */
  const protectDev = (remote: string) =>
    fs.writeFileSync(
      path.join(remote, "hooks", "pre-receive"),
      '#!/bin/sh\nwhile read o n ref; do [ "$ref" = refs/heads/dev ] && { echo "dev is protected" >&2; exit 1; }; done\nexit 0\n',
      { mode: 0o755 },
    );
  /** A git that lands a foreign commit on the remote's dev right before each dev push (`once`: the first only). */
  const racingGit = (remote: string, once: boolean) => {
    const base = tmp("race");
    return stubBin({
      git: [
        `case "$*" in *"push origin HEAD:dev"*)`,
        once ? `  if [ ! -f "${base}/raced" ]; then` : `  if true; then`,
        `    : > "${base}/raced"; d="${base}/c$$"`,
        `    "${REAL_GIT}" clone -q "${remote}" "$d" && (cd "$d" && "${REAL_GIT}" -c user.email=t@t -c user.name=t commit -q --allow-empty -m foreign && "${REAL_GIT}" push -q origin HEAD:dev)`,
        `  fi ;;`,
        `esac`,
        `exec "${REAL_GIT}" "$@"`,
      ].join("\n"),
    });
  };
  const DONE = `docs(${FID}): design DONE bkit [skip ci]`;

  it("local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      shape: "local",
      transport: "git",
      canonicalRef: "origin/dev",
      scanResult: "clean",
      pushAttempts: 1,
      localDev: "fast-forwarded",
    });
    expect(git(remote, "log", "-1", "--format=%s", "dev").out).toBe(DONE);
    expect(git(remote, "show", `dev:docs/plans/${M}/${FID}-design.md`).out).toBe("# design");
    expect(sha(repo, "dev")).toBe(sha(remote, "dev"));
    // The main checkout is never written to: the transport row is logged instead.
    expect(read(repo, `docs/plans/${M}/logs/${FID}/status.jsonl`)).not.toContain(
      '"type":"close-transport"',
    );
    expect(r.err).toContain("close-transport row not written");
    expect(fs.existsSync(path.join(repo, ".worktrees", `_land-${FID}`))).toBe(false);
    expect(git(repo, "rev-parse", "-q", "--verify", `refs/heads/feat/${FID}`).ok).toBe(false);
  });

  it("local: lands with files staged in the main checkout and leaves them staged", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    write(repo, "notes.txt", "mine\n");
    git(repo, "add", "notes.txt");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(git(remote, "log", "-1", "--format=%s", "dev").out).toBe(DONE);
    expect(git(remote, "show", "dev:notes.txt").ok).toBe(false);
    expect(git(repo, "diff", "--cached", "--name-only").out).toBe("notes.txt");
  });

  it("local: dev with commits of its own is left alone; only the close is pushed", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    git(repo, "commit", "-q", "--allow-empty", "-m", "wip");
    const wip = sha(repo, "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ localDev: "skipped" });
    expect(sha(repo, "dev")).toBe(wip);
    expect(git(remote, "log", "--format=%s", "dev").out).not.toContain("wip");
    expect(r.err).toContain("close-transport row not written");
  });

  it("local: the main checkout on another branch stays there; only the dev pointer moves", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "-b", "other", "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ localDev: "fast-forwarded" });
    expect(git(repo, "branch", "--show-current").out).toBe("other");
    expect(sha(repo, "dev")).toBe(sha(remote, "dev"));
  });

  it("dev moved during the push: rebuilds on the new dev and pushes again", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL", PATH: withBin(racingGit(remote, true)) });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushAttempts: 2 });
    expect(git(remote, "log", "-2", "--format=%s", "dev").out).toBe(`${DONE}\nforeign`);
    expect(r.err).toContain("dev moved before push 1 of 3");
  });

  it("dev moved before every push: stops (8) with nothing landed and the branch kept", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL", PATH: withBin(racingGit(remote, false)) });
    expect(r.code).toBe(8);
    expect(r.err).toContain("dev moved before each of 3 pushes");
    expect(git(remote, "log", "--format=%s", "dev").out).not.toContain(DONE);
    expect(git(repo, "rev-parse", "-q", "--verify", `refs/heads/feat/${FID}`).ok).toBe(true);
    expect(fs.existsSync(path.join(repo, ".worktrees", `_land-${FID}`))).toBe(false);
  });

  it("local: stops (17) when the squash would bring non-doc files to dev", async () => {
    const { repo } = fixture();
    write(repo, "src/app.ts", "export {};\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "code on a design branch");
    git(repo, "checkout", "-q", "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(17);
    expect(r.err).toContain("close staged non-doc files");
  });

  it("local: names unpushed dev as the cause when the branch carries it", async () => {
    const { repo } = fixture();
    // The branch's own base is an unpushed dev commit: the squash carries its paths.
    git(repo, "checkout", "-q", "dev");
    write(repo, "src/app.ts", "export {};\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "unpushed dev work");
    git(repo, "checkout", "-q", `feat/${FID}`);
    git(repo, "rebase", "-q", "dev");

    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(17);
    expect(r.err).toContain("close staged non-doc files");
    expect(r.err).toContain("src/app.ts");
    expect(r.err).toContain("all of them are local dev's content");
    expect(r.err).toContain("1 commit(s) ahead of origin/dev");
    expect(r.err).toContain("publish dev (git push origin dev)");
    expect(git(repo, "log", "--format=%s", "origin/dev")).not.toContain(DONE);
  });

  it("local: separates this run's own non-doc file from the unpushed dev work it inherited", async () => {
    const { repo } = fixture();
    git(repo, "checkout", "-q", "dev");
    write(repo, "src/app.ts", "export {};\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "unpushed dev work");
    git(repo, "checkout", "-q", `feat/${FID}`);
    write(repo, "src/mine.ts", "export const mine = 1;\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "code this run made");
    git(repo, "rebase", "-q", "dev");

    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(17);
    expect(r.err).toContain("src/app.ts");
    expect(r.err).toContain("src/mine.ts");
    expect(r.err).toContain("1 of them are local dev's content");
  });

  it("PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh", async () => {
    const { repo, remote } = fixture();
    protectDev(remote);
    const bin = stubBin({ gh: "exit 4" });
    const r = await land(
      repo,
      { BKIT_RUNTIME: "CLOUD_CLAUDE", PATH: withBin(bin) },
      "--issue=12",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(80);
    expect(r.json).toMatchObject({ stage: "open" });
    expect(r.err).toContain("refused the dev push — closing through a PR instead");
    expect(git(remote, "log", "-1", "--format=%s", `feat/${FID}`).out).toBe(
      `docs(${FID}): design roadmap update bkit [skip ci]`,
    );
  });

  it("PR shape on a laptop: commits the roadmap row in the worktree holding the branch", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    git(repo, "worktree", "add", "-q", `.worktrees/${FID}`, `feat/${FID}`);
    protectDev(remote);
    const r = await land(
      repo,
      { BKIT_RUNTIME: "LOCAL", PATH: withBin(stubBin({ gh: "exit 4" })) },
      "--issue=12",
    );
    expect(r.code).toBe(80);
    expect(r.json).toMatchObject({ stage: "open" });
    expect(git(remote, "log", "-1", "--format=%s", `feat/${FID}`).out).toBe(
      `docs(${FID}): design roadmap update bkit [skip ci]`,
    );
    expect(git(repo, "branch", "--show-current").out).toBe("dev");
  });

  /** gh for PR 5: the first merge refuses, the second lands `merged`; every update-branch is logged. */
  const ghMergingOnRetry = (merged: string, state = "OPEN", prBase = "dev") => {
    const base = tmp("gh");
    return {
      base,
      bin: stubBin({
        gh: [
          `case "$1 $2" in`,
          `  "pr merge") n=$(cat "${base}/n" 2>/dev/null || echo 0); n=$((n+1)); echo $n > "${base}/n"`,
          `    [ $n -ge 2 ] && { : > "${base}/merged"; exit 0; }; echo "not mergeable" >&2; exit 1 ;;`,
          `  "pr update-branch") echo update >> "${base}/updates"; exit 0 ;;`,
          `  "pr view") if [ -f "${base}/merged" ]; then echo '{"number":5,"state":"MERGED","baseRefName":"dev","mergeCommit":{"oid":"${merged}"}}'; elif [ "${state}" = UNREAD ] && [ ! -f "${base}/read" ]; then : > "${base}/read"; echo "HTTP 502" >&2; exit 1; elif [ "${state}" = UNREAD ]; then echo '{"number":5,"state":"OPEN","baseRefName":"${prBase}"}'; else echo '{"number":5,"state":"${state}","baseRefName":"${prBase}"}'; fi ;;`,
          `esac`,
        ].join("\n"),
      }),
    };
  };
  /** What GitHub's squash-merge of feat/{fid} would put on the remote's dev. */
  const squashOnRemote = (repo: string) => {
    git(repo, "checkout", "-q", "dev");
    git(repo, "merge", "-q", "--squash", `feat/${FID}`);
    git(repo, "commit", "-qm", `docs(${FID}): design DONE`);
    git(repo, "push", "-q", "origin", "dev");
    const merged = sha(repo, "dev");
    git(repo, "checkout", "-q", `feat/${FID}`);
    return merged;
  };

  it("PR merge refused: updates the PR branch from dev and merges on the next try", async () => {
    const { repo } = fixture();
    const merged = squashOnRemote(repo);
    const gh = ghMergingOnRetry(merged);
    const r = await land(
      repo,
      { BKIT_RUNTIME: "CLOUD_CLAUDE", PATH: withBin(gh.bin) },
      "--pr=5",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      shape: "pr",
      transport: "gh",
      prNumber: 5,
      landedSha: merged,
      pushAttempts: 0,
    });
    expect(read(gh.base, "updates")).toBe("update\n");
  });

  /** `.worktrees/12-x` holding feat/12-x, owned by a workflow (so the close would remove it). */
  const ownedWorktree = (repo: string) => {
    git(repo, "worktree", "add", "-q", `.worktrees/${FID}`, `feat/${FID}`);
    const common = git(repo, "rev-parse", "--path-format=absolute", "--git-common-dir").out;
    write(common, `bkit-outbox/${FID}/.worktree-owned`, "");
    return path.join(repo, ".worktrees", FID);
  };

  it("local: uncommitted work in the feature worktree keeps the worktree and the branch", async () => {
    const { repo } = fixture();
    git(repo, "checkout", "-q", "dev");
    const wt = ownedWorktree(repo);
    write(wt, `docs/plans/${M}/logs/${FID}/notes.md`, "never committed\n");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ worktree: { removed: false, reason: "uncommitted" } });
    expect(r.err).toContain("holds work that was never committed");
    expect(read(wt, `docs/plans/${M}/logs/${FID}/notes.md`)).toBe("never committed\n");
    expect(git(repo, "rev-parse", "-q", "--verify", `refs/heads/feat/${FID}`).ok).toBe(true);
  });

  it("branch work missing from dev: stops (18) and keeps the branch and its worktree", async () => {
    const { repo } = fixture();
    const merged = squashOnRemote(repo);
    write(repo, `docs/plans/${M}/logs/${FID}/late.md`, "committed after the merge\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "late");
    git(repo, "checkout", "-q", "dev");
    const wt = ownedWorktree(repo);
    const gh = ghMergingOnRetry(merged);
    const r = await land(
      repo,
      { BKIT_RUNTIME: "LOCAL", PATH: withBin(gh.bin) },
      "--pr=5",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(18);
    expect(r.err).toContain("carries work origin/dev does not");
    expect(r.err).toContain(`docs/plans/${M}/logs/${FID}/late.md`);
    expect(read(wt, `docs/plans/${M}/logs/${FID}/late.md`)).toBe("committed after the merge\n");
    expect(git(repo, "rev-parse", "-q", "--verify", `refs/heads/feat/${FID}`).ok).toBe(true);
  });

  it("PR state unread (one gh view failed): retried like an open PR, then merges", async () => {
    const { repo } = fixture();
    const merged = squashOnRemote(repo);
    const gh = ghMergingOnRetry(merged, "UNREAD");
    const r = await land(
      repo,
      { BKIT_RUNTIME: "CLOUD_CLAUDE", PATH: withBin(gh.bin) },
      "--pr=5",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ shape: "pr", landedSha: merged });
    // Try 1 lost to the failed read, try 2 to the refused merge, try 3 merges.
    expect(read(gh.base, "updates")).toBe("update\nupdate\n");
  });

  it("PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open", async () => {
    const { repo } = fixture();
    const base = tmp("gh-never");
    const bin = stubBin({
      gh: [
        `case "$1 $2" in`,
        `  "pr merge") echo "not mergeable" >&2; exit 1 ;;`,
        `  "pr update-branch") echo update >> "${base}/updates"; exit 0 ;;`,
        `  "pr view") echo '{"number":5,"state":"OPEN","baseRefName":"dev"}' ;;`,
        `esac`,
      ].join("\n"),
    });
    const r = await land(
      repo,
      { BKIT_RUNTIME: "CLOUD_CLAUDE", PATH: withBin(bin) },
      "--pr=5",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(17);
    expect(r.err).toContain("PR 5 still not merged after 3 tries — left open");
    expect(read(base, "updates")).toBe("update\nupdate\n");
    expect(git(repo, "rev-parse", "-q", "--verify", `refs/heads/feat/${FID}`).ok).toBe(true);
  });

  it("local: a squash that drops the branch's ledger rows puts them back (no merge=union)", async () => {
    const { repo, remote } = fixture();
    const LEDGER = ".bkit/friction.jsonl";
    // The ledger exists on dev with one row; dev and the branch each append one.
    git(repo, "checkout", "-q", "dev");
    write(repo, LEDGER, '{"id":"a"}\n');
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "ledger");
    git(repo, "push", "-q", "origin", "dev");
    write(repo, LEDGER, '{"id":"a"}\n{"id":"dev"}\n');
    git(repo, "commit", "-qam", "dev row");
    git(repo, "push", "-q", "origin", "dev");
    git(repo, "checkout", "-q", `feat/${FID}`);
    git(repo, "merge", "-q", "dev~1");
    write(repo, LEDGER, '{"id":"a"}\n{"id":"branch"}\n');
    git(repo, "commit", "-qam", "branch row");
    git(repo, "checkout", "-q", "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(git(remote, "show", `dev:${LEDGER}`).out.split("\n")).toEqual([
      '{"id":"a"}',
      '{"id":"dev"}',
      '{"id":"branch"}',
    ]);
  });

  it("land removes the worktree when only the copied .env is untracked", async () => {
    const { repo } = fixture();
    git(repo, "checkout", "-q", "dev");
    const wt = ownedWorktree(repo);
    write(wt, ".env", "TOKEN=x\n");
    write(wt, ".bkit/.env", "BKIT_TOKEN=x\n");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ worktree: { removed: true } });
    expect(fs.existsSync(wt)).toBe(false);
    expect(git(repo, "rev-parse", "-q", "--verify", `refs/heads/feat/${FID}`).ok).toBe(false);
  });

  it("land keeps the worktree for real leftovers and names only them, not the copied .env", async () => {
    const { repo } = fixture();
    git(repo, "checkout", "-q", "dev");
    const wt = ownedWorktree(repo);
    write(wt, ".env", "TOKEN=x\n");
    write(wt, `docs/plans/${M}/logs/${FID}/notes.md`, "never committed\n");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      worktree: {
        removed: false,
        reason: "uncommitted",
        files: [`?? docs/plans/${M}/logs/${FID}/notes.md`],
      },
    });
  });

  it("local: lands and audits from a clone whose fetch refspec omits dev", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    git(repo, "config", "remote.origin.fetch", "+refs/heads/main:refs/remotes/origin/main");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(git(remote, "log", "-1", "--format=%s", "dev").out).toBe(DONE);
    expect(sha(repo, "origin/dev")).toBe(sha(remote, "dev"));
    expect(r.json).toMatchObject({ localDev: "fast-forwarded" });
  });

  it("a concurrent landing already moved local dev past this close: localDev is current, no publish advice", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    // Right after this close's push lands, a second close lands on top of it and
    // fast-forwards the main checkout's dev, before this close's own fast-forward.
    const base = tmp("race-after");
    const bin = stubBin({
      git: [
        `case "$*" in *"push origin HEAD:dev"*)`,
        `  "${REAL_GIT}" "$@"; rc=$?`,
        `  if [ $rc -eq 0 ] && [ ! -f "${base}/raced" ]; then`,
        `    : > "${base}/raced"; d="${base}/c$$"`,
        `    "${REAL_GIT}" clone -q "${remote}" "$d" && (cd "$d" && "${REAL_GIT}" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "second close" && "${REAL_GIT}" push -q origin HEAD:dev)`,
        `    "${REAL_GIT}" -C "${repo}" fetch -q origin +refs/heads/dev:refs/remotes/origin/dev`,
        `    "${REAL_GIT}" -C "${repo}" merge -q --ff-only origin/dev`,
        `  fi`,
        `  exit $rc ;;`,
        `esac`,
        `exec "${REAL_GIT}" "$@"`,
      ].join("\n"),
    });
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL", PATH: withBin(bin) });
    expect(r.code).toBe(0);
    expect(git(remote, "log", "-2", "--format=%s", "dev").out).toBe(`second close\n${DONE}`);
    expect(r.json).toMatchObject({ localDev: "current" });
    expect(r.err).not.toContain("git pull --rebase origin dev && git push origin dev");
    expect(sha(repo, "dev")).toBe(sha(remote, "dev"));
  });

  it("local: a locked throwaway checkout left by a killed close is removed, then the close lands", async () => {
    const { repo, remote } = fixture();
    git(repo, "checkout", "-q", "dev");
    const left = path.join(repo, ".worktrees", `_land-${FID}`);
    git(repo, "worktree", "add", "-q", "--lock", "--detach", left, "dev");
    const r = await land(repo, { BKIT_RUNTIME: "LOCAL" });
    expect(r.code).toBe(0);
    expect(git(remote, "log", "-1", "--format=%s", "dev").out).toBe(DONE);
    expect(fs.existsSync(left)).toBe(false);
  });

  /** gh for PR 5 that logs every call; `pr view` prints `view` (JSON), `pr merge` always succeeds. */
  const ghLogging = (view: string) => {
    const base = tmp("gh-log");
    return {
      base,
      bin: stubBin({
        gh: [
          `echo "$*" >> "${base}/calls"`,
          `case "$1 $2" in`,
          `  "pr merge") : > "${base}/merged"; exit 0 ;;`,
          `  "pr update-branch") exit 0 ;;`,
          `  "pr view") echo '${view}' ;;`,
          `esac`,
        ].join("\n"),
      }),
    };
  };
  const callsOf = (base: string) =>
    fs.existsSync(path.join(base, "calls")) ? read(base, "calls").trim().split("\n") : [];

  it("landPr refuses a main-based PR without retrying", async () => {
    const { repo } = fixture();
    const gh = ghLogging('{"number":5,"state":"OPEN","baseRefName":"main"}');
    const r = await land(
      repo,
      { BKIT_RUNTIME: "CLOUD_CLAUDE", PATH: withBin(gh.bin) },
      "--pr=5",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(17);
    expect(r.err).toContain("releases stay manual");
    expect(callsOf(gh.base).filter((c) => c.startsWith("pr merge"))).toEqual([]);
    expect(callsOf(gh.base).filter((c) => c.startsWith("pr update-branch"))).toEqual([]);
  });

  it("landPr refuses when the PR base is unknown", async () => {
    const { repo } = fixture();
    const gh = ghLogging('{"number":5,"state":"OPEN"}');
    const r = await land(
      repo,
      { BKIT_RUNTIME: "CLOUD_CLAUDE", PATH: withBin(gh.bin) },
      "--pr=5",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(17);
    expect(callsOf(gh.base).filter((c) => c.startsWith("pr merge"))).toEqual([]);
    expect(callsOf(gh.base).filter((c) => c.startsWith("pr update-branch"))).toEqual([]);
  });

  it("PR not open (closed): stops (17) at once, no retry", async () => {
    const { repo } = fixture();
    const gh = ghMergingOnRetry(squashOnRemote(repo), "CLOSED");
    const r = await land(
      repo,
      { BKIT_RUNTIME: "CLOUD_CLAUDE", PATH: withBin(gh.bin) },
      "--pr=5",
      `--branch=feat/${FID}`,
    );
    expect(r.code).toBe(17);
    expect(r.err).toContain("did not reach MERGED (state=CLOSED)");
    expect(fs.existsSync(path.join(gh.base, "updates"))).toBe(false);
  });
});
