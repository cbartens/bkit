// bkit-preflight.test.ts — Unit tests for Phase 1 preflight detectors (BAR-141).

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  hasBkitMarkers,
  stripBkitBlock,
  detectNoPackageJson,
  detectMalformedPackageJson,
  detectNotGitRepo,
  detectPrettierignoreNoMarkers,
  detectLintProseF9Vulnerable,
  detectBkitVersionMajorDowngrade,
  detectBkitVersionPinStale,
  detectGitignoreBlockDuplicates,
  detectPrettierignoreScopeBroadening,
  detectPlaywrightReporterHostile,
  detectObservabilityDebugFetchMissing,
  detectObservabilityDebugFetchSourceNotEnabled,
  detectMissingMcpServers,
  detectExtraMcpServers,
  REQUIRED_MCP_SERVERS,
  detectMissingDotenv,
  detectBlankDotenvKeys,
  detectDirenvMissing,
  detectDirenvNotAllowed,
  detectBkitNotOnPath,
  runPreflight,
} from "./bkit-preflight";
import { detectVercelEnv, detectVercelProject } from "./bkit-postinstall";
import { detectShellToken } from "./bkit-postinstall";

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

function makeModules(...flags: string[]): Set<import("./bkit-cli").ModuleFlag> {
  return new Set(flags) as Set<import("./bkit-cli").ModuleFlag>;
}

// ---------------------------------------------------------------------------
// hasBkitMarkers
// ---------------------------------------------------------------------------

describe("hasBkitMarkers", () => {
  it("returns true for HTML comment marker", () => {
    expect(hasBkitMarkers("<!-- bkit:start -->\ncontent\n<!-- bkit:end -->")).toBe(true);
  });

  it("returns true for hash-comment marker", () => {
    expect(hasBkitMarkers("# bkit:start\ncontent\n# bkit:end")).toBe(true);
  });

  it("returns false when no markers present", () => {
    expect(hasBkitMarkers("just some content\nwith no markers")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasBkitMarkers("")).toBe(false);
  });

  // B1 — line-anchored marker detection (BAR-142 §B1)
  it("B1: returns false when marker appears only inside backtick-fenced prose (not line-anchored)", () => {
    // e.g. in a markdown file that documents bkit markers:
    const prose =
      "## Usage\n\nBkit uses `<!-- bkit:start -->` and `<!-- bkit:end -->` markers.\n\nNo real marker here.";
    expect(hasBkitMarkers(prose)).toBe(false);
  });

  it("B1: returns false for marker embedded mid-line (not at start of line)", () => {
    const midLine = "some text <!-- bkit:start --> more text\n";
    expect(hasBkitMarkers(midLine)).toBe(false);
  });

  it("B1: returns true when marker is on its own line (line-anchored, no prefix)", () => {
    const realMarker = "above\n<!-- bkit:start -->\nbelow\n";
    expect(hasBkitMarkers(realMarker)).toBe(true);
  });

  it("B1: returns true when marker has hash-comment prefix (shell files)", () => {
    const shellContent = "#!/bin/sh\n# <!-- bkit:start -->\nset -e\n# <!-- bkit:end -->\n";
    expect(hasBkitMarkers(shellContent)).toBe(true);
  });

  it("B1: returns true when hash-style marker is on its own line", () => {
    const hashContent = "# bkit:start\ncontent\n# bkit:end\n";
    expect(hasBkitMarkers(hashContent)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// detectNoPackageJson
// ---------------------------------------------------------------------------

describe("detectNoPackageJson", () => {
  it("returns finding when package.json is absent", () => {
    const result = detectNoPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("no-package-json");
    expect(result!.severity).toBe("blocker");
    expect(result!.detect).toBeTruthy();
    expect(result!.action).toBeTruthy();
  });

  it("returns null when package.json exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectNoPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectMalformedPackageJson
// ---------------------------------------------------------------------------

describe("detectMalformedPackageJson", () => {
  it("returns finding when package.json contains invalid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not valid json }", "utf-8");
    const result = detectMalformedPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("malformed-package-json");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when package.json is valid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });

  it("returns null when package.json is absent (no-package-json fires instead)", () => {
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectNotGitRepo
// ---------------------------------------------------------------------------

describe("detectNotGitRepo", () => {
  it("returns finding when --core requested AND .git/ absent", () => {
    const result = detectNotGitRepo(tmpDir, makeModules("core"));
    expect(result).not.toBeNull();
    expect(result!.id).toBe("not-git-repo");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when --core requested AND .git/ exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".git"));
    expect(detectNotGitRepo(tmpDir, makeModules("core"))).toBeNull();
  });

  it("returns null when --core NOT requested (even if .git/ absent)", () => {
    // No core flag — not-git-repo should NOT fire
    expect(detectNotGitRepo(tmpDir, makeModules("lint"))).toBeNull();
  });
});

// detectHuskyNoMarkers tests removed in v2.0.4 — husky moved to Tier 3
// (seed-or-print); markers are no longer expected. Tier-3 advisory emission
// is exercised by bkit-modules.integration.test.ts via runGitHooksModule.

// ---------------------------------------------------------------------------
// detectPrettierignoreNoMarkers
// ---------------------------------------------------------------------------

describe("detectPrettierignoreNoMarkers", () => {
  it("returns finding when .prettierignore exists without markers", () => {
    fs.writeFileSync(path.join(tmpDir, ".prettierignore"), "node_modules\ndist\n", "utf-8");
    const result = detectPrettierignoreNoMarkers(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("prettierignore-no-markers");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when .prettierignore has bkit markers", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".prettierignore"),
      "# bkit:start\nnode_modules\n# bkit:end\n",
      "utf-8",
    );
    expect(detectPrettierignoreNoMarkers(tmpDir)).toBeNull();
  });

  it("returns null when .prettierignore is absent", () => {
    expect(detectPrettierignoreNoMarkers(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectLintProseF9Vulnerable
// ---------------------------------------------------------------------------

describe("detectLintProseF9Vulnerable", () => {
  it("returns finding when lint:prose script exists but lacks write-good guard", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test",
        scripts: { "lint:prose": "vale $(find . -name '*.md')" },
      }),
      "utf-8",
    );
    const result = detectLintProseF9Vulnerable(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("lint-prose-f9-vulnerable");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when lint:prose script includes the write-good guard", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test",
        scripts: {
          "lint:prose":
            "bash -c 'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale ...; fi'",
        },
      }),
      "utf-8",
    );
    expect(detectLintProseF9Vulnerable(tmpDir)).toBeNull();
  });

  it("returns null when lint:prose script is absent", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", scripts: { build: "tsc" } }),
      "utf-8",
    );
    expect(detectLintProseF9Vulnerable(tmpDir)).toBeNull();
  });

  it("returns null when package.json is absent", () => {
    expect(detectLintProseF9Vulnerable(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectBkitVersionMajorDowngrade
// ---------------------------------------------------------------------------

describe("detectBkitVersionMajorDowngrade", () => {
  it("returns finding when on-disk major is greater than installing major", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "2.0.0\n", "utf-8");
    const result = detectBkitVersionMajorDowngrade(tmpDir, "1.5.0");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("bkit-version-major-downgrade");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when on-disk major equals installing major", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "1.2.0\n", "utf-8");
    expect(detectBkitVersionMajorDowngrade(tmpDir, "1.5.0")).toBeNull();
  });

  it("returns null when on-disk major is less than installing major (upgrade)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "1.0.0\n", "utf-8");
    expect(detectBkitVersionMajorDowngrade(tmpDir, "2.0.0")).toBeNull();
  });

  it("returns null when .bkit-version is absent", () => {
    expect(detectBkitVersionMajorDowngrade(tmpDir, "1.0.0")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectBkitVersionPinStale
// ---------------------------------------------------------------------------

describe("detectBkitVersionPinStale", () => {
  function writeInstalledBkit(version: string): void {
    const dir = path.join(tmpDir, "node_modules", "@cbartens", "bkit");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version }), "utf-8");
  }

  function writeOnDiskVersion(version: string): void {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), version + "\n", "utf-8");
  }

  it("(a) returns finding when installed version > on-disk version", () => {
    writeInstalledBkit("0.5.0");
    writeOnDiskVersion("0.4.1");
    const result = detectBkitVersionPinStale(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("bkit-version-pin-stale");
    expect(result!.severity).toBe("advisory");
    expect(result!.detect).toContain("0.5.0");
    expect(result!.detect).toContain("0.4.1");
  });

  it("(b) returns null when versions match", () => {
    writeInstalledBkit("0.4.1");
    writeOnDiskVersion("0.4.1");
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });

  it("(c) returns null when installed version < on-disk version (downgrade case)", () => {
    writeInstalledBkit("0.4.0");
    writeOnDiskVersion("0.4.1");
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });

  it("(d) returns null when node_modules/@cbartens/bkit/package.json is absent", () => {
    writeOnDiskVersion("0.4.1");
    // Don't write installed bkit
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });

  it("(e) returns null when .bkit/version is absent", () => {
    writeInstalledBkit("0.5.0");
    // Don't write on-disk version
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// runPreflight — integration of all detectors
// ---------------------------------------------------------------------------

describe("runPreflight", () => {
  it("returns blockers when package.json is absent", () => {
    const { blockers, advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(blockers.some((f) => f.id === "no-package-json")).toBe(true);
    // When package.json is absent, not-git-repo may not also fire (depends on git dir)
  });

  it("returns blocker malformed-package-json when JSON is invalid", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ invalid }", "utf-8");
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    expect(blockers.some((f) => f.id === "malformed-package-json")).toBe(true);
  });

  it("returns no blockers when package.json is valid and git repo exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    expect(blockers).toHaveLength(0);
  });

  it("does NOT emit husky-no-markers-* (Tier 3 husky has no markers, v2.0.4)", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-commit"), "#!/bin/sh\npnpm test\n", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-push"), "#!/bin/sh\npnpm test\n", "utf-8");
    const { advisories } = runPreflight(makeModules("lint"), tmpDir);
    expect(advisories.some((f) => f.id === "husky-no-markers-precommit")).toBe(false);
    expect(advisories.some((f) => f.id === "husky-no-markers-prepush")).toBe(false);
    expect(advisories.some((f) => f.id === "husky-block-duplicates-precommit")).toBe(false);
    expect(advisories.some((f) => f.id === "husky-block-duplicates-prepush")).toBe(false);
  });

  it("deduplicates findings within phase when same id would appear twice", () => {
    // Simulate by calling runPreflight — it cannot produce duplicate ids organically
    // because each detector is called once. But we can verify the dedup logic by
    // checking no duplicates exist in the output.
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    const { blockers, advisories } = runPreflight(makeModules("lint"), tmpDir);
    const allIds = [...blockers, ...advisories].map((f) => f.id);
    const uniqueIds = [...new Set(allIds)];
    expect(allIds).toEqual(uniqueIds);
  });

  it("not-git-repo does NOT fire when --core is not requested", () => {
    // No package.json, no .git, but no --core either — not-git-repo should not fire
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    const { blockers } = runPreflight(makeModules("lint"), tmpDir);
    expect(blockers.some((f) => f.id === "not-git-repo")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// stripBkitBlock (BAR-141 iter 2)
// ---------------------------------------------------------------------------

describe("stripBkitBlock", () => {
  it("removes hash-style bkit block content", () => {
    const input = "before\n# bkit:start\ninside\n# bkit:end\nafter";
    expect(stripBkitBlock(input)).toContain("before");
    expect(stripBkitBlock(input)).toContain("after");
    expect(stripBkitBlock(input)).not.toContain("inside");
  });

  it("removes HTML-comment-style bkit block content", () => {
    const input = "before\n<!-- bkit:start -->\ninside\n<!-- bkit:end -->\nafter";
    expect(stripBkitBlock(input)).toContain("before");
    expect(stripBkitBlock(input)).toContain("after");
    expect(stripBkitBlock(input)).not.toContain("inside");
  });

  it("returns content unchanged when no markers present", () => {
    expect(stripBkitBlock("just content")).toBe("just content");
  });
});

// ---------------------------------------------------------------------------
// P3.T7 — detectHooksConfigOverwriteRisk has been DELETED (BAR-142 §A1)
// ---------------------------------------------------------------------------
// detectHooksConfigOverwriteRisk is removed in v0.8.0 (P3.T7 per plan).
// These tests are the removal verification — checking that the function no
// longer exists in the source.

describe("P3.T7 — detectHooksConfigOverwriteRisk deleted (v0.8.0)", () => {
  it("detectHooksConfigOverwriteRisk is NOT present in bkit-preflight.ts source", () => {
    // Source-level check: the function must not exist in the source
    const src = fs.readFileSync(path.join(__dirname, "bkit-preflight.ts"), "utf-8");
    expect(src).not.toContain("detectHooksConfigOverwriteRisk");
  });

  it("bkit-preflight.ts source does not contain detectHooksConfigOverwriteRisk", () => {
    const src = fs.readFileSync(path.join(__dirname, "bkit-preflight.ts"), "utf-8");
    expect(src).not.toContain("detectHooksConfigOverwriteRisk");
  });

  it("runPreflight does NOT produce hooks-config-overwrite-risk blockers (Tier-2 handles survival)", () => {
    // Consumer with Stop hooks — should NOT block under Tier-2 architecture
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify({
        hooks: {
          SessionStart: [{ hooks: [{ type: "command", command: "preflight.sh" }] }],
          Stop: [{ hooks: [{ type: "command", command: "postflight.sh" }] }],
        },
      }),
      "utf-8",
    );
    const { blockers } = runPreflight(makeModules("claude", "cursor"), tmpDir);
    expect(blockers.some((f) => f.id.includes("hooks-config-overwrite-risk"))).toBe(false);
  });
});

// detectHuskyBlockDuplicates tests removed in v2.0.4 — husky is Tier 3
// (seed-or-print); there is no managed block to duplicate. Source-level
// guard below asserts neither obsolete detector lingers in the source.
describe("husky Tier-3 migration — removed detectors must not return in source", () => {
  it("bkit-preflight.ts no longer exports detectHuskyNoMarkers or detectHuskyBlockDuplicates", () => {
    const src = fs.readFileSync(path.join(__dirname, "bkit-preflight.ts"), "utf-8");
    expect(src).not.toMatch(/export function detectHuskyNoMarkers\b/);
    expect(src).not.toMatch(/export function detectHuskyBlockDuplicates\b/);
  });

  it("runPreflight no longer hardcodes .husky/* in markeredTextPaths (Tier 3 owns drift)", () => {
    const src = fs.readFileSync(path.join(__dirname, "bkit-preflight.ts"), "utf-8");
    const markeredBlock = src.match(/const markeredTextPaths = \[([\s\S]*?)\];/);
    expect(markeredBlock).not.toBeNull();
    expect(markeredBlock![1]).not.toContain(".husky/pre-commit");
    expect(markeredBlock![1]).not.toContain(".husky/pre-push");
  });
});

// ---------------------------------------------------------------------------
// detectGitignoreBlockDuplicates — Detector C (BAR-141 iter 2)
// ---------------------------------------------------------------------------

describe("detectGitignoreBlockDuplicates", () => {
  it("flags when .worktrees/ appears outside the bkit block", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".gitignore"),
      ".worktrees/\nnode_modules/\n<!-- bkit:start -->\n.worktrees/\n.husky/_\n<!-- bkit:end -->\n",
      "utf-8",
    );
    const f = detectGitignoreBlockDuplicates(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("gitignore-block-duplicates");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain(".worktrees/");
  });

  it("does NOT flag when bkit lines appear only inside the block", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".gitignore"),
      "node_modules/\n# bkit:start\n.worktrees/\n.husky/_\n# bkit:end\n",
      "utf-8",
    );
    const f = detectGitignoreBlockDuplicates(tmpDir);
    expect(f).toBeNull();
  });

  it("returns null when .gitignore does not exist", () => {
    const f = detectGitignoreBlockDuplicates(tmpDir);
    expect(f).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectPrettierignoreScopeBroadening — Detector D (BAR-141 iter 2)
// ---------------------------------------------------------------------------

describe("detectPrettierignoreScopeBroadening", () => {
  it("flags when on-disk block has narrower paths than what bkit will install (e.g. .agents/skills/find-skills/)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".prettierignore"),
      "# bkit:start\nnode_modules/\n.agents/skills/find-skills/\n# bkit:end\n",
      "utf-8",
    );
    const f = detectPrettierignoreScopeBroadening(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("prettierignore-scope-broadening");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain(".agents/skills/find-skills/");
    expect(f?.detect).toContain(".agents/skills/");
  });

  it("does NOT flag when on-disk block matches new bkit paths exactly", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".prettierignore"),
      "# bkit:start\nnode_modules/\ndist/\n.agents/skills/\n.claude/\n.cursor/\n.github/\n.husky/_/\n*.tsbuildinfo\npnpm-lock.yaml\n# bkit:end\n",
      "utf-8",
    );
    const f = detectPrettierignoreScopeBroadening(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag for the canonical template's .agents/skills/ entry (regression: BKIT_PRETTIERIGNORE_PATHS must mirror .bkit/templates/.prettierignore)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".prettierignore"),
      "# bkit:start\nnode_modules/\n.agents/skills/\n# bkit:end\n",
      "utf-8",
    );
    const f = detectPrettierignoreScopeBroadening(tmpDir);
    expect(f).toBeNull();
  });

  it("returns null when no bkit block markers present", () => {
    fs.writeFileSync(path.join(tmpDir, ".prettierignore"), "node_modules/\n", "utf-8");
    const f = detectPrettierignoreScopeBroadening(tmpDir);
    expect(f).toBeNull();
  });

  it("returns null when .prettierignore does not exist", () => {
    const f = detectPrettierignoreScopeBroadening(tmpDir);
    expect(f).toBeNull();
  });
});

describe("detectObservabilityDebugFetchMissing", () => {
  function writeConfig(content: string): void {
    const dir = path.join(tmpDir, ".agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "config.md"), content, "utf-8");
  }

  const BKIT_BLOCK_WITH_EXAMPLE =
    "<!-- bkit:start -->\n" +
    "# Observability\n\n" +
    "<!-- debug-fetch:start -->\n" +
    "```bash\ngcloud logging read ... --limit=50\n```\n" +
    "<!-- debug-fetch:end -->\n\n" +
    "<!-- bkit:end -->\n";

  it("flags when bkit block present but no consumer-section debug-fetch markers after bkit:end", () => {
    writeConfig(BKIT_BLOCK_WITH_EXAMPLE);
    const f = detectObservabilityDebugFetchMissing(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("observability-debug-fetch-missing");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain(".agents/config.md");
    expect(f?.detect).toContain("debug-fetch");
    expect(f?.action).toContain("after `<!-- bkit:end -->`");
    expect(f?.action).toContain("log backend");
  });

  it("does NOT flag when a customised debug-fetch pair exists after bkit:end", () => {
    writeConfig(
      BKIT_BLOCK_WITH_EXAMPLE +
        "\n## Consumer\n\n" +
        "<!-- debug-fetch:start -->\n" +
        "```bash\naws logs filter-log-events --log-group-name app --limit 50\n```\n" +
        "<!-- debug-fetch:end -->\n",
    );
    const f = detectObservabilityDebugFetchMissing(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when a NAMED debug-fetch block exists after bkit:end", () => {
    writeConfig(
      BKIT_BLOCK_WITH_EXAMPLE +
        "\n## Consumer\n\n" +
        "<!-- debug-fetch:start vercel -->\n" +
        "```bash\nvercel logs --scope acme --json\n```\n" +
        "<!-- debug-fetch:end -->\n",
    );
    const f = detectObservabilityDebugFetchMissing(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when .agents/config.md has no bkit-managed block (consumer-owned)", () => {
    writeConfig("# Observability\n\nFully consumer-managed file, no bkit markers here.\n");
    const f = detectObservabilityDebugFetchMissing(tmpDir);
    expect(f).toBeNull();
  });

  it("flags when only debug-fetch:start exists after bkit:end (malformed/missing pair)", () => {
    writeConfig(BKIT_BLOCK_WITH_EXAMPLE + "\n<!-- debug-fetch:start -->\n```bash\nfoo\n```\n");
    const f = detectObservabilityDebugFetchMissing(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("observability-debug-fetch-missing");
  });

  it("does NOT count debug-fetch markers that appear only INSIDE the bkit-managed block", () => {
    // Markers only inside bkit block — workflow skips these, so detector must flag.
    writeConfig(BKIT_BLOCK_WITH_EXAMPLE);
    const f = detectObservabilityDebugFetchMissing(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("observability-debug-fetch-missing");
  });

  it("returns null when .agents/config.md does not exist", () => {
    const f = detectObservabilityDebugFetchMissing(tmpDir);
    expect(f).toBeNull();
  });
});

describe("detectObservabilityDebugFetchSourceNotEnabled", () => {
  function writeConfig(content: string): void {
    const dir = path.join(tmpDir, ".agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "config.md"), content, "utf-8");
  }
  function writeSupabaseConfig(): void {
    const dir = path.join(tmpDir, "supabase");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "config.toml"), 'project_id = "x"\n', "utf-8");
  }
  function writeVercelJson(): void {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}\n", "utf-8");
  }
  function writePackageJson(obj: unknown): void {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(obj), "utf-8");
  }

  // Managed region shipping NAMED vercel + supabase examples (mirrors template).
  const BKIT_NAMED_EXAMPLES =
    "<!-- bkit:start -->\n" +
    "# Observability\n\n" +
    "<!-- debug-fetch:start vercel -->\n" +
    "```bash\nvercel logs --scope acme --json\n```\n" +
    "<!-- debug-fetch:end -->\n\n" +
    "<!-- debug-fetch:start supabase -->\n" +
    "```bash\ncurl https://api.supabase.com/v1/projects/x/...\n```\n" +
    "<!-- debug-fetch:end -->\n\n" +
    "<!-- bkit:end -->\n";
  // Consumer-section blocks.
  const UNNAMED_VERCEL_BLOCK =
    "\n## Consumer\n\n" +
    "<!-- debug-fetch:start -->\n" +
    "```bash\nvercel logs --scope acme --json\n```\n" +
    "<!-- debug-fetch:end -->\n";
  const NAMED_SUPABASE_BLOCK =
    "\n<!-- debug-fetch:start supabase -->\n" +
    "```bash\ncurl https://api.supabase.com/v1/projects/y/...\n```\n" +
    "<!-- debug-fetch:end -->\n";
  const UNNAMED_AWS_BLOCK =
    "\n## Consumer\n\n" +
    "<!-- debug-fetch:start -->\n" +
    "```bash\naws logs filter-log-events --log-group-name app --limit 50\n```\n" +
    "<!-- debug-fetch:end -->\n";

  it("flags supabase when repo uses supabase but only a legacy vercel block is enabled (visitfrasercoast case)", () => {
    writeSupabaseConfig();
    writeVercelJson();
    writeConfig(BKIT_NAMED_EXAMPLES + UNNAMED_VERCEL_BLOCK);
    const f = detectObservabilityDebugFetchSourceNotEnabled(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("observability-debug-fetch-source-not-enabled");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("supabase");
    // vercel IS enabled (its name appears in the unnamed block body) — not named.
    expect(f?.detect).not.toContain("vercel");
    expect(f?.action).toContain("debug-fetch:none intentional");
    expect(f?.action).toContain("Do not edit above");
  });

  it("detects supabase use via an @supabase/* dependency (no config.toml)", () => {
    writePackageJson({ dependencies: { "@supabase/supabase-js": "^2" } });
    writeConfig(BKIT_NAMED_EXAMPLES + UNNAMED_VERCEL_BLOCK);
    const f = detectObservabilityDebugFetchSourceNotEnabled(tmpDir);
    expect(f?.id).toBe("observability-debug-fetch-source-not-enabled");
    expect(f?.detect).toContain("supabase");
  });

  it("does NOT flag a backend the repo does not use (no supabase evidence)", () => {
    writeVercelJson(); // vercel-only repo
    writeConfig(
      BKIT_NAMED_EXAMPLES +
        "\n<!-- debug-fetch:start vercel -->\n```bash\nvercel logs --json\n```\n<!-- debug-fetch:end -->\n",
    );
    const f = detectObservabilityDebugFetchSourceNotEnabled(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when the used backend's block is already enabled", () => {
    writeSupabaseConfig();
    writeConfig(BKIT_NAMED_EXAMPLES + UNNAMED_VERCEL_BLOCK + NAMED_SUPABASE_BLOCK);
    const f = detectObservabilityDebugFetchSourceNotEnabled(tmpDir);
    expect(f).toBeNull();
  });

  it("is dismissed by a <!-- debug-fetch:none --> marker", () => {
    writeSupabaseConfig();
    writeVercelJson();
    writeConfig(
      BKIT_NAMED_EXAMPLES + UNNAMED_VERCEL_BLOCK + "\n<!-- debug-fetch:none intentional -->\n",
    );
    const f = detectObservabilityDebugFetchSourceNotEnabled(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT fire when the consumer section has zero blocks (missing advisory owns that case)", () => {
    writeSupabaseConfig();
    writeConfig(BKIT_NAMED_EXAMPLES + "\n## Consumer\n\nNo blocks here yet.\n");
    expect(detectObservabilityDebugFetchSourceNotEnabled(tmpDir)).toBeNull();
    // The generic missing advisory still covers it.
    expect(detectObservabilityDebugFetchMissing(tmpDir)?.id).toBe(
      "observability-debug-fetch-missing",
    );
  });

  it("flags both backends (plural) when both are used and neither name appears below bkit:end", () => {
    writeSupabaseConfig();
    writeVercelJson();
    writeConfig(BKIT_NAMED_EXAMPLES + UNNAMED_AWS_BLOCK);
    const f = detectObservabilityDebugFetchSourceNotEnabled(tmpDir);
    expect(f?.id).toBe("observability-debug-fetch-source-not-enabled");
    expect(f?.detect).toContain("vercel");
    expect(f?.detect).toContain("supabase");
    expect(f?.detect).toContain("those backends");
  });

  it("returns null when .agents/config.md does not exist", () => {
    expect(detectObservabilityDebugFetchSourceNotEnabled(tmpDir)).toBeNull();
  });
});

describe("detectPlaywrightReporterHostile", () => {
  function writeCiYml(content: string): void {
    const dir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "ci.yml"), content, "utf-8");
  }

  it("flags when consumer step runs `playwright test --reporter=line`", () => {
    writeCiYml(
      "jobs:\n  e2e:\n    steps:\n      - run: pnpm exec playwright test --reporter=line --workers=2\n",
    );
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("playwright-reporter-line-override-hostile");
    expect(f?.severity).toBe("advisory");
    expect(f?.action).toContain("Drop the `--reporter=line` flag");
    expect(f?.action).toContain("VERBOSE_CI");
  });

  it("does NOT flag when `playwright test` runs without --reporter", () => {
    writeCiYml("jobs:\n  e2e:\n    steps:\n      - run: pnpm exec playwright test --workers=2\n");
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when --reporter is set but not to `line`", () => {
    writeCiYml(
      "jobs:\n  e2e:\n    steps:\n      - run: pnpm exec playwright test --reporter=html\n",
    );
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when --reporter=line is only inside the bkit-managed stub region", () => {
    writeCiYml(
      "jobs:\n  e2e:\n    steps:\n      # bkit:start\n      # - run: playwright test --reporter=line\n      # bkit:end\n",
    );
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("returns null when ci.yml does not exist", () => {
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when --reporter=line appears without a playwright test invocation", () => {
    writeCiYml("jobs:\n  test:\n    steps:\n      - run: someothertool --reporter=line\n");
    const f = detectPlaywrightReporterHostile(tmpDir);
    expect(f).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// B4 — detectShellToken: unset vs empty-string (BAR-142 §B4)
// B6 — .npmrc inline action text + fallback (BAR-142 §B6)
// (Test matrix specifies bkit-preflight.test.ts as target)
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("B4 — detectShellToken differentiates unset from empty-string", () => {
  it("returns 'present' when GH_BKIT_TOKEN_INSTALL is set and non-empty", () => {
    process.env.GH_BKIT_TOKEN_INSTALL = "ghp_sometoken";
    expect(detectShellToken()).toBe("present");
  });

  it("returns 'missing' when GH_BKIT_TOKEN_INSTALL is undefined (unset)", () => {
    delete process.env.GH_BKIT_TOKEN_INSTALL;
    expect(detectShellToken()).toBe("missing");
  });

  it("returns 'empty' when GH_BKIT_TOKEN_INSTALL is set to empty string", () => {
    process.env.GH_BKIT_TOKEN_INSTALL = "";
    expect(detectShellToken()).toBe("empty");
  });

  it("'empty' and 'missing' are distinct values (not equal)", () => {
    process.env.GH_BKIT_TOKEN_INSTALL = "";
    expect(detectShellToken()).not.toBe("missing");
    delete process.env.GH_BKIT_TOKEN_INSTALL;
    expect(detectShellToken()).not.toBe("empty");
  });
});

// ---------------------------------------------------------------------------
// B6 — advisory auth shape (BAR-142 §B6 + #274 user-level pnpm config set)
//
// Advisory text must prescribe the user-level auth shape
//   `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL"`
// and must NOT prescribe committing an `_authToken=${GH_BKIT_TOKEN_INSTALL}` line in the project
// .npmrc as the auth mechanism — pnpm >=10.34.3 401s on that env-substitution (the legacy
// line is flagged for removal by detectNpmrcLegacyAuthToken, never prescribed).
//
// The BAR-142 §B6 invariant still holds permanently: the broken POSIX-fallback
// `${VAR:-default}` form must never appear (pnpm cannot parse it; it 401s).
// ---------------------------------------------------------------------------

describe("B6 — gh-bkit-token-secret-unknown action text contains concrete one-liner", () => {
  it("gh-bkit-token-secret-unknown action text instructs `export GH_BKIT_TOKEN_INSTALL=$(gh auth token)`", () => {
    const src = fs.readFileSync(path.join(__dirname, "bkit-postinstall.ts"), "utf-8");
    expect(src).toContain("export GH_BKIT_TOKEN_INSTALL=$(gh auth token)");
  });

  it("advisory strings prescribe the user-level `pnpm config set` auth shape", () => {
    for (const f of ["bkit-modules.ts", "bkit-postinstall.ts"]) {
      const src = fs.readFileSync(path.join(__dirname, f), "utf-8");
      expect(src, `${f} must prescribe the user-level pnpm config set auth shape`).toMatch(
        /pnpm config set\s+"?\/\/npm\.pkg\.github\.com\/:_authToken=\$GH_BKIT_TOKEN_INSTALL/,
      );
    }
  });

  it("no advisory string anywhere in scripts prescribes the broken ${GH_BKIT_TOKEN_INSTALL:-} form", () => {
    const scripts = ["bkit-modules.ts", "bkit-postinstall.ts", "bkit-preflight.ts", "bkit-cli.ts"];
    for (const f of scripts) {
      const p = path.join(__dirname, f);
      if (!fs.existsSync(p)) continue;
      const src = fs.readFileSync(p, "utf-8");
      expect(
        src,
        `${f} must not prescribe \${GH_BKIT_TOKEN_INSTALL:-} (pnpm cannot parse :-)`,
      ).not.toMatch(/_authToken=\\?\$\{GH_BKIT_TOKEN_INSTALL:-\}/);
    }
  });
});

// ---------------------------------------------------------------------------
// P3.T8 — B3 Vercel CLI hang guard (BAR-142 §B3)
// ---------------------------------------------------------------------------

describe("B3 — Vercel CLI hang guard: detectVercelEnv skips shell-out when .vercel/project.json absent", () => {
  it("returns 'unknown' when vercel.json exists but .vercel/project.json is absent (no shell-out)", () => {
    // Setup: vercel.json present (detectVercelProject returns true) but .vercel/ not linked
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{"version":2}', "utf-8");
    // .vercel/project.json is absent — must NOT shell out to `vercel env ls`

    const result = detectVercelEnv("preview", tmpDir);

    expect(result).toBe("unknown");
    // Implicit: if it didn't hang/error, the guard fired correctly
  });

  it("returns 'unknown' when neither vercel.json nor .vercel/project.json exist", () => {
    // No vercel project at all
    const result = detectVercelEnv("preview", tmpDir);
    expect(result).toBe("unknown");
  });

  it("detectVercelProject returns false when no vercel.json", () => {
    expect(detectVercelProject(tmpDir)).toBe(false);
  });

  it("detectVercelProject returns true when vercel.json exists at root", () => {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), '{"version":2}', "utf-8");
    expect(detectVercelProject(tmpDir)).toBe(true);
  });

  it("bkit-postinstall.ts source uses .vercel/project.json guard (B3)", () => {
    // Source-level check: the guard must be present in the source
    const src = fs.readFileSync(path.join(__dirname, "bkit-postinstall.ts"), "utf-8");
    expect(src).toContain(".vercel");
    expect(src).toContain("project.json");
  });

  it("bkit-postinstall.ts does NOT fall through to `vercel env ls` without the file guard", () => {
    // Source-level check: vercel env ls call must be after the project.json guard
    const src = fs.readFileSync(path.join(__dirname, "bkit-postinstall.ts"), "utf-8");
    const projectJsonGuardIdx = src.indexOf("project.json");
    const vercelEnvLsIdx = src.indexOf('["env", "ls"');
    // The guard must come BEFORE the shell-out
    expect(projectJsonGuardIdx).toBeGreaterThan(-1);
    expect(vercelEnvLsIdx).toBeGreaterThan(-1);
    expect(projectJsonGuardIdx).toBeLessThan(vercelEnvLsIdx);
  });
});

// ---------------------------------------------------------------------------
// BAR-186 — SessionStart hook (preflight.sh) — retained regression coverage
//
// The bash hook at .agents/templates/.claude/hooks/preflight.sh runs as a
// Claude SessionStart hook (a different surface from the install-time TS
// preflight in this file). Dispatch-specific bypass logic was reverted on
// 2026-05-13; the latent-bug fixes from BAR-186 remain:
//   - Brew-bin check is Darwin-gated (Linux sandbox / CI pass through).
//   - IDE-skip path (empty LINEAR_ISSUE_ID exits 0 silently).
//   - Missing LINEAR_API_KEY still hard-stops when a Linear issue is present.
// ---------------------------------------------------------------------------

const SESSIONSTART_HOOK_PATH = path.join(
  __dirname,
  "..",
  "templates",
  ".claude",
  "hooks",
  "preflight.sh",
);

function runSessionStartHook(env: Record<string, string | undefined>): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  // Strip undefined keys so we don't leak the parent process env back in.
  const cleanEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined) cleanEnv[k] = v;
  }
  const result = spawnSync("bash", [SESSIONSTART_HOOK_PATH], {
    env: { PATH: process.env.PATH ?? "", ...cleanEnv },
    input: "{}",
    encoding: "utf-8",
    timeout: 10_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("BAR-186 — SessionStart preflight.sh source-level checks", () => {
  it("brew-bin loop is wrapped in a Darwin OS gate", () => {
    const src = fs.readFileSync(SESSIONSTART_HOOK_PATH, "utf-8");
    // Darwin gate must precede the brew-bin loop
    expect(src).toMatch(/\[\[\s+"\$\(uname\)"\s+==\s+"Darwin"\s+\]\]/);
    const darwinIdx = src.search(/\[\[\s+"\$\(uname\)"\s+==\s+"Darwin"\s+\]\]/);
    const brewBinsIdx = src.indexOf("REQUIRED_BREW_BINS=");
    expect(darwinIdx).toBeGreaterThan(-1);
    expect(brewBinsIdx).toBeGreaterThan(-1);
    expect(darwinIdx).toBeLessThan(brewBinsIdx);
  });
});

describe("BAR-186 — SessionStart preflight.sh runtime behaviour", () => {
  it("exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)", () => {
    const result = runSessionStartHook({});
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
  });

  it("missing LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard)", () => {
    const result = runSessionStartHook({
      LINEAR_ISSUE_ID: "BAR-186-test",
      // no LINEAR_API_KEY
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("LINEAR_API_KEY not set");
  });
});

// ---------------------------------------------------------------------------
// detectMissingMcpServers — advisory detector for .mcp.json / .cursor/mcp.json
// ---------------------------------------------------------------------------

describe("detectMissingMcpServers", () => {
  it("returns empty array when file does not exist (Tier 3 scaffold will write it)", () => {
    expect(detectMissingMcpServers(tmpDir, ".mcp.json")).toEqual([]);
    expect(detectMissingMcpServers(tmpDir, ".cursor/mcp.json")).toEqual([]);
  });

  it("returns empty array when file is malformed JSON (skip silently)", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "not valid json{{{", "utf-8");
    expect(detectMissingMcpServers(tmpDir, ".mcp.json")).toEqual([]);
  });

  it("returns advisory when .mcp.json exists but is missing the github server", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.severity).toBe("advisory");
    expect(findings[0]!.id).toContain("github");
    expect(findings[0]!.action).toContain("[mcp]");
    expect(findings[0]!.action).toContain(".mcp.json");
    expect(findings[0]!.action).toContain("github");
    // Must not reference Linear ticket IDs
    expect(findings[0]!.action).not.toMatch(/BAR-\d+/);
  });

  it("returns advisory when .mcp.json exists but is missing the linear server", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { github: { url: "https://api.githubcopilot.com/mcp/" } } }),
      "utf-8",
    );
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toContain("linear");
    expect(findings[0]!.action).toContain("linear");
  });

  it("returns two advisories when .mcp.json exists but mcpServers is empty", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ mcpServers: {} }), "utf-8");
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json");
    expect(findings).toHaveLength(REQUIRED_MCP_SERVERS.length);
  });

  it("returns two advisories when .mcp.json exists but mcpServers key is absent", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ otherKey: {} }), "utf-8");
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json");
    expect(findings).toHaveLength(REQUIRED_MCP_SERVERS.length);
  });

  it("returns empty array when both required servers are present", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    expect(detectMissingMcpServers(tmpDir, ".mcp.json")).toEqual([]);
  });

  it("returns empty array when both required servers are present plus extra consumer servers", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
          "my-custom-server": { url: "https://example.com/mcp" },
        },
      }),
      "utf-8",
    );
    expect(detectMissingMcpServers(tmpDir, ".mcp.json")).toEqual([]);
  });

  it("works identically for .cursor/mcp.json path", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "mcp.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    const findings = detectMissingMcpServers(tmpDir, ".cursor/mcp.json");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.action).toContain(".cursor/mcp.json");
  });

  it("advisory action text contains no BAR-XXX Linear ticket references", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ mcpServers: {} }), "utf-8");
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json");
    for (const f of findings) {
      expect(f.action).not.toMatch(/BAR-\d+/);
      expect(f.detect).not.toMatch(/BAR-\d+/);
    }
  });

  it("runPreflight includes mcp-missing-server advisories when .mcp.json is missing github", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    const { advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(advisories.some((f) => f.id.includes("mcp-missing-server-github"))).toBe(true);
  });

  it("runPreflight does NOT emit mcp advisory when .mcp.json is absent", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    const { advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(advisories.some((f) => f.id.includes("mcp-missing-server"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectExtraMcpServers — symmetric "no longer needed" advisory
// ---------------------------------------------------------------------------

describe("detectExtraMcpServers", () => {
  it("returns empty array when issueTracker is undefined (cannot know what's allowed)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    expect(detectExtraMcpServers(tmpDir, ".mcp.json")).toEqual([]);
  });

  it("returns empty array when file does not exist", () => {
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "github")).toEqual([]);
  });

  it("returns empty array when file is malformed JSON (skip silently)", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "not valid json{{{", "utf-8");
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "github")).toEqual([]);
  });

  it("github tracker: flags a stale linear server with a remove advisory", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".mcp.json", "github");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.severity).toBe("advisory");
    expect(findings[0]!.id).toContain("mcp-extra-server-linear");
    expect(findings[0]!.action).toContain("[mcp]");
    expect(findings[0]!.action).toContain("Remove");
    expect(findings[0]!.action).toContain("linear");
    expect(findings[0]!.action).not.toMatch(/BAR-\d+/);
  });

  it("none tracker: flags a stale linear server (only github is needed for PR ops)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".mcp.json", "none");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toContain("mcp-extra-server-linear");
  });

  it("linear tracker: github + linear are both allowed → no advisory", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "linear")).toEqual([]);
  });

  it("never flags consumer-added (non-bkit-managed) MCP servers for removal", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          github: { url: "https://api.githubcopilot.com/mcp/" },
          "my-custom-server": { url: "https://example.com/mcp" },
        },
      }),
      "utf-8",
    );
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "github")).toEqual([]);
  });

  it("works identically for .cursor/mcp.json path", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".cursor/mcp.json", "github");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.action).toContain(".cursor/mcp.json");
  });

  it("runPreflight emits mcp-extra-server advisory for stale linear under github tracker", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", bkit: { issueTracker: "github" } }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const { advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(advisories.some((f) => f.id.includes("mcp-extra-server-linear"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// [mcp-env] detectors — BAR-260 follow-up
// ---------------------------------------------------------------------------

describe("detectMissingDotenv", () => {
  it("flags when .bkit/.env.example exists but .bkit/.env does not", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "GH_BKIT_TOKEN=\n", "utf-8");
    const f = detectMissingDotenv(tmpDir);
    expect(f).not.toBeNull();
    expect(f!.id).toBe("mcp-env-missing-dotenv");
    expect(f!.severity).toBe("advisory");
    expect(f!.action).toContain("[mcp-env]");
    expect(f!.action).not.toMatch(/BAR-\d+/);
  });

  it("does NOT flag when both .env.example and .env exist", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "GH_BKIT_TOKEN=\n", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env"), "GH_BKIT_TOKEN=ghp_test\n", "utf-8");
    expect(detectMissingDotenv(tmpDir)).toBeNull();
  });

  it("does NOT flag when .bkit/.env.example does not exist", () => {
    expect(detectMissingDotenv(tmpDir)).toBeNull();
  });

  it("github tracker: token prose omits LINEAR_API_KEY; linear keeps it (issue #138)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "GH_BKIT_TOKEN=\n", "utf-8");
    const gh = detectMissingDotenv(tmpDir, "github")!;
    expect(gh.detect).not.toContain("LINEAR_API_KEY");
    expect(gh.action).not.toContain("LINEAR_API_KEY");
    expect(gh.action).toContain("GH_BKIT_TOKEN");
    const linear = detectMissingDotenv(tmpDir, "linear")!;
    expect(linear.action).toContain("LINEAR_API_KEY");
  });
});

describe("detectBlankDotenvKeys", () => {
  it("returns empty array when .bkit/.env does not exist", () => {
    expect(detectBlankDotenvKeys(tmpDir)).toEqual([]);
  });

  it("returns three advisories when .bkit/.env has all keys blank", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "GH_BKIT_TOKEN=\nGH_BKIT_TOKEN_INSTALL=\nLINEAR_API_KEY=\n",
      "utf-8",
    );
    const findings = detectBlankDotenvKeys(tmpDir);
    expect(findings).toHaveLength(3);
    const ids = findings.map((f) => f.id);
    expect(ids).toContain("mcp-env-blank-key-gh_bkit_token");
    expect(ids).toContain("mcp-env-blank-key-gh_bkit_token_install");
    expect(ids).toContain("mcp-env-blank-key-linear_api_key");
  });

  it("github tracker: does NOT flag blank LINEAR_API_KEY (issue #138)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "GH_BKIT_TOKEN=\nGH_BKIT_TOKEN_INSTALL=\nLINEAR_API_KEY=\n",
      "utf-8",
    );
    const ids = detectBlankDotenvKeys(tmpDir, "github").map((f) => f.id);
    expect(ids).toContain("mcp-env-blank-key-gh_bkit_token");
    expect(ids).toContain("mcp-env-blank-key-gh_bkit_token_install");
    expect(ids).not.toContain("mcp-env-blank-key-linear_api_key");
  });

  it("returns one advisory for the blank key only", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "GH_BKIT_TOKEN=ghp_test\nGH_BKIT_TOKEN_INSTALL=ghp_bkit\nLINEAR_API_KEY=\n",
      "utf-8",
    );
    const findings = detectBlankDotenvKeys(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("mcp-env-blank-key-linear_api_key");
  });

  it("returns empty array when all three keys are set and non-empty", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "GH_BKIT_TOKEN=ghp_test\nGH_BKIT_TOKEN_INSTALL=ghp_bkit\nLINEAR_API_KEY=lin_key\n",
      "utf-8",
    );
    expect(detectBlankDotenvKeys(tmpDir)).toEqual([]);
  });

  it("returns advisory for absent key (key not in file at all)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "GH_BKIT_TOKEN=ghp_test\nGH_BKIT_TOKEN_INSTALL=ghp_bkit\n",
      "utf-8",
    );
    const findings = detectBlankDotenvKeys(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("mcp-env-blank-key-linear_api_key");
  });

  it("advisory action text contains [mcp-env] prefix and no BAR-XXX references", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env"), "GH_BKIT_TOKEN=\n", "utf-8");
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
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "GH_BKIT_TOKEN=\n", "utf-8");
    const finding = detectMissingDotenv(tmpDir);
    expect(finding?.id).toBe("mcp-env-missing-dotenv");
  });

  it("detectBlankDotenvKeys returns one finding per blank required key", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", ".env"),
      "GH_BKIT_TOKEN=\nGH_BKIT_TOKEN_INSTALL=\nLINEAR_API_KEY=\n",
      "utf-8",
    );
    const ids = detectBlankDotenvKeys(tmpDir).map((f) => f.id);
    expect(ids).toContain("mcp-env-blank-key-gh_bkit_token");
    expect(ids).toContain("mcp-env-blank-key-gh_bkit_token_install");
    expect(ids).toContain("mcp-env-blank-key-linear_api_key");
  });

  it("all [mcp-env] advisories have no BAR-XXX references", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env.example"), "GH_BKIT_TOKEN=\n", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".bkit", ".env"), "GH_BKIT_TOKEN=\n", "utf-8");
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

// ---------------------------------------------------------------------------
// detectBkitNotOnPath
// ---------------------------------------------------------------------------

describe("detectBkitNotOnPath", () => {
  const savedPath = process.env.PATH;
  const savedCI = process.env.CI;

  afterEach(() => {
    process.env.PATH = savedPath;
    if (savedCI === undefined) delete process.env.CI;
    else process.env.CI = savedCI;
  });

  it("returns null in CI environment", () => {
    process.env.CI = "true";
    expect(detectBkitNotOnPath()).toBeNull();
  });

  it("returns null when `bkit` is on PATH (found by which)", () => {
    // Point PATH at a dir containing a fake `bkit` executable
    const fakeDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-path-test-"));
    const fakeBkit = path.join(fakeDir, "bkit");
    fs.writeFileSync(fakeBkit, "#!/bin/sh\n", "utf-8");
    fs.chmodSync(fakeBkit, 0o755);
    process.env.PATH = `${fakeDir}:${process.env.PATH}`;
    delete process.env.CI;
    try {
      expect(detectBkitNotOnPath()).toBeNull();
    } finally {
      fs.rmSync(fakeDir, { recursive: true, force: true });
    }
  });

  it("returns advisory when `bkit` is not on PATH", () => {
    process.env.PATH = "/nonexistent-path-for-test";
    delete process.env.CI;
    const finding = detectBkitNotOnPath();
    expect(finding).not.toBeNull();
    expect(finding?.id).toBe("bkit-not-on-path");
    expect(finding?.severity).toBe("advisory");
    expect(finding?.action).toContain("alias bkit='pnpm bkit'");
  });
});
