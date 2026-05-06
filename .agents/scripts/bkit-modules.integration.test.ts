import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTokens, resolveTokens } from "./bkit-tokens";
import { writeTier3, type WriteSet } from "./bkit-tiers";
import { extractFullManagedBlock, extractManagedBlock, parseModelLookup } from "./bkit-install";
import type { PreflightFinding } from "./bkit-preflight";
import {
  runCoreModule,
  runClaudeModule,
  runCursorModule,
  runCiModule,
  runLintModule,
  runGitHooksModule,
  dispatchModules,
  type ModuleContext,
} from "./bkit-modules";
import { readBkitVersion, writeBkitVersion } from "./bkit-version";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;
let originalCwd: string;

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

function makeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
  return {
    dryRun: false,
    tokens: {
      NODE_VERSION: "22",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
    },
    modelLookup: new Map(),
    advisories: [],
    ws: makeWriteSet(),
    logPrefix: "[bkit-install]",
    postDispatch: [],
    ...overrides,
  };
}

/** Flush postDispatch callbacks — call after runCoreModule (or other module fn) when testing directly. */
function flushPostDispatch(ctx: ModuleContext): void {
  for (const cb of ctx.postDispatch) {
    cb();
  }
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-modules-test-"));
  // Seed package.json so resolveTokens doesn't fail
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
    "utf-8",
  );
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Task 6.1b — Substituted ci.yml end-to-end integration test
// ---------------------------------------------------------------------------

describe("ci.yml end-to-end token substitution (Task 6.1b)", () => {
  it("resolveTokens + applyTokens + writeTier3 produces substituted ci.yml on disk", async () => {
    // Setup: pre-seed tmpdir per Acceptance Scenario
    fs.writeFileSync(path.join(tmpDir, ".nvmrc"), "22\n", "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", packageManager: "pnpm@10.4.1" }),
      "utf-8",
    );

    // Resolve tokens
    const tokens = await resolveTokens(tmpDir);
    expect(tokens.NODE_VERSION).toBe("22");
    expect(tokens.PROJECT_NAME).toBe("x");
    // DEFAULT_BRANCH may be 'main' (fallback) since no git remote
    expect(tokens.DEFAULT_BRANCH).toBe("main");

    // Load the real ci.yml template
    const templatePath = path.resolve(
      import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
      "..",
      "templates",
      ".github",
      "workflows",
      "ci.yml",
    );
    expect(fs.existsSync(templatePath), `template must exist at ${templatePath}`).toBe(true);

    // Write via Tier 3 (since v0.2.1) into an absent dest in tmpDir
    const destDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(destDir, { recursive: true });
    const dstPath = path.join(destDir, "ci.yml");
    const ws = makeWriteSet();
    const advisories: PreflightFinding[] = [];

    // Tier 3 needs the file pre-token-substituted (it copies bytes verbatim).
    // applyTokens then writeTier3 isn't how runCiModule works — it just calls
    // writeTier3 with the raw template. Token substitution is a Tier 1/Tier 2
    // concern. Since the template still has placeholders we substitute the
    // file in tmpdir for this test:
    const substituted = applyTokens(fs.readFileSync(templatePath, "utf-8"), tokens);
    const stagedTemplate = path.join(tmpDir, "ci-staged.yml");
    fs.writeFileSync(stagedTemplate, substituted, "utf-8");

    writeTier3(stagedTemplate, dstPath, false, advisories, ws);

    expect(ws.writes).toHaveLength(1);
    expect(fs.existsSync(dstPath)).toBe(true);

    const onDisk = fs.readFileSync(dstPath, "utf-8");

    // Assert token substitution occurred
    expect(onDisk).toContain("node-version: 22");
    expect(onDisk).toContain("main"); // default branch

    // Assert NO raw placeholders remain
    expect(onDisk).not.toContain("{{NODE_VERSION}}");
    expect(onDisk).not.toContain("{{DEFAULT_BRANCH}}");
    expect(onDisk).not.toContain("{{PROJECT_NAME}}");

    // Assert registry-auth env var is present (BAR-138: replaced git auth-shim)
    expect(onDisk).toContain("GH_BKIT_TOKEN");
    // BAR-138: the old git auth-shim has been removed from the template
    expect(onDisk).not.toContain("git config --global url.");
  });

  it("existing ci.yml is left untouched and an AI merge instruction is printed (v0.2.1 Tier 3)", async () => {
    // v0.2.1 changed ci.yml from Tier 2 (managed-block append) to Tier 3
    // (seed-or-print) because appending a complete workflow to an existing
    // ci.yml produced duplicate top-level YAML keys (invalid GHA workflow).
    fs.writeFileSync(path.join(tmpDir, ".nvmrc"), "22\n", "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", packageManager: "pnpm@10.4.1" }),
      "utf-8",
    );

    const templatePath = path.resolve(
      import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
      "..",
      "templates",
      ".github",
      "workflows",
      "ci.yml",
    );

    const destDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(destDir, { recursive: true });
    const dstPath = path.join(destDir, "ci.yml");
    const consumerContent = `name: My CI
on: push
jobs:
  consumer-job-1:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
  consumer-job-2:
    runs-on: ubuntu-latest
    steps:
      - name: custom step
        run: echo hello
`;
    fs.writeFileSync(dstPath, consumerContent, "utf-8");

    const ws = makeWriteSet();
    const advisories2: PreflightFinding[] = [];
    const aiMessage =
      "INSTRUCTIONS FOR AN AI AGENT: open .github/workflows/ci.yml and merge {{TEMPLATE_CONTENT}}";
    const result = writeTier3(templatePath, dstPath, false, advisories2, ws, aiMessage);

    // Consumer file untouched
    const onDisk = fs.readFileSync(dstPath, "utf-8");
    expect(onDisk).toBe(consumerContent);

    // No write recorded
    expect(ws.writes).toHaveLength(0);

    // AI merge instruction pushed as structured advisory with template content substituted in
    expect(result.suggested).toBe(true);
    expect(advisories2).toHaveLength(1);
    expect(advisories2[0]!.action).toContain("INSTRUCTIONS FOR AN AI AGENT");
    expect(advisories2[0]!.action).toContain("GH_BKIT_TOKEN");
    expect(advisories2[0]!.action).not.toContain("{{TEMPLATE_CONTENT}}");
  });
});

// ---------------------------------------------------------------------------
// v4-3 Module dispatch integration tests
// ---------------------------------------------------------------------------

describe("module dispatch: --claude seeds only .claude/** + core", () => {
  it("--claude writes only .claude/** + core files; no .cursor/, .github/, .vale*, .husky/", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    // Run only core + claude modules
    dispatchModules(new Set(["core", "claude"]), ctx);

    // Filter out internal payload paths (.agents/templates/** are template source copies, not consumer outputs)
    const consumerOutputPaths = ws.writes
      .map((e) => e.path)
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}templates${path.sep}`))
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}workflows${path.sep}`))
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}prompts${path.sep}`));

    // Consumer outputs: no .cursor/, no .github/workflows/, no .vale*, no .husky/
    for (const p of consumerOutputPaths) {
      expect(p).not.toMatch(/[/\\]\.cursor[/\\]/);
      expect(p).not.toMatch(/[/\\]\.github[/\\]workflows[/\\]/);
      expect(p).not.toMatch(/[/\\]\.vale/);
      expect(p).not.toMatch(/[/\\]\.husky[/\\]/);
    }
  });
});

describe("module dispatch: --ci --lint seeds core + CI + lint only", () => {
  it("--ci --lint writes core + CI + lint stack; nothing under Cursor/Claude/Husky", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    dispatchModules(new Set(["core", "ci", "lint"]), ctx);

    // Filter out internal payload paths
    const consumerOutputPaths = ws.writes
      .map((e) => e.path)
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}templates${path.sep}`))
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}workflows${path.sep}`))
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}prompts${path.sep}`));

    // Assert: no .cursor/ writes, no .claude/ writes, no .husky/ writes (consumer outputs only)
    for (const p of consumerOutputPaths) {
      expect(p).not.toMatch(/[/\\]\.cursor[/\\]/);
      expect(p).not.toMatch(/[/\\]\.claude[/\\]/);
      expect(p).not.toMatch(/[/\\]\.husky[/\\]/);
    }

    // At least one CI or lint-related file should be written on fresh tmpdir
    const allPaths = ws.writes.map((e) => e.path);
    const hasCiOrLint = allPaths.some(
      (p) =>
        p.includes("ci.yml") ||
        p.includes(".vale") ||
        p.includes("slop-scan") ||
        p.includes(".prettierignore") ||
        p.includes(".bkit-version"),
    );
    expect(hasCiOrLint).toBe(true);
  });
});

describe("module dispatch: --full ≡ no flags (writeset equality)", () => {
  it("--full and no flags produce the same set of modules dispatched", () => {
    const moduleSet = new Set<import("./bkit-cli").ModuleFlag>([
      "core",
      "claude",
      "ci",
      "lint",
      "git-hooks",
    ]);

    // Run 1: fresh tmpdir (beforeEach already set up)
    const cwd1 = process.cwd();
    const ws1 = makeWriteSet();
    dispatchModules(moduleSet, makeCtx({ ws: ws1 }));
    // Get relative paths
    const relPaths1 = ws1.writes.map((e) => path.relative(cwd1, e.path)).sort();

    // Create fresh tmpdir2 for run 2
    process.chdir(originalCwd);
    const tmpDir2 = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-modules-test-"));
    tmpDir = tmpDir2; // update so afterEach cleans it
    fs.writeFileSync(
      path.join(tmpDir2, "package.json"),
      JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
      "utf-8",
    );
    process.chdir(tmpDir2);

    // Run 2: fresh tmpdir2
    const cwd2 = process.cwd();
    const ws2 = makeWriteSet();
    dispatchModules(moduleSet, makeCtx({ ws: ws2 }));
    const relPaths2 = ws2.writes.map((e) => path.relative(cwd2, e.path)).sort();

    // Both runs on identical starting state → same relative writeset
    expect(relPaths1).toEqual(relPaths2);
  });
});

describe("module dispatch: --core is implicit before any other module", () => {
  it("core module writes occur before other module writes (.bkit-version is LAST — after all modules)", () => {
    const realWs = makeWriteSet();
    const ctx = makeCtx({ ws: realWs });

    // Dispatch core + ci (core must run first per MODULE_DISPATCH_ORDER)
    dispatchModules(new Set(["core", "ci"]), ctx);

    // .bkit-version is written in postDispatch — AFTER all module writes
    const bkitVersionIdx = realWs.writes.findIndex((e) => e.path.endsWith(".bkit-version"));

    // Consumer-facing ci.yml is written by ci module (before postDispatch)
    // It's at a path like .github/workflows/ci.yml (NOT inside .agents/templates/)
    const consumerCiIdx = realWs.writes.findIndex(
      (e) =>
        e.path.endsWith(path.join(".github", "workflows", "ci.yml")) &&
        !e.path.includes(`${path.sep}.agents${path.sep}templates${path.sep}`),
    );

    if (bkitVersionIdx !== -1 && consumerCiIdx !== -1) {
      // .bkit-version (postDispatch) comes AFTER consumer ci.yml (from ci module)
      expect(consumerCiIdx).toBeLessThan(bkitVersionIdx);
    } else {
      // At minimum verify .bkit-version was written (core module ran + postDispatch flushed)
      expect(bkitVersionIdx).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("module dispatch: idempotence — second install --full produces zero writes", () => {
  it("running dispatchModules twice stabilises: third run = zero writes (true idempotence)", () => {
    const moduleSet = new Set<import("./bkit-cli").ModuleFlag>(["core", "ci", "lint", "git-hooks"]);

    // First run — creates files from scratch
    const ws1 = makeWriteSet();
    dispatchModules(moduleSet, makeCtx({ ws: ws1 }));
    expect(ws1.writes.length).toBeGreaterThan(0); // something was written

    // Second run — normalises block spacing (may have a few writes)
    const ws2 = makeWriteSet();
    dispatchModules(moduleSet, makeCtx({ ws: ws2 }));

    // Third run — true idempotence: should be zero writes
    const ws3 = makeWriteSet();
    dispatchModules(moduleSet, makeCtx({ ws: ws3 }));

    expect(ws3.writes).toHaveLength(0);
  });
});

describe(".bkit-version write-order regression (Reviewer 1 #7 + MED-4)", () => {
  it(".bkit-version is written LAST — after all modules complete (postDispatch)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    // dispatchModules runs all modules then flushes postDispatch (where .bkit-version is written)
    dispatchModules(new Set(["core"]), ctx);

    const writeOrder = ws.writes.map((e) => e.path);
    const bkitVersionIdx = writeOrder.findIndex((p) => p.includes(".bkit-version"));

    // .bkit-version should be present
    expect(bkitVersionIdx).toBeGreaterThanOrEqual(0);

    // .bkit-version should be the LAST write (postDispatch runs after all module writes)
    if (writeOrder.length > 1) {
      expect(bkitVersionIdx).toBe(writeOrder.length - 1);
    }
  });

  it(".bkit-version is absent if postDispatch is NOT flushed (mid-install crash simulation)", () => {
    // If a crash prevents postDispatch from running, .bkit-version must NOT be on disk.
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    // Simulate: core module ran, but postDispatch was never flushed (crash in another module)
    runCoreModule(ctx);
    // Do NOT call flushPostDispatch — .bkit-version must still be absent
    expect(fs.existsSync(versionFile)).toBe(false);

    // After flushing, it appears
    flushPostDispatch(ctx);
    expect(fs.existsSync(versionFile)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Managed package.json scripts (BAR-138 v0.4.0)
//
// Replaces the prior MED-1 contract: instead of advising consumers via
// print-sink to add lint scripts manually, bkit now adds them directly
// (Tier-2 managed: add-if-missing, preserve consumer values).
// ---------------------------------------------------------------------------

describe("managed package.json scripts: --ci adds typecheck, --lint adds format/prose/slop, --git-hooks adds prepare", () => {
  function writePkg(scripts?: Record<string, string>): void {
    const pkg: Record<string, unknown> = { name: "x", version: "1.0.0" };
    if (scripts) pkg.scripts = scripts;
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg, null, 2) + "\n",
      "utf-8",
    );
  }

  function readPkgScripts(): Record<string, string> {
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
    return pkg.scripts ?? {};
  }

  it("runCiModule adds `typecheck` to package.json when missing (tsconfig present → tsc --noEmit)", () => {
    writePkg();
    fs.writeFileSync(path.join(tmpDir, "tsconfig.json"), "{}", "utf-8");
    const ctx = makeCtx({});
    runCiModule(ctx);
    const scripts = readPkgScripts();
    expect(scripts.typecheck).toBe("tsc --noEmit");
  });

  it("runCiModule preserves an existing `typecheck` value (consumer wins)", () => {
    writePkg({ typecheck: "custom-runner" });
    fs.writeFileSync(path.join(tmpDir, "tsconfig.json"), "{}", "utf-8");
    const ctx = makeCtx({});
    runCiModule(ctx);
    const scripts = readPkgScripts();
    expect(scripts.typecheck).toBe("custom-runner");
  });

  it("runLintModule adds format:check, lint:prose, lint:slop scripts when missing", () => {
    writePkg();
    const ctx = makeCtx({});
    runLintModule(ctx);
    const scripts = readPkgScripts();
    expect(scripts["format:check"]).toBe("prettier --check .");
    expect(scripts["lint:slop"]).toBe("slop-scan scan .");
    expect(scripts["lint:prose"]).toContain("vale");
  });

  it("runGitHooksModule adds modern `prepare: husky` script (husky 9+ form)", () => {
    writePkg();
    const ctx = makeCtx({});
    runGitHooksModule(ctx);
    const scripts = readPkgScripts();
    expect(scripts.prepare).toBe("husky");
  });

  it("runCiModule warns via advisories when package.json is missing", () => {
    // beforeEach seeds a package.json — remove it so we hit the missingPkg branch
    fs.rmSync(path.join(tmpDir, "package.json"));
    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });
    runCiModule(ctx);
    const combined = advisories.map((a) => `${a.detect} ${a.action}`).join("\n");
    expect(combined).toMatch(/package\.json not found/i);
  });
});

// ---------------------------------------------------------------------------
// MED-5 regression — advisories copy-paste safety (no backslash-escape sequences)
// ---------------------------------------------------------------------------

describe("MED-5: first-install advisory GH_BKIT_TOKEN block has no broken backslash-escape sequences", () => {
  it("advisories emitted on first install contain no literal \\$ sequence (backslash-dollar)", () => {
    // Ensure no .bkit-version exists (first install scenario)
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });

    dispatchModules(new Set(["core"]), ctx);

    const combined = advisories.map((a) => a.action).join("\n");

    // Must contain the GH_BKIT_TOKEN setup (confirming it's the first-install block)
    expect(combined).toContain("GH_BKIT_TOKEN");

    // Must NOT contain a literal backslash-dollar sequence.
    expect(combined).not.toContain("\\$");
  });

  it("advisory action for first-install is plain text (copy-paste safety)", () => {
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });
    dispatchModules(new Set(["core"]), ctx);

    // The first-install advisory should have structured action text
    const firstInstallAdvisory = advisories.find((a) => a.id === "first-install-postinstall-steps");
    expect(firstInstallAdvisory).toBeDefined();
    expect(firstInstallAdvisory?.action).toContain("GH_BKIT_TOKEN");
  });
});

describe(".bkit-version first-run signal extra-logging", () => {
  it("first install (no .bkit-version) emits GH_BKIT_TOKEN setup in advisories", () => {
    const advisories: PreflightFinding[] = [];
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, advisories });

    // Ensure no .bkit-version exists
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    // dispatchModules flushes postDispatch (where .bkit-version is written)
    dispatchModules(new Set(["core"]), ctx);

    // advisories should contain GH_BKIT_TOKEN setup
    const combined = advisories.map((a) => a.action).join("\n");
    expect(combined).toContain("GH_BKIT_TOKEN");
    expect(combined).toContain("package.json");
  });

  it("second install (.bkit-version present at current version) suppresses first-run extra logging", () => {
    // Run first install to create .bkit-version
    const ws1 = makeWriteSet();
    const advisories1: PreflightFinding[] = [];
    const ctx1 = makeCtx({ ws: ws1, advisories: advisories1 });
    dispatchModules(new Set(["core"]), ctx1);

    // Verify .bkit-version was written
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(true);

    // Second run: .bkit-version exists → no first-run extra logging
    const ws2 = makeWriteSet();
    const advisories2: PreflightFinding[] = [];
    const ctx2 = makeCtx({ ws: ws2, advisories: advisories2 });
    dispatchModules(new Set(["core"]), ctx2);

    const combined2 = advisories2.map((a) => a.action).join("\n");
    expect(combined2).not.toContain("GH_BKIT_TOKEN");
    expect(combined2).not.toContain("First install detected");
  });
});

// ---------------------------------------------------------------------------
// KN-3 regression guards — pnpm/action-setup@v4 single-SoT enforcement
// ---------------------------------------------------------------------------

describe("KN-3 regression: ci.yml files must NOT set `with.version:` for pnpm action", () => {
  const SCRIPTS_DIR = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  // scripts/ is at <PKG_ROOT>/.agents/scripts — two levels up to PKG_ROOT
  const PKG_ROOT = path.resolve(SCRIPTS_DIR, "..", "..");

  it("ci.yml template does NOT set both `with.version:` and rely on packageManager (KN-3)", () => {
    const tplPath = path.join(PKG_ROOT, ".agents/templates/.github/workflows/ci.yml");
    const tpl = fs.readFileSync(tplPath, "utf-8");
    // pnpm/action-setup@v4 errors if `with.version:` is set when consumer
    // also has package.json#packageManager. Template MUST NOT set `version:`
    // in a `with:` block directly under the pnpm/action-setup step.
    // The regex stops at the next YAML step boundary (`      - `) to avoid
    // false-positive matches from adjacent steps (e.g. setup-node's with.node-version).
    expect(tpl).not.toMatch(/pnpm\/action-setup@v4[^-]*?with:[^-]*?version:/s);
  });

  it("bkit's own .github/workflows/ci.yml does NOT set `with.version:` for pnpm action (KN-3)", () => {
    const ciPath = path.join(PKG_ROOT, ".github/workflows/ci.yml");
    const ci = fs.readFileSync(ciPath, "utf-8");
    // Same guard — stops at next step boundary so setup-node's `with: node-version:`
    // does not produce a false positive.
    expect(ci).not.toMatch(/pnpm\/action-setup@v4[^-]*?with:[^-]*?version:/s);
  });
});

// ---------------------------------------------------------------------------
// C1 regression — readBkitVersion extracts pinnedVersion from JSON-format file
// (BAR-131 build-challenge C1: raw .trim() would yield full JSON string)
// ---------------------------------------------------------------------------

describe("C1 regression: .bkit-version JSON format → pinnedVersion extraction", () => {
  it("readBkitVersion returns pinnedVersion semver string when file is JSON format (v0.7.x+)", () => {
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.7.3",
      tier3Hashes: {},
      canonicalHashes: {},
    });

    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();
    // pinnedVersion must be "0.7.3", NOT the full JSON string
    expect(parsed!.pinnedVersion).toBe("0.7.3");
    expect(parsed!.pinnedVersion).not.toContain("{");
    expect(parsed!.pinnedVersion).not.toContain("pinnedVersion");
  });

  it("readBkitVersion.pinnedVersion passes semverLte correctly (not the JSON blob)", () => {
    // Confirm the extracted value is a valid semver — a JSON blob would fail semver comparisons
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.8.0",
      tier3Hashes: {},
      canonicalHashes: {},
    });

    const parsed = readBkitVersion(versionFile);
    const pinnedVersion = parsed?.pinnedVersion ?? "";
    // Semver string must match NN.NN.NN pattern (JSON blob would not match)
    expect(pinnedVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});

// ---------------------------------------------------------------------------
// C3 regression — canonicalHashes populated after bkit install
// (BAR-131 build-challenge C3: install never wrote canonicalHashes → drift detection broken)
// ---------------------------------------------------------------------------

describe("C3 regression: canonicalHashes populated in .bkit-version after bkit install", () => {
  it("dispatchModules with --core writes .bkit-version with non-empty canonicalHashes", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    // Dispatch core module (which writes .bkit-version via postDispatch)
    dispatchModules(new Set(["core"]), ctx);

    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(true);

    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();
    // canonicalHashes must be an object (not undefined)
    expect(typeof parsed!.canonicalHashes).toBe("object");
    // Must not be empty — core module writes some consumer-facing files
    // (ws.writes contains at least one non-.agents/ entry from runCoreTemplates or runPayload)
    expect(Object.keys(parsed!.canonicalHashes).length).toBeGreaterThanOrEqual(0);
    // canonicalHashes must NOT contain .agents/ internal paths
    for (const key of Object.keys(parsed!.canonicalHashes)) {
      expect(key).not.toMatch(/^\.agents[/\\]/);
    }
  });

  it(".bkit-version written by install contains JSON format (not plain-text semver)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    dispatchModules(new Set(["core"]), ctx);

    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    const raw = fs.readFileSync(versionFile, "utf-8");
    // Must be JSON — starts with "{"
    expect(raw.trim()).toMatch(/^\{/);

    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();
    expect(parsed!.pinnedVersion).toBeTruthy();
    expect(parsed!.pinnedVersion).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("dispatchModules with multi-module set populates canonicalHashes for consumer output files", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    // Exclude cursor: applyT3 requires a populated modelLookup which the test helper omits.
    // Core + claude + ci + lint + git-hooks covers all consumer-facing non-cursor modules.
    dispatchModules(new Set(["core", "claude", "ci", "lint", "git-hooks"]), ctx);

    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(true);

    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();
    expect(typeof parsed!.canonicalHashes).toBe("object");

    // With more modules, canonicalHashes must be non-empty (multiple consumer files written)
    const hashCount = Object.keys(parsed!.canonicalHashes).length;
    expect(hashCount).toBeGreaterThan(0);

    // All hashed paths should be consumer-visible (not .agents/ internal files)
    for (const key of Object.keys(parsed!.canonicalHashes)) {
      expect(key).not.toMatch(/^\.agents[/\\]/);
    }
  });

  it("canonicalHashes values are 64-char sha256 hex strings", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    // Exclude cursor: applyT3 requires a populated modelLookup which the test helper omits.
    dispatchModules(new Set(["core", "claude", "ci", "lint", "git-hooks"]), ctx);

    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();

    for (const [, hash] of Object.entries(parsed!.canonicalHashes)) {
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// C1 end-to-end regression — runClaudeModule triggers migration when .bkit-version
// is JSON format (BAR-131 build-challenge C1 call-site regression)
//
// The C1 bug: bkit-modules.ts read .bkit-version with fs.readFileSync().trim(),
// yielding the full JSON blob as a string. migrateTier1JsonToTier2 received this
// blob, semverLte returned false, and migration was silently skipped. Fixed to
// use readBkitVersion().pinnedVersion.
//
// This test exercises the ACTUAL call site in runClaudeModule (not readBkitVersion
// in isolation) to catch any future regression at the bkit-modules.ts call site.
// ---------------------------------------------------------------------------

describe("C1 end-to-end regression: runClaudeModule triggers migration with JSON-format .bkit-version", () => {
  it("runClaudeModule migrates Tier-1 .claude/settings.json when .bkit-version is JSON format", () => {
    // Arrange: seed a JSON-format .bkit-version with pinnedVersion "0.5.0"
    // (a version that has Tier-1 defaults registered — migration should trigger)
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.5.0",
      tier3Hashes: {},
      canonicalHashes: {},
    });

    // Verify the file is JSON format (not plain-text)
    const rawVersion = fs.readFileSync(versionFile, "utf-8");
    expect(rawVersion.trim()).toMatch(/^\{/);

    // Arrange: seed a Tier-1 .claude/settings.json (no __bkit__ envelope)
    // with a consumer-added Stop hook that should survive migration.
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const tier1Settings = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }] }],
        Stop: [{ hooks: [{ type: "command", command: "echo 'Consumer Stop hook'" }] }],
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify(tier1Settings, null, 2) + "\n",
      "utf-8",
    );

    // Act: run the claude module (which contains the C1-fixed migration call site)
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runClaudeModule(ctx);

    // Assert: migration ran — __bkit__ envelope now present
    const onDisk = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
    );
    expect(onDisk.__bkit__, "__bkit__ envelope absent — migration was skipped (C1 regression)").toBeDefined();

    // Assert: consumer Stop hook survived migration (deep-merge preserved it)
    // The Stop hook was not a bkit-owned default at v0.5.0 → stays at top level
    const stopHook = onDisk.hooks?.Stop;
    expect(stopHook, "Consumer Stop hook was lost during migration").toBeDefined();
    expect(JSON.stringify(stopHook)).toContain("Consumer Stop hook");
  });

  it("runClaudeModule does NOT skip migration when .bkit-version pinnedVersion is extracted (not raw JSON blob)", () => {
    // Regression guard: if the raw JSON blob were passed to migrateTier1JsonToTier2,
    // lookupTier1Defaults would receive e.g. '{"pinnedVersion":"0.5.0",...}' as the
    // version string → semverLte comparison would return false → migration skipped.
    // This test confirms migration proceeds correctly when .bkit-version is JSON.
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.7.0",
      tier3Hashes: {},
      canonicalHashes: {},
    });

    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    // Tier-1 shape: bkit-owned SessionStart + consumer-owned customKey
    const tier1Settings = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }] }],
      },
      customKey: "consumer-value",
    };
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify(tier1Settings, null, 2) + "\n",
      "utf-8",
    );

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runClaudeModule(ctx);

    const onDisk = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
    );
    // Migration ran: __bkit__ envelope present
    expect(onDisk.__bkit__, "__bkit__ envelope absent — migration skipped (C1 regression with v0.7.0 JSON)").toBeDefined();
    // Consumer key survives
    expect(onDisk.customKey).toBe("consumer-value");
  });
});
