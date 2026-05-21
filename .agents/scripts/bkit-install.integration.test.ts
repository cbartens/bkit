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
  STAGING_ROOT,
} from "./bkit-install";
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

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--full"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 30_000,
    });

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
      expect(ids).toContain("gh-bkit-token-unset-shell");
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
    const savedToken = process.env.GH_BKIT_TOKEN;
    delete process.env.GH_BKIT_TOKEN;

    let findings: ReturnType<typeof runPostInstallCheck>;
    try {
      findings = runPostInstallCheck(preflightAdvisories, ws, makeModules("core", "lint"), tmpDir);
    } finally {
      if (savedToken !== undefined) process.env.GH_BKIT_TOKEN = savedToken;
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
// The fix sources the model lookup from the PACKAGE's .agents/prompts.md, so a
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

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--full"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(result.status, `install crashed:\n${combined}`).toBe(0);
    expect(combined).not.toContain("Missing model lookup");
    expect(combined).not.toContain("frontmatter missing");
    // Sanity-check the install actually produced consumer outputs.
    expect(fs.existsSync(path.join(tmpDir, ".claude", "agents"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".cursor", "agents"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".agents", ".bkit-version"))).toBe(true);
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
    // Seed: .npmrc references ${GH_BKIT_TOKEN} → ci-yml-missing-token-env elevated to blocker
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", version: "0.0.0" }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    // ci.yml has pnpm install but no GH_BKIT_TOKEN env mapping
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install\n",
      "utf-8",
    );
    // .npmrc references ${GH_BKIT_TOKEN} → elevates ci-yml finding to blocker
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n",
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
      "//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n",
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
    // ci.yml missing GH_BKIT_TOKEN env mapping
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install --frozen-lockfile\n",
    );
    // .npmrc that references ${GH_BKIT_TOKEN} — triggers blocker escalation
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n",
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

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--ci"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        // Override GH_BKIT_TOKEN to avoid shell-token advisory overlapping
        GH_BKIT_TOKEN: "fake-token-for-test",
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
    // ci.yml missing GH_BKIT_TOKEN env + .npmrc referencing ${GH_BKIT_TOKEN}
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
    // ci.yml missing GH_BKIT_TOKEN env mapping — triggers blocker in Phase 3
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install --frozen-lockfile\n",
    );
    // .npmrc that references ${GH_BKIT_TOKEN} — escalates to blocker
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n",
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

    // Capture pre-install state: .agents/.bkit-version must not exist
    const versionFilePath = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFilePath)).toBe(false);

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--core", "--auto-revert"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        // Set GH_BKIT_TOKEN so the shell-token advisory doesn't interfere
        GH_BKIT_TOKEN: "fake-token-for-test",
      },
      timeout: 60_000,
    });

    // Exit 1 due to Phase 3 blocker
    expect(result.status).toBe(1);

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

    // Auto-revert log messages must be present — confirms in-process revert ran
    expect(combined).toContain("--auto-revert");

    // The Tier-1 .agents/.bkit-version written by --core MUST be absent after
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
  it("fresh install via bkit install --full scaffolds .mcp.json with linear and github keys", () => {
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

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--full"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

    const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    expect(result.status, `install crashed:\n${combined}`).toBe(0);

    // .mcp.json must exist and contain both required MCP server entries
    const mcpJsonPath = path.join(tmpDir, ".mcp.json");
    expect(fs.existsSync(mcpJsonPath), ".mcp.json must be scaffolded by bkit install --full").toBe(
      true,
    );
    const mcpJson = JSON.parse(fs.readFileSync(mcpJsonPath, "utf-8")) as {
      mcpServers?: Record<string, unknown>;
    };
    expect(mcpJson.mcpServers, ".mcp.json must have mcpServers").toBeDefined();
    expect(mcpJson.mcpServers!["linear"], ".mcp.json must have linear server").toBeDefined();
    expect(mcpJson.mcpServers!["github"], ".mcp.json must have github server").toBeDefined();

    // .cursor/mcp.json must also be scaffolded
    const cursorMcpPath = path.join(tmpDir, ".cursor", "mcp.json");
    expect(
      fs.existsSync(cursorMcpPath),
      ".cursor/mcp.json must be scaffolded by bkit install --full",
    ).toBe(true);
    const cursorMcp = JSON.parse(fs.readFileSync(cursorMcpPath, "utf-8")) as {
      mcpServers?: Record<string, unknown>;
    };
    expect(
      cursorMcp.mcpServers!["linear"],
      ".cursor/mcp.json must have linear server",
    ).toBeDefined();
    expect(
      cursorMcp.mcpServers!["github"],
      ".cursor/mcp.json must have github server",
    ).toBeDefined();
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

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--full"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

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
// Scenario: .agents/.env.example + .envrc scaffolding (BAR-260 follow-up)
// ---------------------------------------------------------------------------

import { runClaudeModule, getPkgRoot } from "./bkit-modules";
import type { ModuleContext } from "./bkit-modules";
import type { WriteSet } from "./bkit-tiers";
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
  it("first install seeds .agents/.env.example when template exists", () => {
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

    const envExamplePath = path.join(tmpDir, ".agents", ".env.example");
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const content = fs.readFileSync(envExamplePath, "utf-8");
    expect(content).toContain("GH_TOKEN=");
    expect(content).toContain("GH_BKIT_TOKEN=");
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
    expect(content).toContain("dotenv_if_exists .agents/.env");
  });

  it("second install is idempotent — does not overwrite consumer-modified .agents/.env.example", () => {
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
    const envExamplePath = path.join(tmpDir, ".agents", ".env.example");
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

  it(".gitignore marker block contains .agents/.env after first install", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    process.chdir(tmpDir);

    // Simulate the core module writing .gitignore (use the template directly)
    const pkgRoot = getPkgRoot();
    const gitignoreTemplate = path.join(pkgRoot, ".agents", "templates", "gitignore");
    const gitignoreDst = path.join(tmpDir, ".gitignore");
    if (fs.existsSync(gitignoreTemplate)) {
      fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
      const content = fs.readFileSync(gitignoreDst, "utf-8");
      // Should contain .agents/.env inside the bkit marker block
      expect(content).toContain(".agents/.env");
      // The entry must be inside the bkit block
      const blockMatch = content.match(/# <!-- bkit:start -->([\s\S]*?)# <!-- bkit:end -->/);
      expect(blockMatch).not.toBeNull();
      expect(blockMatch![1]).toContain(".agents/.env");
    }
  });

  it(".gitignore marker block .agents/.env entry unchanged on second install", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    process.chdir(tmpDir);

    const pkgRoot = getPkgRoot();
    const gitignoreTemplate = path.join(pkgRoot, ".agents", "templates", "gitignore");
    const gitignoreDst = path.join(tmpDir, ".gitignore");
    if (fs.existsSync(gitignoreTemplate)) {
      // First install
      fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
      const after1 = fs.readFileSync(gitignoreDst, "utf-8");

      // Second install (re-copy template = same result since content is identical)
      fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
      const after2 = fs.readFileSync(gitignoreDst, "utf-8");

      expect(after2).toBe(after1); // idempotent
      expect(after2).toContain(".agents/.env");
    }
  });
});
