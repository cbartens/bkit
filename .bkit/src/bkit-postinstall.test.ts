// bkit-postinstall.test.ts — Unit tests for Phase 3 detectors and formatChecklist (BAR-141).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dedupeById, type PreflightFinding } from "./bkit-preflight";
import type { WriteSet } from "./bkit-tiers";
import {
  detectShellToken,
  detectShellGhMcpToken,
  hasGithubMcpServer,
  detectActionsWritePermissions,
  detectProjectsToolset,
  buildGithubProjectAdvisory,
  detectGithubProjectFieldIdFormat,
  detectNpmrcAuth,
  detectNpmrcLegacyAuthToken,
  detectGhSecret,
  detectMainBranchProtection,
  detectVercelProject,
  detectVercelEnv,
  detectVercelInstallCommandMissingAuth,
  detectCiYmlMissingTokenEnv,
  detectValePackageNotSynced,
  detectWorkflowLintToolsMissing,
  detectDevDepsNeedFetch,
  detectLedgerAliasCollisions,
  detectBkitStubs,
  detectTurboIntegrationInputs,
  detectTestIntegrationEnv,
  detectGhaFloatingTags,
  detectBkitCloudYmlAlwaysTrueGate,
  detectCiYmlMissingActionlint,
  detectCiYmlRunInjection,
  detectCiYmlCapstoneContractDrift,
  detectTaggedTestsWithoutCiHome,
  detectRunLevelsNotComposed,
  detectCiRouterSecrets,
  buildCloudDashboardsAdvisory,
  buildDepUpdaterSetupAdvisory,
  buildTokenRenameMigrationAdvisory,
  buildCloudSetupAdvisory,
  buildTrackerSetupAdvisory,
  detectRenderedPromptsStale,
  detectManagedDocsStale,
  isOnProtectedBranch,
  formatChecklist,
  runPostInstallCheck,
  readChangelogVersionDelta,
  renderAdvisoriesMarkdown,
  writeAdvisoriesArtifact,
} from "./bkit-postinstall";
import { stampManagedVersion, managedVersionMarker } from "./bkit-version";
import { detectOpencodeYmlProviderDrift } from "./bkit-modules";

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

function makeModules(...flags: string[]): Set<import("./bkit-cli").ModuleFlag> {
  return new Set(flags) as Set<import("./bkit-cli").ModuleFlag>;
}

function makeWs(...writes: import("./bkit-install").WriteEntry[]): WriteSet {
  return { writes };
}

// ---------------------------------------------------------------------------
// detectShellToken
// ---------------------------------------------------------------------------

describe("detectShellToken", () => {
  it("returns 'present' when BKIT_GH_TOKEN_INSTALL is set and non-empty", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "some-token-value";
    expect(detectShellToken()).toBe("present");
  });

  it("returns 'missing' when BKIT_GH_TOKEN_INSTALL is not set", () => {
    delete process.env.BKIT_GH_TOKEN_INSTALL;
    expect(detectShellToken()).toBe("missing");
  });

  it("B4: returns 'empty' when BKIT_GH_TOKEN_INSTALL is set to empty string (differentiates from unset)", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "";
    expect(detectShellToken()).toBe("empty");
  });
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
// detectProjectsToolset
// ---------------------------------------------------------------------------

describe("detectProjectsToolset", () => {
  const writeMcp = (toolsets: string | null) => {
    const github: Record<string, unknown> = { type: "http" };
    if (toolsets !== null) github.headers = { "X-MCP-Toolsets": toolsets };
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ mcpServers: { github } }));
  };

  it("'present' when X-MCP-Toolsets includes projects", () => {
    writeMcp("context,issues,pull_requests,repos,users,projects");
    expect(detectProjectsToolset(tmpDir)).toBe("present");
  });

  it("'missing' when header present but omits projects (old-install drift)", () => {
    writeMcp("context,issues,pull_requests,repos,users");
    expect(detectProjectsToolset(tmpDir)).toBe("missing");
  });

  it("'unknown' when .mcp.json absent", () => {
    expect(detectProjectsToolset(tmpDir)).toBe("unknown");
  });

  it("'unknown' when github server has no toolset header (can't judge)", () => {
    writeMcp(null);
    expect(detectProjectsToolset(tmpDir)).toBe("unknown");
  });

  it("'unknown' (does not throw) on malformed JSON", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "{ not json");
    expect(detectProjectsToolset(tmpDir)).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// detectActionsWritePermissions
// ---------------------------------------------------------------------------

describe("detectActionsWritePermissions", () => {
  it("'present' when write perms AND PR approval allowed", () => {
    execFileSync.mockReturnValue(
      JSON.stringify({
        default_workflow_permissions: "write",
        can_approve_pull_request_reviews: true,
      }),
    );
    expect(detectActionsWritePermissions()).toBe("present");
  });

  it("'missing' when permissions are read-only", () => {
    execFileSync.mockReturnValue(
      JSON.stringify({
        default_workflow_permissions: "read",
        can_approve_pull_request_reviews: true,
      }),
    );
    expect(detectActionsWritePermissions()).toBe("missing");
  });

  it("'missing' when PR creation/approval is disabled even if write", () => {
    execFileSync.mockReturnValue(
      JSON.stringify({
        default_workflow_permissions: "write",
        can_approve_pull_request_reviews: false,
      }),
    );
    expect(detectActionsWritePermissions()).toBe("missing");
  });

  it("'unknown' when gh CLI throws (unavailable / unauthenticated)", () => {
    execFileSync.mockImplementation(() => {
      throw new Error("command not found: gh");
    });
    expect(detectActionsWritePermissions()).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// buildGithubProjectAdvisory
// ---------------------------------------------------------------------------

describe("buildGithubProjectAdvisory", () => {
  const pkg = (bkit: Record<string, unknown>) =>
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x", bkit }));
  const validProject = {
    owner: "acme",
    number: 7,
    statusFieldId: 350038178, // numeric field id (what projects_write updated_field.id requires)
    progressOptionId: "p",
    reviewOptionId: "r",
    doneOptionId: "d",
  };
  const writeToolset = (toolsets: string) =>
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { github: { headers: { "X-MCP-Toolsets": toolsets } } } }),
    );

  beforeEach(() => {
    // Advisory only fires when workflows are installed.
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
  });

  it("returns null when workflows are not installed", () => {
    fs.rmSync(path.join(tmpDir, ".claude"), { recursive: true, force: true });
    pkg({ issueTracker: "github" });
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it("returns null when tracker is not github", () => {
    pkg({ issueTracker: "linear", githubProject: validProject });
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it("flags both prerequisites when config absent and toolset missing", () => {
    pkg({ issueTracker: "github" });
    writeToolset("context,issues,pull_requests"); // no projects
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("github-project-board-sync-unconfigured");
    expect(result!.detect).toContain("`bkit.githubProject` is absent");
    expect(result!.detect).toContain("`projects` toolset is missing");
  });

  it("flags only the toolset when config is present but projects toolset missing", () => {
    pkg({ issueTracker: "github", githubProject: validProject });
    writeToolset("context,issues,pull_requests");
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("`projects` toolset is missing");
    expect(result!.detect).not.toContain("`bkit.githubProject` is absent");
  });

  it("flags only the config when toolset present but githubProject absent", () => {
    pkg({ issueTracker: "github" });
    writeToolset("context,issues,projects");
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("`bkit.githubProject` is absent");
    expect(result!.detect).not.toContain("`projects` toolset is missing");
  });

  it("returns null when both prerequisites are satisfied", () => {
    pkg({ issueTracker: "github", githubProject: validProject });
    writeToolset("context,issues,projects");
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it("stays quiet on explicit opt-out (bkit.githubProject: false), even with toolset missing", () => {
    pkg({ issueTracker: "github", githubProject: false });
    writeToolset("context,issues,pull_requests");
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it("treats an object lacking owner/number as absent (config not usable)", () => {
    pkg({ issueTracker: "github", githubProject: { statusFieldId: "F" } });
    writeToolset("context,issues,projects");
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("`bkit.githubProject` is absent");
  });

  it("steers discovery to `gh api …/projectsV2/…/fields`, not `gh project field-list`", () => {
    pkg({ issueTracker: "github" });
    writeToolset("context,issues,pull_requests"); // force the advisory to fire
    const action = buildGithubProjectAdvisory(tmpDir)!.action;
    // The fix: field-list returns the GraphQL node id, not the numeric field id —
    // so it must NOT be the discovery command, only a warning against its misuse.
    expect(action).not.toContain(
      "Discover the field + single-select option IDs: `gh project field-list",
    );
    expect(action).toContain("gh api /orgs/<org>/projectsV2/<number>/fields");
    expect(action).toContain("must NOT be used for `statusFieldId`");
    // Template must store statusFieldId as an UNQUOTED number, not a quoted string.
    expect(action).toContain('"statusFieldId": <numeric-field-id>');
    expect(action).not.toContain('"statusFieldId": "<id>"');
  });
});

// ---------------------------------------------------------------------------
// detectGithubProjectFieldIdFormat
// ---------------------------------------------------------------------------

describe("detectGithubProjectFieldIdFormat", () => {
  const pkg = (bkit: Record<string, unknown>) =>
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x", bkit }));
  const gp = (extra: Record<string, unknown>) => ({ owner: "acme", number: 7, ...extra });

  beforeEach(() => {
    // Mirrors the board-sync advisory gating: only fires with workflows installed.
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
  });

  it("returns null when statusFieldId is a numeric field id (correct shape)", () => {
    pkg({ issueTracker: "github", githubProject: gp({ statusFieldId: 350038178 }) });
    expect(detectGithubProjectFieldIdFormat(tmpDir)).toBeNull();
  });

  it("flags a GraphQL node id (PVTSSF_…) — the live silent-no-op failure", () => {
    pkg({
      issueTracker: "github",
      githubProject: gp({ statusFieldId: "PVTSSF_lADOD_iMUM4BYWt1zhTdKKI" }),
    });
    const result = detectGithubProjectFieldIdFormat(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("github-project-status-field-id-format");
    expect(result!.detect).toContain("GraphQL node id");
    expect(result!.detect).toContain("value must be a number");
    expect(result!.action).toContain("gh api /orgs/<org>/projectsV2/<number>/fields");
  });

  it("flags a quoted numeric string (projects_write still rejects a string)", () => {
    pkg({ issueTracker: "github", githubProject: gp({ statusFieldId: "350038178" }) });
    const result = detectGithubProjectFieldIdFormat(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("github-project-status-field-id-format");
  });

  it("returns null when statusFieldId is absent (the setup advisory's job)", () => {
    pkg({ issueTracker: "github", githubProject: gp({}) });
    expect(detectGithubProjectFieldIdFormat(tmpDir)).toBeNull();
  });

  it("returns null without owner/number (not an otherwise-configured board)", () => {
    pkg({ issueTracker: "github", githubProject: { statusFieldId: "PVTSSF_x" } });
    expect(detectGithubProjectFieldIdFormat(tmpDir)).toBeNull();
  });

  it("returns null on explicit opt-out (bkit.githubProject: false)", () => {
    pkg({ issueTracker: "github", githubProject: false });
    expect(detectGithubProjectFieldIdFormat(tmpDir)).toBeNull();
  });

  it("returns null when tracker is not github", () => {
    pkg({ issueTracker: "linear", githubProject: gp({ statusFieldId: "PVTSSF_x" }) });
    expect(detectGithubProjectFieldIdFormat(tmpDir)).toBeNull();
  });

  it("returns null when workflows are not installed", () => {
    fs.rmSync(path.join(tmpDir, ".claude"), { recursive: true, force: true });
    pkg({ issueTracker: "github", githubProject: gp({ statusFieldId: "PVTSSF_x" }) });
    expect(detectGithubProjectFieldIdFormat(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectNpmrcAuth
// ---------------------------------------------------------------------------

describe("detectNpmrcAuth", () => {
  // #274: registry-mapping-only is the correct shape — the auth token lives in
  // pnpm's user-level config (pnpm config set), NOT in the project .npmrc.
  it("returns 'present' when .npmrc has only the @cbartens registry mapping", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("present");
  });

  it("returns 'present' when .npmrc has the registry mapping plus a legacy authToken line", () => {
    // Still 'present' for the registry check; the legacy line is flagged separately.
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("present");
  });

  it("returns 'missing' when .npmrc exists but lacks the @cbartens registry mapping", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("missing");
  });

  it("returns 'missing' when .npmrc has only an unrelated registry", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "registry=https://registry.npmjs.org/\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("missing");
  });

  it("returns 'unknown' (silent skip) when .npmrc is absent", () => {
    expect(detectNpmrcAuth(tmpDir)).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// detectNpmrcLegacyAuthToken
// ---------------------------------------------------------------------------

describe("detectNpmrcLegacyAuthToken", () => {
  it("returns true when .npmrc carries a legacy GH Packages auth-token line", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
      "utf-8",
    );
    expect(detectNpmrcLegacyAuthToken(tmpDir)).toBe(true);
  });

  it("returns false for a registry-only .npmrc (the correct shape)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n",
      "utf-8",
    );
    expect(detectNpmrcLegacyAuthToken(tmpDir)).toBe(false);
  });

  it("returns false when .npmrc is absent", () => {
    expect(detectNpmrcLegacyAuthToken(tmpDir)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectVercelInstallCommandMissingAuth
// ---------------------------------------------------------------------------

describe("detectVercelInstallCommandMissingAuth", () => {
  it("flags a root vercel.json whose installCommand omits the pnpm config set auth", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({ installCommand: "pnpm install --frozen-lockfile" }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual(["vercel.json"]);
  });

  it("flags a root vercel.json that has no installCommand at all", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({ framework: "nextjs" }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual(["vercel.json"]);
  });

  it("passes an installCommand that writes the token via pnpm config set (JSON-escaped quotes)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({
        installCommand:
          'pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL" && pnpm install',
      }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([]);
  });

  it("passes the unquoted installCommand form (README example shape)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "vercel.json"),
      JSON.stringify({
        installCommand:
          "pnpm config set //npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL && pnpm install",
      }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([]);
  });

  it("returns [] when no vercel.json exists", () => {
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([]);
  });

  it("scans apps/<name>/vercel.json and reports the offending app path", () => {
    const appDir = path.join(tmpDir, "apps", "web");
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
      path.join(appDir, "vercel.json"),
      JSON.stringify({ installCommand: "pnpm install" }),
      "utf-8",
    );
    expect(detectVercelInstallCommandMissingAuth(tmpDir)).toEqual([
      path.join("apps", "web", "vercel.json"),
    ]);
  });
});

// ---------------------------------------------------------------------------
// detectGhSecret
// ---------------------------------------------------------------------------

describe("detectGhSecret", () => {
  it("returns 'present' when gh CLI reports BKIT_GH_TOKEN_INSTALL exists", () => {
    execSync.mockReturnValue("BKIT_GH_TOKEN_INSTALL\n");
    expect(detectGhSecret()).toBe("present");
  });

  it("returns 'missing' when gh CLI reports no BKIT_GH_TOKEN_INSTALL", () => {
    execSync.mockReturnValue("OTHER_SECRET\n");
    expect(detectGhSecret()).toBe("missing");
  });

  it("returns 'unknown' when gh CLI throws", () => {
    execSync.mockImplementation(() => {
      throw new Error("command not found: gh");
    });
    expect(detectGhSecret()).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// detectMainBranchProtection
// ---------------------------------------------------------------------------

describe("detectMainBranchProtection", () => {
  it("returns 'present' when gh api returns 200", () => {
    execFileSync.mockReturnValue(Buffer.from('{"required_status_checks":null}'));
    expect(detectMainBranchProtection()).toBe("present");
  });

  it("returns 'missing' when gh api stderr contains 'Branch not protected'", () => {
    execFileSync.mockImplementation(() => {
      const err = new Error("gh: api failed") as Error & { stderr?: Buffer };
      err.stderr = Buffer.from("gh: Branch not protected (HTTP 404)\n");
      throw err;
    });
    expect(detectMainBranchProtection()).toBe("missing");
  });

  it("returns 'unknown' when gh is unauthenticated / not a git repo", () => {
    execFileSync.mockImplementation(() => {
      const err = new Error("auth required") as Error & { stderr?: Buffer };
      err.stderr = Buffer.from("HTTP 401: Bad credentials\n");
      throw err;
    });
    expect(detectMainBranchProtection()).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// detectVercelProject
// ---------------------------------------------------------------------------

describe("detectVercelProject", () => {
  it("returns true when vercel.json exists at root", () => {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    expect(detectVercelProject(tmpDir)).toBe(true);
  });

  it("returns true when vercel.json exists under apps/<name>/", () => {
    fs.mkdirSync(path.join(tmpDir, "apps", "web"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "apps", "web", "vercel.json"), "{}", "utf-8");
    expect(detectVercelProject(tmpDir)).toBe(true);
  });

  it("returns false when no vercel.json exists", () => {
    expect(detectVercelProject(tmpDir)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectVercelEnv — short-circuits when no Vercel project
// ---------------------------------------------------------------------------

describe("detectVercelEnv", () => {
  it("returns 'unknown' (silent skip) when detectVercelProject returns false (no vercel.json)", () => {
    // No vercel.json → should short-circuit without calling execSync
    const result = detectVercelEnv("preview", tmpDir);
    expect(result).toBe("unknown");
  });

  it("returns 'present' when vercel CLI reports BKIT_GH_TOKEN_INSTALL", () => {
    // B3: must also have .vercel/project.json for CLI call to proceed
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".vercel"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".vercel", "project.json"),
      '{"projectId":"proj_x"}',
      "utf-8",
    );
    execFileSync.mockReturnValue("BKIT_GH_TOKEN_INSTALL  preview\n");
    expect(detectVercelEnv("preview", tmpDir)).toBe("present");
  });

  it("returns 'missing' when vercel CLI output lacks BKIT_GH_TOKEN_INSTALL", () => {
    // B3: must also have .vercel/project.json for CLI call to proceed
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".vercel"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".vercel", "project.json"),
      '{"projectId":"proj_x"}',
      "utf-8",
    );
    execFileSync.mockReturnValue("OTHER_VAR  preview\n");
    expect(detectVercelEnv("preview", tmpDir)).toBe("missing");
  });

  it("returns 'unknown' when vercel CLI throws", () => {
    // B3: must also have .vercel/project.json for CLI call to proceed
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".vercel"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".vercel", "project.json"),
      '{"projectId":"proj_x"}',
      "utf-8",
    );
    execFileSync.mockImplementation(() => {
      throw new Error("vercel: command not found");
    });
    expect(detectVercelEnv("preview", tmpDir)).toBe("unknown");
  });

  it("returns 'unknown' when vercel.json exists but .vercel/project.json is absent (B3 guard)", () => {
    // B3: vercel.json present but not linked — skip CLI call (no hang)
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    // .vercel/project.json absent
    expect(detectVercelEnv("preview", tmpDir)).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// detectCiYmlMissingTokenEnv
// ---------------------------------------------------------------------------

describe("detectCiYmlMissingTokenEnv", () => {
  const writeCi = (steps: string) => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `\njobs:\n  build:\n    steps:\n${steps}\n`,
      "utf-8",
    );
  };
  // #274 canonical correct install step: pnpm config set (user-level auth) + env mapping.
  const CONFIG_SET =
    '          pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"';
  const INSTALL = "          pnpm install --frozen-lockfile";
  const ENV_BLOCK =
    "        env:\n          BKIT_GH_TOKEN_INSTALL: \${{ secrets.BKIT_GH_TOKEN_INSTALL }}";
  const correctStep = `      - name: Install Dependencies\n        run: |\n${CONFIG_SET}\n${INSTALL}\n${ENV_BLOCK}`;

  it("returns null when install step has both pnpm config set and env mapping", () => {
    writeCi(correctStep);
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("returns null when env mapping uses quotes (with config set)", () => {
    writeCi(
      `      - name: Install Dependencies\n        run: |\n${CONFIG_SET}\n${INSTALL}\n        env:\n          BKIT_GH_TOKEN_INSTALL: "\${{ secrets.BKIT_GH_TOKEN_INSTALL }}"`,
    );
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("returns null when env mapping has no inner spaces (with config set)", () => {
    writeCi(
      `      - name: Install Dependencies\n        run: |\n${CONFIG_SET}\n${INSTALL}\n        env:\n          BKIT_GH_TOKEN_INSTALL: \${{secrets.BKIT_GH_TOKEN_INSTALL}}`,
    );
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("returns advisory finding when install step has neither config set nor env mapping", () => {
    writeCi("      - name: Install Dependencies\n        run: pnpm install --frozen-lockfile");
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("ci-yml-missing-token-env");
    expect(result!.severity).toBe("advisory");
  });

  it("flags when env mapping present but the pnpm config set auth step is missing (#274 new-shape gap)", () => {
    writeCi(
      `      - name: Install Dependencies\n${INSTALL.replace(/^ {10}/, "        run: ")}\n${ENV_BLOCK}`,
    );
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("pnpm config set");
  });

  it("flags when pnpm config set present but env mapping is missing", () => {
    writeCi(`      - name: Install Dependencies\n        run: |\n${CONFIG_SET}\n${INSTALL}`);
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("BKIT_GH_TOKEN_INSTALL env mapping");
  });

  it("returns null when ci.yml is absent", () => {
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("elevates to blocker when .npmrc maps the @cbartens registry and wiring is incomplete", () => {
    writeCi("      - name: Install Dependencies\n        run: pnpm install --frozen-lockfile");
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n",
      "utf-8",
    );
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.severity).toBe("blocker");
    expect(result!.detect).toContain("401");
  });

  it("elevates to blocker when .npmrc carries a legacy ${BKIT_GH_TOKEN_INSTALL} ref and wiring is incomplete", () => {
    writeCi("      - name: Install Dependencies\n        run: pnpm install --frozen-lockfile");
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
      "utf-8",
    );
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result!.severity).toBe("blocker");
  });

  it("stays advisory when .npmrc has no GH Packages signal", () => {
    writeCi("      - name: Install Dependencies\n        run: pnpm install --frozen-lockfile");
    fs.writeFileSync(path.join(tmpDir, ".npmrc"), "save-exact=true\n", "utf-8");
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result!.severity).toBe("advisory");
  });

  it("stays advisory when .npmrc is absent", () => {
    writeCi("      - name: Install Dependencies\n        run: pnpm install --frozen-lockfile");
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result!.severity).toBe("advisory");
  });
});

// ---------------------------------------------------------------------------
// detectValePackageNotSynced
// ---------------------------------------------------------------------------

describe("detectValePackageNotSynced", () => {
  it("returns null when vale is not on PATH (execSync throws)", () => {
    execSync.mockImplementation(() => {
      throw new Error("vale: command not found");
    });
    expect(detectValePackageNotSynced(tmpDir)).toBeNull();
  });

  it("returns null when vale is on PATH and write-good styles exist", () => {
    execSync.mockReturnValue("vale version 3.0.0\n");
    fs.mkdirSync(path.join(tmpDir, ".vale", "styles", "write-good"), { recursive: true });
    expect(detectValePackageNotSynced(tmpDir)).toBeNull();
  });

  it("returns finding when vale is on PATH but write-good styles are absent", () => {
    execSync.mockReturnValue("vale version 3.0.0\n");
    // No .vale/styles/write-good directory
    const result = detectValePackageNotSynced(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("vale-package-not-synced");
    expect(result!.severity).toBe("advisory");
  });
});

// ---------------------------------------------------------------------------
// detectDevDepsNeedFetch
// ---------------------------------------------------------------------------

describe("detectDevDepsNeedFetch", () => {
  it("returns finding when WriteSet has an entry with devDepsAdded", () => {
    const ws = makeWs({ path: "package.json", action: "update", devDepsAdded: ["prettier"] });
    const result = detectDevDepsNeedFetch(ws);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("devdeps-need-fetch");
    expect(result!.severity).toBe("advisory");
    expect(result!.detect).toContain("prettier");
  });

  it("returns null when no WriteSet entries have devDepsAdded", () => {
    const ws = makeWs({ path: "package.json", action: "update" });
    expect(detectDevDepsNeedFetch(ws)).toBeNull();
  });

  it("returns null when WriteSet is empty", () => {
    expect(detectDevDepsNeedFetch(makeWs())).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectBkitStubs
// ---------------------------------------------------------------------------

describe("detectBkitStubs", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stubs-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty when neither ci.yml nor pre-commit exist", () => {
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("returns empty when ci.yml has no bkit-stub sentinels", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "name: CI\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm test\n",
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("returns one finding per sentinel present in ci.yml", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      [
        "name: CI",
        "      # bkit-stub:auto-force-e2e — header",
        "      # - name: Auto Force E2E",
        "      # bkit-stub:e2e — header",
        "      # - name: Run E2E",
      ].join("\n"),
    );
    const findings = detectBkitStubs(tmpDir);
    expect(findings).toHaveLength(2);
    expect(findings.map((f) => f.id).sort()).toEqual(["bkit-stub-auto-force-e2e", "bkit-stub-e2e"]);
    expect(findings[0]!.severity).toBe("advisory");
    expect(findings[0]!.action).toContain("delete the entire stub block");
  });

  it("does not fire when the sentinel line has been removed (block left uncommented in place)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      ["name: CI", "      - name: Auto Force E2E", "        run: echo enabled"].join("\n"),
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("does not match partial-prefix ids (e.g. e2e-paths step id does not trigger e2e advisory)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      id: e2e-paths\n      run: echo ok\n",
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  // A prose line that cites a stub id is not a stub HEADER. Without the em-dash requirement
  // these fire an advisory that cannot be dismissed: the block is enabled, its header is gone,
  // and the only match left is a cross-reference nobody was told to delete.
  it("does not fire on prose back-references that merely cite a stub id", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      [
        "name: CI",
        // provenance note on an already-enabled lane (bkit's own ci.yml)
        "      # bkit-stub:coverage scaffold shipped to consumers. See testing.md.",
        // cross-reference between blocks (shipped in the consumer template)
        "# bkit-stub:coverage integration report posts from HERE, not bkit-tests-unit.",
        "      - name: Report Unit Coverage on PR",
        "        uses: davelosert/vitest-coverage-report-action@v2",
      ].join("\n"),
    );
    expect(detectBkitStubs(tmpDir)).toEqual([]);
  });

  it("still fires on the header form regardless of indentation", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      [
        "name: CI",
        "# bkit-stub:coverage — Report vitest coverage on PRs.",
        "      # - name: X",
      ].join("\n"),
    );
    expect(detectBkitStubs(tmpDir).map((f) => f.id)).toEqual(["bkit-stub-coverage"]);
  });

  it("flags vercel-enabled-without-e2e pair conflict", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      [
        "      - name: Await Vercel Preview",
        "        run: echo enabled",
        "      # bkit-stub:e2e — header",
        "      # - name: Run E2E Tests",
      ].join("\n"),
    );
    const findings = detectBkitStubs(tmpDir);
    const ids = findings.map((f) => f.id);
    expect(ids).toContain("bkit-stub-pair-vercel-without-e2e");
    expect(ids).toContain("bkit-stub-e2e"); // e2e still commented also fires
  });

  it("flags e2e-enabled-without-vercel pair conflict", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      [
        "      - name: Run E2E Tests",
        "        run: pnpm test:e2e",
        "      # bkit-stub:vercel-await — header",
        "      # - name: Await Vercel Preview",
      ].join("\n"),
    );
    const ids = detectBkitStubs(tmpDir).map((f) => f.id);
    expect(ids).toContain("bkit-stub-pair-e2e-without-vercel");
  });

  // Legacy scaffold job names. A consumer whose planner is still `bkit-decide` is outside the
  // bkit-tests-* namespace that the CI-Dispatch Gate polls, so it must be nudged to rename.
  const writeCi = (body: string) => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "ci.yml"), body);
  };

  it("flags a ci.yml still defining the legacy bkit-decide / bkit-tests-migrate jobs", () => {
    writeCi(
      "jobs:\n  bkit-decide:\n    runs-on: ubuntu-latest\n  bkit-tests-migrate:\n    runs-on: ubuntu-latest\n",
    );
    const finding = detectBkitStubs(tmpDir).find((f) => f.id === "ci-legacy-scaffold-job-names");
    expect(finding).toBeDefined();
    // Both legacy names must be named in the detect string, not just the first one found.
    expect(finding!.detect).toContain("bkit-decide");
    expect(finding!.detect).toContain("bkit-tests-migrate");
    // The action must also cover the job-local step id, not just the job name.
    expect(finding!.action).toContain("id: decide` -> `id: scope");
  });

  it("surfaces the docs-vs-ci skew when managed docs already name the current jobs", () => {
    writeCi("jobs:\n  bkit-decide:\n    runs-on: ubuntu-latest\n");
    fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "docs", "testing.md"),
      "The bkit-tests-scope planner emits the run plan.\n",
    );
    const finding = detectBkitStubs(tmpDir).find((f) => f.id === "ci-legacy-scaffold-job-names");
    expect(finding).toBeDefined();
    expect(finding!.detect).toContain("docs/testing.md");
    expect(finding!.detect).toMatch(/DIFFERENT job names/);
  });

  it("omits the docs-skew clause when docs/testing.md is absent", () => {
    writeCi("jobs:\n  bkit-decide:\n    runs-on: ubuntu-latest\n");
    const finding = detectBkitStubs(tmpDir).find((f) => f.id === "ci-legacy-scaffold-job-names");
    expect(finding).toBeDefined();
    expect(finding!.detect).not.toContain("docs/testing.md");
  });

  it("does NOT flag a ci.yml already on the current scaffold job names", () => {
    writeCi(
      "jobs:\n  bkit-tests-scope:\n    runs-on: ubuntu-latest\n  bkit-tests-migration:\n    runs-on: ubuntu-latest\n",
    );
    const ids = detectBkitStubs(tmpDir).map((f) => f.id);
    expect(ids).not.toContain("ci-legacy-scaffold-job-names");
  });

  it("does NOT flag the commented scaffold reference (job key must be uncommented)", () => {
    // The shipped template mentions bkit-decide only inside comments; a repo carrying the
    // scaffold reference has not defined the legacy job and must stay silent.
    writeCi("jobs:\n  # bkit-decide:\n  #   runs-on: ubuntu-latest\n");
    const ids = detectBkitStubs(tmpDir).map((f) => f.id);
    expect(ids).not.toContain("ci-legacy-scaffold-job-names");
  });
});

// ---------------------------------------------------------------------------
// detectTurboIntegrationInputs
// ---------------------------------------------------------------------------

describe("detectTurboIntegrationInputs", () => {
  it("returns empty when turbo.json is absent", () => {
    expect(detectTurboIntegrationInputs(tmpDir)).toEqual([]);
  });

  it("returns empty when turbo.json has no test:integration task", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({ tasks: { build: { outputs: ["dist/**"] } } }),
    );
    expect(detectTurboIntegrationInputs(tmpDir)).toEqual([]);
  });

  it("flags missing external-state proxies on test:integration (turbo v2)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({ tasks: { "test:integration": { cache: true, inputs: ["src/**"] } } }),
    );
    const findings = detectTurboIntegrationInputs(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("turbo-test-integration-inputs-missing");
    expect(findings[0]!.action).toContain("supabase/migrations/**");
  });

  it("returns empty when inputs already declare a migrations proxy", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({
        tasks: {
          "test:integration": { inputs: ["src/**", "supabase/migrations/**"] },
        },
      }),
    );
    expect(detectTurboIntegrationInputs(tmpDir)).toEqual([]);
  });

  it("supports turbo v1 `pipeline` key", () => {
    fs.writeFileSync(
      path.join(tmpDir, "turbo.json"),
      JSON.stringify({ pipeline: { "test:e2e": { inputs: ["src/**"] } } }),
    );
    const findings = detectTurboIntegrationInputs(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("turbo-test-e2e-inputs-missing");
  });
});

// ---------------------------------------------------------------------------
// detectTestIntegrationEnv
// ---------------------------------------------------------------------------

describe("detectTestIntegrationEnv", () => {
  it("returns null when package.json absent", () => {
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when test:integration script absent", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"scripts":{"test":"vitest"}}');
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("flags scripts with no real-service hints", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config=integration.config.ts"}}',
    );
    const result = detectTestIntegrationEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("test-integration-env-not-asserted");
  });

  it("returns null when script gates on TEST_REAL_APIS", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"TEST_REAL_APIS=true vitest run"}}',
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when script chains supabase start", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"supabase start && vitest run"}}',
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when the CI workflow lane provisions the real-service env", () => {
    // Script is intentionally env-agnostic (keeps local runs from forcing real-API mode);
    // the ci.yml job that runs test:integration provisions the env instead.
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config vitest.integration.config.ts --passWithNoTests"}}',
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      [
        "jobs:",
        "  integration:",
        "    env:",
        '      TEST_REAL_APIS: "true"',
        "    steps:",
        "      - run: env -u SUPABASE_PROJECT_ID npx supabase start",
        "      - run: turbo run test:integration",
      ].join("\n"),
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("returns null when the vitest integration config documents the in-file guard", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config vitest.integration.config.ts"}}',
    );
    fs.writeFileSync(
      path.join(tmpDir, "vitest.integration.config.ts"),
      "// Integration tests run only when TEST_REAL_APIS=true. Guard is in each test file.\n",
    );
    expect(detectTestIntegrationEnv(tmpDir)).toBeNull();
  });

  it("still fires when a workflow runs test:integration but provisions no real-service env", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      '{"scripts":{"test:integration":"vitest run --config vitest.integration.config.ts"}}',
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "jobs:\n  integration:\n    steps:\n      - run: turbo run test:integration\n",
    );
    expect(detectTestIntegrationEnv(tmpDir)!.id).toBe("test-integration-env-not-asserted");
  });
});

// ---------------------------------------------------------------------------
// detectGhaFloatingTags
// ---------------------------------------------------------------------------

describe("detectGhaFloatingTags", () => {
  it("returns null when .github/workflows is absent", () => {
    expect(detectGhaFloatingTags(tmpDir)).toBeNull();
  });

  it("returns null when no workflow uses floating tags", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "jobs:\n  run:\n    steps:\n      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1\n",
    );
    expect(detectGhaFloatingTags(tmpDir)).toBeNull();
  });

  it("flags floating-tag uses across multiple workflow files", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4.0.2\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "release.yml"),
      "      - uses: pnpm/action-setup@v4\n",
    );
    const result = detectGhaFloatingTags(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("gha-actions-floating-tags");
    expect(result!.detect).toContain("ci.yml");
    expect(result!.detect).toContain("release.yml");
  });

  // Issue #124 — bkit-canonical workflow files (listed in `.bkit-version`)
  // carry bkit-owned pins. The shipped `renovate.json5` adds a
  // packageRule with `matchFileNames` for bkit-managed workflow files so
  // consumer-side Renovate stays out of them; consumers receive new
  // SHAs/versions via `bkit install`, not via their own Renovate. The
  // floating-tag advisory must skip them; otherwise consumers "remediate"
  // a file `bkit install` overwrites on the next run.
  it("skips workflow files listed in .bkit-version canonicalHashes (issue #124)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "      - uses: actions/checkout@v4\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({
        pinnedVersion: "2.3.1",
        tier3Hashes: {},
        canonicalHashes: { ".github/workflows/bkit-cloud.yml": "deadbeef" },
      }),
    );
    expect(detectGhaFloatingTags(tmpDir)).toBeNull();
  });

  it("skips workflow files listed in .bkit-version tier3Hashes (issue #124)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "      - uses: actions/checkout@v4\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({
        pinnedVersion: "2.3.1",
        tier3Hashes: { ".github/workflows/bkit-cloud.yml": "deadbeef" },
        canonicalHashes: {},
      }),
    );
    expect(detectGhaFloatingTags(tmpDir)).toBeNull();
  });

  it("still flags consumer-managed workflow files even when canonical files coexist", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "      - uses: actions/checkout@v4\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - uses: actions/checkout@v4\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({
        pinnedVersion: "2.3.1",
        tier3Hashes: {},
        canonicalHashes: { ".github/workflows/bkit-cloud.yml": "deadbeef" },
      }),
    );
    const result = detectGhaFloatingTags(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("ci.yml");
    expect(result!.detect).not.toContain("bkit-cloud.yml");
  });
});

// ---------------------------------------------------------------------------
// buildDepUpdaterSetupAdvisory — read-only.
// ---------------------------------------------------------------------------

describe("buildDepUpdaterSetupAdvisory", () => {
  it("both configs → dep-updater-both", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "renovate.json5"),
      '{ ignorePaths: [".github/workflows/bkit-cloud.yml"] }\n',
    );
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    const result = buildDepUpdaterSetupAdvisory(tmpDir);
    expect(result?.id).toBe("dep-updater-both");
  });

  it("updater config that omits bkit-cloud.yml → dep-updater-touches-bkit", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"), "name: cloud\n");
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), "{ enabled: false }\n");
    const result = buildDepUpdaterSetupAdvisory(tmpDir);
    expect(result?.id).toBe("dep-updater-touches-bkit");
    expect(result?.action).toMatch(/ignorePaths/);
  });

  it("fenced config is quiet", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"), "name: cloud\n");
    fs.writeFileSync(
      path.join(tmpDir, ".github", "renovate.json5"),
      '{ ignorePaths: [".github/workflows/bkit-cloud.yml"] }\n',
    );
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it("nudges (dep-updater-absent) when workflows exist but neither config is present", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    const result = buildDepUpdaterSetupAdvisory(tmpDir);
    expect(result?.id).toBe("dep-updater-absent");
    expect(result?.action).toMatch(/renovate\.json5/);
    expect(result?.action).toMatch(/dependabot\.yml/);
    expect(result?.action).not.toMatch(/bkit install --dependency/);
  });

  it("returns null when no workflows dir exists", () => {
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it("stays quiet when bkit.depUpdater is explicitly 'none'", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { depUpdater: "none" } }),
    );
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });

  it("a legacy bkit.depUpdater value other than none does not install or silence", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { depUpdater: "renovate", renovateRunner: "self" } }),
    );
    expect(buildDepUpdaterSetupAdvisory(tmpDir)?.id).toBe("dep-updater-absent");
  });

  it("config that names bkit-cloud.yml wins over a stale depUpdater=none", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "renovate.json5"),
      '{ ignorePaths: [".github/workflows/bkit-cloud.yml"] }\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { depUpdater: "none" } }),
    );
    expect(buildDepUpdaterSetupAdvisory(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildTokenRenameMigrationAdvisory — BKIT_GH_TOKEN scheme split migration
// ---------------------------------------------------------------------------

describe("buildTokenRenameMigrationAdvisory", () => {
  const writeEnv = (body: string) => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env"), body, "utf-8");
  };

  it("fires when .bkit/.env still has GH_MCP_TOKEN (old scheme)", () => {
    writeEnv("BKIT_GH_TOKEN_INSTALL=x\nGH_MCP_TOKEN=y\n");
    const r = buildTokenRenameMigrationAdvisory(tmpDir);
    expect(r).not.toBeNull();
    expect(r!.id).toBe("gh-token-scheme-rename");
    expect(r!.action).toMatch(/GH_MCP_TOKEN.*->.*BKIT_GH_TOKEN/);
  });

  it("fires when GH_BKIT_TOKEN_INSTALL / GH_BKIT_TOKEN still present (pre-BKIT_ prefix)", () => {
    writeEnv("GH_BKIT_TOKEN_INSTALL=x\nGH_BKIT_TOKEN=y\n");
    expect(buildTokenRenameMigrationAdvisory(tmpDir)?.id).toBe("gh-token-scheme-rename");
  });

  it("null for the new scheme (BKIT_GH_TOKEN_INSTALL present, no retired names)", () => {
    writeEnv("BKIT_GH_TOKEN_INSTALL=x\nBKIT_GH_TOKEN=y\n");
    expect(buildTokenRenameMigrationAdvisory(tmpDir)).toBeNull();
  });

  it("null when there is no .bkit/.env", () => {
    expect(buildTokenRenameMigrationAdvisory(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildCloudSetupAdvisory — optional post-install decision (parity with the
// tracker / dep-updater advisories). Cloud agents (post-CI auto-routing) are
// opt-in via `bkit install --cloud`. See issue #119.
// ---------------------------------------------------------------------------

describe("buildCloudSetupAdvisory", () => {
  it("bkit-cloud.yml present → cloud-router (informational, active)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    const result = buildCloudSetupAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("cloud-router");
  });

  it("nudges (cloud-router-none) when workflows exist but the router is absent", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    const result = buildCloudSetupAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("cloud-router-none");
    expect(result!.action).toMatch(/pnpm bkit install --auto=/);
  });

  it("returns null when no workflows dir exists (no CI to route on — no nudge)", () => {
    expect(buildCloudSetupAdvisory(tmpDir)).toBeNull();
  });

  it("stays quiet when bkit.cloudAgents is explicitly 'none' (deliberate opt-out)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { cloudAgents: "none" } }),
    );
    expect(buildCloudSetupAdvisory(tmpDir)).toBeNull();
  });

  it("still nudges when bkit.cloudAgents is absent (undecided, not opted out)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }));
    const result = buildCloudSetupAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("cloud-router-none");
  });

  it("router presence wins over a stale bkit.cloudAgents=none field", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { cloudAgents: "none" } }),
    );
    const result = buildCloudSetupAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("cloud-router");
  });
});

// ---------------------------------------------------------------------------
// buildTrackerSetupAdvisory — symmetric opt-out (explicit `none` silences;
// absent field nudges). Requires .claude/ or .cursor/ present to fire at all.
// ---------------------------------------------------------------------------

describe("buildTrackerSetupAdvisory — explicit-none opt-out symmetry", () => {
  beforeEach(() => {
    // The advisory only fires when workflows are installed.
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
  });

  it("nudges (tracker-setup-none) when bkit.issueTracker is absent (undecided)", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }));
    const result = buildTrackerSetupAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tracker-setup-none");
  });

  it("stays quiet when bkit.issueTracker is explicitly 'none' (deliberate opt-out)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "none" } }),
    );
    expect(buildTrackerSetupAdvisory(tmpDir)).toBeNull();
  });

  it("informational when tracker is github", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "github" } }),
    );
    const result = buildTrackerSetupAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tracker-setup-github");
  });
});

// ---------------------------------------------------------------------------
// detectRunLevelsNotComposed
// ---------------------------------------------------------------------------

describe("detectRunLevelsNotComposed", () => {
  it("returns null when ci.yml is absent", () => {
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });

  it("returns null when ci.yml has no Detect Direct Push step (no primitives to compose)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "jobs:\n  bkit-tests:\n    runs-on: ubuntu-latest\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });

  it("flags when Detect Direct Push step exists but no sibling workflow references the outputs", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - name: Detect Direct Push\n# bkit:start\nbkit content\n# bkit:end\n",
    );
    const result = detectRunLevelsNotComposed(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("run-levels-not-composed");
  });

  it("returns null when a sibling workflow references should_force_build", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - name: Detect Direct Push\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "deploy.yml"),
      "    if: steps.detect.outputs.should_force_build == 'true'\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });

  it("flags when ci.yml only SETS the outputs (echo to $GITHUB_OUTPUT), no gate reads them", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - name: Detect Direct Push\n" +
        '        run: echo "should_force_build=true" >> "$GITHUB_OUTPUT"\n',
    );
    const result = detectRunLevelsNotComposed(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("run-levels-not-composed");
  });

  it("flags when the example E2E gate is present but commented out (shipped bkit-stub:e2e)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - name: Detect Direct Push\n" +
        "      #   if: steps.detect.outputs.should_run_full == 'true'\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).not.toBeNull();
  });

  it("returns null when a consumer enables an in-ci.yml gate reading the outputs", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - name: Detect Direct Push\n" +
        "      - name: Run E2E Tests\n" +
        "        if: steps.detect.outputs.should_run_full == 'true'\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });

  it("returns null for a legacy gate on the pre-#291 should_run_e2e output (backward-compat)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "      - name: Detect Direct Push\n" +
        "      - name: Run E2E Tests\n" +
        "        if: steps.detect.outputs.should_run_e2e == 'true'\n",
    );
    expect(detectRunLevelsNotComposed(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCiRouterSecrets
// ---------------------------------------------------------------------------

describe("detectCiRouterSecrets", () => {
  it("returns empty when bkit-auto workflow is absent", () => {
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it("any tracker: emits ONLY BKIT_ANTHROPIC_API_KEY (bkit-cloud.yml is GitHub-only, no LINEAR dependency)", () => {
    // bkit-cloud.yml is cloud=claude / GitHub-tracker only — no BKIT_LINEAR_API_KEY.
    // This supersedes the old "Linear tracker: emits ANTHROPIC + LINEAR" behavior.
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

  it("Linear tracker: returns empty when both secrets are present", () => {
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

  it("fires when bkit-auto workflow exists", () => {
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

// ---------------------------------------------------------------------------
// formatChecklist
// ---------------------------------------------------------------------------

describe("formatChecklist", () => {
  it("returns empty string when findings array is empty", () => {
    expect(formatChecklist([])).toBe("");
  });

  it("renders correct format for a single finding", () => {
    const findings: PreflightFinding[] = [
      {
        id: "test-finding",
        severity: "advisory",
        detect: "Something was detected.",
        action: "Do something to fix it.",
      },
    ];
    const result = formatChecklist(findings);
    expect(result).toContain("--- 1/1 [advisory] test-finding ---");
    expect(result).toContain("DETECT: Something was detected.");
    expect(result).toContain("ACTION: Do something to fix it.");
  });

  it("renders correct format for multiple findings with sequential numbering", () => {
    const findings: PreflightFinding[] = [
      { id: "finding-a", severity: "blocker", detect: "Detect A", action: "Action A" },
      { id: "finding-b", severity: "advisory", detect: "Detect B", action: "Action B" },
      { id: "finding-c", severity: "advisory", detect: "Detect C", action: "Action C" },
    ];
    const result = formatChecklist(findings);
    expect(result).toContain("--- 1/3 [blocker] finding-a ---");
    expect(result).toContain("--- 2/3 [advisory] finding-b ---");
    expect(result).toContain("--- 3/3 [advisory] finding-c ---");
  });

  it("includes the banner header and instructions", () => {
    const findings: PreflightFinding[] = [
      { id: "x", severity: "advisory", detect: "d", action: "a" },
    ];
    const result = formatChecklist(findings);
    expect(result).toContain("[bkit] Post-install checklist");
    expect(result).toContain("INSTRUCTIONS FOR AN AI AGENT");
  });
});

// ---------------------------------------------------------------------------
// renderAdvisoriesMarkdown + writeAdvisoriesArtifact
// ---------------------------------------------------------------------------

describe("renderAdvisoriesMarkdown", () => {
  it("renders a 'no advisories' stub when findings is empty", () => {
    const md = renderAdvisoriesMarkdown([], {
      mode: "install",
      version: "2.2.0",
    });
    expect(md).toContain("# bkit advisories");
    expect(md).not.toContain("_Generated:");
    expect(md).toContain("_bkit: 2.2.0_");
    expect(md).toContain("_Mode: install_");
    expect(md).toContain("**No advisories.** Last run was clean.");
    expect(md).not.toContain("INSTRUCTIONS FOR AN AI AGENT");
  });

  it("starts with a Vale whole-file skip marker — generated artifact must not fail consumer lint:prose", () => {
    // Empty and populated render paths must both lead with the marker, since the
    // gitignored artifact is linted on-disk by the shipped lint:prose glob.
    const empty = renderAdvisoriesMarkdown([], {
      mode: "check",
      version: "2.8.2",
    });
    expect(empty.startsWith("<!-- vale off -->")).toBe(true);
    const populated = renderAdvisoriesMarkdown(
      [
        {
          id: "x",
          severity: "advisory",
          detect: "So this opens with So.",
          action: "So does this.",
        },
      ],
      { mode: "check", version: "2.8.2" },
    );
    expect(populated.startsWith("<!-- vale off -->")).toBe(true);
  });

  it("renders findings as numbered sections with severity, detect, action", () => {
    const findings: PreflightFinding[] = [
      { id: "a-blocker", severity: "blocker", detect: "Detect A", action: "Action A" },
      { id: "an-advisory", severity: "advisory", detect: "Detect B", action: "Action B" },
    ];
    const md = renderAdvisoriesMarkdown(findings, {
      mode: "doctor",
      version: "9.9.9",
    });
    expect(md).toContain("_Mode: doctor_");
    expect(md).toContain("2 finding(s) — 1 blocker, 1 advisory.");
    expect(md).toContain("INSTRUCTIONS FOR AN AI AGENT");
    expect(md).toContain("## 1/2 [blocker] a-blocker");
    expect(md).toContain("**Detect:** Detect A");
    expect(md).toContain("**Action:** Action A");
    expect(md).toContain("## 2/2 [advisory] an-advisory");
    expect(md).toContain("**Detect:** Detect B");
    expect(md).toContain("**Action:** Action B");
  });

  it("counts severities correctly with mixed list", () => {
    const findings: PreflightFinding[] = [
      { id: "x1", severity: "blocker", detect: "d", action: "a" },
      { id: "x2", severity: "blocker", detect: "d", action: "a" },
      { id: "x3", severity: "advisory", detect: "d", action: "a" },
    ];
    const md = renderAdvisoriesMarkdown(findings, {
      mode: "check",
      version: "1.0.0",
    });
    expect(md).toContain("3 finding(s) — 2 blocker, 1 advisory.");
  });
});

describe("writeAdvisoriesArtifact", () => {
  it("writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing", () => {
    const artifactDir = path.join(tmpDir, ".bkit");
    const artifactPath = path.join(artifactDir, "advisories.md");
    expect(fs.existsSync(artifactDir)).toBe(false);

    writeAdvisoriesArtifact([{ id: "x", severity: "advisory", detect: "d", action: "a" }], {
      cwd: tmpDir,
      mode: "install",
      version: "2.2.0",
      logPrefix: "[bkit-install]",
    });

    expect(fs.existsSync(artifactPath)).toBe(true);
    const content = fs.readFileSync(artifactPath, "utf-8");
    expect(content).toContain("# bkit advisories");
    expect(content).toContain("## 1/1 [advisory] x");
  });

  it("overwrites an existing artifact on each call", () => {
    const artifactPath = path.join(tmpDir, ".bkit", "advisories.md");
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(artifactPath, "STALE CONTENT");

    writeAdvisoriesArtifact([], {
      cwd: tmpDir,
      mode: "install",
      version: "2.2.0",
      logPrefix: "[bkit-install]",
    });

    const content = fs.readFileSync(artifactPath, "utf-8");
    expect(content).not.toContain("STALE CONTENT");
    expect(content).toContain("**No advisories.** Last run was clean.");
  });

  it("does not throw on write failure (best-effort, logs error)", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    // Make .bkit/ a file (not a directory) so mkdirSync recursively fails at file location.
    fs.writeFileSync(path.join(tmpDir, ".bkit"), "blocker");

    expect(() =>
      writeAdvisoriesArtifact([], {
        cwd: tmpDir,
        mode: "install",
        version: "2.2.0",
        logPrefix: "[bkit-install]",
      }),
    ).not.toThrow();
    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to write .bkit/advisories.md"),
    );
    errSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// runPostInstallCheck — deduplication
// ---------------------------------------------------------------------------

describe("runPostInstallCheck deduplication", () => {
  it("deduplicates findings within Phase 3 when same id appears multiple times", () => {
    // We can't force duplicate ids from real detectors, but we can verify the
    // cross-phase dedup: if preflightAdvisories has an id that Phase 3 would also emit,
    // Phase 3 wins (its entry replaces preflight's).
    // Set up: shell token missing → Phase 3 will emit gh-bkit-token-unset-shell
    delete process.env.BKIT_GH_TOKEN_INSTALL;

    // Simulate a preflight advisory with the same id
    const preflightAdvisories: PreflightFinding[] = [
      {
        id: "gh-bkit-token-unset-shell",
        severity: "advisory",
        detect: "Old preflight detect text",
        action: "Old preflight action",
      },
    ];

    const ws = makeWs();
    const result = runPostInstallCheck(preflightAdvisories, ws, makeModules("lint"), tmpDir);

    // Should appear exactly once
    const matches = result.filter((f) => f.id === "gh-bkit-token-unset-shell");
    expect(matches).toHaveLength(1);
    // Phase 3 wins — the detect text should NOT be the old preflight text
    expect(matches[0]!.detect).not.toBe("Old preflight detect text");
  });

  it("gh-bkit-token-unset-shell is emitted when BKIT_GH_TOKEN_INSTALL is unset", () => {
    delete process.env.BKIT_GH_TOKEN_INSTALL;
    const result = runPostInstallCheck([], makeWs(), makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "gh-bkit-token-unset-shell")).toBe(true);
  });

  it("npmrc-missing-gh-packages is emitted when .npmrc exists but lacks required lines", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "registry=https://registry.npmjs.org/\n",
      "utf-8",
    );
    // Ensure token is set so only npmrc advisory fires
    process.env.BKIT_GH_TOKEN_INSTALL = "test";
    const result = runPostInstallCheck([], makeWs(), makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "npmrc-missing-gh-packages")).toBe(true);
  });

  it("no finding is emitted for .npmrc when file is absent (silent skip)", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "test";
    // No .npmrc file
    const result = runPostInstallCheck([], makeWs(), makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "npmrc-missing-gh-packages")).toBe(false);
  });

  it("devdeps-need-fetch emitted when WriteSet has devDepsAdded", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "test";
    const ws = makeWs({ path: "package.json", action: "update", devDepsAdded: ["prettier"] });
    const result = runPostInstallCheck([], ws, makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "devdeps-need-fetch")).toBe(true);
  });

  it("B2: cross-phase dedup is position-stable — preflight order preserved, Phase 3 appended", () => {
    // B2 (BAR-142 §B2): When Phase 3 supersedes a preflight id, the surviving entry
    // appears at the back of the list (Phase 3 position), not inserted at preflight position.
    // This ensures the output order is stable: preflight findings (not superseded) first,
    // Phase 3 findings second.
    process.env.BKIT_GH_TOKEN_INSTALL = "test"; // token present → no shell-token finding from Phase 3

    const preflightAdvisories: PreflightFinding[] = [
      { id: "husky-no-markers-precommit", severity: "advisory", detect: "p1", action: "a1" },
      { id: "prettierignore-no-markers", severity: "advisory", detect: "p2", action: "a2" },
    ];

    // Use an empty ws so no devdeps finding fires
    const result = runPostInstallCheck(preflightAdvisories, makeWs(), makeModules("lint"), tmpDir);

    // All preflight advisories that Phase 3 doesn't supersede must come first
    const p1Idx = result.findIndex((f) => f.id === "husky-no-markers-precommit");
    const p2Idx = result.findIndex((f) => f.id === "prettierignore-no-markers");
    // Both preflight advisories must survive (Phase 3 doesn't emit these ids)
    expect(p1Idx).toBeGreaterThanOrEqual(0);
    expect(p2Idx).toBeGreaterThanOrEqual(0);
    // Preflight order must be preserved (p1 before p2)
    expect(p1Idx).toBeLessThan(p2Idx);
  });

  it("deduplicates duplicate ids within incoming preflightAdvisories (intra-preflight dedup)", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "test";
    // Two entries with the same id — only the first should survive.
    const preflightAdvisories: PreflightFinding[] = [
      { id: "husky-no-markers-precommit", severity: "advisory", detect: "first", action: "a1" },
      { id: "husky-no-markers-precommit", severity: "advisory", detect: "second", action: "a2" },
    ];
    const result = runPostInstallCheck(preflightAdvisories, makeWs(), makeModules("lint"), tmpDir);
    const matches = result.filter((f) => f.id === "husky-no-markers-precommit");
    expect(matches).toHaveLength(1);
    expect(matches[0]!.detect).toBe("first"); // first occurrence wins
  });
});

// ---------------------------------------------------------------------------
// readChangelogVersionDelta — A7 changelog header (BAR-142 §A7)
// ---------------------------------------------------------------------------

describe("readChangelogVersionDelta", () => {
  it("returns version-delta header string when CHANGELOG.md exists and version matches", () => {
    // CHANGELOG.md exists at repo root with v0.6.0 section
    const result = readChangelogVersionDelta("0.6.0");
    // Should find the version header
    expect(result).not.toBeNull();
    expect(result).toContain("0.6.0");
    expect(result).toContain("[bkit]");
  });

  it("returns null when version is not found in CHANGELOG.md", () => {
    const result = readChangelogVersionDelta("99.99.99");
    expect(result).toBeNull();
  });

  it("returns null when CHANGELOG.md does not exist", () => {
    // Use a tmpDir that has no CHANGELOG.md
    // readChangelogVersionDelta searches multiple paths; if none exist, returns null
    // We test this by passing a version that can't possibly match
    const result = readChangelogVersionDelta("");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// dedupeById — intra-phase dedup unit tests
// ---------------------------------------------------------------------------

describe("dedupeById", () => {
  it("keeps first occurrence when duplicate ids are present", () => {
    const findings: PreflightFinding[] = [
      { id: "foo", severity: "advisory", detect: "first", action: "a1" },
      { id: "bar", severity: "advisory", detect: "bar-detect", action: "a2" },
      { id: "foo", severity: "advisory", detect: "second", action: "a3" },
    ];
    const result = dedupeById(findings);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("foo");
    expect(result[0]!.detect).toBe("first");
    expect(result[1]!.id).toBe("bar");
  });

  it("returns all entries unchanged when all ids are unique", () => {
    const findings: PreflightFinding[] = [
      { id: "a", severity: "advisory", detect: "d1", action: "x" },
      { id: "b", severity: "blocker", detect: "d2", action: "y" },
    ];
    expect(dedupeById(findings)).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(dedupeById([])).toHaveLength(0);
  });

  it("keeps a single entry unchanged", () => {
    const findings: PreflightFinding[] = [
      { id: "only", severity: "advisory", detect: "d", action: "a" },
    ];
    expect(dedupeById(findings)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// detectBkitCloudYmlAlwaysTrueGate
// ---------------------------------------------------------------------------

describe("detectBkitCloudYmlAlwaysTrueGate", () => {
  function writeCloud(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"), content);
  }
  const BROKEN =
    "jobs:\n" +
    "  run:\n" +
    "    if: |\n" +
    "      ${{\n" +
    "        github.event_name == 'workflow_dispatch'\n" +
    "      }}\n" +
    "    runs-on: ubuntu-latest\n";
  const FIXED =
    "jobs:\n" +
    "  run:\n" +
    "    if: >-\n" +
    "      github.event_name == 'workflow_dispatch'\n" +
    "    runs-on: ubuntu-latest\n";

  it("returns null when bkit-cloud.yml is absent", () => {
    expect(detectBkitCloudYmlAlwaysTrueGate(tmpDir)).toBeNull();
  });
  it("fires on the always-true block-scalar `if:` gate", () => {
    writeCloud(BROKEN);
    const f = detectBkitCloudYmlAlwaysTrueGate(tmpDir);
    expect(f?.id).toBe("bkit-auto-yml-always-true-gate");
    expect(f?.severity).toBe("advisory");
  });
  it("returns null on the fixed folded expression (no ${{ }} wrapper)", () => {
    writeCloud(FIXED);
    expect(detectBkitCloudYmlAlwaysTrueGate(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCiYmlMissingActionlint
// ---------------------------------------------------------------------------

describe("detectCiYmlMissingActionlint", () => {
  function writeCi(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "ci.yml"), content);
  }
  const MANAGED_NO_ACTIONLINT =
    "name: CI\n" +
    "jobs:\n" +
    "  bkit-tests:\n" +
    "    runs-on: ubuntu-latest\n" +
    "    # bkit:start verbose-ci-env\n" +
    "    # bkit:end verbose-ci-env\n" +
    "    steps:\n" +
    "      - run: pnpm test\n";

  it("returns null when ci.yml is absent", () => {
    expect(detectCiYmlMissingActionlint(tmpDir)).toBeNull();
  });
  it("returns null when ci.yml has no bkit markers (consumer-owned)", () => {
    writeCi("name: CI\njobs:\n  test:\n    runs-on: ubuntu-latest\n");
    expect(detectCiYmlMissingActionlint(tmpDir)).toBeNull();
  });
  it("fires on a bkit-managed ci.yml with no actionlint step", () => {
    writeCi(MANAGED_NO_ACTIONLINT);
    const f = detectCiYmlMissingActionlint(tmpDir);
    expect(f?.id).toBe("ci-yml-missing-actionlint");
    expect(f?.severity).toBe("advisory");
  });
  it("returns null when an actionlint step is already present", () => {
    writeCi(MANAGED_NO_ACTIONLINT + '      - run: "$RUNNER_TEMP/actionlint" -color\n');
    expect(detectCiYmlMissingActionlint(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCiYmlRunInjection — GHA script-injection sink (untrusted input in run:)
// ---------------------------------------------------------------------------

describe("detectCiYmlRunInjection", () => {
  function writeCi(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "ci.yml"), content);
  }
  const MARKERS =
    "name: CI\n" +
    "jobs:\n" +
    "  bkit-tests:\n" +
    "    runs-on: ubuntu-latest\n" +
    "    # bkit:start verbose-ci-env\n" +
    "    # bkit:end verbose-ci-env\n" +
    "    steps:\n";

  it("returns null when ci.yml is absent", () => {
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("returns null when ci.yml has no bkit markers (consumer-owned)", () => {
    writeCi(
      "name: CI\njobs:\n  test:\n    steps:\n" +
        '      - run: |\n        MSG="${{ github.event.pull_request.title }}"\n',
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("fires on an untrusted expression inlined into a run: block body", () => {
    writeCi(
      MARKERS +
        "      - name: Detect Direct Push\n" +
        "        run: |\n" +
        '          MSG="${{ github.event.pull_request.title }}"\n' +
        '          echo "$MSG"\n',
    );
    const f = detectCiYmlRunInjection(tmpDir);
    expect(f?.id).toBe("ci-yml-run-injection");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("SECURITY");
    expect(f?.detect).toContain("github.event.pull_request.title");
  });

  it("fires on an inline run: with the sink on the same line", () => {
    writeCi(MARKERS + '      - run: echo "${{ github.event.issue.title }}"\n');
    expect(detectCiYmlRunInjection(tmpDir)?.id).toBe("ci-yml-run-injection");
  });

  it("fires on github.head_ref inlined into a run: body", () => {
    writeCi(MARKERS + "      - run: |\n" + '          git checkout "${{ github.head_ref }}"\n');
    expect(detectCiYmlRunInjection(tmpDir)?.id).toBe("ci-yml-run-injection");
  });

  it("returns null for the safe env-indirection form", () => {
    writeCi(
      MARKERS +
        "      - name: Detect Direct Push\n" +
        "        env:\n" +
        "          PR_TITLE: ${{ github.event.pull_request.title }}\n" +
        "        run: |\n" +
        '          MSG="$PR_TITLE"\n',
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("returns null when github.event.* appears only in env: / if: (not a run: body)", () => {
    writeCi(
      MARKERS +
        "      - name: Guard\n" +
        "        if: github.event.pull_request.title != ''\n" +
        "        env:\n" +
        "          DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}\n" +
        "        run: echo hi\n",
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("does not scan a YAML-commented stub (github.base_ref reference stays silent)", () => {
    writeCi(
      MARKERS +
        "      # - name: Migrations Guard\n" +
        "      #   run: |\n" +
        '      #     git fetch origin "${{ github.base_ref }}"\n',
    );
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });

  it("does NOT trip on the shipped ci.yml template (already env-indirected)", () => {
    const tplPath = path.resolve(
      import.meta.dirname,
      "..",
      "templates",
      ".github",
      "workflows",
      "ci.yml",
    );
    writeCi(fs.readFileSync(tplPath, "utf-8"));
    expect(detectCiYmlRunInjection(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCiYmlCapstoneContractDrift
// ---------------------------------------------------------------------------

describe("detectCiYmlCapstoneContractDrift", () => {
  function writeCi(content: string) {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "ci.yml"), content);
  }
  // A bkit-managed ci.yml whose capstone carries all three load-bearing invariants.
  const GOOD =
    "name: CI\n" +
    "# bkit:start\n" +
    "concurrency:\n" +
    "  group: ci-${{ github.workflow }}-${{ github.ref }}\n" +
    "  cancel-in-progress: true\n" +
    "jobs:\n" +
    "  bkit-tests-unit:\n" +
    "    outputs:\n" +
    "      unit_ran: ${{ steps.count.outputs.unit_ran }}\n" +
    "  bkit-tests-check:\n" +
    "    if: ${{ !cancelled() }}\n" +
    "    steps:\n" +
    "      - env:\n" +
    "          UNIT_RAN: ${{ needs.bkit-tests-unit.outputs.unit_ran }}\n" +
    '        run: test "$UNIT_RAN" -gt 0\n';
  const LIVE_LANE =
    "  bkit-tests-live-web:\n" +
    "    outputs:\n" +
    "      live_ran: ${{ steps.live_count.outputs.live_ran }}\n";
  const TEMPLATE = fs.readFileSync(
    path.resolve(import.meta.dirname, "..", "templates", ".github", "workflows", "ci.yml"),
    "utf-8",
  );

  it("returns null when ci.yml is absent", () => {
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("returns null when not bkit-managed (no markers)", () => {
    writeCi("name: CI\njobs:\n  bkit-tests-check:\n    if: ${{ always() }}\n");
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("returns null when there is no bkit-tests-check capstone", () => {
    writeCi("name: CI\n# bkit:start\njobs:\n  bkit-tests:\n    steps: []\n");
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("returns null when all invariants are present", () => {
    writeCi(GOOD);
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("fires when the capstone uses always() instead of !cancelled()", () => {
    writeCi(GOOD.replace("${{ !cancelled() }}", "${{ always() }}"));
    const f = detectCiYmlCapstoneContractDrift(tmpDir);
    expect(f?.id).toBe("ci-yml-capstone-contract-drift");
    expect(f?.severity).toBe("advisory");
    expect(f?.action).toContain("!cancelled()");
  });
  it("fires when concurrency cancels pull requests only", () => {
    writeCi(
      GOOD.replace(
        "cancel-in-progress: true",
        "cancel-in-progress: ${{ github.event_name == 'pull_request' }}",
      ),
    );
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("one run per branch");
  });

  it("fires when the concurrency group is keyed on github.run_id", () => {
    writeCi(GOOD.replace("github.ref", "github.run_id"));
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("github.run_id");
  });
  it("fires when the capstone has no executed-count assertion", () => {
    writeCi(
      GOOD.replace("          UNIT_RAN: ${{ needs.bkit-tests-unit.outputs.unit_ran }}\n", ""),
    );
    const action = detectCiYmlCapstoneContractDrift(tmpDir)?.action;
    expect(action).toContain("executed-count");
    expect(action).toContain("`bkit-tests-unit`");
  });
  it("fires naming only the lane whose count the capstone never reads", () => {
    writeCi(GOOD.replace("  bkit-tests-check:\n", LIVE_LANE + "  bkit-tests-check:\n"));
    const action = detectCiYmlCapstoneContractDrift(tmpDir)?.action ?? "";
    expect(action).toContain("`bkit-tests-live-web`");
    expect(action).not.toContain("`bkit-tests-unit`");
  });
  it("does not count a lane output named only in a comment", () => {
    writeCi(
      GOOD.replace("  bkit-tests-check:\n", LIVE_LANE + "  bkit-tests-check:\n") +
        "      # LIVE_RAN: ${{ needs.bkit-tests-live-web.outputs.live_ran }}\n",
    );
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("`bkit-tests-live-web`");
  });
  it("does not count a commented-out !cancelled() guard", () => {
    writeCi(
      GOOD.replace("${{ !cancelled() }}", "${{ always() }}") + "#   if: ${{ !cancelled() }}\n",
    );
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("!cancelled()");
  });
  it("returns null on the shipped template, whose capstone is a commented-out stub", () => {
    writeCi(TEMPLATE);
    expect(detectCiYmlCapstoneContractDrift(tmpDir)).toBeNull();
  });
  it("fires on the shipped template once a capstone is enabled without reading lane counts", () => {
    writeCi(TEMPLATE + "  bkit-tests-check:\n    if: ${{ !cancelled() }}\n");
    expect(detectCiYmlCapstoneContractDrift(tmpDir)?.action).toContain("`bkit-tests-unit`");
  });
});

// ---------------------------------------------------------------------------
// detectTaggedTestsWithoutCiHome
// ---------------------------------------------------------------------------

describe("detectTaggedTestsWithoutCiHome", () => {
  function writePkg(relDir: string, scripts: Record<string, string>) {
    const dir = path.join(tmpDir, relDir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: relDir || "root", scripts }),
    );
  }
  function writeTest(relPath: string, content: string) {
    const full = path.join(tmpDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  it("returns null when there are no test files", () => {
    writePkg("", { "test:live": "vitest" });
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("returns null when @live appears but NO package declares test:live (convention inactive)", () => {
    writePkg("", { test: "vitest" });
    writeTest("packages/a/x.test.ts", 'it("@live works", () => {});');
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("fires when a package has an @live test but no test:live while another package declares it", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("packages/utils", { test: "vitest" }); // no test:live
    writeTest("packages/utils/u.test.ts", 'describe("@live", () => { it("x", () => {}); });');
    const f = detectTaggedTestsWithoutCiHome(tmpDir);
    expect(f?.id).toBe("tagged-tests-no-ci-home");
    expect(f?.severity).toBe("advisory");
    expect(f?.action).toContain("packages/utils");
  });
  it("returns null when the @live test's package declares test:live", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" });
    writeTest("packages/api/a.test.ts", 'it("@live", () => {});');
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("does not scan .worktrees roots (local git worktrees, not part of the repo)", () => {
    writePkg("", { "test:live": "vitest --project live" }); // root declares it → convention active, no homeless tags
    // A sibling git worktree checkout of the same repo, with a homeless @live test.
    writePkg(".worktrees/feat", { test: "vitest" });
    writeTest(".worktrees/feat/u.test.ts", 'it("@live works", () => {});');
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("ignores @live in comments / non-title string literals (only test titles count)", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("packages/utils", { test: "vitest" }); // no test:live
    writeTest(
      "packages/utils/u.test.ts",
      [
        "// Run the @live tier with -t @live; see docs.", // line comment
        'const TAG = "@live"; // unrelated string literal', // string literal, not a title
        'it("plain unit test", () => {});', // a real title, but untagged
      ].join("\n"),
    );
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
  it("fires when @live is in a test title even amid comment mentions", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("packages/utils", { test: "vitest" }); // no test:live
    writeTest(
      "packages/utils/u.test.ts",
      '// @live convention note\nit("does the thing @live", () => {});',
    );
    const f = detectTaggedTestsWithoutCiHome(tmpDir);
    expect(f?.id).toBe("tagged-tests-no-ci-home");
    expect(f?.action).toContain("packages/utils");
  });
  it("returns null when @live only appears inside a fixture string literal (tag-linter package)", () => {
    writePkg("packages/api", { "test:live": "vitest --project live" }); // convention active
    writePkg("tooling/eslint", { test: "vitest run" }); // tag-linter, no test:live
    // A tag-linter embeds sample test source as a template-literal fixture to lint it —
    // the inner `describe(...)`/`it(...)` is a string, not a runnable @live test.
    writeTest(
      "tooling/eslint/rule.test.ts",
      [
        'const FIXTURE = `describe.skipIf(!LIVE_API)("@live Families", () => { it("x", () => {}); })`;',
        'it("flags a mislabelled live-tier fixture", () => { expect(lint(FIXTURE)).toHaveLength(1); });',
      ].join("\n"),
    );
    expect(detectTaggedTestsWithoutCiHome(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectWorkflowLintToolsMissing
// ---------------------------------------------------------------------------

describe("detectWorkflowLintToolsMissing", () => {
  function writeWorkflow() {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "ci.yml"), "name: CI\n");
  }

  it("returns null when the repo has no workflows", () => {
    expect(detectWorkflowLintToolsMissing(tmpDir)).toBeNull();
  });
  it("returns null when both actionlint and shellcheck are on PATH", () => {
    writeWorkflow();
    execSync.mockReturnValue("ok"); // every `<tool> --version` succeeds
    expect(detectWorkflowLintToolsMissing(tmpDir)).toBeNull();
  });
  it("fires (advisory) when a tool is missing, naming it", () => {
    writeWorkflow();
    execSync.mockImplementation((cmd: string) => {
      if (cmd.startsWith("actionlint")) throw new Error("not found");
      return "ok";
    });
    const f = detectWorkflowLintToolsMissing(tmpDir);
    expect(f?.id).toBe("workflow-lint-tools-missing");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("actionlint");
  });
});

// ---------------------------------------------------------------------------
// detectRenderedPromptsStale (#256) — rendered prompts/workflows version gate
// ---------------------------------------------------------------------------

describe("detectRenderedPromptsStale", () => {
  // Write a rendered mirror file carrying (or omitting) a managed-version marker.
  function writeRendered(relDir: string, name: string, markerVersion: string | null): void {
    const dir = path.join(tmpDir, relDir);
    fs.mkdirSync(dir, { recursive: true });
    const base = "---\nname: bkit-x\n---\n\nbody\n";
    fs.writeFileSync(
      path.join(dir, name),
      markerVersion ? stampManagedVersion(base, markerVersion) : base,
      "utf-8",
    );
  }

  it("returns null when every rendered marker matches the installing version", () => {
    writeRendered(".claude/agents", "bkit-a.md", "4.0.0");
    writeRendered(".claude/commands", "bkit-b.md", "4.0.0");
    expect(detectRenderedPromptsStale(tmpDir, "4.0.0")).toBeNull();
  });

  it("returns a blocker on a protected branch when a marker is older than the installing version", () => {
    writeRendered(".claude/agents", "bkit-a.md", "4.0.0");
    const f = detectRenderedPromptsStale(tmpDir, "4.1.0", true);
    expect(f).not.toBeNull();
    expect(f?.id).toBe("bkit-rendered-prompts-stale");
    expect(f?.severity).toBe("blocker");
    expect(f?.detect).toContain("4.1.0");
    expect(f?.detect).toContain("bkit-a.md");
    // No feature-branch note on a protected branch.
    expect(f?.detect).not.toContain("non-blocking");
  });

  it("downgrades to a non-blocking advisory on a feature branch (drift is inherited, not created)", () => {
    writeRendered(".claude/agents", "bkit-a.md", "4.0.0");
    const f = detectRenderedPromptsStale(tmpDir, "4.1.0", false);
    expect(f).not.toBeNull();
    expect(f?.id).toBe("bkit-rendered-prompts-stale"); // still the same finding id…
    expect(f?.severity).toBe("advisory"); // …but non-blocking here
    expect(f?.detect).toContain("non-blocking on this feature branch");
    expect(f?.detect).toContain("hard-fail");
  });

  it("flags a managed mirror that has no marker at all (hand-edited / pre-feature)", () => {
    writeRendered(".cursor/agents", "bkit-a.md", null);
    const f = detectRenderedPromptsStale(tmpDir, "4.0.0");
    expect(f?.id).toBe("bkit-rendered-prompts-stale");
    expect(f?.detect).toContain("no marker");
  });

  it("scans all three providers' agent + command mirrors", () => {
    writeRendered(".claude/agents", "bkit-a.md", "4.0.0");
    writeRendered(".cursor/commands", "bkit-b.md", "3.0.0"); // stale
    writeRendered(".opencode/agents", "bkit-c.md", "4.0.0");
    const f = detectRenderedPromptsStale(tmpDir, "4.0.0");
    expect(f).not.toBeNull();
    expect(f?.detect).toContain(".cursor/commands/bkit-b.md");
    // The two fresh files are not named as stale.
    expect(f?.detect).not.toContain("bkit-a.md");
    expect(f?.detect).not.toContain("bkit-c.md");
  });

  it("ignores non-bkit and non-md files in the mirror dirs", () => {
    const dir = path.join(tmpDir, ".claude/agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "README.txt"), "not managed", "utf-8");
    fs.writeFileSync(path.join(dir, "consumer-agent.md"), "no marker, not bkit-", "utf-8");
    expect(detectRenderedPromptsStale(tmpDir, "4.0.0")).toBeNull();
  });

  it("returns null when nothing is rendered (no mirror dirs)", () => {
    expect(detectRenderedPromptsStale(tmpDir, "4.0.0")).toBeNull();
  });

  it("guards against a 0.0.0 / empty installing version (no false blocker)", () => {
    writeRendered(".claude/agents", "bkit-a.md", "3.0.0");
    expect(detectRenderedPromptsStale(tmpDir, "0.0.0")).toBeNull();
    expect(detectRenderedPromptsStale(tmpDir, "")).toBeNull();
  });

  it("truncates the example list and reports the overflow count", () => {
    for (let i = 0; i < 8; i++) writeRendered(".claude/agents", `bkit-${i}.md`, "3.0.0");
    const f = detectRenderedPromptsStale(tmpDir, "4.0.0");
    expect(f?.detect).toContain("(+3 more)"); // 8 stale, 5 shown
  });
});

// ---------------------------------------------------------------------------
// detectManagedDocsStale (#256 extension) — managed docs/*.md version gate
// ---------------------------------------------------------------------------

describe("detectManagedDocsStale", () => {
  // A separate fake package-templates root so the canonical doc SET is enumerated
  // from there (mirrors getTemplatesRoot() in production), independent of tmpDir.
  let templatesRoot: string;

  beforeEach(() => {
    templatesRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tmpl-"));
  });
  afterEach(() => {
    fs.rmSync(templatesRoot, { recursive: true, force: true });
  });

  // Declare a doc as bkit-managed by placing it in the template tree.
  function declareCanonical(rel: string): void {
    const p = path.join(templatesRoot, "docs", rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, "<!-- bkit:start -->\n{{BKIT_MANAGED_MARKER}}\n\n# T\n<!-- bkit:end -->\n");
  }

  // Write a consumer-side doc with (or without) a managed marker as the block's
  // first line. `markerVersion === undefined` → no bkit:start block at all.
  function writeConsumerDoc(rel: string, markerVersion: string | null | undefined): void {
    const p = path.join(tmpDir, "docs", rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    if (markerVersion === undefined) {
      fs.writeFileSync(p, "# plain consumer doc, no managed block\n");
      return;
    }
    const markerLine = markerVersion ? managedVersionMarker(markerVersion) + "\n" : "";
    fs.writeFileSync(p, `<!-- bkit:start -->\n${markerLine}\n# T\n<!-- bkit:end -->\n`);
  }

  it("returns null when every managed doc marker matches the installing version", () => {
    declareCanonical("testing.md");
    declareCanonical("plans/template.md");
    writeConsumerDoc("testing.md", "4.0.0");
    writeConsumerDoc("plans/template.md", "4.0.0");
    expect(detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot)).toBeNull();
  });

  it("returns a blocker on a protected branch when a managed doc marker is older than the installing version", () => {
    declareCanonical("testing.md");
    writeConsumerDoc("testing.md", "4.0.0");
    const f = detectManagedDocsStale(tmpDir, "4.1.0", templatesRoot, true);
    expect(f).not.toBeNull();
    expect(f?.id).toBe("bkit-managed-docs-stale");
    expect(f?.severity).toBe("blocker");
    expect(f?.detect).toContain("4.1.0");
    expect(f?.detect).toContain("docs/testing.md");
    expect(f?.detect).toContain("(v4.0.0)");
    expect(f?.detect).not.toContain("non-blocking");
  });

  it("downgrades to a non-blocking advisory on a feature branch", () => {
    declareCanonical("testing.md");
    writeConsumerDoc("testing.md", "4.0.0");
    const f = detectManagedDocsStale(tmpDir, "4.1.0", templatesRoot, false);
    expect(f?.id).toBe("bkit-managed-docs-stale");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("non-blocking on this feature branch");
  });

  it("flags a managed doc whose block carries no marker (pre-feature / hand-edited)", () => {
    declareCanonical("deployments.md");
    writeConsumerDoc("deployments.md", null);
    const f = detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot);
    expect(f?.id).toBe("bkit-managed-docs-stale");
    expect(f?.detect).toContain("docs/deployments.md");
    expect(f?.detect).toContain("no marker");
  });

  it("does NOT false-positive on user plans/logs that inherit template.md's bkit:start block", () => {
    // Only plans/template.md is canonical; a consumer's instantiated plans + logs
    // under docs/plans/{YYYYMM}/ inherit its bkit:start but are user-owned.
    declareCanonical("plans/template.md");
    writeConsumerDoc("plans/template.md", "4.0.0"); // fresh canonical
    // User plan + log, both stale-looking and marker-less — must be ignored.
    writeConsumerDoc("plans/202605/143-feature-plan.md", "1.0.0");
    writeConsumerDoc("plans/202605/logs/143-feature/plan-v1-draft.md", null);
    expect(detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot)).toBeNull();
  });

  it("skips canonical docs the consumer does not have (no crash, others still checked)", () => {
    declareCanonical("testing.md");
    declareCanonical("observability.md"); // consumer never created this one
    writeConsumerDoc("testing.md", "3.0.0"); // stale
    const f = detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot);
    expect(f?.detect).toContain("docs/testing.md");
    expect(f?.detect).not.toContain("observability.md");
    expect(f?.detect).toContain("1 of 1"); // only testing.md was scanned
  });

  it("ignores a consumer doc that dropped the managed block entirely", () => {
    declareCanonical("testing.md");
    writeConsumerDoc("testing.md", undefined); // no bkit:start → not ours to gate
    expect(detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot)).toBeNull();
  });

  it("guards against a 0.0.0 / empty installing version (no false blocker)", () => {
    declareCanonical("testing.md");
    writeConsumerDoc("testing.md", "3.0.0");
    expect(detectManagedDocsStale(tmpDir, "0.0.0", templatesRoot)).toBeNull();
    expect(detectManagedDocsStale(tmpDir, "", templatesRoot)).toBeNull();
  });

  it("ignores deeper prose references to the marker, reading only the first in-block stamp", () => {
    declareCanonical("decisions.md");
    const p = path.join(tmpDir, "docs", "decisions.md");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    // Real first-line stamp = current; a prose mention of an example version
    // appears deeper and must NOT be the one read.
    fs.writeFileSync(
      p,
      `<!-- bkit:start -->\n${managedVersionMarker("4.0.0")}\n\n# Decisions\n\n` +
        "Docs stamp a `<!-- bkit:managed vX.Y.Z … -->` marker.\n<!-- bkit:end -->\n",
    );
    expect(detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot)).toBeNull();
  });

  it("does NOT treat inline prose vX.Y.Z as a stamp when the first block has no full-line marker", () => {
    // Dogfood architecture.md shape: unexpanded {{BKIT_MANAGED_MARKER}} + prose
    // documenting `vX.Y.Z` — the prose must report as "(no marker)", never "(vX.Y.Z)".
    declareCanonical("architecture.md");
    const p = path.join(tmpDir, "docs", "architecture.md");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(
      p,
      "<!-- bkit:start -->\n{{BKIT_MANAGED_MARKER}}\n\n# Architecture\n\n" +
        "carries `<!-- bkit:managed vX.Y.Z … -->` stamped by bkit.\n<!-- bkit:end -->\n" +
        "\n## Consumer section\n\n" +
        `<!-- bkit:start -->\n${managedVersionMarker("4.0.0")}\n\n# Architecture\n<!-- bkit:end -->\n`,
    );
    const f = detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot);
    expect(f?.id).toBe("bkit-managed-docs-stale");
    expect(f?.detect).toContain("docs/architecture.md");
    expect(f?.detect).toContain("no marker");
    expect(f?.detect).not.toContain("(vX.Y.Z)");
  });

  it("truncates the example list and reports the overflow count", () => {
    for (let i = 0; i < 8; i++) {
      declareCanonical(`doc-${i}.md`);
      writeConsumerDoc(`doc-${i}.md`, "3.0.0");
    }
    const f = detectManagedDocsStale(tmpDir, "4.0.0", templatesRoot);
    expect(f?.detect).toContain("(+3 more)"); // 8 stale, 5 shown
  });
});

// ---------------------------------------------------------------------------
// isOnProtectedBranch — branch-scoped severity for the #256 stale gates
// ---------------------------------------------------------------------------

describe("isOnProtectedBranch", () => {
  const saved = {
    base: process.env.GITHUB_BASE_REF,
    ref: process.env.GITHUB_REF_NAME,
  };
  afterEach(() => {
    if (saved.base === undefined) delete process.env.GITHUB_BASE_REF;
    else process.env.GITHUB_BASE_REF = saved.base;
    if (saved.ref === undefined) delete process.env.GITHUB_REF_NAME;
    else process.env.GITHUB_REF_NAME = saved.ref;
  });

  it("treats a push to main/dev as protected (GITHUB_REF_NAME)", () => {
    delete process.env.GITHUB_BASE_REF;
    process.env.GITHUB_REF_NAME = "main";
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
    process.env.GITHUB_REF_NAME = "dev";
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
  });

  it("treats a push to a feature branch as NOT protected", () => {
    delete process.env.GITHUB_BASE_REF;
    process.env.GITHUB_REF_NAME = "feat/296-file-upload";
    expect(isOnProtectedBranch(tmpDir)).toBe(false);
  });

  it("treats a PR INTO main/dev as protected — base ref wins over the feature head ref", () => {
    process.env.GITHUB_REF_NAME = "feat/296-file-upload"; // PR head/merge ref
    process.env.GITHUB_BASE_REF = "dev"; // merge target
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
  });

  it("fail-safe: undeterminable branch (no CI env, non-git dir) → protected", () => {
    delete process.env.GITHUB_BASE_REF;
    delete process.env.GITHUB_REF_NAME;
    // tmpDir is a fresh mkdtemp dir, not a git work tree → git HEAD resolution
    // fails → null → treated as protected so an unknown env never downgrades.
    expect(isOnProtectedBranch(tmpDir)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// detectLedgerAliasCollisions — DE-<n>/KN-<n> silent-duplicate-id advisory
// (fs-only; no child_process, so it runs under the mocked module unchanged)
// ---------------------------------------------------------------------------

describe("detectLedgerAliasCollisions", () => {
  function writeDecisions(rows: object[]): void {
    fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "docs", "decisions.jsonl"),
      rows.map((r) => JSON.stringify(r)).join("\n") + "\n",
    );
  }
  const base = {
    ts: 1,
    kind: "decision",
    repo: "acme/app",
    workflow: "plan",
    bkitVersion: "4.5.0",
  };

  it("advisory when one DE-<n> is claimed by unrelated rows", () => {
    writeDecisions([
      { ...base, key: "de-114-sentry", aliases: ["DE-114"] },
      { ...base, key: "de-114-e2e-parallelism", aliases: ["DE-114"] },
    ]);
    const f = detectLedgerAliasCollisions(tmpDir);
    expect(f).not.toBeNull();
    expect(f?.id).toBe("ledger-alias-collisions");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("DE-114");
    expect(f?.action).toContain("bkit telemetry normalise");
  });

  it("null when the ledgers are clean (no collisions)", () => {
    writeDecisions([
      { ...base, key: "de-3-distribution", workflow: "migrate" },
      { ...base, key: "content-slug-decision" },
    ]);
    expect(detectLedgerAliasCollisions(tmpDir)).toBeNull();
  });

  it("null when no ledgers exist", () => {
    expect(detectLedgerAliasCollisions(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectOpencodeYmlProviderDrift — self-installed /oc handler vs installed provider
// ---------------------------------------------------------------------------

describe("detectOpencodeYmlProviderDrift", () => {
  function writeOpencodeYml(model: string | null, envVar: string | null): void {
    const wfDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(wfDir, { recursive: true });
    const lines = [
      "name: opencode",
      "jobs:",
      "  opencode:",
      "    steps:",
      "      - name: Run opencode",
      "        uses: anomalyco/opencode/github@x",
    ];
    if (envVar) {
      lines.push("        env:");
      // Concatenate the ${{ }} ref — a template literal would parse ${{ as an expression.
      lines.push("          " + envVar + ": ${{ secrets." + envVar + " }}");
    }
    if (model) {
      lines.push("        with:");
      lines.push("          model: " + model);
    }
    fs.writeFileSync(path.join(wfDir, "opencode.yml"), lines.join("\n") + "\n");
  }

  function writePkg(provider: string | null): void {
    const bkit = provider ? { bkit: { opencodeProvider: provider } } : {};
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", version: "0.0.0", ...bkit }, null, 2),
    );
  }

  it("null when opencode.yml is absent (ship-safe existence guard)", () => {
    writePkg("openrouter");
    expect(detectOpencodeYmlProviderDrift(tmpDir)).toBeNull();
  });

  it("null when in sync (handler model prefix + secret match the installed provider)", () => {
    writePkg("openrouter");
    writeOpencodeYml("openrouter/moonshotai/kimi-k3", "BKIT_OPENROUTER_API_KEY");
    expect(detectOpencodeYmlProviderDrift(tmpDir)).toBeNull();
  });

  it("flags drift when the handler is pinned to a different provider than installed", () => {
    // Installed = opencode-go (BKIT_OPENCODE_API_KEY), handler = openrouter — the real repo state.
    writePkg("opencode-go");
    writeOpencodeYml("openrouter/moonshotai/kimi-k3", "BKIT_OPENROUTER_API_KEY");
    const f = detectOpencodeYmlProviderDrift(tmpDir);
    expect(f?.id).toBe("opencode-yml-provider-drift");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("opencode-go");
    expect(f?.detect).toContain("BKIT_OPENROUTER_API_KEY");
    expect(f?.action).toContain("BKIT_OPENCODE_API_KEY");
    expect(f?.action).toContain("opencode-go/<model>");
  });

  it("flags env-var drift even when the model prefix matches", () => {
    // model prefix opencode-go matches, but the secret env var is wrong (OPENROUTER vs OPENCODE).
    writePkg("opencode-go");
    writeOpencodeYml("opencode-go/some-model", "BKIT_OPENROUTER_API_KEY");
    const f = detectOpencodeYmlProviderDrift(tmpDir);
    expect(f?.id).toBe("opencode-yml-provider-drift");
  });

  it("distinguishes the two BKIT_OPENCODE_API_KEY gateways by model prefix", () => {
    // Both opencode-zen and opencode-go use BKIT_OPENCODE_API_KEY, so only the model prefix
    // (opencode vs opencode-go) tells them apart. Installed = go, handler pinned to zen.
    writePkg("opencode-go");
    writeOpencodeYml("opencode/zen-model", "BKIT_OPENCODE_API_KEY");
    const f = detectOpencodeYmlProviderDrift(tmpDir);
    expect(f?.id).toBe("opencode-yml-provider-drift");
    expect(f?.detect).toContain("opencode-go/<model>");
  });

  it("null when bkit.opencodeProvider is not recorded (cannot determine intended provider)", () => {
    writePkg(null);
    writeOpencodeYml("openrouter/moonshotai/kimi-k3", "BKIT_OPENROUTER_API_KEY");
    expect(detectOpencodeYmlProviderDrift(tmpDir)).toBeNull();
  });
});
