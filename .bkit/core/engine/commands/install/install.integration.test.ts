// commands/install/install.integration.test.ts — Integration tests for the three-phase
// install flow (BAR-141: preflight blockers, advisory checklist, dry-run parity).
//
// These tests exercise the Phase 1 → Phase 2 → Phase 3 pipeline at the function
// level, consistent with the existing install/modules/index.integration.test.ts pattern.
// Subprocess spawning is used only for the blocker exit-code scenario where the
// actual process.exit(1) boundary must be verified.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runPreflight } from "../../checks/before/index";
import { formatChecklist, runPostInstallCheck } from "../../checks/after/index";
import { detectOpencodeProviders } from "./install";
import type { ModuleFlag } from "../../cli";
import { resolveNetworkAllowlist } from "../../install/cloud-env";

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
    const { blockers } = runPreflight(makeModules("core", "lint"), tmpDir);
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
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );

    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--typescript"],
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
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer", version: "0.1.0" }),
      "utf-8",
    );
    // A bkit .gitignore line outside any bkit block — triggers gitignore-block-duplicates
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), ".worktrees/\n", "utf-8");
    // .git dir — so not-git-repo does NOT fire
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
  });

  it("runPreflight returns advisory findings for seeded conditions", () => {
    const { blockers, advisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(blockers).toHaveLength(0);
    const ids = advisories.map((f) => f.id);
    expect(ids).toContain("gitignore-block-duplicates");
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

    // Temporarily unset BKIT_GH_TOKEN_INSTALL
    const savedToken = process.env.BKIT_GH_TOKEN_INSTALL;
    delete process.env.BKIT_GH_TOKEN_INSTALL;

    try {
      const postFindings = runPostInstallCheck(preflightAdvisories, tmpDir);
      const ids = postFindings.map((f) => f.id);
      expect(ids).toContain("gh-bkit-token-unset-shell");
    } finally {
      if (savedToken !== undefined) process.env.BKIT_GH_TOKEN_INSTALL = savedToken;
    }
  });

  it("full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    expect(preflightAdvisories.length).toBeGreaterThan(0);

    const savedToken = process.env.BKIT_GH_TOKEN_INSTALL;
    delete process.env.BKIT_GH_TOKEN_INSTALL;

    let postFindings: ReturnType<typeof runPostInstallCheck>;
    try {
      postFindings = runPostInstallCheck(preflightAdvisories, tmpDir);
    } finally {
      if (savedToken !== undefined) process.env.BKIT_GH_TOKEN_INSTALL = savedToken;
    }

    // Phase 1 findings should be present in the combined output
    const ids = postFindings.map((f) => f.id);
    expect(ids).toContain("gitignore-block-duplicates");
    // Phase 3 shell token finding should also be present
    expect(ids).toContain("gh-bkit-token-unset-shell");

    const banner = formatChecklist(postFindings);
    expect(banner).toBeTruthy();
    expect(banner).toContain("gitignore-block-duplicates");
    expect(banner).toContain("gh-bkit-token-unset-shell");
  });

  it("no duplicate ids in the final checklist", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const postFindings = runPostInstallCheck(preflightAdvisories, tmpDir);
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
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.writeFileSync(path.join(tmpDir, ".gitignore"), ".worktrees/\n", "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-commit"), "#!/bin/sh\npnpm test\n", "utf-8");
  });

  it("runPostInstallCheck includes Phase 3 detector findings (gh-bkit-token-unset-shell when token unset)", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const savedToken = process.env.BKIT_GH_TOKEN_INSTALL;
    delete process.env.BKIT_GH_TOKEN_INSTALL;

    let findings: ReturnType<typeof runPostInstallCheck>;
    try {
      findings = runPostInstallCheck(preflightAdvisories, tmpDir);
    } finally {
      if (savedToken !== undefined) process.env.BKIT_GH_TOKEN_INSTALL = savedToken;
    }

    // Phase 3 ran: gh-bkit-token-unset-shell must appear when token is missing.
    expect(findings.map((f) => f.id)).toContain("gh-bkit-token-unset-shell");
  });

  it("formatChecklist renders Phase 1 advisories", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "lint"), tmpDir);
    const banner = formatChecklist(preflightAdvisories);
    expect(banner).toBeTruthy();
    expect(banner).toContain("gitignore-block-duplicates");
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
// Scenario 4 — a stale consumer .agents/prompts.md does NOT crash install on
// "Missing model lookup for <name>".
//
// Install sources the model lookup from the PACKAGE's .bkit/prompts.md, so a
// consumer copy with an empty/stale Models table is tolerated.
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
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--typescript"],
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
// Scenario 5b — docs/roadmap.md is consumer-owned: `bkit install` NEVER
// creates/overwrites it, and a subsequent `bkit check` dry-run reports clean drift
// (docs/roadmap.md is not part of any managed marker set bkit tracks).
// ---------------------------------------------------------------------------

describe("Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18)", () => {
  it("`bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const installResult = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--typescript"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );
    const installCombined = `${installResult.stdout ?? ""}\n${installResult.stderr ?? ""}`;
    expect(installResult.status, `install crashed:\n${installCombined}`).toBe(0);

    // The load-bearing assertion: docs/roadmap.md is a generated projection
    // owned by the fold/close-step scripts, never by bkit install itself.
    expect(fs.existsSync(path.join(tmpDir, "docs", "roadmap.md"))).toBe(false);

    // A dry-run `bkit check` immediately after must also report clean drift —
    // docs/roadmap.md never enters bkit's tracked write set, so there is
    // nothing to flag as stale/missing for it.
    const checkResult = spawnSync(tsxBin, [bkitInstallPath, "check"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
    const checkCombined = `${checkResult.stdout ?? ""}\n${checkResult.stderr ?? ""}`;
    expect(checkResult.status, `check crashed:\n${checkCombined}`).toBe(0);
    expect(checkCombined).not.toContain("roadmap.md");
    // docs/roadmap.md still must not have been created by the dry-run check.
    expect(fs.existsSync(path.join(tmpDir, "docs", "roadmap.md"))).toBe(false);
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
    // Seed: .npmrc references ${BKIT_GH_TOKEN_INSTALL} → ci-yml-missing-token-env elevated to blocker
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", version: "0.0.0" }),
    );
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    // ci.yml has pnpm install but no BKIT_GH_TOKEN_INSTALL env mapping
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install\n",
      "utf-8",
    );
    // .npmrc references ${BKIT_GH_TOKEN_INSTALL} → elevates ci-yml finding to blocker
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
      "utf-8",
    );

    const findings = runPostInstallCheck([], tmpDir);
    const blocker = findings.find((f) => f.severity === "blocker");
    expect(blocker).toBeDefined();
    expect(blocker!.id).toBe("ci-yml-missing-token-env");
  });

  it("Phase 3 blocker findings are distinguished from advisories (severity=blocker)", () => {
    // Verify that the existing blocker escalation logic in detectCiYmlMissingTokenEnv
    // produces a severity=blocker finding — this is the trigger for exit-1 in commands/install/install.ts
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "steps:\n  - run: pnpm install\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
    );

    const findings = runPostInstallCheck([], tmpDir);
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
    // ci.yml missing BKIT_GH_TOKEN_INSTALL env mapping
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install --frozen-lockfile\n",
    );
    // .npmrc that references ${BKIT_GH_TOKEN_INSTALL} — triggers blocker escalation
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--typescript"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        // Override BKIT_GH_TOKEN_INSTALL to avoid shell-token advisory overlapping
        BKIT_GH_TOKEN_INSTALL: "fake-token-for-test",
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
    // ci.yml missing BKIT_GH_TOKEN_INSTALL env + .npmrc referencing ${BKIT_GH_TOKEN_INSTALL}
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
    // ci.yml missing BKIT_GH_TOKEN_INSTALL env mapping — triggers blocker in Phase 3
    fs.writeFileSync(
      path.join(tmpDir, ".github", "workflows", "ci.yml"),
      "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm install --frozen-lockfile\n",
    );
    // .npmrc that references ${BKIT_GH_TOKEN_INSTALL} — escalates to blocker
    fs.writeFileSync(
      path.join(tmpDir, ".npmrc"),
      "@cbartens:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${BKIT_GH_TOKEN_INSTALL}\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    // Capture pre-install state: .bkit/version must not exist
    const versionFilePath = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFilePath)).toBe(false);

    const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--claude", "--auto-revert"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        // Set BKIT_GH_TOKEN_INSTALL so the shell-token advisory doesn't interfere
        BKIT_GH_TOKEN_INSTALL: "fake-token-for-test",
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
// MCP config (BAR-260): .mcp.json (claude module) and .cursor/mcp.json (cursor
// module). A fresh install writes the tracker-filtered config; after that bkit owns
// only its tracker entry under `mcpServers`.
// ---------------------------------------------------------------------------

describe("MCP config — fresh install and a consumer's own file", () => {
  it("fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0", devDependencies: {} }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--typescript"],
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
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--typescript", "--tracker=github"],
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

    // agent mirrors resolve tracker blocks too: github read tools only, no markers
    for (const host of [".claude", ".cursor"]) {
      const agent = fs.readFileSync(
        path.join(tmpDir, host, "agents", "bkit-utility-update-roadmap.md"),
        "utf-8",
      );
      expect(agent, `${host} agent markers`).not.toMatch(/<!--\s*bkit:tracker\b/);
      expect(agent, `${host} agent github tools`).toContain("  - mcp__github__list_issues\n");
      expect(agent, `${host} agent linear tools`).not.toContain("mcp__linear__");
      expect(agent.match(/^ {2}- Bash$/gm), `${host} agent Bash once`).toHaveLength(1);
    }
  });

  it("re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged", () => {
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
      "../../cli.ts",
    );
    const tsxBin = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    const result = spawnSync(
      tsxBin,
      [bkitInstallPath, "install", "--claude", "--cursor", "--typescript"],
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

// ---------------------------------------------------------------------------
// Constraint-before-write: the cloud/tracker constraint check runs BEFORE the
// package.json write, so a hard error writes no state.
//
// Invariant:
//   (a) `bkit install --tracker=github --auto=cursor` exits non-zero.
//   (b) package.json is NOT mutated (issueTracker NOT written on mismatch).
// ---------------------------------------------------------------------------

describe("Challenge Finding 3 — cloud/tracker constraint-before-write regression", () => {
  const getInstallPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
  const getTsxBin = () =>
    path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );

  it("--tracker=github --auto=cursor exits non-zero (constraint mismatch)", () => {
    // Finding 3 (a): the mismatch must be a hard error — exit 1 every time.
    const tsxBin = getTsxBin();
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

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
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

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
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

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
// Scenario P1-B — Ollama cloud warning: bkit install --auto=opencode with
// an existing .opencode/opencode.json that has provider key "ollama" must
// emit a console.warn containing "ollama" and "local server".
//
// This is a non-fatal warning — the install proceeds (exits 0) but surfaces a
// diagnostic message to prevent a surprising runtime failure in the cloud job.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CLI surface (subprocess): install ≥1-flag guard, check/upgrade no-flag guard, and
// CLAUDE.md owned by the claude module.
// ---------------------------------------------------------------------------

describe("#252 — install requires ≥1 module flag; check/upgrade take none", () => {
  let tmp: string;
  const installPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
  const tsxPath = () =>
    path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );

  function run(args: string[]) {
    return spawnSync(tsxPath(), [installPath(), ...args], {
      cwd: tmp,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1", BKIT_GH_TOKEN_INSTALL: "fake-token-for-test" },
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

  it("bare `bkit` (no command) prints usage and exits 2 (usage error)", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run([]);
    expect(r.status).toBe(2);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/bkit install/);
  });

  it("explicit `bkit help` prints the same usage and exits 0", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["help"]);
    expect(r.status).toBe(0);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/bkit install/);
  });

  it("`bkit check --claude` (stray module flag) errors", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["check", "--claude"]);
    expect(r.status).toBe(1);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/takes no module flags/i);
  });

  it("`bkit upgrade --typescript` (stray module flag) errors", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["upgrade", "--typescript"]);
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

  it("`bkit install --ci` is an unknown flag and writes nothing (#489)", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["install", "--claude", "--ci"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Unknown flag: --ci");
    expect(fs.existsSync(path.join(tmp, ".bkit"))).toBe(false);
  });

  it("`bkit install --typescript` writes no ci.yml, .vale.ini or hooks (templates); no host dirs", () => {
    if (!fs.existsSync(tsxPath())) return;
    const r = run(["install", "--typescript"]);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    expect(fs.existsSync(path.join(tmp, ".github", "workflows", "ci.yml"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, ".vale.ini"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, ".husky", "pre-commit"))).toBe(false);
    expect(
      fs.existsSync(path.join(tmp, ".bkit", "templates", ".github", "workflows", "ci.yml")),
    ).toBe(true);
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
// detectOpencodeProviders — multi-provider tracking
// ---------------------------------------------------------------------------

describe("detectOpencodeProviders — multi-provider tracking (issue #281 Task 2)", () => {
  it("reads opencodeProviders array from package.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "x",
        bkit: { opencodeProvider: "openrouter", opencodeProviders: ["openrouter", "openrouter"] },
      }),
      "utf-8",
    );
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual(["openrouter", "openrouter"]);
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
        bkit: { opencodeProviders: ["openrouter", "bad-provider", "openrouter"] },
      }),
      "utf-8",
    );
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual(["openrouter", "openrouter"]);
  });

  it("returns [] when package.json does not exist", () => {
    // tmpDir has no package.json
    const providers = detectOpencodeProviders(tmpDir);
    expect(providers).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// opencodeProviders persist block — two sequential installs

// ---------------------------------------------------------------------------

describe("opencodeProviders persist block — sequential installs (issue #281 Task 2)", () => {
  let tmp: string;
  const installPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
  const tsxPath = () =>
    path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    );

  function run(args: string[]) {
    return spawnSync(tsxPath(), [installPath(), ...args], {
      cwd: tmp,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1", BKIT_GH_TOKEN_INSTALL: "fake-token-for-test" },
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
    // First install: openrouter
    const r1 = run(["install", "--opencode=openrouter"]);
    expect(r1.status, `first install failed:\n${r1.stdout}\n${r1.stderr}`).toBe(0);

    const pkg1 = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8")) as {
      bkit?: { opencodeProvider?: string; opencodeProviders?: string[] };
    };
    expect(pkg1.bkit?.opencodeProvider).toBe("openrouter");
    expect(pkg1.bkit?.opencodeProviders).toEqual(["openrouter"]);

    // Second install: ollama
    const r2 = run(["install", "--opencode=ollama"]);
    expect(r2.status, `second install failed:\n${r2.stdout}\n${r2.stderr}`).toBe(0);

    const pkg2 = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8")) as {
      bkit?: { opencodeProvider?: string; opencodeProviders?: string[] };
    };
    expect(pkg2.bkit?.opencodeProvider).toBe("ollama");
    expect(pkg2.bkit?.opencodeProviders).toContain("openrouter");
    expect(pkg2.bkit?.opencodeProviders).toContain("ollama");
    expect(pkg2.bkit?.opencodeProviders).toHaveLength(2);
  });
});

// The .bkit/version provenance record survives a REAL install (the write path is a
// fresh object literal). Real tmpdir consumer, spawned binary.
describe("T10 — claudeAllowDerived survives a real install", () => {
  const paths = () => ({
    bkitInstallPath: path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts"),
    tsxBin: path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../node_modules/.bin/tsx",
    ),
  });

  const install = (tsxBin: string, bkitInstallPath: string) =>
    spawnSync(tsxBin, [bkitInstallPath, "install", "--claude", "--typescript"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

  const readDerived = (): string[] =>
    JSON.parse(fs.readFileSync(path.join(tmpDir, ".bkit", "version"), "utf-8")).claudeAllowDerived;

  // The shipped context.md already carries allowed-domains blocks of its own, so this
  // brackets ITS block with a sentinel and rewrites only that. A non-global replace
  // would strip the first shipped block and leave this one behind.
  const setAllowedDomains = (domains: string[]) => {
    const p = path.join(tmpDir, ".agents", "context.md");
    const body = fs
      .readFileSync(p, "utf-8")
      .replace(/\n<!-- t10-probe -->[\s\S]*?<!-- t10-probe-end -->\n/g, "\n");
    const block =
      domains.length === 0
        ? ""
        : `\n<!-- t10-probe -->\n<!-- allowed-domains:start -->\n${domains.join(
            "\n",
          )}\n<!-- allowed-domains:end -->\n<!-- t10-probe-end -->\n`;
    fs.writeFileSync(p, `${body}${block}`);
  };

  it("records the resolved grant set, then updates it when allowed-domains shrinks", () => {
    const { bkitInstallPath, tsxBin } = paths();
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "t10", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
    );
    // preflight requires a repo root; the other spawned-install cases seed it the same way
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const first = install(tsxBin, bkitInstallPath);
    expect(first.status, `install crashed:\n${first.stdout}\n${first.stderr}`).toBe(0);

    const recorded = readDerived();
    expect(Array.isArray(recorded)).toBe(true);
    expect(recorded.length).toBeGreaterThan(0);
    // equal to what the resolver produces for this consumer, not merely non-empty
    expect([...recorded].sort()).toEqual(
      resolveNetworkAllowlist(tmpDir)
        .map((d) => `WebFetch(domain:${d})`)
        .sort(),
    );

    // widen, then shrink: the record must follow the derived set both ways
    setAllowedDomains(["shrink-probe.example"]);
    expect(install(tsxBin, bkitInstallPath).status).toBe(0);
    expect(readDerived()).toContain("WebFetch(domain:shrink-probe.example)");

    setAllowedDomains([]);
    expect(install(tsxBin, bkitInstallPath).status).toBe(0);
    expect(readDerived()).not.toContain("WebFetch(domain:shrink-probe.example)");
    // and the grant itself was withdrawn from settings, not just from the record
    const allow = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
    ).permissions.allow;
    expect(allow).not.toContain("WebFetch(domain:shrink-probe.example)");
  }, 180_000);
});
