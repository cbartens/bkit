// bkit-comply.integration.test.ts — git-diff boundary integration test.
//
// Done-when contract (WS2-T4):
//   - Builds a temp git repo.
//   - Commits a .claude/* mirror edit.
//   - Runs the grader over a REAL `git diff parentSha..HEAD` (no mock).
//   - Asserts `no-mirror-edit` is flagged.
//   - Ground truth = actual git diff output, not a stub.
//
// The test uses `realGitAdapter` directly (the production git adapter), so it
// is classified as an integration test (boundary: git diff).

import * as childProcess from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runGrader, realGitAdapter } from "./bkit-comply.js";

// ---------------------------------------------------------------------------
// Temp-repo helpers
// ---------------------------------------------------------------------------

function run(cmd: string, cwd: string): string {
  return childProcess.execSync(cmd, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitInit(dir: string): void {
  run("git init -b main", dir);
  run('git config user.email "test@test.local"', dir);
  run('git config user.name "Test"', dir);
}

function commit(dir: string, msg: string): string {
  run("git add -A", dir);
  run(`git commit -m ${JSON.stringify(msg)}`, dir);
  return run("git rev-parse HEAD", dir).trim();
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-comply-it-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

describe("compliance grader — git-diff boundary (no-mirror-edit)", () => {
  it("flags a .claude/agents/ mirror edit in a real git diff", () => {
    gitInit(tmpDir);

    // Parent commit: create a source file (no mirror files yet).
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# test repo\n");
    const parentSha = commit(tmpDir, "init: base commit");

    // Create the mirror directory and write a file in it.
    const agentsDir = path.join(tmpDir, ".claude", "agents");
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, "bkit-design.md"), "# hand-edited mirror\n");
    commit(tmpDir, "feat: edit mirror");

    // Run the grader using the REAL git adapter (boundary: actual git diff).
    const violations = runGrader({
      parentSha,
      phase: "ship",
      gitAdapter: realGitAdapter,
      cwd: tmpDir,
    });

    const mirrorViolation = violations.find((v) => v.ruleId === "no-mirror-edit");
    expect(mirrorViolation).toBeDefined();
    expect(mirrorViolation!.result).toBe("fail");
    expect(mirrorViolation!.evidence).toContain(".claude/agents/bkit-design.md");
  });

  it("does NOT flag a .bkit/workflows/ edit (canonical source, not a mirror)", () => {
    gitInit(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "README.md"), "# test\n");
    const parentSha = commit(tmpDir, "init");

    const workflowsDir = path.join(tmpDir, ".bkit", "workflows");
    fs.mkdirSync(workflowsDir, { recursive: true });
    fs.writeFileSync(path.join(workflowsDir, "bkit-ship.md"), "# workflow source\n");
    commit(tmpDir, "feat: edit canonical source");

    const violations = runGrader({
      parentSha,
      phase: "ship",
      gitAdapter: realGitAdapter,
      cwd: tmpDir,
    });

    const mirrorViolation = violations.find((v) => v.ruleId === "no-mirror-edit");
    expect(mirrorViolation).toBeUndefined();
  });

  it("flags a .cursor/commands/ mirror edit", () => {
    gitInit(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "index.ts"), "// base\n");
    const parentSha = commit(tmpDir, "init");

    const cursorDir = path.join(tmpDir, ".cursor", "commands");
    fs.mkdirSync(cursorDir, { recursive: true });
    fs.writeFileSync(path.join(cursorDir, "bkit-plan.md"), "# cursor mirror\n");
    commit(tmpDir, "feat: edit cursor mirror");

    const violations = runGrader({
      parentSha,
      phase: "build",
      gitAdapter: realGitAdapter,
      cwd: tmpDir,
    });

    const mirrorViolation = violations.find((v) => v.ruleId === "no-mirror-edit");
    expect(mirrorViolation).toBeDefined();
    expect(mirrorViolation!.evidence).toContain(".cursor/commands/bkit-plan.md");
  });

  it("returns empty violations when diff has no mirror files (ground truth: empty diff paths)", () => {
    gitInit(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "src.ts"), "// base\n");
    const parentSha = commit(tmpDir, "init");

    // Only a non-mirror file change.
    fs.writeFileSync(path.join(tmpDir, "src.ts"), "// updated\n");
    commit(tmpDir, "feat: update source");

    const violations = runGrader({
      parentSha,
      phase: "ship",
      gitAdapter: realGitAdapter,
      cwd: tmpDir,
    });

    expect(violations.find((v) => v.ruleId === "no-mirror-edit")).toBeUndefined();
  });

  it("realGitAdapter diffPaths returns POSIX paths starting with the dir prefix", () => {
    gitInit(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "base.ts"), "// base\n");
    const parentSha = commit(tmpDir, "init");

    const agentsDir = path.join(tmpDir, ".claude", "agents");
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, "bkit-debug.md"), "# debug\n");
    commit(tmpDir, "feat: add agent");

    const diffPaths = realGitAdapter.diffPaths(parentSha, tmpDir);
    // Should contain at least one path with the mirror prefix
    expect(diffPaths.some((p) => p.startsWith(".claude/agents/"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Integration tests — skip-ci-not-head boundary
// ---------------------------------------------------------------------------

describe("compliance grader — skip-ci-not-head boundary", () => {
  it("flags ship phase when HEAD carries [skip ci] (ground truth: real git log)", () => {
    gitInit(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "file.ts"), "// base\n");
    const parentSha = commit(tmpDir, "init");

    fs.writeFileSync(path.join(tmpDir, "file.ts"), "// updated\n");
    commit(tmpDir, "chore: close workflow [skip ci]");

    const violations = runGrader({
      parentSha,
      phase: "ship",
      gitAdapter: realGitAdapter,
      cwd: tmpDir,
    });

    const v = violations.find((v) => v.ruleId === "skip-ci-not-head");
    expect(v).toBeDefined();
    expect(v!.result).toBe("fail");
    expect(v!.evidence).toContain("[skip ci]");
  });

  it("does NOT flag non-ship phases even with [skip ci] HEAD", () => {
    gitInit(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "file.ts"), "// base\n");
    const parentSha = commit(tmpDir, "init");

    fs.writeFileSync(path.join(tmpDir, "file.ts"), "// updated\n");
    commit(tmpDir, "chore: worktree-setup [skip ci]");

    const violations = runGrader({
      parentSha,
      phase: "build",
      gitAdapter: realGitAdapter,
      cwd: tmpDir,
    });

    expect(violations.find((v) => v.ruleId === "skip-ci-not-head")).toBeUndefined();
  });
});
