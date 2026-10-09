/**
 * bkit-worktrees-parity.integration.test.ts — `bkit worktrees` and `bkit skills`
 * answer as the inline workflow blocks they replace, while both exist.
 *
 * Each block is extracted from the workflow and run as written, then the
 * command runs on a twin fixture and the outcomes are compared:
 *   - bkit-build.md Step 2 create / resume block   vs `bkit worktrees setup --workflow=build --worktrees`
 *   - bkit-ship.md Step 14 ownership fence           vs `bkit worktrees remove --owned-only`
 *   - bkit-ship.md Step 7 prune block                vs `bkit skills prune`
 * Where the command deliberately differs (copy list, ownership on resume, sentinel
 * on every workflow) the per-command tests cover it; these cases stay on the
 * ground both agree on. Retire this file when the workflows call the commands.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCommand, type CommandSpec } from "./commands/lib";
import { PACKAGE_RUNNER } from "./commands/shared/package-manager";
import { SKILLS_CLI, skillsCommand } from "./commands/workflow/skills";
import { ownershipMarker, worktreesCommand } from "./commands/workflow/worktrees";

const WORKFLOWS = path.resolve(__dirname, "../workflows");
const SCRIPTS = path.resolve(__dirname, "../templates/.bkit/scripts");
const FID = "42-thing";
const MONTH = "202610";
const dirs: string[] = [];
const savedPath = process.env.PATH;
let stub = "";

const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

/** Stubs on PATH: the package manager and the skills CLI log to $STUB_LOG; gh is unauthenticated. */
beforeEach(() => {
  stub = tmp("bkit-wt-parity-stub-");
  const write = (name: string, body: string) => {
    fs.writeFileSync(path.join(stub, name), `#!/bin/sh\n${body}\n`);
    fs.chmodSync(path.join(stub, name), 0o755);
  };
  write(PACKAGE_RUNNER, 'echo "$PWD $*" >> "$STUB_LOG"');
  write(SKILLS_CLI[0]!, 'echo "$*" >> "$STUB_LOG"; rm -rf ".agents/skills/$3"');
  write("gh", "exit 1");
  process.env.PATH = `${stub}${path.delimiter}${savedPath}`;
});
afterEach(() => {
  process.env.PATH = savedPath;
  delete process.env.STUB_LOG;
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

const readLog = (file: string) =>
  fs.existsSync(file) ? fs.readFileSync(file, "utf-8").trim().split("\n") : [];

/** The `n`th ```bash fence of the section headed `heading`, placeholders filled. */
function block(workflow: string, heading: RegExp, n: number): string {
  const lines = fs.readFileSync(path.join(WORKFLOWS, workflow), "utf-8").split("\n");
  const start = lines.findIndex((l) => heading.test(l));
  expect(start, `${heading} not found in ${workflow}`).toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((l, i) => i > start && /^---$/.test(l));
  const fences = [
    ...lines
      .slice(start, end)
      .join("\n")
      .matchAll(/```bash\n([\s\S]*?)```/g),
  ];
  expect(fences.length, `${heading} fence ${n}`).toBeGreaterThan(n);
  return fences[n]![1]!.replaceAll("{FID}", FID).replaceAll("{YYYYMM}", MONTH);
}

function shell(body: string, cwd: string, log: string) {
  return spawnSync("bash", ["-c", body], {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, BKIT_RUNTIME: "LOCAL", STUB_LOG: log },
  });
}

async function command(spec: CommandSpec, cwd: string, argv: string[], log: string) {
  process.env.STUB_LOG = log;
  const out: string[] = [];
  const code = await runCommand(argv, [spec], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
}

// ---------------------------------------------------------------------------
// Step 2 — Worktree Setup (build)
// ---------------------------------------------------------------------------

/** One origin, a seed that pushes to it, and twin clones: one for the shell, one for the command. */
function origin() {
  const base = tmp("bkit-wt-parity-");
  const bare = path.join(base, "origin.git");
  const seed = path.join(base, "seed");
  git(base, "init", "-q", "--bare", "-b", "dev", bare);
  git(base, "clone", "-q", bare, seed);
  fs.writeFileSync(path.join(seed, "a.txt"), "base\n");
  git(seed, "add", "a.txt");
  git(seed, "commit", "-q", "-m", "init");
  git(seed, "push", "-q", "origin", "HEAD:dev");
  const clone = (name: string) => {
    const repo = path.join(base, name);
    git(base, "clone", "-q", bare, repo);
    git(repo, "config", "user.email", "t@t");
    git(repo, "config", "user.name", "t");
    fs.writeFileSync(path.join(repo, ".env"), "SECRET=1\n");
    fs.mkdirSync(path.join(repo, ".bkit/scripts"), { recursive: true });
    for (const s of ["bkit-runtime.sh", "bkit-rebase-resolve.sh"]) {
      fs.copyFileSync(path.join(SCRIPTS, s), path.join(repo, ".bkit/scripts", s));
    }
    return repo;
  };
  const push = (ref: string, file: string) => {
    git(seed, "fetch", "-q", "origin");
    git(seed, "switch", "-q", "--detach", "origin/dev");
    fs.writeFileSync(path.join(seed, file), `${file}\n`);
    git(seed, "add", file);
    git(seed, "commit", "-q", "-m", file);
    git(seed, "push", "-q", "origin", `HEAD:refs/heads/${ref}`);
    return git(seed, "rev-parse", "HEAD");
  };
  return { base, sh: clone("sh"), cmd: clone("cmd"), push };
}

const wt = (repo: string) => path.join(repo, ".worktrees", FID);

/** What both sides must agree on after Step 2. */
function outcome(repo: string, log: string) {
  const w = wt(repo);
  return {
    exists: fs.existsSync(w),
    branch: git(w, "branch", "--show-current"),
    tree: git(w, "rev-parse", "HEAD^{tree}"),
    parentOfHead: git(w, "rev-parse", "HEAD~1"),
    upstream: git(w, "rev-parse", "--abbrev-ref", "@{upstream}"),
    env: fs.existsSync(path.join(w, ".env")),
    logDir: fs.existsSync(path.join(w, "docs/plans", MONTH, "logs", FID)),
    install: readLog(log).map((l) => l.replace(repo, "<repo>")),
  };
}

async function bothSetUp(o: ReturnType<typeof origin>) {
  const step2 = block("bkit-build.md", /^## .*Step 2 — Worktree Setup/, 1);
  const shLog = path.join(o.base, "sh.log");
  const cmdLog = path.join(o.base, "cmd.log");
  const res = shell(step2, o.sh, shLog);
  expect(res.status, res.stderr).toBe(0);
  const r = await command(
    worktreesCommand,
    o.cmd,
    ["worktrees", "setup", "--workflow=build", `--fid=${FID}`, `--month=${MONTH}`, "--worktrees"],
    cmdLog,
  );
  expect(r.code).toBe(0);
  return { sh: outcome(o.sh, shLog), cmd: outcome(o.cmd, cmdLog) };
}

describe("build Step 2 vs bkit worktrees setup", () => {
  it("fresh: both cut feat/{fid} off origin/dev, copy .env, install in the worktree", async () => {
    const o = origin();
    const { sh, cmd } = await bothSetUp(o);
    expect(cmd).toEqual(sh);
    expect(sh).toMatchObject({ exists: true, branch: `feat/${FID}`, env: true, logDir: true });
    expect(sh.install).toEqual([`<repo>/.worktrees/${FID} install --frozen-lockfile`]);
  });

  it("existing local feat/{fid}: both check it out unchanged", async () => {
    const o = origin();
    for (const repo of [o.sh, o.cmd]) {
      git(repo, "branch", `feat/${FID}`);
    }
    const { sh, cmd } = await bothSetUp(o);
    expect(cmd).toEqual(sh);
  });

  it("feat/{fid} only on origin: both track it", async () => {
    const o = origin();
    o.push(`feat/${FID}`, "feature.txt");
    const { sh, cmd } = await bothSetUp(o);
    expect(cmd).toEqual(sh);
    expect(sh.upstream).toBe(`origin/feat/${FID}`);
  });

  it("resume: both rebase the existing worktree onto the new origin/dev", async () => {
    const o = origin();
    for (const repo of [o.sh, o.cmd]) {
      git(repo, "worktree", "add", "-q", wt(repo), "-b", `feat/${FID}`, "origin/dev");
      fs.writeFileSync(path.join(wt(repo), "feature.txt"), "x\n");
      git(wt(repo), "add", "feature.txt");
      git(wt(repo), "commit", "-q", "-m", "feature");
    }
    const tip = o.push("dev", "b.txt");
    const { sh, cmd } = await bothSetUp(o);
    expect(cmd).toEqual(sh);
    expect(sh.parentOfHead).toBe(tip);
  });
});

// ---------------------------------------------------------------------------
// Ship Step 14 — Worktree Cleanup ownership fence
// ---------------------------------------------------------------------------

describe("ship Step 14 fence vs bkit worktrees remove --owned-only", () => {
  function repoWithWorktree(owned: boolean) {
    const repo = tmp("bkit-wt-parity-rm-");
    git(repo, "init", "-q", "-b", "dev");
    git(repo, "commit", "-q", "--allow-empty", "-m", "init");
    git(repo, "worktree", "add", "-q", wt(repo), "-b", `feat/${FID}`);
    if (owned) {
      const marker = ownershipMarker(repo, FID);
      fs.mkdirSync(path.dirname(marker), { recursive: true });
      fs.writeFileSync(marker, "");
    }
    return repo;
  }

  it.each([true, false])("owned=%s: both leave the same worktree state", async (owned) => {
    const fence = block("bkit-ship.md", /^## .*Step 14 — Worktree Cleanup/, 0).replaceAll(
      "{BOOK_ROOT}",
      "",
    );
    const shRepo = repoWithWorktree(owned);
    const cmdRepo = repoWithWorktree(owned);
    expect(shell(fence, shRepo, "/dev/null").status).toBe(0);
    const r = await command(
      worktreesCommand,
      cmdRepo,
      ["worktrees", "remove", `--fid=${FID}`, "--owned-only"],
      "/dev/null",
    );
    expect(r.code).toBe(0);
    expect(fs.existsSync(wt(cmdRepo))).toBe(fs.existsSync(wt(shRepo)));
    expect(fs.existsSync(wt(shRepo))).toBe(!owned);
  });
});

// ---------------------------------------------------------------------------
// Ship Step 7 — Prune Skills
// ---------------------------------------------------------------------------

describe("ship Step 7 prune vs bkit skills prune", () => {
  function checkout() {
    const cwd = tmp("bkit-wt-parity-skills-");
    for (const s of ["bkit-build", "find-skills", "react-forms", "forms"]) {
      fs.mkdirSync(path.join(cwd, ".agents/skills", s), { recursive: true });
    }
    fs.writeFileSync(
      path.join(cwd, "skills-lock.json"),
      JSON.stringify({ skills: { "find-skills": {}, "lock-only": {}, "react-forms": {} } }),
    );
    fs.writeFileSync(
      path.join(cwd, ".agents/skills.md"),
      "# Skills\n\nfind-skills\n`react-forms-v2`\n",
    );
    return cwd;
  }

  it("both uninstall the same skills from the folder + lock union", async () => {
    const prune = block("bkit-ship.md", /^## .*Step 7 — Prune Skills/, 0);
    const shDir = checkout();
    const cmdDir = checkout();
    const shLog = path.join(shDir, "calls.log");
    const cmdLog = path.join(cmdDir, "calls.log");
    expect(shell(prune, shDir, shLog).status).toBe(0);
    const r = await command(skillsCommand, cmdDir, ["skills", "prune"], cmdLog);
    expect(r.code).toBe(0);
    expect(readLog(cmdLog)).toEqual(readLog(shLog));
    expect(readLog(shLog)).toEqual([
      "skills remove forms -y",
      "skills remove lock-only -y",
      "skills remove react-forms -y",
    ]);
  });
});
