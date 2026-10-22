// Everything `bkit worktrees` does without a remote: flag validation, adopt
// mode, ship's branch choice, the plain-directory guard, list and remove. The
// cases that fetch, mint and rebase are in worktrees.integration.test.ts.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

const FID = "42-thing";
const MONTH = "202610";
const dirs: string[] = [];
afterEach(() => {
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
  const code = await runCommand(["worktrees", ...argv], [worktreesCommand], {
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
    [["--workflow=build", `--fid=${FID}`, `--month=${MONTH}`, "--branch=x"], "ship only"],
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
      owned: false,
      rebaseConflict: false,
      sentinel: null,
      logDir: path.join(cwd, "docs/plans", MONTH, "logs", FID),
      baseRef: "origin/dev",
      baseSha: null,
      copied: [],
      copyMissing: [],
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

describe("bkit worktrees setup — debug", () => {
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

describe("bkit worktrees setup — ship branch", () => {
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
        JSON.stringify({ bkit: { disk: { minFreeGb } } }),
      );
      return cwd;
    };
    afterEach(() => vi.unstubAllEnvs());

    it("stops before minting when free disk stays under bkit.disk.minFreeGb after the max steps", async () => {
      const cwd = local(1e9);
      fs.mkdirSync(path.join(cwd, "scripts", "cleanup"), { recursive: true });
      fs.writeFileSync(
        path.join(cwd, "scripts", "cleanup", "bkit-disk-prune.mjs"),
        'export default [{ name: "noop", mode: "max", run: "touch ran" }];\n',
      );
      const r = await setup(cwd, "build", "--worktrees");
      expect(r.code).toBe(12);
      expect(r.err).toContain("still under bkit.disk.minFreeGb");
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
      JSON.stringify({ bkit: { worktree: { install: false } } }),
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
      JSON.stringify({ bkit: { worktree: { copy: ["../secrets"], install: false } } }),
    );
    linked(cwd);
    const r = await setup(cwd, "ship", "--worktrees");
    expect(r.json).toMatchObject({ copied: [], copyMissing: [] });
    expect(r.err).toContain("outside the main checkout");
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

  it("removes a marked worktree with uncommitted changes and clears the marker", async () => {
    const cwd = repo();
    const wt = linked(cwd, FID, true);
    fs.writeFileSync(path.join(wt, "dirty.txt"), "x\n");
    const r = await remove(cwd);
    expect(r.json).toEqual({
      removed: true,
      reason: null,
      worktreePath: wt,
      repoRoot: cwd,
      branchDeleted: null,
      remoteDeleted: null,
      branchBlockedBy: null,
    });
    expect(fs.existsSync(wt)).toBe(false);
    expect(fs.existsSync(ownershipMarker(cwd, FID))).toBe(false);
    expect(git(cwd, "worktree", "list")).not.toContain(".worktrees");
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

    it("deletes the local and remote branch once the marked worktree is gone", async () => {
      const cwd = repo();
      const origin = withOrigin(cwd);
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

    it("a branch already gone everywhere is reported deleted", async () => {
      const cwd = repo();
      withOrigin(cwd);
      const r = await remove(cwd, `--branch=feat/${FID}`);
      expect(r.json).toMatchObject({
        branchDeleted: true,
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
