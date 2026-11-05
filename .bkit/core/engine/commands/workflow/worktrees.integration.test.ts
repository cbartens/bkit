// worktrees.integration.test.ts — `bkit worktrees` against a real bare `origin`:
// fetch, worktree add, rebase and removal, with the package manager stubbed on
// PATH. Integration-tier because every case does real git work over a remote.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { gatePackage, useGateRunner } from "../../../../../vitest.gate-fixture";

import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import { branchesCommand } from "./branches";
import { workflowsCommand } from "./workflows";
import { ownershipMarker, worktreesCommand } from "./worktrees";

/**
 * Filesystem refusals on demand: `symlink` refuses every symlink (Windows without
 * Developer Mode), `bkitEnvCopy` fails a copy onto `.bkit/.env`. Off, both pass through.
 */
const fsFaults = vi.hoisted(() => ({ symlink: false, bkitEnvCopy: false }));
vi.mock("node:fs", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:fs")>();
  const refused = (what: string) =>
    Object.assign(new Error(`EPERM: operation not permitted, ${what}`), { code: "EPERM" });
  const symlinkSync = (...args: Parameters<typeof real.symlinkSync>) => {
    if (fsFaults.symlink) throw refused("symlink");
    return real.symlinkSync(...args);
  };
  const cpSync = (...args: Parameters<typeof real.cpSync>) => {
    if (fsFaults.bkitEnvCopy && String(args[1]).endsWith("/.bkit/.env")) throw refused("copyfile");
    return real.cpSync(...args);
  };
  return { ...real, default: { ...real, symlinkSync, cpSync }, symlinkSync, cpSync };
});

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
  fsFaults.symlink = false;
  fsFaults.bkitEnvCopy = false;
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
  fs.writeFileSync(path.join(t.seed, "package.json"), '{"private":true}\n');
  git(t.seed, "add", "a.txt", "package.json");
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

describe("ship feature reconciliation wiring", () => {
  useGateRunner();
  it("reconciles cloud and laptop feature commits through the command boundary", async () => {
    const f = fixture();
    fs.rmSync(path.join(f.repo, ".env"));
    git(f.repo, "switch", "-q", "-c", `feat/${FID}`);
    fs.writeFileSync(path.join(f.repo, "feature.txt"), "shared\n");
    git(f.repo, "add", "feature.txt");
    git(f.repo, "commit", "-qm", "feat: shared work");
    expect(g(f.repo, "push", "-q", "origin", `HEAD:feat/${FID}`).status).toBe(0);
    git(f.seed, "fetch", "-q", "origin", `feat/${FID}`);
    git(f.seed, "switch", "-q", "-c", `feat/${FID}`, "FETCH_HEAD");
    fs.writeFileSync(path.join(f.seed, "cloud.txt"), "cloud contribution\n");
    git(f.seed, "add", "cloud.txt");
    git(f.seed, "commit", "-qm", "feat: cloud contribution");
    const remoteTip = git(f.seed, "rev-parse", "HEAD");
    expect(g(f.seed, "push", "-q", "origin", `HEAD:feat/${FID}`).status).toBe(0);
    fs.writeFileSync(path.join(f.repo, "laptop.txt"), "laptop contribution\n");
    git(f.repo, "add", "laptop.txt");
    git(f.repo, "commit", "-qm", "feat: laptop contribution");
    const localTip = git(f.repo, "rev-parse", "HEAD");
    const configured = await setup(f.repo, "ship", `--branch=feat/${FID}`);
    expect(configured.code, configured.err).toBe(0);
    const errors: string[] = [];
    const output: string[] = [];
    const dispatch = (args: string[]) =>
      runCommand(["branches", ...args, "--json"], [branchesCommand], {
        classicVerbs: new Set(),
        cwd: configured.json.worktreePath,
        io: { stdout: (text) => output.push(text), stderr: (text) => errors.push(text) },
      });
    expect(await dispatch(["sync", "--reconcile-feature", `--fid=${FID}`]), errors.join("")).toBe(
      0,
    );
    expect(await dispatch(["push", "--mode=plain"]), errors.join("")).toBe(0);
    const published = git(f.origin, "rev-parse", `refs/heads/feat/${FID}`);
    expect(g(f.origin, "merge-base", "--is-ancestor", localTip, published).status).toBe(0);
    expect(g(f.origin, "merge-base", "--is-ancestor", remoteTip, published).status).toBe(0);
    expect(git(f.origin, "show", `${published}:cloud.txt`)).toBe("cloud contribution");
    expect(git(f.origin, "show", `${published}:laptop.txt`)).toBe("laptop contribution");
    expect(git(f.origin, "log", "-1", "--format=%s", published)).not.toContain("[skip ci]");
    expect(output.join("")).toContain(published);
  }, 60_000);

  async function closeWithRemoteChange(when: "before" | "after-proof" | "recreated") {
    const f = fixture();
    const configured = await setup(f.repo, "build", "--worktrees");
    expect(configured.code, configured.err).toBe(0);
    const wt = configured.json.worktreePath as string;
    fs.writeFileSync(path.join(wt, "feature.txt"), "landed feature\n");
    fs.writeFileSync(path.join(wt, "package.json"), JSON.stringify(gatePackage));
    git(wt, "add", "feature.txt", "package.json");
    git(wt, "commit", "-qm", "feat: landed feature");
    const original = git(wt, "rev-parse", "HEAD");
    expect(g(wt, "push", "-q", "origin", `HEAD:feat/${FID}`).status).toBe(0);
    git(f.seed, "fetch", "-q", "origin", `feat/${FID}`);
    git(f.seed, "merge", "-q", "--squash", "FETCH_HEAD");
    git(f.seed, "commit", "-qm", "feat: squash feature");
    expect(g(f.seed, "push", "-q", "origin", "HEAD:dev").status).toBe(0);
    const squash = git(f.seed, "rev-parse", "HEAD");
    git(f.seed, "switch", "-q", "-c", "remote-candidate", original);
    fs.writeFileSync(path.join(f.seed, "remote-fix.txt"), "new remote work\n");
    git(f.seed, "add", "remote-fix.txt");
    git(f.seed, "commit", "-qm", "fix: newer remote contribution");
    const remoteTip = git(f.seed, "rev-parse", "HEAD");
    expect(g(f.seed, "push", "-q", "origin", "HEAD:remote-candidate").status).toBe(0);
    if (when === "before") {
      git(f.seed, "push", "-q", "origin", `HEAD:feat/${FID}`);
    }
    expect(git(f.origin, "rev-parse", `refs/heads/feat/${FID}`)).toBe(
      when === "before" ? remoteTip : original,
    );
    const log = path.join(wt, "docs/plans", MONTH, "logs", FID);
    fs.mkdirSync(log, { recursive: true });
    const status = path.join(log, "status.jsonl");
    fs.writeFileSync(
      status,
      JSON.stringify({ type: "workflow-started", workflow: "ship", at: "2020-01-01T00:00:00Z" }) +
        "\n",
    );
    const bin = path.join(f.repo, "race-bin");
    fs.mkdirSync(bin);
    const realGit = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(
      path.resolve(__dirname, "../../../../../tests/fixtures/gh/bin/gh"),
      path.join(bin, "git"),
    );
    const raced = path.join(bin, "raced");
    const body = path.join(bin, "git-body.sh");
    const replace =
      when === "recreated"
        ? `'${realGit}' -C '${f.origin}' update-ref -d 'refs/heads/feat/${FID}' '${original}'; '${realGit}' -C '${f.origin}' update-ref 'refs/heads/feat/${FID}' '${remoteTip}'`
        : `'${realGit}' -C '${f.origin}' update-ref 'refs/heads/feat/${FID}' '${remoteTip}' '${original}'`;
    fs.writeFileSync(
      body,
      [
        `case "$*" in`,
        `  *"update-ref -d refs/heads/feat/${FID}"*|*"branch -D feat/${FID}"*)`,
        `    if [ ! -f '${raced}' ]; then ${replace}; : > '${raced}'; fi ;;`,
        `esac`,
        `exec '${realGit}' "$@"`,
      ].join("\n"),
    );
    const saved = { path: process.env.PATH, body: process.env.BKIT_FAKE_TOOL_SCRIPT };
    if (when !== "before") {
      process.env.PATH = [bin, saved.path].join(path.delimiter);
      process.env.BKIT_FAKE_TOOL_SCRIPT = body;
    }
    const out: string[] = [];
    const err: string[] = [];
    try {
      const code = await runCommand(
        [
          "workflows",
          "close",
          "--workflow=ship",
          `--fid=${FID}`,
          `--month=${MONTH}`,
          `--file=${status}`,
          "--pr-number=42",
          `--squash-sha=${squash}`,
          `--outbox=${path.join(f.repo, ".git", "bkit-outbox", FID)}`,
          "--flush",
          `--branch=feat/${FID}`,
          "--json",
        ],
        [workflowsCommand],
        {
          classicVerbs: new Set(),
          cwd: wt,
          io: { stdout: (text) => out.push(text), stderr: (text) => err.push(text) },
        },
      );
      expect(code, err.join("")).toBe(0);
      const result = JSON.parse(out.join("")) as { worktree: { remoteDeleted: boolean } };
      expect(result.worktree.remoteDeleted).toBe(false);
      expect(git(f.origin, "rev-parse", `refs/heads/feat/${FID}`)).toBe(remoteTip);
      expect(git(f.origin, "show", `feat/${FID}:remote-fix.txt`)).toBe("new remote work");
      expect(git(f.origin, "show", `dev:docs/plans/${MONTH}/logs/${FID}/status.jsonl`)).toContain(
        '"workflow-done"',
      );
      expect(err.join("")).toMatch(/remote|origin/);
      return fs.existsSync(raced);
    } finally {
      if (saved.path === undefined) delete process.env.PATH;
      else process.env.PATH = saved.path;
      if (saved.body === undefined) delete process.env.BKIT_FAKE_TOOL_SCRIPT;
      else process.env.BKIT_FAKE_TOOL_SCRIPT = saved.body;
    }
  }

  it("keeps a newer remote feature tip while closing the landed local tip", async () => {
    await closeWithRemoteChange("before");
    expect(await closeWithRemoteChange("after-proof")).toBe(true);
    expect(await closeWithRemoteChange("recreated")).toBe(true);
  }, 60_000);
});

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

  it("cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead", async () => {
    const f = fixture();
    fs.writeFileSync(path.join(f.repo, "held.txt"), "unpushed\n");
    git(f.repo, "add", "held.txt");
    git(f.repo, "commit", "-q", "-m", "held on local dev");
    const tip = git(f.repo, "rev-parse", "origin/dev");

    const r = await setup(f.repo, "plan", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "created", baseRef: "origin/dev", baseSha: tip });
    expect(git(wtOf(f), "rev-parse", "HEAD")).toBe(tip);
    expect(fs.existsSync(path.join(wtOf(f), "held.txt"))).toBe(false);
    expect(r.err).toContain("basing this plan branch on origin/dev");
  });

  it("cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so", async () => {
    const f = fixture();
    fs.writeFileSync(path.join(f.repo, "held.txt"), "unpushed\n");
    git(f.repo, "add", "held.txt");
    git(f.repo, "commit", "-q", "-m", "held on local dev");
    const local = git(f.repo, "rev-parse", "dev");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "created", baseRef: "dev", baseSha: local });
    expect(git(wtOf(f), "rev-parse", "HEAD")).toBe(local);
    expect(fs.existsSync(path.join(wtOf(f), "held.txt"))).toBe(true);
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

  it("links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in", async () => {
    const f = fixture();
    fs.mkdirSync(path.join(f.repo, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, ".bkit/.env"), "BKIT_GH_TOKEN=tok\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ bkitEnv: "linked" });
    const env = path.join(wtOf(f), ".bkit/.env");
    expect(fs.lstatSync(env).isSymbolicLink()).toBe(true);
    expect(fs.readlinkSync(env)).toBe(path.join(f.repo, ".bkit/.env"));
    expect(fs.readFileSync(env, "utf-8")).toBe("BKIT_GH_TOKEN=tok\n");
  });

  it("creates no .bkit/.env and reports none when the main checkout has none", async () => {
    const f = fixture();

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ bkitEnv: "none" });
    expect(fs.existsSync(path.join(wtOf(f), ".bkit/.env"))).toBe(false);
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
    const before = git(wtOf(f), "rev-parse", "HEAD");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "resumed", sentinel: null, rebaseConflict: false });
    expect(git(wtOf(f), "rev-parse", "HEAD~1")).toBe(tip);
    // The rewrite is on the record: one engine-action row from the old tip to the new.
    const rebases = fs
      .readFileSync(path.join(logDir, "status.jsonl"), "utf-8")
      .split("\n")
      .filter((l) => l.includes('"type":"engine-action"'))
      .map((l) => JSON.parse(l) as { action: string; key: string; ref: string });
    expect(rebases).toMatchObject([
      { action: "rebase", key: `rebase/${before}`, ref: git(wtOf(f), "rev-parse", "HEAD") },
    ]);
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

  it("refuses a resumed design / plan worktree whose branch carries unpushed dev work", async () => {
    const f = await minted("plan");
    fs.writeFileSync(path.join(f.repo, "held.txt"), "unpushed\n");
    git(f.repo, "add", "held.txt");
    git(f.repo, "commit", "-q", "-m", "held on local dev");
    const tip = git(f.repo, "rev-parse", "--short", "dev");
    git(wtOf(f), "rebase", "-q", "dev");

    const r = await setup(f.repo, "plan", "--worktrees");
    expect(r.code).toBe(7);
    expect(r.err).toContain("1 commit(s) of unpushed dev");
    expect(r.err).toContain(`tip ${tip}`);
    expect(r.err).toContain("this branch cannot land");
    expect(r.err).toContain("git push origin dev");

    // The same worktree resumes for build, whose PR carries dev's work by design.
    const build = await setup(f.repo, "build", "--worktrees");
    expect(build.code).toBe(0);
    expect(build.json).toMatchObject({ mode: "resumed" });
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
      // Only the .env setup copied in and the rebase's engine-action row stay out of the commit.
      expect(git(wtOf(f), "status", "--porcelain")).toBe(`M ${rel}/status.jsonl\n?? .env`);
      expect(fs.readFileSync(path.join(logDir, "status.jsonl"), "utf-8")).toContain(
        '"action":"rebase"',
      );
      expect(fs.readFileSync(path.join(logDir, "ship-summary.md"), "utf-8")).toBe("landed copy\n");
      expect(fs.readFileSync(path.join(wtOf(f), "a.txt"), "utf-8")).toBe("ship doc edit\n");
    },
  );

  it("keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one", async () => {
    const f = await minted();
    const rel = `docs/plans/${MONTH}/logs/${FID}`;
    const logDir = path.join(wtOf(f), rel);
    fs.writeFileSync(path.join(logDir, "ship-summary.md"), "worktree copy\n");
    fs.writeFileSync(path.join(logDir, "same.md"), "same\n");
    fs.mkdirSync(path.join(f.seed, rel), { recursive: true });
    fs.writeFileSync(path.join(f.seed, rel, "same.md"), "same\n");
    git(f.seed, "add", `${rel}/same.md`);
    advanceDev(f, `${rel}/ship-summary.md`, "landed copy\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json.carriedDropped).toEqual([`${rel}/same.md`, `${rel}/ship-summary.md`]);
    expect(fs.readFileSync(path.join(logDir, "ship-summary.md"), "utf-8")).toBe("landed copy\n");
    const kept = /moved .*ship-summary\.md.* to (\S+ship-summary\.md)/.exec(r.err)?.[1];
    expect(kept).toBeDefined();
    expect(kept!.startsWith(path.join(f.repo, ".git", "bkit-outbox", FID))).toBe(true);
    expect(fs.readFileSync(kept!, "utf-8")).toBe("worktree copy\n");
    expect(r.err).not.toMatch(/moved .*same\.md/);
  });

  it("resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it", async () => {
    const f = fixture();
    fs.writeFileSync(path.join(f.seed, ".env"), "SECRET=placeholder\n");
    git(f.seed, "add", ".env");
    git(f.seed, "commit", "-q", "-m", "env placeholder");
    git(f.seed, "push", "-q", "origin", "HEAD:dev");
    fs.rmSync(path.join(f.repo, ".env"));
    git(f.repo, "pull", "-q", "origin", "dev");
    fs.writeFileSync(path.join(f.repo, ".env"), "SECRET=1\n");
    expect((await setup(f.repo, "build", "--worktrees")).code).toBe(0);
    expect(git(wtOf(f), "status", "--porcelain")).toBe("M .env");
    fs.writeFileSync(path.join(wtOf(f), "a.txt"), "left behind\n");
    const tip = advanceDev(f, "b.txt", "new\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "resumed", sentinel: null });
    expect(git(wtOf(f), "rev-parse", "HEAD~1")).toBe(tip);
    expect(git(wtOf(f), "log", "--format=", "--name-only", `${tip}..HEAD`)).toBe("a.txt");
    expect(fs.readFileSync(path.join(wtOf(f), ".env"), "utf-8")).toBe("SECRET=1\n");
  });

  it("commits leftovers when a copy entry points outside the checkout", async () => {
    const f = await minted();
    fs.writeFileSync(
      path.join(f.repo, "package.json"),
      JSON.stringify({ bkit: { workflows: { worktree: { copy: ["../shared/.env", ".env"] } } } }),
    );
    fs.writeFileSync(path.join(wtOf(f), "a.txt"), "left behind\n");
    advanceDev(f, "b.txt", "new\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json.carriedSha).not.toBeNull();
    expect(git(wtOf(f), "show", "--name-only", "--format=", "HEAD")).toBe("a.txt");
  });

  it("never commits the entries setup copies in from the main checkout", async () => {
    const f = await minted();
    expect(fs.readFileSync(path.join(wtOf(f), ".env"), "utf-8")).toBe("SECRET=1\n");
    fs.writeFileSync(path.join(wtOf(f), "a.txt"), "left behind\n");
    advanceDev(f, "b.txt", "new\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(git(wtOf(f), "show", "--name-only", "--format=", "HEAD")).toBe("a.txt");
  });

  it("never commits bkit's own .bkit/.env, even where .gitignore lost its line", async () => {
    const f = fixture();
    fs.mkdirSync(path.join(f.repo, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, ".bkit/.env"), "BKIT_GH_TOKEN=tok\n");
    expect((await setup(f.repo, "build", "--worktrees")).code).toBe(0);
    fs.writeFileSync(path.join(wtOf(f), "a.txt"), "left behind\n");
    advanceDev(f, "b.txt", "new\n");

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(git(wtOf(f), "show", "--name-only", "--format=", "HEAD")).toBe("a.txt");
    expect(git(wtOf(f), "ls-files", ".bkit")).toBe("");
    expect(fs.lstatSync(path.join(wtOf(f), ".bkit/.env")).isSymbolicLink()).toBe(true);
  });

  it("re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself", async () => {
    const f = fixture();
    fs.mkdirSync(path.join(f.repo, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, ".bkit/.env"), "BKIT_GH_TOKEN=tok\n");
    expect((await setup(f.repo, "build", "--worktrees")).code).toBe(0);
    fs.rmSync(path.join(wtOf(f), ".bkit/.env"));

    const again = await setup(f.repo, "build", "--worktrees");
    expect(again.code).toBe(0);
    expect(again.json).toMatchObject({ mode: "resumed", bkitEnv: "linked" });
    expect(fs.readFileSync(path.join(wtOf(f), ".bkit/.env"), "utf-8")).toBe("BKIT_GH_TOKEN=tok\n");
  });

  it("leaves a worktree .bkit/.env that differs from the main checkout's, and says so", async () => {
    const f = fixture();
    fs.writeFileSync(path.join(f.seed, ".gitignore"), ".bkit/.env\n");
    git(f.seed, "add", ".gitignore");
    git(f.seed, "commit", "-q", "-m", "gitignore");
    git(f.seed, "push", "-q", "origin", "HEAD:dev");
    git(f.repo, "pull", "-q", "origin", "dev");
    fs.mkdirSync(path.join(f.repo, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, ".bkit/.env"), "BKIT_GH_TOKEN=tok\n");
    expect((await setup(f.repo, "build", "--worktrees")).code).toBe(0);
    fs.rmSync(path.join(wtOf(f), ".bkit/.env"));
    fs.writeFileSync(path.join(wtOf(f), ".bkit/.env"), "BKIT_GH_TOKEN=hand\n");

    const again = await setup(f.repo, "build", "--worktrees");
    expect(again.code).toBe(0);
    expect(again.json).toMatchObject({ mode: "resumed", bkitEnv: "differs" });
    expect(again.err).toContain("differs from the main checkout's");
    expect(fs.readFileSync(path.join(wtOf(f), ".bkit/.env"), "utf-8")).toBe("BKIT_GH_TOKEN=hand\n");
  });

  it("refreshes a bkit-made .bkit/.env copy after the main checkout's token changes", async () => {
    const f = fixture();
    fs.mkdirSync(path.join(f.repo, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, ".bkit/.env"), "BKIT_GH_TOKEN=old\n");
    fsFaults.symlink = true;
    const first = await setup(f.repo, "build", "--worktrees");
    expect(first.json).toMatchObject({ bkitEnv: "copied" });
    expect(fs.lstatSync(path.join(wtOf(f), ".bkit/.env")).isFile()).toBe(true);
    fs.writeFileSync(path.join(f.repo, ".bkit/.env"), "BKIT_GH_TOKEN=new\n");

    const again = await setup(f.repo, "build", "--worktrees");
    expect(again.code).toBe(0);
    expect(again.json).toMatchObject({ mode: "resumed", bkitEnv: "copied" });
    expect(fs.readFileSync(path.join(wtOf(f), ".bkit/.env"), "utf-8")).toBe("BKIT_GH_TOKEN=new\n");

    // A hand edit to the copy is still left for a human to read.
    fs.writeFileSync(path.join(wtOf(f), ".bkit/.env"), "BKIT_GH_TOKEN=hand\n");
    const edited = await setup(f.repo, "build", "--worktrees");
    expect(edited.json).toMatchObject({ bkitEnv: "differs" });
    expect(fs.readFileSync(path.join(wtOf(f), ".bkit/.env"), "utf-8")).toBe("BKIT_GH_TOKEN=hand\n");
  });

  it("reports a .bkit/.env it could neither link nor copy, instead of throwing", async () => {
    const f = fixture();
    fs.mkdirSync(path.join(f.repo, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, ".bkit/.env"), "BKIT_GH_TOKEN=tok\n");
    fsFaults.symlink = true;
    fsFaults.bkitEnvCopy = true;

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ mode: "created", bkitEnv: "failed" });
    expect(r.err).toContain("could not link or copy");
    expect(fs.existsSync(path.join(wtOf(f), ".bkit/.env"))).toBe(false);
  });

  it("leaves a clean worktree's history alone", async () => {
    const f = await minted();
    git(wtOf(f), "commit", "-q", "--allow-empty", "-m", "feature");
    advanceDev(f, "b.txt", "new\n");
    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ carriedSha: null, carriedDropped: [] });
    expect(git(wtOf(f), "log", "-1", "--format=%s")).toBe("feature");
    // The untracked .env setup copied in is not left-over work.
    expect(r.err).not.toContain("could not commit");
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

  /**
   * A resumed worktree whose committed `status.jsonl` a pre-commit hook appends a `type`
   * row to (after the commit snapshotted), with a leftover for the carry commit and dev moved.
   */
  async function hookDirtiedResume(type: string) {
    const f = await minted();
    const status = path.join(wtOf(f), "docs/plans", MONTH, "logs", FID, "status.jsonl");
    const started = { type: "workflow-started", workflow: "build", at: "2026-10-29T10:00:00Z" };
    fs.writeFileSync(status, `${JSON.stringify(started)}\n`);
    git(wtOf(f), "add", status);
    git(wtOf(f), "commit", "-q", "-m", "record");
    const row = {
      type,
      workflow: "build",
      at: "2026-10-29T10:05:00Z",
      noun: "disk",
      verb: "prune",
    };
    const hooks = path.join(f.repo, "hooks");
    fs.mkdirSync(hooks);
    fs.writeFileSync(
      path.join(hooks, "pre-commit"),
      `#!/bin/sh\nprintf '%s\\n' '${JSON.stringify(row)}' >> "${status}"\n`,
    );
    fs.chmodSync(path.join(hooks, "pre-commit"), 0o755);
    git(f.repo, "config", "core.hooksPath", hooks);
    fs.writeFileSync(path.join(wtOf(f), "left.txt"), "uncommitted\n");
    const tip = advanceDev(f, "b.txt", "new\n");
    return { f, status, row, tip, r: await setup(f.repo, "build", "--worktrees") };
  }

  it("rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back", async () => {
    const { f, status, row, tip, r } = await hookDirtiedResume("engine-call");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ sentinel: null, rebaseConflict: false });
    expect(r.json.carriedSha).not.toBeNull();
    expect(g(wtOf(f), "merge-base", "--is-ancestor", tip, "HEAD").status).toBe(0);
    const lines = fs.readFileSync(status, "utf-8").trim().split("\n");
    // The rebase's own `engine-action` row follows the row put back.
    expect(lines.slice(-2).map((l) => JSON.parse(l))).toMatchObject([
      row,
      { type: "engine-action", action: "rebase" },
    ]);
    expect(git(wtOf(f), "status", "--porcelain", "--", status)).not.toBe("");
  });

  it("still refuses a status file the carry commit's hook dirtied with any other row: exit 9", async () => {
    const { r } = await hookDirtiedResume("step-done");
    expect(r.code).toBe(9);
    expect(r.json.carriedSha).not.toBeNull();
    expect(fs.existsSync(r.json.sentinel)).toBe(true);
  });

  /**
   * A resumed worktree whose committed `.bkit/friction.jsonl` a pre-commit hook appends a
   * `kind` row to (a hook-launched command's unexpected exit), with a leftover and dev moved.
   */
  async function hookDirtiedFriction(kind: string) {
    const f = await minted();
    const friction = path.join(wtOf(f), ".bkit", "friction.jsonl");
    fs.mkdirSync(path.dirname(friction), { recursive: true });
    fs.writeFileSync(friction, `${JSON.stringify({ kind: "friction", key: "earlier" })}\n`);
    git(wtOf(f), "add", friction);
    git(wtOf(f), "commit", "-q", "-m", "record");
    const row = { kind, key: "disk-prune/disk-prune", category: "tool-failure" };
    const hooks = path.join(f.repo, "hooks");
    fs.mkdirSync(hooks);
    fs.writeFileSync(
      path.join(hooks, "pre-commit"),
      `#!/bin/sh\nprintf '%s\\n' '${JSON.stringify(row)}' >> "${friction}"\n`,
    );
    fs.chmodSync(path.join(hooks, "pre-commit"), 0o755);
    git(f.repo, "config", "core.hooksPath", hooks);
    fs.writeFileSync(path.join(wtOf(f), "left.txt"), "uncommitted\n");
    const tip = advanceDev(f, "b.txt", "new\n");
    return { f, friction, row, tip, r: await setup(f.repo, "build", "--worktrees") };
  }

  it("rebases past friction rows the carry commit's hook appended, and puts them back", async () => {
    const { f, friction, row, tip, r } = await hookDirtiedFriction("friction");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ sentinel: null, rebaseConflict: false });
    expect(g(wtOf(f), "merge-base", "--is-ancestor", tip, "HEAD").status).toBe(0);
    const lines = fs.readFileSync(friction, "utf-8").trim().split("\n");
    expect(JSON.parse(lines.at(-1)!)).toEqual(row);
  });

  it("puts friction rows back after a rebase onto a dev that appended to the same file", async () => {
    const f = fixture();
    const earlier = JSON.stringify({ kind: "friction", key: "earlier" });
    fs.mkdirSync(path.join(f.seed, ".bkit"), { recursive: true });
    advanceDev(f, ".bkit/friction.jsonl", `${earlier}\n`);
    expect((await setup(f.repo, "build", "--worktrees")).code).toBe(0);
    const friction = path.join(wtOf(f), ".bkit", "friction.jsonl");
    const row = JSON.stringify({ kind: "friction", key: "disk-prune/disk-prune" });
    const hooks = path.join(f.repo, "hooks");
    fs.mkdirSync(hooks);
    fs.writeFileSync(
      path.join(hooks, "pre-commit"),
      `#!/bin/sh\nprintf '%s\\n' '${row}' >> "${friction}"\n`,
    );
    fs.chmodSync(path.join(hooks, "pre-commit"), 0o755);
    git(f.repo, "config", "core.hooksPath", hooks);
    fs.writeFileSync(path.join(wtOf(f), "left.txt"), "uncommitted\n");
    const onDev = JSON.stringify({ kind: "friction", key: "on-dev" });
    const tip = advanceDev(f, ".bkit/friction.jsonl", `${earlier}\n${onDev}\n`);

    const r = await setup(f.repo, "build", "--worktrees");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ sentinel: null, rebaseConflict: false });
    expect(g(wtOf(f), "merge-base", "--is-ancestor", tip, "HEAD").status).toBe(0);
    expect(fs.readFileSync(friction, "utf-8")).toBe(`${earlier}\n${onDev}\n${row}\n`);
    expect(git(wtOf(f), "stash", "list")).toBe("");
  });

  it("still refuses a friction file the carry commit's hook dirtied with another kind: exit 9", async () => {
    const { r } = await hookDirtiedFriction("failure");
    expect(r.code).toBe(9);
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
