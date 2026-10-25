// worktrees.integration.test.ts — `bkit worktrees` against a real bare `origin`:
// fetch, worktree add, rebase and removal, with the package manager stubbed on
// PATH. Integration-tier because every case does real git work over a remote.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import { ownershipMarker, worktreesCommand } from "./worktrees";

const FID = "42-thing";
const MONTH = "202610";
const dirs: string[] = [];
let stubLog = "";
let direnvLog = "";
const savedPath = process.env.PATH;

/**
 * The package manager and direnv, stubbed: each records "<cwd> <args>" and exits
 * with $STUB_EXIT / $DIRENV_EXIT, so no test touches the real direnv allow list.
 */
beforeEach(() => {
  const stub = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-stub-")));
  dirs.push(stub);
  stubLog = path.join(stub, "calls.log");
  const bin = path.join(stub, PACKAGE_RUNNER);
  fs.writeFileSync(bin, `#!/bin/sh\necho "$PWD $*" >> "${stubLog}"\nexit \${STUB_EXIT:-0}\n`);
  fs.chmodSync(bin, 0o755);
  direnvLog = path.join(stub, "direnv.log");
  const direnv = path.join(stub, "direnv");
  fs.writeFileSync(
    direnv,
    `#!/bin/sh\necho "$PWD $*" >> "${direnvLog}"\nexit \${DIRENV_EXIT:-0}\n`,
  );
  fs.chmodSync(direnv, 0o755);
  process.env.PATH = `${stub}${path.delimiter}${savedPath}`;
  delete process.env.STUB_EXIT;
  delete process.env.DIRENV_EXIT;
});
afterEach(() => {
  process.env.PATH = savedPath;
  delete process.env.STUB_EXIT;
  delete process.env.DIRENV_EXIT;
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const g = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  });
const git = (cwd: string, ...args: string[]) => g(cwd, ...args).stdout.trim();
const installCalls = () => (fs.existsSync(stubLog) ? fs.readFileSync(stubLog, "utf-8").trim() : "");
const direnvCalls = () =>
  fs.existsSync(direnvLog) ? fs.readFileSync(direnvLog, "utf-8").trim() : "";

interface Fixture {
  origin: string;
  seed: string;
  repo: string;
}

const layout = (base: string): Fixture => ({
  origin: path.join(base, "origin.git"),
  seed: path.join(base, "seed"),
  repo: path.join(base, "repo"),
});

/** Built once, copied per test: cloning costs a dozen git spawns, a copy costs two. */
let template = "";
beforeAll(() => {
  template = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-template-")));
  const t = layout(template);
  git(template, "init", "-q", "--bare", "-b", "dev", t.origin);
  git(template, "clone", "-q", t.origin, t.seed);
  fs.writeFileSync(path.join(t.seed, "a.txt"), "base\n");
  git(t.seed, "add", "a.txt");
  git(t.seed, "commit", "-q", "-m", "init");
  git(t.seed, "push", "-q", "origin", "HEAD:dev");
  git(template, "clone", "-q", t.origin, t.repo);
  git(t.repo, "config", "user.email", "t@t");
  git(t.repo, "config", "user.name", "t");
  fs.writeFileSync(path.join(t.repo, ".env"), "SECRET=1\n");
});
afterAll(() => fs.rmSync(template, { recursive: true, force: true }));

/** A bare `origin` with `dev`, a seed clone that pushes to it, and the repo under test. */
function fixture(): Fixture {
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-")));
  dirs.push(base);
  fs.cpSync(template, base, { recursive: true });
  const f = layout(base);
  git(f.seed, "remote", "set-url", "origin", f.origin);
  git(f.repo, "remote", "set-url", "origin", f.origin);
  return f;
}

/** Commit `body` to `file` on origin's `dev`. */
function advanceDev(f: Fixture, file: string, body: string): string {
  git(f.seed, "pull", "-q", "origin", "dev");
  fs.writeFileSync(path.join(f.seed, file), body);
  git(f.seed, "add", file);
  git(f.seed, "commit", "-q", "-m", `dev: ${file}`);
  git(f.seed, "push", "-q", "origin", "HEAD:dev");
  return git(f.seed, "rev-parse", "HEAD");
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

const wtOf = (f: Fixture) => path.join(f.repo, ".worktrees", FID);
const marker = (f: Fixture) => ownershipMarker(f.repo, FID);

describe("bkit worktrees setup — mint (create)", () => {
  it("cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev", async () => {
    const f = fixture();
    // A bare `git fetch origin dev` would write only FETCH_HEAD here and leave origin/dev stale.
    git(f.repo, "config", "remote.origin.fetch", "+refs/heads/none:refs/remotes/origin/none");
    const tip = advanceDev(f, "b.txt", "new\n");
    expect(git(f.repo, "rev-parse", "origin/dev")).not.toBe(tip);

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      worktreePath: wtOf(f),
      repoRoot: f.repo,
      branch: `feat/${FID}`,
      mode: "created",
      owned: true,
      rebaseConflict: false,
      sentinel: null,
      baseSha: tip,
      installed: true,
    });
    expect(git(wtOf(f), "rev-parse", "HEAD")).toBe(tip);
    expect(fs.existsSync(path.join(wtOf(f), "docs/plans", MONTH, "logs", FID))).toBe(true);
    expect(fs.existsSync(marker(f))).toBe(true);
    // The marker lives in the git common dir, never inside the worktree.
    expect(marker(f).startsWith(path.join(f.repo, ".git"))).toBe(true);
    expect(installCalls()).toBe(`${wtOf(f)} install --frozen-lockfile`);
  });

  it("cuts feat/{fid} off local dev when it is ahead of origin/dev, and says so", async () => {
    const f = fixture();
    fs.writeFileSync(path.join(f.repo, "held.txt"), "unpushed\n");
    git(f.repo, "add", "held.txt");
    git(f.repo, "commit", "-q", "-m", "held on local dev");
    const local = git(f.repo, "rev-parse", "dev");

    const r = await setup(f.repo, "plan", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "created", baseRef: "dev", baseSha: local });
    expect(git(wtOf(f), "rev-parse", "HEAD")).toBe(local);
    expect(r.err).toContain("local dev is 1 commit(s) ahead of origin/dev");
  });

  it("stays on origin/dev when local dev has diverged from it, and says so", async () => {
    const f = fixture();
    git(f.repo, "commit", "-q", "--allow-empty", "-m", "local only");
    const tip = advanceDev(f, "b.txt", "new\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ baseRef: "origin/dev", baseSha: tip });
    expect(r.err).toContain("have diverged");
  });

  it("runs direnv allow on a .envrc identical to the main checkout's", async () => {
    const f = fixture();
    fs.writeFileSync(path.join(f.seed, ".envrc"), "dotenv_if_exists .bkit/.env\n");
    git(f.seed, "add", ".envrc");
    git(f.seed, "commit", "-q", "-m", "envrc");
    git(f.seed, "push", "-q", "origin", "HEAD:dev");
    git(f.repo, "pull", "-q", "origin", "dev");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.json.direnvAllowed).toBe(true);
    expect(direnvCalls()).toBe(`${wtOf(f)} allow ${wtOf(f)}`);
  });

  it("leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures", async () => {
    const f = fixture();
    fs.writeFileSync(path.join(f.seed, ".envrc"), "export A=1\n");
    git(f.seed, "add", ".envrc");
    git(f.seed, "commit", "-q", "-m", "envrc");
    git(f.seed, "push", "-q", "origin", "HEAD:dev");
    // The main checkout's dev is behind, so it has no .envrc at all.
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json.direnvAllowed).toBe(false);
    expect(r.err).toContain("differs from the main checkout's");
    expect(direnvCalls()).toBe("");

    fs.writeFileSync(path.join(f.repo, ".envrc"), "export A=1\n");
    process.env.DIRENV_EXIT = "1";
    git(wtOf(f), "commit", "-q", "--allow-empty", "-m", "feature");
    const again = await setup(f.repo, "build", "--worktrees");
    expect(again.code).toBe(0);
    expect(again.json).toMatchObject({ mode: "resumed", direnvAllowed: false });
    expect(again.err).toContain("direnv allow failed (exit 1)");
  });

  it("copies the configured list, narrates each missing entry, and nothing outside it", async () => {
    const f = fixture();
    fs.mkdirSync(path.join(f.repo, "apps/web"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, "apps/web/.env.preview"), "X=1\n");
    fs.mkdirSync(path.join(f.repo, ".vale/styles/write-good"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, ".vale/styles/write-good/a.yml"), "x\n");
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.json.copied).toEqual([".env"]);
    expect(r.json.copyMissing).toEqual([".env.local"]);
    expect(r.err).toContain(".env.local is not in the main checkout");
    expect(fs.readFileSync(path.join(wtOf(f), ".env"), "utf-8")).toBe("SECRET=1\n");
    expect(fs.existsSync(path.join(wtOf(f), "apps/web/.env.preview"))).toBe(false);
    expect(fs.existsSync(path.join(wtOf(f), ".vale/styles/write-good"))).toBe(false);
  });

  it("reads package.json bkit.workflows.worktree: copy list (files and folders) and install off", async () => {
    const f = fixture();
    fs.writeFileSync(
      path.join(f.repo, "package.json"),
      JSON.stringify({
        bkit: { workflows: { worktree: { copy: ["config/local", ".env"], install: false } } },
      }),
    );
    fs.mkdirSync(path.join(f.repo, "config/local"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, "config/local/k.json"), "{}");
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json.copied).toEqual(["config/local", ".env"]);
    expect(fs.existsSync(path.join(wtOf(f), "config/local/k.json"))).toBe(true);
    expect(r.json.installed).toBe(false);
    expect(installCalls()).toBe("");
  });

  it.each(["design", "plan"])("%s installs dependencies like build and debug", async (workflow) => {
    const f = fixture();
    const r = await setup(f.repo, workflow, "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "created", owned: true, installed: true });
    expect(installCalls()).toBe(`${wtOf(f)} install --frozen-lockfile`);
  });

  it.each(["design", "plan"])("%s stops on a failed install (5)", async (workflow) => {
    const f = fixture();
    process.env.STUB_EXIT = "1";
    const r = await setup(f.repo, workflow, "--worktrees");
    expect(r.code).toBe(5);
    expect(r.json).toMatchObject({ mode: "created", installed: false });
  });

  it("adds the existing local feat/{fid} rather than cutting a new one", async () => {
    const f = fixture();
    git(f.repo, "branch", `feat/${FID}`);
    git(f.repo, "commit", "-q", "--allow-empty", "-m", "on dev only");
    const featSha = git(f.repo, "rev-parse", `feat/${FID}`);
    const r = await setup(f.repo, "plan", "--worktrees");
    expect(r.json.mode).toBe("created");
    expect(git(wtOf(f), "rev-parse", "HEAD")).toBe(featSha);
  });

  it("tracks origin/feat/{fid} when only the remote has it", async () => {
    const f = fixture();
    git(f.seed, "commit", "-q", "--allow-empty", "-m", "feature work");
    git(f.seed, "push", "-q", "origin", `HEAD:feat/${FID}`);
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.json.mode).toBe("created");
    expect(git(wtOf(f), "rev-parse", "HEAD")).toBe(git(f.seed, "rev-parse", "HEAD"));
    expect(git(wtOf(f), "rev-parse", "--abbrev-ref", "@{upstream}")).toBe(`origin/feat/${FID}`);
  });

  it("fails without minting when origin cannot be reached", async () => {
    const f = fixture();
    git(f.repo, "remote", "set-url", "origin", path.join(f.repo, "..", "gone.git"));
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(4);
    expect(fs.existsSync(wtOf(f))).toBe(false);
  });

  it("reports a failed install with its own exit code, after the worktree is ready", async () => {
    const f = fixture();
    process.env.STUB_EXIT = "1";
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(5);
    expect(r.json).toMatchObject({ mode: "created", installed: false });
  });

  it("reports a package manager that could not run (127) apart from a failed install", async () => {
    const f = fixture();
    process.env.STUB_EXIT = "127";
    const r = await setup(f.repo, "ship", "--worktrees");
    expect(r.code).toBe(6);
    expect(r.err).toContain("could not run");
  });
});

describe("bkit worktrees setup — mint (resume)", () => {
  async function minted(workflow = "build") {
    const f = fixture();
    expect((await setup(f.repo, workflow, "--worktrees")).code).toBe(0);
    fs.rmSync(stubLog, { force: true });
    return f;
  }

  it("rebases onto origin/dev and clears a stale sentinel", async () => {
    const f = await minted();
    fs.writeFileSync(path.join(wtOf(f), "feature.txt"), "x\n");
    git(wtOf(f), "add", "feature.txt");
    git(wtOf(f), "commit", "-q", "-m", "feature");
    const logDir = path.join(wtOf(f), "docs/plans", MONTH, "logs", FID);
    fs.writeFileSync(path.join(logDir, ".rebase-failed"), "");
    const tip = advanceDev(f, "b.txt", "new\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "resumed", sentinel: null, rebaseConflict: false });
    expect(git(wtOf(f), "rev-parse", "HEAD~1")).toBe(tip);
    expect(fs.existsSync(path.join(logDir, ".rebase-failed"))).toBe(false);
    expect(installCalls()).toBe(`${wtOf(f)} install --frozen-lockfile`);
  });

  it.each(["build", "design"])(
    "%s: a conflict is left in progress for the resolver, with sentinel and log",
    async (workflow) => {
      const f = await minted(workflow);
      fs.writeFileSync(path.join(wtOf(f), "a.txt"), "feature\n");
      git(wtOf(f), "commit", "-q", "-am", "feature edit");
      advanceDev(f, "a.txt", "dev\n");

      const r = await setup(f.repo, workflow, "--worktrees");
      expect(r.code).toBe(3);
      expect(r.json).toMatchObject({ mode: "resumed", rebaseConflict: true, installed: false });
      const logDir = path.join(wtOf(f), "docs/plans", MONTH, "logs", FID);
      expect(r.json.sentinel).toBe(path.join(logDir, ".rebase-failed"));
      expect(fs.existsSync(r.json.sentinel)).toBe(true);
      expect(fs.readFileSync(path.join(logDir, "rebase-resolve-log.md"), "utf-8")).toContain(
        "rebase onto origin/dev stopped",
      );
      expect(git(wtOf(f), "diff", "--name-only", "--diff-filter=U")).toBe("a.txt");
      expect(installCalls()).toBe("");

      // Still mid-rebase on a re-run: the same answer, not a second rebase.
      const again = await setup(f.repo, workflow, "--worktrees");
      expect(again.code).toBe(3);
      expect(again.err).toContain("already in progress");

      // Once resolved, a re-run clears the sentinel.
      fs.writeFileSync(path.join(wtOf(f), "a.txt"), "resolved\n");
      git(wtOf(f), "add", "a.txt");
      expect(
        spawnSync("git", ["-c", "core.editor=true", "rebase", "--continue"], { cwd: wtOf(f) })
          .status,
      ).toBe(0);
      const after = await setup(f.repo, workflow, "--worktrees");
      expect(after.code).toBe(0);
      expect(fs.existsSync(path.join(logDir, ".rebase-failed"))).toBe(false);
    },
  );

  it("rebases onto local dev while it is ahead of origin/dev, without rewriting its commits", async () => {
    const f = await minted();
    git(wtOf(f), "commit", "-q", "--allow-empty", "-m", "feature");
    git(f.repo, "commit", "-q", "--allow-empty", "-m", "held on local dev");
    const local = git(f.repo, "rev-parse", "dev");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "resumed", baseRef: "dev", baseSha: local });
    expect(git(wtOf(f), "rev-parse", "HEAD~1")).toBe(local);
  });

  it.each(["debug", "build"])(
    "%s: commits a failed ship's leftovers, drops the logs dev already holds, then rebases",
    async (workflow) => {
      const f = await minted();
      const rel = `docs/plans/${MONTH}/logs/${FID}`;
      const logDir = path.join(wtOf(f), rel);
      fs.writeFileSync(
        path.join(logDir, "status.jsonl"),
        `${JSON.stringify({ type: "workflow-started", workflow: "ship", at: "2026-10-22T06:51:49Z" })}\n` +
          `${JSON.stringify({ type: "workflow-failed", workflow: "ship", at: "2026-10-22T07:17:00Z" })}\n`,
      );
      fs.writeFileSync(path.join(logDir, "ship-summary.md"), "worktree copy\n");
      fs.writeFileSync(path.join(wtOf(f), "a.txt"), "ship doc edit\n");
      // The flush landed the ship log on dev; the worktree's copy has drifted from it.
      fs.mkdirSync(path.join(f.seed, rel), { recursive: true });
      const tip = advanceDev(f, `${rel}/ship-summary.md`, "landed copy\n");

      const r = await setup(f.repo, workflow, "--worktrees");
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({
        mode: "resumed",
        sentinel: null,
        carriedDropped: [`${rel}/ship-summary.md`],
      });
      expect(r.err).toContain("committed the failed ship record left uncommitted");
      expect(git(wtOf(f), "log", "-1", "--format=%s")).toBe(
        `chore(${FID}): carry the failed ship record left uncommitted bkit`,
      );
      expect(r.json.carriedSha).toBe(git(wtOf(f), "rev-parse", "HEAD"));
      expect(git(wtOf(f), "rev-parse", "HEAD~1")).toBe(tip);
      // Only the .env setup copied in stays out of the commit.
      expect(git(wtOf(f), "status", "--porcelain")).toBe("?? .env");
      expect(fs.readFileSync(path.join(logDir, "ship-summary.md"), "utf-8")).toBe("landed copy\n");
      expect(fs.readFileSync(path.join(wtOf(f), "a.txt"), "utf-8")).toBe("ship doc edit\n");
    },
  );

  it("never commits the entries setup copies in from the main checkout", async () => {
    const f = await minted();
    expect(fs.readFileSync(path.join(wtOf(f), ".env"), "utf-8")).toBe("SECRET=1\n");
    fs.writeFileSync(path.join(wtOf(f), "a.txt"), "left behind\n");
    advanceDev(f, "b.txt", "new\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(git(wtOf(f), "show", "--name-only", "--format=", "HEAD")).toBe("a.txt");
  });

  it("leaves a clean worktree's history alone", async () => {
    const f = await minted();
    git(wtOf(f), "commit", "-q", "--allow-empty", "-m", "feature");
    advanceDev(f, "b.txt", "new\n");
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ carriedSha: null, carriedDropped: [] });
    expect(git(wtOf(f), "log", "-1", "--format=%s")).toBe("feature");
  });

  it("a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code", async () => {
    const f = await minted();
    const hooks = path.join(f.repo, "hooks");
    fs.mkdirSync(hooks);
    fs.writeFileSync(path.join(hooks, "pre-commit"), "#!/bin/sh\nexit 1\n");
    fs.chmodSync(path.join(hooks, "pre-commit"), 0o755);
    git(f.repo, "config", "core.hooksPath", hooks);
    fs.writeFileSync(path.join(wtOf(f), "a.txt"), "uncommitted\n");
    advanceDev(f, "b.txt", "new\n");
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(9);
    expect(r.json.rebaseConflict).toBe(false);
    expect(r.json.carriedSha).toBe(null);
    expect(r.err).toContain("could not commit what an earlier run left");
    expect(fs.existsSync(r.json.sentinel)).toBe(true);
  });

  it("does not mark a resumed worktree it did not create", async () => {
    const f = fixture();
    git(f.repo, "worktree", "add", "-q", wtOf(f), "-b", `feat/${FID}`);
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.json).toMatchObject({ mode: "resumed", owned: false });
  });
});

describe("bkit worktrees setup — debug adopts, never mints", () => {
  it("adopts the session branch in place when there is no worktree and no feat/{fid}", async () => {
    const f = fixture();
    git(f.repo, "switch", "-q", "-c", "fix/ci");
    const r = await setup(f.repo, "debug", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ worktreePath: f.repo, branch: "fix/ci", mode: "adopted" });
    expect(git(f.repo, "branch", "--list", `feat/${FID}`)).toBe("");
  });

  it("adds a worktree for an existing feat/{fid}, marks it, installs", async () => {
    const f = fixture();
    git(f.repo, "branch", `feat/${FID}`);
    const r = await setup(f.repo, "debug", "--worktrees");
    expect(r.json).toMatchObject({ mode: "created", owned: true, installed: true });
  });
});

describe("bkit worktrees setup — ship", () => {
  it("ships origin's feat/{fid} over the session branch when only the remote has it", async () => {
    const f = fixture();
    git(f.seed, "push", "-q", "origin", `HEAD:feat/${FID}`);
    git(f.repo, "switch", "-q", "-c", "claude/work");
    const r = await setup(f.repo, "ship", "--worktrees");
    expect(r.json).toMatchObject({ mode: "created", branch: `feat/${FID}` });
  });

  it("mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume", async () => {
    const f = fixture();
    const r = await setup(f.repo, "ship", "--worktrees");
    expect(r.json).toMatchObject({ mode: "created", branch: `feat/${FID}`, owned: true });
    const head = git(wtOf(f), "rev-parse", "HEAD");
    advanceDev(f, "b.txt", "new\n");
    const again = await setup(f.repo, "ship", "--worktrees");
    expect(again.json.mode).toBe("resumed");
    expect(git(wtOf(f), "rev-parse", "HEAD")).toBe(head);
  });
});

describe("bkit worktrees remove", () => {
  it("removes a worktree setup created, uncommitted changes and all, and clears the marker", async () => {
    const f = fixture();
    await setup(f.repo, "design", "--worktrees");
    fs.writeFileSync(path.join(wtOf(f), "dirty.txt"), "x\n");
    const r = await run(f.repo, ["remove", `--fid=${FID}`]);
    expect(r.json).toMatchObject({ removed: true, reason: null, repoRoot: f.repo });
    expect(fs.existsSync(wtOf(f))).toBe(false);
    expect(fs.existsSync(marker(f))).toBe(false);
    expect(git(f.repo, "worktree", "list")).not.toContain(".worktrees");
    expect(git(f.repo, "branch", "--list", `feat/${FID}`)).toContain(`feat/${FID}`);
  });
});
