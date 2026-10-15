// checks/before/repo.test.ts — Unit tests for the Phase 1 repo-precondition detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectNoPackageJson,
  detectMalformedPackageJson,
  detectNotGitRepo,
  detectBkitNotOnPath,
} from "./repo";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeModules(...flags: string[]): Set<import("../../cli").ModuleFlag> {
  return new Set(flags) as Set<import("../../cli").ModuleFlag>;
}

// ---------------------------------------------------------------------------
// detectNoPackageJson
// ---------------------------------------------------------------------------

describe("detectNoPackageJson", () => {
  it("returns finding when package.json is absent", () => {
    const result = detectNoPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("no-package-json");
    expect(result!.severity).toBe("blocker");
    expect(result!.detect).toBeTruthy();
    expect(result!.action).toBeTruthy();
  });

  it("returns null when package.json exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectNoPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectMalformedPackageJson
// ---------------------------------------------------------------------------

describe("detectMalformedPackageJson", () => {
  it("returns finding when package.json contains invalid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not valid json }", "utf-8");
    const result = detectMalformedPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("malformed-package-json");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when package.json is valid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });

  it("returns null when package.json is absent (no-package-json fires instead)", () => {
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectNotGitRepo
// ---------------------------------------------------------------------------

describe("detectNotGitRepo", () => {
  it("returns finding when --core requested AND .git/ absent", () => {
    const result = detectNotGitRepo(tmpDir, makeModules("core"));
    expect(result).not.toBeNull();
    expect(result!.id).toBe("not-git-repo");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when --core requested AND .git/ exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".git"));
    expect(detectNotGitRepo(tmpDir, makeModules("core"))).toBeNull();
  });

  it("returns null when --core NOT requested (even if .git/ absent)", () => {
    // No core flag — not-git-repo should NOT fire
    expect(detectNotGitRepo(tmpDir, makeModules("claude"))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// process.env snapshot and restore around each test
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// detectBkitNotOnPath
// ---------------------------------------------------------------------------

describe("detectBkitNotOnPath", () => {
  const origEnv = { ...process.env };

  afterEach(() => {
    // Restore env after each test in this suite
    Object.keys(process.env).forEach((k) => delete process.env[k]);
    Object.assign(process.env, origEnv);
  });

  it("returns null in CI environment", () => {
    process.env.CI = "true";
    expect(detectBkitNotOnPath()).toBeNull();
  });

  it("returns null when `bkit` is on PATH (found by which)", () => {
    // Point PATH at a dir containing a fake `bkit` executable
    const fakeDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-path-test-"));
    const fakeBkit = path.join(fakeDir, "bkit");
    fs.writeFileSync(fakeBkit, "#!/bin/sh\n", "utf-8");
    fs.chmodSync(fakeBkit, 0o755);
    process.env.PATH = `${fakeDir}:${process.env.PATH}`;
    delete process.env.CI;
    delete process.env.CLAUDE_CODE_REMOTE;
    delete process.env.CURSOR_REMOTE_AGENT;
    try {
      expect(detectBkitNotOnPath()).toBeNull();
    } finally {
      fs.rmSync(fakeDir, { recursive: true, force: true });
    }
  });

  it("returns advisory when `bkit` is not on PATH", () => {
    process.env.PATH = "/nonexistent-path-for-test";
    delete process.env.CI;
    delete process.env.CLAUDE_CODE_REMOTE;
    delete process.env.CURSOR_REMOTE_AGENT;
    const finding = detectBkitNotOnPath();
    expect(finding).not.toBeNull();
    expect(finding?.id).toBe("bkit-not-on-path");
    expect(finding?.severity).toBe("advisory");
    expect(finding?.action).toContain("alias bkit='pnpm bkit'");
  });
});
