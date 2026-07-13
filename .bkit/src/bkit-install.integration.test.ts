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
import {
  initStagingDir,
  commitStaging,
  discardStaging,
  discardAllStaging,
  getStagingDir,
  runPayload,
  STAGING_ROOT,
  detectOpencodeProviders,
  detectRenovateRunner,
} from "./bkit-install";
import { getTemplatesRoot } from "./bkit-paths";
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
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--tooling"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 30_000,
      },
    );

    expect(result.status).toBe(1);
    // The blocker checklist must be the cause of exit-1 (not an unrelated crash).
    expect(`${result.stdout ?? ""}\n${result.stderr ?? ""}`).toContain("no-package-json");
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
    // .husky/pre-commit is no longer a preflight-advisory trigger as of v2.0.4
    // (husky moved to Tier 3 seed-or-print — no markers expected, no drift gate).
    // Tier-3 advisory emission is now handled in-module by runGitHooksModule.
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-commit"), "#!/bin/sh\npnpm test\n", "utf-8");
  });

  it("runPreflight returns advisory findings for seeded conditions", () => {
    const { blockers, advisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(blockers).toHaveLength(0);
    const ids = advisories.map((f) => f.id);
    expect(ids).toContain("lint-prose-f9-vulnerable");
    // husky-no-markers-* is no longer emitted (Tier 3 husky, v2.0.4)
    expect(ids).not.toContain("husky-no-markers-precommit");
    expect(ids).not.toContain("husky-no-markers-prepush");
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

  it("runPostInstallCheck adds gh-bkit-token-unset-shell when token is unset", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const ws = makeWriteSet();

    // Temporarily unset GH_BKIT_TOKEN_INSTALL
    const savedToken = process.env.GH_BKIT_TOKEN_INSTALL;
    delete process.env.GH_BKIT_TOKEN_INSTALL;

    try {
      const postFindings = runPostInstallCheck(
        preflightAdvisories,
        ws,
        makeModules("core", "lint"),
        tmpDir,
        false, // not dry-run
      );
      const ids = postFindings.map((f) => f.id);
      expect(ids).toContain("gh-bkit-token-unset-shell");
    } finally {
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN_INSTALL = savedToken;
    }
  });

  it("full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(preflightAdvisories.length).toBeGreaterThan(0);

    const ws = makeWriteSet();
    const savedToken = process.env.GH_BKIT_TOKEN_INSTALL;
    delete process.env.GH_BKIT_TOKEN_INSTALL;

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
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN_INSTALL = savedToken;
    }

    // Phase 1 findings should be present in the combined output
    const ids = postFindings.map((f) => f.id);
    expect(ids).toContain("lint-prose-f9-vulnerable");
    // Phase 3 shell token finding should also be present
    expect(ids).toContain("gh-bkit-token-unset-shell");

    const banner = formatChecklist(postFindings);
    expect(banner).toBeTruthy();
    expect(banner).toContain("lint-prose-f9-vulnerable");
    expect(banner).toContain("gh-bkit-token-unset-shell");
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

describe("Scenario 3 — bkit check: Phase 3 detectors run for parity with install", () => {
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

  it("runPostInstallCheck includes Phase 3 detector findings (gh-bkit-token-unset-shell when token unset)", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const ws = makeWriteSet();
    const savedToken = process.env.GH_BKIT_TOKEN_INSTALL;
    delete process.env.GH_BKIT_TOKEN_INSTALL;

    let findings: ReturnType<typeof runPostInstallCheck>;
    try {
      findings = runPostInstallCheck(preflightAdvisories, ws, makeModules("core", "lint"), tmpDir);
    } finally {
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN_INSTALL = savedToken;
    }

    // Phase 3 ran: gh-bkit-token-unset-shell must appear when token is missing.
    expect(findings.map((f) => f.id)).toContain("gh-bkit-token-unset-shell");
  });

  it("formatChecklist renders Phase 1 advisories", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const banner = formatChecklist(preflightAdvisories);
    expect(banner).toBeTruthy();
    expect(banner).toContain("lint-prose-f9-vulnerable");
  });

  it("formatChecklist([]) returns empty string — no banner emitted on zero advisories", () => {
    expect(formatChecklist([])).toBe("");
  });

  it("blockers fire from preflight (Phase 1 remains active in bkit check)", () => {
    fs.rmSync(path.join(tmpDir, "package.json"), { force: true });
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
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

// ---------------------------------------------------------------------------
// Scenario 4 — Regression: stale consumer .agents/prompts.md does NOT crash
// install on "Missing model lookup for <name>".
//
// Repro of the v0.5.0 hard-fail (BAR-141 follow-up): a consumer upgrading from
// a release that predates a newly-added prompt (e.g. bkit-design-organise)
// would have an empty/stale Models table on disk. Before the fix, install
// parsed the consumer's stale prompts.md → applyT3 hit "Missing model lookup
// for bkit-design-organise" → process.exit(1) mid-install (partial state).
//
// The fix sources the model lookup from the PACKAGE's .bkit/prompts.md, so a
// stale consumer copy is tolerated. This test guards against regression and
// catches the analogous failure for ANY future prompt added without backfill.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Scenario 5 — Smoke: full install against a clean scratch consumer.
//
// Closes the highest-impact CI gap: prior to this test, the only spawn-based
// install coverage was Scenario 1 (blocker exit-1 path). No test asserted that
// `bkit install --full` actually completes against a normal consumer state, so
// any hard-fail in the dispatch chain (T3 model lookup, frontmatter parsing,
// token resolution, module ordering) shipped to consumers without CI noticing.
//
// This test runs the full install end-to-end and asserts exit 0 — meaning the
// repo cannot tag a release whose install path crashes on a clean consumer.
// ---------------------------------------------------------------------------

describe("Scenario 5 — full install smoke against scratch consumer", () => {
  it("bkit install --full against a clean consumer exits 0 and writes core mirrors", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );
    if (!fs.existsSync(tsxBin)) return;

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--tooling"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(result.status, `install crashed:\n${combined}`).toBe(0);
    expect(combined).not.toContain("Missing model lookup");
    expect(combined).not.toContain("frontmatter missing");
    // Sanity-check the install actually produced consumer outputs.
    expect(fs.existsSync(path.join(tmpDir, ".claude", "agents"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".cursor", "agents"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".bkit", "version"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9)
//
// When Phase 3 detects a blocker-severity finding (e.g. ci-yml-missing-token-env
// elevated to blocker), bkit install must exit 1 and print a recovery line.
// ---------------------------------------------------------------------------

describe("Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9)", () => {
  it("runPostInstallCheck includes blocker-severity finding when ci.yml missing token and .npmrc references token", () => {
    // Seed: .npmrc references ${GH_BKIT_TOKEN_INSTALL} → ci-yml-missing-token-env elevated to blocker
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", version: "0.0.0" }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    // ci.yml has pnpm install but no GH_BKIT_TOKEN_INSTALL env mapping
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install\n",
      "utf-8",
    );
    // .npmrc references ${GH_BKIT_TOKEN_INSTALL} → elevates ci-yml finding to blocker
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN_INSTALL}\n",
      "utf-8",
    );

    const ws: WriteSet = { writes: [] };
    const findings = runPostInstallCheck([], ws, makeModules("core", "ci"), tmpDir, false);
    const blocker = findings.find((f) => f.severity === "blocker");
    expect(blocker).toBeDefined();
    expect(blocker!.id).toBe("ci-yml-missing-token-env");
  });

  it("Phase 3 blocker findings are distinguished from advisories (severity=blocker)", () => {
    // Verify that the existing blocker escalation logic in detectCiYmlMissingTokenEnv
    // produces a severity=blocker finding — this is the trigger for exit-1 in bkit-install.ts
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "steps:\n  - run: pnpm install\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN_INSTALL}\n",
    );

    const ws: WriteSet = { writes: [] };
    const findings = runPostInstallCheck([], ws, makeModules("ci"), tmpDir, false);
    const blockerFindings = findings.filter((f) => f.severity === "blocker");
    expect(blockerFindings.length).toBeGreaterThan(0);
    expect(blockerFindings[0]!.id).toBe("ci-yml-missing-token-env");
  });
});

// ---------------------------------------------------------------------------
// Scenario 7 — bkit install exits 1 on Phase 3 blocker (subprocess, P2.T9)
// ---------------------------------------------------------------------------

describe("Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9)", () => {
  it("bkit install exits 1 when Phase 3 blocker detected + recovery line in output", () => {
    // Set up consumer with Phase 3 blocker condition: ci.yml missing token env + .npmrc with token
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test-consumer",
        version: "0.0.0",
        devDependencies: {},
        scripts: { test: "echo ok" },
      }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    // ci.yml missing GH_BKIT_TOKEN_INSTALL env mapping
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install --frozen-lockfile\n",
    );
    // .npmrc that references ${GH_BKIT_TOKEN_INSTALL} — triggers blocker escalation
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN_INSTALL}\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );
    if (!fs.existsSync(tsxBin)) return;

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--tooling"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        // Override GH_BKIT_TOKEN_INSTALL to avoid shell-token advisory overlapping
        GH_BKIT_TOKEN_INSTALL: "fake-token-for-test",
      },
      timeout: 60_000,
    });

    // Exit 1 due to Phase 3 blocker
    expect(result.status).toBe(1);

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    // Recovery line should be present
    expect(combined).toContain("pnpm bkit uninstall");
    expect(combined).toContain("pnpm bkit install");
  });
});

// ---------------------------------------------------------------------------
// Scenario 8 — --auto-revert reverts on Phase 3 blocker (subprocess, P2.T10)
// ---------------------------------------------------------------------------

describe("Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10)", () => {
  it("--auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted", () => {
    // Set up consumer with Phase 3 blocker condition (same as Scenario 7):
    // ci.yml missing GH_BKIT_TOKEN_INSTALL env + .npmrc referencing ${GH_BKIT_TOKEN_INSTALL}
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test-consumer",
        version: "0.0.0",
        devDependencies: {},
        scripts: { test: "echo ok" },
      }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    // ci.yml missing GH_BKIT_TOKEN_INSTALL env mapping — triggers blocker in Phase 3
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install --frozen-lockfile\n",
    );
    // .npmrc that references ${GH_BKIT_TOKEN_INSTALL} — escalates to blocker
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN_INSTALL}\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );
    if (!fs.existsSync(tsxBin)) return;

    // Capture pre-install state: .bkit/version must not exist
    const versionFilePath = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFilePath)).toBe(false);

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--claude", "--auto-revert"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        // Set GH_BKIT_TOKEN_INSTALL so the shell-token advisory doesn't interfere
        GH_BKIT_TOKEN_INSTALL: "fake-token-for-test",
      },
      timeout: 60_000,
    });

    // Exit 1 due to Phase 3 blocker
    expect(result.status).toBe(1);

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

    // Auto-revert log messages must be present — confirms in-process revert ran
    expect(combined).toContain("--auto-revert");

    // The Tier-1 .bkit/version written by --core MUST be absent after
    // auto-revert (runUninstall deleted it as a Tier-1 file).
    // This is the byte-identical-to-pre-install check: file was absent → now absent.
    expect(fs.existsSync(versionFilePath)).toBe(false);
  }, 90_000);
});

// ---------------------------------------------------------------------------
// Scenario 9 — P4.T3: Mid-failure rollback fixture
//
// Tests the staging mechanism end-to-end: staging files written to
// `.bkit-staging/<module>/` but NOT committed when a mid-install failure
// fires. Consumer files must remain byte-identical to pre-install state.
//
// Reproduces the BAR-142 §A4 concern: a crash after first module but before
// commitStaging must leave consumer git-diff empty.
// ---------------------------------------------------------------------------

describe("Scenario 9 — P4.T3: mid-failure rollback, consumer files untouched", () => {
  it("discardAllStaging after partial writes leaves consumer files untouched", () => {
    // Seed consumer state
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-foo.md"),
      "original agent content",
      "utf-8",
    );

    // Simulate first module writing to staging (NOT committed yet)
    const stagingDir = getStagingDir("claude", tmpDir);
    initStagingDir(stagingDir);
    fs.mkdirSync(path.join(stagingDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(stagingDir, ".claude", "agents", "bkit-foo.md"),
      "would-be-new content",
      "utf-8",
    );

    // Simulate a second module starting to stage
    const stagingDir2 = getStagingDir("cursor", tmpDir);
    initStagingDir(stagingDir2);

    // Simulate mid-failure: discard all staging (would be triggered by error handler)
    discardAllStaging(tmpDir);

    // Consumer file must be byte-identical to pre-install state
    const consumerContent = fs.readFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-foo.md"),
      "utf-8",
    );
    expect(consumerContent).toBe("original agent content");

    // All staging dirs must be removed
    expect(fs.existsSync(path.join(tmpDir, STAGING_ROOT))).toBe(false);
  });

  it("commitStaging after successful module moves files + staging dir removed", () => {
    // Seed staging with files to commit
    const stagingDir = getStagingDir("claude", tmpDir);
    initStagingDir(stagingDir);
    fs.mkdirSync(path.join(stagingDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(stagingDir, ".claude", "agents", "bkit-bar.md"),
      "new agent content",
      "utf-8",
    );

    // Commit the module
    const committed = commitStaging(stagingDir, tmpDir);
    expect(committed).toContain(path.join(".claude", "agents", "bkit-bar.md"));

    // File is at consumer destination
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-bar.md"), "utf-8")).toBe(
      "new agent content",
    );

    // Staging dir removed
    expect(fs.existsSync(stagingDir)).toBe(false);
  });

  it("staging root is NOT present in the consumer's repo after a full successful commit", () => {
    // After all modules commit, STAGING_ROOT must not exist
    const stagingDir = getStagingDir("core", tmpDir);
    initStagingDir(stagingDir);
    fs.writeFileSync(path.join(stagingDir, "file.md"), "x", "utf-8");
    commitStaging(stagingDir, tmpDir);
    // When all staging dirs are committed, STAGING_ROOT should be empty and can be removed
    // (Each commitStaging removes its own subdir; STAGING_ROOT parent dir may still exist)
    const stagingRoot = path.join(tmpDir, STAGING_ROOT);
    if (fs.existsSync(stagingRoot)) {
      // Should be empty — no uncommitted staging subdirs remain
      const remaining = fs.readdirSync(stagingRoot);
      expect(remaining).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// MCP config Tier 3 scaffold + idempotency tests (BAR-260)
//
// .mcp.json (claude module) and .cursor/mcp.json (cursor module) are Tier 3
// byte-equal-text files: seeded on first install, left untouched on re-install
// when the consumer has modified them.
// ---------------------------------------------------------------------------

describe("MCP config Tier 3 scaffold — fresh install and consumer-modified idempotency", () => {
  it("fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );
    if (!fs.existsSync(tsxBin)) return;

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--tooling"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(result.status, `install crashed:\n${combined}`).toBe(0);

    // Default tracker is "none" → .mcp.json seeded with empty mcpServers (no tracker wired)
    const mcpJsonPath = path.join(tmpDir, ".mcp.json");
    expect(fs.existsSync(mcpJsonPath), ".mcp.json must be scaffolded by bkit install --full").toBe(
      true,
    );
    const mcpJson = JSON.parse(fs.readFileSync(mcpJsonPath, "utf-8")) as {
      mcpServers?: Record<string, unknown>;
    };
    expect(mcpJson.mcpServers, ".mcp.json must have mcpServers key").toBeDefined();
    expect(
      Object.keys(mcpJson.mcpServers!),
      ".mcp.json must have no tracker servers for default 'none' tracker",
    ).toHaveLength(0);

    // .cursor/mcp.json must also be scaffolded with empty mcpServers
    const cursorMcpPath = path.join(tmpDir, ".cursor", "mcp.json");
    expect(
      fs.existsSync(cursorMcpPath),
      ".cursor/mcp.json must be scaffolded by bkit install --full",
    ).toBe(true);
    const cursorMcp = JSON.parse(fs.readFileSync(cursorMcpPath, "utf-8")) as {
      mcpServers?: Record<string, unknown>;
    };
    expect(Object.keys(cursorMcp.mcpServers ?? {})).toHaveLength(0);
  });

  it("bkit install --tracker=github seeds .mcp.json with only the github entry", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );
    if (!fs.existsSync(tsxBin)) return;

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--tooling", "--tracker=github"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(result.status, `install crashed:\n${combined}`).toBe(0);

    // --tracker=github → only the github entry present in .mcp.json
    const mcpJson = JSON.parse(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")) as {
      mcpServers?: Record<string, unknown>;
    };
    expect(mcpJson.mcpServers!["github"], ".mcp.json must have github server").toBeDefined();
    expect(mcpJson.mcpServers!["linear"], ".mcp.json must NOT have linear server").toBeUndefined();

    // bkit.issueTracker persisted to package.json
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { issueTracker?: string };
    };
    expect(pkg.bkit?.issueTracker).toBe("github");

    // workflow mirror must have no remaining bkit:tracker OR bkit:when-tracker markers
    const claudeCmd = path.join(tmpDir, ".claude", "commands", "bkit-build.md");
    if (fs.existsSync(claudeCmd)) {
      const content = fs.readFileSync(claudeCmd, "utf-8");
      expect(content).not.toMatch(/<!--\s*bkit:tracker\s+\S+\s+(?:start|end)\s*-->/);
      expect(content).not.toMatch(/<!--\s*bkit:when-tracker\s+(?:start|end)\b[^>]*-->/);
      expect(content).toContain("mcp__github__");
    }
  });

  it("re-install over a consumer-modified .mcp.json leaves the file byte-for-byte unchanged", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    // Consumer's pre-existing .mcp.json with an extra server and different ordering
    const consumerMcpContent =
      JSON.stringify(
        {
          mcpServers: {
            linear: { url: "https://mcp.linear.app/mcp" },
            github: { url: "https://api.githubcopilot.com/mcp/" },
            "my-internal-server": { url: "https://internal.example.com/mcp" },
          },
        },
        null,
        2,
      ) + "\n";
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), consumerMcpContent, "utf-8");

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );
    if (!fs.existsSync(tsxBin)) return;

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--tooling"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(result.status, `install crashed:\n${combined}`).toBe(0);

    // .mcp.json must be byte-for-byte identical to the consumer's original
    const afterContent = fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8");
    expect(afterContent).toBe(consumerMcpContent);

    // Consumer's custom server must still be present
    const afterJson = JSON.parse(afterContent) as { mcpServers?: Record<string, unknown> };
    expect(afterJson.mcpServers!["my-internal-server"]).toBeDefined();
  });
});

describe("Scenario 4 — stale consumer prompts.md tolerated on upgrade", () => {
  it("bkit check with stale consumer prompts.md does not emit Missing model lookup", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    // Mark as a git repo to satisfy not-git-repo blocker (--core requires it).
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    // Stale consumer .agents/prompts.md — empty Models table (the worst-case
    // version of the v0.4.x → v0.5.0 skew that triggered the original bug).
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "prompts.md"),
      "# Stale\n\n## Models\n\n| Name | Cursor model | Claude model |\n| --- | --- | --- |\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "bkit-install.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../node_modules/.bin/tsx",
    );
    if (!fs.existsSync(tsxBin)) return;

    const result = spawnSync(tsxBin, [bkitInstallPath, "check"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 30_000,
    });

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined).not.toContain("Missing model lookup");
    // Sanity-check the install actually executed past parse — without an exit-0
    // assertion we want at least one positive signal that the binary reached
    // dispatch (otherwise a missing-tsx error path would pass vacuously).
    expect(combined).toMatch(/\[bkit-(check|install)\]/);
  });
});

// ---------------------------------------------------------------------------
// Scenario: rendered prompts/workflows version gate (#256), branch-scoped
// `bkit check` hard-fails (exit 1) on main/dev when a rendered mirror's
// managed-version marker is older than the installing bkit version — so a
// consumer can never silently run outdated prompts/workflows on a protected
// branch. On a feature branch the same drift is a NON-blocking advisory (it was
// inherited from the base, not created here), so an intermediate push is not
// blocked — see isOnProtectedBranch.
// ---------------------------------------------------------------------------

describe("Scenario: bkit check stale-marker gate is branch-scoped (#256)", () => {
  // Build a scratch consumer with one deliberately-old claude mirror marker (the
  // installing version under tsx is the repo's package.json version, far newer)
  // and run `bkit check`, forcing the effective branch via GH Actions env.
  // Returns null when tsx is unavailable (skip).
  function runStaleCheck(branchEnv: Record<string, string>): {
    combined: string;
    status: number | null;
  } | null {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-foo.md"),
      "---\nname: bkit-foo\n---\n<!-- bkit:managed v0.0.1 — do NOT edit; run `bkit upgrade` to refresh -->\n\nbody\n",
    );

    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "bkit-install.ts");
    const tsxBin = path.resolve(dir, "../../node_modules/.bin/tsx");
    if (!fs.existsSync(tsxBin)) return null;

    // Force the branch deterministically: clear any ambient CI branch env first
    // (bkit's own CI would otherwise leak its branch into the subprocess).
    const env: NodeJS.ProcessEnv = { ...process.env, NODE_NO_WARNINGS: "1" };
    delete env.GITHUB_BASE_REF;
    delete env.GITHUB_REF_NAME;
    Object.assign(env, branchEnv);

    const result = spawnSync(tsxBin, [bkitInstallPath, "check"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env,
      timeout: 60_000,
    });
    return { combined: `${result.stdout ?? ""}\n${result.stderr ?? ""}`, status: result.status };
  }

  it("on main: hard-fails (exit 1) and names the bkit-rendered-prompts-stale BLOCKER", () => {
    const r = runStaleCheck({ GITHUB_REF_NAME: "main" });
    if (!r) return;
    expect(r.combined, r.combined).toContain("[blocker] bkit-rendered-prompts-stale");
    expect(r.combined).toContain(
      "rendered prompts/workflows are stale (managed-version marker drift)",
    );
    expect(r.status, `expected exit 1, got ${r.status}:\n${r.combined}`).toBe(1);
  });

  it("on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line", () => {
    const r = runStaleCheck({ GITHUB_REF_NAME: "feat/296-file-upload" });
    if (!r) return;
    expect(r.combined, r.combined).toContain("[advisory] bkit-rendered-prompts-stale");
    expect(r.combined).toContain("non-blocking on this feature branch");
    // The blocker-only stderr drift line is gated on severity===blocker, so it must
    // NOT appear here even though other writes may still flag generic drift.
    expect(r.combined).not.toContain(
      "rendered prompts/workflows are stale (managed-version marker drift)",
    );
  });
});

// ---------------------------------------------------------------------------
// Scenario: `bkit upgrade --to=<v>` atomic self-bump (#1) — dry-run preview
// A dry-run bump reports the plan and exits 0 WITHOUT shelling out to pnpm or
// re-rendering (runSelfBump returns before any IO), so this stays offline.
// ---------------------------------------------------------------------------

describe("Scenario: bkit upgrade --to self-bump dry-run (#1)", () => {
  it("previews the bump (pnpm add + re-render) and exits 0 without mutating", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "bkit-install.ts");
    const tsxBin = path.resolve(dir, "../../node_modules/.bin/tsx");
    if (!fs.existsSync(tsxBin)) return;

    // Target a version far above the installed one so it's always a "bump", never a noop.
    const result = spawnSync(tsxBin, [bkitInstallPath, "upgrade", "--to=99.0.0", "--dry-run"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined, combined).toContain("[dry-run] would bump @cbartens/bkit");
    expect(combined).toContain("99.0.0");
    expect(combined).toContain("pnpm add -D @cbartens/bkit@99.0.0");
    expect(result.status, `expected exit 0, got ${result.status}:\n${combined}`).toBe(0);
    // Dry-run must not have touched the consumer's package.json.
    const pkg = fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8");
    expect(pkg).not.toContain("99.0.0");
  });

  it("rejects --to=<version> with --latest (mutually exclusive) at exit 1", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }));
    const dir = path.dirname(new URL(import.meta.url).pathname);
    const bkitInstallPath = path.resolve(dir, "bkit-install.ts");
    const tsxBin = path.resolve(dir, "../../node_modules/.bin/tsx");
    if (!fs.existsSync(tsxBin)) return;
    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "upgrade", "--to=4.2.0", "--latest", "--dry-run"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );
    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined, combined).toContain("mutually exclusive");
    expect(result.status).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Scenario: .bkit/.env.example + .envrc scaffolding (BAR-260 follow-up)
// ---------------------------------------------------------------------------

import { runClaudeModule, getPkgRoot } from "./bkit-modules";
import type { ModuleContext } from "./bkit-modules";
import type { PreflightFinding } from "./bkit-preflight";

function makeClaudeContext(dryRun: boolean): ModuleContext {
  const ws: WriteSet = { writes: [] };
  const advisories: PreflightFinding[] = [];
  return {
    dryRun,
    tokens: new Map(),
    modelLookup: new Map(),
    advisories,
    ws,
    logPrefix: "[bkit-test]",
    postDispatch: [],
  };
}

describe("Scenario: .env.example + .envrc Tier 3 scaffolding", () => {
  it("first install seeds .bkit/.env.example when template exists", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const ctx = makeClaudeContext(false);
    // Change to tmpDir so relative paths resolve correctly in runClaudeModule
    process.chdir(tmpDir);
    runClaudeModule(ctx);

    const envExamplePath = path.join(tmpDir, ".bkit", ".env.example");
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const content = fs.readFileSync(envExamplePath, "utf-8");
    expect(content).toContain("GH_BKIT_TOKEN=");
    expect(content).toContain("GH_BKIT_TOKEN_INSTALL=");
    expect(content).toContain("LINEAR_API_KEY=");
  });

  it("first install seeds .envrc with dotenv_if_exists directive", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const ctx = makeClaudeContext(false);
    process.chdir(tmpDir);
    runClaudeModule(ctx);

    const envrcPath = path.join(tmpDir, ".envrc");
    expect(fs.existsSync(envrcPath)).toBe(true);
    const content = fs.readFileSync(envrcPath, "utf-8");
    expect(content).toContain("dotenv_if_exists .bkit/.env");
  });

  it("second install is idempotent — does not overwrite consumer-modified .bkit/.env.example", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    // First install
    const ctx1 = makeClaudeContext(false);
    process.chdir(tmpDir);
    runClaudeModule(ctx1);

    // Consumer modifies .env.example (adds a custom token)
    const envExamplePath = path.join(tmpDir, ".bkit", ".env.example");
    const original = fs.readFileSync(envExamplePath, "utf-8");
    const modified = original + "\n# custom consumer token\nMY_API_KEY=\n";
    fs.writeFileSync(envExamplePath, modified, "utf-8");

    // Second install — Tier 3 seed-or-print: must NOT overwrite modified file
    const ctx2 = makeClaudeContext(false);
    process.chdir(tmpDir);
    runClaudeModule(ctx2);

    const after = fs.readFileSync(envExamplePath, "utf-8");
    expect(after).toBe(modified); // unchanged
    // An advisory should have been emitted (merge suggestion)
    expect(ctx2.advisories.some((a) => a.id.startsWith("tier3-merge-suggested"))).toBe(true);
  });

  it(".gitignore marker block contains .bkit/.env after first install", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    process.chdir(tmpDir);

    // Simulate the core module writing .gitignore (use the template directly)
    const pkgRoot = getPkgRoot();
    const gitignoreTemplate = path.join(pkgRoot, ".bkit", "templates", "gitignore");
    const gitignoreDst = path.join(tmpDir, ".gitignore");
    if (fs.existsSync(gitignoreTemplate)) {
      fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
      const content = fs.readFileSync(gitignoreDst, "utf-8");
      // Should contain .bkit/.env inside the bkit marker block
      expect(content).toContain(".bkit/.env");
      // The entry must be inside the bkit block
      const blockMatch = content.match(/# <!-- bkit:start -->([\s\S]*?)# <!-- bkit:end -->/);
      expect(blockMatch).not.toBeNull();
      expect(blockMatch![1]).toContain(".bkit/.env");
    }
  });

  it(".gitignore marker block .bkit/.env entry unchanged on second install", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    process.chdir(tmpDir);

    const pkgRoot = getPkgRoot();
    const gitignoreTemplate = path.join(pkgRoot, ".bkit", "templates", "gitignore");
    const gitignoreDst = path.join(tmpDir, ".gitignore");
    if (fs.existsSync(gitignoreTemplate)) {
      // First install
      fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
      const after1 = fs.readFileSync(gitignoreDst, "utf-8");

      // Second install (re-copy template = same result since content is identical)
      fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
      const after2 = fs.readFileSync(gitignoreDst, "utf-8");

      expect(after2).toBe(after1); // idempotent
      expect(after2).toContain(".bkit/.env");
    }
  });
});

// ---------------------------------------------------------------------------
// Scenario: runPayload re-points a stale .envrc dotenv directive on upgrade
//
// Consumers who first installed on the .agents/ layout carry an .envrc seeded
// with `dotenv_if_exists .agents/.env`. The .bkit/ move (3.0.0) relocates the
// env file to .bkit/.env but, because .envrc is Tier-3 seed-or-print, never
// rewrites the now-stale directive — silently breaking direnv auto-load. These
// tests lock in the surgical line-migration that re-points ONLY bkit's own line.
// The beforeEach chdir's into a fresh tmpDir, so isDogfood() is false and the
// migration steps run (the bkit repo itself is guarded out).
// ---------------------------------------------------------------------------

describe("Scenario: runPayload .envrc directive migration (.agents/.env → .bkit/.env)", () => {
  const STALE_ENVRC =
    "# .envrc — direnv config shipped by bkit.\n" +
    "dotenv_if_exists .agents/.env\n" +
    "dotenv_if_exists .agents/.env.local\n";

  it("re-points the stale bkit directive and counts a write", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), STALE_ENVRC, "utf-8");

    const result = runPayload(false);

    const after = fs.readFileSync(path.join(tmpDir, ".envrc"), "utf-8");
    expect(after).toContain("dotenv_if_exists .bkit/.env");
    // The bare .agents/.env directive is gone...
    expect(after).not.toMatch(/^dotenv_if_exists \.agents\/\.env$/m);
    // ...but the consumer-appended sibling is preserved untouched.
    expect(after).toContain("dotenv_if_exists .agents/.env.local");
    // The header comment is preserved.
    expect(after).toContain("# .envrc — direnv config shipped by bkit.");
    expect(result.writes).toBeGreaterThanOrEqual(1);
  });

  it("is idempotent — a second pass makes no further change", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), STALE_ENVRC, "utf-8");
    runPayload(false);
    const afterFirst = fs.readFileSync(path.join(tmpDir, ".envrc"), "utf-8");

    const result = runPayload(false);
    const afterSecond = fs.readFileSync(path.join(tmpDir, ".envrc"), "utf-8");

    expect(afterSecond).toBe(afterFirst);
    // No .envrc rewrite the second time (writes attributable to the directive == 0).
    expect(result.writes).toBe(0);
  });

  it("leaves an already-migrated .envrc untouched (no false rewrite)", () => {
    const fresh = "# header\ndotenv_if_exists .bkit/.env\n";
    fs.writeFileSync(path.join(tmpDir, ".envrc"), fresh, "utf-8");

    const result = runPayload(false);

    expect(fs.readFileSync(path.join(tmpDir, ".envrc"), "utf-8")).toBe(fresh);
    expect(result.writes).toBe(0);
  });

  it("dry-run reports the write but does not touch the file on disk", () => {
    fs.writeFileSync(path.join(tmpDir, ".envrc"), STALE_ENVRC, "utf-8");

    const result = runPayload(true);

    expect(fs.readFileSync(path.join(tmpDir, ".envrc"), "utf-8")).toBe(STALE_ENVRC);
    expect(result.writes).toBeGreaterThanOrEqual(1);
  });

  it("no-op when .envrc is absent", () => {
    const result = runPayload(false);
    expect(fs.existsSync(path.join(tmpDir, ".envrc"))).toBe(false);
    expect(result.writes).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Challenge regression tests — Finding 3 (constraint-before-write)
//
// The build challenge (Finding 3 MEDIUM) identified that the tracker value was
// persisted to package.json BEFORE the cloud/tracker constraint check ran.
// For `bkit install --tracker=github --auto=cursor`:
//   1. Tracker-switch block passed.
//   2. bkit.issueTracker="github" WRITTEN to package.json.
//   3. Cloud/tracker constraint fired (cursor requires linear != github) → exit 1.
// Net effect: a failed install recorded the tracker, stranding the user.
//
// Remediation hoisted the cloud/tracker constraint check ABOVE the package.json
// write, preserving the "no state written on hard error" invariant.
//
// These tests lock in the invariant:
//   (a) `bkit install --tracker=github --auto=cursor` exits non-zero.
//   (b) package.json is NOT mutated (issueTracker NOT written on mismatch).
// ---------------------------------------------------------------------------

describe("Challenge Finding 3 — cloud/tracker constraint-before-write regression", () => {
  const getInstallPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
  const getTsxBin = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

  it("--tracker=github --auto=cursor exits non-zero (constraint mismatch)", () => {
    // Finding 3 (a): the mismatch must be a hard error — exit 1 every time.
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return;

    const initialPkg = { name: "constraint-test", version: "0.0.0" };
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(initialPkg), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const result = spawnSync(
      tsxBin,
      [getInstallPath(), "install", "--tracker=github", "--auto=cursor"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 30_000,
      },
    );

    // Must exit non-zero (the constraint hard-error path).
    expect(
      result.status,
      `Expected non-zero exit for tracker/cloud mismatch.\n` +
        `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
    ).not.toBe(0);

    // Error output must mention the mismatch.
    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(combined).toMatch(/cloud=cursor.*tracker.*linear|cursor.*requires.*linear/i);
  });

  it("--tracker=github --auto=cursor does NOT write bkit.issueTracker to package.json (no partial write)", () => {
    // Finding 3 (b): the "no state written on hard error" invariant.
    // The pre-remediation code wrote issueTracker BEFORE the constraint check,
    // meaning package.json was mutated even on a failed install.
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return;

    const initialPkg = { name: "constraint-test", version: "0.0.0" };
    const initialPkgJson = JSON.stringify(initialPkg);
    fs.writeFileSync(path.join(tmpDir, "package.json"), initialPkgJson, "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    spawnSync(tsxBin, [getInstallPath(), "install", "--tracker=github", "--auto=cursor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 30_000,
    });

    // package.json must NOT have bkit.issueTracker set (no partial write).
    const afterPkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { issueTracker?: string };
    };

    expect(
      afterPkg.bkit?.issueTracker,
      "bkit.issueTracker must NOT be written when the install exits due to a cloud/tracker constraint mismatch",
    ).toBeUndefined();
  });

  it("--tracker=linear --auto=cursor exits 0 and writes bkit.issueTracker=linear (matching pair)", () => {
    // Complementary positive case: the matching pair must succeed and persist state.
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return;

    const initialPkg = { name: "constraint-test", version: "0.0.0" };
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(initialPkg), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const result = spawnSync(
      tsxBin,
      [getInstallPath(), "install", "--tracker=linear", "--auto=cursor"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(
      result.status,
      `Expected exit 0 for matching tracker/cloud pair.\n` + `stdout: ${combined}`,
    ).toBe(0);

    const afterPkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { issueTracker?: string; cloudAgents?: string };
    };

    expect(afterPkg.bkit?.issueTracker).toBe("linear");
    expect(afterPkg.bkit?.cloudAgents).toBe("cursor");
  });
});

// ---------------------------------------------------------------------------
// Scenario P1-A — Orphan cleanup gate: bkit-auto.yml removal is gated on
// bkit-cloud.yml being present or in upgrade candidates.
//
// Regression guard for the P1 fix: before the fix, `bkit upgrade` would delete
// bkit-auto.yml even when bkit-cloud.yml was not present and not being installed
// in the same run — silently removing the cloud workflow without a replacement.
//
// Three cases:
//   A) bkit-auto.yml exists, bkit-cloud.yml absent, NOT in candidates → NOT deleted.
//   B) bkit-auto.yml exists, bkit-cloud.yml already present on disk → deleted.
//   C) bkit-auto.yml exists, bkit-cloud.yml IS in candidates (will be installed) → deleted.
// ---------------------------------------------------------------------------

describe("Scenario P1-A — orphan-cleanup gate: bkit-auto.yml only removed when bkit-cloud.yml present/in candidates", () => {
  const getInstallPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
  const getTsxBin = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

  function seedUpgradeConsumer(withCloudYml: boolean): void {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "orphan-gate-consumer",
        version: "0.0.0",
        devDependencies: {},
        bkit: { pinnedVersion: "0.0.0" },
      }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    // Seed bkit-auto.yml (the orphan to be cleaned)
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "bkit-auto.yml"),
      "# old auto workflow\n",
      "utf-8",
    );
    if (withCloudYml) {
      // Seed bkit-cloud.yml already present on disk
      fs.writeFileSync(
        path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
        "# cloud workflow placeholder\n",
        "utf-8",
      );
    }
  }

  it("Case A: bkit-auto.yml is NOT deleted when bkit-cloud.yml is absent and not in candidates", () => {
    // Source-level verification of the gate condition.
    // The upgrade path in bkit-install.ts must check:
    //   fs.existsSync(newCloudWorkflow) || cloudWillBeInstalled
    // before deleting oldAutoWorkflow.
    const src = fs.readFileSync(
      path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts"),
      "utf-8",
    );
    // Gate: oldAutoWorkflow removal requires newCloudWorkflow present OR cloudWillBeInstalled
    expect(src).toContain("fs.existsSync(newCloudWorkflow) || cloudWillBeInstalled");
    // The gate must appear BEFORE the rmSync call
    const gateIdx = src.indexOf("fs.existsSync(newCloudWorkflow) || cloudWillBeInstalled");
    const rmIdx = src.indexOf("fs.rmSync(oldAutoWorkflow, { force: true })");
    expect(gateIdx).toBeLessThan(rmIdx);
    expect(gateIdx).toBeGreaterThan(-1);
    expect(rmIdx).toBeGreaterThan(-1);
  });

  it("Case B: bkit-auto.yml IS deleted when bkit-cloud.yml is already on disk (subprocess upgrade)", () => {
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return;

    seedUpgradeConsumer(true); // bkit-cloud.yml already present

    const oldAutoPath = path.join(tmpDir, ".github", "workflows", "bkit-auto.yml");
    expect(fs.existsSync(oldAutoPath), "bkit-auto.yml must exist before upgrade").toBe(true);

    const result = spawnSync(tsxBin, [getInstallPath(), "upgrade", "--auto-apply"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    // Upgrade may exit non-zero on conflicts — that's OK; we only care about file removal
    // The log must mention the orphan removal
    expect(combined).toContain("bkit-auto.yml");
    // bkit-auto.yml must be gone (it was replaced by bkit-cloud.yml)
    expect(
      fs.existsSync(oldAutoPath),
      `bkit-auto.yml should be deleted when bkit-cloud.yml is present.\ncombined: ${combined}`,
    ).toBe(false);
  }, 90_000);

  it("Case C: bkit-auto.yml is NOT deleted when bkit-cloud.yml absent and not installed (dry-run gate verification)", () => {
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return;

    seedUpgradeConsumer(false); // bkit-cloud.yml absent

    const oldAutoPath = path.join(tmpDir, ".github", "workflows", "bkit-auto.yml");
    expect(fs.existsSync(oldAutoPath), "bkit-auto.yml must exist before upgrade").toBe(true);

    // Run upgrade --dry-run — even in dry-run mode the gate logic executes
    // (the log line appears but no FS write occurs). Since bkit-cloud.yml is absent
    // and not in candidates, the orphan removal code must NOT log the removal message.
    const result = spawnSync(tsxBin, [getInstallPath(), "upgrade", "--auto-apply", "--dry-run"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

    // bkit-auto.yml must still exist — removal was not triggered
    expect(
      fs.existsSync(oldAutoPath),
      "bkit-auto.yml must NOT be deleted when bkit-cloud.yml absent",
    ).toBe(true);

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    // The removal log must NOT appear (gate not triggered)
    expect(combined).not.toContain("removing orphan .github/workflows/bkit-auto.yml");
  }, 90_000);
});

// ---------------------------------------------------------------------------
// Scenario P1-B — Ollama cloud warning: bkit install --auto=opencode with
// an existing .opencode/opencode.json that has provider key "ollama-local" must
// emit a console.warn containing "ollama-local" and "local server".
//
// This is a non-fatal warning — the install proceeds (exits 0) but surfaces a
// diagnostic message to prevent a surprising runtime failure in the cloud job.
// ---------------------------------------------------------------------------

describe("Scenario P1-B — ollama-local cloud warning on --auto=opencode install", () => {
  const getInstallPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
  const getTsxBin = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

  it("emits warning containing 'ollama-local' and 'local server' when .opencode/opencode.json has provider key=ollama-local", () => {
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return;

    // Consumer prerequisites: package.json + .git + tracker=github (required for --auto=opencode)
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "ollama-warn-consumer",
        version: "0.0.0",
        devDependencies: {},
        bkit: { issueTracker: "github" },
      }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    // Seed .opencode/opencode.json with provider key = "ollama-local" (npm-based format)
    fs.mkdirSync(path.join(tmpDir, ".opencode"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".opencode", "opencode.json"),
      JSON.stringify({
        provider: {
          "ollama-local": {
            npm: "@ai-sdk/openai-compatible",
            name: "Ollama (Local)",
            options: { baseURL: "http://localhost:11434/v1" },
          },
        },
      }),
      "utf-8",
    );

    // Run: bkit install --tracker=github --auto=opencode
    // The --opencode host is already "installed" (we seeded .opencode/), so --auto=opencode
    // should reach the provider check and emit the warning.
    const result = spawnSync(
      tsxBin,
      [getInstallPath(), "install", "--tracker=github", "--auto=opencode"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    // stdout + stderr (console.warn may go to either depending on Node/tsx)
    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

    // The warning must mention "ollama-local" (the provider) and "local server" (the key phrase)
    expect(combined).toMatch(/ollama-local/i);
    expect(combined).toMatch(/local server/i);

    // Warning is non-fatal — install exits 0 (the tracker/cloud pair matches)
    expect(result.status, `Expected exit 0 (warning is non-fatal).\ncombined: ${combined}`).toBe(0);
  }, 90_000);

  it("does NOT emit ollama-local warning when provider is not local (e.g. nvidia)", () => {
    const tsxBin = getTsxBin();
    if (!fs.existsSync(tsxBin)) return;

    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "nvidia-warn-consumer",
        version: "0.0.0",
        devDependencies: {},
        bkit: { issueTracker: "github" },
      }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    // Seed .opencode/opencode.json with provider key = "nvidia" (remote provider)
    fs.mkdirSync(path.join(tmpDir, ".opencode"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".opencode", "opencode.json"),
      JSON.stringify({
        provider: {
          nvidia: {
            npm: "@ai-sdk/openai-compatible",
            name: "NVIDIA NIM",
            options: {
              baseURL: "https://integrate.api.nvidia.com/v1",
              apiKey: "{env:NVIDIA_API_KEY}",
            },
          },
        },
      }),
      "utf-8",
    );

    const result = spawnSync(
      tsxBin,
      [getInstallPath(), "install", "--tracker=github", "--auto=opencode"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    // No local-server warning expected for a remote provider
    expect(combined).not.toMatch(/local server/i);
    expect(result.status, `Expected exit 0.\ncombined: ${combined}`).toBe(0);
  }, 90_000);
});

// ---------------------------------------------------------------------------
// #252 — CLI surface redesign (subprocess): install ≥1-flag guard, check/upgrade
// no-flag guard, and CLAUDE.md ownership move (core → claude).
// ---------------------------------------------------------------------------

describe("#252 — install requires ≥1 module flag; check/upgrade take none", () => {
  let tmp: string;
  const installPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
  const tsxPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

  function run(args: string[]) {
    return spawnSync(tsxPath(), [installPath(), ...args], {
      cwd: tmp,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1", GH_BKIT_TOKEN_INSTALL: "fake-token-for-test" },
      timeout: 60_000,
    });
  }

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-252-"));
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "c", version: "0.0.0", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmp, ".git"), { recursive: true });
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it("bare `bkit install` errors (≥1 module flag required)", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["install"]);
    expect(r.status).toBe(1);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/at least one module flag/i);
  });

  it("`bkit check --claude` (stray module flag) errors", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["check", "--claude"]);
    expect(r.status).toBe(1);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/takes no module flags/i);
  });

  it("`bkit upgrade --tooling` (stray module flag) errors", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["upgrade", "--tooling"]);
    expect(r.status).toBe(1);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/takes no module flags/i);
  });

  it("`bkit install --claude` ships root CLAUDE.md (redirect)", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["install", "--claude"]);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    expect(fs.existsSync(path.join(tmp, "CLAUDE.md"))).toBe(true);
    expect(fs.readFileSync(path.join(tmp, "CLAUDE.md"), "utf-8")).toContain(".agents/rules.md");
    // Core is implicit — AGENTS.md ships too.
    expect(fs.existsSync(path.join(tmp, "AGENTS.md"))).toBe(true);
  });

  it("`bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core)", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["install", "--cursor"]);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    expect(fs.existsSync(path.join(tmp, "CLAUDE.md"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, "AGENTS.md"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".cursor"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".claude"))).toBe(false);
  });

  it("`bkit install --tooling` ships ci.yml + .vale.ini; no host dirs", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["install", "--tooling"]);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    expect(fs.existsSync(path.join(tmp, ".github", "workflows", "ci.yml"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".vale.ini"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".husky", "pre-commit"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".claude"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, ".cursor"))).toBe(false);
  });

  it("`bkit check` after a --cursor-only install reports no drift (no false .claude drift)", () => {
    if (!fs.existsSync(tsxPath())) return;
    expect(run(["install", "--cursor"]).status).toBe(0);
    const r = run(["check"]);
    expect(r.status, `check should be clean:\n${r.stdout}\n${r.stderr}`).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// detectOpencodeProviders — multi-provider tracking (issue #281 Task 2)
// ---------------------------------------------------------------------------

describe("detectRenovateRunner — runner resolution + clobber guard (#325)", () => {
  const WF_REL = path.join(".github", "workflows", "renovate.yml");
  const CANONICAL = () =>
    fs.readFileSync(path.join(getTemplatesRoot(), ".github", "workflows", "renovate.yml"), "utf-8");
  const writeWorkflow = (content: string) => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, WF_REL), content, "utf-8");
  };
  const writePkg = (bkit?: Record<string, unknown>) =>
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(bkit ? { name: "x", bkit } : { name: "x" }),
      "utf-8",
    );

  it("field wins: bkit.renovateRunner=self → self (even with no workflow)", () => {
    writePkg({ renovateRunner: "self" });
    expect(detectRenovateRunner(tmpDir)).toBe("self");
  });

  it("field wins: bkit.renovateRunner=mend → mend (even with a byte-equal workflow present)", () => {
    writePkg({ renovateRunner: "mend" });
    writeWorkflow(CANONICAL());
    expect(detectRenovateRunner(tmpDir)).toBe("mend");
  });

  it("no field + byte-equal workflow → self (field-stripped recovery)", () => {
    writePkg();
    writeWorkflow(CANONICAL());
    expect(detectRenovateRunner(tmpDir)).toBe("self");
  });

  it("no field + BESPOKE workflow (differs from template) → mend, NOT self (clobber guard)", () => {
    // A consumer's own self-hosted renovate.yml uses the conventional filename. It must
    // NOT be classified bkit-owned, or the self writeTier1 would force-overwrite it.
    writePkg();
    writeWorkflow("name: My Own Renovate\non:\n  schedule:\n    - cron: '0 0 * * 0'\n");
    expect(detectRenovateRunner(tmpDir)).toBe("mend");
  });

  it("no field + no workflow → mend (fresh install default)", () => {
    writePkg();
    expect(detectRenovateRunner(tmpDir)).toBe("mend");
  });

  it("malformed package.json → mend (no throw)", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not json", "utf-8");
    expect(detectRenovateRunner(tmpDir)).toBe("mend");
  });
});

describe("detectOpencodeProviders — multi-provider tracking (issue #281 Task 2)", () => {
  it("reads opencodeProviders array from package.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "x",
        bkit: { opencodeProvider: "groq", opencodeProviders: ["nvidia", "groq"] },
      }),
      "utf-8",
    );
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual(["nvidia", "groq"]);
  });

  it("falls back to [opencodeProvider] for legacy single-string installs", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", bkit: { opencodeProvider: "nvidia" } }),
      "utf-8",
    );
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual(["nvidia"]);
  });

  it("returns [] when no bkit opencode fields present", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x" }), "utf-8");
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual([]);
  });

  it("filters invalid providers from the array", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "x",
        bkit: { opencodeProviders: ["nvidia", "bad-provider", "groq"] },
      }),
      "utf-8",
    );
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual(["nvidia", "groq"]);
  });

  it("returns [] when package.json does not exist", () => {
    // tmpDir has no package.json
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// opencodeProviders persist block — two sequential installs + legacy migration
// (issue #281 Task 2)
// ---------------------------------------------------------------------------

describe("opencodeProviders persist block — sequential installs + legacy migration (issue #281 Task 2)", () => {
  let tmp: string;
  const installPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
  const tsxPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

  function run(args: string[]) {
    return spawnSync(tsxPath(), [installPath(), ...args], {
      cwd: tmp,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1", GH_BKIT_TOKEN_INSTALL: "fake-token-for-test" },
      timeout: 60_000,
    });
  }

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-281-task2-"));
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2),
    );
    fs.mkdirSync(path.join(tmp, ".git"), { recursive: true });
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it("two sequential installs: opencodeProviders = both, opencodeProvider = second", () => {
    if (!fs.existsSync(tsxPath())) return;
    // First install: nvidia
    const r1 = run(["install", "--opencode=nvidia"]);
    expect(r1.status, `first install failed:\n${r1.stdout}\n${r1.stderr}`).toBe(0);

    const pkg1 = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8")) as {
      bkit?: { opencodeProvider?: string; opencodeProviders?: string[] };
    };
    expect(pkg1.bkit?.opencodeProvider).toBe("nvidia");
    expect(pkg1.bkit?.opencodeProviders).toEqual(["nvidia"]);

    // Second install: groq
    const r2 = run(["install", "--opencode=groq"]);
    expect(r2.status, `second install failed:\n${r2.stdout}\n${r2.stderr}`).toBe(0);

    const pkg2 = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8")) as {
      bkit?: { opencodeProvider?: string; opencodeProviders?: string[] };
    };
    expect(pkg2.bkit?.opencodeProvider).toBe("groq");
    expect(pkg2.bkit?.opencodeProviders).toContain("nvidia");
    expect(pkg2.bkit?.opencodeProviders).toContain("groq");
    expect(pkg2.bkit?.opencodeProviders).toHaveLength(2);
  });

  it("legacy single-string install migrates to opencodeProviders array on next install", () => {
    if (!fs.existsSync(tsxPath())) return;
    // Simulate a legacy install: only bkit.opencodeProvider, no opencodeProviders
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify(
        { name: "consumer", version: "0.0.0", bkit: { opencodeProvider: "nvidia" } },
        null,
        2,
      ),
    );

    // Run a new install with groq — should migrate nvidia into the array
    const r = run(["install", "--opencode=groq"]);
    expect(r.status, `install failed:\n${r.stdout}\n${r.stderr}`).toBe(0);

    const pkg = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8")) as {
      bkit?: { opencodeProvider?: string; opencodeProviders?: string[] };
    };
    expect(pkg.bkit?.opencodeProvider).toBe("groq");
    expect(pkg.bkit?.opencodeProviders).toContain("nvidia");
    expect(pkg.bkit?.opencodeProviders).toContain("groq");
    expect(pkg.bkit?.opencodeProviders).toHaveLength(2);
  });
});
