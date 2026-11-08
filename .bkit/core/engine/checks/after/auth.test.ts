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
      JSON.stringify({ name: "c", version: "1.0.0", bkit: { tracker: { default: issueTracker } } }),
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
      expect(findings[0]!.action).not.toContain("BKIT_JIRA_API_KEY");
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
// detectCiRouterSecrets — per-variant, per-tracker secret findings (TASK 14)
// ---------------------------------------------------------------------------

describe("detectCiRouterSecrets per variant", () => {
  const CURRENT =
    "name: bkit-cloud\n  K: ${{ secrets.BKIT_X }}\n  anthropic_federation_rule_id: x\n";
  const LEGACY =
    "name: bkit-cloud\n  K: ${{ secrets.ANTHROPIC_API_KEY }}\n  anthropic_federation_rule_id: x\n";

  function setup(opts: {
    agent: string;
    tracker?: string;
    provider?: string;
    router?: string;
  }): void {
    const bkit: Record<string, unknown> = {
      cloud: { agent: opts.agent },
      tracker: { default: opts.tracker ?? "github" },
    };
    if (opts.provider)
      bkit.providers = { opencode: { default: opts.provider, installed: [opts.provider] } };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "c", version: "1.0.0", bkit }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      opts.router ?? CURRENT,
    );
  }
  const text = (f: { detect: string; action: string }) => `${f.detect}\n${f.action}`;

  it("%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it", () => {
    const keys: Record<string, string> = {
      linear: "BKIT_LINEAR_API_KEY",
      jira: "BKIT_JIRA_API_KEY",
    };
    for (const tracker of ["linear", "jira"]) {
      setup({ agent: "claude", tracker });
      mockGhNames({ secret: ["BKIT_ANTHROPIC_API_KEY"], variable: [] });
      const finding = detectCiRouterSecrets(tmpDir).find(
        (f) => f.id === "cloud-router-tracker-secret-missing",
      );
      expect(finding, tracker).toBeDefined();
      expect(text(finding!), tracker).toContain(keys[tracker]!);
      for (const other of Object.keys(keys).filter((k) => k !== tracker))
        expect(text(finding!), tracker).not.toContain(keys[other]!);
    }
  });

  it("cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing", () => {
    setup({ agent: "codex" });
    mockGhNames({ secret: [], variable: [] });
    const findings = detectCiRouterSecrets(tmpDir);
    const finding = findings.find((f) => f.id === "codex-api-key-secret-missing");
    expect(finding).toBeDefined();
    expect(text(finding!)).toContain("BKIT_OPENAI_API_KEY");
    expect(findings.map((f) => f.id)).not.toContain("anthropic-api-key-secret-missing");
  });

  it("anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY", () => {
    const anthropicIds = [
      "anthropic-api-key-secret-missing",
      "anthropic-api-key-shadows-federation",
      "anthropic-federation-template-stale",
    ];
    setup({ agent: "codex" });
    mockGhNames({ secret: [], variable: [] });
    for (const f of detectCiRouterSecrets(tmpDir)) expect(anthropicIds).not.toContain(f.id);
    setup({ agent: "opencode", provider: "openrouter" });
    mockGhNames({ secret: [], variable: [] });
    for (const f of detectCiRouterSecrets(tmpDir)) expect(anthropicIds).not.toContain(f.id);
    setup({ agent: "claude" });
    mockGhNames({ secret: [], variable: [] });
    const missing = detectCiRouterSecrets(tmpDir).find(
      (f) => f.id === "anthropic-api-key-secret-missing",
    );
    expect(missing).toBeDefined();
    expect(missing!.action).toContain("gh secret set BKIT_ANTHROPIC_API_KEY");
    expect(missing!.action).not.toContain("gh secret set ANTHROPIC_API_KEY");
  });

  it("legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed", () => {
    setup({ agent: "claude" });
    mockGhNames({ secret: ["ANTHROPIC_API_KEY"], variable: [] });
    const finding = detectCiRouterSecrets(tmpDir).find(
      (f) => f.id === "cloud-router-secret-renamed",
    );
    expect(finding).toBeDefined();
    expect(finding!.action).toContain("gh secret set BKIT_ANTHROPIC_API_KEY");
    expect(finding!.action).toContain("gh secret delete ANTHROPIC_API_KEY");
  });

  it("legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key", () => {
    setup({ agent: "opencode", provider: "opencode-go" });
    mockGhNames({ secret: ["OPENCODE_PROVIDER_KEY"], variable: [] });
    const finding = detectCiRouterSecrets(tmpDir).find(
      (f) => f.id === "cloud-router-secret-renamed",
    );
    expect(finding).toBeDefined();
    expect(finding!.action).toContain("gh secret set BKIT_OPENCODE_API_KEY");
    expect(finding!.action).toContain("gh secret delete OPENCODE_PROVIDER_KEY");
    setup({ agent: "opencode", provider: "openrouter" });
    const other = detectCiRouterSecrets(tmpDir).find((f) => f.id === "cloud-router-secret-renamed");
    expect(other!.action).toContain("gh secret set BKIT_OPENROUTER_API_KEY");
    expect(other!.action).not.toContain("BKIT_OPENCODE_API_KEY");
  });

  it("adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed", () => {
    setup({ agent: "claude", router: LEGACY });
    mockGhNames({ secret: ["ANTHROPIC_API_KEY"], variable: [] });
    expect(detectCiRouterSecrets(tmpDir).map((f) => f.id)).not.toContain(
      "cloud-router-secret-renamed",
    );
    mockGhNames({ secret: [], variable: [] });
    const missing = detectCiRouterSecrets(tmpDir).find(
      (f) => f.id === "anthropic-api-key-secret-missing",
    );
    expect(missing).toBeDefined();
    expect(missing!.action).toContain("gh secret set ANTHROPIC_API_KEY");
    expect(missing!.action).not.toContain("BKIT_ANTHROPIC_API_KEY");
  });

  it("dashboards router section names the recorded variant's BKIT_ secret", () => {
    const cases: Array<[Parameters<typeof setup>[0], string]> = [
      [{ agent: "claude" }, "BKIT_ANTHROPIC_API_KEY"],
      [{ agent: "codex" }, "BKIT_OPENAI_API_KEY"],
      [{ agent: "opencode", provider: "openrouter" }, "BKIT_OPENROUTER_API_KEY"],
    ];
    for (const [opts, secret] of cases) {
      setup(opts);
      const action = buildCloudDashboardsAdvisory(tmpDir)!.action;
      expect(action, opts.agent).toContain(secret);
      expect(action, opts.agent).not.toContain("gh secret set ANTHROPIC_API_KEY");
    }
  });
});

// ---------------------------------------------------------------------------
// buildCloudDashboardsAdvisory
// ---------------------------------------------------------------------------

describe("buildCloudDashboardsAdvisory", () => {
  it("returns null when none of router / .claude / .cursor / .codex exist", () => {
    expect(buildCloudDashboardsAdvisory(tmpDir)).toBeNull();
  });

  it("bkit-cloud.yml alone: only the GitHub Actions credential, no host dashboard", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
      "name: bkit-auto\n",
    );
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("cloud-secrets-three-locations");
    expect(result!.action).toContain("GitHub Actions");
    expect(result!.action).toContain("ANTHROPIC_API_KEY");
    expect(result!.action).not.toContain("Cursor Cloud Agents");
    expect(result!.action).not.toContain("Claude Code (web)");
    expect(result!.action).not.toContain("Codex Cloud");
  });

  it.each([
    [".claude", "Claude Code (web)", ".claude/bkit-cloud.md"],
    [".cursor", "Cursor Cloud Agents", ".cursor/bkit-cloud.md"],
    [".codex", "Codex Cloud", ".codex/bkit-cloud.md"],
  ])("%s/ alone: names that host's dashboard and its generated paste doc", (dir, host, doc) => {
    fs.mkdirSync(path.join(tmpDir, dir), { recursive: true });
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.action).toContain(host);
    expect(result!.action).toContain(doc);
    expect(result!.action).not.toContain("gh secret set");
  });

  it("names every installed host's dashboard when several are present", () => {
    for (const dir of [".claude", ".cursor", ".codex"]) {
      fs.mkdirSync(path.join(tmpDir, dir), { recursive: true });
    }
    const action = buildCloudDashboardsAdvisory(tmpDir)!.action;
    expect(action).toContain("Claude Code (web)");
    expect(action).toContain("Cursor Cloud Agents");
    expect(action).toContain("Runtime Secret");
    expect(action).toContain("Codex Cloud");
  });

  it("never mentions the retired BKIT_GH_TOKEN_INSTALL install token", () => {
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result!.detect).not.toContain("BKIT_GH_TOKEN_INSTALL");
    expect(result!.action).not.toContain("BKIT_GH_TOKEN_INSTALL");
  });

  it.each(["github", "linear", "jira", "none"])(
    "%s tracker: the checklist is identical and names no tracker token",
    (tracker) => {
      const render = (bkit: Record<string, unknown>) => {
        fs.writeFileSync(
          path.join(tmpDir, "package.json"),
          JSON.stringify({ name: "c", version: "1.0.0", bkit }),
        );
        return buildCloudDashboardsAdvisory(tmpDir)!;
      };
      fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
        "name: bkit-auto\n",
      );
      for (const dir of [".claude", ".cursor", ".codex"]) {
        fs.mkdirSync(path.join(tmpDir, dir), { recursive: true });
      }
      const cloud = { agent: "cursor" };
      const result = render({ tracker: { default: tracker }, cloud });
      expect(result).toEqual(render({ cloud }));
      for (const key of ["BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"]) {
        expect(result.detect).not.toContain(key);
        expect(result.action).not.toContain(key);
      }
      expect(result.action).toContain("BKIT_ANTHROPIC_API_KEY");
    },
  );

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
});
