// Executes the Step 12 ownership fence from bkit-ship.md against a real git
// worktree. The fence is extracted from the workflow and run as written —
// the test does not keep a second copy of the if/remove logic.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SHIP_MD = path.resolve(".bkit/workflows/bkit-ship.md");
const FID = "999-test-fid";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function step12RemoveFence(fid: string, bookRoot: string): string {
  const ship = fs.readFileSync(SHIP_MD, "utf-8");
  const lines = ship.split("\n");
  const start = lines.findIndex((line) => /^## .*Step 12/.test(line));
  expect(start, "Step 12 section not found").toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((line, index) => index > start && /^---$/.test(line));
  const section = lines.slice(start, end + 1).join("\n");
  const fence = section.match(/```bash\n([\s\S]*?)```/);
  expect(fence, "Step 12 ownership fence not found").toBeTruthy();
  const body = fence![1];
  expect(body).toContain(".worktree-owned");
  expect(body).toContain("bkit-outbox");
  expect(body).toContain("--git-common-dir");
  return body.replaceAll("{FID}", fid).replaceAll("{BOOK_ROOT}", bookRoot);
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
  execFileSync("bash", ["-c", step12RemoveFence(FID, repo)], {
    cwd: repo,
    encoding: "utf-8",
  });
}

describe("bkit-ship.md Step 12 ownership fence", () => {
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

  it("keeps the ownership marker after the worktree directory is deleted", () => {
    const { repo } = initRepo();
    const marker = markerPath(repo);
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, "");
    fs.rmSync(path.join(repo, ".worktrees", FID), { recursive: true, force: true });
    expect(fs.existsSync(marker)).toBe(true);
  });
});
