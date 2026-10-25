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
import { listFilesRecursive, remapTemplateDest } from "../../install/template-copies";
import { getCoreRoot, getSharedRoot, getTemplatesRoot } from "../../shared/package-roots";
import { requireTsx } from "../../../../../vitest.tsx-bin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

/** A finished child's stdout then stderr; empty when the child never produced them. */
function combinedOutput(r: { stdout?: string | null; stderr?: string | null }): string {
  return `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
}

/** Put an env var back to its saved value; undefined means it was unset. */
function restoreEnv(key: string, saved: string | undefined): void {
  if (saved === undefined) delete process.env[key];
  else process.env[key] = saved;
}

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
    const { blockers } = runPreflight(makeModules("core", "claude"), tmpDir);
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

  it("formatChecklist banner contains Detect and Action sections", () => {
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    const banner = formatChecklist(blockers);
    expect(banner).toContain("Detect:");
    expect(banner).toContain("Action:");
  });

  it("spawning bkit-install with no package.json exits 1 and produces zero output files", () => {
    // tmpDir has no package.json — blocker should fire and exit 1 before any writes
    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );

    const result = spawnSync(requireTsx(), [bkitInstallPath, "install", "--claude", "--cursor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 30_000,
    });

    expect(result.status).toBe(1);
    // The blocker checklist must be the cause of exit-1 (not an unrelated crash).
    expect(combinedOutput(result)).toContain("no-package-json");
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
    const { blockers, advisories } = runPreflight(makeModules("core", "claude"), tmpDir);
    expect(blockers).toHaveLength(0);
    const ids = advisories.map((f) => f.id);
    expect(ids).toContain("gitignore-block-duplicates");
  });

  it("formatChecklist renders a numbered checklist for multiple advisories", () => {
    const { advisories } = runPreflight(makeModules("core", "claude"), tmpDir);
    expect(advisories.length).toBeGreaterThan(0);
    const banner = formatChecklist(advisories);
    expect(banner).toBeTruthy();
    // Each finding renders with severity and id markers
    expect(banner).toContain("[advisory]");
    expect(banner).toContain("Detect:");
    expect(banner).toContain("Action:");
    // Numbered: 1/N format
    expect(banner).toMatch(/--- \d+\/\d+ \[advisory\]/);
  });

  it("formatChecklist includes the instructions header for AI agents", () => {
    const { advisories } = runPreflight(makeModules("core", "claude"), tmpDir);
    const banner = formatChecklist(advisories);
    expect(banner).toContain("INSTRUCTIONS FOR AN AI AGENT");
  });

  it("runPostInstallCheck adds gh-mcp-token-unset-shell when BKIT_GH_TOKEN is unset", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "claude"), tmpDir);
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { github: { type: "http" } } }),
    );

    // Temporarily unset BKIT_GH_TOKEN and CI
    const savedToken = process.env.BKIT_GH_TOKEN;
    const savedCi = process.env.CI;
    delete process.env.BKIT_GH_TOKEN;
    delete process.env.CI;

    try {
      const postFindings = runPostInstallCheck(preflightAdvisories, tmpDir);
      const ids = postFindings.map((f) => f.id);
      expect(ids).toContain("gh-mcp-token-unset-shell");
    } finally {
      restoreEnv("BKIT_GH_TOKEN", savedToken);
      restoreEnv("CI", savedCi);
    }
  });

  it("full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "claude"), tmpDir);
    expect(preflightAdvisories.length).toBeGreaterThan(0);

    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { github: { type: "http" } } }),
    );
    const savedToken = process.env.BKIT_GH_TOKEN;
    const savedCi = process.env.CI;
    delete process.env.BKIT_GH_TOKEN;
    delete process.env.CI;

    let postFindings: ReturnType<typeof runPostInstallCheck>;
    try {
      postFindings = runPostInstallCheck(preflightAdvisories, tmpDir);
    } finally {
      restoreEnv("BKIT_GH_TOKEN", savedToken);
      restoreEnv("CI", savedCi);
    }

    // Phase 1 findings should be present in the combined output
    const ids = postFindings.map((f) => f.id);
    expect(ids).toContain("gitignore-block-duplicates");
    // Phase 3 shell token finding should also be present
    expect(ids).toContain("gh-mcp-token-unset-shell");

    const banner = formatChecklist(postFindings);
    expect(banner).toBeTruthy();
    expect(banner).toContain("gitignore-block-duplicates");
    expect(banner).toContain("gh-mcp-token-unset-shell");
  });

  it("no duplicate ids in the final checklist", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "claude"), tmpDir);
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

  it("runPostInstallCheck includes Phase 3 detector findings (gh-mcp-token-unset-shell when BKIT_GH_TOKEN unset)", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "claude"), tmpDir);
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { github: { type: "http" } } }),
    );
    const savedToken = process.env.BKIT_GH_TOKEN;
    const savedCi = process.env.CI;
    delete process.env.BKIT_GH_TOKEN;
    delete process.env.CI;

    let findings: ReturnType<typeof runPostInstallCheck>;
    try {
      findings = runPostInstallCheck(preflightAdvisories, tmpDir);
    } finally {
      restoreEnv("BKIT_GH_TOKEN", savedToken);
      restoreEnv("CI", savedCi);
    }

    // Phase 3 ran: gh-mcp-token-unset-shell must appear when the token is missing.
    expect(findings.map((f) => f.id)).toContain("gh-mcp-token-unset-shell");
  });

  it("formatChecklist renders Phase 1 advisories", () => {
    const { advisories: preflightAdvisories } = runPreflight(makeModules("core", "claude"), tmpDir);
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

    const result = spawnSync(requireTsx(), [bkitInstallPath, "install", "--claude", "--cursor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

    const combined = combinedOutput(result);
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
// #507 — the payload folders: a full install (every host + tracker) writes every
// file in `.bkit/core/` and `.bkit/shared/` at its path-rule destination, except
// the package-only parts; no template lands outside the consumer's
// `.bkit/templates/`; and the only LICENSE.md file is `.bkit/LICENSE.md` (the MIT
// notice).
// ---------------------------------------------------------------------------

describe("#507 — full install writes core/ and shared/, never a template or a stray LICENSE.md", () => {
  // Top-level folders of `.bkit/core/` that never land in a consumer repo.
  const CORE_PACKAGE_ONLY = new Set(["engine", "workflows", "prompts", "hooks"]);

  const relFiles = (root: string): string[] =>
    listFilesRecursive(root).map((abs) => path.relative(root, abs));

  // Consumer-repo files, `/`-separated, outside .git/ and node_modules/.
  const consumerFiles = (dir: string): string[] =>
    listFilesRecursive(dir)
      .map((abs) => path.relative(dir, abs).split(path.sep).join("/"))
      .filter((rel) => !rel.startsWith(".git/") && !rel.startsWith("node_modules/"));

  it("every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0", packageManager: "pnpm@10.4.1" }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const here = path.dirname(new URL(import.meta.url).pathname);
    const result = spawnSync(
      requireTsx(),
      [
        path.resolve(here, "../../cli.ts"),
        "install",
        "--claude",
        "--cursor",
        "--codex",
        "--antigravity",
        "--opencode=openrouter",
        "--tracker=github",
      ],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 120_000,
      },
    );
    expect(result.status, `install failed:\n${result.stdout}\n${result.stderr}`).toBe(0);

    const payload = (
      [
        [getCoreRoot(), CORE_PACKAGE_ONLY],
        [getSharedRoot(), new Set<string>()],
      ] as const
    ).flatMap(([root, skipTop]) =>
      relFiles(root)
        .filter((rel) => !skipTop.has(rel.split(path.sep)[0]!))
        .map((rel) => ({ rel, dest: remapTemplateDest(rel) })),
    );
    const missing = payload
      .filter(({ dest }) => !fs.existsSync(path.join(tmpDir, dest)))
      .map(({ rel, dest }) => `${rel} -> ${dest}`);
    expect(missing, "payload files the install did not write").toEqual([]);

    const templates = relFiles(getTemplatesRoot()).filter((rel) => !rel.startsWith("context"));
    const writtenTemplates = templates.filter((rel) =>
      fs.existsSync(path.join(tmpDir, remapTemplateDest(rel))),
    );
    expect(writtenTemplates, "templates written into the repo").toEqual([]);
    for (const rel of templates) {
      expect(fs.existsSync(path.join(tmpDir, ".bkit", "templates", rel)), rel).toBe(true);
    }

    for (const dir of CORE_PACKAGE_ONLY) {
      expect(fs.existsSync(path.join(tmpDir, dir)), `${dir}/ leaked into the repo`).toBe(false);
    }

    const licences = consumerFiles(tmpDir)
      .filter((rel) => path.posix.basename(rel) === "LICENSE.md")
      .sort();
    expect(licences).toEqual([".bkit/LICENSE.md"]);
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

    const installResult = spawnSync(
      requireTsx(),
      [bkitInstallPath, "install", "--claude", "--cursor"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );
    const installCombined = combinedOutput(installResult);
    expect(installResult.status, `install crashed:\n${installCombined}`).toBe(0);

    // The load-bearing assertion: docs/roadmap.md is a generated projection
    // owned by the fold/close-step scripts, never by bkit install itself.
    expect(fs.existsSync(path.join(tmpDir, "docs", "roadmap.md"))).toBe(false);

    // A dry-run `bkit check` immediately after must also report clean drift —
    // docs/roadmap.md never enters bkit's tracked write set, so there is
    // nothing to flag as stale/missing for it.
    const checkResult = spawnSync(requireTsx(), [bkitInstallPath, "check"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });
    const checkCombined = combinedOutput(checkResult);
    expect(checkResult.status, `check crashed:\n${checkCombined}`).toBe(0);
    expect(checkCombined).not.toContain("roadmap.md");
    // docs/roadmap.md still must not have been created by the dry-run check.
    expect(fs.existsSync(path.join(tmpDir, "docs", "roadmap.md"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9)
//
// When Phase 3 detects a blocker-severity finding (e.g. a stale managed-version
// marker on a protected branch), bkit install must exit 1 and print a recovery line.
// ---------------------------------------------------------------------------

describe("Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9)", () => {
  it("runPostInstallCheck surfaces a blocker-severity finding for a stale managed-version marker", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", version: "0.0.0" }),
    );
    // A stamped file bkit will not re-render this run (claude host not installed) with a
    // marker that differs from the installed bkit version → stale managed marker.
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-stale.md"),
      "<!-- bkit:managed v1.0.0 — stale — do not edit -->\n\nstale content\n",
      "utf-8",
    );

    const savedRef = process.env.GITHUB_REF_NAME;
    process.env.GITHUB_REF_NAME = "dev"; // protected branch → blocker severity
    try {
      const findings = runPostInstallCheck([], tmpDir);
      const blocker = findings.find((f) => f.severity === "blocker");
      expect(blocker).toBeDefined();
      expect(blocker!.id).toBe("bkit-managed-stale");
    } finally {
      restoreEnv("GITHUB_REF_NAME", savedRef);
    }
  });

  it("Phase 3 blocker findings are distinguished from advisories (severity=blocker)", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-stale.md"),
      "<!-- bkit:managed v1.0.0 — stale — do not edit -->\n\nstale content\n",
      "utf-8",
    );

    const savedRef = process.env.GITHUB_REF_NAME;
    process.env.GITHUB_REF_NAME = "dev"; // protected branch → blocker severity
    try {
      const findings = runPostInstallCheck([], tmpDir);
      const blockerFindings = findings.filter((f) => f.severity === "blocker");
      expect(blockerFindings.length).toBeGreaterThan(0);
      expect(blockerFindings[0]!.id).toBe("bkit-managed-stale");
    } finally {
      restoreEnv("GITHUB_REF_NAME", savedRef);
    }
  });
});

// ---------------------------------------------------------------------------
// Scenario 7 — bkit install exits 1 on Phase 3 blocker (subprocess, P2.T9)
// ---------------------------------------------------------------------------

describe("Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9)", () => {
  it("bkit install exits 1 when Phase 3 blocker detected + recovery line in output", () => {
    // Set up a Phase 3 blocker condition: a stale bkit-managed marker on a host that
    // this run does NOT install (claude), so Phase 2 never re-renders it.
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
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-stale.md"),
      "<!-- bkit:managed v1.0.0 — stale — do not edit -->\n\nstale content\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );

    const result = spawnSync(requireTsx(), [bkitInstallPath, "install", "--cursor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        // Protected branch → the stale managed marker is a blocker.
        GITHUB_REF_NAME: "dev",
      },
      timeout: 60_000,
    });

    // Exit 1 due to Phase 3 blocker
    expect(result.status).toBe(1);

    const combined = combinedOutput(result);
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
    // Set up a Phase 3 blocker condition (same as Scenario 7): a stale bkit-managed
    // marker on a host this run does NOT install (claude).
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
    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "agents", "bkit-stale.md"),
      "<!-- bkit:managed v1.0.0 — stale — do not edit -->\n\nstale content\n",
    );

    const bkitInstallPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../cli.ts",
    );

    // Capture pre-install state: .bkit/version must not exist
    const versionFilePath = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFilePath)).toBe(false);

    const result = spawnSync(
      requireTsx(),
      [bkitInstallPath, "install", "--cursor", "--auto-revert"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: {
          ...process.env,
          NODE_NO_WARNINGS: "1",
          // Protected branch → the stale managed marker is a blocker.
          GITHUB_REF_NAME: "dev",
        },
        timeout: 60_000,
      },
    );

    // Exit 1 due to Phase 3 blocker
    expect(result.status).toBe(1);

    const combined = combinedOutput(result);

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

    const result = spawnSync(requireTsx(), [bkitInstallPath, "install", "--claude", "--cursor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

    const combined = combinedOutput(result);
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
    expect(Object.keys({ ...cursorMcp.mcpServers })).toHaveLength(0);
  });

  // The tracker's first agent read tool, per tracker.
  const AGENT_READ_TOOL = {
    github: "mcp__github__list_issues",
    linear: "mcp__linear__list_issues",
    jira: "mcp__jira__searchJiraIssuesUsingJql",
  } as const;

  it.each(["github", "linear", "jira"] as const)(
    "bkit install --tracker=%s seeds .mcp.json with only that tracker's entry",
    (tracker) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "scratch-consumer", version: "0.0.0", devDependencies: {} }),
      );
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

      const bkitInstallPath = path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        "../../cli.ts",
      );

      const result = spawnSync(
        requireTsx(),
        [bkitInstallPath, "install", "--claude", "--cursor", `--tracker=${tracker}`],
        {
          cwd: tmpDir,
          encoding: "utf-8",
          env: { ...process.env, NODE_NO_WARNINGS: "1" },
          timeout: 60_000,
        },
      );

      const combined = combinedOutput(result);
      expect(result.status, `install crashed:\n${combined}`).toBe(0);

      // Only the tracker's own entry in .mcp.json and .cursor/mcp.json
      for (const rel of [".mcp.json", path.join(".cursor", "mcp.json")]) {
        const mcpJson = JSON.parse(fs.readFileSync(path.join(tmpDir, rel), "utf-8")) as {
          mcpServers: Record<string, unknown>;
        };
        expect(Object.keys(mcpJson.mcpServers), rel).toEqual([tracker]);
      }

      // bkit.tracker.default persisted to package.json
      const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
        bkit?: { tracker?: { default?: string } };
      };
      expect(pkg.bkit?.tracker?.default).toBe(tracker);

      // workflow mirror must have no remaining bkit:tracker OR bkit:when-tracker markers,
      // and call only the tracker's own MCP server
      const claudeCmd = path.join(tmpDir, ".claude", "commands", "bkit-build.md");
      const content = fs.readFileSync(claudeCmd, "utf-8");
      expect(content).not.toMatch(/<!--\s*bkit:tracker\s+\S+\s+(?:start|end)\s*-->/);
      expect(content).not.toMatch(/<!--\s*bkit:when-tracker\s+(?:start|end)\b[^>]*-->/);
      const called = ["github", "linear", "jira"].filter((name) =>
        content.includes(`mcp__${name}__`),
      );
      expect(called).toEqual([tracker]);

      // agent mirrors resolve tracker blocks too: the tracker's read tools only, no markers
      for (const host of [".claude", ".cursor"]) {
        const agent = fs.readFileSync(
          path.join(tmpDir, host, "agents", "bkit-utility-update-roadmap.md"),
          "utf-8",
        );
        expect(agent, `${host} agent markers`).not.toMatch(/<!--\s*bkit:tracker\b/);
        expect(agent, `${host} agent ${tracker} tools`).toContain(
          `  - ${AGENT_READ_TOOL[tracker]}\n`,
        );
        for (const other of ["github", "linear", "jira"].filter((t) => t !== tracker)) {
          expect(agent, `${host} agent ${other} tools`).not.toContain(`mcp__${other}__`);
        }
        expect(agent.match(/^ {2}- Bash$/gm), `${host} agent Bash once`).toHaveLength(1);
      }
    },
  );

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

    const result = spawnSync(requireTsx(), [bkitInstallPath, "install", "--claude", "--cursor"], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 60_000,
    });

    const combined = combinedOutput(result);
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
// Jira is local-only, so every cloud lane refuses `--tracker=jira` the same way.
// ---------------------------------------------------------------------------

describe("Challenge Finding 3 — cloud/tracker constraint-before-write regression", () => {
  const getInstallPath = () =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
  // [tracker, cloud lane, the tracker that lane requires]
  const MISMATCHES = [
    ["github", "cursor", "linear"],
    ["jira", "claude", "github"],
    ["jira", "cursor", "linear"],
    ["jira", "opencode", "github"],
  ] as const;

  it.each(MISMATCHES)(
    "--tracker=%s --auto=%s exits non-zero (constraint mismatch)",
    (tracker, cloud, required) => {
      // Finding 3 (a): the mismatch must be a hard error — exit 1 every time.

      const initialPkg = { name: "constraint-test", version: "0.0.0" };
      fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(initialPkg), "utf-8");
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

      const result = spawnSync(
        requireTsx(),
        [getInstallPath(), "install", `--tracker=${tracker}`, `--auto=${cloud}`],
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
      const combined = combinedOutput(result);
      expect(combined).toContain(`--auto=${cloud} requires tracker=${required}`);
    },
  );

  it.each(MISMATCHES)(
    "--tracker=%s --auto=%s does NOT write bkit.tracker.default to package.json (no partial write)",
    (tracker, cloud) => {
      // Finding 3 (b): the "no state written on hard error" invariant.
      // The pre-remediation code wrote issueTracker BEFORE the constraint check,
      // meaning package.json was mutated even on a failed install.

      const initialPkg = { name: "constraint-test", version: "0.0.0" };
      const initialPkgJson = JSON.stringify(initialPkg);
      fs.writeFileSync(path.join(tmpDir, "package.json"), initialPkgJson, "utf-8");
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

      spawnSync(
        requireTsx(),
        [getInstallPath(), "install", `--tracker=${tracker}`, `--auto=${cloud}`],
        {
          cwd: tmpDir,
          encoding: "utf-8",
          env: { ...process.env, NODE_NO_WARNINGS: "1" },
          timeout: 30_000,
        },
      );

      // package.json must NOT have bkit.tracker.default set (no partial write).
      const afterPkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
        bkit?: { tracker?: { default?: string } };
      };

      expect(
        afterPkg.bkit?.tracker?.default,
        "bkit.tracker.default must NOT be written when the install exits due to a cloud/tracker constraint mismatch",
      ).toBeUndefined();
    },
  );

  it("--tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair)", () => {
    // Complementary positive case: the matching pair must succeed and persist state.

    const initialPkg = { name: "constraint-test", version: "0.0.0" };
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(initialPkg), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const result = spawnSync(
      requireTsx(),
      [getInstallPath(), "install", "--tracker=linear", "--auto=cursor"],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 60_000,
      },
    );

    const combined = combinedOutput(result);
    expect(
      result.status,
      `Expected exit 0 for matching tracker/cloud pair.\n` + `stdout: ${combined}`,
    ).toBe(0);

    const afterPkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { tracker?: { default?: string }; cloud?: { agent?: string } };
    };

    expect(afterPkg.bkit?.tracker?.default).toBe("linear");
    expect(afterPkg.bkit?.cloud?.agent).toBe("cursor");
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

  function run(args: string[]) {
    return spawnSync(requireTsx(), [installPath(), ...args], {
      cwd: tmp,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
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
    const r = run(["install"]);
    expect(r.status).toBe(1);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/at least one module flag/i);
  });

  it("bare `bkit` (no command) prints usage and exits 2 (usage error)", () => {
    const r = run([]);
    expect(r.status).toBe(2);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/bkit install/);
  });

  it("explicit `bkit help` prints the same usage and exits 0", () => {
    const r = run(["help"]);
    expect(r.status).toBe(0);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/bkit install/);
  });

  it("`bkit check --claude` (stray module flag) errors", () => {
    const r = run(["check", "--claude"]);
    expect(r.status).toBe(1);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/takes no module flags/i);
  });

  it("`bkit upgrade --claude` (stray module flag) errors", () => {
    const r = run(["upgrade", "--claude"]);
    expect(r.status).toBe(1);
    expect(`${r.stdout}\n${r.stderr}`).toMatch(/takes no module flags/i);
  });

  it("`bkit install --claude` ships root CLAUDE.md (redirect)", () => {
    const r = run(["install", "--claude"]);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    expect(fs.existsSync(path.join(tmp, "CLAUDE.md"))).toBe(true);
    expect(fs.readFileSync(path.join(tmp, "CLAUDE.md"), "utf-8")).toContain(".agents/rules.md");
    // Core is implicit — AGENTS.md ships too.
    expect(fs.existsSync(path.join(tmp, "AGENTS.md"))).toBe(true);
  });

  it("`bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core)", () => {
    const r = run(["install", "--cursor"]);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    expect(fs.existsSync(path.join(tmp, "CLAUDE.md"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, "AGENTS.md"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".cursor"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".claude"))).toBe(false);
  });

  it("`bkit install --ci` is an unknown flag and writes nothing (#489)", () => {
    const r = run(["install", "--claude", "--ci"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Unknown flag: --ci");
    expect(fs.existsSync(path.join(tmp, ".bkit"))).toBe(false);
  });

  it("`bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor", () => {
    const r = run(["install", "--claude"]);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    expect(fs.existsSync(path.join(tmp, ".github", "workflows", "bkit-ci.yml"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, ".vale.ini"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, ".husky", "pre-commit"))).toBe(false);
    expect(
      fs.existsSync(path.join(tmp, ".bkit", "templates", ".github", "workflows", "bkit-ci.yml")),
    ).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".claude"))).toBe(true);
    expect(fs.existsSync(path.join(tmp, ".cursor"))).toBe(false);
  });

  it("`bkit check` after a --cursor-only install reports no drift (no false .claude drift)", () => {
    expect(run(["install", "--cursor"]).status).toBe(0);
    const r = run(["check"]);
    expect(r.status, `check should be clean:\n${r.stdout}\n${r.stderr}`).toBe(0);
  });

  it.each(["github", "linear", "jira"])(
    "`bkit install --tracker=%s` alone switches the tracker on every installed host",
    (tracker) => {
      expect(run(["install", "--claude", "--cursor"]).status).toBe(0);
      const r = run(["install", `--tracker=${tracker}`]);
      expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
      const pkg = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8"));
      expect(pkg.bkit.tracker.default).toBe(tracker);
      expect(fs.readFileSync(path.join(tmp, ".cursor", "mcp.json"), "utf-8")).toContain(
        `"${tracker}"`,
      );
      const check = run(["check"]);
      expect(check.status, `check should be clean:\n${check.stdout}\n${check.stderr}`).toBe(0);
    },
  );

  it("`bkit install --claude --tracker=github` also re-renders the installed cursor host", () => {
    expect(run(["install", "--claude", "--cursor"]).status).toBe(0);
    expect(run(["install", "--claude", "--tracker=github"]).status).toBe(0);
    expect(fs.readFileSync(path.join(tmp, ".cursor", "mcp.json"), "utf-8")).toContain('"github"');
    const check = run(["check"]);
    expect(check.status, `check should be clean:\n${check.stdout}\n${check.stderr}`).toBe(0);
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
        bkit: {
          providers: {
            opencode: { default: "openrouter", installed: ["openrouter", "openrouter"] },
          },
        },
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
        bkit: {
          providers: { opencode: { installed: ["openrouter", "bad-provider", "openrouter"] } },
        },
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

  function run(args: string[]) {
    return spawnSync(requireTsx(), [installPath(), ...args], {
      cwd: tmp,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
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
    // First install: openrouter
    const r1 = run(["install", "--opencode=openrouter"]);
    expect(r1.status, `first install failed:\n${r1.stdout}\n${r1.stderr}`).toBe(0);

    const pkg1 = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8")) as {
      bkit?: { providers?: { opencode?: { default?: string; installed?: string[] } } };
    };
    expect(pkg1.bkit?.providers?.opencode?.default).toBe("openrouter");
    expect(pkg1.bkit?.providers?.opencode?.installed).toEqual(["openrouter"]);

    // Second install: ollama
    const r2 = run(["install", "--opencode=ollama"]);
    expect(r2.status, `second install failed:\n${r2.stdout}\n${r2.stderr}`).toBe(0);

    const pkg2 = JSON.parse(fs.readFileSync(path.join(tmp, "package.json"), "utf-8")) as {
      bkit?: { providers?: { opencode?: { default?: string; installed?: string[] } } };
    };
    expect(pkg2.bkit?.providers?.opencode?.default).toBe("ollama");
    expect(pkg2.bkit?.providers?.opencode?.installed).toContain("openrouter");
    expect(pkg2.bkit?.providers?.opencode?.installed).toContain("ollama");
    expect(pkg2.bkit?.providers?.opencode?.installed).toHaveLength(2);
  });
});

// The .bkit/version provenance record survives a REAL install (the write path is a
// fresh object literal). Real tmpdir consumer, spawned binary.
describe("T10 — claudeAllowDerived survives a real install", () => {
  const paths = () => ({
    bkitInstallPath: path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts"),
  });

  const install = (bkitInstallPath: string) =>
    spawnSync(requireTsx(), [bkitInstallPath, "install", "--claude"], {
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
    const { bkitInstallPath } = paths();
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "t10", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
    );
    // preflight requires a repo root; the other spawned-install cases seed it the same way
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const first = install(bkitInstallPath);
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
    expect(install(bkitInstallPath).status).toBe(0);
    expect(readDerived()).toContain("WebFetch(domain:shrink-probe.example)");

    setAllowedDomains([]);
    expect(install(bkitInstallPath).status).toBe(0);
    expect(readDerived()).not.toContain("WebFetch(domain:shrink-probe.example)");
    // and the grant itself was withdrawn from settings, not just from the record
    const allow = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
    ).permissions.allow;
    expect(allow).not.toContain("WebFetch(domain:shrink-probe.example)");
  }, 180_000);
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Scenario — Codex + Antigravity both installed: no shared-skill conflict (#534)
//
// Decision (2026-10-13): `.agents/` ROOT stays the dedicated Codex install; the whole
// Antigravity host installs into a workspace plugin at `.agents/plugins/bkit/`. Codex's
// workflow skills (`.agents/skills/bkit-*`) and Antigravity's (plugin `skills/bkit-*`)
// therefore live at DIFFERENT paths, and `bkit check` is green whichever order the hosts
// are installed in. With both installed, Antigravity's selector lists both sets — accepted,
// and surfaced by the `antigravity-codex-skill-overlap` advisory. Real-CLI tests pin it.
// ---------------------------------------------------------------------------

describe("Scenario — Codex + Antigravity install side by side without conflict (#534)", () => {
  const paths = () => ({
    bkitInstallPath: path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts"),
  });

  const run = (args: string[]) => {
    const { bkitInstallPath } = paths();
    return spawnSync(requireTsx(), [bkitInstallPath, ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 120_000,
    });
  };

  const seedConsumer = (): void => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "scratch-consumer",
        version: "0.0.0",
        packageManager: "pnpm@10.4.1",
      }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
  };

  const read = (rel: string): string => fs.readFileSync(path.join(tmpDir, rel), "utf-8");
  const exists = (rel: string): boolean => fs.existsSync(path.join(tmpDir, rel));

  const CODEX_SKILL = ".agents/skills/bkit-auto/SKILL.md";
  const PLUGIN_SKILL = ".agents/plugins/bkit/skills/bkit-auto/SKILL.md";

  const assertCleanCheck = (label: string): void => {
    const check = run(["check"]);
    expect(check.status, `${label}: check drifted:\n${check.stdout}\n${check.stderr}`).toBe(0);
  };

  it("combined `--codex --antigravity`: skills at separate paths, check green, advisory fires", () => {
    seedConsumer();
    const install = run(["install", "--codex", "--antigravity", "--tracker=github"]);
    expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);

    // Codex keeps `.agents/skills/` with its own (Claude-spelled) vocabulary.
    expect(exists(CODEX_SKILL)).toBe(true);
    expect(read(CODEX_SKILL)).toContain("`Skill` tool");
    expect(read(CODEX_SKILL)).not.toContain("`view_file`");

    // Antigravity lives entirely in the plugin, with its own (view_file) vocabulary.
    expect(exists(".agents/plugins/bkit/plugin.json")).toBe(true);
    expect(exists(".agents/plugins/bkit/hooks.json")).toBe(true);
    expect(exists(".agents/plugins/bkit/hooks/bkit-gateguard.cjs")).toBe(true);
    expect(read(PLUGIN_SKILL)).toContain("`view_file`");
    // Workflow skills that delegate to subagents point at the plugin's agents/ dir.
    expect(read(".agents/plugins/bkit/skills/bkit-build/SKILL.md")).toContain(
      ".agents/plugins/bkit/agents/",
    );

    // Both installed → the overlap advisory is emitted.
    expect(`${install.stdout}\n${install.stderr}`).toContain("antigravity-codex-skill-overlap");

    assertCleanCheck("combined");
  }, 180_000);

  it("separate `--antigravity` then `--codex`: both land at their own paths, check green", () => {
    seedConsumer();
    expect(run(["install", "--antigravity", "--tracker=github"]).status).toBe(0);
    expect(exists(PLUGIN_SKILL)).toBe(true);
    // Codex not installed yet → no `.agents/skills/`.
    expect(exists(".agents/skills")).toBe(false);

    expect(run(["install", "--codex", "--tracker=github"]).status).toBe(0);
    expect(read(CODEX_SKILL)).toContain("`Skill` tool");
    expect(read(PLUGIN_SKILL)).toContain("`view_file`");
    assertCleanCheck("antigravity→codex");
  }, 180_000);

  it("separate `--codex` then `--antigravity`: both land at their own paths, check green", () => {
    seedConsumer();
    expect(run(["install", "--codex", "--tracker=github"]).status).toBe(0);
    expect(run(["install", "--antigravity", "--tracker=github"]).status).toBe(0);
    expect(read(CODEX_SKILL)).toContain("`Skill` tool");
    expect(read(PLUGIN_SKILL)).toContain("`view_file`");
    assertCleanCheck("codex→antigravity");
  }, 180_000);
});

// A tracker switch and an active-provider uninstall leave a consumer `bkit check` passes.
// Real tmpdir consumer, spawned binary.
describe("Scenario — tracker switch and active opencode provider removal leave check green", () => {
  const cliPath = (): string =>
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");

  const run = (args: string[]) =>
    spawnSync(requireTsx(), [cliPath(), ...args], {
      cwd: tmpDir,
      encoding: "utf-8",
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
      timeout: 120_000,
    });

  const runOk = (args: string[]): string => {
    const r = run(args);
    const out = combinedOutput(r);
    expect(r.status, `${args.join(" ")} failed:\n${out}`).toBe(0);
    return out;
  };

  const seedConsumer = (): void => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "scratch-consumer", version: "0.0.0" }),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
  };

  const readJson = (rel: string): Record<string, Record<string, unknown>> =>
    JSON.parse(fs.readFileSync(path.join(tmpDir, rel), "utf-8")) as Record<
      string,
      Record<string, unknown>
    >;

  const agentModels = (): string[] => {
    const dir = path.join(tmpDir, ".opencode", "agents");
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => /^model:\s*(\S+)/m.exec(fs.readFileSync(path.join(dir, f), "utf-8"))?.[1] ?? "");
  };

  it.each([
    ["linear", "github"],
    ["jira", "github"],
    ["linear", "jira"],
    ["jira", "linear"],
  ])(
    "--tracker=%s then --tracker=%s removes the first MCP entry everywhere",
    (from, to) => {
      seedConsumer();
      const hosts = ["--claude", "--cursor", "--opencode=openrouter"];
      runOk(["install", ...hosts, `--tracker=${from}`]);
      expect(readJson(".mcp.json").mcpServers).toHaveProperty(from);
      expect(readJson(".opencode/opencode.json").mcp).toHaveProperty(from);

      const out = runOk(["install", ...hosts, `--tracker=${to}`]);
      expect(out).toContain(`removed .mcp.json mcpServers.${from}`);
      for (const rel of [".mcp.json", ".cursor/mcp.json"]) {
        expect(readJson(rel).mcpServers, rel).not.toHaveProperty(from);
        expect(readJson(rel).mcpServers, rel).toHaveProperty(to);
      }
      expect(readJson(".opencode/opencode.json").mcp).not.toHaveProperty(from);
      expect(readJson(".opencode/opencode.json").mcp).toHaveProperty(to);
      runOk(["check"]);
    },
    240_000,
  );

  it.each(["linear", "jira"])(
    "a %s entry the consumer edited survives the switch, with a warning",
    (from) => {
      seedConsumer();
      runOk(["install", "--claude", `--tracker=${from}`]);
      const mcp = readJson(".mcp.json");
      const edited = { ...(mcp.mcpServers![from] as object), headers: { X: "1" } };
      mcp.mcpServers![from] = edited;
      fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify(mcp, null, 2) + "\n");

      const out = runOk(["install", "--claude", "--tracker=github"]);
      expect(out).toContain(`kept .mcp.json mcpServers.${from}: edited since bkit wrote it`);
      expect(readJson(".mcp.json").mcpServers![from]).toEqual(edited);
    },
    240_000,
  );

  it("uninstall --opencode=<active> re-renders the agents to the remaining provider", () => {
    seedConsumer();
    runOk(["install", "--opencode=openrouter"]);
    runOk(["install", "--opencode=ollama"]);
    expect(agentModels().every((m) => m.startsWith("ollama/"))).toBe(true);

    const out = runOk(["uninstall", "--opencode=ollama"]);
    expect(out).toContain('active provider switched to "openrouter"');
    const models = agentModels();
    expect(models.length).toBeGreaterThan(0);
    expect(models.filter((m) => !m.startsWith("openrouter/"))).toEqual([]);
    runOk(["check"]);
  }, 240_000);
});
