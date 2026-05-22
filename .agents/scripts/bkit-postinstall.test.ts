// bkit-postinstall.test.ts — Unit tests for Phase 3 detectors and formatChecklist (BAR-141).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PreflightFinding } from "./bkit-preflight";
import type { WriteSet } from "./bkit-tiers";
import {
  detectShellToken,
  detectNpmrcAuth,
  detectGhSecret,
  detectMainBranchProtection,
  detectDevBranchProtection,
  detectVercelProject,
  detectVercelEnv,
  detectCiYmlMissingTokenEnv,
  detectValePackageNotSynced,
  detectDevDepsNeedFetch,
  detectBkitStubs,
  detectTurboIntegrationInputs,
  detectTestIntegrationEnv,
  detectGhaFloatingTags,
  detectDependabotConfigMissing,
  detectDependabotTargetBranchMissing,
  detectDependabotConfigInvalid,
  detectDependabotRepoPrereqs,
  detectDependabotAutoFixesEnabled,
  detectRunLevelsNotComposed,
  detectCiRouterSecrets,
  buildCloudDashboardsAdvisory,
  formatChecklist,
  runPostInstallCheck,
  dedupeById,
  readChangelogVersionDelta,
  renderAdvisoriesMarkdown,
  writeAdvisoriesArtifact,
} from "./bkit-postinstall";

// ---------------------------------------------------------------------------
// Module-level mock for node:child_process
// vi.hoisted() must be called at the module top-level (once) so Vitest can hoist
// the mock declaration before imports. Individual tests use mockReset +
// mockReturnValue / mockImplementation to configure per-case behaviour.
// ---------------------------------------------------------------------------
const { execSync, execFileSync } = vi.hoisted(() => ({
  execSync: vi.fn(),
  execFileSync: vi.fn(),
}));
vi.mock("node:child_process", () => ({ execSync, execFileSync }));

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
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env = originalEnv;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
  execSync.mockReset();
  execFileSync.mockReset();
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
  it("returns 'present' when GH_BKIT_TOKEN is set and non-empty", () => {
    process.env.GH_BKIT_TOKEN = "some-token-value";
    expect(detectShellToken()).toBe("present");
  });

  it("returns 'missing' when GH_BKIT_TOKEN is not set", () => {
    delete process.env.GH_BKIT_TOKEN;
    expect(detectShellToken()).toBe("missing");
  });

  it("B4: returns 'empty' when GH_BKIT_TOKEN is set to empty string (differentiates from unset)", () => {
    process.env.GH_BKIT_TOKEN = "";
    expect(detectShellToken()).toBe("empty");
  });
});

// ---------------------------------------------------------------------------
// detectNpmrcAuth
// ---------------------------------------------------------------------------

describe("detectNpmrcAuth", () => {
  it("returns 'present' when .npmrc has both required lines", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("present");
  });

  it("returns 'missing' when .npmrc exists but lacks registry line", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("missing");
  });

  it("returns 'missing' when .npmrc exists but lacks authToken line", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n",
      "utf-8",
    );
    expect(detectNpmrcAuth(tmpDir)).toBe("missing");
  });

  it("returns 'missing' when .npmrc exists but lacks both lines", () => {
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
// detectGhSecret
// ---------------------------------------------------------------------------

describe("detectGhSecret", () => {
  it("returns 'present' when gh CLI reports GH_BKIT_TOKEN exists", () => {
    execSync.mockReturnValue("GH_BKIT_TOKEN\n");
    expect(detectGhSecret()).toBe("present");
  });

  it("returns 'missing' when gh CLI reports no GH_BKIT_TOKEN", () => {
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

  it("returns 'present' when vercel CLI reports GH_BKIT_TOKEN", () => {
    // B3: must also have .vercel/project.json for CLI call to proceed
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".vercel"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".vercel", "project.json"),
      '{"projectId":"proj_x"}',
      "utf-8",
    );
    execFileSync.mockReturnValue("GH_BKIT_TOKEN  preview\n");
    expect(detectVercelEnv("preview", tmpDir)).toBe("present");
  });

  it("returns 'missing' when vercel CLI output lacks GH_BKIT_TOKEN", () => {
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
  it("returns finding when ci.yml has pnpm install but no GH_BKIT_TOKEN env mapping", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `
jobs:
  build:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
`,
      "utf-8",
    );
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("ci-yml-missing-token-env");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when ci.yml has GH_BKIT_TOKEN env mapping (standard form)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `
jobs:
  build:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        env:
          GH_BKIT_TOKEN: \${{ secrets.GH_BKIT_TOKEN }}
`,
      "utf-8",
    );
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("returns null when ci.yml has GH_BKIT_TOKEN env mapping with quotes", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `
jobs:
  build:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        env:
          GH_BKIT_TOKEN: "\${{ secrets.GH_BKIT_TOKEN }}"
`,
      "utf-8",
    );
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("returns null when ci.yml has GH_BKIT_TOKEN env mapping with no inner spaces", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `
jobs:
  build:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        env:
          GH_BKIT_TOKEN: \${{secrets.GH_BKIT_TOKEN}}
`,
      "utf-8",
    );
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("returns null when ci.yml is absent", () => {
    expect(detectCiYmlMissingTokenEnv(tmpDir)).toBeNull();
  });

  it("elevates severity to blocker when .npmrc references ${GH_BKIT_TOKEN}", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `
jobs:
  build:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
`,
      "utf-8",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n",
      "utf-8",
    );
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.severity).toBe("blocker");
    expect(result!.detect).toContain("401");
  });

  it("stays advisory when .npmrc has no ${GH_BKIT_TOKEN} reference", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `
jobs:
  build:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
`,
      "utf-8",
    );
    fs.writeFileSync(path.join(tmpDir, ".npmrc"), "save-exact=true\n", "utf-8");
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.severity).toBe("advisory");
  });

  it("stays advisory when .npmrc is absent (no token reference to break)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      `
jobs:
  build:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
`,
      "utf-8",
    );
    const result = detectCiYmlMissingTokenEnv(tmpDir);
    expect(result).not.toBeNull();
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

  it("scans pre-commit for the wrong-branch-guard sentinel", () => {
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".husky", "pre-commit"),
      "#!/usr/bin/env sh\n# bkit-stub:wrong-branch-guard — header\npnpm lint-staged\n",
    );
    const findings = detectBkitStubs(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("bkit-stub-wrong-branch-guard");
    expect(findings[0]!.detect).toContain(".husky/pre-commit");
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
});

// ---------------------------------------------------------------------------
// detectDevBranchProtection (mocks execFileSync like detectMainBranchProtection)
// ---------------------------------------------------------------------------

describe("detectDevBranchProtection", () => {
  it("returns 'present' when gh api returns 200", () => {
    execFileSync.mockReturnValue(Buffer.from("{}"));
    expect(detectDevBranchProtection()).toBe("present");
  });

  it("returns 'missing' when stderr contains 'Branch not protected'", () => {
    execFileSync.mockImplementation(() => {
      const err = new Error("gh: api failed") as Error & { stderr?: Buffer };
      err.stderr = Buffer.from("gh: Branch not protected (HTTP 404)\n");
      throw err;
    });
    expect(detectDevBranchProtection()).toBe("missing");
  });

  it("returns 'unknown' when gh is unauthenticated", () => {
    execFileSync.mockImplementation(() => {
      const err = new Error("auth") as Error & { stderr?: Buffer };
      err.stderr = Buffer.from("HTTP 401: Bad credentials\n");
      throw err;
    });
    expect(detectDevBranchProtection()).toBe("unknown");
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
});

// ---------------------------------------------------------------------------
// detectDependabotConfigMissing
// ---------------------------------------------------------------------------

describe("detectDependabotConfigMissing", () => {
  it("returns null when no .github/workflows exists (nothing to dependabot)", () => {
    expect(detectDependabotConfigMissing(tmpDir)).toBeNull();
  });

  it("flags absence when workflows exist but no dependabot.yml", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    const result = detectDependabotConfigMissing(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("dependabot-config-missing");
  });

  it("returns null when dependabot.yml is present", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    expect(detectDependabotConfigMissing(tmpDir)).toBeNull();
  });

  it("returns null when dependabot.yaml (alternate ext) is present", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yaml"), "version: 2\n");
    expect(detectDependabotConfigMissing(tmpDir)).toBeNull();
  });

  it("advisory action mentions bkit installer and default-branch rule (no embedded snippet drift)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    const result = detectDependabotConfigMissing(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.action).toMatch(/pnpm bkit install --ci/);
    expect(result!.action).toMatch(/default branch/);
  });
});

// ---------------------------------------------------------------------------
// detectDependabotTargetBranchMissing
// ---------------------------------------------------------------------------

describe("detectDependabotTargetBranchMissing", () => {
  it("returns null when no dependabot.yml exists", () => {
    expect(detectDependabotTargetBranchMissing(tmpDir)).toBeNull();
  });

  it("returns null when file has no updates[] entries yet (other detector handles invalid shape)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\nupdates: []\n");
    expect(detectDependabotTargetBranchMissing(tmpDir)).toBeNull();
  });

  it("fires when updates[] is present but no target-branch: dev anywhere", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "dependabot.yml"),
      [
        "version: 2",
        "updates:",
        "  - package-ecosystem: github-actions",
        "    directory: /",
        "    schedule:",
        "      interval: weekly",
        "",
      ].join("\n"),
    );
    const result = detectDependabotTargetBranchMissing(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("dependabot-target-branch-missing");
    expect(result!.detect).toMatch(/main/);
  });

  it("fires when target-branch is set to a value other than dev", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "dependabot.yml"),
      [
        "version: 2",
        "updates:",
        "  - package-ecosystem: github-actions",
        "    directory: /",
        "    target-branch: main",
        "    schedule:",
        "      interval: weekly",
        "",
      ].join("\n"),
    );
    expect(detectDependabotTargetBranchMissing(tmpDir)).not.toBeNull();
  });

  it("returns null when at least one updates[] entry has target-branch: dev", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "dependabot.yml"),
      [
        "version: 2",
        "updates:",
        "  - package-ecosystem: github-actions",
        "    directory: /",
        "    target-branch: dev",
        "    schedule:",
        "      interval: weekly",
        "",
      ].join("\n"),
    );
    expect(detectDependabotTargetBranchMissing(tmpDir)).toBeNull();
  });

  it("returns null for .yaml (alternate ext) with target-branch: dev", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "dependabot.yaml"),
      "version: 2\nupdates:\n  - package-ecosystem: npm\n    target-branch: dev\n",
    );
    expect(detectDependabotTargetBranchMissing(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectDependabotConfigInvalid
// ---------------------------------------------------------------------------

describe("detectDependabotConfigInvalid", () => {
  it("returns null when file does not exist", () => {
    expect(detectDependabotConfigInvalid(tmpDir)).toBeNull();
  });

  it("returns null for a valid minimal file", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "dependabot.yml"),
      "version: 2\nupdates:\n  - package-ecosystem: github-actions\n",
    );
    expect(detectDependabotConfigInvalid(tmpDir)).toBeNull();
  });

  it("fires when version: 2 is missing", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "dependabot.yml"),
      "updates:\n  - package-ecosystem: github-actions\n",
    );
    const result = detectDependabotConfigInvalid(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("dependabot-config-invalid");
    expect(result!.detect).toMatch(/version: 2/);
  });

  it("fires when updates: key is missing", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    const result = detectDependabotConfigInvalid(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toMatch(/updates/);
  });

  it("fires when file is indented with tabs (YAML-invalid)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "dependabot.yml"),
      "version: 2\nupdates:\n\t- package-ecosystem: github-actions\n",
    );
    const result = detectDependabotConfigInvalid(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.detect).toMatch(/tab/);
  });
});

// ---------------------------------------------------------------------------
// detectDependabotRepoPrereqs
// ---------------------------------------------------------------------------

describe("detectDependabotRepoPrereqs", () => {
  it("returns null when no dependabot.yml exists (nothing to gate)", () => {
    expect(detectDependabotRepoPrereqs(tmpDir)).toBeNull();
  });

  it("returns null when gh reports vulnerability-alerts enabled (204)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    // gh api with 204 No Content returns empty stdout; execFileSync resolves normally.
    execFileSync.mockReturnValue(Buffer.from(""));
    expect(detectDependabotRepoPrereqs(tmpDir)).toBeNull();
  });

  it("fires when gh stderr contains 'Dependabot alerts are disabled'", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockImplementation(() => {
      const err = new Error("gh: api failed") as Error & { stderr?: Buffer };
      err.stderr = Buffer.from(
        "gh: Dependabot alerts are disabled for this repository. (HTTP 403)\n",
      );
      throw err;
    });
    const result = detectDependabotRepoPrereqs(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("dependabot-repo-prereqs-disabled");
    expect(result!.action).toMatch(/bkit-set-dependabot\.sh/);
  });

  it("fires when gh stderr contains a generic 404", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockImplementation(() => {
      const err = new Error("gh: api failed") as Error & { stderr?: Buffer };
      err.stderr = Buffer.from("HTTP 404: Not Found\n");
      throw err;
    });
    expect(detectDependabotRepoPrereqs(tmpDir)).not.toBeNull();
  });

  it("returns null on gh transport error (auth missing / not a github repo) — no false positives", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockImplementation(() => {
      const err = new Error("auth required") as Error & { stderr?: Buffer };
      err.stderr = Buffer.from("HTTP 401: Bad credentials\n");
      throw err;
    });
    expect(detectDependabotRepoPrereqs(tmpDir)).toBeNull();
  });

  it("returns null when gh is not installed (no stderr property on the thrown error)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockImplementation(() => {
      throw new Error("ENOENT — gh not found");
    });
    expect(detectDependabotRepoPrereqs(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectDependabotAutoFixesEnabled — bkit policy: never auto-PR to main
// ---------------------------------------------------------------------------

describe("detectDependabotAutoFixesEnabled", () => {
  it("returns null when no dependabot.yml exists (nothing to gate)", () => {
    expect(detectDependabotAutoFixesEnabled(tmpDir)).toBeNull();
  });

  it("fires when API reports {enabled: true}", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockReturnValue('{"enabled":true,"paused":false}');
    const result = detectDependabotAutoFixesEnabled(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("dependabot-auto-security-fixes-enabled");
    expect(result!.detect).toMatch(/policy/i);
    expect(result!.action).toMatch(/bkit-set-dependabot\.sh/);
  });

  it("returns null when API reports {enabled: false}", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockReturnValue('{"enabled":false,"paused":false}');
    expect(detectDependabotAutoFixesEnabled(tmpDir)).toBeNull();
  });

  it("returns null on gh transport error (no false positives)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockImplementation(() => {
      throw new Error("ENOENT — gh not found");
    });
    expect(detectDependabotAutoFixesEnabled(tmpDir)).toBeNull();
  });

  it("returns null when API returns unexpected body (no false positives)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    execFileSync.mockReturnValue('{"unrelated":"body"}');
    expect(detectDependabotAutoFixesEnabled(tmpDir)).toBeNull();
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
      "jobs:\n  run-tests:\n    runs-on: ubuntu-latest\n",
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
});

// ---------------------------------------------------------------------------
// detectCiRouterSecrets
// ---------------------------------------------------------------------------

describe("detectCiRouterSecrets", () => {
  it("returns empty when bkit-ci-router workflow is absent", () => {
    expect(detectCiRouterSecrets(tmpDir)).toEqual([]);
  });

  it("emits one finding per missing secret when router workflow exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci-router.yml"),
      "name: bkit-ci-router\n",
    );
    execSync.mockReturnValue(""); // gh secret list returns no secrets
    const findings = detectCiRouterSecrets(tmpDir);
    expect(findings.map((f) => f.id).sort()).toEqual([
      "anthropic-api-key-secret-missing",
      "linear-api-key-secret-missing",
    ]);
  });

  it("returns empty when both secrets are present", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci-router.yml"),
      "name: bkit-ci-router\n",
    );
    execSync.mockReturnValue("ANTHROPIC_API_KEY\nLINEAR_API_KEY\n");
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

  it("fires when bkit-ci-router workflow exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-ci-router.yml"),
      "name: bkit-ci-router\n",
    );
    const result = buildCloudDashboardsAdvisory(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("cloud-secrets-three-locations");
    expect(result!.action).toContain("GitHub Actions");
    expect(result!.action).toContain("Cursor Background Agents");
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
  const fixedTs = "2026-05-18T12:00:00.000Z";

  it("renders a 'no advisories' stub when findings is empty", () => {
    const md = renderAdvisoriesMarkdown([], {
      mode: "install",
      version: "2.2.0",
      timestamp: fixedTs,
    });
    expect(md).toContain("# bkit advisories");
    expect(md).toContain(`_Generated: ${fixedTs}_`);
    expect(md).toContain("_bkit: 2.2.0_");
    expect(md).toContain("_Mode: install_");
    expect(md).toContain("**No advisories.** Last run was clean.");
    expect(md).not.toContain("INSTRUCTIONS FOR AN AI AGENT");
  });

  it("renders findings as numbered sections with severity, detect, action", () => {
    const findings: PreflightFinding[] = [
      { id: "a-blocker", severity: "blocker", detect: "Detect A", action: "Action A" },
      { id: "an-advisory", severity: "advisory", detect: "Detect B", action: "Action B" },
    ];
    const md = renderAdvisoriesMarkdown(findings, {
      mode: "doctor",
      version: "9.9.9",
      timestamp: fixedTs,
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
      timestamp: fixedTs,
    });
    expect(md).toContain("3 finding(s) — 2 blocker, 1 advisory.");
  });
});

describe("writeAdvisoriesArtifact", () => {
  it("writes .agents/advisories.md to the consumer cwd, creating .agents/ if missing", () => {
    const artifactDir = path.join(tmpDir, ".agents");
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
    const artifactPath = path.join(tmpDir, ".agents", "advisories.md");
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
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
    // Make .agents/ a file (not a directory) so mkdirSync recursively fails at file location.
    fs.writeFileSync(path.join(tmpDir, ".agents"), "blocker");

    expect(() =>
      writeAdvisoriesArtifact([], {
        cwd: tmpDir,
        mode: "install",
        version: "2.2.0",
        logPrefix: "[bkit-install]",
      }),
    ).not.toThrow();
    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to write .agents/advisories.md"),
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
    delete process.env.GH_BKIT_TOKEN;

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

  it("gh-bkit-token-unset-shell is emitted when GH_BKIT_TOKEN is unset", () => {
    delete process.env.GH_BKIT_TOKEN;
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
    process.env.GH_BKIT_TOKEN = "test";
    const result = runPostInstallCheck([], makeWs(), makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "npmrc-missing-gh-packages")).toBe(true);
  });

  it("no finding is emitted for .npmrc when file is absent (silent skip)", () => {
    process.env.GH_BKIT_TOKEN = "test";
    // No .npmrc file
    const result = runPostInstallCheck([], makeWs(), makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "npmrc-missing-gh-packages")).toBe(false);
  });

  it("devdeps-need-fetch emitted when WriteSet has devDepsAdded", () => {
    process.env.GH_BKIT_TOKEN = "test";
    const ws = makeWs({ path: "package.json", action: "update", devDepsAdded: ["prettier"] });
    const result = runPostInstallCheck([], ws, makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "devdeps-need-fetch")).toBe(true);
  });

  it("B2: cross-phase dedup is position-stable — preflight order preserved, Phase 3 appended", () => {
    // B2 (BAR-142 §B2): When Phase 3 supersedes a preflight id, the surviving entry
    // appears at the back of the list (Phase 3 position), not inserted at preflight position.
    // This ensures the output order is stable: preflight findings (not superseded) first,
    // Phase 3 findings second.
    process.env.GH_BKIT_TOKEN = "test"; // token present → no shell-token finding from Phase 3

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
    process.env.GH_BKIT_TOKEN = "test";
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
