import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { LOCKFILE_REGENERATE, PACKAGE_RUNNER } from "../../shared/package-manager";
import { LEDGERS, branchesCommand, classifyConflict, readAnchor, stampAnchor } from "./branches";

// `branches switch` contends for the dev lock for SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S; a held
// lock must answer at once here.
vi.mock("../../shared/timeouts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../shared/timeouts")>();
  return { TIMEOUTS: { ...actual.TIMEOUTS, SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S: 0 } };
});

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const GITATTRIBUTES = path.join(REPO_ROOT, ".bkit/templates/.gitattributes");

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
    const code = await runCommand(["branches", ...argv], [branchesCommand], {
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

// ---------------------------------------------------------------------------
// rebase — classification
// ---------------------------------------------------------------------------

describe("branches rebase: classification", () => {
  it("ledger list does not drift from .gitattributes merge=union", () => {
    const union = fs
      .readFileSync(GITATTRIBUTES, "utf-8")
      .split("\n")
      .filter((l) => !l.trim().startsWith("#") && /\bmerge=union\b/.test(l))
      .map((l) => l.trim().split(/\s+/)[0]!);
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

  it("produces byte-identical output to merge=union", async () => {
    const build = async (withAttr: boolean): Promise<string> => {
      const dir = makeRepo(withAttr ? "attr" : "cmd");
      if (withAttr) {
        write(dir, ".gitattributes", "docs/knowledge.jsonl merge=union\n");
        git(dir, "add", "-A");
        git(dir, "commit", "-q", "-m", "attr");
      }
      diverge(
        dir,
        { "docs/knowledge.jsonl": '{"key":"B","ts":5}\n{"key":"B2","ts":6}\n' },
        { "docs/knowledge.jsonl": '{"key":"C","ts":7}\n' },
      );
      if (!withAttr) expect((await run(dir, ["rebase"])).code).toBe(0);
      return read(dir, "docs/knowledge.jsonl");
    };
    expect(await build(false)).toBe(await build(true));
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
      designPath: null,
      designBaseSha: null,
      changed: true,
    });
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
    });
    expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
    // A rebased (rewritten) branch still pushes: that is what the lease is for.
    git(clone, "commit", "-q", "--amend", "-m", "feat(1-x): reworded");
    expect((await run(clone, ["push", "--mode=feature"])).code).toBe(0);
    expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
  });

  it("pushes dev plainly, so a non-fast-forward is refused rather than forced", async () => {
    const { origin, clone } = withOrigin("push-dev");
    commit(clone, { "a.txt": "a\n" }, "docs: x");
    const r = await run(clone, ["push", "--mode=dev"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, ref: "dev", forced: false });
    git(clone, "commit", "-q", "--amend", "-m", "docs: rewritten");
    const again = await run(clone, ["push", "--mode=feature"]);
    expect(again.code).toBe(8);
    expect(again.json).toMatchObject({ pushed: false, ref: null });
    expect(remoteSha(origin, "dev")).not.toBe(sha(clone));
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

// ---------------------------------------------------------------------------
// sync
// ---------------------------------------------------------------------------

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
// switch
// ---------------------------------------------------------------------------

describe("branches switch", { timeout: GIT_TIMEOUT }, () => {
  const ARGS = ["switch", "--fid=1-x", "--dev-pushes=true", "--worktrees=true"];

  function shipped(name: string) {
    const { origin, clone } = withOrigin(name);
    git(clone, "checkout", "-q", "-b", "feat/1-x");
    commit(clone, { "a.txt": "a\n" }, "feat: work");
    landOnDev(origin, { "a.txt": "a\n" }, "feat(1-x): squash-merged");
    return { origin, clone };
  }

  it("skips when the runtime does not push dev", async () => {
    const { clone } = shipped("switch-skip");
    const r = await run(clone, ["switch", "--fid=1-x", "--dev-pushes=false", "--worktrees=false"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      switched: false,
      branch: "feat/1-x",
      skipped: "dev-pushes-false",
    });
  });

  it("refuses (15) a dev-pushing runtime without worktrees", async () => {
    const { clone } = shipped("switch-refuse");
    const r = await run(clone, ["switch", "--fid=1-x", "--dev-pushes=true", "--worktrees=false"]);
    expect(r.code).toBe(15);
  });

  it("rejects runtime flags that are not true/false", async () => {
    const { clone } = shipped("switch-usage");
    expect(
      (await run(clone, ["switch", "--fid=1-x", "--dev-pushes=yes", "--worktrees=true"])).code,
    ).toBe(2);
  });

  it("switches to dev, fast-forwards it, and releases the lock", async () => {
    const { origin, clone } = shipped("switch-ff");
    const r = await run(clone, ARGS);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      switched: true,
      branch: "dev",
      ahead: 0,
      pushed: false,
      installed: null,
      skipped: null,
    });
    expect(sha(clone)).toBe(git(origin, "rev-parse", "dev").out);
    expect(fs.existsSync(path.join(clone, ".bkit/.dev.lock"))).toBe(false);
  });

  it("rebases and pushes local dev commits that are all skip-CI", async () => {
    const { origin, clone } = shipped("switch-ahead");
    git(clone, "checkout", "-q", "dev");
    commit(clone, { "docs/x.md": "x\n" }, "docs(1-x): ship bookkeeping bkit [skip ci]");
    git(clone, "checkout", "-q", "feat/1-x");
    const r = await run(clone, ARGS);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ switched: true, ahead: 1, pushed: true });
    expect(git(origin, "rev-parse", "dev").out).toBe(sha(clone));
  });

  it("needs a human (82) when local dev carries commits that would run CI", async () => {
    const { origin, clone } = shipped("switch-human");
    git(clone, "checkout", "-q", "dev");
    commit(clone, { "src.txt": "local code\n" }, "feat: local code");
    git(clone, "checkout", "-q", "feat/1-x");
    const remoteBefore = git(origin, "rev-parse", "dev").out;
    const r = await run(clone, ARGS);
    expect(r.code).toBe(82);
    expect(r.err).toContain("feat: local code");
    expect(git(origin, "rev-parse", "dev").out).toBe(remoteBefore);
    expect(fs.existsSync(path.join(clone, ".bkit/.dev.lock"))).toBe(false);
  });

  it("answers no (1) while another run holds the dev lock", async () => {
    const { clone } = shipped("switch-locked");
    write(clone, ".bkit/.dev.lock", "2026-10-09T00:00:00Z build 2-y\n");
    const r = await run(clone, ARGS);
    expect(r.code).toBe(1);
    expect(r.err).toContain("build 2-y");
    expect(currentBranchOf(clone)).toBe("feat/1-x");
    expect(read(clone, ".bkit/.dev.lock")).toContain("build 2-y");
  });

  it("clears a stale dev lock and proceeds", async () => {
    const { clone } = shipped("switch-stale");
    write(clone, ".bkit/.dev.lock", "old holder\n");
    const old = new Date(Date.now() - 3_600_000);
    fs.utimesSync(path.join(clone, ".bkit/.dev.lock"), old, old);
    expect((await run(clone, ARGS)).code).toBe(0);
  });

  it("exits 10 when the fetch fails (the shell ignored it)", async () => {
    const { clone } = shipped("switch-nofetch");
    git(clone, "remote", "set-url", "origin", path.join(tmp("gone"), "missing"));
    expect((await run(clone, ARGS)).code).toBe(10);
  });

  it("puts core.bare back to false on the main checkout", async () => {
    const { clone } = shipped("switch-bare");
    git(clone, "config", "core.bare", "true");
    await run(clone, ARGS);
    expect(git(clone, "config", "--get", "core.bare").out).toBe("false");
  });

  it("installs dependencies when there is a package.json, and only warns when that fails", async () => {
    const ok = shipped("switch-install");
    write(ok.clone, "package.json", "{}\n");
    const good = await run(ok.clone, ARGS, {
      PATH: withBin(stubBin({ [PACKAGE_RUNNER]: "exit 0" })),
    });
    expect(good.json).toMatchObject({ installed: true });

    const bad = shipped("switch-install-fail");
    write(bad.clone, "package.json", "{}\n");
    const failed = await run(bad.clone, ARGS, {
      PATH: withBin(stubBin({ [PACKAGE_RUNNER]: "exit 1" })),
    });
    expect(failed.code).toBe(0);
    expect(failed.json).toMatchObject({ switched: true, installed: false });
    expect(failed.err).toContain("WARNING");
  });
});

const currentBranchOf = (cwd: string) => git(cwd, "branch", "--show-current").out;
