// checks/after/auth.test.ts — Unit tests for the Phase 3 credential detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectShellToken,
  detectShellGhMcpToken,
  hasGithubMcpServer,
  detectNpmrcAuth,
  detectNpmrcAuthTokenLine,
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
// detectNpmrcAuth
// ---------------------------------------------------------------------------

describe("detectNpmrcAuth", () => {
  // Registry-mapping-only is the correct shape — the auth token lives in
  // pnpm's user-level config (pnpm config set), NOT in the project .npmrc.
  it("returns 'present' when .npmrc has only the @cbartens registry mapping", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("present");
  });

  it("returns 'present' when .npmrc has the registry mapping plus an authToken line", () => {
    // Still 'present' for the registry check; the authToken line is flagged separately.
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
// detectNpmrcAuthTokenLine
// ---------------------------------------------------------------------------

describe("detectNpmrcAuthTokenLine", () => {
  it("returns true when .npmrc carries a GH Packages auth-token line", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
      "utf-8",
    );
    expect(detectNpmrcAuthTokenLine(tmpDir)).toBe(true);
  });

  it("returns false for a registry-only .npmrc (the correct shape)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n",
      "utf-8",
    );
    expect(detectNpmrcAuthTokenLine(tmpDir)).toBe(false);
  });

  it("returns false when .npmrc is absent", () => {
    expect(detectNpmrcAuthTokenLine(tmpDir)).toBe(false);
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

describe("B4 — detectShellToken differentiates unset from empty-string", () => {
  it("returns 'present' when BKIT_GH_TOKEN_INSTALL is set and non-empty", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "ghp_sometoken";
    expect(detectShellToken()).toBe("present");
  });

  it("returns 'missing' when BKIT_GH_TOKEN_INSTALL is undefined (unset)", () => {
    delete process.env.BKIT_GH_TOKEN_INSTALL;
    expect(detectShellToken()).toBe("missing");
  });

  it("returns 'empty' when BKIT_GH_TOKEN_INSTALL is set to empty string", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "";
    expect(detectShellToken()).toBe("empty");
  });

  it("'empty' and 'missing' are distinct values (not equal)", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "";
    expect(detectShellToken()).not.toBe("missing");
    delete process.env.BKIT_GH_TOKEN_INSTALL;
    expect(detectShellToken()).not.toBe("empty");
  });
});

// ---------------------------------------------------------------------------
// Advisory auth shape (user-level pnpm config set)
//
// Advisory text must prescribe the user-level auth shape
//   `pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"`
// and must NOT prescribe committing an `_authToken=${BKIT_GH_TOKEN_INSTALL}` line in the project
// .npmrc as the auth mechanism — pnpm >=10.34.3 401s on that env-substitution (the
// line is flagged for removal by detectNpmrcAuthTokenLine, never prescribed).
//
// The POSIX-fallback `${VAR:-default}` form never appears (pnpm cannot parse it).
// ---------------------------------------------------------------------------

describe("B6 — gh-bkit-token-secret-unknown action text contains concrete one-liner", () => {
  it("gh-bkit-token-secret-unknown action text instructs `export BKIT_GH_TOKEN_INSTALL=$(gh auth token)`", () => {
    const src = fs.readFileSync(path.join(__dirname, "auth.ts"), "utf-8");
    expect(src).toContain("export BKIT_GH_TOKEN_INSTALL=$(gh auth token)");
  });

  it("advisory strings prescribe the user-level `pnpm config set` auth shape", () => {
    for (const f of ["../../install/modules/core.ts", "index.ts"]) {
      const src = fs.readFileSync(path.join(__dirname, f), "utf-8");
      expect(src, `${f} must prescribe the user-level pnpm config set auth shape`).toMatch(
        /pnpm config set\s+"?\/\/npm\.pkg\.github\.com\/:_authToken=\$BKIT_GH_TOKEN_INSTALL/,
      );
    }
  });

  it("no advisory string anywhere in scripts prescribes the broken ${BKIT_GH_TOKEN_INSTALL:-} form", () => {
    const scripts = [
      ...["../../install/modules", ".", "../before"].flatMap((dir) =>
        fs
          .readdirSync(path.join(__dirname, dir))
          .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
          .map((f) => path.join(dir, f)),
      ),
      "../../cli.ts",
    ];
    for (const f of scripts) {
      const p = path.join(__dirname, f);
      if (!fs.existsSync(p)) continue;
      const src = fs.readFileSync(p, "utf-8");
      expect(
        src,
        `${f} must not prescribe \${BKIT_GH_TOKEN_INSTALL:-} (pnpm cannot parse :-)`,
      ).not.toMatch(/_authToken=\\?\$\{BKIT_GH_TOKEN_INSTALL:-\}/);
    }
  });
});

// ---------------------------------------------------------------------------
// Task C1 — Installer advisory action constants (BAR-138, in checks/after/)
// ---------------------------------------------------------------------------

// Every non-test source in `dir`, concatenated — read as text to inspect the constant bodies
// without executing the modules (avoids import side-effects and keeps tests fast).
function readSources(dir: string): string {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), "utf-8"))
    .join("\n");
}

// The constants live in checks/after/ (Phase 3 owner), not install/modules/.
const POSTINSTALL_SRC = readSources(path.resolve(".bkit/core/engine/checks/after"));

const MODULES_SRC = readSources(path.resolve(".bkit/core/engine/install/modules"));

describe("BKIT_GH_TOKEN_INSTALL_MISSING action strings (in checks/after/)", () => {
  // The action string is now embedded in the const BKIT_GH_TOKEN_INSTALL_MISSING_ACTION
  const match = POSTINSTALL_SRC.match(
    /const BKIT_GH_TOKEN_INSTALL_MISSING_ACTION\s*=\s*([\s\S]*?)(?=\nconst |\nexport )/,
  );
  const body = match ? match[1] : POSTINSTALL_SRC;

  it("postinstall source contains .npmrc registry line", () => {
    expect(POSTINSTALL_SRC).toContain("@cbartens:registry=https://npm.pkg.github.com");
  });

  it("postinstall source prescribes the user-level pnpm config set auth shape (#274)", () => {
    expect(POSTINSTALL_SRC).toContain(
      'pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"',
    );
    expect(POSTINSTALL_SRC).toContain("BKIT_GH_TOKEN_INSTALL");
  });

  it("postinstall source contains read:packages scope reference", () => {
    expect(POSTINSTALL_SRC).toContain("read:packages");
  });

  it("BKIT_GH_TOKEN_INSTALL_MISSING action keeps the token out of the committed .npmrc (#274)", () => {
    // The committed project .npmrc carries only the registry mapping; the auth token is
    // written to pnpm's user-level config — so the action must NOT prescribe the
    // env-substitution `_authToken=${BKIT_GH_TOKEN_INSTALL}` line that 401s on pnpm >=10.34.3.
    expect(body).not.toContain("//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}");
  });

  it("postinstall source does NOT contain git insteadOf shim language", () => {
    expect(POSTINSTALL_SRC).not.toContain("git config --global url.");
  });

  it("BKIT_GH_TOKEN_INSTALL_MISSING_INSTRUCTIONS is absent from install/modules/", () => {
    expect(MODULES_SRC).not.toContain("BKIT_GH_TOKEN_INSTALL_MISSING_INSTRUCTIONS");
  });

  it("BKIT_GH_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS is absent from install/modules/", () => {
    expect(MODULES_SRC).not.toContain("BKIT_GH_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS");
  });

  it("VERCEL_AUTH_INSTRUCTIONS is absent from install/modules/", () => {
    expect(MODULES_SRC).not.toContain("VERCEL_AUTH_INSTRUCTIONS");
  });
});
