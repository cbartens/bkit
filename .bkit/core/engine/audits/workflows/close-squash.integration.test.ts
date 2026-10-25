// Executes the local (runtime pushes dev) close of bkit-design.md and
// bkit-plan.md against a real repo, remote and worktree. The `branches land`
// line is extracted from the workflow's Close Workflow block and run as
// written, with its placeholders filled — the test does not keep a second copy
// of the squash / commit / cleanup logic. `bkit branches land` (squash in a
// throwaway origin/dev worktree, roadmap row, ledgers commit, dev push, local dev
// fast-forward, worktree removal) runs from the repo's built dist/, linked into
// the fixture at the path Step 1 resolves.

import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseText } from "../../shared/text";

const DEFAULT_FID = "999-close-squash";
const FID = DEFAULT_FID;
const MONTH = "202610";
const BKIT_BIN = path.resolve("dist/cli.js");

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

function landLine(workflow: "design" | "plan"): string {
  const md = fs.readFileSync(path.resolve(`.bkit/core/workflows/bkit-${workflow}.md`), "utf-8");
  const line = md
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith('cd "{REPO_ROOT}" && "{BKIT}" branches land '));
  expect(line, `${workflow} close branches land line not found`).toBeTruthy();
  return line!;
}

interface Fixture {
  repo: string;
  docPath: string;
  devBefore: string;
}

// A main checkout on dev, a remote, and feat/{FID} checked out in
// .worktrees/{FID} carrying this run's design or plan doc.
function initFixture(
  workflow: "design" | "plan",
  opts: { docOnDev?: string; fid?: string; tracker?: string } = {},
): Fixture {
  const FID = opts.fid ?? DEFAULT_FID;
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
  write(path.join(repo, ".gitignore"), ".worktrees/\nnode_modules/\ndocs/plans/*/logs/**/.lock\n");
  write(path.join(repo, "docs/roadmap.md"), "# Roadmap\n");
  write(path.join(repo, "src/app.ts"), "export {};\n");
  if (opts.tracker !== undefined) {
    write(
      path.join(repo, "package.json"),
      JSON.stringify({ bkit: { tracker: { default: opts.tracker } } }),
    );
  }
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
  opts: { fid?: string; issue?: string; env?: Record<string, string> } = {},
): { status: number | null; stdout: string; stderr: string } {
  const FID = opts.fid ?? DEFAULT_FID;
  const script = landLine(workflow)
    .replaceAll("{REPO_ROOT}", repo)
    .replaceAll("{BKIT}", path.join(repo, "node_modules/.bin/bkit"))
    .replaceAll("{FID}", FID)
    .replaceAll("{YYYYMM}", MONTH)
    .replaceAll("{LOCK_TOKEN}", "no-lock-held")
    .replaceAll("{ISSUE_ID}", opts.issue ?? "999")
    .replaceAll("{BRANCH}", `feat/${FID}`);
  expect(script).not.toMatch(/\{[A-Z_]+\}/);
  // The worktree is the cwd the orchestrator runs the close from; the line cds to the main checkout.
  const res = spawnSync("bash", ["-c", script], {
    cwd: path.join(repo, ".worktrees", FID),
    encoding: "utf-8",
    env: { ...process.env, BKIT_RUNTIME: "LOCAL", ...opts.env },
  });
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
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
  it("lands past another session's uncommitted edit to a file the close changes, and keeps the edit", () => {
    const fx = initFixture(workflow);
    write(path.join(fx.repo, "docs/roadmap.md"), "# Roadmap\n- edited by another session\n");

    const res = runClose(workflow, fx.repo);

    expect(res.status, res.stderr).toBe(0);
    expect(git(fx.repo, "rev-parse", `origin/dev:${fx.docPath}`)).not.toBe("");
    // The fast-forward would overwrite the edit, so git refuses it and local dev stays put.
    expect(res.stderr).toContain("local dev not fast-forwarded");
    expect(git(fx.repo, "rev-parse", "dev")).toBe(fx.devBefore);
    expect(fs.readFileSync(path.join(fx.repo, "docs/roadmap.md"), "utf-8")).toContain(
      "another session",
    );
  });

  it("lands without pushing local dev's own commits, and leaves local dev where it was", () => {
    const fx = initFixture(workflow);
    write(path.join(fx.repo, "src/app.ts"), "export const local = 1;\n");
    git(fx.repo, "commit", "-q", "-am", "local only");
    const localDev = git(fx.repo, "rev-parse", "dev");

    const res = runClose(workflow, fx.repo);

    expect(res.status, res.stderr).toBe(0);
    expect(git(fx.repo, "rev-parse", "dev")).toBe(localDev);
    expect(git(fx.repo, "log", "--format=%s", "origin/dev")).not.toContain("local only");
    expect(git(fx.repo, "rev-parse", `origin/dev:${fx.docPath}`)).not.toBe("");
  });

  it("leaves the main checkout on its branch and moves only the dev pointer", () => {
    const fx = initFixture(workflow);
    git(fx.repo, "checkout", "-q", "-b", "elsewhere");

    const res = runClose(workflow, fx.repo);

    expect(res.status, res.stderr).toBe(0);
    expect(git(fx.repo, "branch", "--show-current")).toBe("elsewhere");
    expect(git(fx.repo, "rev-parse", "dev")).toBe(remoteDev(fx.repo));
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

describe("bkit-design.md close with no issue", () => {
  it("lands an issue-less run with a FID-only marker", () => {
    const fid = "dev-close-squash";
    const fx = initFixture("design", { fid, tracker: "github" });
    // dev refuses the direct push, so the close goes through a PR; with gh unavailable the
    // command prints the PR body for the MCP tool to create.
    const remote = path.join(path.dirname(fx.repo), "remote.git");
    write(
      path.join(remote, "hooks/pre-receive"),
      '#!/bin/sh\nwhile read o n ref; do [ "$ref" = refs/heads/dev ] && { echo "dev is protected" >&2; exit 1; }; done\nexit 0\n',
    );
    fs.chmodSync(path.join(remote, "hooks/pre-receive"), 0o755);
    const bin = path.join(path.dirname(fx.repo), "bin");
    write(path.join(bin, "gh"), "#!/bin/sh\nexit 4\n");
    fs.chmodSync(path.join(bin, "gh"), 0o755);

    const res = runClose("design", fx.repo, {
      fid,
      issue: "",
      env: { PATH: [bin, process.env.PATH].join(path.delimiter) },
    });

    expect(res.status, res.stderr).toBe(80);
    const printed = parseText(res.stdout) as { stage: string; body: string };
    expect(printed.stage).toBe("open");
    expect(printed.body).toContain(`<!-- bkit:fid=${fid} -->`);
    expect(printed.body).not.toContain("bkit:issue=");
  });
});
