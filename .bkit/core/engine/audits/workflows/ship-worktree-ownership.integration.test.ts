// Executes the Step 14 worktree-removal line from bkit-ship.md against a real
// git worktree. The line is extracted from the workflow and run as written,
// with the repo's built `bkit` linked in at the path Step 1 resolves — so
// the test fails if ship ever stops scoping removal to worktrees a workflow
// created. The marker logic itself is covered in commands/workflow/worktrees.test.ts.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getWorkflowsRoot } from "../../shared/package-roots";

const SHIP_MD = path.join(getWorkflowsRoot(), "bkit-ship.md");
const BKIT_BIN = path.resolve("dist/cli.js");
const FID = "999-test-fid";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** The Step 14 `worktrees remove` line, placeholders filled; the step's row write is not run. */
function cleanupRemoveLine(fid: string, repo: string): string {
  const ship = fs.readFileSync(SHIP_MD, "utf-8");
  const lines = ship.split("\n");
  const start = lines.findIndex((line) => /^## .*Step 14 — Worktree Cleanup/.test(line));
  expect(start, "Step 14 section not found").toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((line, index) => index > start && /^---$/.test(line));
  const line = lines
    .slice(start, end + 1)
    .map((l) => l.trim())
    .find((l) => l.startsWith('"{BKIT}" worktrees remove '));
  expect(line, "Step 14 worktrees remove line not found").toBeTruthy();
  return line!
    .replaceAll("{BKIT}", path.join(repo, "node_modules/.bin/bkit"))
    .replaceAll("{FID}", fid)
    .replaceAll("{SHIP_BRANCH}", `feat/${fid}`);
}

function initRepo(): { tmp: string; repo: string } {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-wt-"));
  temps.push(tmp);
  const repo = path.join(tmp, "repo");
  fs.mkdirSync(repo);
  execFileSync("git", ["init", "-q", repo]);
  execFileSync("git", ["-C", repo, "config", "user.email", "t@t.t"]);
  execFileSync("git", ["-C", repo, "config", "user.name", "t"]);
  execFileSync("git", ["-C", repo, "commit", "-q", "--allow-empty", "-m", "init"]);
  fs.mkdirSync(path.join(repo, "node_modules/.bin"), { recursive: true });
  fs.symlinkSync(BKIT_BIN, path.join(repo, "node_modules/.bin/bkit"));
  const worktree = path.join(repo, ".worktrees", FID);
  fs.mkdirSync(path.dirname(worktree));
  execFileSync("git", ["-C", repo, "worktree", "add", "-q", worktree, "-b", `feat/${FID}`, "HEAD"]);
  return { tmp, repo };
}

function markerPath(repo: string): string {
  const common = execFileSync(
    "git",
    ["-C", repo, "rev-parse", "--path-format=absolute", "--git-common-dir"],
    { encoding: "utf-8" },
  ).trim();
  return path.join(common, "bkit-outbox", FID, ".worktree-owned");
}

function runFence(repo: string): Record<string, unknown> {
  const out = execFileSync("bash", ["-c", cleanupRemoveLine(FID, repo)], {
    cwd: repo,
    encoding: "utf-8",
  });
  return JSON.parse(out) as Record<string, unknown>;
}

const hasBranch = (repo: string) =>
  execFileSync("git", ["-C", repo, "branch", "--list", `feat/${FID}`], {
    encoding: "utf-8",
  }).trim() !== "";

describe("bkit-ship.md Step 14 worktree removal is ownership-scoped", () => {
  it("leaves the worktree AND its branch in place when the ownership marker is absent, naming the worktree", () => {
    const { repo } = initRepo();
    const r = runFence(repo);
    expect(fs.existsSync(path.join(repo, ".worktrees", FID))).toBe(true);
    expect(hasBranch(repo)).toBe(true);
    expect(fs.realpathSync(String(r.branchBlockedBy))).toBe(
      fs.realpathSync(path.join(repo, ".worktrees", FID)),
    );
  });

  it("removes the worktree when the ownership marker is present", () => {
    const { repo } = initRepo();
    const marker = markerPath(repo);
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, "");
    const r = runFence(repo);
    expect(fs.existsSync(path.join(repo, ".worktrees", FID))).toBe(false);
    expect(hasBranch(repo)).toBe(false);
    expect(r).toMatchObject({ removed: true, branchDeleted: true, branchBlockedBy: null });
  });
});
