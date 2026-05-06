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
  detectVercelProject,
  detectVercelEnv,
  detectCiYmlMissingTokenEnv,
  detectValePackageNotSynced,
  detectDevDepsNeedFetch,
  formatChecklist,
  runPostInstallCheck,
  dedupeById,
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

  it("returns 'missing' when GH_BKIT_TOKEN is empty string", () => {
    process.env.GH_BKIT_TOKEN = "";
    expect(detectShellToken()).toBe("missing");
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
    fs.writeFileSync(path.join(tmpDir, ".npmrc"), "registry=https://registry.npmjs.org/\n", "utf-8");
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
// detectVercelProject
// ---------------------------------------------------------------------------

describe("detectVercelProject", () => {
  it("returns true when vercel.json exists at root", () => {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{}', "utf-8");
    expect(detectVercelProject(tmpDir)).toBe(true);
  });

  it("returns true when vercel.json exists under apps/<name>/", () => {
    fs.mkdirSync(path.join(tmpDir, "apps", "web"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "apps", "web", "vercel.json"), '{}', "utf-8");
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
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{}', "utf-8");
    execFileSync.mockReturnValue("GH_BKIT_TOKEN  preview\n");
    expect(detectVercelEnv("preview", tmpDir)).toBe("present");
  });

  it("returns 'missing' when vercel CLI output lacks GH_BKIT_TOKEN", () => {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{}', "utf-8");
    execFileSync.mockReturnValue("OTHER_VAR  preview\n");
    expect(detectVercelEnv("preview", tmpDir)).toBe("missing");
  });

  it("returns 'unknown' when vercel CLI throws", () => {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{}', "utf-8");
    execFileSync.mockImplementation(() => {
      throw new Error("vercel: command not found");
    });
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
// runPostInstallCheck — deduplication
// ---------------------------------------------------------------------------

describe("runPostInstallCheck deduplication", () => {
  it("deduplicates findings within Phase 3 when same id appears multiple times", () => {
    // We can't force duplicate ids from real detectors, but we can verify the
    // cross-phase dedup: if preflightAdvisories has an id that Phase 3 would also emit,
    // Phase 3 wins (its entry replaces preflight's).
    // Set up: shell token missing → Phase 3 will emit gh-bkit-token-missing-shell
    delete process.env.GH_BKIT_TOKEN;

    // Simulate a preflight advisory with the same id
    const preflightAdvisories: PreflightFinding[] = [
      {
        id: "gh-bkit-token-missing-shell",
        severity: "advisory",
        detect: "Old preflight detect text",
        action: "Old preflight action",
      },
    ];

    const ws = makeWs();
    const result = runPostInstallCheck(preflightAdvisories, ws, makeModules("lint"), tmpDir);

    // Should appear exactly once
    const matches = result.filter((f) => f.id === "gh-bkit-token-missing-shell");
    expect(matches).toHaveLength(1);
    // Phase 3 wins — the detect text should NOT be the old preflight text
    expect(matches[0]!.detect).not.toBe("Old preflight detect text");
  });

  it("returns empty array in dry-run mode (Phase 3 skipped)", () => {
    delete process.env.GH_BKIT_TOKEN;
    const preflightAdvisories: PreflightFinding[] = [];
    const ws = makeWs();
    // dryRun=true → skip Phase 3
    const result = runPostInstallCheck(
      preflightAdvisories,
      ws,
      makeModules("lint"),
      tmpDir,
      true,
    );
    // In dry-run, returns preflightAdvisories as-is (empty)
    expect(result).toHaveLength(0);
  });

  it("returns preflight advisories unchanged in dry-run mode", () => {
    const preflightAdvisories: PreflightFinding[] = [
      { id: "husky-no-markers-precommit", severity: "advisory", detect: "d", action: "a" },
    ];
    const ws = makeWs();
    const result = runPostInstallCheck(
      preflightAdvisories,
      ws,
      makeModules("lint"),
      tmpDir,
      true,
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("husky-no-markers-precommit");
  });

  it("gh-bkit-token-missing-shell is emitted when GH_BKIT_TOKEN is unset", () => {
    delete process.env.GH_BKIT_TOKEN;
    const result = runPostInstallCheck([], makeWs(), makeModules("lint"), tmpDir);
    expect(result.some((f) => f.id === "gh-bkit-token-missing-shell")).toBe(true);
  });

  it("npmrc-missing-gh-packages is emitted when .npmrc exists but lacks required lines", () => {
    fs.writeFileSync(path.join(tmpDir, ".npmrc"), "registry=https://registry.npmjs.org/\n", "utf-8");
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
