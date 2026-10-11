// checks/after/auth.test.ts — Unit tests for the Phase 3 credential detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectShellGhMcpToken,
  hasGithubMcpServer,
  detectGhSecret,
  detectCiRouterSecrets,
  buildCloudDashboardsAdvisory,
} from "./auth";

// ---------------------------------------------------------------------------
// Module-level mock for node:child_process
// vi.hoisted() must be called at the module top-level (once) so Vitest can hoist
// the mock declaration before imports. Individual tests use mockReset +
// mockReturnValue / mockImplementation to configure per-case behaviour.
// ---------------------------------------------------------------------------
const { execSync, execFileSync, spawnSync } = vi.hoisted(() => ({
  execSync: vi.fn(),
  execFileSync: vi.fn(),
  spawnSync: vi.fn(),
}));

vi.mock("node:child_process", () => ({ execSync, execFileSync, spawnSync }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalCwd = process.cwd();
  originalEnv = { ...process.env };
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-postinstall-test-"));
  process.chdir(tmpDir);
  // Default: git resolution fails → currentBranch null → isOnProtectedBranch true
  // (fail-safe). Tests that exercise a specific branch set GITHUB_REF_NAME/BASE_REF.
  spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env = originalEnv;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
  execSync.mockReset();
  execFileSync.mockReset();
  spawnSync.mockReset();
});

// ---------------------------------------------------------------------------
// detectShellGhMcpToken (BKIT_GH_TOKEN — GitHub MCP auth)
// ---------------------------------------------------------------------------

describe("detectShellGhMcpToken", () => {
  it("returns 'present' when BKIT_GH_TOKEN is set and non-empty", () => {
    process.env.BKIT_GH_TOKEN = "ghp_value";
    expect(detectShellGhMcpToken()).toBe("present");
  });

  it("returns 'missing' when BKIT_GH_TOKEN is not set", () => {
    delete process.env.BKIT_GH_TOKEN;
    expect(detectShellGhMcpToken()).toBe("missing");
  });

  it("returns 'empty' when BKIT_GH_TOKEN is set to empty string", () => {
    process.env.BKIT_GH_TOKEN = "";
    expect(detectShellGhMcpToken()).toBe("empty");
  });

  it("'empty' and 'missing' are distinct values (not equal)", () => {
    process.env.BKIT_GH_TOKEN = "";
    expect(detectShellGhMcpToken()).not.toBe("missing");
    delete process.env.BKIT_GH_TOKEN;
    expect(detectShellGhMcpToken()).not.toBe("empty");
  });
});

// ---------------------------------------------------------------------------
// hasGithubMcpServer
// ---------------------------------------------------------------------------

describe("hasGithubMcpServer", () => {
  it("true when root .mcp.json declares a github server", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { github: { type: "http" } } }),
    );
    expect(hasGithubMcpServer(tmpDir)).toBe(true);
  });

  it("true when only .cursor/mcp.json declares a github server", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "mcp.json"),
      JSON.stringify({ mcpServers: { github: { type: "http" } } }),
    );
    expect(hasGithubMcpServer(tmpDir)).toBe(true);
  });

  it("false when no mcp config exists", () => {
    expect(hasGithubMcpServer(tmpDir)).toBe(false);
  });

  it("false when mcp config has no github server", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { linear: { type: "http" } } }),
    );
    expect(hasGithubMcpServer(tmpDir)).toBe(false);
  });

  it("false (does not throw) on malformed JSON", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "{ not json");
    expect(hasGithubMcpServer(tmpDir)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectGhSecret
// ---------------------------------------------------------------------------

describe("detectGhSecret", () => {
  it("returns 'present' when gh CLI reports the named secret exists", () => {
    execSync.mockReturnValue("ANTHROPIC_API_KEY\n");
    expect(detectGhSecret("ANTHROPIC_API_KEY")).toBe("present");
  });

  it("returns 'missing' when gh CLI reports no such secret", () => {
    execSync.mockReturnValue("OTHER_SECRET\n");
    expect(detectGhSecret("ANTHROPIC_API_KEY")).toBe("missing");
  });

  it("returns 'unknown' when gh CLI throws", () => {
    execSync.mockImplementation(() => {
      throw new Error("command not found: gh");
    });
    expect(detectGhSecret("ANTHROPIC_API_KEY")).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// detectCiRouterSecrets
// ---------------------------------------------------------------------------

describe("detectCiRouterSecrets", () => {
  it("returns empty when bkit-cloud.yml is absent", () => {
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it("any tracker: emits ONLY ANTHROPIC_API_KEY (bkit-cloud.yml is GitHub-only, no LINEAR dependency)", () => {
    // bkit-cloud.yml is cloud=claude / GitHub-tracker only — no BKIT_LINEAR_API_KEY.
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker: "linear" } }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    execSync.mockReturnValue(""); // gh secret list returns no secrets
    const findings = detectCiRouterSecrets(tmpDir);
    expect(findings.map((f) => f.id)).toEqual(["anthropic-api-key-secret-missing"]);
  });

  it("github tracker: emits ONLY ANTHROPIC — no BKIT_LINEAR_API_KEY advisory (issue #138)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker: "github" } }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    execSync.mockReturnValue(""); // gh secret list returns no secrets
    const findings = detectCiRouterSecrets(tmpDir);
    expect(findings.map((f) => f.id)).toEqual(["anthropic-api-key-secret-missing"]);
  });

  it("Linear tracker: returns empty when the required secret is present", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker: "linear" } }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    execSync.mockReturnValue("ANTHROPIC_API_KEY\nBKIT_LINEAR_API_KEY\n");
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// buildCloudDashboardsAdvisory
// ---------------------------------------------------------------------------

describe("buildCloudDashboardsAdvisory", () => {
  it("returns null when none of router / .claude / .cursor exist", () => {
    expect(buildCloudDashboardsAdvisory(tmpDir)).toBeNull();
  });

  it("fires when bkit-cloud.yml exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("cloud-secrets-three-locations");
    expect(result!.action).toContain("GitHub Actions");
    expect(result!.action).toContain("Cursor Cloud Agents");
    expect(result!.action).toContain("Runtime Secret");
    expect(result!.action).toContain("Claude Code (web)");
  });

  it("fires when .claude/ exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    expect(buildCloudDashboardsAdvisory(tmpDir)).not.toBeNull();
  });

  it("fires when .cursor/ exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    expect(buildCloudDashboardsAdvisory(tmpDir)).not.toBeNull();
  });

  it("never mentions the retired BKIT_GH_TOKEN_INSTALL install token", () => {
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result!.detect).not.toContain("BKIT_GH_TOKEN_INSTALL");
    expect(result!.action).not.toContain("BKIT_GH_TOKEN_INSTALL");
  });

  it("github tracker: omits BKIT_LINEAR_API_KEY from the secrets checklist (issue #138)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker: "github" } }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).not.toContain("BKIT_LINEAR_API_KEY");
    expect(result!.action).not.toContain("BKIT_LINEAR_API_KEY");
    expect(result!.action).toContain("BKIT_ANTHROPIC_API_KEY");
  });

  it("lists cloud context-fetch creds (VERCEL_TOKEN etc.) for /bkit-debug in the cloud", () => {
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.action).toContain("/bkit-debug");
    expect(result!.action).toContain("VERCEL_TOKEN");
    expect(result!.action).toContain("SUPABASE_ACCESS_TOKEN");
    // Non-interactive guidance is the load-bearing bit for headless cloud agents.
    expect(result!.action).toContain("vercel login");
  });

  it("cloud=cursor variant: BKIT_LINEAR_API_KEY appears in the checklist (cursor path)", () => {
    // BKIT_LINEAR_API_KEY belongs to cloud=cursor (Linear tracker), not cloud=claude.
    // Simulate: no bkit-cloud.yml, but .cursor/ exists + cloudAgents=cursor recorded.
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "c",
        version: "1.0.0",
        bkit: { issueTracker: "linear", cloudAgents: "cursor" },
      }),
    );
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.action).toContain("BKIT_LINEAR_API_KEY");
    expect(result!.action).not.toContain("BKIT_ANTHROPIC_API_KEY");
  });
});
