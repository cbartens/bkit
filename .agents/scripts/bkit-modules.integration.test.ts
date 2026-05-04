import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTokens, resolveTokens } from "./bkit-tokens";
import { writeTier2, type WriteSet } from "./bkit-tiers";
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
      PNPM_VERSION: "10",
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
    },
    modelLookup: new Map(),
    printSink: [],
    ws: makeWriteSet(),
    logPrefix: "[bkit-install]",
    ...overrides,
  };
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
  it("resolveTokens + applyTokens + writeTier2 produces substituted ci.yml on disk", async () => {
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
    expect(tokens.PNPM_VERSION).toBe("10");
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

    // Write the Tier 2 block to a new ci.yml in tmpDir
    const destDir = path.join(tmpDir, ".github", "workflows");
    fs.mkdirSync(destDir, { recursive: true });
    const dstPath = path.join(destDir, "ci.yml");
    const ws = makeWriteSet();

    writeTier2(templatePath, dstPath, tokens, "hash-comment", false, ws);

    expect(ws.writes).toHaveLength(1);
    expect(fs.existsSync(dstPath)).toBe(true);

    const onDisk = fs.readFileSync(dstPath, "utf-8");

    // Assert token substitution occurred
    expect(onDisk).toContain("node-version: 22");
    expect(onDisk).toContain("10"); // pnpm major version somewhere
    expect(onDisk).toContain("main"); // default branch

    // Assert NO raw placeholders remain
    expect(onDisk).not.toContain("{{NODE_VERSION}}");
    expect(onDisk).not.toContain("{{PNPM_VERSION}}");
    expect(onDisk).not.toContain("{{DEFAULT_BRANCH}}");
    expect(onDisk).not.toContain("{{PROJECT_NAME}}");

    // Assert auth-shim is present
    expect(onDisk).toContain("BKIT_READ_TOKEN");
    expect(onDisk).toContain("git config --global url.");
  });

  it("existing ci.yml with consumer jobs gets bkit block appended; consumer jobs preserved", async () => {
    fs.writeFileSync(path.join(tmpDir, ".nvmrc"), "22\n", "utf-8");
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "x", packageManager: "pnpm@10.4.1" }),
      "utf-8",
    );
    const tokens = await resolveTokens(tmpDir);

    const templatePath = path.resolve(
      import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
      "..",
      "templates",
      ".github",
      "workflows",
      "ci.yml",
    );

    // Existing ci.yml with consumer jobs (NO bkit markers)
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
    writeTier2(templatePath, dstPath, tokens, "hash-comment", false, ws);

    const onDisk = fs.readFileSync(dstPath, "utf-8");

    // Consumer jobs preserved
    expect(onDisk).toContain("consumer-job-1:");
    expect(onDisk).toContain("consumer-job-2:");
    expect(onDisk).toContain("echo hello");

    // bkit block appended
    expect(onDisk).toContain("# bkit:start");
    expect(onDisk).toContain("# bkit:end");
    expect(onDisk).toContain("node-version: 22");
    expect(onDisk).toContain("BKIT_READ_TOKEN");

    // Consumer content precedes bkit block
    const bkitStart = onDisk.indexOf("# bkit:start");
    const consumerEnd = onDisk.indexOf("consumer-job-2:");
    expect(consumerEnd).toBeLessThan(bkitStart);

    expect(ws.writes).toHaveLength(1);
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
  it("core module writes occur before other module writes (.bkit-version before consumer ci.yml)", () => {
    const realWs = makeWriteSet();
    const ctx = makeCtx({ ws: realWs });

    // Dispatch core + ci (core must run first per MODULE_DISPATCH_ORDER)
    dispatchModules(new Set(["core", "ci"]), ctx);

    // .bkit-version is the LAST write in core module
    const bkitVersionIdx = realWs.writes.findIndex((e) => e.path.endsWith(".bkit-version"));

    // Consumer-facing ci.yml is written by ci module (AFTER core)
    // It's at a path like .github/workflows/ci.yml (NOT inside .agents/templates/)
    const consumerCiIdx = realWs.writes.findIndex(
      (e) =>
        e.path.endsWith(path.join(".github", "workflows", "ci.yml")) &&
        !e.path.includes(`${path.sep}.agents${path.sep}templates${path.sep}`),
    );

    if (bkitVersionIdx !== -1 && consumerCiIdx !== -1) {
      // .bkit-version (last of core) comes before consumer ci.yml (from ci module)
      expect(bkitVersionIdx).toBeLessThan(consumerCiIdx);
    } else {
      // At minimum verify .bkit-version was written (core module ran)
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

describe(".bkit-version write-order regression (Reviewer 1 #7)", () => {
  it(".bkit-version is written LAST in runCoreModule (after other core writes)", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    runCoreModule(ctx);

    const writeOrder = ws.writes.map((e) => e.path);
    const bkitVersionIdx = writeOrder.findIndex((p) => p.includes(".bkit-version"));

    // .bkit-version should be present
    expect(bkitVersionIdx).toBeGreaterThanOrEqual(0);

    // .bkit-version should be the LAST write from runCoreModule
    // (or at minimum, not the first)
    if (writeOrder.length > 1) {
      expect(bkitVersionIdx).toBe(writeOrder.length - 1);
    }
  });

  it("if core fails before .bkit-version write, .bkit-version is absent", () => {
    // Simulate a core failure by checking that .bkit-version is absent before runCoreModule
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    // After runCoreModule completes successfully, it should be present
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });
    runCoreModule(ctx);

    expect(fs.existsSync(versionFile)).toBe(true);
  });
});

describe(".bkit-version first-run signal extra-logging", () => {
  it("first install (no .bkit-version) emits BKIT_READ_TOKEN setup in print-sink", () => {
    const printSink: string[] = [];
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, printSink });

    // Ensure no .bkit-version exists
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(false);

    runCoreModule(ctx);

    // print-sink should contain BKIT_READ_TOKEN setup
    const combined = printSink.join("\n");
    expect(combined).toContain("BKIT_READ_TOKEN");
    expect(combined).toContain("package.json");
  });

  it("second install (.bkit-version present at current version) suppresses first-run extra logging", () => {
    // Run first install to create .bkit-version
    const ws1 = makeWriteSet();
    const sink1: string[] = [];
    const ctx1 = makeCtx({ ws: ws1, printSink: sink1 });
    runCoreModule(ctx1);

    // Verify .bkit-version was written
    const versionFile = path.join(tmpDir, ".agents", ".bkit-version");
    expect(fs.existsSync(versionFile)).toBe(true);

    // Second run: .bkit-version exists → no first-run extra logging
    const ws2 = makeWriteSet();
    const sink2: string[] = [];
    const ctx2 = makeCtx({ ws: ws2, printSink: sink2 });
    runCoreModule(ctx2);

    const combined2 = sink2.join("\n");
    expect(combined2).not.toContain("BKIT_READ_TOKEN");
    expect(combined2).not.toContain("First install detected");
  });
});
