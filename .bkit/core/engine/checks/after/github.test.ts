// checks/after/github.test.ts — Unit tests for the Phase 3 GitHub settings and tracker-setup detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectActionsWritePermissions,
  detectProjectsToolset,
  buildGithubProjectAdvisory,
  detectGithubProjectFieldIdFormat,
  detectMainBranchProtection,
  buildCloudSetupAdvisory,
  buildTrackerSetupAdvisory,
} from "./github";

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
// buildCloudSetupAdvisory — optional post-install decision (parity with the
// tracker / dep-updater advisories). Cloud agents (post-CI auto-routing) are
// opt-in via `bkit install --auto=<variant>`.
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

  it("jira: names the admin switch, the token and the package.json keys", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "jira" } }),
    );
    const result = buildTrackerSetupAdvisory(tmpDir)!;
    expect(result.id).toBe("tracker-setup-jira");
    for (const s of [
      "Allow API token authentication",
      "Atlassian MCP V2",
      "BKIT_JIRA_API_TOKEN",
      "bkit.jira.site",
      "bkit.jira.project",
    ]) {
      expect(result.action).toContain(s);
    }
  });
});
