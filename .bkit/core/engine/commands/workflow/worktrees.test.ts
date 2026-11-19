// Everything `bkit worktrees` does without a remote: flag validation, adopt
// mode, ship's branch choice, the plain-directory guard, list and remove. The
// cases that fetch, mint and rebase are in worktrees.integration.test.ts.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { newRecord, writeParkedCommits, writeRecord } from "./ledgers";
import {
  addAllButCopied,
  ownershipMarker,
  removeWorktree,
  worktreeDir,
  worktreesCommand,
} from "./worktrees";
import { localLimit } from "../../../../../vitest.timeout-budget";

/** Renames the package manager in `installCommand` while `runner` is set, so a test sees where printed install examples come from. */
const pm = vi.hoisted(() => ({ runner: null as string | null }));
vi.mock("../../shared/package-manager", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../shared/package-manager")>();
  return {
    ...real,
    installCommand: (opts: Parameters<typeof real.installCommand>[0]) => {
      const argv = real.installCommand(opts);
      return pm.runner === null ? argv : [pm.runner, ...argv.slice(1)];
    },
  };
});

const FID = "42-thing";
const MONTH = "202610";
const dirs: string[] = [];
afterEach(() => {
  pm.runner = null;
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

/** A local repo with one commit on `branch` and a `.env`, no remote. */
function repo(branch = "dev") {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-unit-")));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", branch);
  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
  fs.writeFileSync(path.join(cwd, ".env"), "SECRET=1\n");
  return cwd;
}

/** A linked worktree at `.worktrees/{fid}`, marked as workflow-created when `owned`. */
function linked(cwd: string, fid = FID, owned = false) {
  git(cwd, "worktree", "add", "-q", worktreeDir(cwd, fid), "-b", `feat/${fid}`);
  if (owned) {
    const marker = ownershipMarker(cwd, fid);
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, "");
  }
  return worktreeDir(cwd, fid);
}

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["worktrees", ...argv, "--json"], [worktreesCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const setup = (cwd: string, workflow: string, ...extra: string[]) =>
  run(cwd, ["setup", `--workflow=${workflow}`, `--fid=${FID}`, `--month=${MONTH}`, ...extra]);
const remove = (cwd: string, ...extra: string[]) => run(cwd, ["remove", `--fid=${FID}`, ...extra]);

describe("bkit worktrees setup — usage", () => {
  it.each([
    [["--workflow=deploy", `--fid=${FID}`, `--month=${MONTH}`], "--workflow must be"],
    [["--workflow=build", "--fid=../x", `--month=${MONTH}`], "is not a feature id"],
    [["--workflow=build", "--fid=a/b", `--month=${MONTH}`], "is not a feature id"],
    [["--workflow=build", `--fid=${FID}`, "--month=2026-10"], "YYYYMM"],
    [["--workflow=build", `--fid=${FID}`, `--month=${MONTH}`, "--branch=x"], "ship or debug only"],
    [
      ["--workflow=ship", `--fid=${FID}`, `--month=${MONTH}`, "--branch=a..b"],
      "not a valid branch",
    ],
    [["--workflow=build", `--month=${MONTH}`], "missing required flag --fid"],
    [
      ["--workflow=build", `--fid=${FID}`, `--month=${MONTH}`, "--worktrees=true"],
      "takes no value",
    ],
  ])("refuses %j", async (flags, problem) => {
    const r = await run(repo(), ["setup", ...flags]);
    expect(r.code).toBe(2);
    expect(r.err).toContain(problem);
  });

  it("refuses outside a git repository", async () => {
    const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-nogit-")));
    dirs.push(cwd);
    const r = await setup(cwd, "build");
    expect(r.code).toBe(2);
    expect(r.err).toContain("not inside a git repository");
  });
});

describe("bkit worktrees setup — adopt in place", () => {
  it("works in the main checkout on its own branch: no worktree, no copy, no install", async () => {
    const cwd = repo("claude/session");
    const r = await setup(cwd, "build");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      worktreePath: cwd,
      repoRoot: cwd,
      branch: "claude/session",
      mode: "adopted",
      branchWarning: null,
      owned: false,
      rebaseConflict: false,
      sentinel: null,
      logDir: path.join(cwd, "docs/plans", MONTH, "logs", FID),
      baseRef: "origin/dev",
      baseSha: null,
      carriedSha: null,
      carriedDropped: [],
      copied: [],
      copyMissing: [],
      bkitEnv: null,
      direnvAllowed: false,
      installed: false,
    });
    expect(fs.existsSync(path.join(cwd, ".worktrees"))).toBe(false);
    expect(fs.existsSync(r.json.logDir)).toBe(true);
  });

  it("adopts the main checkout even when called from a linked worktree", async () => {
    const cwd = repo("claude/session");
    const wt = linked(cwd, "9-other");
    expect((await setup(wt, "plan")).json.worktreePath).toBe(cwd);
  });

  it.each([
    ["design", []],
    ["plan", []],
    ["build", []],
    // Ship adopts by switching to its branch, so it only refuses when that lands on dev.
    ["ship", ["--branch=dev"]],
  ])("%s refuses to work in place on dev", async (workflow, extraArgs) => {
    const cwd = repo("dev");
    git(cwd, "branch", `feat/${FID}`);
    const r = await setup(cwd, workflow, ...extraArgs);
    expect(r.code).toBe(7);
  });

  it("build in place on main is refused", async () => {
    const r = await setup(repo("main"), "build");
    expect(r.code).toBe(7);
    expect(r.err).toContain("refusing to work in place on main");
  });

  it("design and plan in place on main are refused", async () => {
    for (const workflow of ["design", "plan"]) {
      const r = await setup(repo("main"), workflow);
      expect(r.code).toBe(7);
      expect(r.err).toContain("refusing to work in place on main");
    }
  });

  it("still adopts a cloud session branch whose upstream is main", async () => {
    const cwd = repo("claude/session");
    git(cwd, "config", "branch.claude/session.remote", "origin");
    git(cwd, "config", "branch.claude/session.merge", "refs/heads/main");
    const r = await setup(cwd, "build");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ branch: "claude/session", mode: "adopted" });
  });

  it("refuses a detached HEAD", async () => {
    const cwd = repo("claude/session");
    git(cwd, "switch", "-q", "--detach");
    const r = await setup(cwd, "build");
    expect(r.code).toBe(7);
    expect(r.err).toContain("detached HEAD");
  });
});

/** A worktree a host made outside `.worktrees/`, already on `feat/{fid}`. */
function hostWorktree(cwd: string, fid = FID) {
  const dir = path.join(
    fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-host-"))),
    fid,
  );
  dirs.push(path.dirname(dir));
  git(cwd, "worktree", "add", "-q", dir, "-b", `feat/${fid}`);
  return fs.realpathSync(dir);
}

const worktreeCount = (cwd: string) =>
  git(cwd, "worktree", "list", "--porcelain")
    .split("\n")
    .filter((l) => l.startsWith("worktree ")).length;

describe("bkit worktrees setup — adopt the checkout the session is already on", () => {
  it("adopts the linked worktree already on feat/{fid} for design, plan, build and debug", async () => {
    for (const workflow of ["design", "plan", "build", "debug"]) {
      const cwd = repo("dev");
      const wt = hostWorktree(cwd);
      const r = await setup(wt, workflow, "--worktrees");
      expect(r.err, workflow).not.toContain("already used by worktree");
      expect(r.code, workflow).toBe(0);
      expect(r.json, workflow).toMatchObject({
        mode: "adopted",
        branch: `feat/${FID}`,
        worktreePath: wt,
      });
      expect(worktreeCount(cwd), workflow).toBe(2);
      expect(fs.existsSync(path.join(cwd, ".worktrees", FID)), workflow).toBe(false);
    }
  });

  it("ship run from a linked worktree on its target branch adopts that worktree", async () => {
    const cwd = repo("dev");
    const wt = hostWorktree(cwd);
    const r = await setup(wt, "ship", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "adopted", branch: `feat/${FID}`, worktreePath: wt });
    expect(git(cwd, "branch", "--show-current")).toBe("dev");
    expect(worktreeCount(cwd)).toBe(2);
  });

  it("the adopted linked worktree holds the log directory", async () => {
    const cwd = repo("dev");
    const wt = hostWorktree(cwd);
    const r = await setup(wt, "plan", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json.logDir).toBe(path.join(wt, "docs/plans", MONTH, "logs", FID));
    expect(fs.existsSync(r.json.logDir)).toBe(true);
    expect(fs.existsSync(path.join(cwd, "docs"))).toBe(false);
  });

  it("refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees", async () => {
    for (const workflow of ["design", "plan", "build"]) {
      const cwd = repo(`feat/${FID}`);
      const r = await setup(cwd, workflow, "--worktrees");
      expect(r.code, workflow).toBe(7);
      expect(r.err, workflow).toContain("main checkout");
      expect(fs.existsSync(path.join(cwd, "docs/plans", MONTH, "logs", FID)), workflow).toBe(false);
    }
  });

  it("refuses design, plan and build in place in a submodule's main checkout on feat/{fid}", async () => {
    for (const workflow of ["design", "plan", "build"]) {
      const sub = repo("dev");
      const outer = repo("dev");
      git(
        outer,
        "-c",
        "protocol.file.allow=always",
        "submodule",
        "add",
        "-q",
        "-b",
        "dev",
        sub,
        "mod",
      );
      const inner = path.join(outer, "mod");
      git(inner, "switch", "-q", "-c", `feat/${FID}`);
      const r = await setup(inner, workflow, "--worktrees");
      expect(r.code, workflow).toBe(7);
      expect(fs.existsSync(path.join(inner, "docs/plans", MONTH, "logs", FID)), workflow).toBe(
        false,
      );
    }
  });

  it("says so when the adopted worktree has no hooks directory", async () => {
    const cwd = repo("dev");
    const wt = hostWorktree(cwd);
    git(cwd, "config", "core.hooksPath", ".husky/_");
    pm.runner = "stub-pm";
    const missing = await setup(wt, "plan", "--worktrees");
    expect(missing.code).toBe(0);
    expect(missing.json.hooksMissing).toBe(".husky/_");
    expect(missing.err).toContain(".husky/_");
    expect(missing.err).toContain(`is missing in ${wt}`);
    expect(missing.err).toContain("(for example stub-pm install)");
    expect(missing.err).not.toContain("pnpm install");

    fs.mkdirSync(path.join(wt, ".husky/_"), { recursive: true });
    const present = await setup(wt, "plan", "--worktrees");
    expect(present.code).toBe(0);
    expect(present.json.hooksMissing).toBeUndefined();
    expect(present.err).not.toContain(".husky/_");

    const unset = repo("claude/session");
    const none = await setup(unset, "build");
    expect(none.json.hooksMissing).toBeUndefined();
  });

  it("does not report a ~ hooks directory that exists", async () => {
    const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-home-")));
    dirs.push(home);
    fs.mkdirSync(path.join(home, ".githooks"));
    const cwd = repo("dev");
    const wt = hostWorktree(cwd);
    git(cwd, "config", "core.hooksPath", "~/.githooks");
    vi.stubEnv("HOME", home);
    try {
      const present = await setup(wt, "plan", "--worktrees");
      expect(present.code).toBe(0);
      expect(present.json.hooksMissing).toBeUndefined();
      expect(present.err).not.toContain("~/.githooks");

      fs.rmSync(path.join(home, ".githooks"), { recursive: true });
      const missing = await setup(wt, "plan", "--worktrees");
      expect(missing.json.hooksMissing).toBeDefined();
      expect(missing.json.hooksMissing).toBe("~/.githooks");
      expect(missing.err).toContain(path.join(home, ".githooks"));
      expect(missing.err).toContain("no git hook runs");
      expect(missing.err).not.toContain("is missing in");
      expect(missing.err).not.toContain("install");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("names no package install for a missing hooks directory outside the checkout", async () => {
    const elsewhere = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-hooks-")));
    dirs.push(elsewhere);
    const cwd = repo("dev");
    const wt = hostWorktree(cwd);
    for (const [configured, resolved] of [
      [path.join(elsewhere, "hooks"), path.join(elsewhere, "hooks")],
      ["../outside-hooks", path.join(path.dirname(wt), "outside-hooks")],
    ]) {
      git(cwd, "config", "core.hooksPath", configured);
      const r = await setup(wt, "plan", "--worktrees");
      expect(r.code, configured).toBe(0);
      expect(r.json.hooksMissing, configured).toBe(configured);
      expect(r.err, configured).toContain(`git hooks directory ${resolved} does not exist`);
      expect(r.err, configured).toContain("no git hook runs");
      expect(r.err, configured).toContain("create that directory or change core.hooksPath");
      expect(r.err, configured).not.toContain("is missing in");
      expect(r.err, configured).not.toContain("install");
    }
  });

  it("a plan session on another branch still mints .worktrees/{fid}", async () => {
    const cwd = repo("dev");
    const origin = path.join(path.dirname(cwd), `${path.basename(cwd)}-origin.git`);
    dirs.push(origin);
    git(path.dirname(cwd), "init", "-q", "--bare", "-b", "dev", origin);
    git(cwd, "remote", "add", "origin", origin);
    git(cwd, "push", "-q", "origin", "dev");
    git(cwd, "switch", "-q", "-c", "claude/session");
    const r = await setup(cwd, "plan", "--worktrees");
    expect(r.err).not.toContain("already used by worktree");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "created", worktreePath: worktreeDir(cwd, FID) });
    expect(fs.existsSync(worktreeDir(cwd, FID))).toBe(true);
  });
});

describe("bkit worktrees setup — debug", () => {
  it("adopts a requested debug branch without mutating conflicting worktrees", async () => {
    const cwd = repo("dev");
    git(cwd, "branch", "fix/ci");
    const adopted = await setup(cwd, "debug", "--branch=fix/ci", "--worktrees");
    expect(adopted.code).toBe(0);
    expect(adopted.json).toMatchObject({
      branch: "fix/ci",
      worktreePath: worktreeDir(cwd, FID),
    });
    expect(git(worktreeDir(cwd, FID), "branch", "--show-current")).toBe("fix/ci");
    expect(git(cwd, "branch", "--show-current")).toBe("dev");

    const conflictRoot = repo("dev");
    git(conflictRoot, "branch", "fix/ci");
    const conflict = linked(conflictRoot);
    const sentinel = path.join(conflict, "owner-work.txt");
    fs.writeFileSync(sentinel, "keep my uncommitted work\n");
    const before = git(conflict, "rev-parse", "HEAD");
    const refused = await setup(conflictRoot, "debug", "--branch=fix/ci", "--worktrees");
    expect(refused.code).toBe(7);
    expect(refused.err).toContain("fix/ci");
    expect(git(conflict, "branch", "--show-current")).toBe(`feat/${FID}`);
    expect(git(conflict, "rev-parse", "HEAD")).toBe(before);
    expect(fs.readFileSync(sentinel, "utf-8")).toBe("keep my uncommitted work\n");
    expect(git(conflictRoot, "branch", "--show-current")).toBe("dev");

    const missingRoot = repo("dev");
    expect((await setup(missingRoot, "debug", "--branch=fix/missing", "--worktrees")).code).toBe(7);
    expect(git(missingRoot, "branch", "--list", "fix/missing")).toBe("");
  });

  it("may debug in place on dev", async () => {
    const r = await setup(repo("dev"), "debug");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ branch: "dev", mode: "adopted" });
  });

  it("never in place on main", async () => {
    const r = await setup(repo("main"), "debug");
    expect(r.code).toBe(7);
    expect(r.err).toContain("refusing to work in place on main");
  });

  it("refuses a detached HEAD before anything else", async () => {
    const cwd = repo("fix/ci");
    git(cwd, "switch", "-q", "--detach");
    const r = await setup(cwd, "debug", "--worktrees");
    expect(r.code).toBe(7);
    expect(r.err).toContain("check out a branch");
  });

  it("adopts in place when the session is already on feat/{fid}", async () => {
    const cwd = repo(`feat/${FID}`);
    const r = await setup(cwd, "debug", "--worktrees");
    expect(r.json).toMatchObject({ mode: "adopted", worktreePath: cwd });
    expect(fs.existsSync(path.join(cwd, ".worktrees"))).toBe(false);
  });
});

describe("bkit worktrees setup — debug in place on dev shares the checkout", () => {
  const OTHER = "43-other";
  const recordFile = (cwd: string, fid = FID) =>
    path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${fid}.json`));
  const record = (cwd: string, fid = FID) =>
    JSON.parse(fs.readFileSync(recordFile(cwd, fid), "utf-8")) as Record<string, unknown>;
  const hashOf = (cwd: string, rel: string) => git(cwd, "hash-object", "--", rel);

  async function bkit(cwd: string, ...argv: string[]) {
    const out: string[] = [];
    const code = await runCommand([...argv, "--json"], COMMANDS, {
      classicVerbs: new Set(),
      cwd,
      io: { stdout: (t) => out.push(t), stderr: () => {} },
    });
    return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
  }
  /** Take `fid`'s workflow lock and open its run, so the lock is live. */
  async function liveRun(cwd: string, fid: string) {
    const lock = await bkit(
      cwd,
      "locks",
      "acquire",
      "--kind=workflow",
      "--workflow=debug",
      `--fid=${fid}`,
      `--month=${MONTH}`,
    );
    expect(lock.code).toBe(0);
    const start = await bkit(
      cwd,
      "workflows",
      "start",
      "--workflow=debug",
      `--fid=${fid}`,
      `--month=${MONTH}`,
      "--lock-held",
      `--token=${lock.json.token}`,
    );
    expect(start.code).toBe(0);
    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
    const stepped = await bkit(
      cwd,
      "steps",
      "done",
      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
      "--workflow=debug",
      "--step=debug-start-workflow",
      "--commit=none",
    );
    expect(stepped.code).toBe(0);
  }

  /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
  function shared() {
    const cwd = repo("dev");
    const origin = `${cwd}-origin.git`;
    dirs.push(origin);
    git(cwd, "init", "-q", "--bare", "-b", "dev", origin);
    fs.mkdirSync(path.join(cwd, "src"));
    fs.mkdirSync(path.join(cwd, ".bkit"));
    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\n");
    fs.writeFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"base"}\n');
    git(cwd, "add", "src", ".bkit");
    git(cwd, "commit", "-q", "-m", "base");
    git(cwd, "remote", "add", "origin", origin);
    git(cwd, "push", "-q", "-u", "origin", "dev");
    git(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\nforeign\n");
    fs.writeFileSync(path.join(cwd, "notes.md"), "foreign notes\n");
    fs.appendFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"foreign"}\n');
    return cwd;
  }

  it("in-place debug on dev writes the shared-checkout record", async () => {
    const cwd = shared();
    const r = await setup(cwd, "debug");
    expect(r.code).toBe(0);
    expect(fs.existsSync(recordFile(cwd))).toBe(true);
    const rec = record(cwd);
    expect(rec).toMatchObject({
      fid: FID,
      branch: "dev",
      startSha: git(cwd, "rev-parse", "HEAD"),
      aheadAtStart: 1,
      commits: [],
    });
    expect(rec.paths).toEqual(
      expect.arrayContaining([
        { path: "src/a.txt", hash: hashOf(cwd, "src/a.txt") },
        { path: "notes.md", hash: hashOf(cwd, "notes.md") },
        { path: ".bkit/issues.jsonl", hash: hashOf(cwd, ".bkit/issues.jsonl"), lines: 2 },
      ]),
    );
  });

  it("debug in place on dev from a linked worktree records its own checkout", async () => {
    const cwd = shared();
    git(cwd, "switch", "-q", "-c", "claude/session");
    const wt = path.join(path.dirname(cwd), `${path.basename(cwd)}-dev-wt`);
    dirs.push(wt);
    git(cwd, "worktree", "add", "-q", wt, "dev");
    const wtReal = fs.realpathSync(wt);
    fs.writeFileSync(path.join(wtReal, "mine.md"), "linked worktree work\n");

    const r = await setup(wtReal, "debug", "--branch=dev", "--worktrees");
    expect(r.code).toBe(0);
    expect(fs.existsSync(recordFile(wtReal))).toBe(true);
    expect(fs.existsSync(path.join(cwd, ".git/bkit/shared-checkout", `${FID}.json`))).toBe(false);
    expect(record(wtReal).paths).toEqual(
      expect.arrayContaining([{ path: "mine.md", hash: hashOf(wtReal, "mine.md") }]),
    );
  });

  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
    const cwd = shared();
    const r = await setup(cwd, "debug");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 1 });
  });

  it("a new run of the same FID rewrites startSha", async () => {
    const cwd = shared();
    await setup(cwd, "debug");
    git(cwd, "commit", "-q", "--allow-empty", "-m", "another foreign commit");
    const r = await setup(cwd, "debug");
    expect(r.code).toBe(0);
    expect(record(cwd).startSha).toBe(git(cwd, "rev-parse", "HEAD"));
    expect(r.json.aheadAtStart).toBe(2);
  });

  it("a resume of the same FID reuses the record", async () => {
    const cwd = shared();
    await setup(cwd, "debug");
    const first = fs.readFileSync(recordFile(cwd), "utf-8");
    await liveRun(cwd, FID);
    git(cwd, "commit", "-q", "--allow-empty", "-m", "the run's own commit");
    const r = await setup(cwd, "debug");
    expect(r.code).toBe(0);
    expect(fs.readFileSync(recordFile(cwd), "utf-8")).toBe(first);
  });

  describe("a resume with no record rebuilds it from the run-commits row", () => {
    const statusFile = (cwd: string) =>
      path.join(cwd, "docs", "plans", MONTH, "logs", FID, "status.jsonl");
    const commit = (cwd: string, message: string) => {
      git(cwd, "commit", "-q", "--allow-empty", "-m", message);
      return git(cwd, "rev-parse", "HEAD");
    };
    const appendRow = (cwd: string, row: Record<string, unknown>) =>
      fs.appendFileSync(
        statusFile(cwd),
        `${JSON.stringify({ type: "run-commits", workflow: "debug", at: new Date().toISOString(), ...row })}\n`,
      );

    /** An open run whose record was removed by a Stop, leaving two commits made by the run. */
    async function stopped() {
      const cwd = shared();
      await setup(cwd, "debug");
      await liveRun(cwd, FID);
      const startSha = record(cwd).startSha as string;
      const first = commit(cwd, "fix part one");
      const second = commit(cwd, "fix part two");
      fs.rmSync(recordFile(cwd));
      return { cwd, startSha, first, second };
    }

    it("restores the commits, the pushed list and startSha of the newest row", async () => {
      const { cwd, startSha, first, second } = await stopped();
      appendRow(cwd, { startSha, commits: [first], pushed: [] });
      appendRow(cwd, { startSha, commits: [first, second], pushed: [first] });
      const r = await setup(cwd, "debug");
      expect(r.code).toBe(0);
      expect(record(cwd)).toMatchObject({
        startSha,
        commits: [first, second],
        pushed: [first],
      });
      expect(r.json.startSha).toBe(startSha);
    });

    it("drops a commit id that is not on the branch", async () => {
      const { cwd, startSha, first } = await stopped();
      const stray = git(cwd, "commit-tree", "HEAD^{tree}", "-m", "never on dev");
      const missing = "0123456789abcdef0123456789abcdef01234567";
      appendRow(cwd, { startSha, commits: [first, stray, missing], pushed: [stray] });
      expect((await setup(cwd, "debug")).code).toBe(0);
      expect(record(cwd).commits).toEqual([first]);
      expect(record(cwd).pushed).toEqual([]);
    });

    it("keeps the fresh startSha when the row's startSha is not a commit", async () => {
      const { cwd, first } = await stopped();
      appendRow(cwd, {
        startSha: "0123456789abcdef0123456789abcdef01234567",
        commits: [first],
        pushed: [],
      });
      expect((await setup(cwd, "debug")).code).toBe(0);
      expect(record(cwd).startSha).toBe(git(cwd, "rev-parse", "HEAD"));
      expect(record(cwd).commits).toEqual([first]);
    });

    it("writes an empty commit list when the run has no run-commits row", async () => {
      const { cwd } = await stopped();
      expect((await setup(cwd, "debug")).code).toBe(0);
      expect(record(cwd)).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), commits: [] });
    });

    it("ignores a row from before the open run started", async () => {
      const { cwd, startSha, first } = await stopped();
      const rows = fs.readFileSync(statusFile(cwd), "utf-8");
      fs.writeFileSync(statusFile(cwd), "");
      appendRow(cwd, { startSha, commits: [first], pushed: [] });
      fs.appendFileSync(statusFile(cwd), rows);
      expect((await setup(cwd, "debug")).code).toBe(0);
      expect(record(cwd).commits).toEqual([]);
    });

    /**
     * What a landed Stop leaves: the status log, plus `extra` rows, is a commit on
     * origin/dev that local dev does not hold, and the checkout has lost the log.
     */
    function landed(cwd: string, extra: Record<string, unknown>[] = []) {
      const rel = path.relative(cwd, statusFile(cwd));
      const clone = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-land-")));
      dirs.push(clone);
      git(cwd, "clone", "-q", git(cwd, "remote", "get-url", "origin"), clone);
      fs.mkdirSync(path.dirname(path.join(clone, rel)), { recursive: true });
      fs.copyFileSync(statusFile(cwd), path.join(clone, rel));
      for (const row of extra) {
        fs.appendFileSync(path.join(clone, rel), `${JSON.stringify(row)}\n`);
      }
      git(clone, "add", "--", rel);
      git(clone, "commit", "-q", "-m", "chore: debug handover");
      git(clone, "push", "-q", "origin", "HEAD:dev");
      fs.rmSync(statusFile(cwd));
    }

    it("restores the commits from the row on origin/dev when the handover landed", async () => {
      const { cwd, startSha, first, second } = await stopped();
      appendRow(cwd, { startSha, commits: [first, second], pushed: [] });
      landed(cwd);
      const r = await setup(cwd, "debug");
      expect(r.code).toBe(0);
      expect(record(cwd)).toMatchObject({ startSha, commits: [first, second], pushed: [] });
    });

    it("restores the commits when origin/dev holds only the lines the checkout lacks", async () => {
      const { cwd, startSha, first, second } = await stopped();
      const own = fs.readFileSync(statusFile(cwd), "utf-8");
      fs.writeFileSync(statusFile(cwd), "");
      appendRow(cwd, { startSha, commits: [first, second], pushed: [] });
      landed(cwd);
      fs.writeFileSync(statusFile(cwd), own);
      expect((await setup(cwd, "debug")).code).toBe(0);
      expect(record(cwd)).toMatchObject({ startSha, commits: [first, second] });
    });

    it("ignores the row on origin/dev when the checkout's log shows the run closed", async () => {
      const { cwd, startSha, first } = await stopped();
      const own = fs.readFileSync(statusFile(cwd), "utf-8");
      appendRow(cwd, { startSha, commits: [first], pushed: [] });
      landed(cwd);
      const done = { type: "workflow-done", workflow: "debug", at: new Date(Date.now() + 1000) };
      fs.writeFileSync(statusFile(cwd), `${own}${JSON.stringify(done)}\n`);
      expect((await setup(cwd, "debug")).code).toBe(0);
      expect(record(cwd).commits).toEqual([]);
    });

    it("ignores the row on origin/dev when the run there is closed", async () => {
      const { cwd, startSha, first } = await stopped();
      appendRow(cwd, { startSha, commits: [first], pushed: [] });
      landed(cwd, [
        { type: "workflow-done", workflow: "debug", at: new Date(Date.now() + 1000).toISOString() },
      ]);
      expect((await setup(cwd, "debug")).code).toBe(0);
      expect(record(cwd).commits).toEqual([]);
    });

    describe("from the parked local copy", () => {
      const parkedFile = (cwd: string) =>
        path.resolve(
          cwd,
          git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout-parked/${FID}.json`),
        );
      /** What a handover that kept the run open parks: the record's commit list. */
      const park = (
        cwd: string,
        parked: { startSha: string; commits: string[]; pushed?: string[] },
        workflow = "debug",
      ) => writeParkedCommits(cwd, workflow, { ...newRecord(cwd, FID, "dev"), ...parked });

      it("restores commits, pushed and startSha when no copy of the row is reachable", async () => {
        const { cwd, startSha, first, second } = await stopped();
        park(cwd, { startSha, commits: [first, second], pushed: [first] });
        fs.rmSync(statusFile(cwd));
        git(cwd, "remote", "remove", "origin");
        const r = await setup(cwd, "debug");
        expect(r.code).toBe(0);
        expect(record(cwd)).toMatchObject({ startSha, commits: [first, second], pushed: [first] });
        expect(r.json.startSha).toBe(startSha);
      });

      it("wins over the row on origin/dev, which is then not needed", async () => {
        const { cwd, startSha, first, second } = await stopped();
        appendRow(cwd, { startSha, commits: [first], pushed: [] });
        landed(cwd);
        park(cwd, { startSha, commits: [first, second], pushed: [] });
        git(cwd, "remote", "set-url", "origin", `${cwd}-gone.git`);
        expect((await setup(cwd, "debug")).code).toBe(0);
        expect(record(cwd)).toMatchObject({ startSha, commits: [first, second] });
      });

      it("wins over the row in the checkout's own log while the run is open", async () => {
        const { cwd, startSha, first, second } = await stopped();
        appendRow(cwd, { startSha, commits: [first], pushed: [] });
        park(cwd, { startSha, commits: [first, second], pushed: [first] });
        expect((await setup(cwd, "debug")).code).toBe(0);
        expect(record(cwd)).toMatchObject({ commits: [first, second], pushed: [first] });
      });

      it("still drops a commit id that is not on the branch", async () => {
        const { cwd, startSha, first } = await stopped();
        const stray = git(cwd, "commit-tree", "HEAD^{tree}", "-m", "never on dev");
        park(cwd, { startSha, commits: [first, stray], pushed: [stray] });
        expect((await setup(cwd, "debug")).code).toBe(0);
        expect(record(cwd).commits).toEqual([first]);
        expect(record(cwd).pushed).toEqual([]);
      });

      it("is ignored and removed when the checkout's log shows the run closed", async () => {
        const { cwd, startSha, first } = await stopped();
        park(cwd, { startSha, commits: [first] });
        const done = { type: "workflow-done", workflow: "debug", at: new Date(Date.now() + 1000) };
        fs.appendFileSync(statusFile(cwd), `${JSON.stringify(done)}\n`);
        expect((await setup(cwd, "debug")).code).toBe(0);
        expect(record(cwd).commits).toEqual([]);
        expect(fs.existsSync(parkedFile(cwd))).toBe(false);
      });

      it("is ignored when it was parked for another workflow", async () => {
        const { cwd, startSha, first } = await stopped();
        park(cwd, { startSha, commits: [first] }, "build");
        expect((await setup(cwd, "debug")).code).toBe(0);
        expect(record(cwd).commits).toEqual([]);
      });

      it("is removed once the record is rebuilt", async () => {
        const { cwd, startSha, first } = await stopped();
        park(cwd, { startSha, commits: [first] });
        expect((await setup(cwd, "debug")).code).toBe(0);
        expect(record(cwd).commits).toEqual([first]);
        expect(fs.existsSync(parkedFile(cwd))).toBe(false);
      });

      it("is removed when the live record already stands for the open run", async () => {
        const cwd = shared();
        await setup(cwd, "debug");
        await liveRun(cwd, FID);
        const first = commit(cwd, "fix part one");
        park(cwd, { startSha: record(cwd).startSha as string, commits: [first] });
        const before = fs.readFileSync(recordFile(cwd), "utf-8");
        expect((await setup(cwd, "debug")).code).toBe(0);
        expect(fs.readFileSync(recordFile(cwd), "utf-8")).toBe(before);
        expect(fs.existsSync(parkedFile(cwd))).toBe(false);
      });
    });
  });

  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
    const cwd = shared();
    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
    await liveRun(cwd, OTHER);
    const r = await setup(cwd, "debug");
    expect(r.code).toBe(13);
    expect(r.err).toContain(OTHER);
    expect(fs.existsSync(recordFile(cwd))).toBe(false);
  });

  it("setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet", async () => {
    const cwd = shared();
    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
    await liveRun(cwd, OTHER);
    // The run closed (it still pushes and waits for CI) but its lock file is fresh.
    fs.appendFileSync(
      path.join(cwd, "docs", "plans", MONTH, "logs", OTHER, "status.jsonl"),
      `${JSON.stringify({ type: "workflow-done", workflow: "debug", at: new Date().toISOString() })}\n`,
    );
    const r = await setup(cwd, "debug");
    expect(r.code).toBe(13);
    expect(r.err).toContain(OTHER);
    expect(fs.existsSync(recordFile(cwd))).toBe(false);
    expect(fs.existsSync(recordFile(cwd, OTHER))).toBe(true);
  });

  it("setup refuses while another setup holds the guard, and clears a stale guard", async () => {
    const cwd = shared();
    const guard = path.join(path.dirname(recordFile(cwd)), ".setup.lock");
    fs.mkdirSync(path.dirname(guard), { recursive: true });
    fs.writeFileSync(guard, "");
    const busy = await setup(cwd, "debug");
    expect(busy.code).toBe(13);
    expect(fs.existsSync(recordFile(cwd))).toBe(false);
    const old = new Date(Date.now() - 120_000);
    fs.utimesSync(guard, old, old);
    const ok = await setup(cwd, "debug");
    expect(ok.code).toBe(0);
    expect(fs.existsSync(recordFile(cwd))).toBe(true);
    expect(fs.existsSync(guard)).toBe(false);
  });

  it("a stale record without a lock is replaced", async () => {
    const cwd = shared();
    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
    const r = await setup(cwd, "debug");
    expect(r.code).toBe(0);
    expect(fs.existsSync(recordFile(cwd))).toBe(true);
    expect(fs.existsSync(recordFile(cwd, OTHER))).toBe(false);
  });
});

describe("bkit worktrees setup — ship branch", () => {
  function inheritedShip(mode: "created" | "resumed" | "adopted") {
    const cwd = repo("dev");
    fs.rmSync(path.join(cwd, ".env"));
    git(cwd, "config", "user.email", "t@t");
    git(cwd, "config", "user.name", "t");
    const origin = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-origin-")));
    dirs.push(origin);
    git(origin, "init", "-q", "--bare", "-b", "dev");
    git(cwd, "remote", "add", "origin", origin);
    git(cwd, "push", "-q", "origin", "dev");
    git(cwd, "commit", "-q", "--allow-empty", "-m", "feat: unpublished dev ownership");
    const inherited = git(cwd, "rev-parse", "HEAD");
    git(cwd, "branch", `feat/${FID}`);
    const flags: string[] = [];
    if (mode !== "adopted") flags.push("--worktrees");
    if (mode === "resumed") {
      git(cwd, "worktree", "add", "-q", worktreeDir(cwd, FID), `feat/${FID}`);
    }
    if (mode === "adopted") git(cwd, "switch", "-q", `feat/${FID}`);
    return { cwd, origin, inherited, flags };
  }

  it("fetches a remote only ship branch before adopting it", async () => {
    const cwd = repo("claude/session");
    const origin = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-remote-only-")),
    );
    dirs.push(origin);
    git(origin, "init", "-q", "--bare", "-b", "dev");
    git(cwd, "remote", "add", "origin", origin);
    git(cwd, "push", "-q", "origin", "HEAD:dev", `HEAD:feat/${FID}`);
    git(cwd, "update-ref", "-d", `refs/remotes/origin/feat/${FID}`);
    git(cwd, "config", "remote.origin.fetch", "+refs/heads/dev:refs/remotes/origin/dev");
    const expected = git(origin, "rev-parse", `refs/heads/feat/${FID}`);
    const result = await setup(cwd, "ship", `--branch=feat/${FID}`);
    expect(result.code, result.err).toBe(0);
    expect(result.json).toMatchObject({
      mode: "adopted",
      branch: `feat/${FID}`,
      worktreePath: cwd,
    });
    expect(git(cwd, "branch", "--show-current")).toBe(`feat/${FID}`);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(expected);
    expect(git(cwd, "rev-parse", `refs/remotes/origin/feat/${FID}`)).toBe(expected);
  });

  it(
    "refuses inherited unpublished dev commits in every ship mode",
    async () => {
      const created = inheritedShip("created");
      const resumed = inheritedShip("resumed");
      const adopted = inheritedShip("adopted");
      const a = await setup(created.cwd, "ship", ...created.flags);
      const b = await setup(resumed.cwd, "ship", ...resumed.flags);
      const c = await setup(adopted.cwd, "ship", ...adopted.flags);
      expect([a.code, b.code, c.code]).toEqual([7, 7, 7]);
      expect(a.err).toMatch(/unpublished|unpushed/);
      expect(b.err).toMatch(/unpublished|unpushed/);
      expect(c.err).toMatch(/unpublished|unpushed/);
      expect(git(created.origin, "branch", "--list", `feat/${FID}`)).toBe("");
      expect(git(resumed.cwd, "rev-parse", `feat/${FID}`)).toBe(resumed.inherited);
      expect(git(adopted.cwd, "rev-parse", `feat/${FID}`)).toBe(adopted.inherited);

      const independent = inheritedShip("adopted");
      git(independent.cwd, "switch", "-q", "-c", "independent", "origin/dev");
      git(independent.cwd, "commit", "-q", "--allow-empty", "-m", "feat: independent work");
      const allowed = await setup(independent.cwd, "ship", "--branch=independent");
      expect(allowed.code, allowed.err).toBe(0);
      expect(allowed.json.branch).toBe("independent");
    },
    localLimit(60_000),
  );

  it("names inherited commits and ship recovery in the refusal", async () => {
    const f = inheritedShip("adopted");
    const result = await setup(f.cwd, "ship");
    expect(result.code).toBe(7);
    expect(result.err).toContain(f.inherited.slice(0, 7));
    expect(result.err).toContain("unpublished dev ownership");
    expect(result.err).toMatch(/publish.*dev|push origin dev/);
    expect(result.err).toMatch(/ship/);
    expect(result.err).not.toMatch(/re-run \/bkit-(?:design|plan)/);
    expect(git(f.cwd, "rev-parse", `feat/${FID}`)).toBe(f.inherited);
  });

  it("ships the prompt-named branch, else feat/{fid} when it exists, else the session branch", async () => {
    const cwd = repo("claude/work");
    git(cwd, "branch", "named");
    expect((await setup(cwd, "ship", "--branch=named")).json.branch).toBe("named");
    git(cwd, "switch", "-q", "claude/work");
    expect((await setup(cwd, "ship")).json.branch).toBe("claude/work");
    git(cwd, "branch", `feat/${FID}`);
    expect((await setup(cwd, "ship")).json.branch).toBe(`feat/${FID}`);
  });

  it("ship names a missing feat branch", async () => {
    const r = await setup(repo("dev"), "ship");
    expect(r.code).toBe(7);
    expect(r.err).toContain(`feat/${FID} does not exist — name the feature branch to ship`);
    expect(r.err).not.toContain("commit or stash");
  });

  it("ship on dev refuses with the releases-stay-manual text", async () => {
    const r = await setup(repo("dev"), "ship", "--branch=dev");
    expect(r.code).toBe(7);
    expect(r.err).toContain("refusing to ship dev");
    expect(r.err).toContain("ships a feature branch into dev only");
    expect(r.err).toContain("releases stay manual");
    expect(r.err).toContain("Name the feature branch to ship.");
  });

  it("refuses dev / main as the ship branch", async () => {
    const r = await setup(repo("claude/work"), "ship", "--branch=main");
    expect(r.code).toBe(7);
    expect(r.err).toContain("refusing to ship main");
    expect(r.err).toContain("releases stay manual");
  });

  it("warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue", async () => {
    const cwd = repo("claude/work");
    const r = await setup(cwd, "ship");
    expect(r.code).toBe(0);
    const warning = `[bkit-ship] WARNING branch claude/work not named for ${FID} — shipping it as named`;
    expect(r.json.branchWarning).toBe(warning);
    expect(r.err).toContain(warning);
    git(cwd, "branch", "claude/ISSUE-77-fix");
    expect(
      (await setup(cwd, "ship", "--branch=claude/ISSUE-77-fix", "--issue=#77")).json.branchWarning,
    ).toBe(null);
    git(cwd, "branch", `feat/${FID.toUpperCase()}`);
    expect(
      (await setup(cwd, "ship", `--branch=feat/${FID.toUpperCase()}`, "--issue=")).json
        .branchWarning,
    ).toBe(null);
  });

  it("--issue is ship only", async () => {
    expect((await setup(repo("dev"), "build", "--issue=7")).code).toBe(2);
  });

  it("adopts in place when the session is already on the ship branch, even with --worktrees", async () => {
    const cwd = repo(`feat/${FID}`);
    const r = await setup(cwd, "ship", "--worktrees");
    expect(r.json).toMatchObject({ mode: "adopted", worktreePath: cwd, branch: `feat/${FID}` });
  });
});

describe("bkit worktrees setup — resume guard", () => {
  it("refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout", async () => {
    const cwd = repo("dev");
    fs.mkdirSync(worktreeDir(cwd, FID), { recursive: true });
    const before = git(cwd, "rev-parse", "HEAD");
    const r = await setup(cwd, "build", "--worktrees");
    expect(r.code).toBe(10);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
  });

  it("fails with a fetch error when there is no origin to rebase onto", async () => {
    const cwd = repo("dev");
    linked(cwd);
    expect((await setup(cwd, "build", "--worktrees")).code).toBe(4);
  });

  describe("low disk", () => {
    const local = (minFreeGb: number) => {
      vi.stubEnv("CI", "");
      vi.stubEnv("CLAUDE_CODE_REMOTE", "");
      vi.stubEnv("CURSOR_REMOTE_AGENT", "");
      const cwd = repo("dev");
      fs.writeFileSync(
        path.join(cwd, "package.json"),
        JSON.stringify({ bkit: { workflows: { minFreeGb } } }),
      );
      return cwd;
    };
    afterEach(() => vi.unstubAllEnvs());

    it("stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps", async () => {
      const cwd = local(1e9);
      fs.mkdirSync(path.join(cwd, "scripts", "cleanup"), { recursive: true });
      fs.writeFileSync(
        path.join(cwd, "scripts", "cleanup", "bkit-disk-prune.mjs"),
        'export default [{ name: "noop", mode: "max", run: "touch ran" }];\n',
      );
      const r = await setup(cwd, "build", "--worktrees");
      expect(r.code).toBe(12);
      expect(r.err).toContain("still under bkit.workflows.minFreeGb");
      expect(fs.existsSync(path.join(cwd, "ran"))).toBe(true);
      expect(fs.existsSync(worktreeDir(cwd, FID))).toBe(false);
    });

    it("checks no disk when there are no cleanup step files", async () => {
      const cwd = local(1e9);
      linked(cwd);
      expect((await setup(cwd, "build", "--worktrees")).code).toBe(4);
    });
  });

  it("ship resumes without fetching or rebasing, and copies the configured list", async () => {
    const cwd = repo("dev");
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { workflows: { worktree: { install: false } } } }),
    );
    const wt = linked(cwd);
    const r = await setup(cwd, "ship", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      worktreePath: wt,
      mode: "resumed",
      owned: false,
      copied: [".env"],
      copyMissing: [".env.local"],
      installed: false,
    });
    expect(r.err).toContain(".env.local is not in the main checkout");
    expect(fs.readFileSync(path.join(wt, ".env"), "utf-8")).toBe("SECRET=1\n");
  });

  it("narrates a copy entry that points outside the main checkout and skips it", async () => {
    const cwd = repo("dev");
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({
        bkit: { workflows: { worktree: { copy: ["../secrets"], install: false } } },
      }),
    );
    linked(cwd);
    const r = await setup(cwd, "ship", "--worktrees");
    expect(r.json).toMatchObject({ copied: [], copyMissing: [] });
    expect(r.err).toContain("outside the main checkout");
  });
});

describe("addAllButCopied", () => {
  it("omits a copied entry git ignores instead of naming it in the exclude pathspec (#700)", () => {
    const cwd = repo("dev");
    fs.writeFileSync(path.join(cwd, ".gitignore"), ".bkit/.env\n");
    fs.mkdirSync(path.join(cwd, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".bkit/.env"), "SECRET=1\n");
    fs.writeFileSync(path.join(cwd, "a.txt"), "a\n");
    git(cwd, "add", ".gitignore");
    git(cwd, "commit", "-q", "-m", "ignore");
    fs.writeFileSync(path.join(cwd, "a.txt"), "changed\n");

    const res = addAllButCopied(cwd, [".env", ".bkit/.env"]);
    expect(res.ok).toBe(true);
    git(cwd, "commit", "-q", "-m", "row");
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toBe("a.txt");
  });

  it("stages the tree when a copy entry points outside the checkout, which setup skips too", () => {
    const cwd = repo("dev");
    fs.writeFileSync(path.join(cwd, "a.txt"), "a\n");

    const res = addAllButCopied(cwd, ["../shared/.env", "/etc/hosts", ".env"]);
    expect(res.ok).toBe(true);
    git(cwd, "commit", "-q", "-m", "row");
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toBe("a.txt");
  });

  it("never commits an entry only the main checkout's copy list names", () => {
    const cwd = repo("dev");
    const wt = linked(cwd);
    // An uncommitted edit to the main checkout's list: the worktree's package.json lacks it.
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { workflows: { worktree: { copy: ["secrets.json"] } } } }),
    );
    fs.writeFileSync(path.join(wt, "secrets.json"), "{}\n");
    fs.writeFileSync(path.join(wt, "a.txt"), "a\n");

    expect(addAllButCopied(wt).ok).toBe(true);
    git(wt, "commit", "-q", "-m", "step");
    expect(git(wt, "show", "--name-only", "--format=", "HEAD")).toBe("a.txt");
  });
});

describe("paths", () => {
  it("puts the worktree under .worktrees and the marker in the git common dir's outbox", () => {
    const cwd = repo();
    expect(worktreeDir(cwd, FID)).toBe(path.join(cwd, ".worktrees", FID));
    expect(ownershipMarker(cwd, FID)).toBe(
      path.join(cwd, ".git", "bkit-outbox", FID, ".worktree-owned"),
    );
  });

  it("resolves the same marker from inside the worktree", () => {
    const cwd = repo();
    expect(ownershipMarker(linked(cwd), FID)).toBe(ownershipMarker(cwd, FID));
  });
});

describe("bkit worktrees remove", () => {
  it("answers absent when there is no worktree", async () => {
    const r = await remove(repo());
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ removed: false, reason: "absent", branchBlockedBy: null });
  });

  it("leaves a worktree without the marker in place", async () => {
    const cwd = repo();
    const wt = linked(cwd);
    const r = await remove(cwd);
    expect(r.json).toMatchObject({ removed: false, reason: "not-owned" });
    expect(r.err).toContain("not ours");
    expect(fs.existsSync(wt)).toBe(true);
  });

  it("preserves a marked worktree with uncommitted changes and its marker", async () => {
    const cwd = repo();
    fs.writeFileSync(path.join(cwd, "dirty.txt"), "base\n");
    git(cwd, "add", "dirty.txt");
    git(cwd, "commit", "-qm", "tracked cleanup fixture");
    const wt = linked(cwd, FID, true);
    fs.writeFileSync(path.join(wt, "dirty.txt"), "x\n");
    const r = await remove(cwd);
    expect(r.json).toEqual({
      removed: false,
      reason: "uncommitted",
      worktreePath: wt,
      repoRoot: cwd,
      branchDeleted: null,
      remoteDeleted: null,
      branchBlockedBy: null,
    });
    expect(fs.readFileSync(path.join(wt, "dirty.txt"), "utf-8")).toBe("x\n");
    expect(fs.existsSync(ownershipMarker(cwd, FID))).toBe(true);
    expect(git(cwd, "worktree", "list")).toContain(".worktrees");
    expect(git(cwd, "branch", "--list", `feat/${FID}`)).toContain(`feat/${FID}`);
  });

  it("keeps the marker when the worktree directory was deleted by hand, and prunes its entry", async () => {
    const cwd = repo();
    fs.rmSync(linked(cwd, FID, true), { recursive: true, force: true });
    const r = await remove(cwd);
    expect(r.json.reason).toBe("absent");
    expect(fs.existsSync(ownershipMarker(cwd, FID))).toBe(true);
    expect(git(cwd, "worktree", "list")).not.toContain(".worktrees");
  });

  it("tells a caller inside the removed worktree where to cd", async () => {
    const cwd = repo();
    const wt = linked(cwd, FID, true);
    const r = await remove(wt);
    expect(r.json.removed).toBe(true);
    expect(r.err).toContain(`cd to ${cwd}`);
  });

  it("fails with its own exit code when git cannot remove a marked path", async () => {
    const cwd = repo();
    fs.mkdirSync(worktreeDir(cwd, FID), { recursive: true });
    const marker = ownershipMarker(cwd, FID);
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, "");
    expect((await remove(cwd)).code).toBe(11);
  });

  describe("--branch", () => {
    /** A bare origin the repo pushes feat/{fid} to. */
    function withOrigin(cwd: string) {
      const origin = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-origin-")));
      dirs.push(origin);
      git(origin, "init", "-q", "--bare");
      git(cwd, "remote", "add", "origin", origin);
      return origin;
    }
    const remoteHas = (origin: string) =>
      git(origin, "branch", "--list", `feat/${FID}`).includes(`feat/${FID}`);

    it.each([
      { change: "content", stage: (file: string) => fs.writeFileSync(file, "staged-only work\n") },
      { change: "mode", stage: (file: string) => fs.chmodSync(file, 0o755) },
      {
        change: "type",
        stage: (file: string) => {
          fs.unlinkSync(file);
          fs.symlinkSync("staged target", file);
        },
      },
      { change: "deletion", stage: (file: string) => fs.unlinkSync(file) },
    ])("preserves staged-only $change during landed cleanup", ({ stage }) => {
      const cwd = repo();
      fs.writeFileSync(path.join(cwd, "staged.txt"), "landed\n");
      git(cwd, "add", "staged.txt");
      git(cwd, "commit", "-qm", "landed file");
      const origin = withOrigin(cwd);
      git(cwd, "push", "-q", "origin", "dev");
      const wt = linked(cwd, FID, true);
      const file = path.join(wt, "staged.txt");
      stage(file);
      git(wt, "add", "staged.txt");
      const staged = git(wt, "ls-files", "--stage", "--", "staged.txt");
      fs.rmSync(file, { force: true });
      fs.writeFileSync(file, "landed\n");
      fs.chmodSync(file, 0o644);

      const messages: string[] = [];
      const result = removeWorktree(cwd, FID, `feat/${FID}`, (m) => messages.push(m), {
        landed: true,
      });

      expect(result).toMatchObject({
        removed: false,
        reason: "uncommitted",
        branchDeleted: false,
        remoteDeleted: false,
      });
      expect(messages.join("\n")).toContain("staged.txt");
      expect(fs.readFileSync(file, "utf-8")).toBe("landed\n");
      expect(git(wt, "ls-files", "--stage", "--", "staged.txt")).toBe(staged);
      expect(fs.existsSync(ownershipMarker(cwd, FID))).toBe(true);
      expect(git(cwd, "branch", "--list", `feat/${FID}`)).toContain(`feat/${FID}`);
      expect(git(origin, "branch", "--list", "dev")).toContain("dev");
    });

    it("removes landed staged content when both index and working contents are on dev", () => {
      const cwd = repo();
      fs.writeFileSync(path.join(cwd, "staged.txt"), "base\n");
      git(cwd, "add", "staged.txt");
      git(cwd, "commit", "-qm", "base file");
      withOrigin(cwd);
      const wt = linked(cwd, FID, true);
      fs.writeFileSync(path.join(cwd, "staged.txt"), "landed\n");
      git(cwd, "add", "staged.txt");
      git(cwd, "commit", "-qm", "landed file");
      git(cwd, "push", "-q", "origin", "dev");
      fs.writeFileSync(path.join(wt, "staged.txt"), "landed\n");
      git(wt, "add", "staged.txt");

      const result = removeWorktree(cwd, FID, `feat/${FID}`, () => {}, { landed: true });

      expect(result).toMatchObject({ removed: true, branchDeleted: true });
      expect(fs.existsSync(wt)).toBe(false);
    });

    it("deletes the proved local and remote branch at their landed tips", async () => {
      const cwd = repo();
      const origin = withOrigin(cwd);
      git(cwd, "push", "-q", "origin", "dev");
      linked(cwd, FID, true);
      git(cwd, "push", "-q", "origin", `feat/${FID}`);
      expect(remoteHas(origin)).toBe(true);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({
        removed: true,
        branchDeleted: true,
        remoteDeleted: true,
        branchBlockedBy: null,
      });
      expect(git(cwd, "branch", "--list", `feat/${FID}`)).toBe("");
      expect(remoteHas(origin)).toBe(false);
    });

    it("retains the remote branch when origin refuses its conditional deletion", async () => {
      const cwd = repo();
      const origin = withOrigin(cwd);
      git(cwd, "push", "-q", "origin", "dev");
      linked(cwd, FID, true);
      git(cwd, "push", "-q", "origin", `feat/${FID}`);
      const hook = path.join(origin, "hooks", "pre-receive");
      fs.writeFileSync(hook, "#!/bin/sh\necho refused >&2\nexit 1\n");
      fs.chmodSync(hook, 0o755);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({
        removed: true,
        branchDeleted: true,
        remoteDeleted: false,
        branchBlockedBy: null,
      });
      expect(remoteHas(origin)).toBe(true);
      expect(r.err).toContain(`remote origin/feat/${FID} not deleted — preserved`);
    });

    /** dev carries the branch's change in one commit, then edits the same file again. */
    function landThenEdit(cwd: string, origin: string) {
      fs.writeFileSync(path.join(cwd, "shared.txt"), "base\n");
      git(cwd, "add", "shared.txt");
      git(cwd, "commit", "-qm", "base file");
      git(cwd, "push", "-q", "origin", "dev");
      const wt = linked(cwd, FID, true);
      fs.writeFileSync(path.join(wt, "shared.txt"), "base\nbranch change\n");
      git(wt, "add", "shared.txt");
      git(wt, "commit", "-qm", "branch change");
      git(wt, "push", "-q", "origin", `feat/${FID}`);
      fs.writeFileSync(path.join(cwd, "shared.txt"), "base\nbranch change\n");
      git(cwd, "commit", "-qam", "dev carries branch change");
      fs.writeFileSync(path.join(cwd, "shared.txt"), "base\nbranch change\nlater dev edit\n");
      git(cwd, "commit", "-qam", "later dev edit");
      git(cwd, "push", "-q", "origin", "dev");
      expect(origin).toBeTruthy();
      return wt;
    }

    it("removes the worktree and local branch when a later dev commit changed the branch's file", async () => {
      const cwd = repo();
      const origin = withOrigin(cwd);
      const wt = landThenEdit(cwd, origin);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ removed: true, branchDeleted: true, branchBlockedBy: null });
      expect(r.json.reason).not.toBe("not-landed");
      expect(fs.existsSync(wt)).toBe(false);
      expect(git(cwd, "branch", "--list", `feat/${FID}`)).toBe("");
    });

    it("deletes the remote branch when a later dev commit changed the branch's file", async () => {
      const cwd = repo();
      const origin = withOrigin(cwd);
      landThenEdit(cwd, origin);
      expect(remoteHas(origin)).toBe(true);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.code).toBe(0);
      expect(r.json.reason).not.toBe("remote-not-landed");
      expect(r.json).toMatchObject({ removed: true, remoteDeleted: true });
      expect(remoteHas(origin)).toBe(false);
    });

    it("an unmarked worktree holding the branch blocks BOTH deletes and is named", async () => {
      const cwd = repo();
      const origin = withOrigin(cwd);
      const wt = linked(cwd);
      git(cwd, "push", "-q", "origin", `feat/${FID}`);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({
        removed: false,
        reason: "not-owned",
        branchDeleted: false,
        remoteDeleted: false,
        branchBlockedBy: wt,
      });
      expect(r.err).toContain(`feat/${FID} is checked out in ${wt}`);
      expect(git(cwd, "branch", "--list", `feat/${FID}`)).toContain(`feat/${FID}`);
      expect(remoteHas(origin)).toBe(true);
    });

    it("an unmarked worktree elsewhere holding the branch blocks the deletes too", async () => {
      const cwd = repo();
      const origin = withOrigin(cwd);
      const elsewhere = path.join(cwd, "..", `${path.basename(cwd)}-other`);
      dirs.push(elsewhere);
      git(cwd, "worktree", "add", "-q", elsewhere, "-b", `feat/${FID}`);
      git(cwd, "push", "-q", "origin", `feat/${FID}`);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.json).toMatchObject({
        reason: "absent",
        branchBlockedBy: fs.realpathSync(elsewhere),
      });
      expect(remoteHas(origin)).toBe(true);
    });

    it("a branch already gone is reported as unavailable without claiming deletion", async () => {
      const cwd = repo();
      withOrigin(cwd);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.json).toMatchObject({
        branchDeleted: false,
        remoteDeleted: false,
        branchBlockedBy: null,
      });
    });

    it.each(["dev", "main"])("refuses to delete %s (2)", async (branch) => {
      const r = await remove(repo(), `--branch=${branch}`);
      expect(r.code).toBe(2);
      expect(r.err).toContain(`refusing to delete branch ${branch}`);
    });
  });
});

describe("bkit worktrees setup --detect", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses --detect with --worktrees", async () => {
    const r = await setup(repo("claude/session"), "build", "--detect", "--worktrees");
    expect(r.code).toBe(2);
    expect(r.err).toContain("give --worktrees or --detect, not both");
  });

  it("a runtime that cannot mint worktrees adopts the checkout in place", async () => {
    vi.stubEnv("BKIT_RUNTIME", "CLOUD_CLAUDE");
    const cwd = repo("claude/session");
    const r = await setup(cwd, "build", "--detect");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "adopted", worktreePath: cwd });
  });

  it("a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts", async () => {
    // With a registered worktree and no origin: minting resumes it and fails the
    // rebase fetch (exit 4); adopting refuses to work in place on dev (exit 7).
    const fixture = () => {
      const cwd = repo("dev");
      linked(cwd);
      return cwd;
    };
    vi.stubEnv("BKIT_RUNTIME", "LOCAL");
    expect((await setup(fixture(), "build", "--detect")).code).toBe(4);
    vi.stubEnv("BKIT_RUNTIME", "CLOUD_CLAUDE");
    expect((await setup(fixture(), "build", "--detect")).code).toBe(7);
  });
});
