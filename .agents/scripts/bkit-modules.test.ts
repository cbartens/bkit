// bkit-modules.test.ts — Tests for package.json manifest invariants and
// installer advisory constants (BAR-138: GH Packages distribution, BAR-141: structured findings).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { scanForeignBkitUses } from "./bkit-modules";

// ---------------------------------------------------------------------------
// Task C0 — package.json manifest field invariants
// ---------------------------------------------------------------------------

describe("package.json manifest invariants (BAR-138)", () => {
  const pkgPath = path.resolve("package.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pkg: Record<string, any>;

  pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  it("private is false (package must be publishable)", () => {
    expect(pkg.private).toBe(false);
  });

  it("publishConfig.registry equals https://npm.pkg.github.com", () => {
    expect(pkg.publishConfig?.registry).toBe("https://npm.pkg.github.com");
  });

  it("publishConfig.access equals restricted", () => {
    expect(pkg.publishConfig?.access).toBe("restricted");
  });

  it("repository.url is bare HTTPS (no git+ prefix)", () => {
    expect(pkg.repository?.url).toBe("https://github.com/cbartens/bkit.git");
    expect(pkg.repository?.url).not.toMatch(/^git\+/);
  });

  it("description does not contain the old git-dependency lie", () => {
    expect(pkg.description).toBeTruthy();
    expect(pkg.description).not.toContain("git dependency from a private GitHub repo");
  });

  // Tarball exclusions — `files` is the only mechanism that actually filters
  // test sources out of the published tarball when an allowlist is set
  // (npm ignores .npmignore for paths included by `files`). Each negation
  // pattern below is the load-bearing exclusion rule.
  it("files array contains a NEGATION (!) for *.test.ts (not a re-inclusion)", () => {
    const filesArray: string[] = pkg.files ?? [];
    const positivePatterns = filesArray.filter(
      (f: string) => f.includes(".test.ts") && !f.startsWith("!"),
    );
    expect(positivePatterns).toHaveLength(0);
    expect(filesArray.some((f: string) => f.startsWith("!") && f.includes(".test.ts"))).toBe(true);
  });

  it("files array contains a NEGATION (!) for __snapshots__ (not a re-inclusion)", () => {
    const filesArray: string[] = pkg.files ?? [];
    const positivePatterns = filesArray.filter(
      (f: string) => f.includes("__snapshots__") && !f.startsWith("!"),
    );
    expect(positivePatterns).toHaveLength(0);
    expect(filesArray.some((f: string) => f.startsWith("!") && f.includes("__snapshots__"))).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// Task C1 — Installer advisory action constants (BAR-138, migrated to bkit-postinstall.ts)
// ---------------------------------------------------------------------------

// Read the source file as a string to inspect the constant bodies without
// executing the module (avoids import side-effects and keeps tests fast).
// Note: the constants are now in bkit-postinstall.ts (Phase 3 owner), not bkit-modules.ts.
const POSTINSTALL_SRC = fs.readFileSync(
  path.resolve(".agents/scripts/bkit-postinstall.ts"),
  "utf-8",
);
const MODULES_SRC = fs.readFileSync(path.resolve(".agents/scripts/bkit-modules.ts"), "utf-8");

describe("GH_BKIT_TOKEN_MISSING action strings (now in bkit-postinstall.ts)", () => {
  // The action string is now embedded in the const GH_BKIT_TOKEN_MISSING_ACTION
  const match = POSTINSTALL_SRC.match(
    /const GH_BKIT_TOKEN_MISSING_ACTION\s*=\s*([\s\S]*?)(?=\nconst |\nexport )/,
  );
  const body = match ? match[1] : POSTINSTALL_SRC;

  it("postinstall source contains .npmrc registry line", () => {
    expect(POSTINSTALL_SRC).toContain("@cbartens:registry=https://npm.pkg.github.com");
  });

  it("postinstall source contains _authToken= line with GH_BKIT_TOKEN env-var interpolation", () => {
    expect(POSTINSTALL_SRC).toContain("_authToken=");
    expect(POSTINSTALL_SRC).toContain("GH_BKIT_TOKEN");
  });

  it("postinstall source contains read:packages scope reference", () => {
    expect(POSTINSTALL_SRC).toContain("read:packages");
  });

  it("postinstall source contains pnpm silent-ignore warning", () => {
    expect(POSTINSTALL_SRC).toContain("silently ignores");
  });

  it("postinstall source does NOT contain git insteadOf shim language", () => {
    expect(POSTINSTALL_SRC).not.toContain("git config --global url.");
  });

  it("GH_BKIT_TOKEN_MISSING_INSTRUCTIONS no longer exists in bkit-modules.ts", () => {
    expect(MODULES_SRC).not.toContain("GH_BKIT_TOKEN_MISSING_INSTRUCTIONS");
  });

  it("GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS no longer exists in bkit-modules.ts", () => {
    expect(MODULES_SRC).not.toContain("GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS");
  });

  it("VERCEL_AUTH_INSTRUCTIONS no longer exists in bkit-modules.ts", () => {
    expect(MODULES_SRC).not.toContain("VERCEL_AUTH_INSTRUCTIONS");
  });
});

describe("VERCEL action strings (now in bkit-postinstall.ts)", () => {
  it("postinstall source contains vercel env add GH_BKIT_TOKEN", () => {
    expect(POSTINSTALL_SRC).toContain("vercel env add GH_BKIT_TOKEN");
  });

  it("postinstall source contains .npmrc reference", () => {
    expect(POSTINSTALL_SRC).toContain(".npmrc");
  });

  it("postinstall source contains Remove directive for legacy installCommand", () => {
    expect(POSTINSTALL_SRC).toContain("Remove");
  });

  it("postinstall source does NOT contain git config --global url. shim", () => {
    expect(POSTINSTALL_SRC).not.toContain("git config --global url.");
  });
});

describe("CI_YML_MERGE_INSTRUCTIONS (in bkit-modules.ts — used for Tier 3 merge advisory)", () => {
  const match = MODULES_SRC.match(/const CI_YML_MERGE_INSTRUCTIONS = `([\s\S]*?)`;/);
  const body = match ? match[1] : "";

  it("constant body is non-empty", () => {
    expect(body.length).toBeGreaterThan(0);
  });

  it("contains .npmrc reference", () => {
    expect(body).toContain(".npmrc");
  });

  it("contains GH_BKIT_TOKEN env block for install step", () => {
    expect(body).toContain("GH_BKIT_TOKEN:");
    expect(body).toContain("secrets.GH_BKIT_TOKEN");
  });

  it("contains read:packages scope reference", () => {
    expect(body).toContain("read:packages");
  });

  it("tells AI to remove Configure private-repo auth step", () => {
    expect(body).toContain("Remove");
    expect(body).toContain("Configure private-repo auth");
  });
});

describe("runCoreModule first-install advisory (BAR-141: structured finding)", () => {
  // The first-install message is now emitted as a structured PreflightFinding advisory.
  // Check the source uses advisories.push with the correct id.
  it("uses advisories.push (not printSink.push) for first-install message", () => {
    expect(MODULES_SRC).not.toContain("printSink.push");
    expect(MODULES_SRC).toContain("advisories.push");
  });

  it("first-install advisory id is first-install-postinstall-steps", () => {
    expect(MODULES_SRC).toContain("first-install-postinstall-steps");
  });

  it("first-install advisory action does NOT contain onlyBuiltDependencies", () => {
    // Extract the action string from the advisory block
    const match = MODULES_SRC.match(
      /id: "first-install-postinstall-steps"[\s\S]*?action:\s*"([\s\S]*?)",/,
    );
    const action = match ? match[1] : MODULES_SRC;
    expect(action).not.toContain("onlyBuiltDependencies");
  });

  it("first-install advisory action references read:packages scope", () => {
    const startIdx = MODULES_SRC.indexOf("first-install-postinstall-steps");
    const block = MODULES_SRC.slice(startIdx, startIdx + 1500);
    expect(block).toContain("read:packages");
  });
});

// ---------------------------------------------------------------------------
// P3.T4 + P3.T5 — superseded by BAR-167 Phase 1
// .claude/settings.json and .cursor/hooks.json now use writeTier2JsonContained +
// migrateLegacyBkitEnvelope (no __bkit__ envelope). Tests for the new primitives
// live in bkit-tiers.test.ts and the integration coverage is in
// bkit-modules.integration.test.ts. These blocks have been removed to avoid
// asserting deleted symbols (writeTier2Json, migrateTier1JsonToTier2, __bkit__).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// BAR-148 — runAutoModule tests (matrix rows 1, 2, 3)
// ---------------------------------------------------------------------------

describe("C1a — runAutoModule seeds bkit-ci-router.yml when absent (matrix row 1)", () => {
  it("bkit-modules.ts exports runAutoModule function", () => {
    expect(MODULES_SRC).toContain("export function runAutoModule");
  });

  it("runAutoModule uses writeTier3 for Tier-3 seed-or-print", () => {
    const autoModuleIdx = MODULES_SRC.indexOf("export function runAutoModule");
    const tier3Idx = MODULES_SRC.indexOf("writeTier3", autoModuleIdx);
    expect(autoModuleIdx).toBeGreaterThan(-1);
    expect(tier3Idx).toBeGreaterThan(autoModuleIdx);
  });

  it("runAutoModule targets bkit-ci-router.yml destination path", () => {
    expect(MODULES_SRC).toContain("bkit-ci-router.yml");
  });

  it("template path resolves to .agents/templates/.github/workflows/bkit-ci-router.yml", () => {
    const templateFile = path.resolve(".agents/templates/.github/workflows/bkit-ci-router.yml");
    expect(fs.existsSync(templateFile)).toBe(true);
  });
});

describe("C1b — runAutoModule prints merge instructions when file present (matrix row 2)", () => {
  it("AUTO_YML_MERGE_INSTRUCTIONS constant is defined in bkit-modules.ts", () => {
    expect(MODULES_SRC).toContain("AUTO_YML_MERGE_INSTRUCTIONS");
  });

  it("AUTO_YML_MERGE_INSTRUCTIONS warns about upstream workflow name", () => {
    const matchIdx = MODULES_SRC.indexOf("AUTO_YML_MERGE_INSTRUCTIONS");
    const block = MODULES_SRC.slice(matchIdx, matchIdx + 3000);
    expect(block).toContain("workflow name");
  });

  it("AUTO_YML_MERGE_INSTRUCTIONS mentions ANTHROPIC_API_KEY", () => {
    const matchIdx = MODULES_SRC.indexOf("AUTO_YML_MERGE_INSTRUCTIONS");
    const block = MODULES_SRC.slice(matchIdx, matchIdx + 3000);
    expect(block).toContain("ANTHROPIC_API_KEY");
  });

  it("AUTO_YML_MERGE_INSTRUCTIONS mentions Auto Linear label requirement", () => {
    const matchIdx = MODULES_SRC.indexOf("AUTO_YML_MERGE_INSTRUCTIONS");
    const block = MODULES_SRC.slice(matchIdx, matchIdx + 3000);
    expect(block).toContain("Auto");
  });

  it("runAutoModule logs '(exists; AI merge instructions printed)' when file present", () => {
    const autoModuleIdx = MODULES_SRC.indexOf("export function runAutoModule");
    const block = MODULES_SRC.slice(autoModuleIdx, autoModuleIdx + 2000);
    expect(block).toContain("exists; AI merge instructions printed");
  });
});

describe("C1c — module dispatch order includes auto between ci and lint (matrix row 3)", () => {
  it("MODULE_DISPATCH_ORDER contains auto", () => {
    expect(MODULES_SRC).toContain('"auto"');
  });

  it("MODULE_DISPATCH_ORDER has auto after ci and before lint", () => {
    const dispatchOrderIdx = MODULES_SRC.indexOf("MODULE_DISPATCH_ORDER");
    const block = MODULES_SRC.slice(dispatchOrderIdx, dispatchOrderIdx + 500);
    const ciPos = block.indexOf('"ci"');
    const autoPos = block.indexOf('"auto"');
    const lintPos = block.indexOf('"lint"');
    expect(ciPos).toBeGreaterThan(-1);
    expect(autoPos).toBeGreaterThan(ciPos);
    expect(lintPos).toBeGreaterThan(autoPos);
  });

  it("MODULE_REGISTRY contains auto entry", () => {
    const registryIdx = MODULES_SRC.indexOf("MODULE_REGISTRY");
    const block = MODULES_SRC.slice(registryIdx, registryIdx + 500);
    expect(block).toContain("auto: runAutoModule");
  });
});

// ---------------------------------------------------------------------------
// BAR-164 — installer guard: canonical CI template must not contain a
// `uses: cbartens/bkit/...@<ref>` reference. While `cbartens/bkit` is private
// and consumers live in other GitHub orgs, the runner's GITHUB_TOKEN cannot
// resolve such references and CI fails with "repository not found" before
// any install step runs.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Task 20 — single-dispatch on entry.format (BAR-167 Phase 2)
// ---------------------------------------------------------------------------

import { getInstallManifest } from "./bkit-manifest";

describe("bkit-manifest: single dispatch on entry.format", () => {
  it("json entries: settings.json and hooks.json use format json", () => {
    const allEntries = getInstallManifest([]);
    const jsonEntries = allEntries.filter((e) => e.format === "json");
    const paths = jsonEntries.map((e) => e.path);
    expect(paths).toContain(".claude/settings.json");
    expect(paths).toContain(".cursor/hooks.json");
  });

  it("markered-text entries: AGENTS.md, CLAUDE.md, .gitignore, .prettierignore use format markered-text", () => {
    const allEntries = getInstallManifest([]);
    const markedEntries = allEntries.filter((e) => e.format === "markered-text");
    const paths = markedEntries.map((e) => e.path);
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain("CLAUDE.md");
    expect(paths).toContain(".gitignore");
    expect(paths).toContain(".prettierignore");
    // ci.yml and .vale.ini are byte-equal-text (seed-or-print) since v2.0.0
    expect(paths).not.toContain(".github/workflows/ci.yml");
    expect(paths).not.toContain(".vale.ini");
    // .husky/* moved to byte-equal-text (Tier 3 seed-or-print) in v2.0.4
    expect(paths).not.toContain(".husky/pre-commit");
    expect(paths).not.toContain(".husky/pre-push");
  });

  it("byte-equal-text entries: .cursor/Dockerfile, ci.yml, .vale.ini, slop-scan.config.json use format byte-equal-text", () => {
    const allEntries = getInstallManifest([]);
    const byteEqualEntries = allEntries.filter((e) => e.format === "byte-equal-text");
    const paths = byteEqualEntries.map((e) => e.path);
    expect(paths).toContain(".cursor/Dockerfile");
    expect(paths).toContain(".github/workflows/ci.yml");
    expect(paths).toContain(".vale.ini");
    expect(paths).toContain("slop-scan.config.json");
  });

  it("every entry has a valid format value", () => {
    const allEntries = getInstallManifest([]);
    const validFormats = new Set(["json", "markered-text", "byte-equal-text"]);
    for (const entry of allEntries) {
      expect(validFormats.has(entry.format)).toBe(true);
    }
  });
});

describe("BAR-164 — canonical CI template has no cross-org private `uses:` references", () => {
  it("scanForeignBkitUses flags `uses: cbartens/bkit/...@<ref>` lines", () => {
    const sample = `
jobs:
  job:
    steps:
      - uses: actions/checkout@v4
      - uses: cbartens/bkit/.github/actions/setup-auth@v1
        with:
          token: \${{ secrets.GH_BKIT_TOKEN }}
      - uses: cbartens/bkit/.github/actions/setup-auth@v1.0.2
`;
    expect(scanForeignBkitUses(sample)).toEqual([
      "cbartens/bkit/.github/actions/setup-auth@v1",
      "cbartens/bkit/.github/actions/setup-auth@v1.0.2",
    ]);
  });

  it("scanForeignBkitUses returns empty for the env-var pattern (no foreign uses)", () => {
    const sample = `
jobs:
  job:
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - name: Install Dependencies
        run: pnpm install --frozen-lockfile
        env:
          GH_BKIT_TOKEN: \${{ secrets.GH_BKIT_TOKEN }}
`;
    expect(scanForeignBkitUses(sample)).toEqual([]);
  });

  it("canonical CI template has zero foreign `cbartens/bkit/...` uses", () => {
    const templatePath = path.resolve(".agents/templates/.github/workflows/ci.yml");
    const content = fs.readFileSync(templatePath, "utf-8");
    expect(scanForeignBkitUses(content)).toEqual([]);
  });
});
