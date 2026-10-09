// Executes the local (RUNTIME_DEVPUSHES=true) close path of bkit-design.md and
// bkit-plan.md against a real repo, remote and worktree. The block is
// extracted from the workflow and run as written — the test does not keep a
// second copy of the squash / commit / cleanup logic. The `bkit` commands the
// block calls (dev lock, roadmap fold, ledgers commit, dev push, worktree
// removal) run from the repo's built dist/, linked into the fixture at the
// path the block resolves.

import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const FID = "999-close-squash";
const MONTH = "202610";
const BKIT_BIN = path.resolve("dist/bkit-install.js");

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function git(cwd: string, ...args: string[]): string {
  const res = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf-8" });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${res.stderr}`);
  }
  return res.stdout.trim();
}

function write(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function localCloseBlock(workflow: "design" | "plan"): string {
  const md = fs.readFileSync(path.resolve(`.bkit/workflows/bkit-${workflow}.md`), "utf-8");
  const fence = [...md.matchAll(/```bash\n([\s\S]*?)```/g)]
    .map((m) => m[1])
    .find((body) => body.includes('git merge --squash -X ours "feat/{FID}"'));
  expect(fence, `${workflow} close squash fence not found`).toBeTruthy();
  // The `if` that tests the runtime's runtimeDevPushes, up to its `else`.
  const open = /^ {3}if \[ .*runtimeDevPushes.*= "true" \]; then\n/m.exec(fence!);
  expect(open, "local close branch not found").toBeTruthy();
  const start = open!.index + open![0].length;
  const end = fence!.indexOf("\n   else\n", start);
  expect(end, "local close branch end not found").toBeGreaterThan(start);
  return fence!.slice(start, end).replaceAll("{FID}", FID).replaceAll("{YYYYMM}", MONTH);
}

interface Fixture {
  repo: string;
  docPath: string;
  devBefore: string;
}

// A main checkout on dev, a remote, and feat/{FID} checked out in
// .worktrees/{FID} carrying this run's design or plan doc.
function initFixture(workflow: "design" | "plan", opts: { docOnDev?: string } = {}): Fixture {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-close-squash-"));
  temps.push(tmp);
  const remote = path.join(tmp, "remote.git");
  const repo = path.join(tmp, "repo");
  execFileSync("git", ["init", "-q", "--bare", "-b", "dev", remote]);
  execFileSync("git", ["init", "-q", "-b", "dev", repo]);
  git(repo, "config", "user.email", "t@t.t");
  git(repo, "config", "user.name", "t");
  git(repo, "remote", "add", "origin", remote);
  fs.mkdirSync(path.join(repo, "node_modules/.bin"), { recursive: true });
  fs.symlinkSync(BKIT_BIN, path.join(repo, "node_modules/.bin/bkit"));
  write(
    path.join(repo, ".gitignore"),
    ".worktrees/\nnode_modules/\n.bkit/.dev.lock\ndocs/plans/*/logs/**/.lock\n",
  );
  write(path.join(repo, "docs/roadmap.md"), "# Roadmap\n");
  write(path.join(repo, "src/app.ts"), "export {};\n");
  const docPath = `docs/plans/${MONTH}/${FID}-${workflow}.md`;
  if (opts.docOnDev !== undefined) write(path.join(repo, docPath), opts.docOnDev);
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", "init");
  git(repo, "push", "-q", "origin", "dev");

  const wt = path.join(repo, ".worktrees", FID);
  git(repo, "worktree", "add", "-q", "-b", `feat/${FID}`, wt, "dev");
  write(path.join(wt, docPath), `# ${FID} ${workflow} from this run\n`);
  write(path.join(wt, "docs/roadmap.md"), `# Roadmap\n- ${FID}\n`);
  write(
    path.join(wt, `docs/plans/${MONTH}/logs/${FID}/status.jsonl`),
    '{"type":"workflow-started"}\n',
  );
  git(wt, "add", "-A");
  git(wt, "commit", "-q", "-m", "feature work");
  git(wt, "push", "-q", "origin", `feat/${FID}`);
  // `bkit worktrees setup` marks the worktrees it creates; close removes only those.
  const common = git(repo, "rev-parse", "--path-format=absolute", "--git-common-dir");
  write(path.join(common, "bkit-outbox", FID, ".worktree-owned"), "");
  return { repo, docPath, devBefore: git(repo, "rev-parse", "origin/dev") };
}

function runClose(
  workflow: "design" | "plan",
  repo: string,
): { status: number | null; stderr: string } {
  // What the fence sets before its runtime branch: the binary, the main
  // checkout, and the ledger row's repo / version fields.
  const preamble = [
    'BKIT="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"',
    `REPO_ROOT="${repo}"`,
    'cd "$REPO_ROOT"',
    'REPO_SLUG="test/repo"',
    'BKIT_VER="0.0.0"',
  ].join("\n");
  const script = `${preamble}\n${localCloseBlock(workflow)}`;
  const res = spawnSync("bash", ["-c", script], { cwd: repo, encoding: "utf-8" });
  return { status: res.status, stderr: res.stderr };
}

function remoteDev(repo: string): string {
  git(repo, "fetch", "-q", "origin");
  return git(repo, "rev-parse", "origin/dev");
}

function expectBranchKept(fx: Fixture): void {
  expect(git(fx.repo, "branch", "--list", `feat/${FID}`)).toContain(`feat/${FID}`);
  expect(git(fx.repo, "ls-remote", "origin", `refs/heads/feat/${FID}`)).not.toBe("");
  expect(fs.existsSync(path.join(fx.repo, ".worktrees", FID))).toBe(true);
  expect(remoteDev(fx.repo)).toBe(fx.devBefore);
}

describe.each(["design", "plan"] as const)("bkit-%s.md local close squash", (workflow) => {
  it("keeps feat/{FID} and pushes nothing when git refuses the squash", () => {
    const fx = initFixture(workflow);
    // Another session's uncommitted edit to a file the squash also changes.
    write(path.join(fx.repo, "docs/roadmap.md"), "# Roadmap\n- edited by another session\n");

    const res = runClose(workflow, fx.repo);

    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain(`squash of feat/${FID} into dev failed`);
    expectBranchKept(fx);
    expect(fs.readFileSync(path.join(fx.repo, "docs/roadmap.md"), "utf-8")).toContain(
      "another session",
    );
  });

  it("keeps feat/{FID} and pushes nothing when the squash does not carry this run's doc", () => {
    const fx = initFixture(workflow, { docOnDev: "# older copy\n" });
    // dev edits the same doc after the branch point; `-X ours` keeps dev's
    // side of the conflict, so the squash succeeds without this run's doc.
    const other = path.join(path.dirname(fx.repo), "other");
    execFileSync("git", [
      "clone",
      "-q",
      "-b",
      "dev",
      path.join(path.dirname(fx.repo), "remote.git"),
      other,
    ]);
    git(other, "config", "user.email", "t@t.t");
    git(other, "config", "user.name", "t");
    write(path.join(other, fx.docPath), "# concurrent edit on dev\n");
    git(other, "commit", "-q", "-am", "concurrent doc edit");
    git(other, "push", "-q", "origin", "dev");
    fx.devBefore = git(other, "rev-parse", "HEAD");

    const res = runClose(workflow, fx.repo);

    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain(`squash did not stage the feat/${FID} copy of`);
    expectBranchKept(fx);
  });

  it("commits only the squash and bookkeeping, never another session's staged doc", () => {
    const fx = initFixture(workflow);
    const foreign = `docs/plans/${MONTH}/OTHER-plan.md`;
    write(path.join(fx.repo, foreign), "# another session's plan\n");
    git(fx.repo, "add", foreign);

    const res = runClose(workflow, fx.repo);

    expect(res.status, res.stderr).toBe(0);
    const landed = git(fx.repo, "show", "--name-only", "--format=", "origin/dev").split("\n");
    expect(landed).toContain(fx.docPath);
    expect(landed).not.toContain(foreign);
    expect(git(fx.repo, "diff", "--cached", "--name-only")).toBe(foreign);
  });

  it("lands this run's doc and then removes the branch, leaving unrelated edits alone", () => {
    const fx = initFixture(workflow);
    write(path.join(fx.repo, "src/app.ts"), "export const wip = 1;\n");
    const branchDoc = git(fx.repo, "rev-parse", `feat/${FID}:${fx.docPath}`);

    const res = runClose(workflow, fx.repo);

    expect(res.status, res.stderr).toBe(0);
    expect(git(fx.repo, "rev-parse", `origin/dev:${fx.docPath}`)).toBe(branchDoc);
    expect(git(fx.repo, "branch", "--list", `feat/${FID}`)).toBe("");
    expect(git(fx.repo, "ls-remote", "origin", `refs/heads/feat/${FID}`)).toBe("");
    expect(fs.existsSync(path.join(fx.repo, ".worktrees", FID))).toBe(false);
    expect(git(fx.repo, "status", "--porcelain", "--", "src/app.ts")).toBe("M src/app.ts");
  });
});
