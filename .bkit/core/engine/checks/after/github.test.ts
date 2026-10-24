// checks/after/github.test.ts — Unit tests for the Phase 3 GitHub settings and tracker-setup detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectActionsWritePermissions,
  detectProjectsToolset,
  buildGithubProjectAdvisory,
  detectMainBranchProtection,
  buildCloudSetupAdvisory,
  buildTrackerSetupAdvisory,
  buildGithubProjectTokenScopeAdvisory,
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
  const board = { project: "https://github.com/orgs/acme/projects/7" };
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

  it.each(["linear", "jira"])("returns null when tracker is %s", (tracker) => {
    pkg({ issueTracker: tracker, github: board });
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it("flags both prerequisites when config absent and toolset missing", () => {
    pkg({ issueTracker: "github" });
    writeToolset("context,issues,pull_requests"); // no projects
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("github-project-board-sync-unconfigured");
    expect(result!.detect).toContain("`bkit.github.project` is empty or absent");
    expect(result!.detect).toContain("`projects` toolset is missing");
  });

  it("flags only the toolset when config is present but projects toolset missing", () => {
    pkg({ issueTracker: "github", github: board });
    writeToolset("context,issues,pull_requests");
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("`projects` toolset is missing");
    expect(result!.detect).not.toContain("`bkit.github.project`");
  });

  it("flags only the config when toolset present but bkit.github.project absent", () => {
    pkg({ issueTracker: "github", github: { progress: "Doing" } });
    writeToolset("context,issues,projects");
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("`bkit.github.project` is empty or absent");
    expect(result!.detect).not.toContain("`projects` toolset is missing");
  });

  it("returns null when both prerequisites are satisfied", () => {
    pkg({ issueTracker: "github", github: board });
    writeToolset("context,issues,projects");
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it("accepts a personal board URL with a trailing view", () => {
    pkg({
      issueTracker: "github",
      github: { project: "https://github.com/users/me/projects/1/views/1" },
    });
    writeToolset("context,issues,projects");
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it("stays quiet on explicit opt-out (bkit.github.project: false), even with toolset missing", () => {
    pkg({ issueTracker: "github", github: { project: false } });
    writeToolset("context,issues,pull_requests");
    expect(buildGithubProjectAdvisory(tmpDir)).toBeNull();
  });

  it.each([
    "https://github.com/acme/web",
    "https://github.com/orgs/acme/projects/0",
    "github.com/orgs/acme/projects/7",
  ])("flags a project that is not a board URL (%s)", (project) => {
    pkg({ issueTracker: "github", github: { project } });
    writeToolset("context,issues,projects");
    const result = buildGithubProjectAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toContain("`bkit.github.project` is not a GitHub Projects board URL");
  });

  it("shows the URL form for both owner kinds and the token each reaches", () => {
    pkg({ issueTracker: "github" });
    writeToolset("context,issues,pull_requests"); // force the advisory to fire
    const action = buildGithubProjectAdvisory(tmpDir)!.action;
    expect(action).toContain(
      '"github": { "project": "https://github.com/orgs/<org>/projects/<number>" }',
    );
    expect(action).toContain("`/users/<login>/…`");
    expect(action).toContain(
      "classic PAT with the `project` scope reaches organization and personal boards",
    );
    expect(action).not.toContain("OptionId");
    expect(action).not.toContain("statusFieldId");
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

  it("still nudges when bkit.cloudAgents is the empty value install seeds", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { cloudAgents: "" } }),
    );
    expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-none");
  });

  it("jira tracker: no nudge (Jira runs locally only)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "jira" } }),
    );
    expect(buildCloudSetupAdvisory(tmpDir)).toBeNull();
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
    for (const tracker of ["github", "linear", "jira"]) {
      expect(result!.action).toContain(`--tracker=${tracker}`);
    }
  });

  it("nudges when bkit.issueTracker is the empty value install seeds", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "" } }),
    );
    expect(buildTrackerSetupAdvisory(tmpDir)?.id).toBe("tracker-setup-none");
  });

  it("stays quiet when bkit.issueTracker is explicitly 'none' (deliberate opt-out)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: "none" } }),
    );
    expect(buildTrackerSetupAdvisory(tmpDir)).toBeNull();
  });

  it.each([
    ["github", "BKIT_GH_TOKEN"],
    ["linear", "BKIT_LINEAR_API_KEY"],
    ["jira", "BKIT_JIRA_API_KEY"],
  ] as const)("informational when tracker is %s, naming %s", (tracker, token) => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { issueTracker: tracker } }),
    );
    const result = buildTrackerSetupAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(`tracker-setup-${tracker}`);
    expect(result!.action).toContain(token);
  });

  it.each(["github", "linear", "jira"])(
    "%s: fires with only .cursor/ installed, stays quiet with no host installed",
    (tracker) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "x", bkit: { issueTracker: tracker } }),
      );
      fs.rmSync(path.join(tmpDir, ".claude"), { recursive: true, force: true });
      expect(buildTrackerSetupAdvisory(tmpDir)).toBeNull();
      fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
      expect(buildTrackerSetupAdvisory(tmpDir)?.id).toBe(`tracker-setup-${tracker}`);
    },
  );

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
      "BKIT_JIRA_API_KEY",
      "bkit.jira.site",
      "bkit.jira.project",
    ]) {
      expect(result.action).toContain(s);
    }
    // No Linear-style per-session issue injection and no preflight hook under jira.
    expect(result.action).not.toContain("LINEAR_ISSUE_ID");
    expect(result.action).not.toContain("preflight hook");
  });
});

describe("buildGithubProjectTokenScopeAdvisory", () => {
  const pkg = (bkit: Record<string, unknown>) =>
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x", bkit }));
  const board = { project: "https://github.com/orgs/acme/projects/7" };
  const userResponse = (scopes: string | null) =>
    `HTTP/2.0 200 OK\r\n${scopes === null ? "" : `X-Oauth-Scopes: ${scopes}\r\n`}Content-Type: application/json\r\n\r\n{"login":"me"}`;
  /** `gh api -i user` answers with `user`; the board query answers with `graphql` (or throws). */
  const ghAnswers = (user: string, graphql: string | Error = "") =>
    execFileSync.mockImplementation((_cmd: string, args: string[]) => {
      if (args[1] === "-i") return user;
      if (graphql instanceof Error) throw graphql;
      return graphql;
    });

  beforeEach(() => {
    delete process.env.CI;
    delete process.env.CLAUDE_CODE_REMOTE;
    delete process.env.CURSOR_REMOTE_AGENT;
  });

  it("classic token with the project scope: quiet", () => {
    pkg({ issueTracker: "github", github: board });
    ghAnswers(userResponse("repo, project, read:org"));
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)).toBeNull();
  });

  it("classic token without the project scope: names the fix", () => {
    pkg({ issueTracker: "github", github: board });
    ghAnswers(userResponse("repo, read:org"));
    const r = buildGithubProjectTokenScopeAdvisory(tmpDir);
    expect(r?.id).toBe("github-project-token-scope");
    expect(r?.detect).toContain("`project` scope");
    expect(r?.action).toContain("BKIT_GH_TOKEN");
  });

  it("fine-grained token that can see the board: quiet", () => {
    pkg({ issueTracker: "github", github: board });
    ghAnswers(
      userResponse(null),
      JSON.stringify({ data: { repositoryOwner: { projectV2: { id: "PVT_1" } } } }),
    );
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)).toBeNull();
    const query = execFileSync.mock.calls[1]![1] as string[];
    expect(query).toContain("login=acme");
    expect(query).toContain("n=7");
  });

  it("fine-grained token whose board query returns null: names the fix", () => {
    pkg({ issueTracker: "github", github: board });
    ghAnswers(
      userResponse(null),
      JSON.stringify({ data: { repositoryOwner: { projectV2: null } } }),
    );
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)?.id).toBe("github-project-token-scope");
  });

  it("fine-grained token whose board query is refused: names the fix", () => {
    pkg({ issueTracker: "github", github: board });
    ghAnswers(userResponse(null), new Error("gh: Could not resolve to a ProjectV2"));
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)?.id).toBe("github-project-token-scope");
  });

  it("gh unavailable or unauthenticated: quiet (cannot judge)", () => {
    pkg({ issueTracker: "github", github: board });
    execFileSync.mockImplementation(() => {
      throw new Error("gh: not logged in");
    });
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)).toBeNull();
  });

  it("no board configured, another tracker, or cloud: no gh call at all", () => {
    pkg({ issueTracker: "github" });
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)).toBeNull();
    pkg({ issueTracker: "linear", github: board });
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)).toBeNull();
    pkg({ issueTracker: "github", github: board });
    process.env.CI = "true";
    expect(buildGithubProjectTokenScopeAdvisory(tmpDir)).toBeNull();
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it("never prints the token", () => {
    pkg({ issueTracker: "github", github: board });
    process.env.BKIT_GH_TOKEN = "ghp_secretvalue";
    ghAnswers(userResponse("repo"));
    const r = buildGithubProjectTokenScopeAdvisory(tmpDir);
    expect(JSON.stringify(r)).not.toContain("ghp_secretvalue");
    const env = (execFileSync.mock.calls[0]![2] as { env: NodeJS.ProcessEnv }).env;
    expect(env.GH_TOKEN).toBe("ghp_secretvalue");
  });
});
