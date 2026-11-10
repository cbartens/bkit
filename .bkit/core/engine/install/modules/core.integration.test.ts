// install/modules/core.integration.test.ts — Integration tests for the core module: canonical docs,
// gate scripts and advisories, the first-install advisory, `.bkit/version`, and the managed blocks
// of the shared `.agents/` files.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";
import type { WriteSet } from "../write";
import { extractManagedBlock } from "../managed-block";
import type { PreflightFinding } from "../../checks/before/index";
import {
  runCoreModule,
  detectGateAdvisories,
  detectNoopGates,
  GATE_CONTENTS_NOTE,
  isNoopScript,
  bkitDocTokens,
  runBkitDocs,
  migrateLinearTeamKey,
  migrateGithubProjectKey,
  migrateBkitLayout,
  migrateBrandedScriptNames,
  pruneMinPushPaths,
  seedBkitDefaults,
  SEEDED_BKIT_DEFAULTS,
} from "./core";
import { dispatchModules, listStampedFiles, type ModuleContext } from "./index";
import { readInstallingVersion } from "../../shared/package-json";
import { getBkitDocsRoot, getPkgRoot, getTemplatesRoot } from "../../shared/package-roots";
import { BKIT_GATE_CHANGED_SCRIPT, BKIT_GATE_SCRIPTS } from "../manifest";
import { readBkitConfig } from "../../shared/settings";
import { hashFile, readBkitVersion, readManagedVersion, writeBkitVersion } from "../version-file";
import { applyTokens } from "../placeholders";
import {
  buildAntigravityModelLookup,
  buildOpencodeModelLookup,
  parseEffortMap,
  parseModelLookup,
} from "../../render/models";

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

describe("slop plugin migration", () => {
  const plugin = "scripts/slop/bkit-slop-type-suppression.mjs";
  const oldPlugin = fs.readFileSync(
    path.join(getPkgRoot(), "tests/fixtures/slop-6.0.0/bkit-slop-type-suppression.mjs.txt"),
  );
  const currentPlugin = fs.readFileSync(path.join(getTemplatesRoot(), plugin));

  function seed(content: string | Buffer = oldPlugin): void {
    fs.mkdirSync(path.dirname(plugin), { recursive: true });
    fs.writeFileSync(plugin, content);
  }

  function migrate(dryRun = false): WriteSet {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return { writes: ctx.ws.writes.filter((w) => w.path === plugin) };
  }

  it("replaces the exact shipped copy and records the same unhashed write in dry run", () => {
    seed();
    const dry = migrate(true);
    expect(fs.readFileSync(plugin)).toEqual(oldPlugin);
    expect(dry.writes).toEqual([{ path: plugin, action: "update", unhashed: true }]);
    expect(migrate()).toEqual(dry);
    expect(fs.readFileSync(plugin)).toEqual(currentPlugin);
    expect(migrate().writes).toEqual([]);
  });

  it("preserves an edited copy and reports the template to merge by hand", () => {
    const custom = Buffer.concat([oldPlugin, Buffer.from("\n// consumer customization\n")]);
    seed(custom);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(migrate().writes).toEqual([]);
      expect(fs.readFileSync(plugin)).toEqual(custom);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(plugin));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("by hand"));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(`.bkit/templates/${plugin}`));
    } finally {
      warn.mockRestore();
    }
  });

  it("leaves an already corrected copy untouched without a manual-update warning", () => {
    seed(currentPlugin);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(migrate().writes).toEqual([]);
      expect(fs.readFileSync(plugin)).toEqual(currentPlugin);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it("does not adopt a plugin the consumer never copied", () => {
    expect(migrate().writes).toEqual([]);
    expect(fs.existsSync(plugin)).toBe(false);
  });

  function seedSymlink(kind: string): string {
    fs.mkdirSync("owned", { recursive: true });
    const target = path.resolve("owned/bkit-slop-type-suppression.mjs");
    fs.writeFileSync(target, oldPlugin);
    fs.mkdirSync("scripts", { recursive: true });
    if (kind === "file") {
      fs.mkdirSync("scripts/slop");
      fs.symlinkSync(target, plugin);
    } else {
      fs.symlinkSync(path.resolve("owned"), "scripts/slop");
    }
    return target;
  }

  it.each(["file", "directory"])("preserves a symlinked %s and its target", (kind) => {
    const target = seedSymlink(kind);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(migrate().writes).toEqual([]);
      expect(fs.readFileSync(target)).toEqual(oldPlugin);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("by hand"));
    } finally {
      warn.mockRestore();
    }
  });
});

describe("bkit canonical docs pass (runBkitDocs, #218)", () => {
  // The package's canonical docs source (getBkitDocsRoot) — what runBkitDocs copies from.
  const PKG_DOCS_ROOT = getBkitDocsRoot();
  const DOCS = [
    "authoring.md",
    "cloud.md",
    "cli.md",
    "comparison.md",
    "install.md",
    "jsonl.md",
    "LICENSE.md",
    "pipeline.md",
    "providers.md",
    "prompts.md",
    "router.md",
    "templates.md",
    "trackers.md",
    "workflows.md",
    "README.md",
  ];

  const rendered = (name: string): string =>
    applyTokens(
      fs.readFileSync(path.join(PKG_DOCS_ROOT, name), "utf-8"),
      bkitDocTokens(makeCtx().tokens),
    );

  it("force-overwrites the package .bkit/*.md docs into the consumer's .bkit/, rendered", () => {
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

  it("keeps install tokens literal in the docs, resolving only the managed marker", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    const templates = fs.readFileSync(path.join(tmpDir, ".bkit", "templates.md"), "utf-8");
    expect(templates).toContain("`{{DEFAULT_BRANCH}}`");
    expect(templates).not.toContain("{{BKIT_MANAGED_MARKER}}");
  });

  it("writes .bkit/LICENSE.md with the full MIT text and copyright notice", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    const licence = fs.readFileSync(path.join(tmpDir, ".bkit", "LICENSE.md"), "utf-8");
    expect(licence).toContain("MIT License");
    expect(licence).toContain("Copyright (c) 2026 Christian Bartens");
    expect(licence).toContain("Permission is hereby granted, free of charge");
  });

  it("mirrors the docs into the repo's own .bkit/ in dogfood too", () => {
    const doc = path.join(".bkit", "workflows.md");
    expect(listStampedFiles(tmpDir).map((f) => f.path)).toContain(doc);
    expect(listStampedFiles(getPkgRoot()).map((f) => f.path)).toContain(doc);

    process.chdir(getPkgRoot());
    // A clean upgrade leaves the mirror equal to the source, so make it differ to
    // prove the dry-run resolves the consumer destination (the repo's own .bkit/),
    // never the package source. Restored in finally — the dry-run writes nothing.
    const abs = path.join(getPkgRoot(), doc);
    const original = fs.readFileSync(abs, "utf-8");
    fs.writeFileSync(abs, `${original}\nstale mirror\n`, "utf-8");
    try {
      const ws = makeWriteSet();
      runBkitDocs(true, makeCtx().tokens, ws, "[test]");
      expect(ws.writes.map((w) => String(w.path))).toContain(doc);
    } finally {
      fs.writeFileSync(abs, original, "utf-8");
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
    expect(fs.readFileSync(dst, "utf-8")).toBe(rendered("cloud.md"));
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

  function readScripts(): Record<string, string> {
    return readPkg().scripts ?? {};
  }

  it("an existing gate value is never touched; missing gate names are added", () => {
    writePkg({ scripts: { "bkit:gate:static": "ruff check .", "bkit:gate:format": "true" } });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const scripts = readScripts();
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
});

describe("migrateBrandedScriptNames (via seedCorePackageJsonScripts)", () => {
  const OLD_STATIC =
    "pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta";
  const seed = (scripts: Record<string, string>): void =>
    fs.writeFileSync(
      "package.json",
      JSON.stringify({ name: "x", version: "1.0.0", scripts }, null, 2) + "\n",
      "utf-8",
    );
  const readScripts = (): Record<string, string> =>
    JSON.parse(fs.readFileSync("package.json", "utf-8")).scripts;
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    migrateBrandedScriptNames(ctx.dryRun, ctx.ws, ctx.logPrefix);
    return ctx;
  };

  it("renames old bkit script keys and keeps custom values", () => {
    seed({
      "lint:prose": "custom-prose-linter",
      "slop:delta": "bash scripts/slop/bkit-slop-delta.sh",
      graph: "bash scripts/graphify/bkit-graphify.sh",
      "graph:check": "bash scripts/graphify/bkit-graphify.sh --check",
      "graph:rollup": "python3 scripts/graphify/bkit-graphify-rollup.py",
      typecheck: "tsc --noEmit",
    });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const scripts = readScripts();
    expect(scripts["bkit:lint:prose"]).toBe("custom-prose-linter");
    expect(scripts["bkit:slop:delta"]).toBe("bash scripts/slop/bkit-slop-delta.sh");
    expect(scripts["bkit:graph"]).toBe("bash scripts/graphify/bkit-graphify.sh");
    expect(scripts["bkit:graph:check"]).toBe("bash scripts/graphify/bkit-graphify.sh --check");
    expect(scripts["bkit:graph:rollup"]).toBe("python3 scripts/graphify/bkit-graphify-rollup.py");
    expect(scripts["lint:prose"]).toBeUndefined();
    expect(scripts["slop:delta"]).toBeUndefined();
    expect(scripts.graph).toBeUndefined();
    expect(scripts["graph:check"]).toBeUndefined();
    expect(scripts["graph:rollup"]).toBeUndefined();
    expect(scripts.typecheck).toBe("tsc --noEmit");
  });

  it("rewrites old script tokens in values and default gate chains", () => {
    seed({
      "bkit:gate:static": OLD_STATIC,
      "bkit:gate:min": "pnpm format:check && pnpm lint:prose && pnpm slop:delta",
      ci: "pnpm -s lint:prose && pnpm run slop:delta",
      wrapped: "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- pnpm lint:prose",
    });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const scripts = readScripts();
    expect(scripts["bkit:gate:static"]).toBe(BKIT_GATE_SCRIPTS["bkit:gate:static"]);
    expect(scripts["bkit:gate:static"]).not.toMatch(/pnpm (lint:prose|slop:delta)/);
    expect(scripts["bkit:gate:min"]).toBe(BKIT_GATE_SCRIPTS["bkit:gate:min"]);
    expect(scripts.ci).toBe("pnpm -s bkit:lint:prose && pnpm run bkit:slop:delta");
    expect(scripts.wrapped).toBe(
      "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- pnpm bkit:lint:prose",
    );
  });

  it("leaves the old key when the new key exists", () => {
    seed({ "lint:prose": "old-linter", "bkit:lint:prose": "new-linter" });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const ctx = run();
      const scripts = readScripts();
      expect(scripts["lint:prose"]).toBe("old-linter");
      expect(scripts["bkit:lint:prose"]).toBe("new-linter");
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const lines = logSpy.mock.calls.map((c) => String(c[0]));
      expect(lines.filter((l) => l.includes("lint:prose")).length).toBeLessThanOrEqual(1);
      expect(ctx.ws.writes.filter((w) => w.path === "package.json")).toEqual([]);
    } finally {
      logSpy.mockRestore();
      warnSpy.mockRestore();
    }
  });

  it("leaves a foreign graph script under its own name", () => {
    seed({ graph: "nx graph", dev: "pnpm graph && pnpm lint:prose" });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const scripts = readScripts();
    expect(scripts.graph).toBe("nx graph");
    expect(scripts["bkit:graph"]).toBeUndefined();
    expect(scripts.dev).toBe("pnpm graph && pnpm bkit:lint:prose");
  });

  it("warns on an old script name the rewrite cannot reach", () => {
    seed({ "lint:prose": "x", docs: "pnpm --filter web lint:prose" });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      run();
      const out = warnSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(out).toContain("package.json");
      expect(out).toContain("docs");
      expect(out).toContain("lint:prose");
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("leaves package.json untouched when it is not valid JSON", () => {
    const broken = '{ "name": "x", "scripts": { "lint:prose": "x", ';
    fs.writeFileSync("package.json", broken, "utf-8");
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const ctx = run();
      expect(fs.readFileSync("package.json", "utf-8")).toBe(broken);
      expect(ctx.ws.writes.filter((w) => w.path === "package.json")).toEqual([]);
      const out = [errSpy, logSpy, warnSpy]
        .flatMap((s) => s.mock.calls.map((c) => String(c[0])))
        .join("\n");
      expect(out).toMatch(/package\.json/);
    } finally {
      errSpy.mockRestore();
      logSpy.mockRestore();
      warnSpy.mockRestore();
    }
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
    for (const name of [
      "lint",
      "format:check",
      "bkit:lint:prose",
      "bkit:slop:delta",
      "test",
      "build",
    ]) {
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

  it("names a script the commit gate runs that the push gate runs again", () => {
    writeScripts({
      ...BKIT_GATE_SCRIPTS,
      "bkit:gate:format": "pnpm lint-staged && pnpm run test:placeholders && pnpm bkit:lint:prose",
      "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration",
    });
    const finding = detectGateAdvisories(tmpDir).find((f) => f.id === "gate-commit-repeats-push");
    expect(finding?.detect).toContain("`bkit:lint:prose`");
    expect(finding?.detect).toContain("`bkit:gate:static-unit-integration`");
    expect(finding?.detect).not.toContain("`test:placeholders`");
    expect(finding?.detect).not.toContain("`lint-staged`");
  });

  it("stays silent when the commit gate only formats staged files", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS });
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain("gate-commit-repeats-push");
  });

  it("advises declaring bkit:test:file until package.json has it, with the contract inline", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS });
    const finding = detectGateAdvisories(tmpDir).find((f) => f.id === "test-file-script-missing");
    expect(finding?.action).toContain("$BKIT_TEST_REPORT");
    expect(finding?.action).toContain('"bkit:test:file": "vitest run');
    writeScripts({ ...BKIT_GATE_SCRIPTS, "bkit:test:file": "pytest --junitxml=$BKIT_TEST_REPORT" });
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain("test-file-script-missing");
  });

  it("advises declaring bkit:lint:file once bkit:test:file is declared without it", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS });
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain("lint-file-script-missing");
    writeScripts({ ...BKIT_GATE_SCRIPTS, "bkit:test:file": "vitest run" });
    const finding = detectGateAdvisories(tmpDir).find((f) => f.id === "lint-file-script-missing");
    expect(finding?.action).toContain('"bkit:lint:file": "eslint --max-warnings=0"');
    writeScripts({
      ...BKIT_GATE_SCRIPTS,
      "bkit:test:file": "vitest run",
      "bkit:lint:file": "ruff check",
    });
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain("lint-file-script-missing");
  });

  it("returns nothing for an absent or malformed package.json", () => {
    fs.rmSync(path.join(tmpDir, "package.json"));
    expect(detectGateAdvisories(tmpDir)).toEqual([]);
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ nope", "utf-8");
    expect(detectGateAdvisories(tmpDir)).toEqual([]);
  });

  it("judges a gate name install has yet to seed at its default value", () => {
    writeScripts({ typecheck: "tsc --noEmit" });
    const finding = detectGateAdvisories(tmpDir).find(
      (f) => f.id === "gate-missing-called-scripts",
    );
    expect(finding?.detect).toContain("`lint`");
    expect(finding?.detect).not.toContain("`typecheck`");
  });

  it("every gate advisory restates what a gate may run, which bkit cannot check", () => {
    writeScripts({
      ...BKIT_GATE_SCRIPTS,
      "bkit:gate:format": "pnpm lint-staged && pnpm bkit:lint:prose",
      "bkit:gate:min": "true",
      "test:integration": "vitest run -c int",
    });
    const findings = [...detectGateAdvisories(tmpDir), ...detectNoopGates(tmpDir)].filter((f) =>
      f.id.startsWith("gate-"),
    );
    expect(findings.map((f) => f.id).sort()).toEqual([
      "gate-changed-script-missing",
      "gate-commit-repeats-push",
      "gate-missing-called-scripts",
      "gate-noop",
      "gate-tier-not-wired",
    ]);
    for (const f of findings) expect(f.action, f.id).toContain(GATE_CONTENTS_NOTE);
    expect(GATE_CONTENTS_NOTE).toContain(".bkit/workflows.md` § Local gate scripts");
  });

  it("tells a repo without bkit:gate:changed how to declare it, and what bkit passes it", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS });
    const finding = detectGateAdvisories(tmpDir).find(
      (f) => f.id === "gate-changed-script-missing",
    );
    expect(finding?.severity).toBe("advisory");
    expect(finding?.detect).toContain(`\`${BKIT_GATE_CHANGED_SCRIPT}\``);
    expect(finding?.action).toContain("repo-relative");
    expect(finding?.action).toContain(`"${BKIT_GATE_CHANGED_SCRIPT}": "`);
    expect(finding?.action).not.toMatch(/docs\/[a-z-]+\.md/);
  });

  it("stays silent once bkit:gate:changed is declared", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS, [BKIT_GATE_CHANGED_SCRIPT]: "node scripts/changed.mjs" });
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain(
      "gate-changed-script-missing",
    );
  });

  it("stays silent when bkit.advisories.ignore names gate-changed-script-missing", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "x",
        scripts: { ...BKIT_GATE_SCRIPTS },
        bkit: { advisories: { ignore: ["gate-changed-script-missing"] } },
      }),
      "utf-8",
    );
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain(
      "gate-changed-script-missing",
    );
  });

  it("runs in check (dry run) as well as install, with the same findings", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS, "test:integration": "vitest run -c int" });
    const idsFor = (dryRun: boolean): string[] => {
      const ctx = makeCtx({ dryRun });
      runCoreModule(ctx);
      return ctx.advisories
        .map((f) => f.id)
        .filter((id) => /^(gate-|test-file-script-missing$)/.test(id));
    };
    const check = idsFor(true);
    expect(check).toEqual(
      expect.arrayContaining([
        "gate-missing-called-scripts",
        "gate-tier-not-wired",
        "test-file-script-missing",
      ]),
    );
    expect(check).toEqual(idsFor(false));
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

describe("MED-5: first-install advisory block has no broken backslash-escape sequences", () => {
  it("advisories emitted on first install contain no literal \\$ sequence (backslash-dollar)", () => {
    // Ensure no .bkit-version exists (first install scenario)
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });

    dispatchModules(new Set(["core"]), ctx);

    const combined = advisories.map((a) => a.action).join("\n");

    // Must contain the first-install setup block (confirming it's the first-install block)
    expect(combined).toContain("Post-install steps");

    // Must NOT contain a literal backslash-dollar sequence.
    expect(combined).not.toContain("\\$");
  });

  it("advisory action for first-install is plain text (copy-paste safety)", () => {
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    const advisories: PreflightFinding[] = [];
    const ctx = makeCtx({ advisories });
    dispatchModules(new Set(["core"]), ctx);

    // The first-install advisory should have structured action text and no longer
    // prescribe the retired GitHub Packages install token.
    const firstInstallAdvisory = advisories.find((a) => a.id === "first-install-postinstall-steps");
    expect(firstInstallAdvisory).toBeDefined();
    expect(firstInstallAdvisory?.action).toContain("package.json");
    expect(firstInstallAdvisory?.action).not.toContain("BKIT_GH_TOKEN_INSTALL");
  });
});

describe(".bkit-version first-run signal extra-logging", () => {
  it("first install (no .bkit-version) emits post-install setup in advisories", () => {
    const advisories: PreflightFinding[] = [];
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws, advisories });

    // Ensure no .bkit-version exists
    const versionFile = path.join(tmpDir, ".bkit", "version");
    expect(fs.existsSync(versionFile)).toBe(false);

    // dispatchModules flushes postDispatch (where .bkit-version is written)
    dispatchModules(new Set(["core"]), ctx);

    // advisories should contain the post-install setup
    const combined = advisories.map((a) => a.action).join("\n");
    expect(combined).toContain("Post-install steps");
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

describe(".bkit/version canonicalHashes — install prunes entries for absent paths", () => {
  it("drops a stale entry a retired or renamed managed file left behind", () => {
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: readInstallingVersion(),
      canonicalHashes: { "retired/never-shipped-again.md": "dead-hash" },
      claudeAllowDerived: [],
    });

    // dispatchModules flushes postDispatch (where .bkit/version is rewritten).
    dispatchModules(new Set(["core"]), makeCtx());

    const after = readBkitVersion(versionFile)!;
    expect(after.canonicalHashes["retired/never-shipped-again.md"]).toBeUndefined();
    // A file this run wrote is recorded with its current hash.
    expect(after.canonicalHashes["AGENTS.md"]).toBe(hashFile(path.join(tmpDir, "AGENTS.md")));
  });
});

// ---------------------------------------------------------------------------
// bkit-source `.agents/*.md` files must NOT leak to consumers: the package ships
// no `.agents/` payload (only `.bkit/core/.agents/` sources), and the templates
// pass is the only writer, so a consumer rules.md never carries bkit's
// out-of-block content.
// ---------------------------------------------------------------------------

describe("bkit-source `.agents/{rules,docs,skills}.md` must not leak to consumers", () => {
  it("first install matches the template (no out-of-block content from bkit's source rules.md)", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    const consumerRules = fs.readFileSync(path.join(tmpDir, ".agents", "rules.md"), "utf-8");

    // Template content (what consumers SHOULD get) lives in the package's
    // .bkit/core/.agents/rules.md — resolve from the running package root.
    const pkgRoot = path.resolve(import.meta.dirname, "..", "..", "..", "..", "..");
    const templatePath = path.join(pkgRoot, ".bkit", "core", ".agents", "rules.md");
    const template = applyTokens(fs.readFileSync(templatePath, "utf-8"), ctx.tokens);

    // Both files have markers — the inner block content must match (modulo
    // surrounding-newline normalisation done by updateManagedBlock).
    const consumerBlock = extractManagedBlock(consumerRules, "html-comment");
    const templateBlock = extractManagedBlock(template, "html-comment");
    expect(consumerBlock).not.toBeNull();
    expect(consumerBlock).toBe(templateBlock);
  });

  it("rules.md is reachable via the templates pass — no additive leak path", () => {
    // Simulates a brand-new consumer: no .agents/ exists. After runCoreModule,
    // the only writer of `.agents/rules.md` is the templates pass (sourced from
    // `.bkit/core/.agents/rules.md`).
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

// ---------------------------------------------------------------------------
// Migration: .agents/shortcuts.md (5.1.0 – 5.2.4) and .bkit/lite.md → consumer-owned stub
// ---------------------------------------------------------------------------

describe("migrateLinearTeamKey (via seedCorePackageJsonScripts)", () => {
  const seed = (bkit: Record<string, unknown>): void =>
    fs.writeFileSync("package.json", JSON.stringify({ name: "x", bkit }, null, 4) + "\n", "utf-8");
  const read = (): string => fs.readFileSync("package.json", "utf-8");
  const bkitKey = (): Record<string, unknown> => JSON.parse(read()).bkit;
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    migrateLinearTeamKey(ctx.dryRun, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const touched = (ctx: ModuleContext): boolean =>
    ctx.ws.writes.some((w) => w.path === "package.json");

  it("moves a 5.4.x bkit.linearTeam to bkit.linear.team, keeping the file's indent", () => {
    seed({ issueTracker: "linear", linearTeam: "ENG" });
    expect(touched(run())).toBe(true);
    expect(bkitKey()).toEqual({ issueTracker: "linear", linear: { team: "ENG" } });
    expect(read()).toMatch(/\n {4}"bkit"/);
  });

  it("keeps an existing bkit.linear.team and the other linear keys, and drops a blank old key", () => {
    seed({ linearTeam: "OLD", linear: { team: "NEW", review: "Code Review" } });
    run();
    expect(bkitKey()).toEqual({ linear: { team: "NEW", review: "Code Review" } });
    seed({ linearTeam: "  " });
    run();
    expect(bkitKey()).toEqual({});
  });

  it("leaves a jira config alone: no write, bkit.jira untouched", () => {
    const jira = { site: "https://acme.atlassian.net", project: "ENG", review: "Code Review" };
    seed({ issueTracker: "jira", jira });
    const before = read();
    expect(touched(run())).toBe(false);
    expect(read()).toBe(before);
    expect(bkitKey()).toEqual({ issueTracker: "jira", jira });
  });

  it("under dry-run records the same write and leaves the file", () => {
    seed({ linearTeam: "ENG" });
    const before = read();
    expect(touched(run(true))).toBe(true);
    expect(read()).toBe(before);
  });

  it("is idempotent, and runs on every install through the core module", () => {
    seed({ linearTeam: "ENG" });
    dispatchModules(new Set(["core"]), makeCtx({}));
    // The full install also moves it under bkit.tracker and seeds the other linear keys.
    expect((bkitKey().tracker as Record<string, unknown>).linear).toMatchObject({ team: "ENG" });
    expect(touched(run())).toBe(false);
  });
});

describe("seedBkitDefaults (via seedCorePackageJsonScripts)", () => {
  const seed = (pkg: Record<string, unknown>): void =>
    fs.writeFileSync(
      "package.json",
      JSON.stringify({ name: "x", ...pkg }, null, 4) + "\n",
      "utf-8",
    );
  const read = (): string => fs.readFileSync("package.json", "utf-8");
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    seedBkitDefaults(ctx.dryRun, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const touched = (ctx: ModuleContext): boolean =>
    ctx.ws.writes.some((w) => w.path === "package.json");

  it("writes every bkit setting when missing, creating the bkit block, keeping the indent", () => {
    seed({});
    expect(touched(run())).toBe(true);
    expect(JSON.parse(read()).bkit).toEqual(SEEDED_BKIT_DEFAULTS);
    expect(read()).toMatch(/\n {4}"bkit"/);
  });

  it("writes defaults where a key has one and an empty value only for a choice not made", () => {
    expect(SEEDED_BKIT_DEFAULTS).toMatchObject({
      tracker: {
        default: "",
        github: { project: "", progress: "In progress", review: "In review" },
        linear: { team: "", project: "", progress: "started", review: "In Review" },
        jira: { site: "", project: "", progress: "In Progress", review: "In Review" },
      },
      cloud: { agent: "" },
      providers: { opencode: { default: "", installed: [] } },
      testing: {
        ciWorkflow: "bkit-ci.yml",
        ciCapstone: "bkit-tests-check",
        ciRequired: [],
        minPushPaths: [],
        ciSkipPaths: [],
        ciGenerated: [],
      },
      workflows: {
        minFreeGb: 40,
        worktree: { copy: [".env", ".env.local"], install: true },
        tasks: {
          maxPerGroup: 5,
          maxTestsPerGroup: 25,
          maxTestsPerTask: 10,
          maxTestFilesPerTask: 3,
        },
        design: { grill: { ask: true, maxTurns: 6 } },
        build: {
          verify: { ask: true, maxAttempts: 2 },
          challenge: { ask: true, maxAttempts: 2 },
          tests: { ask: true, maxAttempts: 2 },
        },
        debug: { fix: { ask: true, maxAttempts: 2 }, soak: { ask: true, maxAttempts: 2 } },
        ship: { merge: { ask: true, maxAttempts: 2 } },
      },
      prompts: { roadmapNext: 25 },
      dependencies: { updater: "" },
      advisories: { ignore: [] },
    });
  });

  it("reads back as the same config as an empty bkit block", () => {
    seed({});
    const empty = readBkitConfig(".");
    run();
    expect(readBkitConfig(".")).toEqual(empty);
  });

  it("fills missing keys inside a present block and never touches a value already set", () => {
    seed({
      bkit: {
        tracker: { default: "github", github: { project: false } },
        testing: { minPushPaths: ["notes/**"] },
        workflows: { worktree: { copy: [] }, build: { verify: { ask: "yes" } } },
      },
    });
    run();
    const bkit = JSON.parse(read()).bkit;
    expect(bkit.tracker.default).toBe("github");
    expect(bkit.tracker.github).toEqual({
      project: false,
      progress: "In progress",
      review: "In review",
    });
    expect(bkit.testing.minPushPaths).toEqual(["notes/**"]);
    expect(bkit.workflows.worktree).toEqual({ copy: [], install: true });
    expect(bkit.workflows.build.verify).toEqual({ ask: "yes", maxAttempts: 2 });
    const before = read();
    expect(touched(run())).toBe(false);
    expect(read()).toBe(before);
  });

  it("install writes tasks when missing and keeps a set value", () => {
    seed({ bkit: { cloud: { agent: "" } } });
    run();
    expect(JSON.parse(read()).bkit.workflows.tasks).toEqual({
      maxPerGroup: 5,
      maxTestsPerGroup: 25,
      maxTestsPerTask: 10,
      maxTestFilesPerTask: 3,
    });
    seed({ bkit: { workflows: { tasks: { maxPerGroup: 5, maxTestsPerTask: 0 } } } });
    run();
    expect(JSON.parse(read()).bkit.workflows.tasks).toEqual({
      maxPerGroup: 5,
      maxTestsPerTask: 0,
      maxTestsPerGroup: 25,
      maxTestFilesPerTask: 3,
    });
  });

  it("seeds build.publish on install", () => {
    seed({});
    run();
    expect(JSON.parse(read()).bkit.workflows.build.publish).toEqual({ remote: true, local: true });
  });

  it("keeps an existing publish.local false on upgrade", () => {
    seed({ bkit: { workflows: { build: { publish: { local: false } } } } });
    run();
    expect(JSON.parse(read()).bkit.workflows.build.publish).toEqual({ remote: true, local: false });
  });

  it("seeds publish without dropping the ask blocks", () => {
    seed({});
    run();
    expect(JSON.parse(read()).bkit.workflows.build).toEqual({
      verify: { ask: true, maxAttempts: 2 },
      challenge: { ask: true, maxAttempts: 2 },
      tests: { ask: true, maxAttempts: 2 },
      publish: { remote: true, local: true },
    });
  });

  it("seeds publish when the bkit block has no build", () => {
    seed({ bkit: { workflows: { minFreeGb: 10 } } });
    run();
    const build = JSON.parse(read()).bkit.workflows.build;
    expect(build.publish).toEqual({ remote: true, local: true });
    expect(build.verify).toEqual({ ask: true, maxAttempts: 2 });
  });

  it("leaves a non-object nested block alone", () => {
    seed({ bkit: { tracker: { github: "x" } } });
    run();
    expect(JSON.parse(read()).bkit.tracker.github).toBe("x");
  });

  it("leaves a non-object bkit value alone", () => {
    seed({ bkit: "x" });
    const before = read();
    expect(touched(run())).toBe(false);
    expect(read()).toBe(before);
  });

  it("sets dependencies.updater to the one updater whose config is present", () => {
    fs.mkdirSync(".github", { recursive: true });
    fs.writeFileSync(path.join(".github", "renovate.json5"), "{}\n");
    seed({});
    run();
    expect(JSON.parse(read()).bkit.dependencies.updater).toBe("renovate");
    seed({ bkit: { dependencies: { updater: "" } } });
    expect(touched(run())).toBe(true);
    expect(JSON.parse(read()).bkit.dependencies.updater).toBe("renovate");
    const before = read();
    expect(touched(run())).toBe(false);
    expect(read()).toBe(before);
  });

  it("never overwrites a set dependencies.updater, and leaves it empty when both configs are present", () => {
    fs.mkdirSync(".github", { recursive: true });
    fs.writeFileSync(path.join(".github", "dependabot.yml"), "version: 2\n");
    seed({ bkit: { dependencies: { updater: "none" } } });
    run();
    expect(JSON.parse(read()).bkit.dependencies.updater).toBe("none");
    fs.writeFileSync(path.join(".github", "renovate.json5"), "{}\n");
    seed({});
    run();
    expect(JSON.parse(read()).bkit.dependencies.updater).toBe("");
  });

  it("under dry-run records the updater write and leaves the file", () => {
    fs.mkdirSync(".github", { recursive: true });
    fs.writeFileSync(path.join(".github", "dependabot.yml"), "version: 2\n");
    seed({ bkit: SEEDED_BKIT_DEFAULTS });
    const before = read();
    expect(touched(run(true))).toBe(true);
    expect(read()).toBe(before);
  });

  it("under dry-run records the same write and leaves the file, so `bkit check` reports it", () => {
    seed({});
    const before = read();
    expect(touched(run(true))).toBe(true);
    expect(read()).toBe(before);
  });

  it("is idempotent, and runs on every install through the core module", () => {
    seed({});
    dispatchModules(new Set(["core"]), makeCtx({}));
    expect(JSON.parse(read()).bkit).toEqual(SEEDED_BKIT_DEFAULTS);
    expect(touched(run())).toBe(false);
  });
});

describe("migrateGithubProjectKey (via seedCorePackageJsonScripts)", () => {
  const seed = (bkit: Record<string, unknown>): void =>
    fs.writeFileSync("package.json", JSON.stringify({ name: "x", bkit }, null, 4) + "\n", "utf-8");
  const read = (): string => fs.readFileSync("package.json", "utf-8");
  const bkitKey = (): Record<string, unknown> => JSON.parse(read()).bkit;
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    migrateGithubProjectKey(ctx.dryRun, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const touched = (ctx: ModuleContext): boolean =>
    ctx.ws.writes.some((w) => w.path === "package.json");
  const templateBoard = {
    owner: "acme",
    number: 1,
    statusFieldId: 350038178,
    progressOptionId: "47fc9ee4",
    reviewOptionId: "df73e18b",
    doneOptionId: "98236657",
  };

  it("moves a 5.5.x template board to bkit.github.project, keeping the file's indent", () => {
    seed({ issueTracker: "github", githubProject: templateBoard });
    expect(touched(run())).toBe(true);
    expect(bkitKey()).toEqual({
      issueTracker: "github",
      github: { project: "https://github.com/orgs/acme/projects/1" },
    });
    expect(read()).toMatch(/\n {4}"bkit"/);
  });

  it("keeps the opt-out as bkit.github.project false", () => {
    seed({ githubProject: false });
    run();
    expect(bkitKey()).toEqual({ github: { project: false } });
  });

  it("leaves the defaults for option ids it cannot name, and says which to set", () => {
    seed({ githubProject: { ...templateBoard, reviewOptionId: "0a1b2c3d" } });
    const lines: string[] = [];
    const spy = vi
      .spyOn(console, "log")
      .mockImplementation((line: string) => void lines.push(line));
    run();
    spy.mockRestore();
    expect(bkitKey()).toEqual({ github: { project: "https://github.com/orgs/acme/projects/1" } });
    expect(lines.join("\n")).toContain("set bkit.tracker.github.review to that option's name");
    expect(lines.join("\n")).not.toContain("bkit.tracker.github.progress");
  });

  it("keeps an existing bkit.github.project and drops a malformed old key", () => {
    seed({
      githubProject: templateBoard,
      github: { project: "https://github.com/users/me/projects/2", review: "QA" },
    });
    run();
    expect(bkitKey()).toEqual({
      github: { project: "https://github.com/users/me/projects/2", review: "QA" },
    });
    for (const bad of [{ number: 1 }, { owner: "acme", number: "x" }, "acme", null]) {
      seed({ githubProject: bad });
      run();
      expect(bkitKey()).toEqual({});
    }
  });

  it("leaves a config without the old key alone", () => {
    seed({ issueTracker: "github", github: { project: false } });
    const before = read();
    expect(touched(run())).toBe(false);
    expect(read()).toBe(before);
  });

  it("under dry-run records the same write and leaves the file", () => {
    seed({ githubProject: templateBoard });
    const before = read();
    expect(touched(run(true))).toBe(true);
    expect(read()).toBe(before);
  });

  it("is idempotent, and runs on every install through the core module", () => {
    seed({ githubProject: templateBoard });
    dispatchModules(new Set(["core"]), makeCtx({}));
    // The full install also moves it under bkit.tracker and seeds the other github keys.
    expect((bkitKey().tracker as Record<string, unknown>).github).toMatchObject({
      project: "https://github.com/orgs/acme/projects/1",
    });
    expect(touched(run())).toBe(false);
  });
});

describe("migrateBkitLayout (via seedCorePackageJsonScripts)", () => {
  const seed = (bkit: unknown): void =>
    fs.writeFileSync("package.json", JSON.stringify({ name: "x", bkit }, null, 4) + "\n", "utf-8");
  const read = (): string => fs.readFileSync("package.json", "utf-8");
  const bkitKey = (): Record<string, unknown> => JSON.parse(read()).bkit;
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    migrateBkitLayout(ctx.dryRun, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const touched = (ctx: ModuleContext): boolean =>
    ctx.ws.writes.some((w) => w.path === "package.json");

  it("moves every flat 5.5.x key to its section, keeping the file's indent", () => {
    seed({
      issueTracker: "linear",
      linear: { team: "ENG" },
      cloudAgents: "claude",
      opencodeProvider: "openrouter",
      opencodeProviders: ["openrouter"],
      ciWorkflow: "ci.yml",
      capstoneJob: "gate",
      minPushPaths: ["docs/**"],
      shipGateRequiredLanes: ["e2e"],
      disk: { minFreeGb: 20 },
      worktree: { install: false },
      tasks: { maxPerGroup: 4 },
      roadmapNext: 10,
      depUpdater: "none",
      ignoreAdvisories: ["x"],
    });
    expect(touched(run())).toBe(true);
    expect(bkitKey()).toEqual({
      tracker: { default: "linear", linear: { team: "ENG" } },
      cloud: { agent: "claude" },
      providers: { opencode: { default: "openrouter", installed: ["openrouter"] } },
      testing: {
        minPushPaths: ["docs/**"],
        ciCapstone: "gate",
        ciWorkflow: "ci.yml",
        ciRequired: ["e2e"],
      },
      workflows: { minFreeGb: 20, worktree: { install: false }, tasks: { maxPerGroup: 4 } },
      prompts: { roadmapNext: 10 },
      dependencies: { updater: "none" },
      advisories: { ignore: ["x"] },
    });
    expect(read()).toMatch(/\n {4}"bkit"/);
  });

  it("moves a 6.0.0 testing.shipGate to testing.ciRequired, and a ciRequired already set wins", () => {
    seed({ testing: { ciWorkflow: "ci.yml", shipGate: ["e2e"] } });
    expect(touched(run())).toBe(true);
    expect(bkitKey().testing).toEqual({ ciWorkflow: "ci.yml", ciRequired: ["e2e"] });
    seed({ testing: { shipGate: ["e2e"], ciRequired: [] } });
    expect(touched(run())).toBe(true);
    expect(bkitKey().testing).toEqual({ ciRequired: [] });
  });

  it("a value already at the new path wins; two blocks merge key by key", () => {
    seed({
      issueTracker: "github",
      tracker: { default: "jira" },
      github: { project: false, review: "QA" },
      testing: { ciWorkflow: "new.yml" },
      ciWorkflow: "old.yml",
    });
    run();
    expect(bkitKey()).toEqual({
      tracker: { default: "jira", github: { project: false, review: "QA" } },
      testing: { ciWorkflow: "new.yml" },
    });
    seed({ linear: { team: "OLD", review: "R" }, tracker: { linear: { team: "NEW" } } });
    run();
    expect(bkitKey()).toEqual({ tracker: { linear: { team: "NEW", review: "R" } } });
  });

  it("turns loopPause into ask on every point, keeping an ask already set", () => {
    seed({ loopPause: false, workflows: { build: { verify: { ask: true, maxAttempts: 3 } } } });
    run();
    const workflows = bkitKey().workflows as Record<string, Record<string, unknown>>;
    expect(bkitKey()).not.toHaveProperty("loopPause");
    expect(workflows.build).toEqual({
      verify: { ask: true, maxAttempts: 3 },
      challenge: { ask: false },
      tests: { ask: false },
    });
    expect(workflows.design).toEqual({ grill: { ask: false } });
    expect(workflows.debug).toEqual({ fix: { ask: false }, soak: { ask: false } });
    expect(workflows.ship).toEqual({ merge: { ask: false } });
    seed({ loopPause: "yes" });
    run();
    expect(bkitKey()).toEqual({});
  });

  it("leaves an old key in place when a non-object holds its new section", () => {
    seed({ cloud: "x", cloudAgents: "claude" });
    run();
    expect(bkitKey()).toEqual({ cloud: "x", cloudAgents: "claude" });
  });

  it("leaves a config already in the new layout alone", () => {
    seed({ tracker: { default: "github" }, workflows: { minFreeGb: 40 } });
    const before = read();
    expect(touched(run())).toBe(false);
    expect(read()).toBe(before);
  });

  it("under dry-run records the same write and leaves the file", () => {
    seed({ issueTracker: "github" });
    const before = read();
    expect(touched(run(true))).toBe(true);
    expect(read()).toBe(before);
  });

  it("is idempotent, and runs on every install through the core module", () => {
    seed({ issueTracker: "github", loopPause: false, disk: { minFreeGb: 12 } });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const bkit = bkitKey() as Record<string, Record<string, unknown>>;
    expect(bkit.tracker!.default).toBe("github");
    expect(bkit.workflows!.minFreeGb).toBe(12);
    expect(bkit.workflows!.ship).toEqual({ merge: { ask: false, maxAttempts: 2 } });
    expect(bkit.testing!.ciSkipPaths).toEqual([]);
    expect(bkit).not.toHaveProperty("disk");
    expect(touched(run())).toBe(false);
  });
});

describe("pruneMinPushPaths (via seedCorePackageJsonScripts)", () => {
  const seed = (bkit: unknown): void =>
    fs.writeFileSync("package.json", JSON.stringify({ name: "x", bkit }, null, 2) + "\n", "utf-8");
  const read = (): string => fs.readFileSync("package.json", "utf-8");
  const testing = (): Record<string, unknown> => JSON.parse(read()).bkit.testing;
  const run = (dryRun = false): boolean => {
    const ctx = makeCtx({ dryRun });
    return pruneMinPushPaths(ctx.dryRun, ctx.ws, ctx.logPrefix);
  };

  it("drops what bkit always allows and what ciSkipPaths already names, keeping the rest", () => {
    seed({
      testing: {
        minPushPaths: [
          "docs/**",
          ".bkit/*.jsonl",
          "docs/plans/**",
          "docs/*.jsonl",
          "CHANGELOG.md",
          "README.md",
        ],
        ciSkipPaths: ["CHANGELOG.md", "README.md"],
      },
    });
    expect(run()).toBe(true);
    expect(testing()).toEqual({
      minPushPaths: ["docs/**"],
      ciSkipPaths: ["CHANGELOG.md", "README.md"],
    });
    expect(run()).toBe(false);
  });

  it("a 6.0.x seed becomes []; a dry run writes nothing; a list it cannot shorten is left alone", () => {
    seed({ testing: { minPushPaths: ["docs/plans/**", "docs/*.jsonl", ".bkit/*.jsonl"] } });
    const before = read();
    expect(run(true)).toBe(true);
    expect(read()).toBe(before);
    expect(run()).toBe(true);
    expect(testing().minPushPaths).toEqual([]);
    seed({ testing: { minPushPaths: ["notes/**"] } });
    expect(run()).toBe(false);
    seed({ testing: { ciWorkflow: "ci.yml" } });
    expect(run()).toBe(false);
    expect(testing()).toEqual({ ciWorkflow: "ci.yml" });
  });
});

describe("migrateRetiredDevLock (via runBkitDocs)", () => {
  const LOCK = path.join(".bkit", ".dev.lock");
  const HELD = '{"pid":4242,"host":"old","ts":1760000000000,"line":"ship 638-x"}\n';
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const paths = (ctx: ModuleContext): string[] => ctx.ws.writes.map((w) => path.normalize(w.path));
  const seed = (): void => {
    fs.mkdirSync(".bkit", { recursive: true });
    fs.writeFileSync(LOCK, HELD, "utf-8");
  };

  it("deletes a 5.3.x dev lock left behind and records the delete", () => {
    seed();
    const ctx = run();
    expect(fs.existsSync(LOCK)).toBe(false);
    expect(paths(ctx)).toContain(LOCK);
  });

  it("under dry-run records the same delete and leaves the file", () => {
    seed();
    const ctx = run(true);
    expect(fs.readFileSync(LOCK, "utf-8")).toBe(HELD);
    expect(paths(ctx)).toContain(LOCK);
  });

  it("is idempotent, and never removes a directory at that path", () => {
    seed();
    run();
    expect(paths(run())).not.toContain(LOCK);
    fs.mkdirSync(LOCK);
    expect(paths(run())).not.toContain(LOCK);
    expect(fs.statSync(LOCK).isDirectory()).toBe(true);
  });
});

describe("migrateTemplateNotes (via runBkitDocs)", () => {
  // The plan-template note 5.2.3 – 6.0.0 installed above `<!-- bkit:start -->`.
  const OLD_NOTE =
    "<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->";
  const PLAN = path.join("docs", "templates", "bkit-plan.md");
  const BLOCK = "<!-- bkit:start -->\n\n# Plan\n\n<!-- bkit:end -->\n";

  it("removes the old note above the block and records the write", () => {
    fs.mkdirSync(path.dirname(PLAN), { recursive: true });
    fs.writeFileSync(PLAN, `${OLD_NOTE}\n\n${BLOCK}`, "utf-8");
    const ctx = makeCtx();
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    expect(fs.readFileSync(PLAN, "utf-8")).toBe(BLOCK);
    expect(ctx.ws.writes.map((w) => path.normalize(w.path))).toContain(PLAN);
  });
});

describe("migrateJiraKeyName (via runBkitDocs)", () => {
  const ENV = path.join(".bkit", ".env");
  const run = (dryRun = false): { ctx: ModuleContext; logs: string[] } => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => {
      logs.push(a.join(" "));
    });
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    spy.mockRestore();
    return { ctx, logs };
  };
  const seed = (text: string): void => {
    fs.mkdirSync(".bkit", { recursive: true });
    fs.writeFileSync(ENV, text, "utf-8");
  };

  it("renames BKIT_JIRA_API_TOKEN to BKIT_JIRA_API_KEY in .bkit/.env, value kept, never logged or hashed", () => {
    seed("BKIT_GH_TOKEN=gh\n# BKIT_JIRA_API_TOKEN — note\nBKIT_JIRA_API_TOKEN=atl-secret\n");
    const { ctx, logs } = run();
    expect(fs.readFileSync(ENV, "utf-8")).toBe(
      "BKIT_GH_TOKEN=gh\n# BKIT_JIRA_API_KEY — note\nBKIT_JIRA_API_KEY=atl-secret\n",
    );
    expect(logs.join("\n")).toContain("BKIT_JIRA_API_KEY");
    expect(logs.join("\n")).not.toContain("atl-secret");
    expect(ctx.ws.writes.map((w) => path.normalize(w.path))).not.toContain(ENV);
  });

  it("dry-run leaves the file; a second run and an already-renamed file change nothing", () => {
    seed("BKIT_JIRA_API_TOKEN=x\n");
    run(true);
    expect(fs.readFileSync(ENV, "utf-8")).toBe("BKIT_JIRA_API_TOKEN=x\n");
    run();
    run();
    expect(fs.readFileSync(ENV, "utf-8")).toBe("BKIT_JIRA_API_KEY=x\n");
  });

  it("leaves both lines alone when the new name is already set", () => {
    seed("BKIT_JIRA_API_KEY=new\nBKIT_JIRA_API_TOKEN=old\n");
    run();
    expect(fs.readFileSync(ENV, "utf-8")).toBe("BKIT_JIRA_API_KEY=new\nBKIT_JIRA_API_TOKEN=old\n");
  });
});

describe("migrateModelOverrideAgentNames (via runBkitDocs)", () => {
  const PROMPTS = path.join(".bkit", "prompts.md");
  const OLD_ROW = "| `bkit-build-plan-execute` | openrouter | openai/gpt-6.1-sol |";
  const NEW_ROW = "| `bkit-build-plan-tasks` | openrouter | openai/gpt-6.1-sol |";
  const run = (dryRun = false): { ctx: ModuleContext; logs: string[] } => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => {
      logs.push(a.join(" "));
    });
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    spy.mockRestore();
    return { ctx, logs };
  };
  /** The installed prompts.md as an older install left it, with `rows` under Model Overrides. */
  const seed = (...rows: string[]): void => {
    fs.mkdirSync(".bkit", { recursive: true });
    const rendered = applyTokens(
      fs.readFileSync(path.join(getBkitDocsRoot(), "prompts.md"), "utf-8"),
      bkitDocTokens(makeCtx().tokens),
    );
    fs.writeFileSync(PROMPTS, rendered.trimEnd() + "\n" + rows.join("\n") + "\n", "utf-8");
  };
  const consumerRegion = (): string => {
    const text = fs.readFileSync(PROMPTS, "utf-8");
    return text.slice(text.indexOf("## Model Overrides"));
  };

  it("renames an old agent's override row in place, provider and model kept, and records the update", () => {
    seed("| `bkit-plan-review-2` | openrouter | x/y |", OLD_ROW);
    const { ctx, logs } = run();
    expect(consumerRegion()).toContain(NEW_ROW);
    expect(consumerRegion()).toContain("| `bkit-plan-review-2` | openrouter | x/y |");
    expect(consumerRegion()).not.toContain("bkit-build-plan-execute");
    expect(logs.join("\n")).toContain("bkit-build-plan-execute -> bkit-build-plan-tasks");
    expect(ctx.ws.writes).toContainEqual({ path: PROMPTS, action: "update" });
  });

  it("dry-run computes the same write but leaves the file; a second run changes nothing", () => {
    seed(OLD_ROW);
    const dry = run(true);
    expect(consumerRegion()).toContain(OLD_ROW);
    expect(dry.ctx.ws.writes).toContainEqual({ path: PROMPTS, action: "update" });
    run();
    const again = run();
    expect(consumerRegion()).toContain(NEW_ROW);
    expect(again.ctx.ws.writes).not.toContainEqual({ path: PROMPTS, action: "update" });
    expect(again.logs.join("\n")).not.toContain("Model Overrides renamed");
  });

  it("leaves the old row alone when a row already names the new agent", () => {
    seed(NEW_ROW.replace("openai/gpt-6.1-sol", "x/new"), OLD_ROW);
    run();
    expect(consumerRegion()).toContain(OLD_ROW);
    expect(consumerRegion()).toContain(NEW_ROW.replace("openai/gpt-6.1-sol", "x/new"));
  });

  it("never touches a row inside the managed block, and does nothing without a Model Overrides section", () => {
    fs.mkdirSync(".bkit", { recursive: true });
    fs.writeFileSync(PROMPTS, "<!-- bkit:start -->\n" + OLD_ROW + "\n<!-- bkit:end -->\n", "utf-8");
    const { logs } = run();
    expect(logs.join("\n")).not.toContain("Model Overrides renamed");
    expect(fs.readFileSync(PROMPTS, "utf-8")).not.toContain("bkit-build-plan-tasks` | openrouter");
  });
});

describe("migrateContextCiWorkflow (via runBkitDocs)", () => {
  const CONTEXT = path.join(".agents", "context.md");
  const OLD_LOOKUP =
    'RUN_JSON=$(gh run list --branch "$(git branch --show-current)" --limit 1 \\\n' +
    "  --json databaseId,conclusion,headSha 2>/dev/null || echo '[]')";
  const seeded =
    "<!-- bkit:start -->\n\n# Context\n\n<!-- bkit:end -->\n\n" +
    "<!-- context-fetch:start github context=ci -->\n\n```bash\n" +
    OLD_LOOKUP +
    "\n```\n\n<!-- context-fetch:end -->\n";
  const run = (dryRun = false): { ctx: ModuleContext; logs: string[] } => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => {
      logs.push(a.join(" "));
    });
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    spy.mockRestore();
    return { ctx, logs };
  };
  const seed = (): void => {
    fs.mkdirSync(".agents", { recursive: true });
    fs.writeFileSync(CONTEXT, seeded, "utf-8");
  };
  const updates = (ctx: ModuleContext): number =>
    ctx.ws.writes.filter((w) => path.normalize(w.path) === CONTEXT).length;

  it("scopes an old CI run lookup to the configured CI workflow and records the update", () => {
    fs.writeFileSync(
      "package.json",
      JSON.stringify({ name: "test-project", bkit: { testing: { ciWorkflow: "ci.yml" } } }),
      "utf-8",
    );
    seed();
    const { ctx, logs } = run();
    const text = fs.readFileSync(CONTEXT, "utf-8");
    expect(text).toContain(
      'CI_WORKFLOW="${CI_WORKFLOW:-ci.yml}"\nRUN_JSON=$(gh run list --branch "$(git branch --show-current)" --workflow "$CI_WORKFLOW" --limit 1 \\\n',
    );
    expect(updates(ctx)).toBe(1);
    expect(logs.join("\n")).toContain(`${CONTEXT} — CI run lookups now read only ci.yml runs (1)`);
  });

  it("dry-run computes the same write but leaves the file; a second run changes nothing", () => {
    seed();
    const dry = run(true);
    expect(fs.readFileSync(CONTEXT, "utf-8")).toBe(seeded);
    expect(updates(dry.ctx)).toBe(1);
    run();
    expect(fs.readFileSync(CONTEXT, "utf-8")).toContain(
      'CI_WORKFLOW="${CI_WORKFLOW:-bkit-ci.yml}"',
    );
    const again = run();
    expect(updates(again.ctx)).toBe(0);
    expect(again.logs.join("\n")).not.toContain("CI run lookups");
  });

  it("names a lookup it cannot rewrite, once per process, and leaves it alone", () => {
    fs.mkdirSync(".agents", { recursive: true });
    const edited = seeded.replace("--limit 1", "--limit 3");
    fs.writeFileSync(CONTEXT, edited, "utf-8");
    const warns: string[] = [];
    const spy = vi.spyOn(console, "warn").mockImplementation((...a: unknown[]) => {
      warns.push(a.join(" "));
    });
    const first = run();
    run();
    spy.mockRestore();
    expect(fs.readFileSync(CONTEXT, "utf-8")).toBe(edited);
    expect(updates(first.ctx)).toBe(0);
    expect(warns.filter((w) => w.includes("--workflow"))).toHaveLength(1);
  });
});

describe("migrateLedgerSchema (via runBkitDocs)", () => {
  const LEDGER = path.join("docs", "deferrals.jsonl");
  const OLD =
    '{"ts":1760000000123,"kind":"deferral","repo":"acme/widgets","bkitVersion":"5.5.0","workflow":"build","step":"build-challenge","key":"k","category":"other","severity":"LOW","reason":"low-severity","description":"d"}\n';
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const paths = (ctx: ModuleContext): string[] => ctx.ws.writes.map((w) => path.normalize(w.path));
  const seed = (): void => {
    fs.mkdirSync("docs", { recursive: true });
    fs.writeFileSync(LEDGER, OLD, "utf-8");
  };

  it("rewrites a 5.5.x ledger row to schema 2 and records the write", () => {
    seed();
    const ctx = run();
    const row = JSON.parse(fs.readFileSync(LEDGER, "utf-8")) as Record<string, unknown>;
    expect(row).toMatchObject({
      schema: 2,
      ts: 1760000000123,
      bkit: { version: "5.5.0" },
      by: { workflow: "build", step: "build-challenge" },
    });
    expect(row["bkitVersion"]).toBeUndefined();
    expect(paths(ctx)).toContain(LEDGER);
  });

  it("under dry-run records the same write and leaves the file", () => {
    seed();
    const ctx = run(true);
    expect(fs.readFileSync(LEDGER, "utf-8")).toBe(OLD);
    expect(paths(ctx)).toContain(LEDGER);
  });

  it("is idempotent", () => {
    seed();
    run();
    const once = fs.readFileSync(LEDGER, "utf-8");
    expect(paths(run())).not.toContain(LEDGER);
    expect(fs.readFileSync(LEDGER, "utf-8")).toBe(once);
  });
});

describe("migrateRetiredLite (via runBkitDocs)", () => {
  const OLD = path.join(".agents", "shortcuts.md");
  const LITE = path.join(".bkit", "lite.md");
  const SENTINEL = "<!-- bkit:retired-lite-stub -->";
  const OWN = "### hotfix\n\n```text\nShip the hotfix below.\n```";
  const OWN_OLD = "### nightly\n\n```text\nRun the nightly.\n```";
  const BLOCK =
    "<!-- bkit:start -->\n\n<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->\n\n# Lite Workflows\n\nbody\n\n<!-- bkit:end -->\n";
  const SHORTCUTS_BLOCK = BLOCK.replace("# Lite Workflows", "# Shortcuts");

  let savedGitDir: string | undefined;
  let savedWorkTree: string | undefined;

  beforeEach(() => {
    savedGitDir = process.env.GIT_DIR;
    savedWorkTree = process.env.GIT_WORK_TREE;
    delete process.env.GIT_DIR;
    delete process.env.GIT_WORK_TREE;
    spawnSync("git", ["init", "-q"], { cwd: tmpDir });
    process.env.GIT_DIR = path.join(tmpDir, ".git");
    process.env.GIT_WORK_TREE = tmpDir;
  });

  afterEach(() => {
    if (savedGitDir === undefined) delete process.env.GIT_DIR;
    else process.env.GIT_DIR = savedGitDir;
    if (savedWorkTree === undefined) delete process.env.GIT_WORK_TREE;
    else process.env.GIT_WORK_TREE = savedWorkTree;
    vi.restoreAllMocks();
  });

  const put = (file: string, text: string): void => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf-8");
  };
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const paths = (ctx: ModuleContext): string[] => ctx.ws.writes.map((w) => path.normalize(w.path));

  it("strips the managed block and keeps consumer lines", () => {
    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
    run();
    const lite = fs.readFileSync(LITE, "utf-8");
    expect(lite.split("\n")[0]).toBe(SENTINEL);
    expect(lite).toContain(OWN);
    expect(lite).not.toContain("bkit:start");
    expect(lite).not.toContain("bkit:managed");
    expect(lite).not.toContain("## Project Lite Workflows");
  });

  it("deletes .bkit/lite.md when it holds only the seeded heading", () => {
    put(LITE, `${BLOCK}\n## Project Lite Workflows\n`);
    const ctx = run();
    expect(fs.existsSync(LITE)).toBe(false);
    expect(paths(ctx)).toContain(LITE);
  });

  it("merges .agents/shortcuts.md consumer lines into the stub", () => {
    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
    const ctx = run();
    expect(fs.existsSync(OLD)).toBe(false);
    const lite = fs.readFileSync(LITE, "utf-8");
    expect(lite.split("\n")[0]).toBe(SENTINEL);
    expect(lite).toContain(OWN);
    expect(lite).toContain(OWN_OLD);
    expect(lite).not.toContain("## Project Shortcuts");
    expect(paths(ctx)).toContain(OLD);
  });

  it("creates the stub when the shortcuts merge finds no lite.md", () => {
    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
    expect(fs.existsSync(LITE)).toBe(false);
    run();
    expect(fs.existsSync(OLD)).toBe(false);
    expect(fs.readFileSync(LITE, "utf-8")).toBe(`${SENTINEL}\n\n${OWN_OLD}\n`);
  });

  it("leaves a blockless or two-block lite.md untouched and logs", () => {
    for (const text of [`# my notes\n\n${OWN}\n`, `${BLOCK}\n${BLOCK}\n${OWN}\n`]) {
      put(LITE, text);
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const ctx = run();
      expect(fs.readFileSync(LITE, "utf-8")).toBe(text);
      expect(paths(ctx)).not.toContain(LITE);
      const logged = warn.mock.calls.map((c) => String(c[0])).join("\n");
      expect(logged).toContain(LITE);
      expect(logged).not.toContain("<!-- bkit:end -->");
      warn.mockRestore();
    }
  });

  it("logs no fix and writes nothing on a second install over its own stub", () => {
    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
    run();
    const stub = fs.readFileSync(LITE, "utf-8");
    expect(stub.split("\n")[0]).toBe(SENTINEL);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const again = run();
    expect(warn).not.toHaveBeenCalled();
    expect(log.mock.calls.map((c) => String(c[0])).join("\n")).not.toContain("lite");
    expect(paths(again)).not.toContain(LITE);
    expect(fs.readFileSync(LITE, "utf-8")).toBe(stub);
  });

  it("is idempotent across a second install", () => {
    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
    run();
    const after = fs.readFileSync(LITE, "utf-8");
    expect(after.split("\n")[0]).toBe(SENTINEL);
    const again = run();
    expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
    expect(paths(again)).not.toContain(OLD);
    expect(paths(again)).not.toContain(LITE);
  });

  it("records the same write set in a dry run", () => {
    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
    const before = fs.readFileSync(LITE, "utf-8");
    const dry = run(true);
    expect(fs.readFileSync(LITE, "utf-8")).toBe(before);
    expect(fs.existsSync(OLD)).toBe(true);
    expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
    const real = run();
    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
    expect(paths(dry)).toEqual(paths(real));
  });

  it("installs no lite.md and still mirrors every other canonical doc", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);
    expect(fs.existsSync(LITE)).toBe(false);
    for (const name of ["workflows.md", "prompts.md", "templates.md", "README.md"]) {
      expect(fs.existsSync(path.join(".bkit", name)), name).toBe(true);
    }
  });
});

describe("migrateBrandedFileTokens (via runBkitDocs)", () => {
  const put = (file: string, text: string): void => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf-8");
  };
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };

  it("rewrites old script tokens in husky hooks and the CI workflow", () => {
    fs.writeFileSync(
      "package.json",
      JSON.stringify(
        {
          name: "x",
          scripts: { "lint:prose": "custom", "slop:delta": "custom" },
          bkit: { testing: { ciWorkflow: "ci.yml" } },
        },
        null,
        2,
      ) + "\n",
      "utf-8",
    );
    put(
      ".husky/pre-push",
      "#!/bin/sh\npnpm lint:prose\npnpm slop:delta\npnpm --filter web lint:prose\n",
    );
    put(
      ".github/workflows/ci.yml",
      "name: CI\njobs:\n  a:\n    steps:\n      - run: pnpm lint:prose\n",
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      run();
      const hook = fs.readFileSync(".husky/pre-push", "utf-8");
      expect(hook).toContain("pnpm bkit:lint:prose\n");
      expect(hook).toContain("pnpm bkit:slop:delta\n");
      expect(fs.readFileSync(".github/workflows/ci.yml", "utf-8")).toContain(
        "pnpm bkit:lint:prose",
      );
      expect(fs.existsSync(".husky/pre-commit")).toBe(false);
      expect(fs.existsSync(".github/workflows/bkit-ci.yml")).toBe(false);
      const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
      expect(out).toContain(".husky/pre-push");
      expect(out).toMatch(/pre-push:?\s*(line\s*)?4|pre-push.*:4/);
      expect(out).toContain("lint:prose");
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("warns on an old script name in a workflow it does not rewrite", () => {
    fs.writeFileSync(
      "package.json",
      JSON.stringify({ name: "x", scripts: { "lint:prose": "bkit ci prose" } }, null, 2) + "\n",
      "utf-8",
    );
    put(
      ".github/workflows/ci.yml",
      "name: CI\njobs:\n  a:\n    steps:\n      - run: pnpm lint:prose\n",
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      run();
      const out = warn.mock.calls.map((c) => String(c[0]));
      const lines = out.filter((l) => l.includes(".github/workflows/ci.yml")).join("\n");
      expect(lines).toContain("lint:prose");
      expect(fs.readFileSync(".github/workflows/ci.yml", "utf-8")).toContain("pnpm lint:prose");
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("warns on the old graph name only where a package manager runs it", () => {
    fs.writeFileSync(
      "package.json",
      JSON.stringify(
        {
          name: "x",
          scripts: { "bkit:graph": "bash scripts/graphify/bkit-graphify.sh build" },
          bkit: { testing: { ciWorkflow: "ci.yml" } },
        },
        null,
        2,
      ) + "\n",
      "utf-8",
    );
    put(
      ".github/workflows/ci.yml",
      [
        "name: CI",
        "# The graph is FLAT AND WIDE: scope fans out, capstone joins.",
        "jobs:",
        "  a:",
        "    steps:",
        "      # rebuild the graph with graphify",
        "      - run: npm run graph",
        "",
      ].join("\n"),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      run();
      const lines = warn.mock.calls
        .map((c) => String(c[0]))
        .filter((l) => l.includes('old script name "graph"'));
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain(".github/workflows/ci.yml:7");
    } finally {
      vi.restoreAllMocks();
    }
  });
});

describe("migrateBrandedTemplateFiles (via runBkitDocs)", () => {
  const CI_DIR = path.join("scripts", "ci");
  const put = (file: string, text: string): void => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf-8");
  };
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  /** The shipped pre-#748 content of a CI script, read from the committed v6.0.0 fixtures. */
  const shippedOld = (file: string): string => {
    return fs.readFileSync(
      path.join(
        originalCwd,
        ".bkit/core/engine/install/modules/__fixtures__/v6.0.0/scripts/ci",
        `${file}.fixture`,
      ),
      "utf-8",
    );
  };
  const templateFile = (file: string): string =>
    fs.readFileSync(path.join(getTemplatesRoot(), "scripts", "ci", file), "utf-8");
  const ADVISORIES = '{"advisories":[{"id":"GHSA-x"}]}\n';

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("moves shipped CI script units to bkit- names and rewrites their paths", () => {
    for (const f of [
      "check-capstone.mjs",
      "check-capstone.test.mjs",
      "check-dependency-audit.mjs",
      "check-dependency-audit.test.mjs",
    ]) {
      put(path.join(CI_DIR, f), shippedOld(f));
    }
    put(path.join(CI_DIR, "accepted-advisories.json"), ADVISORIES);
    put(
      ".github/workflows/bkit-ci.yml",
      "name: bkit-ci\njobs:\n  a:\n    steps:\n      - run: node scripts/ci/check-capstone.mjs\n",
    );
    put(".husky/pre-push", "#!/bin/sh\nnode scripts/ci/check-dependency-audit.mjs < /dev/null\n");
    run();

    expect(fs.existsSync(path.join(CI_DIR, "check-capstone.mjs"))).toBe(false);
    expect(fs.existsSync(path.join(CI_DIR, "check-capstone.test.mjs"))).toBe(false);
    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(false);
    expect(fs.existsSync(path.join(CI_DIR, "accepted-advisories.json"))).toBe(false);
    expect(fs.readFileSync(path.join(CI_DIR, "bkit-check-capstone.mjs"), "utf-8")).toBe(
      templateFile("bkit-check-capstone.mjs"),
    );
    const movedTest = fs.readFileSync(path.join(CI_DIR, "bkit-check-capstone.test.mjs"), "utf-8");
    expect(movedTest).toContain('./bkit-check-capstone.mjs"');
    expect(movedTest).not.toContain('"./check-capstone.mjs"');
    expect(fs.readFileSync(path.join(CI_DIR, "bkit-accepted-advisories.json"), "utf-8")).toBe(
      ADVISORIES,
    );
    expect(fs.readFileSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"), "utf-8")).toBe(
      templateFile("bkit-check-dependency-audit.mjs"),
    );
    const ci = fs.readFileSync(".github/workflows/bkit-ci.yml", "utf-8");
    expect(ci).toContain("node scripts/ci/bkit-check-capstone.mjs");
    expect(ci).not.toContain("node scripts/ci/check-capstone.mjs");
    expect(fs.readFileSync(".husky/pre-push", "utf-8")).toContain(
      "node scripts/ci/bkit-check-dependency-audit.mjs",
    );
  });

  it("leaves an edited or already-renamed unit and logs the manual move", () => {
    const edited = shippedOld("check-capstone.mjs") + "\n// consumer edit\n";
    put(path.join(CI_DIR, "check-capstone.mjs"), edited);
    put(path.join(CI_DIR, "check-capstone.test.mjs"), shippedOld("check-capstone.test.mjs"));
    const existing = "// consumer's own bkit-check-dependency-audit\n";
    put(path.join(CI_DIR, "check-dependency-audit.mjs"), shippedOld("check-dependency-audit.mjs"));
    put(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"), existing);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    run();

    expect(fs.readFileSync(path.join(CI_DIR, "check-capstone.mjs"), "utf-8")).toBe(edited);
    expect(fs.existsSync(path.join(CI_DIR, "check-capstone.test.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(CI_DIR, "bkit-check-capstone.mjs"))).toBe(false);
    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(true);
    expect(fs.readFileSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"), "utf-8")).toBe(
      existing,
    );
    const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
    expect(out).toContain("check-capstone");
    expect(out).toContain("check-dependency-audit");
  });

  it("leaves a unit whose old path a workflow outside the path pass still names", () => {
    put(path.join(CI_DIR, "check-dependency-audit.mjs"), shippedOld("check-dependency-audit.mjs"));
    put(
      path.join(CI_DIR, "check-dependency-audit.test.mjs"),
      shippedOld("check-dependency-audit.test.mjs"),
    );
    put(
      ".github/workflows/security.yml",
      "name: security\njobs:\n  audit:\n    steps:\n      - if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''\n        run: node scripts/ci/check-dependency-audit.mjs\n",
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    run();

    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"))).toBe(false);
    const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
    expect(out).toContain(".github/workflows/security.yml");
    expect(out).toContain("check-dependency-audit");
  });

  it("leaves a unit whose old path a composite action still names", () => {
    put(path.join(CI_DIR, "check-dependency-audit.mjs"), shippedOld("check-dependency-audit.mjs"));
    put(
      path.join(CI_DIR, "check-dependency-audit.test.mjs"),
      shippedOld("check-dependency-audit.test.mjs"),
    );
    put(
      ".github/actions/audit/action.yml",
      "runs:\n  using: composite\n  steps:\n    - if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''\n      run: node scripts/ci/check-dependency-audit.mjs\n      shell: bash\n",
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    run();

    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.test.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"))).toBe(false);
    const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
    expect(out).toContain(".github/actions/audit/action.yml");
    expect(out).toContain("check-dependency-audit");
  });

  it("does not write through a dangling bkit- target symlink", () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
    try {
      const payloadTarget = path.join(outside, "planted.json");
      put(path.join(CI_DIR, "accepted-advisories.json"), ADVISORIES);
      fs.symlinkSync(payloadTarget, path.join(CI_DIR, "bkit-accepted-advisories.json"));
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      run();

      expect(fs.existsSync(payloadTarget)).toBe(false);
      expect(
        fs.lstatSync(path.join(CI_DIR, "bkit-accepted-advisories.json")).isSymbolicLink(),
      ).toBe(true);
      const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
      expect(out).toContain("bkit-accepted-advisories.json");
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it("leaves a symlinked old data file in place", () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
    try {
      const secret = path.join(outside, "secret.txt");
      fs.writeFileSync(secret, "TOP-SECRET-BYTES\n", "utf-8");
      fs.mkdirSync(CI_DIR, { recursive: true });
      fs.symlinkSync(secret, path.join(CI_DIR, "accepted-advisories.json"));
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      run();

      expect(fs.readdirSync(CI_DIR)).not.toContain("bkit-accepted-advisories.json");
      expect(fs.lstatSync(path.join(CI_DIR, "accepted-advisories.json")).isSymbolicLink()).toBe(
        true,
      );
      const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
      expect(out).toContain("accepted-advisories.json");
      expect(out).not.toContain("TOP-SECRET-BYTES");
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

/** The shipped pre-#748 content of a template file, read from the committed v6.0.0 fixtures. */
function shippedAtV6(templateRel: string): string {
  return fs.readFileSync(
    path.join(
      originalCwd,
      ".bkit/core/engine/install/modules/__fixtures__/v6.0.0",
      `${templateRel}.fixture`,
    ),
    "utf-8",
  );
}

describe("migrateBrandedCheckNames (via runBkitDocs)", () => {
  const WF = path.join(".github", "workflows");
  const put = (file: string, text: string): void => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf-8");
  };
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const captured: string[] = [];
  const out = (): string => captured.join("\n");

  beforeEach(() => {
    captured.length = 0;
    vi.spyOn(console, "log").mockImplementation((m: unknown) => {
      captured.push(String(m));
    });
    vi.spyOn(console, "warn").mockImplementation((m: unknown) => {
      captured.push(String(m));
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rewrites shipped old workflow names and leaves customised ones", () => {
    put(path.join(WF, "bkit-cloud.yml"), shippedAtV6(".github/workflows/bkit-cloud.yml"));
    put(path.join(WF, "bkit-trivy.yml"), shippedAtV6(".github/workflows/bkit-trivy.yml"));
    const custom = shippedAtV6(".github/workflows/bkit-renovate.yml").replace(
      "name: Renovate\n",
      "name: Renovate (ours)\n",
    );
    expect(custom).toContain("name: Renovate (ours)\n");
    put(path.join(WF, "bkit-renovate.yml"), custom);
    run();

    const cloud = fs.readFileSync(path.join(WF, "bkit-cloud.yml"), "utf-8");
    expect(cloud).toContain("name: bkit-cloud-context (${{ github.event_name }})");
    expect(cloud).toContain("name: bkit-cloud-claude (${{ github.event_name }})");
    expect(cloud).toContain("name: bkit-cloud-opencode (${{ github.event_name }})");
    expect(cloud).not.toMatch(/^ {4}name: (context|claude|opencode) \(/m);
    const trivy = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
    expect(trivy).toMatch(/^name: bkit-trivy$/m);
    expect(trivy).toMatch(/^ {2}trivy:\n {4}name: bkit-trivy\n/m);
    expect(trivy).not.toMatch(/^name: Trivy$/m);
    const renovate = fs.readFileSync(path.join(WF, "bkit-renovate.yml"), "utf-8");
    expect(renovate).toContain("name: Renovate (ours)\n");
    expect(renovate).not.toMatch(/^name: bkit-renovate$/m);
  });

  it("logs each renamed check name with the branch-protection fix", () => {
    put(path.join(WF, "bkit-trivy.yml"), shippedAtV6(".github/workflows/bkit-trivy.yml"));
    put(path.join(WF, "bkit-renovate.yml"), shippedAtV6(".github/workflows/bkit-renovate.yml"));
    run();
    const text = out();
    expect(text).toContain("Trivy / trivy");
    expect(text).toContain("bkit-trivy / bkit-trivy");
    expect(text).toContain("Renovate / renovate");
    expect(text).toContain("bkit-renovate / bkit-renovate");
    expect(text).toMatch(/branch[- ]protection/i);
  });

  it("inserts no job name when the renovate or trivy job already has one", () => {
    const named = (file: string, job: string): string =>
      shippedAtV6(`.github/workflows/${file}`).replace(
        `\n  ${job}:\n`,
        `\n  ${job}:\n    name: our ${job}\n`,
      );
    put(path.join(WF, "bkit-renovate.yml"), named("bkit-renovate.yml", "renovate"));
    put(path.join(WF, "bkit-trivy.yml"), named("bkit-trivy.yml", "trivy"));
    put(path.join(WF, "bkit-cloud.yml"), shippedAtV6(".github/workflows/bkit-cloud.yml"));
    run();
    expect(fs.readFileSync(path.join(WF, "bkit-cloud.yml"), "utf-8")).toContain(
      "name: bkit-cloud-context (",
    );
    const renovate = fs.readFileSync(path.join(WF, "bkit-renovate.yml"), "utf-8");
    const trivy = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
    expect(renovate).toContain("  renovate:\n    name: our renovate\n");
    expect(trivy).toContain("  trivy:\n    name: our trivy\n");
    expect(renovate.match(/^ {4}name:/gm)).toHaveLength(1);
    expect(trivy.match(/^ {4}name:/gm)).toHaveLength(1);
  });

  it("rewrites the old health stub in a custom bkit.testing.ciWorkflow file", () => {
    fs.writeFileSync(
      "package.json",
      JSON.stringify({ name: "x", bkit: { testing: { ciWorkflow: "ci.yml" } } }, null, 2) + "\n",
      "utf-8",
    );
    const ciOld = shippedAtV6(".github/workflows/bkit-ci.yml");
    const start = ciOld.indexOf("# bkit-stub:health");
    const endMarker = "# DROP if you have no deployed health URL.";
    const end = ciOld.indexOf(endMarker) + endMarker.length;
    expect(start).toBeGreaterThan(-1);
    const oldBlock = ciOld.slice(start, end);
    const wrap = (block: string): string =>
      `name: CI\njobs:\n  a:\n    steps:\n      - run: true\n# === JOB 6 ===\n${block}\n# tail\n`;

    const edited = oldBlock.replace("Not a required check.", "Not a required check (ours).");
    expect(edited).not.toBe(oldBlock);
    put(path.join(WF, "ci.yml"), wrap(edited));
    run();
    expect(fs.readFileSync(path.join(WF, "ci.yml"), "utf-8")).toBe(wrap(edited));

    put(path.join(WF, "ci.yml"), wrap(oldBlock));
    run();
    const after = fs.readFileSync(path.join(WF, "ci.yml"), "utf-8");
    expect(after).toContain(".bkit/templates/.github/workflows/bkit-health.yml");
    expect(after).not.toContain("copy into .github/workflows/health.yml");
    expect(after).toContain("# tail\n");
    expect(fs.existsSync(path.join(WF, "bkit-ci.yml"))).toBe(false);
  });
  it("inserts no job name when the job sets name below another key", () => {
    const old = shippedAtV6(".github/workflows/bkit-trivy.yml");
    const custom = old.replace(
      "    runs-on: ubuntu-latest # Edit this label in your copy.\n",
      "    runs-on: ubuntu-latest # Edit this label in your copy.\n    name: our trivy\n",
    );
    expect(custom).toContain("    name: our trivy\n");
    put(path.join(WF, "bkit-trivy.yml"), custom);
    run();

    const after = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
    const parsed = parseYaml(after) as { jobs: { trivy: { name?: string } } };
    expect(parsed.jobs.trivy.name).toBe("our trivy");
    expect(after.match(/^ {4}name:/gm)).toHaveLength(1);
  });
  it("inserts no job name when a job-indent comment sits above the job's own name", () => {
    const old = shippedAtV6(".github/workflows/bkit-trivy.yml");
    const custom = old
      .replace("\n  trivy:\n", "\n  trivy:\n  # owner: security team\n")
      .replace(
        "    runs-on: ubuntu-latest # Edit this label in your copy.\n",
        "    runs-on: ubuntu-latest # Edit this label in your copy.\n    name: our trivy\n",
      );
    expect(custom).toContain("  # owner: security team\n");
    expect(custom).toContain("    name: our trivy\n");
    put(path.join(WF, "bkit-trivy.yml"), custom);
    run();

    const after = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
    const parsed = parseYaml(after) as { jobs: { trivy: { name?: string } } };
    expect(parsed.jobs.trivy.name).toBe("our trivy");
    expect(after.match(/^ {4}name:/gm)).toHaveLength(1);
  });
});

describe("migrateValeHouseStyle (via runBkitDocs)", () => {
  const RULES = ["Filler", "Hedging", "LLMSlop", "Verbose"] as const;
  const HOUSE = path.join(".vale", "styles", "House");
  const BKIT = path.join(".vale", "styles", "Bkit");
  const put = (file: string, text: string): void => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf-8");
  };
  const oldRule = (r: string): string => shippedAtV6(`.vale/styles/House/${r}.yml`);
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const seed = (rules: readonly string[], withIni = true): void => {
    for (const r of rules) put(path.join(HOUSE, `${r}.yml`), oldRule(r));
    if (withIni) put(".vale.ini", shippedAtV6(".vale.ini"));
  };
  const captured: string[] = [];

  beforeEach(() => {
    captured.length = 0;
    vi.spyOn(console, "log").mockImplementation((m: unknown) => {
      captured.push(String(m));
    });
    vi.spyOn(console, "warn").mockImplementation((m: unknown) => {
      captured.push(String(m));
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("moves shipped Vale rules to Bkit and keeps own and edited rules in House", () => {
    seed(RULES);
    const edited = oldRule("Hedging") + "\n# consumer edit\n";
    put(path.join(HOUSE, "Hedging.yml"), edited);
    put(path.join(HOUSE, "Mine.yml"), "extends: existence\nmessage: own\ntokens: [x]\n");
    run();

    for (const r of ["Filler", "LLMSlop", "Verbose"]) {
      expect(fs.existsSync(path.join(HOUSE, `${r}.yml`))).toBe(false);
      expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).toBe(oldRule(r));
    }
    expect(fs.readFileSync(path.join(HOUSE, "Hedging.yml"), "utf-8")).toBe(edited);
    expect(fs.existsSync(path.join(BKIT, "Hedging.yml"))).toBe(false);
    expect(fs.existsSync(path.join(HOUSE, "Mine.yml"))).toBe(true);
    expect(fs.existsSync(path.join(BKIT, "Mine.yml"))).toBe(false);
    const text = captured.join("\n");
    expect(text).toContain("Hedging");
    expect(text).toContain("mv .vale/styles/House/Hedging.yml .vale/styles/Bkit/");
  });

  it("keeps House and an own entry named like a moved rule without .yml", () => {
    seed(RULES);
    put(path.join(HOUSE, "Filler", "Mine.yml"), "extends: existence\nmessage: own\ntokens: [x]\n");
    run();

    expect(fs.existsSync(path.join(HOUSE, "Filler.yml"))).toBe(false);
    expect(fs.readFileSync(path.join(BKIT, "Filler.yml"), "utf-8")).toBe(oldRule("Filler"));
    expect(fs.existsSync(path.join(HOUSE, "Filler", "Mine.yml"))).toBe(true);
    const based = fs
      .readFileSync(".vale.ini", "utf-8")
      .split("\n")
      .filter((l) => l.startsWith("BasedOnStyles"));
    for (const l of based) expect(l).toMatch(/\bHouse\b/);
  });

  it("names Bkit rules in .vale.ini and lists both styles while House keeps files", () => {
    seed(RULES);
    put(path.join(HOUSE, "Hedging.yml"), oldRule("Hedging") + "\n# consumer edit\n");
    run();
    const ini = fs.readFileSync(".vale.ini", "utf-8");
    expect(ini).toContain("Bkit.Filler = NO");
    expect(ini).toContain("Bkit.LLMSlop = NO");
    expect(ini).toContain("Bkit.Verbose = NO");
    expect(ini).not.toContain("House.Filler");
    expect(ini).not.toContain("House.LLMSlop");
    expect(ini).not.toContain("House.Verbose");
    expect(ini).toContain("House.Hedging = NO");
    const based = ini.split("\n").filter((l) => l.startsWith("BasedOnStyles"));
    expect(based.length).toBeGreaterThan(0);
    for (const l of based) {
      expect(l).toMatch(/\bHouse\b/);
      expect(l).toMatch(/\bBkit\b/);
    }
  });

  it("moves every House rule and removes House", () => {
    seed(RULES);
    run();
    for (const r of RULES) {
      expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).toBe(oldRule(r));
    }
    expect(fs.existsSync(HOUSE)).toBe(false);
    const ini = fs.readFileSync(".vale.ini", "utf-8");
    expect(ini).not.toMatch(/\bHouse\b/);
    expect(ini).toContain("BasedOnStyles = Bkit\n");
    expect(ini).toContain("BasedOnStyles = write-good, Bkit\n");
    for (const r of RULES) expect(ini).toContain(`Bkit.${r} = NO`);
  });

  it("moves rules without a .vale.ini", () => {
    seed(RULES, false);
    const ctx = run();
    for (const r of RULES) {
      expect(fs.existsSync(path.join(HOUSE, `${r}.yml`))).toBe(false);
      expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).toBe(oldRule(r));
    }
    expect(fs.existsSync(".vale.ini")).toBe(false);
    expect(ctx.ws.writes.map((w) => w.path)).not.toContain(".vale.ini");
    expect(ctx.ws.writes.some((w) => w.path.endsWith(".vale.ini"))).toBe(false);
  });

  it("does not move rules into a symlinked Bkit directory", () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
    try {
      seed(RULES);
      fs.mkdirSync(path.dirname(BKIT), { recursive: true });
      fs.symlinkSync(outside, BKIT);
      run();

      expect(fs.readdirSync(outside)).toEqual([]);
      expect(fs.lstatSync(BKIT).isSymbolicLink()).toBe(true);
      expect(fs.existsSync(path.join(HOUSE, "Filler.yml"))).toBe(true);
      expect(captured.join("\n")).toContain("Bkit");
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

describe("deterministic bookkeeping contracts in a fresh consumer", { timeout: 180_000 }, () => {
  const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
  const HOSTS = ["claude", "cursor", "opencode", "codex", "antigravity"] as const;
  const TRACKERS = ["github", "linear", "jira", "none"] as const;
  const WORKFLOW_FILES: Record<(typeof HOSTS)[number], string> = {
    claude: ".claude/commands/bkit-build.md",
    cursor: ".cursor/commands/bkit-build.md",
    opencode: ".opencode/commands/bkit-build.md",
    codex: ".agents/skills/bkit-build/SKILL.md",
    antigravity: ".agents/plugins/bkit/skills/bkit-build/SKILL.md",
  };
  const extraDirs: string[] = [];
  afterEach(() => {
    process.chdir(originalCwd);
    for (const d of extraDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });

  const consumer = (): string => {
    const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-consumer-")));
    extraDirs.push(dir);
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
      "utf-8",
    );
    process.chdir(dir);
    return dir;
  };
  const install = (host: (typeof HOSTS)[number], tracker: (typeof TRACKERS)[number]): WriteSet => {
    const ws = makeWriteSet();
    dispatchModules(
      new Set(["core", host]),
      makeCtx({
        ws,
        issueTracker: tracker,
        modelLookup: parseModelLookup(promptsMd),
        codexModelLookup: buildOpencodeModelLookup(promptsMd, "openai"),
        opencodeModelLookup: buildOpencodeModelLookup(promptsMd, "openrouter"),
        antigravityModelLookup: buildAntigravityModelLookup(promptsMd),
        effortMap: parseEffortMap(promptsMd),
        opencodeProvider: "openrouter",
      }),
    );
    return ws;
  };
  const read = (dir: string, rel: string) => fs.readFileSync(path.join(dir, rel), "utf-8");
  const correction = (text: string) =>
    /\*\*Bounded correction:\*\*[\s\S]*?(?:\n\s*\n|$)/.exec(text)?.[0].replace(/\s+/g, " ") ?? "";

  const CLI = path.join(getPkgRoot(), "dist", "cli.js");
  const bkit = (cwd: string, ...argv: string[]) => {
    const res = spawnSync(process.execPath, [CLI, ...argv, "--json"], {
      cwd,
      encoding: "utf-8",
    });
    return {
      code: res.status,
      json: res.stdout.trim() === "" ? undefined : (JSON.parse(res.stdout) as Record<string, any>),
      err: res.stderr,
    };
  };
  const gitIn = (cwd: string, ...args: string[]) => {
    const res = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
      cwd,
      encoding: "utf-8",
    });
    return res.stdout.trim();
  };
  const jsonRows = (file: string) =>
    fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as Record<string, any>);

  it("installs and upgrades fresh consumers with deterministic bookkeeping contracts", () => {
    const snapshots = new Map<string, Record<string, string>>();

    // Fresh install: every host x tracker renders the same recovery contract and engine-owned CI re-entry.
    for (const host of HOSTS) {
      for (const tracker of TRACKERS) {
        const dir = consumer();
        install(host, tracker);
        const workflow = read(dir, WORKFLOW_FILES[host]);
        expect(correction(workflow), `${host}/${tracker}`).toMatch(/guaranteed no-write/i);
        expect(correction(workflow), `${host}/${tracker}`).toMatch(/two corrected retries/i);
        expect(workflow, `${host}/${tracker}`).toContain("bkit runs handoff");
        expect(workflow, `${host}/${tracker}`).not.toContain("--attempts=<total>");
        expect(workflow, `${host}/${tracker}`).not.toContain("{CI_REENTRY}");
        snapshots.set(`${host}/${tracker}`, {
          contract: correction(workflow),
          cli: read(dir, ".bkit/cli.md"),
          jsonl: read(dir, ".bkit/jsonl.md"),
          workflows: read(dir, ".bkit/workflows.md"),
          prompts: read(dir, ".bkit/prompts.md"),
        });
      }
    }
    // One wording and one set of docs across the matrix.
    const contracts = new Set([...snapshots.values()].map((s) => s.contract));
    expect(contracts.size).toBe(1);
    const first = [...snapshots.values()][0]!;
    for (const s of snapshots.values()) {
      expect(s.cli).toBe(first.cli);
      expect(s.jsonl).toBe(first.jsonl);
    }
    // The shipped docs state each ownership boundary, and the catalog lists the new verbs.
    for (const verb of ["ledgers query", "runs handoff", "counters correction"]) {
      expect(first.cli, verb).toContain(verb);
    }
    expect(first.cli).toContain("--correction-of");
    expect(first.cli).toContain("--operation");
    expect(first.jsonl).toContain("ci-handoff");
    expect(first.jsonl).toContain("correction-rejected");
    expect(first.jsonl).toMatch(/receipt/i);
    expect(first.workflows).toContain("Bounded correction");
    expect(first.prompts).toMatch(/modelSource/);

    // Upgrade: stale managed files are put back to the fresh bytes, and a further install writes nothing.
    const dir = consumer();
    install("claude", "github");
    const fresh = {
      workflow: read(dir, WORKFLOW_FILES.claude),
      cli: read(dir, ".bkit/cli.md"),
      jsonl: read(dir, ".bkit/jsonl.md"),
    };
    fs.writeFileSync(path.join(dir, WORKFLOW_FILES.claude), `${fresh.workflow}\nstale\n`);
    fs.writeFileSync(
      path.join(dir, ".bkit/cli.md"),
      fresh.cli.replace("runs handoff", "runs wait"),
    );
    fs.writeFileSync(path.join(dir, ".bkit/jsonl.md"), "stale\n");
    install("claude", "github");
    expect(read(dir, WORKFLOW_FILES.claude)).toBe(fresh.workflow);
    expect(read(dir, ".bkit/cli.md")).toBe(fresh.cli);
    expect(read(dir, ".bkit/jsonl.md")).toBe(fresh.jsonl);
    expect(install("claude", "github").writes).toEqual([]);

    // The built CLI the consumer runs agrees with the installed catalog and completes the journey.
    gitIn(dir, "init", "-q", "-b", "feat/1-x");
    fs.writeFileSync(path.join(dir, "README.md"), "x\n");
    gitIn(dir, "add", "-A");
    gitIn(dir, "commit", "-q", "-m", "init");
    const rel = "docs/plans/202611/logs/1-x/status.jsonl";
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(
      path.join(dir, rel),
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
    );
    for (const verb of [
      ["ledgers", "query"],
      ["runs", "handoff"],
      ["counters", "correction"],
    ]) {
      expect(bkit(dir, ...verb, "--help").code, verb.join(" ")).toBe(0);
    }
    // Missing observed model: the engine fills what it can verify and leaves the rest absent.
    const issued = bkit(
      dir,
      "status",
      "invocation",
      "--workflow=build",
      "--step=build-plan-tests",
      `--file=${rel}`,
      "--host=claude",
      "--configured-model=sonnet",
      "--agent=bkit-build-plan-tests",
    );
    expect(issued.code).toBe(0);
    const id = issued.json!["invocation"] as string;
    const rowsFile = path.join(dir, "rows.json");
    const append = (rows: unknown[], ...extra: string[]) => {
      fs.writeFileSync(rowsFile, JSON.stringify(rows));
      return bkit(
        dir,
        "ledgers",
        "append",
        `--root=${dir}`,
        "--ledger=knowledge",
        `--rows=${rowsFile}`,
        `--invocation=${id}`,
        ...extra,
      );
    };
    const row = { kind: "knowledge", key: "gotcha", summary: "a gotcha worth keeping" };
    // A guaranteed no-write rejection, then the corrected candidate, then a lost-response replay.
    const rejected = append([{ ...row, status: "BOGUS" }], "--operation=op-1");
    expect(rejected.code).toBe(8);
    expect(rejected.json!["error"]).toMatchObject({ effects: "none", correctable: true });
    expect(fs.existsSync(path.join(dir, "docs", "knowledge.jsonl"))).toBe(false);
    const corrected = append([row], "--operation=op-2", "--correction-of=op-1");
    expect(corrected.code).toBe(0);
    expect(corrected.json!["correction"]).toMatchObject({ used: 1, limit: 2, verified: true });
    const replayed = append([row], "--operation=op-2", "--correction-of=op-1");
    expect(replayed.json!["receipt"]).toMatchObject({ operation: "op-2", replayed: true });
    const stored = jsonRows(path.join(dir, "docs", "knowledge.jsonl"));
    expect(stored).toHaveLength(1);
    expect(stored[0]!["by"]).toMatchObject({
      workflow: "build",
      step: "build-plan-tests",
      subagent: "bkit-build-plan-tests",
      configuredModel: "sonnet",
      host: "claude",
    });
    expect(stored[0]!["by"]).not.toHaveProperty("model");
    // The canonical read agrees with the append: one winner, a complete scan.
    const queried = bkit(dir, "ledgers", "query", `--root=${dir}`, "--ledger=knowledge");
    expect(queried.json!["rows"]).toHaveLength(1);
    expect(queried.json!["coverage"]).toMatchObject({ status: "complete", clean: true });
    // Resume with a new process and a new invocation: the correction budget and CI totals carry on.
    const scope = (corrected.json!["correction"] as { scope: string }).scope;
    const counter = bkit(
      dir,
      "counters",
      "correction",
      `--file=${rel}`,
      "--workflow=build",
      `--scope=${scope}`,
      "--operation=op-3",
    );
    expect(counter.json).toMatchObject({ allowed: true, used: 2, limit: 2 });
    const poll = (result: string) =>
      bkit(
        dir,
        "runs",
        "handoff",
        `--invocation=${id}`,
        "--repo=acme/test-project",
        "--pr=7",
        `--head=${"a".repeat(40)}`,
        "--branch=feat/1-x",
        "--budget-s=60",
        "--interval-s=10",
        `--result=${result}`,
        "--polls=3",
      );
    expect(poll("none").json).toMatchObject({ attempts: 3, nextAction: "poll-again" });
    expect(poll("none").json).toMatchObject({ attempts: 6, nextAction: "retrigger" });
  });
});
