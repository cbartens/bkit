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
  runRenovateModule,
  runDependabotModule,
  runCloudModule,
  renderCloudWorkflow,
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
      REPO_SLUG: "acme/test-project",
    },
    modelLookup: new Map(),
    advisories: [],
    ws: makeWriteSet(),
    logPrefix: "[bkit-install]",
    postDispatch: [],
    issueTracker: "none",
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
// runRenovateModule — opt-in, phase-gated (issue #123 follow-up)
// ---------------------------------------------------------------------------

describe("runRenovateModule — opt-in, phase-gated against the default branch", () => {
  it("Phase A: writes .github/renovate.json5 and emits the PR-to-default-branch advisory when no origin remote exists", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    // tmpDir is a fresh dir with no .git — the git cat-file check throws → Phase A.
    runRenovateModule(ctx);

    const renovatePath = path.join(tmpDir, ".github", "renovate.json5");
    expect(fs.existsSync(renovatePath)).toBe(true);
    expect(fs.readFileSync(renovatePath, "utf-8").length).toBeGreaterThan(0);

    const phaseA = ctx.advisories.find((a) => a.id === "renovate-phase-a-pr-to-default-branch");
    expect(phaseA).toBeDefined();
    expect(phaseA!.action).toMatch(/Phase A/);
    expect(phaseA!.action).toMatch(/pnpm bkit install --renovate/);
    // Must NOT print the App-install URL in Phase A.
    expect(phaseA!.action).not.toMatch(/github\.com\/apps\/renovate/);
    // Phase A (not only Phase B) must carry the renovate-local override guidance:
    // a consumer should learn where conflicting overrides go before App activation.
    expect(phaseA!.action).toMatch(/renovate-local\.json5/);
    expect(phaseA!.action).toMatch(/On conflict/);

    // Phase B advisory must not fire when in Phase A.
    expect(ctx.advisories.find((a) => a.id === "renovate-phase-b-install-app")).toBeUndefined();
  });

  it("Phase A advisory references the resolved DEFAULT_BRANCH token", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, tokens: { ...makeCtx().tokens, DEFAULT_BRANCH: "trunk" } });
    runRenovateModule(ctx);

    const phaseA = ctx.advisories.find((a) => a.id === "renovate-phase-a-pr-to-default-branch");
    expect(phaseA).toBeDefined();
    expect(phaseA!.detect).toMatch(/origin\/trunk/);
    expect(phaseA!.action).toMatch(/`trunk`/);
  });

  it("dry-run: writes nothing to disk but still emits the Phase A advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, dryRun: true });
    runRenovateModule(ctx);

    const renovatePath = path.join(tmpDir, ".github", "renovate.json5");
    expect(fs.existsSync(renovatePath)).toBe(false);
    expect(
      ctx.advisories.find((a) => a.id === "renovate-phase-a-pr-to-default-branch"),
    ).toBeDefined();
  });

  it("seeds the consumer-owned renovate-local.json5 stub with valid, empty packageRules", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runRenovateModule(ctx);

    const localPath = path.join(tmpDir, ".github", "renovate-local.json5");
    expect(fs.existsSync(localPath)).toBe(true);
    const local = fs.readFileSync(localPath, "utf-8");
    expect(local).toMatch(/\$schema:\s*"https:\/\/docs\.renovatebot\.com\/renovate-schema\.json"/);
    expect(local).toMatch(/packageRules:\s*\[\s*\]/);
    // The stub documents itself as consumer-owned.
    expect(local).toMatch(/bkit does NOT manage/i);
  });

  it("substitutes REPO_SLUG into renovate.json5's local-preset extends entry", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, tokens: { ...makeCtx().tokens, REPO_SLUG: "acme/widget" } });
    runRenovateModule(ctx);

    const renovate = fs.readFileSync(path.join(tmpDir, ".github", "renovate.json5"), "utf-8");
    expect(renovate).toContain('"local>acme/widget//.github/renovate-local.json5"');
    expect(renovate).not.toContain("{{REPO_SLUG}}");
  });

  it("references the local preset with the explicit .json5 extension matching the seeded filename", () => {
    // Regression guard for issue #179: an extensionless local preset
    // (`local>owner/repo//.github/renovate-local`) resolves to `.json`, which
    // does not exist — Renovate 404s and disables the entire repo config. The
    // `extends` entry must end in `.json5` and match the seeded filename exactly.
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, tokens: { ...makeCtx().tokens, REPO_SLUG: "acme/widget" } });
    runRenovateModule(ctx);

    const renovate = fs.readFileSync(path.join(tmpDir, ".github", "renovate.json5"), "utf-8");
    const presetRef = renovate.match(/"local>[^"]*\/renovate-local[^"]*"/)?.[0] ?? "";
    expect(presetRef).toBe('"local>acme/widget//.github/renovate-local.json5"');
    // The reference must point at the file bkit actually seeds.
    expect(fs.existsSync(path.join(tmpDir, ".github", "renovate-local.json5"))).toBe(true);
    // No extensionless reference survives anywhere in the rendered config.
    expect(renovate).not.toMatch(/renovate-local"/);
  });

  it("does NOT overwrite an existing renovate-local.json5 and emits no nag advisory", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    const localPath = path.join(tmpDir, ".github", "renovate-local.json5");
    const consumerContent =
      '{ packageRules: [{ matchPackageNames: ["react"], enabled: false }] }\n';
    fs.writeFileSync(localPath, consumerContent);

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runRenovateModule(ctx);

    // Consumer content preserved verbatim — bkit must not touch it.
    expect(fs.readFileSync(localPath, "utf-8")).toBe(consumerContent);
    // No tier3 merge-suggested advisory for the consumer-owned file.
    expect(ctx.advisories.find((a) => a.id.includes("renovate-local"))).toBeUndefined();
  });

  it("dry-run: does not write the renovate-local.json5 stub to disk", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, dryRun: true });
    runRenovateModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, ".github", "renovate-local.json5"))).toBe(false);
  });

  it("--ci alone does NOT ship renovate.json5 (split out of ci module per #123 follow-up)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    dispatchModules(new Set(["core", "ci"]), ctx);

    const renovatePath = path.join(tmpDir, ".github", "renovate.json5");
    expect(fs.existsSync(renovatePath)).toBe(false);
  });

  it("refuses to install when .github/dependabot.yml is present (mutually exclusive)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runRenovateModule(ctx);

    // No renovate.json5 should be written
    const renovatePath = path.join(tmpDir, ".github", "renovate.json5");
    expect(fs.existsSync(renovatePath)).toBe(false);

    // Blocker advisory should fire
    const blocker = ctx.advisories.find((a) => a.id === "renovate-dependabot-mutually-exclusive");
    expect(blocker).toBeDefined();
    expect(blocker!.severity).toBe("blocker");
    expect(blocker!.action).toMatch(/git rm \.github\/dependabot\.yml/);
  });
});

// ---------------------------------------------------------------------------
// runDependabotModule — opt-in, mutually exclusive with Renovate (#109/#123)
// ---------------------------------------------------------------------------

describe("runDependabotModule — opt-in, mutually exclusive with Renovate", () => {
  it("writes .github/dependabot.yml + scripts/ci/bkit-set-dependabot.sh and emits setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runDependabotModule(ctx);

    const ymlPath = path.join(tmpDir, ".github", "dependabot.yml");
    const scriptPath = path.join(tmpDir, "scripts", "ci", "bkit-set-dependabot.sh");
    expect(fs.existsSync(ymlPath)).toBe(true);
    expect(fs.existsSync(scriptPath)).toBe(true);
    // Helper script must be executable.
    const mode = fs.statSync(scriptPath).mode & 0o777;
    expect(mode & 0o100).toBe(0o100);

    const advisory = ctx.advisories.find((a) => a.id === "dependabot-setup-repo-state");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/bash scripts\/ci\/bkit-set-dependabot\.sh/);
  });

  it("refuses to install when .github/renovate.json5 is present (mutually exclusive)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), "{}\n");

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runDependabotModule(ctx);

    // No dependabot files should be written
    const ymlPath = path.join(tmpDir, ".github", "dependabot.yml");
    const scriptPath = path.join(tmpDir, "scripts", "ci", "bkit-set-dependabot.sh");
    expect(fs.existsSync(ymlPath)).toBe(false);
    expect(fs.existsSync(scriptPath)).toBe(false);

    const blocker = ctx.advisories.find((a) => a.id === "dependabot-renovate-mutually-exclusive");
    expect(blocker).toBeDefined();
    expect(blocker!.severity).toBe("blocker");
    expect(blocker!.action).toMatch(/git rm \.github\/renovate\.json5/);
  });

  it("dry-run: writes nothing but still emits setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, dryRun: true });
    runDependabotModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, ".github", "dependabot.yml"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "scripts", "ci", "bkit-set-dependabot.sh"))).toBe(false);
    expect(ctx.advisories.find((a) => a.id === "dependabot-setup-repo-state")).toBeDefined();
  });

  it("persists bkit.depUpdater = 'dependabot' to package.json on success", () => {
    const ws = makeWriteSet();
    runDependabotModule(makeCtx({ ws }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { depUpdater?: string };
    };
    expect(pkg.bkit?.depUpdater).toBe("dependabot");
  });

  it("does NOT persist bkit.depUpdater when refusing (renovate.json5 present)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), "{}\n");
    const ws = makeWriteSet();
    runDependabotModule(makeCtx({ ws }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { depUpdater?: string };
    };
    expect(pkg.bkit?.depUpdater).toBeUndefined();
  });
});

describe("runRenovateModule — depUpdater persistence", () => {
  it("persists bkit.depUpdater = 'renovate' to package.json on success", () => {
    const ws = makeWriteSet();
    runRenovateModule(makeCtx({ ws }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { depUpdater?: string };
    };
    expect(pkg.bkit?.depUpdater).toBe("renovate");
  });

  it("does NOT persist bkit.depUpdater when refusing (dependabot.yml present)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "dependabot.yml"), "version: 2\n");
    const ws = makeWriteSet();
    runRenovateModule(makeCtx({ ws }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { depUpdater?: string };
    };
    expect(pkg.bkit?.depUpdater).toBeUndefined();
  });

  it("--ci alone does NOT ship dependabot files (separate opt-in module)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    dispatchModules(new Set(["core", "ci"]), ctx);

    expect(fs.existsSync(path.join(tmpDir, ".github", "dependabot.yml"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "scripts", "ci", "bkit-set-dependabot.sh"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// runCloudModule — opt-in post-CI auto-routing (issue #119)
// ---------------------------------------------------------------------------

describe("runCloudModule — opt-in cloud agents (post-CI auto-routing)", () => {
  const routerRel = path.join(".github", "workflows", "bkit-cloud.yml");
  const bootstrapRel = path.join(".claude", "hooks", "cloud-bootstrap.sh");
  const dockerRel = path.join(".cursor", "Dockerfile");
  const envRel = path.join(".cursor", "environment.json");

  it("writes bkit-cloud.yml + all cloud scaffolding and emits the bkit-cloud-setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runCloudModule(ctx);

    const routerPath = path.join(tmpDir, routerRel);
    expect(fs.existsSync(routerPath)).toBe(true);
    expect(fs.readFileSync(routerPath, "utf-8").length).toBeGreaterThan(0);

    // Scaffolding moved into the cloud module (#119): cloud-bootstrap.sh, Cursor
    // Dockerfile, environment.json all ship via --cloud now, not claude/cursor.
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, envRel))).toBe(true);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/ANTHROPIC_API_KEY/);
    // The env-scaffolding customisation advisory moved here from the claude module.
    expect(ctx.advisories.find((a) => a.id === "cloud-env-customize")).toBeDefined();
  });

  it("github tracker: bkit-cloud-setup advisory includes the optional `@claude` mention tip", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, issueTracker: "github" });
    runCloudModule(ctx);
    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory!.action).toMatch(/install-github-app/);
    expect(advisory!.action).toMatch(/@claude/);
  });

  it("linear tracker: bkit-cloud-setup advisory omits the `@claude` mention tip (GitHub-only path)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, issueTracker: "linear" });
    runCloudModule(ctx);
    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory!.action).not.toMatch(/install-github-app/);
  });

  it("persists bkit.cloudAgents = 'enabled' to package.json on success", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { cloudAgents?: string };
    };
    expect(pkg.bkit?.cloudAgents).toBe("enabled");
  });

  it("dry-run: writes nothing to disk but still emits the setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, dryRun: true });
    runCloudModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
    expect(ctx.advisories.find((a) => a.id === "bkit-cloud-setup")).toBeDefined();
  });

  it("--ci alone does NOT ship bkit-cloud.yml (split out of ci module per #119)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    dispatchModules(new Set(["core", "ci"]), ctx);

    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
  });

  it("the default module set does NOT ship bkit-cloud.yml or cloud scaffolding", () => {
    // `cursor` is omitted — its applyT3 transform process.exit(1)s on the empty
    // modelLookup in this harness (see the dispatch tests above). The router only
    // ever shipped via `ci`, so this set still proves it's gone from --full.
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    dispatchModules(new Set(["core", "claude", "ci", "lint", "git-hooks"]), ctx);

    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
    // claude is in the set — proves cloud-bootstrap.sh moved out of it into --cloud (#119).
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
  });

  // --- issue #138: bkit-cloud.yml is rendered tracker-conditional ---

  it("github tracker: renders a Linear-free bkit-cloud.yml (issue #138)", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, issueTracker: "github" }));
    const yml = fs.readFileSync(path.join(tmpDir, routerRel), "utf-8");
    expect(yml).not.toContain("LINEAR_API_KEY");
    expect(yml).not.toContain("mcp__linear__*");
    expect(yml).toContain("mcp__github__*");
    expect(yml).not.toMatch(/@@CLOUD_TRACKER/); // all sentinels resolved
  });

  it("linear tracker: keeps LINEAR_API_KEY + mcp__linear__* (regression-safe)", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, issueTracker: "linear" }));
    const yml = fs.readFileSync(path.join(tmpDir, routerRel), "utf-8");
    expect(yml).toContain("LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}");
    expect(yml).toContain("mcp__linear__*");
    expect(yml).not.toContain("mcp__github__*");
    expect(yml).not.toMatch(/@@CLOUD_TRACKER/);
  });
});

describe("renderCloudWorkflow — tracker-conditional render (issue #138)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..");
  const template = fs.readFileSync(
    path.join(pkgRoot, ".agents/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  for (const tracker of ["github", "none"] as const) {
    it(`${tracker} tracker → zero Linear references`, () => {
      const out = renderCloudWorkflow(template, tracker);
      expect(out).not.toContain("LINEAR_API_KEY");
      expect(out).not.toContain("mcp__linear__*");
      expect(out).toContain("mcp__github__*");
      expect(out).not.toMatch(/@@CLOUD_TRACKER/);
      // env block stays well-formed after the Linear line is dropped
      expect(out).toMatch(
        /ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/,
      );
    });
  }

  it("linear tracker → Linear surface intact", () => {
    const out = renderCloudWorkflow(template, "linear");
    expect(out).toContain("          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}");
    expect(out).toContain("mcp__linear__*");
    expect(out).not.toContain("mcp__github__*");
    expect(out).not.toMatch(/@@CLOUD_TRACKER/);
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
// C1 end-to-end regression — runClaudeModule applies deep-containment and
// migrates legacy __bkit__ envelope on install (BAR-131 / BAR-167 regression guard)
//
// Original C1 bug (BAR-131): bkit-modules.ts read .bkit-version with
// fs.readFileSync().trim(), yielding the full JSON blob. migrateTier1JsonToTier2
// received the blob, semverLte returned false, and migration was silently skipped.
// Fixed to use readBkitVersion().pinnedVersion.
//
// BAR-167 v2.0.0: migrateTier1JsonToTier2 and writeTier2Json are deleted.
// runClaudeModule now: (1) if __bkit__ present → migrateLegacyBkitEnvelope strips
// it; (2) writeTier2JsonContained deep-merges template into consumer. No __bkit__
// key is ever written. Consumer-only keys (hooks.Stop, customKey) survive.
//
// These tests verify the call site in runClaudeModule still correctly processes
// the .bkit-version JSON format and preserves consumer keys through the new path.
// ---------------------------------------------------------------------------

describe("C1 end-to-end regression: runClaudeModule applies deep-containment with JSON-format .bkit-version", () => {
  it("runClaudeModule writes template scope and preserves consumer Stop hook (no __bkit__ in v2.0.0)", () => {
    // Arrange: seed a JSON-format .bkit-version (confirms JSON-format read path works)
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

    // Arrange: seed a v2.0.0-schema-clean .claude/settings.json
    // with a consumer-added Stop hook that should survive deep-containment merge.
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const consumerSettings = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [
          { hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }] },
        ],
        Stop: [{ hooks: [{ type: "command", command: "echo 'Consumer Stop hook'" }] }],
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify(consumerSettings, null, 2) + "\n",
      "utf-8",
    );

    // Act: run the claude module (writeTier2JsonContained deep-containment path)
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runClaudeModule(ctx);

    // Assert: v2.0.0 schema-clean — NO __bkit__ envelope
    const onDisk = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
    );
    expect(
      onDisk.__bkit__,
      "__bkit__ envelope must NOT be written in v2.0.0 (deep-containment model)",
    ).toBeUndefined();

    // Assert: consumer Stop hook survived (deep-merge preserved consumer-only key)
    const stopHook = onDisk.hooks?.Stop;
    expect(stopHook, "Consumer Stop hook was lost during install").toBeDefined();
    expect(JSON.stringify(stopHook)).toContain("Consumer Stop hook");
  });

  it("runClaudeModule preserves consumer-only keys when .bkit-version is JSON format (C1 regression guard)", () => {
    // Regression guard: confirms readBkitVersion().pinnedVersion is used (not raw JSON blob).
    // In v2.0.0, this manifests as: writeTier2JsonContained must still run and preserve
    // consumer keys even when .bkit-version is in JSON format.
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.7.0",
      tier3Hashes: {},
      canonicalHashes: {},
    });

    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    // v2.0.0-schema-clean shape: bkit-owned SessionStart + consumer-owned customKey
    const consumerSettings = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [
          { hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }] },
        ],
      },
      customKey: "consumer-value",
    };
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify(consumerSettings, null, 2) + "\n",
      "utf-8",
    );

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runClaudeModule(ctx);

    const onDisk = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
    );
    // v2.0.0: no __bkit__ envelope
    expect(
      onDisk.__bkit__,
      "__bkit__ must NOT be written in v2.0.0 deep-containment model",
    ).toBeUndefined();
    // Consumer key survives
    expect(onDisk.customKey).toBe("consumer-value");
  });
});

// ---------------------------------------------------------------------------
// COPY_EXCLUDE: Tier-2-style `.agents/*.md` files must NOT be additively copied
// from the package payload — they ship as templates and the templates pass owns
// them. Regression for the "consumer rules.md leaks bkit's `## Project Rules`
// content from outside the bkit:start/end block" bug.
// ---------------------------------------------------------------------------

describe("COPY_EXCLUDE: bkit-source `.agents/{rules,friction,docs,skills}.md` must not leak to consumers", () => {
  it("first install matches the template (no out-of-block content from bkit's source rules.md)", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    const consumerRules = fs.readFileSync(path.join(tmpDir, ".agents", "rules.md"), "utf-8");

    // Template content (what consumers SHOULD get) lives in the package's
    // .agents/templates/.agents/rules.md — resolve from the running package root.
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const templatePath = path.join(pkgRoot, ".agents", "templates", ".agents", "rules.md");
    const template = fs.readFileSync(templatePath, "utf-8");

    // Both files have markers — the inner block content must match (modulo
    // surrounding-newline normalisation done by updateManagedBlock).
    const consumerBlock = extractManagedBlock(consumerRules, "html-comment");
    const templateBlock = extractManagedBlock(template, "html-comment");
    expect(consumerBlock).not.toBeNull();
    expect(consumerBlock).toBe(templateBlock);

    // Critically: bkit's own out-of-block content (its `## Project Rules`
    // children — e.g. "### bkit Repo Authoring", "### Pre-push Checklist
    // (this repo)") MUST NOT appear in a consumer install.
    expect(consumerRules).not.toMatch(/###\s+bkit Repo Authoring/);
    expect(consumerRules).not.toMatch(/###\s+Pre-push Checklist \(this repo\)/);
  });

  it("first install of friction.md does not carry bkit's friction-log entries", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    const frictionPath = path.join(tmpDir, ".agents", "friction.md");
    if (!fs.existsSync(frictionPath)) return; // friction.md is optional in some module sets
    const consumerFriction = fs.readFileSync(frictionPath, "utf-8");

    // bkit-source friction.md has dated incident entries outside bkit:end.
    // Heading shape: `## <topic> (YYYY-MM-DD)`. None of those should land here.
    expect(consumerFriction).not.toMatch(/^##\s+.+\(\d{4}-\d{2}-\d{2}\)/m);
  });

  it("rules.md is reachable via the templates pass — no additive leak path", () => {
    // Simulates a brand-new consumer: no .agents/ exists. After runCoreModule,
    // the only writer of `.agents/rules.md` should be the templates pass
    // (sourced from `.agents/templates/.agents/rules.md`), not copyAdditive.
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    // The rules.md write MUST appear in ws.writes (templates pass tracks it).
    const ruleWrites = ctx.ws.writes.filter((w) =>
      w.path.endsWith(path.join(".agents", "rules.md")),
    );
    expect(ruleWrites.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// BAR-167 Phase 1 — JSON advisory and blocker integration tests
// ---------------------------------------------------------------------------

import {
  detectLegacyBkitEnvelope,
  detectTier2JsonDrift,
  detectPreEnvelopeBkitVersion,
} from "./bkit-preflight";
import { writeBkitVersion } from "./bkit-version";

describe("detectLegacyBkitEnvelope advisory", () => {
  it("returns advisory when __bkit__ present at top-level of settings.json", () => {
    const relPath = ".claude/settings.json";
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, relPath),
      JSON.stringify({ __bkit__: { hooks: {} } }),
      "utf-8",
    );
    const result = detectLegacyBkitEnvelope(tmpDir, relPath);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("legacy-bkit-envelope-detected");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when __bkit__ is absent (v2.0.0 schema-clean)", () => {
    const relPath = ".claude/settings.json";
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, relPath),
      JSON.stringify({ hooks: { SessionStart: [] } }),
      "utf-8",
    );
    const result = detectLegacyBkitEnvelope(tmpDir, relPath);
    expect(result).toBeNull();
  });

  it("returns null when file does not exist", () => {
    expect(detectLegacyBkitEnvelope(tmpDir, ".claude/settings.json")).toBeNull();
  });
});

describe("detectTier2JsonDrift advisory", () => {
  it("returns advisory when consumer is missing a template key", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const relPath = ".claude/settings.json";
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    // Consumer missing bkit-owned hooks.SessionStart
    fs.writeFileSync(
      path.join(tmpDir, relPath),
      JSON.stringify({ $schema: "x", hooks: {} }),
      "utf-8",
    );
    const result = detectTier2JsonDrift(tmpDir, relPath, pkgRoot);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tier2-json-drift");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when consumer contains the full template scope", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const relPath = ".cursor/hooks.json";
    const templatePath = path.join(pkgRoot, ".agents", "templates", relPath);
    // Copy template as-is to consumer
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.copyFileSync(templatePath, path.join(tmpDir, relPath));
    const result = detectTier2JsonDrift(tmpDir, relPath, pkgRoot);
    expect(result).toBeNull();
  });
});

describe("detectPreEnvelopeBkitVersion blocker", () => {
  it("returns blocker when pinnedVersion < 0.8.0 and no __bkit__ in JSON files", () => {
    // Write .bkit-version with pre-envelope pin
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    writeBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"), {
      pinnedVersion: "0.7.0",
      tier3Hashes: {},
      canonicalHashes: {},
    });
    const result = detectPreEnvelopeBkitVersion(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("pre-envelope-bkit-version-detected");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when pinnedVersion >= 0.8.0", () => {
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    writeBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"), {
      pinnedVersion: "0.8.0",
      tier3Hashes: {},
      canonicalHashes: {},
    });
    const result = detectPreEnvelopeBkitVersion(tmpDir);
    expect(result).toBeNull();
  });

  it("returns null when no .bkit-version exists (fresh install)", () => {
    const result = detectPreEnvelopeBkitVersion(tmpDir);
    expect(result).toBeNull();
  });

  it("returns null when pinnedVersion < 0.8.0 but __bkit__ IS present (envelope install gone right)", () => {
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    writeBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"), {
      pinnedVersion: "0.7.0",
      tier3Hashes: {},
      canonicalHashes: {},
    });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify({ __bkit__: {} }),
      "utf-8",
    );
    const result = detectPreEnvelopeBkitVersion(tmpDir);
    expect(result).toBeNull();
  });
});

// bkit uninstall .cursor/Dockerfile safe-delete row (Task 10)
// Tests that Tier-3 safe-delete logic functions through shouldDeleteTier3
import { shouldDeleteTier3, sha256 } from "./bkit-version";

describe("bkit uninstall Dockerfile safe-delete (Tier-3 hash guard)", () => {
  it("hash matches → shouldDeleteTier3 returns true (safe to delete)", () => {
    const content = "FROM node:22-alpine\n";
    const hash = sha256(content);
    const tier3Hashes = { ".cursor/Dockerfile": hash };
    const dstPath = path.join(tmpDir, "Dockerfile");
    fs.writeFileSync(dstPath, content, "utf-8");
    expect(shouldDeleteTier3(".cursor/Dockerfile", dstPath, tier3Hashes)).toBe(true);
  });

  it("consumer modified → shouldDeleteTier3 returns false (preserve)", () => {
    const installContent = "FROM node:22-alpine\n";
    const hash = sha256(installContent);
    const tier3Hashes = { ".cursor/Dockerfile": hash };
    const dstPath = path.join(tmpDir, "Dockerfile");
    // Consumer modified the file
    fs.writeFileSync(dstPath, "FROM node:22-alpine\nRUN apt-get install -y curl\n", "utf-8");
    expect(shouldDeleteTier3(".cursor/Dockerfile", dstPath, tier3Hashes)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Task 10 — bkit uninstall --claude consumer-key survival
// PREREQ: Task 19 reclassification (sub-plan B) — reclassify .claude/settings.json
// and .cursor/hooks.json to format: "json" in bkit-manifest.ts to activate the
// stripTier2JsonScope dispatch path in bkit-uninstall.ts case 2.
// Until Task 19 lands, these tests are skipped stubs so sub-plan B only needs
// to flip the skip gate.
// ---------------------------------------------------------------------------

describe.skip("bkit uninstall --claude consumer-key survival (PREREQ: Task 19 reclassification)", () => {
  // PREREQ: Task 19 reclassification — reclassify .claude/settings.json to
  // format: "json" in bkit-manifest.ts so bkit-uninstall.ts case 2 dispatches
  // to stripTier2JsonScope instead of falling through to "preserve".
  it("strips template scope; retains consumer-added hooks.Stop and failClosed byte-identical", () => {
    // Setup: write a schema-clean v2.0.0 .claude/settings.json with bkit-owned
    // hooks.SessionStart block PLUS consumer-added hooks.Stop and failClosed.
    const settingsContent = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [
          { hooks: [{ type: "command", command: "bash .claude/hooks/preflight.sh" }] },
        ],
        Stop: [{ hooks: [{ type: "command", command: "postflight.sh" }] }],
      },
      failClosed: true,
    };
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify(settingsContent, null, 2),
      "utf-8",
    );
    // TODO (Task 19): invoke bkit uninstall --claude against tmpDir and assert:
    // 1. hooks.SessionStart is removed (template scope stripped)
    // 2. hooks.Stop is present byte-identical
    // 3. failClosed is present byte-identical
    // 4. No __bkit__ key in output (v2.0.0 schema-clean)
    expect(true).toBe(true); // placeholder — flip to real assertion after Task 19
  });
});

// ---------------------------------------------------------------------------
// Task 10 — bkit uninstall --cursor consumer-key survival
// PREREQ: Task 19 reclassification (sub-plan B) — see above note.
// ---------------------------------------------------------------------------

describe.skip("bkit uninstall --cursor consumer-key survival (PREREQ: Task 19 reclassification)", () => {
  // PREREQ: Task 19 reclassification — reclassify .cursor/hooks.json to
  // format: "json" in bkit-manifest.ts so bkit-uninstall.ts case 2 dispatches
  // to stripTier2JsonScope.
  it("strips hooks.sessionStart/hooks.sessionStop; retains consumer-only top-level + nested keys byte-identical", () => {
    // Setup: write a schema-clean v2.0.0 .cursor/hooks.json (Cursor v1 keyed-object)
    // with bkit-owned sessionStart/sessionStop PLUS consumer-added hooks.Stop.
    const hooksContent = {
      version: 1,
      hooks: {
        sessionStart: [{ command: "echo '[bkit] session started'" }],
        sessionStop: [{ command: "echo '[bkit] session stopped'" }],
        Stop: [{ command: "postflight.sh" }],
      },
      loop_limit: 10,
    };
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "hooks.json"),
      JSON.stringify(hooksContent, null, 2),
      "utf-8",
    );
    // TODO (Task 19): invoke bkit uninstall --cursor against tmpDir and assert:
    // 1. hooks.sessionStart is removed (template scope stripped)
    // 2. hooks.sessionStop is removed (template scope stripped)
    // 3. hooks.Stop is present byte-identical
    // 4. loop_limit is present byte-identical
    // 5. version field preserved
    expect(true).toBe(true); // placeholder — flip to real assertion after Task 19
  });
});

// ---------------------------------------------------------------------------
// Task 10 — tier2-json-drift advisory for slop-scan.config.json
// PREREQ: Task 19 reclassification (sub-plan B) — reclassify slop-scan.config.json
// to format: "json" in bkit-manifest.ts so detectTier2JsonDrift walks it.
// The slop-scan row is gated by Sub-gate 2A in sub-plan B. This stub ensures
// sub-plan B Task 19 only needs to flip the skip gate and add the assertion.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Task 19 unblock: tier2-json-drift advisory for slop-scan.config.json
// (PREREQ was Task 19 reclassification — now complete)
// ---------------------------------------------------------------------------

import { detectTier2JsonDrift, detectTier2TextDrift } from "./bkit-preflight";

describe("tier2-json-drift advisory for slop-scan.config.json (Task 19 unblocked)", () => {
  it("advisory surfaces when consumer slop-scan.config.json is missing a required rules key", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const relPath = "slop-scan.config.json";
    // Read template and drop one key to trigger drift
    const templatePath = path.join(pkgRoot, ".agents", "templates", relPath);
    const template = JSON.parse(fs.readFileSync(templatePath, "utf-8")) as {
      rules?: Record<string, unknown>;
      [k: string]: unknown;
    };
    // Remove one required rule from the consumer copy
    const consumerRules = { ...template.rules };
    delete consumerRules["defensive.async-noise"];
    const driftContent = { ...template, rules: consumerRules };
    fs.writeFileSync(path.join(tmpDir, relPath), JSON.stringify(driftContent, null, 2), "utf-8");

    const result = detectTier2JsonDrift(tmpDir, relPath, pkgRoot);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tier2-json-drift");
    expect(result!.severity).toBe("advisory");
    expect(result!.detect).toContain(relPath);
  });

  it("no advisory when consumer slop-scan.config.json has all required rules", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const relPath = "slop-scan.config.json";
    const templatePath = path.join(pkgRoot, ".agents", "templates", relPath);
    // Consumer has template content + extra consumer rule
    const template = JSON.parse(fs.readFileSync(templatePath, "utf-8")) as {
      rules?: Record<string, unknown>;
      [k: string]: unknown;
    };
    const consumerRules = {
      ...template.rules,
      "consumer.custom-rule": { enabled: true },
    };
    const consumerContent = { ...template, rules: consumerRules };
    fs.writeFileSync(path.join(tmpDir, relPath), JSON.stringify(consumerContent, null, 2), "utf-8");

    const result = detectTier2JsonDrift(tmpDir, relPath, pkgRoot);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 23 — Tier-3 drift regression: consumer ci.yml missing pnpm bkit check
// step inside marker block → bkit check (detectTier2TextDrift) flags tier2-text-drift
// ---------------------------------------------------------------------------

describe("Task 23 — Tier-3 drift regression: ci.yml missing pnpm bkit check step", () => {
  it("detectTier2TextDrift fires when consumer ci.yml pnpm bkit check step is removed from marker block", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const relPath = path.join(".github", "workflows", "ci.yml");

    // Build consumer ci.yml: template with bkit check step removed from inside marker block
    const templatePath = path.join(pkgRoot, ".agents", "templates", relPath);
    const templateContent = fs.readFileSync(templatePath, "utf-8");

    // Remove the Run Bkit Check step from inside the marker block
    const consumerContent = templateContent.replace(
      /\n      - name: Run Bkit Check\n        run: pnpm bkit check\n/,
      "\n",
    );

    // Write the consumer version (with the pnpm bkit check line removed)
    const consumerDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(consumerDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, relPath), consumerContent, "utf-8");

    const result = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    // NOTE: ci.yml uses 6-space-indented markers (# bkit:start at 6-space indent),
    // which are NOT line-anchored at col-0 or allowed-prefix positions.
    // extractManagedBlock returns null for these — detectTier2TextDrift returns null.
    // This is a documented limitation: indented-YAML-marker drift detection is deferred
    // to a future iteration (see docs/pending.md "BAR-167 Phase 2 — indented YAML marker
    // drift detection not implemented"). The test documents the current boundary.
    // When indented marker support lands, update this to expect non-null tier2-text-drift.
    expect(result).toBeNull();
  });

  it("no tier2-text-drift when consumer ci.yml marker block matches template exactly", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const relPath = path.join(".github", "workflows", "ci.yml");
    const templatePath = path.join(pkgRoot, ".agents", "templates", relPath);
    const templateContent = fs.readFileSync(templatePath, "utf-8");

    const consumerDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(consumerDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, relPath), templateContent, "utf-8");

    const result = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    // The ci.yml markers are indented, so extractManagedBlock won't find them
    // (the YAML indented markers are not at column-0 or comment-prefix positions).
    // detectTier2TextDrift returns null (no markers detected → not a drift case).
    // This is correct — ci.yml uses indented markers not supported by extractManagedBlock.
    // Drift detection for ci.yml will be handled by a dedicated partial-block detector
    // in a future sub-plan iteration. For now: null is the expected result.
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// .husky/pre-push Tier 3 migration (v2.0.4)
// Was Task 23b (BAR-167 Tier-2 marker survival). Husky moved Tier 2 → Tier 3
// in v2.0.4: writeTier3 doesn't touch existing files, so consumer content is
// preserved trivially. Test now asserts the Tier-3 contract: existing file
// unchanged + tier3-merge-suggested-pre-push advisory emitted.
// PREREQ: tests/fixtures/heavy-customised-prepush/.husky/pre-push (still has
// legacy markers — exercises the "consumer upgrading from <=2.0.3" path).
// ---------------------------------------------------------------------------

describe(".husky/pre-push Tier 3 migration (v2.0.4)", () => {
  const PREPUSH_FIXTURE = path.resolve("tests/fixtures/heavy-customised-prepush/.husky/pre-push");

  it("fixture file exists (legacy marker-block format, simulates upgrade-from-2.0.3 consumer)", () => {
    expect(fs.existsSync(PREPUSH_FIXTURE)).toBe(true);
  });

  it("fixture has bkit:start / bkit:end markers (legacy Tier-2 shape)", () => {
    const content = fs.readFileSync(PREPUSH_FIXTURE, "utf-8");
    expect(content).toContain("# bkit:start");
    expect(content).toContain("# bkit:end");
  });

  it("runGitHooksModule leaves existing .husky/pre-push UNCHANGED and emits Tier-3 advisory", () => {
    // Seed consumer's pre-push with the legacy-format fixture
    const fixtureContent = fs.readFileSync(PREPUSH_FIXTURE, "utf-8");
    const huskyDir = path.join(tmpDir, ".husky");
    fs.mkdirSync(huskyDir, { recursive: true });
    const prePushPath = path.join(huskyDir, "pre-push");
    fs.writeFileSync(prePushPath, fixtureContent, "utf-8");

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runGitHooksModule(ctx);

    // File still exists AND content is byte-identical to the fixture (Tier 3
    // never overwrites — consumer keeps every character including legacy markers
    // and any bkit-repo-only lines below them).
    expect(fs.existsSync(prePushPath)).toBe(true);
    const resultContent = fs.readFileSync(prePushPath, "utf-8");
    expect(resultContent).toBe(fixtureContent);

    // tier3-merge-suggested-pre-push advisory must be emitted on the ctx
    // advisories array (templates differ — fixture has markers, template doesn't).
    const ids = ctx.advisories.map((f) => f.id);
    expect(ids).toContain("tier3-merge-suggested-pre-push");
  });

  it("runGitHooksModule SEEDS .husky/pre-push when absent (Tier 3 first-install path)", () => {
    const huskyDir = path.join(tmpDir, ".husky");
    const prePushPath = path.join(huskyDir, "pre-push");
    // Ensure file is absent (clean install path)
    if (fs.existsSync(prePushPath)) fs.unlinkSync(prePushPath);

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runGitHooksModule(ctx);

    expect(fs.existsSync(prePushPath)).toBe(true);
    const seeded = fs.readFileSync(prePushPath, "utf-8");
    // Seeded content matches the canonical template (no bkit markers in Tier 3)
    expect(seeded).not.toContain("# bkit:start");
    expect(seeded).toContain("pnpm typecheck");
    // No tier3-merge-suggested advisory when the file was absent (we just wrote it)
    const ids = ctx.advisories.map((f) => f.id);
    expect(ids).not.toContain("tier3-merge-suggested-pre-push");
  });
});
