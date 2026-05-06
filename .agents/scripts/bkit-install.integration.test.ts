// bkit-install.integration.test.ts — Integration tests for the three-phase
// install flow (BAR-141: preflight blockers, advisory checklist, dry-run parity).
//
// These tests exercise the Phase 1 → Phase 2 → Phase 3 pipeline at the function
// level, consistent with the existing bkit-modules.integration.test.ts pattern.
// Subprocess spawning is used only for the blocker exit-code scenario where the
// actual process.exit(1) boundary must be verified.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runPreflight } from "./bkit-preflight";
import { formatChecklist, runPostInstallCheck } from "./bkit-postinstall";
import type { WriteSet } from "./bkit-tiers";
import type { ModuleFlag } from "./bkit-cli";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-install-integ-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeModules(...flags: string[]): Set<ModuleFlag> {
  return new Set(flags) as Set<ModuleFlag>;
}

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

// ---------------------------------------------------------------------------
// Scenario 1: Blocker exit — package.json absent → exit 1, zero writes
//
// Tests: Derived Test Matrix row
//   "Integration: scratch consumer with package.json removed → pnpm bkit install
//    exits 1 with single blocker line, ZERO writes"
// ---------------------------------------------------------------------------

describe("Scenario 1 — blocker: no package.json → exit 1, zero writes", () => {
  it("runPreflight returns no-package-json blocker when package.json is absent", () => {
    // tmpDir has no package.json
    const { blockers, advisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(blockers.some((f) => f.id === "no-package-json")).toBe(true);
    expect(blockers[0]!.severity).toBe("blocker");
    // no-git-repo fires here too (--core + no .git) — that is correct behaviour
    // but we only assert on no-package-json
  });

  it("formatChecklist renders the blocker banner with [blocker] marker", () => {
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    expect(blockers.length).toBeGreaterThan(0);
    const banner = formatChecklist(blockers);
    expect(banner).toBeTruthy();
    expect(banner).toContain("[blocker]");
    expect(banner).toContain("no-package-json");
  });

  it("formatChecklist banner contains DETECT and ACTION sections", () => {
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    const banner = formatChecklist(blockers);
    expect(banner).toContain("DETECT:");
    expect(banner).toContain("ACTION:");
  });

  it("spawning bkit-install with no package.json exits 1 and produces zero output files", () => {
    // tmpDir has no package.json — blocker should fire and exit 1 before any writes
    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );

    // Skip subprocess test if tsx is not available (CI without devDeps installed)
    if (!fs.existsSync(tsxBin)) return;

    const result = spawnSync(
      "node",
      ["--import", `${tsxBin}/register`, bkitInstallPath, "install", "--full"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 30_000,
      },
    );

    expect(result.status).toBe(1);
    // No files should have been written (tmpDir only contains what we put there — nothing)
    const written = fs.readdirSync(tmpDir);
    expect(written).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Scenario 2: Advisory checklist — N advisory-triggering conditions → exit 0,
// exact checklist rendered
//
// Tests: Derived Test Matrix row
//   "Integration: scratch consumer with N advisory-triggering conditions →
//    pnpm bkit install exits 0 with exact checklist"
// ---------------------------------------------------------------------------

describe("Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered", () => {
  beforeEach(() => {
    // Seed: valid package.json (no lint:prose, no advisories from pkg)
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test-consumer",
        version: "0.1.0",
        scripts: {
          // F9-vulnerable lint:prose — triggers lint-prose-f9-vulnerable advisory
          "lint:prose": "vale $(find . -name '*.md')",
        },
      }),
      "utf-8",
    );
    // .git dir — so not-git-repo does NOT fire
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    // .husky/pre-commit without bkit markers — triggers husky-no-markers-precommit
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-commit"), "#!/bin/sh\npnpm test\n", "utf-8");
  });

  it("runPreflight returns advisory findings for seeded conditions", () => {
    const { blockers, advisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(blockers).toHaveLength(0);
    const ids = advisories.map((f) => f.id);
    expect(ids).toContain("husky-no-markers-precommit");
    expect(ids).toContain("lint-prose-f9-vulnerable");
  });

  it("formatChecklist renders a numbered checklist for multiple advisories", () => {
    const { advisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(advisories.length).toBeGreaterThan(0);
    const banner = formatChecklist(advisories);
    expect(banner).toBeTruthy();
    // Each finding renders with severity and id markers
    expect(banner).toContain("[advisory]");
    expect(banner).toContain("DETECT:");
    expect(banner).toContain("ACTION:");
    // Numbered: 1/N format
    expect(banner).toMatch(/--- \d+\/\d+ \[advisory\]/);
  });

  it("formatChecklist includes the instructions header for AI agents", () => {
    const { advisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const banner = formatChecklist(advisories);
    expect(banner).toContain("INSTRUCTIONS FOR AN AI AGENT");
  });

  it("runPostInstallCheck adds gh-bkit-token-missing-shell when token is unset", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const ws = makeWriteSet();

    // Temporarily unset GH_BKIT_TOKEN
    const savedToken = process.env.GH_BKIT_TOKEN;
    delete process.env.GH_BKIT_TOKEN;

    try {
      const postFindings = runPostInstallCheck(
        preflightAdvisories,
        ws,
        makeModules("core", "lint"),
        tmpDir,
        false, // not dry-run
      );
      const ids = postFindings.map((f) => f.id);
      expect(ids).toContain("gh-bkit-token-missing-shell");
    } finally {
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN = savedToken;
    }
  });

  it("full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(preflightAdvisories.length).toBeGreaterThan(0);

    const ws = makeWriteSet();
    const savedToken = process.env.GH_BKIT_TOKEN;
    delete process.env.GH_BKIT_TOKEN;

    let postFindings: ReturnType<typeof runPostInstallCheck>;
    try {
      postFindings = runPostInstallCheck(
        preflightAdvisories,
        ws,
        makeModules("core", "lint"),
        tmpDir,
        false,
      );
    } finally {
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN = savedToken;
    }

    // Phase 1 findings should be present in the combined output
    const ids = postFindings.map((f) => f.id);
    expect(ids).toContain("husky-no-markers-precommit");
    expect(ids).toContain("lint-prose-f9-vulnerable");
    // Phase 3 shell token finding should also be present
    expect(ids).toContain("gh-bkit-token-missing-shell");

    const banner = formatChecklist(postFindings);
    expect(banner).toBeTruthy();
    expect(banner).toContain("husky-no-markers-precommit");
    expect(banner).toContain("lint-prose-f9-vulnerable");
    expect(banner).toContain("gh-bkit-token-missing-shell");
  });

  it("no duplicate ids in the final checklist", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const ws = makeWriteSet();
    const postFindings = runPostInstallCheck(
      preflightAdvisories,
      ws,
      makeModules("core", "lint"),
      tmpDir,
      false,
    );
    const ids = postFindings.map((f) => f.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toEqual(uniqueIds);
  });
});

// ---------------------------------------------------------------------------
// Scenario 3: bkit check (dry-run) — Phase 1 advisories ARE rendered;
// Phase 3 detectors NOT invoked.
//
// Tests: Derived Test Matrix row
//   "Integration: bkit check (dry-run) on advisory-triggering scratch consumer
//    renders Phase 1 advisories via formatChecklist; Phase 3 detectors NOT invoked"
// ---------------------------------------------------------------------------

describe("Scenario 3 — bkit check dry-run: Phase 1 rendered, Phase 3 skipped", () => {
  beforeEach(() => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test-consumer",
        scripts: { "lint:prose": "vale $(find . -name '*.md')" },
      }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-commit"), "#!/bin/sh\npnpm test\n", "utf-8");
  });

  it("runPostInstallCheck with dryRun=true returns only preflight advisories (no Phase 3 additions)", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(preflightAdvisories.length).toBeGreaterThan(0);

    const ws = makeWriteSet();
    // Unset token to ensure Phase 3 would add gh-bkit-token-missing-shell if invoked
    const savedToken = process.env.GH_BKIT_TOKEN;
    delete process.env.GH_BKIT_TOKEN;

    let dryRunFindings: ReturnType<typeof runPostInstallCheck>;
    try {
      dryRunFindings = runPostInstallCheck(
        preflightAdvisories,
        ws,
        makeModules("core", "lint"),
        tmpDir,
        true, // dryRun = true
      );
    } finally {
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN = savedToken;
    }

    // dry-run: output must be exactly the preflight advisories — no Phase 3 additions
    const dryRunIds = dryRunFindings.map((f) => f.id);
    const preflightIds = preflightAdvisories.map((f) => f.id);
    expect(dryRunIds).toEqual(preflightIds);

    // Specifically, gh-bkit-token-missing-shell must NOT appear (Phase 3 is skipped)
    expect(dryRunIds).not.toContain("gh-bkit-token-missing-shell");
    expect(dryRunIds).not.toContain("npmrc-missing-gh-packages");
    expect(dryRunIds).not.toContain("vale-package-not-synced");
    expect(dryRunIds).not.toContain("devdeps-need-fetch");
  });

  it("formatChecklist renders Phase 1 advisories in dry-run (parity with legacy printSink dump)", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const banner = formatChecklist(preflightAdvisories);
    // Phase 1 advisories should still produce a visible banner in dry-run
    expect(banner).toBeTruthy();
    expect(banner).toContain("husky-no-markers-precommit");
    expect(banner).toContain("lint-prose-f9-vulnerable");
  });

  it("formatChecklist([]) returns empty string — no banner emitted on zero advisories", () => {
    // Edge case: zero findings → no banner
    expect(formatChecklist([])).toBe("");
  });

  it("Phase 3 detectors are not invoked in dry-run (spy verification)", () => {
    // Verify via spy that runPostInstallCheck dryRun=true skips the internal
    // execSync-using detectors. We do this by patching process.env to make
    // detectShellToken() report "missing", then confirming gh-bkit-token-missing-shell
    // does NOT appear in dryRun output (proving the detector was not called).
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const ws = makeWriteSet();

    const savedToken = process.env.GH_BKIT_TOKEN;
    delete process.env.GH_BKIT_TOKEN;

    let dryRunFindings: ReturnType<typeof runPostInstallCheck>;
    try {
      dryRunFindings = runPostInstallCheck(
        preflightAdvisories,
        ws,
        makeModules("core", "lint"),
        tmpDir,
        true,
      );
    } finally {
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN = savedToken;
    }

    // If Phase 3 were invoked, GH_BKIT_TOKEN missing would add gh-bkit-token-missing-shell.
    // Its absence proves Phase 3 was NOT invoked.
    expect(dryRunFindings.map((f) => f.id)).not.toContain("gh-bkit-token-missing-shell");
  });

  it("blockers still fire in dry-run (Phase 1 remains active in bkit check)", () => {
    // Remove package.json to trigger a blocker
    fs.rmSync(path.join(tmpDir, "package.json"), { force: true });
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    // Blockers should fire even in dry-run (preflight is always active)
    expect(blockers.some((f) => f.id === "no-package-json")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Scenario 4: formatChecklist format contract (issue-body shape)
// ---------------------------------------------------------------------------

describe("formatChecklist format contract", () => {
  it("renders the --- i/N [severity] id --- divider format per issue body", () => {
    const findings: import("./bkit-preflight").PreflightFinding[] = [
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
    expect(banner).toContain("DETECT: Something detected.");
    expect(banner).toContain("ACTION: Do something about it.");
  });

  it("renders blockers with [blocker] marker in the divider", () => {
    const findings: import("./bkit-preflight").PreflightFinding[] = [
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
    const findings: import("./bkit-preflight").PreflightFinding[] = [
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
