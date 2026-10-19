// install/modules/core.integration.test.ts — Integration tests for the core module: canonical docs,
// gate scripts and advisories, the first-install advisory, `.bkit/version`, and the managed blocks
// of the shared `.agents/` files.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WriteSet } from "../write";
import { extractManagedBlock } from "../managed-block";
import type { PreflightFinding } from "../../checks/before/index";
import {
  runCoreModule,
  detectGateAdvisories,
  detectNoopGates,
  isNoopScript,
  runBkitDocs,
} from "./core";
import { dispatchModules, listStampedFiles, type ModuleContext } from "./index";
import { readInstallingVersion } from "../../shared/package-json";
import { getBkitDocsRoot, getPkgRoot } from "../../shared/package-roots";
import { BKIT_GATE_SCRIPTS } from "../manifest";
import { hashFile, readBkitVersion, readManagedVersion, writeBkitVersion } from "../version-file";
import { applyTokens } from "../placeholders";

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
  // The package's canonical docs source (getBkitDocsRoot) — what runBkitDocs copies from.
  const PKG_DOCS_ROOT = getBkitDocsRoot();
  const DOCS = [
    "cloud.md",
    "comparison.md",
    "install.md",
    "jsonl.md",
    "LICENSE.md",
    "lite.md",
    "providers.md",
    "prompts.md",
    "templates.md",
    "trackers.md",
    "workflows.md",
    "README.md",
  ];

  const rendered = (name: string): string =>
    applyTokens(fs.readFileSync(path.join(PKG_DOCS_ROOT, name), "utf-8"), makeCtx().tokens);

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

  it("leaves a superseded bkit slop:delta value in place (add-if-missing; no migration code)", () => {
    // bkit seeds a gate name only when it is missing (#489 removed migration code),
    // so a declared value — even a retired one — is the consumer's and is never rewritten.
    writePkg({ scripts: { "slop:delta": "bash scripts/slop/bkit-slop-delta.sh" } });
    dispatchModules(new Set(["core"]), makeCtx({}));
    const scripts = readPkg().scripts ?? {};
    expect(scripts["slop:delta"]).toBe("bash scripts/slop/bkit-slop-delta.sh");
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

  it("advises declaring bkit:test:file until package.json has it, with the contract inline", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS });
    const finding = detectGateAdvisories(tmpDir).find((f) => f.id === "test-file-script-missing");
    expect(finding?.action).toContain("$BKIT_TEST_REPORT");
    expect(finding?.action).toContain('"bkit:test:file": "vitest run');
    writeScripts({ ...BKIT_GATE_SCRIPTS, "bkit:test:file": "pytest --junitxml=$BKIT_TEST_REPORT" });
    expect(detectGateAdvisories(tmpDir).map((f) => f.id)).not.toContain("test-file-script-missing");
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

  it("runs in check (dry run) as well as install, with the same findings", () => {
    writeScripts({ ...BKIT_GATE_SCRIPTS, "test:integration": "vitest run -c int" });
    const idsFor = (dryRun: boolean): string[] => {
      const ctx = makeCtx({ dryRun });
      runCoreModule(ctx);
      return ctx.advisories
        .map((f) => f.id)
        .filter((id) => id.startsWith("gate-") || id === "test-file-script-missing");
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

describe("bkit-source `.agents/{rules,friction,docs,skills}.md` must not leak to consumers", () => {
  it("first install matches the template (no out-of-block content from bkit's source rules.md)", () => {
    const ctx = makeCtx();
    runCoreModule(ctx);
    flushPostDispatch(ctx);

    const consumerRules = fs.readFileSync(path.join(tmpDir, ".agents", "rules.md"), "utf-8");

    // Template content (what consumers SHOULD get) lives in the package's
    // .bkit/core/.agents/rules.md — resolve from the running package root.
    const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
    const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");
    const templatePath = path.join(pkgRoot, ".bkit", "core", ".agents", "rules.md");
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
// Migration: .agents/shortcuts.md (5.1.0 – 5.2.4) → .bkit/lite.md
// ---------------------------------------------------------------------------

describe("migrateShortcutsToLite (via runBkitDocs)", () => {
  const FIXTURE = path.join(getPkgRoot(), "tests/fixtures/shortcuts-5.2.4/shortcuts.md.txt");
  const OLD = path.join(".agents", "shortcuts.md");
  const LITE = path.join(".bkit", "lite.md");
  const OWN = "### hotfix\n\n```text\nShip the hotfix below.\n```";

  const seedOld = (extra = ""): void => {
    fs.mkdirSync(".agents", { recursive: true });
    fs.writeFileSync(OLD, fs.readFileSync(FIXTURE, "utf-8") + extra, "utf-8");
  };
  const renderedLite = (): string =>
    applyTokens(
      fs.readFileSync(path.join(getBkitDocsRoot(), "lite.md"), "utf-8"),
      makeCtx().tokens,
    );
  const run = (dryRun = false): ModuleContext => {
    const ctx = makeCtx({ dryRun });
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    return ctx;
  };
  const paths = (ctx: ModuleContext): string[] => ctx.ws.writes.map((w) => path.normalize(w.path));

  it("deletes a pristine 5.2.4 copy and leaves .bkit/lite.md as rendered", () => {
    seedOld();
    const ctx = run();
    expect(fs.existsSync(OLD)).toBe(false);
    expect(fs.readFileSync(LITE, "utf-8")).toBe(renderedLite());
    expect(paths(ctx)).toContain(OLD);
  });

  it("moves the consumer's own lines under ## Project Lite Workflows, without the old heading", () => {
    seedOld(`\n${OWN}\n`);
    run();
    expect(fs.existsSync(OLD)).toBe(false);
    const lite = fs.readFileSync(LITE, "utf-8");
    expect(lite).toBe(`${renderedLite().replace(/\n*$/, "\n\n")}${OWN}\n`);
    expect(lite).not.toContain("## Project Shortcuts");
    expect(extractManagedBlock(lite, "html-comment")).not.toBeNull();
  });

  it("is idempotent: a second run changes nothing", () => {
    seedOld(`\n${OWN}\n`);
    run();
    expect(fs.existsSync(OLD)).toBe(false);
    const after = fs.readFileSync(LITE, "utf-8");
    const again = run();
    expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
    expect(paths(again)).not.toContain(OLD);
    expect(paths(again)).not.toContain(LITE);
  });

  it("dry-run touches nothing and records the same writes as the real run", () => {
    seedOld(`\n${OWN}\n`);
    const dry = run(true);
    expect(fs.readFileSync(OLD, "utf-8")).toContain(OWN);
    expect(fs.existsSync(LITE)).toBe(false);
    expect(paths(dry).filter((p) => p === LITE || p === OLD)).toEqual([LITE, LITE, OLD]);
    const real = run();
    expect(paths(dry)).toEqual(paths(real));
  });

  it("leaves an old copy without a managed block in place", () => {
    fs.mkdirSync(".agents", { recursive: true });
    fs.writeFileSync(OLD, `# Shortcuts\n\n${OWN}\n`, "utf-8");
    const ctx = run();
    expect(fs.readFileSync(OLD, "utf-8")).toContain(OWN);
    expect(fs.readFileSync(LITE, "utf-8")).toBe(renderedLite());
    expect(paths(ctx)).not.toContain(OLD);
  });
});
