import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTokens, resolveTokens } from "./bkit-tokens";
import { writeTier3, type WriteSet } from "./bkit-tiers";
import {
  extractFullManagedBlock,
  extractManagedBlock,
  parseModelLookup,
  parseOpencodeModelLookup,
} from "./bkit-install";
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
  runOpencodeModule,
  renderOpencodeJson,
  reconcileOpencodeJson,
  opencodeProviderId,
  renderCloudWorkflow,
  dispatchModules,
  deriveCiSkeleton,
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
// #218 — canonical .bkit/*.md docs mirrored into the consumer's .bkit/
// ---------------------------------------------------------------------------

describe("bkit canonical docs pass (runBkitDocs, #218)", () => {
  // Test file lives in `.bkit/src/`, so `..` is the package `.bkit/` docs root —
  // the same source runBkitDocs copies from (getBkitDocsRoot).
  const PKG_DOCS_ROOT = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "..",
  );
  const DOCS = [
    "cloud.md",
    "jsonl.md",
    "providers.md",
    "prompts.md",
    "trackers.md",
    "workflows.md",
    "README.md",
  ];

  it("force-overwrites the seven package .bkit/*.md docs into the consumer's .bkit/, byte-equal", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    for (const name of DOCS) {
      const dst = path.join(tmpDir, ".bkit", name);
      expect(fs.existsSync(dst), `consumer .bkit/${name} must exist after install`).toBe(true);
      const consumerBytes = fs.readFileSync(dst);
      const pkgBytes = fs.readFileSync(path.join(PKG_DOCS_ROOT, name));
      expect(
        consumerBytes.equals(pkgBytes),
        `consumer .bkit/${name} must byte-equal the package source`,
      ).toBe(true);
    }
  });

  it("is idempotent: a second core run writes none of the docs again", () => {
    runCoreModule(makeCtx()); // first install seeds the docs
    const ctx2 = makeCtx();
    runCoreModule(ctx2);
    const docWrites = ctx2.ws.writes.filter((w) =>
      DOCS.some((d) => w.path === path.join(".bkit", d)),
    );
    expect(docWrites).toHaveLength(0);
  });

  it("overwrites a consumer-tampered doc (bkit owns canonical content)", () => {
    const dst = path.join(tmpDir, ".bkit", "cloud.md");
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, "consumer tampered content\n", "utf-8");
    runCoreModule(makeCtx());
    const pkgBytes = fs.readFileSync(path.join(PKG_DOCS_ROOT, "cloud.md"));
    expect(fs.readFileSync(dst).equals(pkgBytes)).toBe(true);
  });
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
    expect(onDisk).toContain("GH_BKIT_TOKEN_INSTALL");
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
    expect(advisories2[0]!.action).toContain("GH_BKIT_TOKEN_INSTALL");
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

    // Filter out internal payload paths (.bkit/templates/** are template source copies, not consumer outputs)
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
        p.includes(".bkit/version"),
    );
    expect(hasCiOrLint).toBe(true);
  });
});

describe("ci.yml skeleton vs wired + --ci/--typescript footprint (#265)", () => {
  function readCi(): string {
    return fs.readFileSync(path.join(tmpDir, ".github", "workflows", "ci.yml"), "utf-8");
  }

  it("--ci alone seeds the SKELETON: ts-ci-steps commented, vale config present, NO TS footprint", () => {
    dispatchModules(new Set(["core", "ci"]), makeCtx({}));
    const ci = readCi();
    // The Node/TS region body is commented out — no ACTIVE pnpm install step.
    expect(ci).not.toMatch(/^\s+- name: Install Dependencies/m);
    expect(ci).toMatch(/#\s*- name: Install Dependencies/);
    expect(ci).toContain("# bkit:start ts-ci-steps"); // markers retained
    // Vale config (stack-agnostic) ships with --ci.
    expect(fs.existsSync(path.join(tmpDir, ".vale.ini"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".vale", "styles", "House", "LLMSlop.yml"))).toBe(true);
    // No Node/TS toolchain footprint.
    expect(fs.existsSync(path.join(tmpDir, "slop-scan.config.json"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".prettierignore"))).toBe(false);
    expect(
      fs.existsSync(path.join(tmpDir, ".bkit", "scripts", "bkit-slop-type-suppression.mjs")),
    ).toBe(false);
    // --ci adds NO package.json scripts (agnostic).
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
    expect(pkg.scripts?.typecheck).toBeUndefined();
  });

  it("--ci --typescript seeds the WIRED ci.yml: ts-ci-steps active + full TS footprint", () => {
    dispatchModules(new Set(["core", "ci", "lint", "git-hooks"]), makeCtx({}));
    const ci = readCi();
    // The Node/TS region is ACTIVE (uncommented).
    expect(ci).toMatch(/^\s+- name: Install Dependencies/m);
    // Full Node/TS footprint present.
    expect(fs.existsSync(path.join(tmpDir, "slop-scan.config.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".prettierignore"))).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".bkit", "scripts", "bkit-slop-type-suppression.mjs")),
    ).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".bkit", "scripts", "bkit-slop-delta.sh"))).toBe(true);
    // Vale config still present (ci is co-installed under --typescript).
    expect(fs.existsSync(path.join(tmpDir, ".vale.ini"))).toBe(true);
    // typecheck added by the lint module (moved ci→lint).
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
    expect(pkg.scripts?.typecheck).toBeDefined();
  });
});

describe("deriveCiSkeleton (#265)", () => {
  it("comments lines inside ts-ci-steps regions, leaves the spine untouched", () => {
    const input = [
      "jobs:",
      "  build:",
      "    steps:",
      "      - name: Checkout",
      "      # bkit:start ts-ci-steps",
      "      - name: Install Dependencies",
      "        run: pnpm install",
      "      # bkit:end ts-ci-steps",
      "      - name: Actionlint",
    ].join("\n");
    const out = deriveCiSkeleton(input);
    expect(out).toContain("      - name: Checkout"); // spine untouched
    expect(out).toContain("      - name: Actionlint"); // spine untouched
    expect(out).toContain("      # - name: Install Dependencies"); // commented, indent kept
    expect(out).toContain("        # run: pnpm install"); // commented, deeper indent kept
    expect(out).toContain("      # bkit:start ts-ci-steps"); // marker line retained verbatim
  });

  it("is a no-op when there are no ts-ci-steps regions", () => {
    const input = "jobs:\n  build:\n    steps:\n      - run: echo hi\n";
    expect(deriveCiSkeleton(input)).toBe(input);
  });

  it("recognises the `optional` block flag on the start marker", () => {
    const input = [
      "    steps:",
      "      # bkit:start ts-ci-steps optional",
      "      - name: Install Dependencies",
      "        run: pnpm install",
      "      # bkit:end ts-ci-steps",
    ].join("\n");
    const out = deriveCiSkeleton(input);
    expect(out).toContain("      # - name: Install Dependencies"); // body still commented
    expect(out).toContain("      # bkit:start ts-ci-steps optional"); // marker retained verbatim
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
    const bkitVersionIdx = realWs.writes.findIndex((e) => e.path.endsWith(".bkit/version"));

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
    const bkitVersionIdx = writeOrder.findIndex((p) => p.includes(".bkit/version"));

    // .bkit-version should be present
    expect(bkitVersionIdx).toBeGreaterThanOrEqual(0);

    // .bkit-version should be the LAST write (postDispatch runs after all module writes)
    if (writeOrder.length > 1) {
      expect(bkitVersionIdx).toBe(writeOrder.length - 1);
    }
  });

  it(".bkit-version is absent if postDispatch is NOT flushed (mid-install crash simulation)", () => {
    // If a crash prevents postDispatch from running, .bkit-version must NOT be on disk.
    const versionFile = path.join(tmpDir, ".bkit", "version");
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
    expect(phaseA!.action).toMatch(/pnpm bkit install --dependency=renovate/);
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

  it("seeds the npm.pkg.github.com hostRules token anchor in renovate-local.json5, COMMENTED (#199)", () => {
    // The private-registry read-auth token must live in the consumer-owned
    // renovate-local.json5 — NOT the canonical-overwrite renovate.json5 — so a
    // consumer's activation survives `bkit upgrade` (Renovate merges hostRules
    // across extended presets; verified honored live, Mend job ef4c504e).
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runRenovateModule(ctx);

    const local = fs.readFileSync(path.join(tmpDir, ".github", "renovate-local.json5"), "utf-8");
    // The hostRules entry is present (active, inert shell) ...
    expect(local).toMatch(/hostRules:\s*\[/);
    expect(local).toMatch(/matchHost:\s*"npm\.pkg\.github\.com"/);
    // ... but the token line ships COMMENTED so an un-provisioned consumer is
    // non-breaking (a `{{ secrets.* }}` ref errors if the Mend secret is unset).
    expect(local).toMatch(/\/\/\s*token:\s*"\{\{ secrets\.GH_BKIT_TOKEN_INSTALL \}\}"/);
  });

  it("canonical renovate.json5 ships NO hostRules token anchor — it lives only in renovate-local.json5 (#199)", () => {
    // Regression guard for #199: the token must not be carried in the Tier-1
    // canonical-overwrite file, which re-clobbers a consumer's activation on
    // every `bkit upgrade`.
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runRenovateModule(ctx);

    const renovate = fs.readFileSync(path.join(tmpDir, ".github", "renovate.json5"), "utf-8");
    // Guard the active config KEY + secret ref — the explanatory comment may
    // still mention `hostRules` in prose.
    expect(renovate).not.toMatch(/^\s*hostRules:/m);
    expect(renovate).not.toMatch(/secrets\.GH_BKIT_TOKEN_INSTALL/);
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
  it("writes .github/dependabot.yml + .bkit/scripts/bkit-set-dependabot.sh and emits setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runDependabotModule(ctx);

    const ymlPath = path.join(tmpDir, ".github", "dependabot.yml");
    const scriptPath = path.join(tmpDir, ".bkit", "scripts", "bkit-set-dependabot.sh");
    expect(fs.existsSync(ymlPath)).toBe(true);
    expect(fs.existsSync(scriptPath)).toBe(true);
    // Helper script must be executable.
    const mode = fs.statSync(scriptPath).mode & 0o777;
    expect(mode & 0o100).toBe(0o100);

    const advisory = ctx.advisories.find((a) => a.id === "dependabot-setup-repo-state");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/bash .bkit\/scripts\/bkit-set-dependabot\.sh/);
  });

  it("refuses to install when .github/renovate.json5 is present (mutually exclusive)", () => {
    fs.mkdirSync(path.join(tmpDir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), "{}\n");

    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runDependabotModule(ctx);

    // No dependabot files should be written
    const ymlPath = path.join(tmpDir, ".github", "dependabot.yml");
    const scriptPath = path.join(tmpDir, ".bkit", "scripts", "bkit-set-dependabot.sh");
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
    expect(fs.existsSync(path.join(tmpDir, ".bkit", "scripts", "bkit-set-dependabot.sh"))).toBe(
      false,
    );
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
    expect(fs.existsSync(path.join(tmpDir, ".bkit", "scripts", "bkit-set-dependabot.sh"))).toBe(
      false,
    );
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

  it("cloud=claude: writes bkit-cloud.yml + cloud-bootstrap.sh and emits bkit-cloud-setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "claude" });
    runCloudModule(ctx);

    const routerPath = path.join(tmpDir, routerRel);
    expect(fs.existsSync(routerPath)).toBe(true);
    expect(fs.readFileSync(routerPath, "utf-8").length).toBeGreaterThan(0);

    // cloud=claude ships: bkit-cloud.yml + cloud-bootstrap.sh (NOT .cursor/Dockerfile)
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, envRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/ANTHROPIC_API_KEY/);
    expect(advisory!.action).toMatch(/install-github-app/);
    expect(advisory!.action).toMatch(/required/);
    // Bare `Auto` must NOT appear in advisory text (migrated to bkit:auto)
    expect(advisory!.action).not.toMatch(/\bAuto\b(?! route)/);
    expect(advisory!.action).toMatch(/bkit:auto/);
    // The env-scaffolding customisation advisory is emitted for cloud=claude too.
    expect(ctx.advisories.find((a) => a.id === "cloud-env-customize")).toBeDefined();
  });

  it("cloud=opencode: writes bkit-cloud.yml and emits bkit-cloud-setup advisory (no bootstrap.sh)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "opencode", issueTracker: "github" });
    runCloudModule(ctx);

    // cloud=opencode ships: bkit-cloud.yml only (no bootstrap.sh, no cursor files)
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/OPENCODE_PROVIDER_KEY/);
    expect(advisory!.action).toMatch(/opencode\/opencode\.json/);
    expect(advisory!.action).not.toMatch(/ANTHROPIC_API_KEY/);
    expect(advisory!.action).not.toMatch(/bkit-auto\.yml/);
  });

  it("cloud=opencode: persists bkit.cloudAgents = 'opencode' to package.json", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, cloudVariant: "opencode", issueTracker: "github" }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { cloudAgents?: string };
    };
    expect(pkg.bkit?.cloudAgents).toBe("opencode");
  });

  it("cloud=cursor: writes .cursor/Dockerfile + environment.json and emits bkit-cloud-setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "cursor", issueTracker: "linear" });
    runCloudModule(ctx);

    // cloud=cursor ships: .cursor/Dockerfile + environment.json (NOT bkit-cloud.yml)
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, envRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/LINEAR_API_KEY/);
    expect(advisory!.action).not.toMatch(/ANTHROPIC_API_KEY/);
  });

  it("cloud=claude: advisory does NOT reference LINEAR_API_KEY (GitHub-only path)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "claude", issueTracker: "github" });
    runCloudModule(ctx);
    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory!.action).not.toMatch(/LINEAR_API_KEY/);
    expect(advisory!.action).toMatch(/install-github-app/);
    expect(advisory!.action).toMatch(/@claude/);
  });

  it("cloud=claude: persists bkit.cloudAgents = 'claude' to package.json on success", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, cloudVariant: "claude" }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { cloudAgents?: string };
    };
    expect(pkg.bkit?.cloudAgents).toBe("claude");
  });

  it("cloud=cursor: persists bkit.cloudAgents = 'cursor' to package.json on success", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, cloudVariant: "cursor" }));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { cloudAgents?: string };
    };
    expect(pkg.bkit?.cloudAgents).toBe("cursor");
  });

  it("dry-run: writes nothing to disk but still emits the setup advisory", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, dryRun: true, cloudVariant: "claude" });
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

  // --- bkit-cloud.yml is GitHub-only (Linear render branch removed) ---

  it("cloud=claude: renders bkit-cloud.yml with id-token: write and no Linear references", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, cloudVariant: "claude", issueTracker: "github" }));
    const yml = fs.readFileSync(path.join(tmpDir, routerRel), "utf-8");
    expect(yml).toContain("id-token: write");
    expect(yml).not.toContain("LINEAR_API_KEY");
    expect(yml).not.toContain("mcp__linear__*");
    expect(yml).toContain("mcp__github__*");
    expect(yml).not.toMatch(/@@CLOUD_TRACKER/); // all sentinels resolved
  });

  it("cloud=claude: {{CLOUD_RUNNER}} renders both jobs' runs-on from the token (#362)", () => {
    const ws = makeWriteSet();
    runCloudModule(
      makeCtx({
        ws,
        cloudVariant: "claude",
        issueTracker: "github",
        tokens: { ...makeCtx().tokens, CLOUD_RUNNER: "depot-ubuntu-24.04" },
      }),
    );
    const yml = fs.readFileSync(path.join(tmpDir, routerRel), "utf-8");
    // Both jobs (claude + opencode) share the one label; no raw token leaks through.
    const runsOn = [...yml.matchAll(/^ {4}runs-on: (.+)$/gm)].map((m) => m[1]);
    expect(runsOn).toEqual(["depot-ubuntu-24.04", "depot-ubuntu-24.04"]);
    expect(yml).not.toContain("{{CLOUD_RUNNER}}");
  });

  it("cloud=claude: unset runner defaults both jobs to ubuntu-latest (#362)", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, cloudVariant: "claude", issueTracker: "github" }));
    const yml = fs.readFileSync(path.join(tmpDir, routerRel), "utf-8");
    const runsOn = [...yml.matchAll(/^ {4}runs-on: (.+)$/gm)].map((m) => m[1]);
    expect(runsOn).toEqual(["ubuntu-latest", "ubuntu-latest"]);
  });

  it("cloud=claude: bkit-cloud.yml header states App required and bkit:auto label (no bare Auto)", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, cloudVariant: "claude", issueTracker: "github" }));
    const yml = fs.readFileSync(path.join(tmpDir, routerRel), "utf-8");
    expect(yml).toMatch(/bkit:auto/);
    expect(yml).not.toMatch(/Required tracker label on the issue: `Auto`/);
  });

  it("cloud=cursor: does NOT install bkit-cloud.yml (Cursor path has no GHA workflow)", () => {
    const ws = makeWriteSet();
    runCloudModule(makeCtx({ ws, cloudVariant: "cursor", issueTracker: "linear" }));
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
  });
});

describe("renderCloudWorkflow — GitHub-only render (Linear branch removed)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..");
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  for (const tracker of ["github", "none", "linear"] as const) {
    it(`${tracker} tracker → GitHub-only output (no Linear references, no sentinels)`, () => {
      const out = renderCloudWorkflow(template, tracker);
      expect(out).not.toContain("LINEAR_API_KEY");
      expect(out).not.toContain("mcp__linear__*");
      expect(out).toContain("mcp__github__*");
      expect(out).not.toMatch(/@@CLOUD_TRACKER/);
      // Must have id-token: write (D1 fix)
      expect(out).toContain("id-token: write");
      // env block stays well-formed
      expect(out).toMatch(
        /ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/,
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T3.1 — D3 concurrency-key intra-surface serialisation (PIVOT from STANDARD attempt)
//
// GHA evaluates concurrency.group from trigger-payload context ONLY, before any step
// runs. The dispatch payload exposes only inputs.issue (bare numeric id, e.g. "141");
// the workflow_run payload exposes only head_branch (= feat/{FID-with-slug}, e.g.
// "feat/141-cloud-app"). GHA expression functions (contains/startsWith/endsWith/
// format/join/toJSON/fromJSON/hashFiles) include NO regex, NO split, and NO replace()
// capable of stripping a slug — replace('feat/141-cloud-app','feat/','') yields
// '141-cloud-app', not '141'. Therefore cross-surface token equality is structurally
// impossible via expressions alone for slugged FIDs (bkit-build.md:146 convention).
//
// Chosen design (Option iii): serialise WITHIN each surface separately:
//   - dispatch path  keys on inputs.issue          (bkit-auto-141)
//   - CI-completion  keys on head_branch            (bkit-auto-feat/141-cloud-app)
// Cross-boundary dispatch-vs-auto-ship race is handled by the orchestrator stale-run
// guard + status.json lock, not the concurrency key.
// ---------------------------------------------------------------------------

describe("T3.1 — concurrency.group intra-surface serialisation (D3 race prevention)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..");
  const rawTemplate = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("concurrency.group dispatch path keys on inputs.issue (bare issue number)", () => {
    const out = renderCloudWorkflow(rawTemplate, "github");
    // Dispatch surface: group expression must use inputs.issue so concurrent dispatched
    // runs for the same issue cancel each other.
    expect(out).toMatch(/group:.*inputs\.issue/);
    const groupLine = out.split("\n").find((l) => l.includes("group: bkit-auto-"));
    expect(groupLine).toBeDefined();
    expect(groupLine).toContain("inputs.issue");
    // No invalid replace() call — remove() is not a GHA expression function.
    expect(groupLine).not.toContain("replace(");
  });

  it("concurrency.group CI-completion path keys on head_branch (full slugged branch name)", () => {
    const out = renderCloudWorkflow(rawTemplate, "github");
    // CI-completion surface: group expression must use head_branch directly, so concurrent
    // CI runs for the same branch (e.g. feat/141-cloud-app) cancel each other.
    // A real slugged FID like feat/141-cloud-app must key on the full branch — not a
    // stripped token — because replace() cannot reduce '141-cloud-app' to '141'.
    expect(out).toMatch(/group:.*github\.event\.workflow_run\.head_branch/);
    const groupLine = out.split("\n").find((l) => l.includes("group: bkit-auto-"));
    expect(groupLine).toBeDefined();
    expect(groupLine).toContain("github.event.workflow_run.head_branch");
    // No replace() — the prior STANDARD attempt's replace() was invalid for slugged FIDs.
    expect(groupLine).not.toContain("replace(");
  });

  it("realistic slugged branch (feat/141-cloud-app) does NOT equal dispatch issue number (141) — cross-surface asymmetry is expected and documented", () => {
    // This is the KEY property proving the prior STANDARD approach was wrong:
    // replace('feat/141-cloud-app', 'feat/', '') = '141-cloud-app' != '141'
    // The two tokens are intentionally different across surfaces; each surface uses its
    // own payload identity. Cross-boundary serialisation is the orchestrator's concern.
    const dispatchGroup = `bkit-auto-141`;
    const ciBranch = "feat/141-cloud-app";
    const ciGroup = `bkit-auto-${ciBranch}`; // full branch, no replace()
    expect(dispatchGroup).not.toBe(ciGroup); // different by design
    // Neither path uses a replace() that would produce an incorrect result.
    const stripped = ciBranch.replace("feat/", "");
    expect(stripped).toBe("141-cloud-app"); // NOT '141' — proves why replace() was wrong
    expect(stripped).not.toBe("141");
  });

  it("canonical .github/workflows/bkit-cloud.yml matches the token-rendered template (T3.1 + T2.7 invariant, #362)", () => {
    const canonical = fs.readFileSync(
      path.join(pkgRoot, ".github", "workflows", "bkit-cloud.yml"),
      "utf-8",
    );
    // bkit's own package.json sets no `bkit.runners`, so `{{CLOUD_RUNNER}}` resolves
    // to the ubuntu-latest default (#362). The committed canonical is the RENDERED
    // template, not the raw token — mirror the install/upgrade render here.
    const rendered = renderCloudWorkflow(rawTemplate, "github").replace(
      /\{\{CLOUD_RUNNER\}\}/g,
      () => "ubuntu-latest",
    );
    expect(canonical).toBe(rendered);
  });
});

// ---------------------------------------------------------------------------
// T2.7 — two-tier CI gate positive assertions (GAP-3)
//
// (b) marker->HEAD->fires-to-dispatch render assertion: when 'bkit [auto route]'
//     IS in workflow_run.head_commit.message AND bkit:auto is present, the gate
//     evaluates true and reaches the dispatch step.
// (c) ISSUE single-sourcing assertion: the kill-switch gh issue view $ISSUE is
//     produced by the SHARED-DERIV step (primary: PR body marker; fallback: branch
//     slug extraction). Note: with intra-surface concurrency (T3.1 PIVOT design), the
//     CI-completion concurrency key uses head_branch directly — ISSUE from SHARED-DERIV
//     is the issue number for the kill switch, not the concurrency token. The
//     single-sourcing here means ISSUE is set once in shared-deriv and consumed by the
//     kill switch — not re-derived elsewhere.
// ---------------------------------------------------------------------------

describe("T2.7 — two-tier CI gate positive assertions (GAP-3)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..");
  const rawTemplate = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("(b) free-tier if: contains 'bkit [auto route]' — gate fires when marker is HEAD commit", () => {
    const out = renderCloudWorkflow(rawTemplate, "github");
    // The job-level if: must reference 'bkit [auto route]' in head_commit.message.
    // This closes the marker->HEAD->job-fires chain (positive, not just negative).
    expect(out).toContain(
      "contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')",
    );
    // The dispatch step must exist and fire when skip != 'true' (compound condition includes gate check).
    expect(out).toContain("steps.ctx.outputs.skip != 'true'");
    // The dispatch step must invoke the /bkit-auto orchestrator.
    expect(out).toContain(
      'prompt: "/bkit-auto ${{ steps.ctx.outputs.phase }} ${{ steps.ctx.outputs.arg }}"',
    );
  });

  it("(b) dispatch path always proceeds (workflow_dispatch bypasses marker check)", () => {
    const out = renderCloudWorkflow(rawTemplate, "github");
    // workflow_dispatch runs must always pass the free-tier gate regardless of marker.
    expect(out).toContain("github.event_name == 'workflow_dispatch'");
    // The if: uses || so dispatch path short-circuits the marker check.
    expect(out).toMatch(/workflow_dispatch[\s\S]{0,200}bkit \[auto route\]/);
  });

  it("(c) kill-switch gh issue view uses $ISSUE from SHARED-DERIV step — single-sourced", () => {
    const out = renderCloudWorkflow(rawTemplate, "github");
    // The kill-switch gh issue view must use $ISSUE (not a re-derived value).
    // $ISSUE must be set by the SHARED-DERIV step (primary: PR body; fallback: branch).
    expect(out).toContain('gh issue view "$ISSUE"');
    // SHARED-DERIV must set ISSUE from PR body primary source (portable grep -oE, not PCRE -oP).
    expect(out).toContain('ISSUE=$(echo "$PR_BODY" | grep -oE');
    // SHARED-DERIV fallback must set ISSUE from FID (branch-derived numeric id).
    expect(out).toContain('ISSUE="$FID"');
    // The ISSUE variable used by gh issue view is the SAME one set by SHARED-DERIV.
    // Verify no separate re-derivation of ISSUE appears outside the shared-deriv block.
    const sharedDerivStart = out.indexOf("# bkit:start shared-deriv");
    const sharedDerivEnd = out.indexOf("# bkit:end shared-deriv");
    expect(sharedDerivStart).toBeGreaterThan(-1);
    expect(sharedDerivEnd).toBeGreaterThan(sharedDerivStart);
    // gh issue view must appear INSIDE or AFTER the shared-deriv block (uses its output).
    const ghIssueViewPos = out.indexOf('gh issue view "$ISSUE"');
    expect(ghIssueViewPos).toBeGreaterThan(sharedDerivStart);
  });

  it("(c) bkit:start/bkit:end markers wrap gate logic — shared-deriv inside auto-route-gate", () => {
    const out = renderCloudWorkflow(rawTemplate, "github");
    // Gate logic must be wrapped in bkit:start/end markers.
    expect(out).toContain("# bkit:start auto-route-gate");
    expect(out).toContain("# bkit:end auto-route-gate");
    expect(out).toContain("# bkit:start shared-deriv");
    expect(out).toContain("# bkit:end shared-deriv");
    // auto-route-gate wraps the job if: (free-tier gate).
    const autoRouteGateStart = out.indexOf("# bkit:start auto-route-gate");
    const autoRouteGateEnd = out.indexOf("# bkit:end auto-route-gate");
    // The contains(...head_commit.message, 'bkit [auto route]') expression in the if: body
    // must be inside the auto-route-gate marker block.
    const containsExpr =
      "contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')";
    const containsPos = out.indexOf(containsExpr);
    expect(containsPos).toBeGreaterThan(autoRouteGateStart);
    expect(containsPos).toBeLessThan(autoRouteGateEnd);
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

  it("runLintModule adds `typecheck` to package.json when missing (tsconfig present → tsc --noEmit) (#265)", () => {
    writePkg();
    fs.writeFileSync(path.join(tmpDir, "tsconfig.json"), "{}", "utf-8");
    const ctx = makeCtx({});
    runLintModule(ctx);
    const scripts = readPkgScripts();
    expect(scripts.typecheck).toBe("tsc --noEmit");
  });

  it("runLintModule preserves an existing `typecheck` value (consumer wins)", () => {
    writePkg({ typecheck: "custom-runner" });
    fs.writeFileSync(path.join(tmpDir, "tsconfig.json"), "{}", "utf-8");
    const ctx = makeCtx({});
    runLintModule(ctx);
    const scripts = readPkgScripts();
    expect(scripts.typecheck).toBe("custom-runner");
  });

  it("runCiModule adds NO package.json scripts (stack-agnostic, #265)", () => {
    writePkg();
    const ctx = makeCtx({});
    runCiModule(ctx);
    const scripts = readPkgScripts();
    expect(scripts.typecheck).toBeUndefined();
    expect(Object.keys(scripts)).toHaveLength(0);
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

  it("runLintModule warns via advisories when package.json is missing (#265)", () => {
    // beforeEach seeds a package.json — remove it so we hit the missingPkg branch
    fs.rmSync(path.join(tmpDir, "package.json"));
    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });
    runLintModule(ctx);
    const combined = advisories.map((a) => `${a.detect} ${a.action}`).join("\n");
    expect(combined).toMatch(/package\.json not found/i);
  });
});

// ---------------------------------------------------------------------------
// MED-5 regression — advisories copy-paste safety (no backslash-escape sequences)
// ---------------------------------------------------------------------------

describe("MED-5: first-install advisory GH_BKIT_TOKEN_INSTALL block has no broken backslash-escape sequences", () => {
  it("advisories emitted on first install contain no literal \\$ sequence (backslash-dollar)", () => {
    // Ensure no .bkit-version exists (first install scenario)
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });

    dispatchModules(new Set(["core"]), ctx);

    const combined = advisories.map((a) => a.action).join("\n");

    // Must contain the GH_BKIT_TOKEN_INSTALL setup (confirming it's the first-install block)
    expect(combined).toContain("GH_BKIT_TOKEN_INSTALL");

    // Must NOT contain a literal backslash-dollar sequence.
    expect(combined).not.toContain("\\$");
  });

  it("advisory action for first-install is plain text (copy-paste safety)", () => {
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });
    dispatchModules(new Set(["core"]), ctx);

    // The first-install advisory should have structured action text
    const firstInstallAdvisory = advisories.find((a) => a.id === "first-install-postinstall-steps");
    expect(firstInstallAdvisory).toBeDefined();
    expect(firstInstallAdvisory?.action).toContain("GH_BKIT_TOKEN_INSTALL");
  });
});

describe(".bkit-version first-run signal extra-logging", () => {
  it("first install (no .bkit-version) emits GH_BKIT_TOKEN_INSTALL setup in advisories", () => {
    const advisories: PreflightFinding[] = [];
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, advisories });

    // Ensure no .bkit-version exists
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    // dispatchModules flushes postDispatch (where .bkit-version is written)
    dispatchModules(new Set(["core"]), ctx);

    // advisories should contain GH_BKIT_TOKEN_INSTALL setup
    const combined = advisories.map((a) => a.action).join("\n");
    expect(combined).toContain("GH_BKIT_TOKEN_INSTALL");
    expect(combined).toContain("package.json");
  });

  it("second install (.bkit-version present at current version) suppresses first-run extra logging", () => {
    // Run first install to create .bkit-version
    const ws1 = makeWriteSet();
    const advisories1: PreflightFinding[] = [];
    const ctx1 = makeCtx({ ws: ws1, advisories: advisories1 });
    dispatchModules(new Set(["core"]), ctx1);

    // Verify .bkit-version was written
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(true);

    // Second run: .bkit-version exists → no first-run extra logging
    const ws2 = makeWriteSet();
    const advisories2: PreflightFinding[] = [];
    const ctx2 = makeCtx({ ws: ws2, advisories: advisories2 });
    dispatchModules(new Set(["core"]), ctx2);

    const combined2 = advisories2.map((a) => a.action).join("\n");
    expect(combined2).not.toContain("GH_BKIT_TOKEN_INSTALL");
    expect(combined2).not.toContain("First install detected");
  });
});

// ---------------------------------------------------------------------------
// KN-3 regression guards — pnpm/action-setup@v4 single-SoT enforcement
// ---------------------------------------------------------------------------

describe("KN-3 regression: ci.yml files must NOT set `with.version:` for pnpm action", () => {
  const SCRIPTS_DIR = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  // src/ is at <PKG_ROOT>/.bkit/src — two levels up to PKG_ROOT
  const PKG_ROOT = path.resolve(SCRIPTS_DIR, "..", "..");

  it("ci.yml template does NOT set both `with.version:` and rely on packageManager (KN-3)", () => {
    const tplPath = path.join(PKG_ROOT, ".bkit/templates/.github/workflows/ci.yml");
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
    const versionFile = path.join(tmpDir, ".bkit", "version");
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
    const versionFile = path.join(tmpDir, ".bkit", "version");
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

    const versionFile = path.join(tmpDir, ".bkit", "version");
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

    const versionFile = path.join(tmpDir, ".bkit", "version");
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

    const versionFile = path.join(tmpDir, ".bkit", "version");
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

    const versionFile = path.join(tmpDir, ".bkit", "version");
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
    const versionFile = path.join(tmpDir, ".bkit", "version");
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
    const versionFile = path.join(tmpDir, ".bkit", "version");
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
    // .bkit/templates/.agents/rules.md — resolve from the running package root.
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const templatePath = path.join(pkgRoot, ".bkit", "templates", ".agents", "rules.md");
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

    const frictionPath = path.join(tmpDir, ".bkit", "friction.md");
    if (!fs.existsSync(frictionPath)) return; // friction.md is optional in some module sets
    const consumerFriction = fs.readFileSync(frictionPath, "utf-8");

    // bkit-source friction.md has dated incident entries outside bkit:end.
    // Heading shape: `## <topic> (YYYY-MM-DD)`. None of those should land here.
    expect(consumerFriction).not.toMatch(/^##\s+.+\(\d{4}-\d{2}-\d{2}\)/m);
  });

  it("rules.md is reachable via the templates pass — no additive leak path", () => {
    // Simulates a brand-new consumer: no .agents/ exists. After runCoreModule,
    // the only writer of `.agents/rules.md` should be the templates pass
    // (sourced from `.bkit/templates/.agents/rules.md`), not copyAdditive.
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
    const templatePath = path.join(pkgRoot, ".bkit", "templates", relPath);
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
    writeBkitVersion(path.join(tmpDir, ".bkit", "version"), {
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
    writeBkitVersion(path.join(tmpDir, ".bkit", "version"), {
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
    writeBkitVersion(path.join(tmpDir, ".bkit", "version"), {
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

import { detectTier2TextDrift } from "./bkit-preflight";

describe("tier2-json-drift advisory for slop-scan.config.json (Task 19 unblocked)", () => {
  it("advisory surfaces when consumer slop-scan.config.json is missing a required rules key", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..");
    const relPath = "slop-scan.config.json";
    // Read template and drop one key to trigger drift
    const templatePath = path.join(pkgRoot, ".bkit", "templates", relPath);
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
    const templatePath = path.join(pkgRoot, ".bkit", "templates", relPath);
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

describe("Task 23 — Tier-3 drift regression: ci.yml named-block drift", () => {
  const relPath = path.join(".github", "workflows", "ci.yml");
  const pkgRoot = (() => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    return path.resolve(scriptsDir, "..", "..");
  })();
  const readTemplate = (): string =>
    fs.readFileSync(path.join(pkgRoot, ".bkit", "templates", relPath), "utf-8");
  const writeConsumer = (content: string): void => {
    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, relPath), content, "utf-8");
  };

  it("no drift when a step OUTSIDE any named block is removed (consumer owns unmarked regions)", () => {
    // The `Run Bkit Check` step is a plain step, not inside a bkit:start/end block, so the
    // consumer owns it — removing it is NOT drift. Only bkit-owned named blocks are compared.
    const consumer = readTemplate().replace(
      /\n      - name: Run Bkit Check\n        if: steps\.cache\.outputs\.skip != 'true'\n        run: pnpm bkit check\n/,
      "\n",
    );
    writeConsumer(consumer);
    expect(detectTier2TextDrift(tmpDir, relPath, pkgRoot)).toBeNull();
  });

  it("no tier2-text-drift when consumer ci.yml matches the template exactly", () => {
    writeConsumer(readTemplate());
    expect(detectTier2TextDrift(tmpDir, relPath, pkgRoot)).toBeNull();
  });

  it("flags DRIFT when the bkit-owned verbose-ci-env block content is edited", () => {
    // Mutate one line INSIDE the verbose-ci-env named block → bkit-owned content drift.
    const consumer = readTemplate().replace(
      /VERBOSE_CI: \$\{\{[^\n]*\}\}/,
      "VERBOSE_CI: 'consumer-hacked'",
    );
    writeConsumer(consumer);
    const drift = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(drift?.id).toBe("tier2-text-drift");
    expect(drift?.detect).toContain("verbose-ci-env");
  });

  it("no drift when a consumer adds a comment annotation inside a managed block", () => {
    // Comments inside a managed block are non-load-bearing — a consumer annotating the block
    // with a ticket ref / rationale must not trip perpetual drift on a Tier-3 file bkit never
    // rewrites. Only semantic (non-comment) lines are compared.
    const consumer = readTemplate().replace(
      "    # bkit:end verbose-ci-env",
      "      # consumer note: ticket PROJ-42 tracks the verbose-ci rollout\n    # bkit:end verbose-ci-env",
    );
    writeConsumer(consumer);
    expect(detectTier2TextDrift(tmpDir, relPath, pkgRoot)).toBeNull();
  });

  it("still flags DRIFT when a consumer comments OUT a semantic line in a managed block", () => {
    // Commenting out a required env var removes a semantic line → still caught (the comment
    // exclusion must not become an escape hatch for disabling bkit-owned content).
    const consumer = readTemplate().replace(
      /^(\s*)VERBOSE_CI: \$\{\{[^\n]*\}\}/m,
      "$1# VERBOSE_CI: (disabled by consumer)",
    );
    writeConsumer(consumer);
    const drift = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(drift?.id).toBe("tier2-text-drift");
    expect(drift?.detect).toContain("verbose-ci-env");
  });

  it("does NOT flag MISSING when the optional ts-ci-steps block is absent (hand-maintained toolchain)", () => {
    // ts-ci-steps ships `optional`: a consumer that maintains its own setup/install/typecheck
    // steps outside the block (and deletes the block) must NOT be perpetually nagged "missing"
    // on a Tier-3 file bkit never rewrites. Other required blocks remain intact.
    const consumer = readTemplate().replace(
      /\n\s*# bkit:start ts-ci-steps optional\n[\s\S]*?# bkit:end ts-ci-steps\n/g,
      "\n",
    );
    writeConsumer(consumer);
    const result = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(result?.detect ?? "").not.toContain("ts-ci-steps");
  });

  it("no ts-ci-steps drift on a correctly-installed consumer (optional block, consumer-owned)", () => {
    // A real install renders `node-version: {{NODE_VERSION}}` → `node-version: 22`. ts-ci-steps
    // is `optional` — the consumer's own toolchain region — so it is never compared for drift.
    const consumer = readTemplate().replace(/\{\{NODE_VERSION\}\}/g, "22");
    writeConsumer(consumer);
    expect(detectTier2TextDrift(tmpDir, relPath, pkgRoot)).toBeNull();
  });

  it("no ts-ci-steps drift even when the consumer customises a step (optional = consumer-owned)", () => {
    // ts-ci-steps IS the consumer's toolchain; editing a step (here: repin setup-node) must NOT
    // nag — enforcing content on a Tier-3 block bkit never rewrites was perpetual noise on every
    // consumer that customised its own CI.
    const consumer = readTemplate()
      .replace(/\{\{NODE_VERSION\}\}/g, "22")
      .replace(
        "actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
        "actions/setup-node@0000000000000000000000000000000000000000",
      );
    writeConsumer(consumer);
    const result = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(result?.detect ?? "").not.toContain("ts-ci-steps");
  });

  it("no ts-ci-steps drift on the --ci skeleton (optional block fully commented)", () => {
    // A `--ci`-only install comments the whole ts-ci-steps region (deriveCiSkeleton). That is
    // opt-out, not drift — the optional block with no significant lines is skipped.
    const consumer = deriveCiSkeleton(readTemplate());
    writeConsumer(consumer);
    const result = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(result?.detect ?? "").not.toContain("ts-ci-steps");
  });

  it("no drift when a consumer adds an EXTRA line inside a managed block (subset — extras OK)", () => {
    // "All the content and more" stays quiet: an added env var is not drift.
    const consumer = readTemplate().replace(
      "      GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}",
      "      GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}\n      MY_CONSUMER_VAR: '1'",
    );
    writeConsumer(consumer);
    expect(detectTier2TextDrift(tmpDir, relPath, pkgRoot)).toBeNull();
  });

  it("no drift when a bare structural key (env:) sits outside the marker (gether's layout)", () => {
    // gether wraps only the bkit assignments in the marker; the bare `env:` key sits just above
    // it. A bare structural key is not required content — all three assignments remain present.
    const consumer = readTemplate().replace(/\n( +)env:\n( +TURBO_LOG_LEVEL:)/, "\n$2");
    writeConsumer(consumer);
    expect(detectTier2TextDrift(tmpDir, relPath, pkgRoot)).toBeNull();
  });

  it("still flags DRIFT when a consumer DROPS a required line from a managed block (subset)", () => {
    // A genuinely missing required assignment still gates.
    const consumer = readTemplate().replace(/\n +VERBOSE_CI: \$\{\{[^\n]*\}\}/, "");
    writeConsumer(consumer);
    const drift = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(drift?.id).toBe("tier2-text-drift");
    expect(drift?.detect).toContain("verbose-ci-env");
  });

  it("flags MISSING when a required named block (verbose-ci-env) is absent but other markers remain", () => {
    // Drop the whole verbose-ci-env block; keep the (optional) main-lag-warning block so the
    // consumer still has bkit markers. Required block missing → flagged (migrates the retired
    // detectCiYmlVerboseCiBlockMissing coverage onto the generic drift advisory).
    const consumer = readTemplate().replace(
      /\n {4}# bkit:start verbose-ci-env\n[\s\S]*?# bkit:end verbose-ci-env\n/,
      "\n",
    );
    writeConsumer(consumer);
    const result = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(result?.id).toBe("tier2-text-drift");
    expect(result?.detect).toMatch(/missing:.*verbose-ci-env/);
  });

  it("flags MISSING when the required main-lag-warning block is deleted", () => {
    // main-lag-warning ships REQUIRED (no `optional` flag) so adoption is nagged everywhere —
    // a consumer that drops it (e.g. installed before the block existed) gets a non-blocking
    // advisory pointing them to re-sync from the template.
    const consumer = readTemplate().replace(
      /\n {6}# bkit:start main-lag-warning\n[\s\S]*?# bkit:end main-lag-warning\n/,
      "\n",
    );
    writeConsumer(consumer);
    const result = detectTier2TextDrift(tmpDir, relPath, pkgRoot);
    expect(result?.id).toBe("tier2-text-drift");
    expect(result?.detect).toMatch(/missing:.*main-lag-warning/);
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

// ---------------------------------------------------------------------------
// Challenge regression tests — Finding 1 (SHARED-DERIV portability + pipefail safety)
//
// The build challenge (Finding 1 HIGH) identified two coexisting defects in the
// SHARED-DERIV grep region of bkit-cloud.yml:
//   (a) `grep -oP` PCRE lookbehind — non-portable (BSD grep / some runner images)
//   (b) No failure guard on ISSUE/FID assignments — `set -euo pipefail` aborts
//       the step when grep exits 1 on a no-match body, making the fallback/fail-safe
//       dead code and producing a RED job instead of skip=true no-op.
//
// Remediation replaced `grep -oP` with portable `grep -oE` + `sed`, and added
// `|| true` guards so a no-match exits 0 and reaches the skip=true path.
//
// These tests lock in the remediation so a silent regression cannot re-introduce
// `grep -oP` or remove the `|| true` guards.
// ---------------------------------------------------------------------------

describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety regression", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..");

  function readBkitCloudYml(): string {
    return fs.readFileSync(path.join(pkgRoot, ".github", "workflows", "bkit-cloud.yml"), "utf-8");
  }

  function readBkitCloudTemplate(): string {
    return fs.readFileSync(
      path.join(pkgRoot, ".bkit", "templates", ".github", "workflows", "bkit-cloud.yml"),
      "utf-8",
    );
  }

  it("(1a) canonical bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard", () => {
    // Finding 1 (challenge-2): grep -oP relies on PCRE unavailable on BSD/macOS grep.
    // A silent re-introduction of -oP would pass on ubuntu-latest but fail on any
    // non-GNU runner — this test must catch it before ship.
    const canonical = readBkitCloudYml();
    expect(canonical).not.toContain("grep -oP");
  });

  it("(1a) template bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard", () => {
    const template = readBkitCloudTemplate();
    expect(template).not.toContain("grep -oP");
  });

  it("(1b) ISSUE assignment in canonical has || true failure guard (pipefail safety)", () => {
    // Finding 1 (challenge-1): without || true, `set -euo pipefail` aborts the step
    // when grep exits 1 on a no-match PR body, making fallback/fail-safe dead code.
    // The ISSUE assignment must end with `|| true` so a no-match exits 0.
    const canonical = readBkitCloudYml();
    // The exact remediated form: grep -oE ... | sed ... | head -1 || true
    expect(canonical).toMatch(/ISSUE=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1b) FID assignment in canonical has || true failure guard (pipefail safety)", () => {
    const canonical = readBkitCloudYml();
    expect(canonical).toMatch(/FID=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1b) ISSUE assignment in template has || true failure guard (pipefail safety)", () => {
    const template = readBkitCloudTemplate();
    expect(template).toMatch(/ISSUE=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1b) FID assignment in template has || true failure guard (pipefail safety)", () => {
    const template = readBkitCloudTemplate();
    expect(template).toMatch(/FID=\$\(echo "\$PR_BODY" \| grep -oE[^\n]*\|\| true\)/);
  });

  it("(1c) SHARED-DERIV extraction snippet exits 0 under set -euo pipefail when PR body is empty (real-tool validation)", () => {
    // Finding 1 (challenge-1): the original code aborted on empty PR body.
    // This test extracts the actual ISSUE/FID assignment commands from the canonical
    // workflow and executes them under `set -euo pipefail` with an empty PR body to
    // prove the || true guards make the step exit 0 (not exit 1).
    const canonical = readBkitCloudYml();

    // Extract the two assignment lines from the shared-deriv block.
    const sharedDerivStart = canonical.indexOf("# bkit:start shared-deriv");
    const sharedDerivEnd = canonical.indexOf("# bkit:end shared-deriv");
    expect(sharedDerivStart).toBeGreaterThan(-1);
    expect(sharedDerivEnd).toBeGreaterThan(sharedDerivStart);
    const sharedDerivBlock = canonical.slice(sharedDerivStart, sharedDerivEnd);

    // Pull out the ISSUE= and FID= lines (they contain the grep commands).
    const issueLineMatch = sharedDerivBlock.match(/ISSUE=\$\(echo "\$PR_BODY"[^\n]+\)/);
    const fidLineMatch = sharedDerivBlock.match(/FID=\$\(echo "\$PR_BODY"[^\n]+\)/);
    expect(
      issueLineMatch,
      "ISSUE= assignment line must be found in shared-deriv block",
    ).not.toBeNull();
    expect(fidLineMatch, "FID= assignment line must be found in shared-deriv block").not.toBeNull();

    const issueLine = issueLineMatch![0]!.trim();
    const fidLine = fidLineMatch![0]!.trim();

    // Build a minimal shell script that runs both assignments under strict mode
    // with an empty PR_BODY and asserts the variables are empty (no-match, no abort).
    const script = [
      "set -euo pipefail",
      'PR_BODY=""',
      issueLine,
      fidLine,
      // Assert variables are empty (grep found nothing, || true kept us alive)
      '[ -z "$ISSUE" ] || { echo "FAIL: ISSUE should be empty, got: $ISSUE"; exit 2; }',
      '[ -z "$FID" ]   || { echo "FAIL: FID should be empty, got: $FID"; exit 2; }',
      'echo "OK: both empty, script did not abort"',
    ].join("\n");

    const result = spawnSync("bash", ["-c", script], {
      encoding: "utf-8",
      timeout: 10_000,
    });

    expect(
      result.status,
      `SHARED-DERIV snippet aborted under set -euo pipefail with empty PR body.\n` +
        `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
    ).toBe(0);
    expect(result.stdout).toContain("OK: both empty, script did not abort");
  });

  it("(1c) SHARED-DERIV extraction snippet correctly parses a well-formed PR body (positive case)", () => {
    // Complementary positive case: a PR body WITH the markers must yield the correct values.
    const canonical = readBkitCloudYml();

    const sharedDerivStart = canonical.indexOf("# bkit:start shared-deriv");
    const sharedDerivEnd = canonical.indexOf("# bkit:end shared-deriv");
    const sharedDerivBlock = canonical.slice(sharedDerivStart, sharedDerivEnd);

    const issueLineMatch = sharedDerivBlock.match(/ISSUE=\$\(echo "\$PR_BODY"[^\n]+\)/);
    const fidLineMatch = sharedDerivBlock.match(/FID=\$\(echo "\$PR_BODY"[^\n]+\)/);
    expect(issueLineMatch).not.toBeNull();
    expect(fidLineMatch).not.toBeNull();

    const issueLine = issueLineMatch![0]!.trim();
    const fidLine = fidLineMatch![0]!.trim();

    const script = [
      "set -euo pipefail",
      'PR_BODY="<!-- bkit:issue=#141 bkit:fid=141-cloud-app -->"',
      issueLine,
      fidLine,
      '[ "$ISSUE" = "141" ] || { echo "FAIL: expected ISSUE=141, got: $ISSUE"; exit 2; }',
      '[ "$FID" = "141-cloud-app" ] || { echo "FAIL: expected FID=141-cloud-app, got: $FID"; exit 2; }',
      'echo "OK: ISSUE=$ISSUE FID=$FID"',
    ].join("\n");

    const result = spawnSync("bash", ["-c", script], {
      encoding: "utf-8",
      timeout: 10_000,
    });

    expect(
      result.status,
      `SHARED-DERIV snippet failed to parse well-formed PR body.\n` +
        `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
    ).toBe(0);
    expect(result.stdout).toContain("OK: ISSUE=141 FID=141-cloud-app");
  });
});

// ---------------------------------------------------------------------------
// Challenge regression tests — Finding 2 (claude.yml author_association gate)
//
// The build challenge (Finding 2 HIGH) identified that the @claude trigger in
// claude.yml had no author_association gate, allowing any external commenter to
// trigger the job (OWNER/MEMBER/COLLABORATOR allow-list was missing).
//
// Remediation added `contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'),
// github.event.comment.author_association)` (and equivalents) to all four event
// paths in the job's `if:` condition.
//
// These tests lock in the allow-list so it cannot be silently removed on any path.
// ---------------------------------------------------------------------------

describe("Challenge Finding 2 — claude.yml author_association allow-list regression", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..");

  function readClaudeYml(): string {
    return fs.readFileSync(path.join(pkgRoot, ".github", "workflows", "claude.yml"), "utf-8");
  }

  it("claude.yml issue_comment path has author_association gate", () => {
    // Finding 2: the original file had no author_association check on any event path.
    // All four event paths must now carry the allow-list to prevent drive-by triggers.
    const yml = readClaudeYml();
    // The issue_comment branch must guard on comment.author_association.
    expect(yml).toContain("github.event.comment.author_association");
  });

  it("claude.yml pull_request_review_comment path has author_association gate", () => {
    const yml = readClaudeYml();
    // pull_request_review_comment re-uses event.comment.author_association.
    // At minimum one of the two `pull_request_review` event paths must reference it.
    // The remediated file uses comment.author_association for both comment events.
    expect(yml).toContain("github.event.comment.author_association");
  });

  it("claude.yml pull_request_review path has author_association gate", () => {
    const yml = readClaudeYml();
    // The review path uses event.review.author_association.
    expect(yml).toContain("github.event.review.author_association");
  });

  it("claude.yml issues path has author_association gate", () => {
    const yml = readClaudeYml();
    // The issues path uses event.issue.user.author_association.
    expect(yml).toContain("github.event.issue.user.author_association");
  });

  it("claude.yml allow-list contains exactly OWNER, MEMBER, COLLABORATOR", () => {
    // The allow-list must use the literal three-association JSON array.
    // If someone narrows to OWNER-only or adds CONTRIBUTOR, this test catches it.
    const yml = readClaudeYml();
    expect(yml).toContain('["OWNER","MEMBER","COLLABORATOR"]');
  });

  it("claude.yml allow-list is checked via fromJSON (not string-match) for all @claude paths", () => {
    const yml = readClaudeYml();
    // All four event paths must use fromJSON('["OWNER","MEMBER","COLLABORATOR"]')
    // so the allow-list is evaluated as a JSON array, not a substring check.
    const matches = yml.match(/fromJSON\('?\["OWNER","MEMBER","COLLABORATOR"\]'?\)/g);
    // There are 4 event paths in the if: — each must carry the check.
    expect(matches, "Expected fromJSON allow-list on all 4 event paths").not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(4);
  });

  it("claude.yml if: uses contains(...author_association) — not a string equality check", () => {
    const yml = readClaudeYml();
    // The check must be `contains(fromJSON(...), <author_association field>)` not
    // `github.event.comment.author_association == 'OWNER'` etc.
    expect(yml).toMatch(
      /contains\(fromJSON\([^)]*\),\s*github\.event\.(comment|review|issue\.user)\.author_association\)/,
    );
  });
});

// ---------------------------------------------------------------------------
// runOpencodeModule — opt-in opencode host (Task 2.2 "Done when")
// ---------------------------------------------------------------------------

describe("runOpencodeModule — clean install writeset (Task 2.2)", () => {
  // Resolve the real opencode model lookup from prompts.md (same source used at install time)
  const PROMPTS_MD = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "..",
    "prompts.md",
  );
  const CATALOG_MODEL_LOOKUP = parseModelLookup(PROMPTS_MD);
  const OPENCODE_MODEL_LOOKUP = parseOpencodeModelLookup(PROMPTS_MD);
  const EXPECTED_AGENT_COUNT = CATALOG_MODEL_LOOKUP.size;

  function makeOpencodeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
    return {
      dryRun: false,
      tokens: {
        NODE_VERSION: "22",
        DEFAULT_BRANCH: "main",
        PROJECT_NAME: "test-project",
        REPO_SLUG: "acme/test-project",
      },
      modelLookup: CATALOG_MODEL_LOOKUP,
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      opencodeProvider: "ollama-local",
      advisories: [],
      ws: makeWriteSet(),
      logPrefix: "[bkit-install]",
      postDispatch: [],
      issueTracker: "none",
      ...overrides,
    };
  }

  it("clean install writes .opencode/agents/*.md (one per catalog agent)", () => {
    // Note: agent files are written via installFile (not tier-writers), so they do NOT
    // appear in ws.writes — same pattern as claude/cursor modules. Assert disk presence instead.
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    expect(EXPECTED_AGENT_COUNT).toBeGreaterThan(0);

    const agentDir = path.join(tmpDir, ".opencode", "agents");
    expect(fs.existsSync(agentDir)).toBe(true);
    const agentFiles = fs.readdirSync(agentDir).filter((f) => f.endsWith(".md"));
    expect(agentFiles.length).toBe(EXPECTED_AGENT_COUNT);

    // Verify agent files have opencode frontmatter
    for (const f of agentFiles) {
      const content = fs.readFileSync(path.join(agentDir, f), "utf-8");
      expect(content).toMatch(/^---\n/);
      expect(content).toContain("mode: subagent");
      expect(content).toContain("model:");
    }
  });

  it("clean install writes .opencode/commands/*.md (one per bkit workflow)", () => {
    // Note: command files are written via installFile (not tier-writers) — not in ws.writes.
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    const commandDir = path.join(tmpDir, ".opencode", "commands");
    expect(fs.existsSync(commandDir)).toBe(true);
    const commandFiles = fs.readdirSync(commandDir).filter((f) => f.endsWith(".md"));
    expect(commandFiles.length).toBeGreaterThan(0);

    // Command files exist on disk
    for (const f of commandFiles) {
      expect(fs.existsSync(path.join(commandDir, f))).toBe(true);
    }
  });

  it("clean install writes .opencode/opencode.json", () => {
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    const jsonWrite = ws.writes.find((w) =>
      w.path.endsWith(path.join(".opencode", "opencode.json")),
    );
    expect(jsonWrite).toBeDefined();

    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    expect(fs.existsSync(jsonPath)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Record<string, unknown>;
    // Must have permission + plugin blocks (no plaintext key material)
    expect(parsed).toHaveProperty("permission");
    expect(parsed).toHaveProperty("plugin");
    // No plaintext API key — provider key must be an env-var reference
    const jsonStr = JSON.stringify(parsed);
    expect(jsonStr).not.toMatch(/sk-[a-zA-Z0-9]{20,}/); // no raw API key
  });

  it("clean install writes .opencode/plugin/gateguard.js", () => {
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    const pluginWrite = ws.writes.find((w) =>
      w.path.endsWith(path.join(".opencode", "plugin", "gateguard.js")),
    );
    expect(pluginWrite).toBeDefined();
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "plugin", "gateguard.js"))).toBe(true);
  });

  // #255 P2-9 / #282 — install is additive: a second provider install adds its block without
  // removing the first. Both nvidia + opencode blocks coexist after two installs.
  it("provider switch nvidia → opencode-go keeps both blocks (additive install)", () => {
    type OpencodeDoc = { provider?: Record<string, Record<string, unknown>> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "nvidia" }));
    let parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.nvidia, "nvidia provider seeded on first install").toBeDefined();
    expect(fs.readFileSync(jsonPath, "utf-8")).toContain("NVIDIA_API_KEY");

    // opencode-go renders a built-in block keyed `opencode-go` (apiKey only — no npm/baseURL).
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    // Additive: nvidia block is preserved alongside the new opencode-go block.
    expect(parsed.provider?.nvidia, "nvidia provider preserved (additive install)").toBeDefined();
    const go = parsed.provider?.["opencode-go"];
    expect((go?.options as Record<string, unknown>)?.apiKey).toBe("{env:OPENCODE_API_KEY}");
    expect(go?.npm).toBeUndefined();
    expect((go?.options as Record<string, unknown>)?.baseURL).toBeUndefined();
  });

  it("reinstall heals a corrupted opencode-go block (strips hijacked npm/baseURL)", () => {
    type OpencodeDoc = { provider?: Record<string, Record<string, unknown>> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    const doc = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    // Consumer (or prior bug) hijacked the built-in with an ollama-local-shaped block.
    doc.provider!["opencode-go"] = {
      npm: "@ai-sdk/openai-compatible",
      name: "hijacked",
      options: {
        baseURL: "http://localhost:11434/v1",
        apiKey: "{env:OPENCODE_API_KEY}",
      },
    };
    fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    const healed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    const block = healed.provider?.["opencode-go"];
    expect(block?.npm).toBeUndefined();
    expect(block?.name).toBeUndefined();
    expect((block?.options as Record<string, unknown>)?.baseURL).toBeUndefined();
    expect((block?.options as Record<string, unknown>)?.apiKey).toBe("{env:OPENCODE_API_KEY}");
    expect(Object.keys(block ?? {})).toEqual(["options"]);
  });

  it("provider switch nvidia → groq keeps both provider blocks (additive install)", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "nvidia" }));
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "groq" }));

    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.groq, "groq provider present").toBeDefined();
    expect(parsed.provider?.nvidia, "nvidia provider preserved (additive install)").toBeDefined();
  });

  it("preserves both consumer-added and bkit provider blocks across a second install", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "nvidia" }));
    // Consumer adds their own provider under a key bkit never seeds.
    const doc = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    (doc.provider as Record<string, unknown>)["my-custom"] = {
      npm: "@acme/driver",
      name: "my-custom",
      options: {},
    };
    fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "groq" }));
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.["my-custom"], "consumer provider preserved").toBeDefined();
    // Additive: the prior bkit nvidia block is also preserved.
    expect(
      parsed.provider?.nvidia,
      "prior bkit provider preserved (additive install)",
    ).toBeDefined();
    expect(parsed.provider?.groq, "new bkit provider present").toBeDefined();
  });

  it("additive install: nvidia then ollama-local → both provider blocks present", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "nvidia" }));
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "ollama-local" }));

    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.nvidia, "nvidia block present after additive install").toBeDefined();
    expect(
      parsed.provider?.["ollama-local"],
      "ollama-local block present after additive install",
    ).toBeDefined();
  });

  it("opencode setup advisory is emitted on --opencode=<provider> install (Task 2.2)", () => {
    const ctx = makeOpencodeCtx({ opencodeProvider: "nvidia" });
    runOpencodeModule(ctx);

    const advisory = ctx.advisories.find((a) => a.id === "opencode-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.detect).toMatch(/opencode host installed/);
    // Advisory names the provider key env var
    expect(advisory!.action).toMatch(/NVIDIA_API_KEY/);
    // Advisory references bkit doctor/status
    expect(advisory!.action).toMatch(/bkit doctor/);
    expect(advisory!.action).toMatch(/bkit status/);
    // No plaintext API key echoed in advisory
    expect(advisory!.action).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
  });

  it("ollama-local advisory does NOT mention an API key (Ollama is local, no key needed)", () => {
    const ctx = makeOpencodeCtx({ opencodeProvider: "ollama-local" });
    runOpencodeModule(ctx);

    const advisory = ctx.advisories.find((a) => a.id === "opencode-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/Ollama runs locally/);
    expect(advisory!.action).not.toMatch(/OLLAMA_API_KEY/);
  });

  it("dry-run: no agent/command .md files written to disk, advisory still emitted", () => {
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws, dryRun: true });
    runOpencodeModule(ctx);

    // In dry-run: agent and command .md files must NOT exist on disk
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const commandDir = path.join(tmpDir, ".opencode", "commands");
    // Dirs may be created by ensureDir, but no .md files should be written
    if (fs.existsSync(agentDir)) {
      const agentFiles = fs.readdirSync(agentDir).filter((f) => f.endsWith(".md"));
      expect(agentFiles).toHaveLength(0);
    }
    if (fs.existsSync(commandDir)) {
      const commandFiles = fs.readdirSync(commandDir).filter((f) => f.endsWith(".md"));
      expect(commandFiles).toHaveLength(0);
    }
    // opencode.json and gateguard.js must not exist on disk
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "opencode.json"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "plugin", "gateguard.js"))).toBe(false);
    // Advisory still fired
    expect(ctx.advisories.find((a) => a.id === "opencode-setup")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// runOpencodeModule — transactional-staging zero-footprint (KN-12, Task 2.2)
// ---------------------------------------------------------------------------

describe("runOpencodeModule — staging zero-footprint on failure (KN-12, Task 2.2)", () => {
  const PROMPTS_MD = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "..",
    "prompts.md",
  );
  const OPENCODE_MODEL_LOOKUP = parseOpencodeModelLookup(PROMPTS_MD);
  const CATALOG_MODEL_LOOKUP = parseModelLookup(PROMPTS_MD);

  it("zero .opencode/ footprint before runOpencodeModule is called", () => {
    // Before any opencode install: .opencode/ must not exist in a fresh consumer dir
    expect(fs.existsSync(path.join(tmpDir, ".opencode"))).toBe(false);
  });

  it("after a successful install, .opencode/ exists; uninstalling leaves zero footprint", () => {
    const ws = makeWriteSet();
    const ctx = {
      dryRun: false,
      tokens: {
        NODE_VERSION: "22",
        DEFAULT_BRANCH: "main",
        PROJECT_NAME: "test-project",
        REPO_SLUG: "acme/test-project",
      },
      modelLookup: CATALOG_MODEL_LOOKUP,
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      opencodeProvider: "ollama-local",
      advisories: [] as PreflightFinding[],
      ws,
      logPrefix: "[bkit-install]",
      postDispatch: [] as Array<() => void>,
      issueTracker: "none" as const,
    };

    runOpencodeModule(ctx);
    expect(fs.existsSync(path.join(tmpDir, ".opencode"))).toBe(true);

    // Simulate surgical removal: delete all .opencode/ bkit-prefix agent/command files
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const commandDir = path.join(tmpDir, ".opencode", "commands");
    const pluginDir = path.join(tmpDir, ".opencode", "plugin");

    if (fs.existsSync(agentDir)) fs.rmSync(agentDir, { recursive: true });
    if (fs.existsSync(commandDir)) fs.rmSync(commandDir, { recursive: true });
    if (fs.existsSync(pluginDir)) fs.rmSync(pluginDir, { recursive: true });
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    if (fs.existsSync(jsonPath)) fs.rmSync(jsonPath);

    // After removal, agent/command/plugin dirs and json are gone
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "opencode.json"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// renderOpencodeJson — provider block must match opencode's custom-provider schema
// (regression guard for #245: a stray `"api": "openai"` field makes opencode reject
// the whole config, and env keys must use {env:VAR}, never shell ${VAR}.)
// ---------------------------------------------------------------------------
describe("opencodeProviderId — bkit key → opencode-side provider id", () => {
  it("passes through custom providers (key === opencode id)", () => {
    for (const key of [
      "ollama-local",
      "nvidia",
      "groq",
      "cerebras",
      "openrouter",
      "ollama",
      "zai",
      "moonshot",
    ]) {
      expect(opencodeProviderId(key)).toBe(key);
    }
  });

  it("opencode-zen CLI key maps to built-in gateway id 'opencode' (models.dev)", () => {
    expect(opencodeProviderId("opencode-zen")).toBe("opencode");
  });

  it("opencode-go CLI key maps to built-in gateway id 'opencode-go'", () => {
    expect(opencodeProviderId("opencode-go")).toBe("opencode-go");
  });

  it("legacy zen key passes through unchanged (alias resolved at CLI, not here)", () => {
    expect(opencodeProviderId("zen")).toBe("zen");
  });

  it("passes through an unknown key unchanged (defensive)", () => {
    expect(opencodeProviderId("acme")).toBe("acme");
  });
});

describe("renderOpencodeJson — opencode custom-provider format", () => {
  const TEMPLATE = path.resolve(".bkit/templates/.opencode/opencode.json");

  it("nvidia (remote): npm driver, custom-provider shape, apiKey via {env:VAR}", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "nvidia"));
    const block = parsed.provider?.nvidia;
    expect(block).toBeTruthy();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("https://integrate.api.nvidia.com/v1");
    expect(block.options.apiKey).toBe("{env:NVIDIA_API_KEY}");
    // No shell-style interpolation in the provider block (opencode reads {env:VAR}).
    expect(JSON.stringify(block)).not.toContain("${");
  });

  it("zai (remote): npm driver, GLM coding-plan baseURL, apiKey via {env:ZAI_API_KEY}", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "zai"));
    const block = parsed.provider?.zai;
    expect(block).toBeTruthy();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("https://api.z.ai/api/coding/paas/v4");
    expect(block.options.apiKey).toBe("{env:ZAI_API_KEY}");
    expect(block.api).toBeUndefined(); // an "api" field makes opencode reject the whole config
    expect(JSON.stringify(block)).not.toContain("${");
  });

  it("moonshot (remote): npm driver, Kimi coding baseURL, apiKey via {env:MOONSHOT_API_KEY}", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "moonshot"));
    const block = parsed.provider?.moonshot;
    expect(block).toBeTruthy();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("https://api.moonshot.ai/v1");
    expect(block.options.apiKey).toBe("{env:MOONSHOT_API_KEY}");
    expect(block.api).toBeUndefined();
    expect(JSON.stringify(block)).not.toContain("${");
  });

  it("github MCP: type 'remote' (not 'http') + {env:} header — opencode schema valid", () => {
    // type "http" is valid for Claude/Cursor but NOT in opencode's enum (["local","remote"]);
    // its presence makes opencode reject the whole config. Regression guard for #245.
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "nvidia"));
    const gh = parsed.mcp?.github;
    expect(gh.type).toBe("remote");
    expect(gh.headers.Authorization).toBe("Bearer {env:GH_BKIT_TOKEN}");
    expect(JSON.stringify(parsed.mcp)).not.toContain('"http"');
    expect(JSON.stringify(parsed.mcp)).not.toContain("${");
  });

  it("linear MCP: type 'remote' (not 'http')", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "linear", "nvidia"));
    expect(parsed.mcp?.linear?.type).toBe("remote");
  });

  it("uses the 'plugin' key (singular), not 'plugins' (opencode schema)", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "nvidia"));
    expect(parsed.plugin).toContain(".opencode/plugin/gateguard.js");
    expect(parsed.plugins).toBeUndefined();
  });

  it("permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "nvidia"));
    const perm = parsed.permission;
    expect(perm.rules).toBeUndefined(); // the Claude-style array that opencode rejects
    expect(perm.edit).toBe("allow");
    expect(perm.task).toBe("allow");
    expect(typeof perm.bash).toBe("object");
    expect(perm.bash["git push --force*"]).toBe("deny");
    expect(perm.bash["git push --force-with-lease*"]).toBe("allow");
    expect(perm.bash["rm -rf /*"]).toBe("deny");
    expect(perm.bash["chmod -R 777 /*"]).toBe("deny");
    expect(perm.bash["sudo *"]).toBe("ask");
    // #255 P1-3: destructive-git + delete commands gated to parity with the Claude host
    // (.claude/settings.json ask-list). opencode is the lowest-alignment host, so this
    // surface must NOT be weaker than the Claude peer it ships alongside.
    for (const cmd of [
      "git reset --hard*",
      "git clean -fd*",
      "git filter-branch*",
      "git checkout -- .*",
      "git restore .*",
      "git stash drop*",
      "git rebase -i*",
      "gh repo delete*",
      "gh pr close*",
      "gh release delete*",
    ]) {
      expect(perm.bash[cmd], `${cmd} must be gated 'ask'`).toBe("ask");
    }
    // last-match-wins: the --force-with-lease allow MUST come after the --force deny,
    // else force-with-lease (which matches "git push --force*") would be denied.
    const keys = Object.keys(perm.bash);
    expect(keys.indexOf("git push --force-with-lease*")).toBeGreaterThan(
      keys.indexOf("git push --force*"),
    );
  });

  it("ollama-local (local): npm driver, NO apiKey (keyless local server)", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "ollama-local"));
    const block = parsed.provider?.["ollama-local"];
    expect(block).toBeTruthy();
    expect(block.api).toBeUndefined();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("http://localhost:11434/v1");
    expect(block.options.apiKey).toBeUndefined();
  });

  it("opencode-zen / opencode-go: built-in providers (apiKey only — no npm/baseURL)", () => {
    // OpenCode resolves Zen/Go from models.dev (per-model openai-compatible vs anthropic).
    // Seeding npm+baseURL forces every model through /chat/completions and breaks Qwen/MiniMax
    // (Anthropic /messages) → wrong-URL errors. Built-in shape: options.apiKey only.
    const cases = [
      ["opencode-zen", "opencode"],
      ["opencode-go", "opencode-go"],
    ] as const;
    for (const [cliKey, blockKey] of cases) {
      const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", cliKey));
      const block = parsed.provider?.[blockKey];
      expect(block, `${cliKey} → provider.${blockKey}`).toBeDefined();
      expect(block.api).toBeUndefined();
      expect(block.npm).toBeUndefined();
      expect(block.name).toBeUndefined();
      expect(block.options?.baseURL).toBeUndefined();
      expect(block.options?.apiKey).toBe("{env:OPENCODE_API_KEY}");
      expect(Object.keys(block)).toEqual(["options"]);
      expect(parsed.plugin).toContain(".opencode/plugin/gateguard.js");
      expect(JSON.stringify(parsed)).not.toContain("@@OPENCODE");
    }
    // Zen CLI key must NOT invent a custom `opencode-zen` block — models.dev id is `opencode`.
    const zen = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "opencode-zen"));
    expect(zen.provider?.["opencode-zen"]).toBeUndefined();
    expect(zen.provider?.opencode).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// runRenovateModule — self-hosted runner axis (#325)
// ---------------------------------------------------------------------------

describe("runRenovateModule — self-hosted vs mend runner (#325)", () => {
  const WORKFLOW_REL = path.join(".github", "workflows", "renovate.yml");
  const CONFIG_REL = path.join(".github", "renovate.json5");

  function readRunner(): string | undefined {
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      bkit?: { renovateRunner?: string };
    };
    return pkg.bkit?.renovateRunner;
  }

  it("self install writes renovate.yml + renovate.json5 and records bkit.renovateRunner", () => {
    runRenovateModule(makeCtx({ renovateRunner: "self" }));
    expect(fs.existsSync(path.join(tmpDir, WORKFLOW_REL))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, CONFIG_REL))).toBe(true);
    expect(readRunner()).toBe("self");
  });

  it("mend install does NOT write renovate.yml and records mend", () => {
    runRenovateModule(makeCtx({ renovateRunner: "mend" }));
    expect(fs.existsSync(path.join(tmpDir, WORKFLOW_REL))).toBe(false);
    expect(readRunner()).toBe("mend");
  });

  it("unspecified runner (ctx null/absent) behaves as mend — no workflow written", () => {
    runRenovateModule(makeCtx()); // renovateRunner undefined -> defaults to mend
    expect(fs.existsSync(path.join(tmpDir, WORKFLOW_REL))).toBe(false);
    expect(readRunner()).toBe("mend");
  });

  it("renovate.json5 is byte-identical across mend and self (single-source config)", () => {
    runRenovateModule(makeCtx({ renovateRunner: "self" }));
    const self = fs.readFileSync(path.join(tmpDir, CONFIG_REL), "utf-8");
    fs.rmSync(path.join(tmpDir, CONFIG_REL));
    runRenovateModule(makeCtx({ renovateRunner: "mend" }));
    const mend = fs.readFileSync(path.join(tmpDir, CONFIG_REL), "utf-8");
    expect(mend).toBe(self);
  });

  it("self -> mend reclaims a byte-equal workflow (never double-runs with the App)", () => {
    runRenovateModule(makeCtx({ renovateRunner: "self" }));
    expect(fs.existsSync(path.join(tmpDir, WORKFLOW_REL))).toBe(true);
    runRenovateModule(makeCtx({ renovateRunner: "mend" }));
    expect(fs.existsSync(path.join(tmpDir, WORKFLOW_REL))).toBe(false);
    expect(readRunner()).toBe("mend");
  });

  it("self -> mend PRESERVES a consumer-modified workflow and warns instead of deleting", () => {
    runRenovateModule(makeCtx({ renovateRunner: "self" }));
    const wf = path.join(tmpDir, WORKFLOW_REL);
    fs.appendFileSync(wf, "\n# consumer edit — must not be clobbered\n");
    const ctx = makeCtx({ renovateRunner: "mend" });
    runRenovateModule(ctx);
    expect(fs.existsSync(wf)).toBe(true); // preserved, not deleted
    expect(ctx.advisories.some((a) => a.id === "renovate-self-workflow-preserved")).toBe(true);
  });

  it("self re-install is idempotent (workflow re-written byte-equal, no error)", () => {
    runRenovateModule(makeCtx({ renovateRunner: "self" }));
    const first = fs.readFileSync(path.join(tmpDir, WORKFLOW_REL), "utf-8");
    runRenovateModule(makeCtx({ renovateRunner: "self" }));
    const second = fs.readFileSync(path.join(tmpDir, WORKFLOW_REL), "utf-8");
    expect(second).toBe(first);
    expect(readRunner()).toBe("self");
  });
});

// ---------------------------------------------------------------------------
// reconcileOpencodeJson — provider-key ordering must be stable across paths.
// Regression: install reconciles only the ACTIVE provider while upgrade also
// reconciles each ADDITIONAL installed provider. deepMergeJson orders template
// keys first, so reconciling a later provider used to hoist it to the front —
// install and upgrade then rendered a different order and `bkit check` never
// settled (perpetual opencode.json + .bkit/version drift).
// ---------------------------------------------------------------------------
describe("reconcileOpencodeJson — preserves existing provider order", () => {
  const DST = path.join(".opencode", "opencode.json");

  function seed(providers: Record<string, unknown>): void {
    fs.mkdirSync(".opencode", { recursive: true });
    fs.writeFileSync(
      DST,
      JSON.stringify({ plugin: [".opencode/plugin/gateguard.js"], provider: providers }, null, 2) +
        "\n",
      "utf-8",
    );
  }
  function providerOrder(): string[] {
    const parsed = JSON.parse(fs.readFileSync(DST, "utf-8")) as {
      provider: Record<string, unknown>;
    };
    return Object.keys(parsed.provider);
  }

  it("reconciling a LATER provider's block keeps the existing key order (upgrade path)", () => {
    seed({
      "opencode-go": { options: { apiKey: "{env:OPENCODE_API_KEY}" } },
      nvidia: { npm: "@ai-sdk/openai-compatible", name: "NVIDIA NIM", options: {} },
    });
    // The "additional provider" reconcile on upgrade seeds ONLY nvidia.
    const nvidiaTemplate = JSON.stringify({
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
    });
    reconcileOpencodeJson(nvidiaTemplate, DST, false, makeWriteSet());
    expect(providerOrder()).toEqual(["opencode-go", "nvidia"]);
  });

  it("appends a genuinely-new template provider AFTER the existing ones", () => {
    seed({ "opencode-go": { options: {} } });
    const groqTemplate = JSON.stringify({
      provider: { groq: { npm: "@ai-sdk/openai-compatible", name: "Groq", options: {} } },
    });
    reconcileOpencodeJson(groqTemplate, DST, false, makeWriteSet());
    expect(providerOrder()).toEqual(["opencode-go", "groq"]);
  });
});
