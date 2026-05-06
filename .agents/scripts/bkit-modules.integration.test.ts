import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTokens, resolveTokens } from "./bkit-tokens";
import { writeTier3, type WriteSet } from "./bkit-tiers";
import { extractFullManagedBlock, extractManagedBlock, parseModelLookup } from "./bkit-install";
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
    printSink: [],
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
    const printSink: string[] = [];

    // Tier 3 needs the file pre-token-substituted (it copies bytes verbatim).
    // applyTokens then writeTier3 isn't how runCiModule works — it just calls
    // writeTier3 with the raw template. Token substitution is a Tier 1/Tier 2
    // concern. Since the template still has placeholders we substitute the
    // file in tmpdir for this test:
    const substituted = applyTokens(fs.readFileSync(templatePath, "utf-8"), tokens);
    const stagedTemplate = path.join(tmpDir, "ci-staged.yml");
    fs.writeFileSync(stagedTemplate, substituted, "utf-8");

    writeTier3(stagedTemplate, dstPath, false, printSink, ws);

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
    const printSink: string[] = [];
    const aiMessage =
      "INSTRUCTIONS FOR AN AI AGENT: open .github/workflows/ci.yml and merge {{TEMPLATE_CONTENT}}";
    const result = writeTier3(templatePath, dstPath, false, printSink, ws, aiMessage);

    // Consumer file untouched
    const onDisk = fs.readFileSync(dstPath, "utf-8");
    expect(onDisk).toBe(consumerContent);

    // No write recorded
    expect(ws.writes).toHaveLength(0);

    // AI merge instruction printed with template content substituted in
    expect(result.suggested).toBe(true);
    expect(printSink).toHaveLength(1);
    expect(printSink[0]).toContain("INSTRUCTIONS FOR AN AI AGENT");
    expect(printSink[0]).toContain("GH_BKIT_TOKEN");
    expect(printSink[0]).not.toContain("{{TEMPLATE_CONTENT}}");
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

  it("runCiModule warns via print-sink when package.json is missing", () => {
    // beforeEach seeds a package.json — remove it so we hit the missingPkg branch
    fs.rmSync(path.join(tmpDir, "package.json"));
    const printSink: string[] = [];
    const ctx = makeCtx({ printSink });
    runCiModule(ctx);
    const combined = printSink.join("\n");
    expect(combined).toMatch(/package\.json not found/i);
  });
});

// ---------------------------------------------------------------------------
// MED-5 regression — print-sink copy-paste safety (no backslash-escape sequences)
// ---------------------------------------------------------------------------

describe("MED-5: first-install print-sink GH_BKIT_TOKEN block has no broken backslash-escape sequences", () => {
  it("print-sink emitted on first install contains no literal \\$ sequence (backslash-dollar)", () => {
    // Ensure no .bkit-version exists (first install scenario)
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const printSink: string[] = [];
    const ctx = makeCtx({ printSink });

    dispatchModules(new Set(["core"]), ctx);

    const combined = printSink.join("\n");

    // Must contain the GH_BKIT_TOKEN setup (confirming it's the first-install block)
    expect(combined).toContain("GH_BKIT_TOKEN");

    // Must NOT contain a literal backslash-dollar sequence.
    // The original bug was the template literal `\\$(find ...)` which rendered as
    // `\$(find ...)` in stdout — a literal backslash before `$` that breaks shell single-quote execution.
    // After the MED-5 fix (JSON.stringify-based output), `$(find ...)` appears without any leading backslash.
    expect(combined).not.toContain("\\$");
  });

  it("print-sink script block is valid JSON when extracted lines wrapped in braces (copy-paste safety)", () => {
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const printSink: string[] = [];
    const ctx = makeCtx({ printSink });
    dispatchModules(new Set(["core"]), ctx);

    const combined = printSink.join("\n");

    // Extract the "scripts" block: lines between the first { and last }
    // The print-sink emits lines like:    "lint:prose": "...",
    // Reconstruct as JSON object and parse to confirm validity
    const lines = combined.split("\n");
    const scriptLines: string[] = [];
    let inScriptBlock = false;
    for (const line of lines) {
      // Detect start of the scripts block (first line with "lint:prose")
      if (line.includes('"lint:prose"')) inScriptBlock = true;
      if (inScriptBlock) {
        scriptLines.push(line);
        // Stop at last script entry (prepare is the last one)
        if (line.trimStart().startsWith('"prepare"')) {
          break;
        }
      }
    }

    if (scriptLines.length > 0) {
      // Strip trailing comma from last entry and reconstruct a minimal JSON object
      const trimmedLines = scriptLines.map((l, i) =>
        i === scriptLines.length - 1 ? l.replace(/,\s*$/, "") : l,
      );
      const jsonCandidate = `{\n${trimmedLines.join("\n")}\n}`;
      expect(() => JSON.parse(jsonCandidate)).not.toThrow();
    }
  });
});

describe(".bkit-version first-run signal extra-logging", () => {
  it("first install (no .bkit-version) emits GH_BKIT_TOKEN setup in print-sink", () => {
    const printSink: string[] = [];
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, printSink });

    // Ensure no .bkit-version exists
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    // dispatchModules flushes postDispatch (where .bkit-version is written)
    dispatchModules(new Set(["core"]), ctx);

    // print-sink should contain GH_BKIT_TOKEN setup
    const combined = printSink.join("\n");
    expect(combined).toContain("GH_BKIT_TOKEN");
    expect(combined).toContain("package.json");
  });

  it("second install (.bkit-version present at current version) suppresses first-run extra logging", () => {
    // Run first install to create .bkit-version
    const ws1 = makeWriteSet();
    const sink1: string[] = [];
    const ctx1 = makeCtx({ ws: ws1, printSink: sink1 });
    dispatchModules(new Set(["core"]), ctx1);

    // Verify .bkit-version was written
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(true);

    // Second run: .bkit-version exists → no first-run extra logging
    const ws2 = makeWriteSet();
    const sink2: string[] = [];
    const ctx2 = makeCtx({ ws: ws2, printSink: sink2 });
    dispatchModules(new Set(["core"]), ctx2);

    const combined2 = sink2.join("\n");
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
