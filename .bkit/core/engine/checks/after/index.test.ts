// checks/after/index.test.ts — Unit tests for the Phase 3 runner (runPostInstallCheck), formatChecklist
// and the `.bkit/advisories.md` writer (BAR-141).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type PreflightFinding, runPreflight } from "../before/index";
import * as auth from "./auth";
import * as tools from "./tools";
import {
  formatChecklist,
  runPostInstallCheck,
  readChangelogVersionDelta,
  renderAdvisoriesMarkdown,
  writeAdvisoriesArtifact,
} from "./index";
import { detectBkitVersionMajorDowngrade, detectBkitVersionPinStale } from "../before/version";
import * as postinstall from "./index";
import type { SuppressionNote } from "./suppression";

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
    expect(result).toContain("Detect: Something was detected.");
    expect(result).toContain("Action: Do something to fix it.");
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
    expect(result).toContain("bkit advisories");
    expect(result).toContain("INSTRUCTIONS FOR AN AI AGENT");
  });

  it("carries the template-adoption directive, not just a locator", () => {
    const result = formatChecklist([{ id: "x", severity: "advisory", detect: "d", action: "a" }]);
    expect(result).toContain("adopt each copy in .bkit/templates/");
    expect(result).toContain("state which you did not adopt and why");
  });

  it("appends one suppressed line per dismissal", () => {
    const result = formatChecklist(
      [{ id: "x", severity: "advisory", detect: "d", action: "a" }],
      [{ id: "tagged-tests-no-ci-home", scope: "tooling/eslint" }],
    );
    expect(result).toContain("1 advisory suppressed by bkit.ignoreAdvisories:");
    expect(result).toContain("- tagged-tests-no-ci-home (tooling/eslint)");
  });

  it("renders the suppressed block even when no findings remain", () => {
    const result = formatChecklist(
      [],
      [
        { id: "tagged-tests-no-ci-home", scope: "tooling/eslint" },
        { id: "test-integration-env-not-asserted", scope: "." },
      ],
    );
    expect(result).toContain("bkit advisories");
    expect(result).toContain("2 advisories suppressed by bkit.ignoreAdvisories:");
    expect(result).toContain("- test-integration-env-not-asserted (.)");
  });

  it("stays silent when there is nothing to report", () => {
    expect(formatChecklist([], [])).toBe("");
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
    expect(md).toContain("adopt each copy in .bkit/templates/");
    expect(md).toContain("state which you did not adopt and why");
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

  it("renders the suppressed block and drops the clean-run stub", () => {
    const md = renderAdvisoriesMarkdown([], { mode: "check", version: "5.0.0" }, [
      { id: "tagged-tests-no-ci-home", scope: "tooling/eslint" },
    ]);
    expect(md).not.toContain("**No advisories.**");
    expect(md).toContain("1 advisory suppressed by bkit.ignoreAdvisories:");
    expect(md).toContain("- tagged-tests-no-ci-home (tooling/eslint)");
  });

  it("renders no suppressed block when nothing was dismissed", () => {
    const md = renderAdvisoriesMarkdown(
      [{ id: "x", severity: "advisory", detect: "d", action: "a" }],
      {
        mode: "check",
        version: "5.0.0",
      },
    );
    expect(md).not.toContain("suppressed by bkit.ignoreAdvisories");
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
    // Cross-phase dedup: if preflightAdvisories has an id that Phase 3 also emits,
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

    const result = runPostInstallCheck(preflightAdvisories, tmpDir);

    // Should appear exactly once
    const matches = result.filter((f) => f.id === "gh-bkit-token-unset-shell");
    expect(matches).toHaveLength(1);
    // Phase 3 wins — the detect text should NOT be the old preflight text
    expect(matches[0]!.detect).not.toBe("Old preflight detect text");
  });

  it("gh-bkit-token-unset-shell is emitted when BKIT_GH_TOKEN_INSTALL is unset", () => {
    delete process.env.BKIT_GH_TOKEN_INSTALL;
    const result = runPostInstallCheck([], tmpDir);
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
    const result = runPostInstallCheck([], tmpDir);
    expect(result.some((f) => f.id === "npmrc-missing-gh-packages")).toBe(true);
  });

  it("no finding is emitted for .npmrc when file is absent (silent skip)", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "test";
    // No .npmrc file
    const result = runPostInstallCheck([], tmpDir);
    expect(result.some((f) => f.id === "npmrc-missing-gh-packages")).toBe(false);
  });

  it("B2: cross-phase dedup is position-stable — preflight order preserved, Phase 3 appended", () => {
    // When Phase 3 supersedes a preflight id, the surviving entry appears at the back of
    // the list (Phase 3 position): preflight findings (not superseded) first, Phase 3
    // findings second.
    process.env.BKIT_GH_TOKEN_INSTALL = "test"; // token present → no shell-token finding from Phase 3

    const preflightAdvisories: PreflightFinding[] = [
      { id: "example-preflight-advisory", severity: "advisory", detect: "p1", action: "a1" },
      { id: "prettierignore-no-markers", severity: "advisory", detect: "p2", action: "a2" },
    ];

    // Use an empty ws so no devdeps finding fires
    const result = runPostInstallCheck(preflightAdvisories, tmpDir);

    // All preflight advisories that Phase 3 doesn't supersede must come first
    const p1Idx = result.findIndex((f) => f.id === "example-preflight-advisory");
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
      { id: "example-preflight-advisory", severity: "advisory", detect: "first", action: "a1" },
      { id: "example-preflight-advisory", severity: "advisory", detect: "second", action: "a2" },
    ];
    const result = runPostInstallCheck(preflightAdvisories, tmpDir);
    const matches = result.filter((f) => f.id === "example-preflight-advisory");
    expect(matches).toHaveLength(1);
    expect(matches[0]!.detect).toBe("first"); // first occurrence wins
  });

  it("collects suppression notes from the detectors when the out-param is passed", () => {
    process.env.BKIT_GH_TOKEN_INSTALL = "test";
    // The convention must be active for the tagged-test detector to run at all.
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "root", scripts: { "test:live": "vitest" } }),
    );
    const pkgDir = path.join(tmpDir, "tooling", "eslint");
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(
      path.join(pkgDir, "package.json"),
      JSON.stringify({
        name: "eslint",
        scripts: { test: "vitest run" },
        bkit: { ignoreAdvisories: ["tagged-tests-no-ci-home"] },
      }),
    );
    fs.writeFileSync(path.join(pkgDir, "rule.test.ts"), 'it("uses @live", () => {});');

    const suppressed: SuppressionNote[] = [];
    const result = runPostInstallCheck([], tmpDir, suppressed);

    expect(result.some((f) => f.id === "tagged-tests-no-ci-home")).toBe(false);
    expect(suppressed).toEqual([{ id: "tagged-tests-no-ci-home", scope: "tooling/eslint" }]);
    // Omitting the out-param is the previous contract — no throw, nothing collected.
    expect(() => runPostInstallCheck([], tmpDir)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// readChangelogVersionDelta — changelog header
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

  it("reads the package's CHANGELOG.md whatever the working directory", () => {
    const cwd = process.cwd();
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-changelog-cwd-"));
    try {
      process.chdir(elsewhere);
      expect(readChangelogVersionDelta("0.6.0")).toContain("0.6.0");
    } finally {
      process.chdir(cwd);
      fs.rmSync(elsewhere, { recursive: true, force: true });
    }
  });

  it("resolves CHANGELOG.md from the built dist/ layout", async () => {
    // node:child_process is mocked in this file; the built module needs a real node.
    const real = await vi.importActual<typeof import("node:child_process")>("node:child_process");
    const pkgRoot = path.resolve(__dirname, "../../../../..");
    const built = path.join(pkgRoot, "dist", "checks", "after", "index.js");
    expect(fs.existsSync(built), `${built} missing — run pnpm build`).toBe(true);
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-changelog-dist-"));
    try {
      const r = real.spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `import { readChangelogVersionDelta } from ${JSON.stringify(pathToFileURL(built).href)};` +
            ` process.stdout.write(String(readChangelogVersionDelta("0.6.0")));`,
        ],
        { cwd: elsewhere, encoding: "utf-8" },
      );
      expect(r.status, r.stderr).toBe(0);
      expect(r.stdout).toContain("What's new in v0.6.0");
    } finally {
      fs.rmSync(elsewhere, { recursive: true, force: true });
    }
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
// challenge-tests
// ---------------------------------------------------------------------------
// challenge-tests — edge cases:
//
//   Intra-phase dedup within Phase 3 with duplicate ids.
//   An empty / whitespace-only .bkit-version file emits no
//             bkit-version-major-downgrade advisory.
//   Byte-for-byte snapshot of formatChecklist output.
//   The blocker path through the public function API (no tsx subprocess).
describe("challenge-tests", () => {
  const { formatChecklist, runPostInstallCheck } = postinstall;
  const { detectShellToken } = auth;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  let tmpDir: string;
  let originalCwd: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalCwd = process.cwd();
    originalEnv = { ...process.env };
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-challenge-tests-"));
    process.chdir(tmpDir);
    // detectBkitNotOnPath() calls spawnSync("which", ["bkit"]); default to "found"
    // so the advisory does not fire and pollute findings during unrelated assertions.
    spawnSync.mockReturnValue({ status: 0, stdout: "/usr/local/bin/bkit\n", stderr: "" });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    process.env = originalEnv;
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
    execSync.mockReset();
    spawnSync.mockReset();
  });

  function makeModules(...flags: string[]): Set<import("../../cli").ModuleFlag> {
    return new Set(flags) as Set<import("../../cli").ModuleFlag>;
  }

  // ---------------------------------------------------------------------------
  // MEDIUM-1 — NaN edge case: empty / whitespace-only .bkit-version
  // ---------------------------------------------------------------------------

  describe("detectBkitVersionMajorDowngrade — NaN-guard edge cases", () => {
    it("emits NO advisory when .bkit-version is an empty file (parseInt returns NaN)", () => {
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "", "utf-8");
      // NaN major → no downgrade advisory
      const result = detectBkitVersionMajorDowngrade(tmpDir, "1.0.0");
      expect(result).toBeNull();
    });

    it("emits NO advisory when .bkit-version contains only whitespace", () => {
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "   \n  \t  ", "utf-8");
      const result = detectBkitVersionMajorDowngrade(tmpDir, "1.0.0");
      expect(result).toBeNull();
    });

    it("emits NO advisory when .bkit-version has a non-semver string (e.g. 'unknown')", () => {
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "unknown\n", "utf-8");
      // parseInt("unknown", 10) → NaN — should not emit an advisory
      const result = detectBkitVersionMajorDowngrade(tmpDir, "1.0.0");
      expect(result).toBeNull();
    });

    it("does NOT produce a detect message containing the string 'NaN'", () => {
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "", "utf-8");
      const result = detectBkitVersionMajorDowngrade(tmpDir, "1.0.0");
      // Primary assertion: no finding emitted for malformed version
      expect(result).toBeNull();
      // Defensive: if the implementation returns something, its detect must not mention NaN
      if (result !== null) {
        expect(result.detect).not.toContain("NaN");
      }
    });

    it("still emits an advisory when .bkit-version is valid and major is higher", () => {
      // A real downgrade still fires
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".bkit", "version"),
        JSON.stringify({ pinnedVersion: "3.0.0" }),
        "utf-8",
      );
      const result = detectBkitVersionMajorDowngrade(tmpDir, "1.0.0");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("bkit-version-major-downgrade");
    });
  });

  describe("detectBkitVersionPinStale — malformed on-disk version guard", () => {
    function writeInstalledBkit(version: string): void {
      const dir = path.join(tmpDir, "node_modules", "@cbartens", "bkit");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version }), "utf-8");
    }

    it("emits NO advisory when .bkit/version is empty (NaN comparison guard)", () => {
      // Both files present but on-disk version is empty → should not emit
      writeInstalledBkit("0.5.0");
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "", "utf-8");
      // detectBkitVersionPinStale guards `!onDiskVersion` → returns null
      const result = detectBkitVersionPinStale(tmpDir);
      expect(result).toBeNull();
    });

    it("emits NO advisory when installed package.json has empty version field", () => {
      // Installed pkg present but version is "" → should not emit
      const dir = path.join(tmpDir, "node_modules", "@cbartens", "bkit");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version: "" }), "utf-8");
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, ".bkit", "version"), "0.4.0\n", "utf-8");
      const result = detectBkitVersionPinStale(tmpDir);
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // MEDIUM-3 — Intra-phase dedup in Phase 3 via spy injection
  // ---------------------------------------------------------------------------

  describe("runPostInstallCheck — intra-phase Phase 3 deduplication", () => {
    it("drops the second occurrence when two Phase-3 detectors would produce the same id", () => {
      // We spy on detectValePackageNotSynced to emit a finding with id
      // "npmrc-missing-gh-packages" — the same id that detectNpmrcAuth emits
      // when .npmrc exists but is malformed. This forces two entries with the
      // same id into the phase3 array before dedup, exercising the intra-phase
      // dedupeById path in runPostInstallCheck.

      process.env.BKIT_GH_TOKEN_INSTALL = "test-token";

      // Write a malformed .npmrc so detectNpmrcAuth emits "npmrc-missing-gh-packages"
      fs.writeFileSync(path.join(tmpDir, ".npmrc"), "# empty\n", "utf-8");

      // Spy on detectValePackageNotSynced to also return "npmrc-missing-gh-packages"
      const spyVale = vi.spyOn(tools, "detectValePackageNotSynced").mockReturnValue({
        id: "npmrc-missing-gh-packages",
        severity: "advisory",
        detect: "Synthetic duplicate from vale spy",
        action: "Synthetic action",
      });

      // gh CLI fails → "unknown" → no gh secret finding
      execSync.mockImplementation(() => {
        throw new Error("gh: command not found");
      });

      const result = runPostInstallCheck([], tmpDir);

      // "npmrc-missing-gh-packages" must appear exactly once even though two
      // detectors (detectNpmrcAuth + mocked detectValePackageNotSynced) emitted it
      const matches = result.filter((f) => f.id === "npmrc-missing-gh-packages");
      expect(matches).toHaveLength(1);

      spyVale.mockRestore();
    });

    it("first occurrence wins when ids collide in Phase 3", () => {
      // detectNpmrcAuth emits "npmrc-missing-gh-packages" first
      // mocked detectValePackageNotSynced emits the same id second
      // → first occurrence (from detectNpmrcAuth) must win per the contract
      process.env.BKIT_GH_TOKEN_INSTALL = "test-token";
      fs.writeFileSync(path.join(tmpDir, ".npmrc"), "# broken\n", "utf-8");

      const spyVale = vi.spyOn(tools, "detectValePackageNotSynced").mockReturnValue({
        id: "npmrc-missing-gh-packages",
        severity: "advisory",
        detect: "Second occurrence — must be dropped by intra-phase dedup",
        action: "Should not appear",
      });

      execSync.mockImplementation(() => {
        throw new Error("gh: command not found");
      });

      const result = runPostInstallCheck([], tmpDir);

      const allMatches = result.filter((f) => f.id === "npmrc-missing-gh-packages");
      // Exactly one — intra-phase dedup dropped the second
      expect(allMatches).toHaveLength(1);
      // First occurrence (detectNpmrcAuth) wins — the spy's text must not appear
      expect(allMatches[0]!.detect).not.toBe(
        "Second occurrence — must be dropped by intra-phase dedup",
      );

      spyVale.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // FORMAT SNAPSHOT — byte-for-byte formatChecklist snapshot
  // ---------------------------------------------------------------------------

  describe("formatChecklist — byte-for-byte snapshot (Plan §F5)", () => {
    it("matches inline snapshot for a 2-finding fixture", () => {
      const findings: PreflightFinding[] = [
        {
          id: "example-preflight-advisory",
          severity: "advisory",
          detect: ".husky/pre-commit exists but has no bkit-managed block markers.",
          action:
            "bkit will append its managed block to .husky/pre-commit. To keep your custom content and the bkit block in the same file, ensure the file has `# bkit:start` / `# bkit:end` markers around the bkit section.",
        },
        {
          id: "gh-bkit-token-unset-shell",
          severity: "advisory",
          detect: "BKIT_GH_TOKEN_INSTALL is not set in the shell environment.",
          action:
            "Export BKIT_GH_TOKEN_INSTALL in your shell profile (e.g. ~/.zshrc or ~/.bashrc):\n\n    export BKIT_GH_TOKEN_INSTALL=<your-pat>\n\nThe token must be a GitHub PAT with read:packages scope (classic) or Packages: read permission (fine-grained). Generate at: https://github.com/settings/tokens",
        },
      ];

      const result = formatChecklist(findings);
      expect(result).toMatchInlineSnapshot(`
        "
        ==========================================================
        bkit advisories
        ==========================================================

        2 finding(s) — 0 blocker, 2 advisory.

        INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.

        Templates (adopt, do not skip): read .bkit/templates.md; bkit never applies templates, so adopt each copy in .bkit/templates/ unless adoption would break existing functionality — state which you did not adopt and why. (If your own gates scan the repo, ignore .bkit/templates/.)

        --- 1/2 [advisory] example-preflight-advisory ---
        Detect: .husky/pre-commit exists but has no bkit-managed block markers.
        Action: bkit will append its managed block to .husky/pre-commit. To keep your custom content and the bkit block in the same file, ensure the file has \`# bkit:start\` / \`# bkit:end\` markers around the bkit section.

        --- 2/2 [advisory] gh-bkit-token-unset-shell ---
        Detect: BKIT_GH_TOKEN_INSTALL is not set in the shell environment.
        Action: Export BKIT_GH_TOKEN_INSTALL in your shell profile (e.g. ~/.zshrc or ~/.bashrc):

            export BKIT_GH_TOKEN_INSTALL=<your-pat>

        The token must be a GitHub PAT with read:packages scope (classic) or Packages: read permission (fine-grained). Generate at: https://github.com/settings/tokens

        ==========================================================
        "
      `);
    });

    it("matches inline snapshot for a single blocker finding", () => {
      const findings: PreflightFinding[] = [
        {
          id: "no-package-json",
          severity: "blocker",
          detect: "package.json not found in the current directory.",
          action:
            "Run `npm init -y` to create a minimal package.json, or copy one from an existing project, then re-run `pnpm bkit install`.",
        },
      ];

      const result = formatChecklist(findings);
      expect(result).toMatchInlineSnapshot(`
        "
        ==========================================================
        bkit advisories
        ==========================================================

        1 finding(s) — 1 blocker, 0 advisory.

        INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.

        Templates (adopt, do not skip): read .bkit/templates.md; bkit never applies templates, so adopt each copy in .bkit/templates/ unless adoption would break existing functionality — state which you did not adopt and why. (If your own gates scan the repo, ignore .bkit/templates/.)

        --- 1/1 [blocker] no-package-json ---
        Detect: package.json not found in the current directory.
        Action: Run \`npm init -y\` to create a minimal package.json, or copy one from an existing project, then re-run \`pnpm bkit install\`.

        ==========================================================
        "
      `);
    });

    it("returns empty string (not a whitespace-only string) for empty findings array", () => {
      // Exact byte check: must be "" and nothing else
      const result = formatChecklist([]);
      expect(result).toBe("");
      expect(result).toHaveLength(0);
    });

    it("banner separator is exactly 58 '=' characters", () => {
      const findings: PreflightFinding[] = [
        { id: "x", severity: "advisory", detect: "d", action: "a" },
      ];
      const result = formatChecklist(findings);
      // Each separator line must be exactly 58 equals signs
      const separatorLines = result.split("\n").filter((l) => /^={10,}$/.test(l));
      expect(separatorLines.length).toBeGreaterThan(0);
      for (const line of separatorLines) {
        expect(line).toHaveLength(58);
      }
    });

    it("each finding section has Detect and Action starting at column 0", () => {
      const findings: PreflightFinding[] = [
        { id: "test", severity: "advisory", detect: "Detected thing.", action: "Fix the thing." },
      ];
      const result = formatChecklist(findings);
      const lines = result.split("\n");
      const detectLine = lines.find((l) => l.startsWith("Detect:"));
      const actionLine = lines.find((l) => l.startsWith("Action:"));
      expect(detectLine).toBe("Detect: Detected thing.");
      expect(actionLine).toBe("Action: Fix the thing.");
    });
  });

  // ---------------------------------------------------------------------------
  // SUBPROCESS EDGE — Integration exit-code test hardened via vi.spyOn
  // (avoids silent skip when tsx is absent)
  // ---------------------------------------------------------------------------

  describe("Phase 1 blocker short-circuit — vi.spyOn hardened path", () => {
    it("runPreflight returns a blocker and formatChecklist produces a non-empty exit banner", () => {
      // Same path as the subprocess test in the integration suite, via the public function
      // API: package.json absent → blocker fires → formatChecklist returns a non-empty
      // string (what the process prints before exit 1).

      // tmpDir has no package.json
      const { blockers } = runPreflight(makeModules("core"), tmpDir);
      expect(blockers.length).toBeGreaterThan(0);
      expect(blockers.some((f) => f.id === "no-package-json")).toBe(true);

      const banner = formatChecklist(blockers);
      // Must be non-empty so `if (banner) console.log(banner)` would log it
      expect(banner).not.toBe("");
      expect(banner).toContain("[blocker]");
      expect(banner).toContain("no-package-json");
      expect(banner).toContain("Detect:");
      expect(banner).toContain("Action:");
    });

    it("formatChecklist for single blocker renders 1/1 count correctly", () => {
      // Use a host module (not core) so not-git-repo does not fire alongside no-package-json
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
      const { blockers } = runPreflight(makeModules("claude"), tmpDir);

      // Only no-package-json fires
      expect(blockers).toHaveLength(1);
      expect(blockers[0]!.id).toBe("no-package-json");

      const banner = formatChecklist(blockers);
      expect(banner).toContain("--- 1/1 [blocker] no-package-json ---");
      expect(banner).toContain("bkit advisories");
    });

    it("detectShellToken returns 'missing' when env var is deleted (spy observation)", () => {
      // Confirms the spy pattern is functional: call the real implementation and
      // verify result, then observe via spy that it was called.
      delete process.env.BKIT_GH_TOKEN_INSTALL;
      const spy = vi.spyOn(auth, "detectShellToken");
      const result = detectShellToken();
      // The directly-imported function returns "missing"
      expect(result).toBe("missing");
      spy.mockRestore();
    });

    it("runPostInstallCheck emits gh-bkit-token-unset-shell when BKIT_GH_TOKEN_INSTALL is explicitly deleted", () => {
      // The env var is deleted explicitly (no ambient env state), and the output finding
      // asserted.
      delete process.env.BKIT_GH_TOKEN_INSTALL;

      // gh CLI unavailable → unknown (no additional gh-secret finding)
      execSync.mockImplementation(() => {
        throw new Error("gh: command not found");
      });

      const result = runPostInstallCheck([], tmpDir);

      // gh-bkit-token-unset-shell must appear, proving detectShellToken was
      // called and returned "missing" (env var is deleted → Boolean("") === false)
      expect(result.some((f) => f.id === "gh-bkit-token-unset-shell")).toBe(true);

      // Confirm the finding has a non-empty detect and action
      const finding = result.find((f) => f.id === "gh-bkit-token-unset-shell");
      expect(finding!.detect).toBeTruthy();
      expect(finding!.action).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Cross-phase dedup robustness — preflight advisory with same id as Phase 3
  // (verifies Phase 3 wins on conflict — explicit detect-text assertion)
  // ---------------------------------------------------------------------------

  describe("runPostInstallCheck — cross-phase dedup Phase-3-wins contract", () => {
    it("Phase 3 entry replaces preflight entry when ids match, and only one entry appears", () => {
      const preflightAdvisory: PreflightFinding = {
        id: "gh-bkit-token-unset-shell",
        severity: "advisory",
        detect: "PREFLIGHT DETECT TEXT — must NOT survive into output",
        action: "PREFLIGHT ACTION TEXT",
      };

      // BKIT_GH_TOKEN_INSTALL unset → Phase 3 will emit its own gh-bkit-token-unset-shell
      delete process.env.BKIT_GH_TOKEN_INSTALL;
      execSync.mockImplementation(() => {
        throw new Error("gh: command not found");
      });

      const result = runPostInstallCheck([preflightAdvisory], tmpDir);

      const matches = result.filter((f) => f.id === "gh-bkit-token-unset-shell");
      // Exactly one occurrence
      expect(matches).toHaveLength(1);
      // Phase 3 wins — detect text must NOT be the preflight text
      expect(matches[0]!.detect).not.toBe("PREFLIGHT DETECT TEXT — must NOT survive into output");
      // Phase 3 detect text is well-known
      expect(matches[0]!.detect).toContain(
        "BKIT_GH_TOKEN_INSTALL is not set in the shell environment",
      );
    });

    it("preflight-only advisory survives when Phase 3 does not emit the same id", () => {
      const uniquePreflightAdvisory: PreflightFinding = {
        id: "example-preflight-advisory",
        severity: "advisory",
        detect: "Preflight husky detect",
        action: "Preflight husky action",
      };

      process.env.BKIT_GH_TOKEN_INSTALL = "set";
      execSync.mockReturnValue("BKIT_GH_TOKEN_INSTALL\n"); // gh secret present → no gh findings

      const result = runPostInstallCheck([uniquePreflightAdvisory], tmpDir);

      const matches = result.filter((f) => f.id === "example-preflight-advisory");
      expect(matches).toHaveLength(1);
      // Preflight content preserved (Phase 3 did not emit this id)
      expect(matches[0]!.detect).toBe("Preflight husky detect");
    });

    it("preflight advisories with no Phase-3 counterpart maintain their relative order", () => {
      const preflightAdvisories: PreflightFinding[] = [
        { id: "alpha", severity: "advisory", detect: "alpha detect", action: "alpha action" },
        { id: "beta", severity: "advisory", detect: "beta detect", action: "beta action" },
      ];

      process.env.BKIT_GH_TOKEN_INSTALL = "set";
      execSync.mockReturnValue("BKIT_GH_TOKEN_INSTALL\n"); // no GH secret missing

      const result = runPostInstallCheck(preflightAdvisories, tmpDir);

      const ids = result.map((f) => f.id);
      const alphaIdx = ids.indexOf("alpha");
      const betaIdx = ids.indexOf("beta");
      // Both present and alpha before beta (preflight order preserved)
      expect(alphaIdx).toBeGreaterThanOrEqual(0);
      expect(betaIdx).toBeGreaterThan(alphaIdx);
    });
  });
});

// ---------------------------------------------------------------------------
// Scenario 4: formatChecklist format contract (issue-body shape)
// ---------------------------------------------------------------------------

describe("formatChecklist format contract", () => {
  it("renders the --- i/N [severity] id --- divider format per issue body", () => {
    const findings: import("../../checks/before/index").PreflightFinding[] = [
      {
        id: "test-advisory-one",
        severity: "advisory",
        detect: "Something detected.",
        action: "Do something about it.",
      },
      {
        id: "test-advisory-two",
        severity: "advisory",
        detect: "Another thing detected.",
        action: "Handle the other thing.",
      },
    ];
    const banner = formatChecklist(findings);
    expect(banner).toContain("--- 1/2 [advisory] test-advisory-one ---");
    expect(banner).toContain("--- 2/2 [advisory] test-advisory-two ---");
    expect(banner).toContain("Detect: Something detected.");
    expect(banner).toContain("Action: Do something about it.");
  });

  it("renders blockers with [blocker] marker in the divider", () => {
    const findings: import("../../checks/before/index").PreflightFinding[] = [
      {
        id: "no-package-json",
        severity: "blocker",
        detect: "package.json is absent.",
        action: "Run npm init -y.",
      },
    ];
    const banner = formatChecklist(findings);
    expect(banner).toContain("--- 1/1 [blocker] no-package-json ---");
  });

  it("returns empty string for empty findings array", () => {
    expect(formatChecklist([])).toBe("");
  });

  it("single finding renders 1/1", () => {
    const findings: import("../../checks/before/index").PreflightFinding[] = [
      {
        id: "single",
        severity: "advisory",
        detect: "One thing.",
        action: "Fix it.",
      },
    ];
    const banner = formatChecklist(findings);
    expect(banner).toContain("--- 1/1 [advisory] single ---");
  });
});
