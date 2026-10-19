// checks/after/managed.integration.test.ts — isOnProtectedBranch against real git.
//
// `bkit check` runs from `.husky/pre-push`, where git exports GIT_DIR and friends. The branch
// read must still act on the cwd repo, so the hook variables are set here to another repo.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isOnProtectedBranch } from "./managed";

const ENV_KEYS = [
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GITHUB_BASE_REF",
  "GITHUB_REF_NAME",
];
const saved: Record<string, string | undefined> = {};
let tmpDir: string;

function initRepo(dir: string, branch: string): void {
  fs.mkdirSync(dir);
  for (const args of [
    ["init", "-q", "-b", branch],
    ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "init"],
  ]) {
    const r = spawnSync("git", args, { cwd: dir, encoding: "utf-8" });
    expect(r.status, r.stderr).toBe(0);
  }
}

beforeEach(() => {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-managed-it-")));
  delete process.env.GITHUB_BASE_REF;
  delete process.env.GITHUB_REF_NAME;
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("isOnProtectedBranch — hook variables", () => {
  it("reads the cwd repo's branch when GIT_DIR points at a repo on a shared branch", () => {
    const target = path.join(tmpDir, "target");
    const other = path.join(tmpDir, "other");
    initRepo(target, "feat/604-hook-env");
    initRepo(other, "main");

    process.env.GIT_DIR = path.join(other, ".git");
    process.env.GIT_WORK_TREE = other;
    process.env.GIT_INDEX_FILE = path.join(other, ".git", "index");

    expect(isOnProtectedBranch(target)).toBe(false);
  });
});
