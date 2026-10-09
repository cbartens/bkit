// Executes the Step 14 worktree-removal fence from bkit-ship.md against a real
// git worktree. The fence is extracted from the workflow and run as written,
// with the repo's built `bkit` linked in at the path the fence resolves — so
// the test fails if ship ever stops scoping removal to worktrees a workflow
// created. The marker logic itself is covered in commands/workflow/worktrees.test.ts.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SHIP_MD = path.resolve(".bkit/workflows/bkit-ship.md");
const BKIT_BIN = path.resolve("dist/bkit-install.js");
const FID = "999-test-fid";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function cleanupRemoveFence(fid: string): string {
  const ship = fs.readFileSync(SHIP_MD, "utf-8");
  const lines = ship.split("\n");
  const start = lines.findIndex((line) => /^## .*Step 14 — Worktree Cleanup/.test(line));
  expect(start, "Step 14 section not found").toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((line, index) => index > start && /^---$/.test(line));
  const section = lines.slice(start, end + 1).join("\n");
  const fence = section.match(/```bash\n([\s\S]*?)```/);
  expect(fence, "Step 14 ownership fence not found").toBeTruthy();
  return fence![1].replaceAll("{FID}", fid);
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

function runFence(repo: string): void {
  execFileSync("bash", ["-c", cleanupRemoveFence(FID)], {
    cwd: repo,
    encoding: "utf-8",
  });
}

describe("bkit-ship.md Step 14 worktree removal is ownership-scoped", () => {
  it("leaves the worktree in place when the ownership marker is absent", () => {
    const { repo } = initRepo();
    runFence(repo);
    expect(fs.existsSync(path.join(repo, ".worktrees", FID))).toBe(true);
  });

  it("removes the worktree when the ownership marker is present", () => {
    const { repo } = initRepo();
    const marker = markerPath(repo);
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, "");
    runFence(repo);
    expect(fs.existsSync(path.join(repo, ".worktrees", FID))).toBe(false);
  });
});
