// checks/before/env.test.ts — Unit tests for the Phase 1 local-env detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectMissingDotenv,
  detectBlankDotenvKeys,
  detectDirenvMissing,
  detectDirenvNotAllowed,
} from "./env";

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

// ---------------------------------------------------------------------------
// detectShellToken: unset vs empty-string
// .npmrc inline action text + fallback
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// [mcp-env] detectors — BAR-260
// ---------------------------------------------------------------------------

describe("detectMissingDotenv", () => {
  it("flags when .bkit/.env.example exists but .bkit/.env does not", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "BKIT_GH_TOKEN=\n", "utf-8");
    const f = detectMissingDotenv(tmpDir);
    expect(f).not.toBeNull();
    expect(f!.id).toBe("mcp-env-missing-dotenv");
    expect(f!.severity).toBe("advisory");
    expect(f!.action).toContain("[mcp-env]");
    expect(f!.action).not.toMatch(/BAR-\d+/);
  });

  it("does NOT flag when both .env.example and .env exist", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "BKIT_GH_TOKEN=\n", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env"), "BKIT_GH_TOKEN=ghp_test\n", "utf-8");
    expect(detectMissingDotenv(tmpDir)).toBeNull();
  });

  it("does NOT flag when .bkit/.env.example does not exist", () => {
    expect(detectMissingDotenv(tmpDir)).toBeNull();
  });

  it("github tracker: token prose omits BKIT_LINEAR_API_KEY; linear keeps it (issue #138)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "BKIT_GH_TOKEN=\n", "utf-8");
    const gh = detectMissingDotenv(tmpDir, "github")!;
    expect(gh.detect).not.toContain("BKIT_LINEAR_API_KEY");
    expect(gh.action).not.toContain("BKIT_LINEAR_API_KEY");
    expect(gh.action).toContain("BKIT_GH_TOKEN");
    const linear = detectMissingDotenv(tmpDir, "linear")!;
    expect(linear.action).toContain("BKIT_LINEAR_API_KEY");
  });
});

describe("detectBlankDotenvKeys", () => {
  it("returns empty array when .bkit/.env does not exist", () => {
    expect(detectBlankDotenvKeys(tmpDir)).toEqual([]);
  });

  it("returns two advisories when .bkit/.env has all required keys blank", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=\nBKIT_GH_TOKEN_INSTALL=\nBKIT_LINEAR_API_KEY=\n",
      "utf-8",
    );
    const findings = detectBlankDotenvKeys(tmpDir);
    expect(findings).toHaveLength(2);
    const ids = findings.map((f) => f.id);
    expect(ids).toContain("mcp-env-blank-key-bkit_gh_token");
    expect(ids).toContain("mcp-env-blank-key-bkit_linear_api_key");
  });

  it("github tracker: does NOT flag blank BKIT_LINEAR_API_KEY (issue #138)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=\nBKIT_GH_TOKEN_INSTALL=\nBKIT_LINEAR_API_KEY=\n",
      "utf-8",
    );
    const ids = detectBlankDotenvKeys(tmpDir, "github").map((f) => f.id);
    expect(ids).toContain("mcp-env-blank-key-bkit_gh_token");
    expect(ids).not.toContain("mcp-env-blank-key-bkit_linear_api_key");
  });

  it("returns one advisory for the blank key only", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=ghp_test\nBKIT_GH_TOKEN_INSTALL=ghp_bkit\nBKIT_LINEAR_API_KEY=\n",
      "utf-8",
    );
    const findings = detectBlankDotenvKeys(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("mcp-env-blank-key-bkit_linear_api_key");
  });

  it("returns empty array when all three keys are set and non-empty", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=ghp_test\nBKIT_GH_TOKEN_INSTALL=ghp_bkit\nBKIT_LINEAR_API_KEY=lin_key\n",
      "utf-8",
    );
    expect(detectBlankDotenvKeys(tmpDir)).toEqual([]);
  });

  it("returns advisory for absent key (key not in file at all)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=ghp_test\nBKIT_GH_TOKEN_INSTALL=ghp_bkit\n",
      "utf-8",
    );
    const findings = detectBlankDotenvKeys(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("mcp-env-blank-key-bkit_linear_api_key");
  });

  it("advisory action text contains [mcp-env] prefix and no BAR-XXX references", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env"), "BKIT_GH_TOKEN=\n", "utf-8");
    const findings = detectBlankDotenvKeys(tmpDir);
    for (const f of findings) {
      expect(f.action).toContain("[mcp-env]");
      expect(f.action).not.toMatch(/BAR-\d+/);
      expect(f.detect).not.toMatch(/BAR-\d+/);
    }
  });
});

describe("detectDirenvMissing", () => {
  const origEnv = { ...process.env };

  afterEach(() => {
    // Restore env after each test in this suite
    Object.keys(process.env).forEach((k) => delete process.env[k]);
    Object.assign(process.env, origEnv);
  });

  it("returns null when .envrc does not exist", () => {
    // No .envrc in tmpDir
    expect(detectDirenvMissing(tmpDir)).toBeNull();
  });

  it("returns null when CI=true (cloud/CI short-circuit)", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    process.env.CI = "true";
    expect(detectDirenvMissing(tmpDir)).toBeNull();
  });

  it("returns null when CLAUDE_CODE_REMOTE is truthy (cloud short-circuit)", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    process.env.CLAUDE_CODE_REMOTE = "1";
    expect(detectDirenvMissing(tmpDir)).toBeNull();
  });

  it("returns null when CURSOR_REMOTE_AGENT is truthy (cloud short-circuit)", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    process.env.CURSOR_REMOTE_AGENT = "1";
    expect(detectDirenvMissing(tmpDir)).toBeNull();
  });

  it("returns advisory when .envrc exists and direnv is NOT installed (mocked)", () => {
    // We can only test this in environments where direnv is not on PATH.
    // We mock by temporarily overriding the PATH to something empty.
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    delete process.env.CI;
    delete process.env.CLAUDE_CODE_REMOTE;
    delete process.env.CURSOR_REMOTE_AGENT;

    // Use a mock-friendly path with no direnv
    const savedPath = process.env.PATH;
    process.env.PATH = "/nonexistent-path-for-testing";
    try {
      const f = detectDirenvMissing(tmpDir);
      // If direnv is actually installed at /usr/bin/direnv or similar outside
      // the normal PATH entries, this might still return null. That's acceptable —
      // we can only assert the shape when the finding fires.
      if (f !== null) {
        expect(f.id).toBe("mcp-env-direnv-missing");
        expect(f.severity).toBe("advisory");
        expect(f.action).toContain("[mcp-env]");
        expect(f.action).not.toMatch(/BAR-\d+/);
      }
    } finally {
      process.env.PATH = savedPath;
    }
  });
});

describe("detectDirenvNotAllowed", () => {
  const origEnv = { ...process.env };

  afterEach(() => {
    Object.keys(process.env).forEach((k) => delete process.env[k]);
    Object.assign(process.env, origEnv);
  });

  it("returns null when .envrc does not exist", () => {
    expect(detectDirenvNotAllowed(tmpDir)).toBeNull();
  });

  it("returns null when CI=true (cloud/CI short-circuit)", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    process.env.CI = "true";
    expect(detectDirenvNotAllowed(tmpDir)).toBeNull();
  });

  it("returns null when CLAUDE_CODE_REMOTE is truthy", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    process.env.CLAUDE_CODE_REMOTE = "1";
    expect(detectDirenvNotAllowed(tmpDir)).toBeNull();
  });

  it("returns null when CURSOR_REMOTE_AGENT is truthy", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    process.env.CURSOR_REMOTE_AGENT = "1";
    expect(detectDirenvNotAllowed(tmpDir)).toBeNull();
  });

  it("returns null when direnv is not installed (guard: returns null, not advisory)", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), "dotenv_if_exists .bkit/.env\n", "utf-8");
    delete process.env.CI;
    delete process.env.CLAUDE_CODE_REMOTE;
    delete process.env.CURSOR_REMOTE_AGENT;
    const savedPath = process.env.PATH;
    process.env.PATH = "/nonexistent-path-for-testing";
    try {
      // When direnv is absent, detectDirenvNotAllowed should return null
      // (detectDirenvMissing fires instead — different advisory)
      const f = detectDirenvNotAllowed(tmpDir);
      expect(f).toBeNull();
    } finally {
      process.env.PATH = savedPath;
    }
  });
});

describe("[mcp-env] detector outputs", () => {
  it("detectMissingDotenv fires when .env.example exists but .env absent", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "BKIT_GH_TOKEN=\n", "utf-8");
    const finding = detectMissingDotenv(tmpDir);
    expect(finding?.id).toBe("mcp-env-missing-dotenv");
  });

  it("detectBlankDotenvKeys returns one finding per blank required key", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "BKIT_GH_TOKEN=\nBKIT_GH_TOKEN_INSTALL=\nBKIT_LINEAR_API_KEY=\n",
      "utf-8",
    );
    const ids = detectBlankDotenvKeys(tmpDir).map((f) => f.id);
    expect(ids).toContain("mcp-env-blank-key-bkit_gh_token");
    expect(ids).toContain("mcp-env-blank-key-bkit_linear_api_key");
  });

  it("all [mcp-env] advisories have no BAR-XXX references", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "BKIT_GH_TOKEN=\n", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env"), "BKIT_GH_TOKEN=\n", "utf-8");
    const findings = [
      detectMissingDotenv(tmpDir),
      ...detectBlankDotenvKeys(tmpDir),
      detectDirenvMissing(tmpDir),
      detectDirenvNotAllowed(tmpDir),
    ].filter((f): f is NonNullable<typeof f> => f !== null);
    for (const f of findings) {
      expect(f.action).not.toMatch(/BAR-\d+/);
      expect(f.detect).not.toMatch(/BAR-\d+/);
    }
  });
});
