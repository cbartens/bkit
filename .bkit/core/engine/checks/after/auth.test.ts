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

  it.each(["linear", "jira"])("false when mcp config has only the %s server", (tracker) => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { [tracker]: { type: "http" } } }),
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

/** Routes `gh secret list` / `gh variable list` to the given names; `null` → that call fails. */
function mockGhNames(names: { secret: string[] | null; variable: string[] | null }): void {
  spawnSync.mockImplementation((cmd: string, args: readonly string[]) => {
    const kind = args[0];
    const listed = cmd === "gh" && (kind === "secret" || kind === "variable") ? names[kind] : null;
    return listed === null
      ? { status: 1, stdout: "" }
      : { status: 0, stdout: listed.map((n) => `${n}\n`).join("") };
  });
}

describe("detectGhSecret", () => {
  it("returns 'present' when gh CLI reports the named secret exists", () => {
    mockGhNames({ secret: ["ANTHROPIC_API_KEY"], variable: [] });
    expect(detectGhSecret("ANTHROPIC_API_KEY")).toBe("present");
  });

  it("returns 'missing' when gh CLI reports no such secret", () => {
    mockGhNames({ secret: ["OTHER_SECRET"], variable: [] });
    expect(detectGhSecret("ANTHROPIC_API_KEY")).toBe("missing");
  });

  it("returns 'unknown' when gh CLI fails (absent / unauthenticated)", () => {
    mockGhNames({ secret: null, variable: null });
    expect(detectGhSecret("ANTHROPIC_API_KEY")).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// detectCiRouterSecrets
// ---------------------------------------------------------------------------

describe("detectCiRouterSecrets", () => {
  const FEDERATION_VARIABLES = ["ANTHROPIC_FEDERATION_RULE_ID", "ANTHROPIC_ORGANIZATION_ID"];
  const CURRENT_ROUTER =
    "name: bkit-cloud\n          anthropic_federation_rule_id: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}\n";

  function writeRouter(content: string, issueTracker = "github"): void {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker } }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"), content);
  }

  it("returns empty when bkit-cloud.yml is absent", () => {
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it.each(["linear", "github", "jira"])(
    "%s tracker, no claude credential: ONE finding naming the key and the federation variables (no tracker token)",
    (tracker) => {
      writeRouter(CURRENT_ROUTER, tracker);
      mockGhNames({ secret: [], variable: [] });
      const findings = detectCiRouterSecrets(tmpDir);
      expect(findings.map((f) => f.id)).toEqual(["anthropic-api-key-secret-missing"]);
      expect(findings[0]!.action).toContain("gh secret set ANTHROPIC_API_KEY");
      for (const v of FEDERATION_VARIABLES)
        expect(findings[0]!.action).toContain(`gh variable set ${v}`);
      expect(findings[0]!.action).not.toContain("BKIT_LINEAR_API_KEY");
      expect(findings[0]!.action).not.toContain("BKIT_JIRA_API_TOKEN");
    },
  );

  it("returns empty when the ANTHROPIC_API_KEY secret is present", () => {
    writeRouter(CURRENT_ROUTER);
    mockGhNames({ secret: ["ANTHROPIC_API_KEY", "BKIT_LINEAR_API_KEY"], variable: [] });
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it("no finding when federation variables are set and the adopted copy passes them", () => {
    writeRouter(CURRENT_ROUTER);
    mockGhNames({ secret: [], variable: FEDERATION_VARIABLES });
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it("one federation variable only: missing-credential finding", () => {
    writeRouter(CURRENT_ROUTER);
    mockGhNames({ secret: [], variable: ["ANTHROPIC_FEDERATION_RULE_ID"] });
    expect(detectCiRouterSecrets(tmpDir).map((f) => f.id)).toEqual([
      "anthropic-api-key-secret-missing",
    ]);
  });

  it("federation variables set but the adopted copy predates the federation inputs: stale-copy finding", () => {
    writeRouter("name: bkit-cloud\n");
    mockGhNames({ secret: [], variable: FEDERATION_VARIABLES });
    const findings = detectCiRouterSecrets(tmpDir);
    expect(findings.map((f) => f.id)).toEqual(["anthropic-federation-template-stale"]);
    expect(findings[0]!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
  });

  it("key secret AND federation variables: the key shadows federation — finding says to delete the secret", () => {
    writeRouter(CURRENT_ROUTER);
    mockGhNames({ secret: ["ANTHROPIC_API_KEY"], variable: FEDERATION_VARIABLES });
    const findings = detectCiRouterSecrets(tmpDir);
    expect(findings.map((f) => f.id)).toEqual(["anthropic-api-key-shadows-federation"]);
    expect(findings[0]!.action).toContain("gh secret delete ANTHROPIC_API_KEY");
  });

  it("silent when gh cannot list secrets", () => {
    writeRouter(CURRENT_ROUTER);
    mockGhNames({ secret: null, variable: null });
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
    mockGhNames({ secret: null, variable: FEDERATION_VARIABLES });
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it("key secret present, variables unlistable: no finding (the key works)", () => {
    writeRouter(CURRENT_ROUTER);
    mockGhNames({ secret: ["ANTHROPIC_API_KEY"], variable: null });
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it("key secret missing, variables unlistable: missing-credential finding says the variables went unchecked", () => {
    writeRouter(CURRENT_ROUTER);
    mockGhNames({ secret: [], variable: null });
    const findings = detectCiRouterSecrets(tmpDir);
    expect(findings.map((f) => f.id)).toEqual(["anthropic-api-key-secret-missing"]);
    expect(findings[0]!.detect).toContain("could not list repo variables");
    expect(findings[0]!.detect).not.toContain("gh confirms neither");
    expect(findings[0]!.action).toContain("gh secret set ANTHROPIC_API_KEY");
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

  it("jira tracker: the checklist names no tracker token (Jira runs locally only)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker: "jira" } }),
    );
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).not.toContain("BKIT_JIRA_API_TOKEN");
    expect(result!.action).not.toContain("BKIT_JIRA_API_TOKEN");
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

  it.each(["github", "jira"])(
    "%s tracker, .cursor/ only: the checklist names no Linear key",
    (tracker) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker: tracker } }),
      );
      fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
      const result = buildCloudDashboardsAdvisory(tmpDir);
      expect(result).not.toBeNull();
      expect(result!.detect).not.toContain("BKIT_LINEAR_API_KEY");
      expect(result!.action).not.toContain("BKIT_LINEAR_API_KEY");
    },
  );

  it("linear tracker, .cursor/ only: falls back to the cursor checklist", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { issueTracker: "linear" } }),
    );
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result!.action).toContain("BKIT_LINEAR_API_KEY");
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
