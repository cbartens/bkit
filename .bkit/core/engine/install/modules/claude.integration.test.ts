// install/modules/claude.integration.test.ts — Integration tests for the claude module.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WriteSet } from "../write";
import { buildOpencodeModelLookup, parseEffortMap } from "../../render/models";
import { runClaudeModule, reconcileMcpJson } from "./claude";
import { runOpencodeModule } from "./opencode";
import type { ModuleContext } from "./index";
import { writeBkitVersion } from "../version-file";
import { getPkgRoot } from "../../shared/package-roots";
import type { PreflightFinding } from "../../checks/before/index";
import { detectExtraMcpServers, detectMissingMcpServers } from "../../checks/before/mcp";
import { getBkitDocsRoot } from "../../shared/package-roots";

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
// runClaudeModule applies deep-containment on install: writeTier2JsonContained
// deep-merges the template into the consumer's settings. No __bkit__ key is ever
// written. Consumer-only keys (hooks.Stop, customKey) survive.
// ---------------------------------------------------------------------------

describe("runClaudeModule preserves consumer settings through deep-containment", () => {
  it("writes template scope and preserves the consumer Stop hook without __bkit__", () => {
    // Arrange: seed the JSON-format .bkit/version file.
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "5.0.0",
      canonicalHashes: {},
      claudeAllowDerived: [],
    });

    // Verify the file is JSON format (not plain-text)
    const rawVersion = fs.readFileSync(versionFile, "utf-8");
    expect(rawVersion.trim()).toMatch(/^\{/);

    // Arrange: seed .claude/settings.json
    // with a consumer-added Stop hook that should survive deep-containment merge.
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const consumerSettings = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [
          { hooks: [{ type: "command", command: "bash .claude/hooks/bkit-preflight.sh" }] },
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
      claudeAllowDerived: [],
    });

    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    // v2.0.0-schema-clean shape: bkit-owned SessionStart + consumer-owned customKey
    const consumerSettings = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: {
        SessionStart: [
          { hooks: [{ type: "command", command: "bash .claude/hooks/bkit-preflight.sh" }] },
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

describe("runClaudeModule dry run reports retired settings entries", () => {
  const RETIRED = "mcp__claude_ai_Linear__*";

  function seedSettings(allow: string[]): string {
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    const dst = path.join(tmpDir, ".claude", "settings.json");
    fs.writeFileSync(dst, JSON.stringify({ permissions: { allow } }, null, 2) + "\n", "utf-8");
    return dst;
  }

  function retiredAdvisories(ctx: ModuleContext): PreflightFinding[] {
    return ctx.advisories.filter((a) => a.id === "retired-settings-entry");
  }

  it("dry run over a seeded old-shape settings file reports the file as drift and names the retired entry", () => {
    const dst = seedSettings(["Bash(ls)", RETIRED, "mcp__mine__*"]);
    const before = fs.readFileSync(dst, "utf-8");
    const ctx = makeCtx({ dryRun: true });
    runClaudeModule(ctx);
    expect(fs.readFileSync(dst, "utf-8")).toBe(before);
    expect(ctx.ws.writes.some((w) => w.path.endsWith(".claude/settings.json"))).toBe(true);
    const found = retiredAdvisories(ctx);
    expect(found).toHaveLength(1);
    expect(found[0]!.severity).toBe("advisory");
    expect(found[0]!.detect).toContain(RETIRED);
    expect(found[0]!.detect).toContain(".claude/settings.json");
  });

  it("dry run over a clean settings file records no drift and no retired-settings-entry advisory", () => {
    seedSettings(["Bash(ls)"]);
    runClaudeModule(makeCtx());
    const ctx = makeCtx({ dryRun: true });
    runClaudeModule(ctx);
    expect(retiredAdvisories(ctx)).toHaveLength(0);
    expect(ctx.ws.writes.some((w) => w.path.endsWith(".claude/settings.json"))).toBe(false);
  });

  it("dry run reports no advisory for a look-alike of a retired entry", () => {
    const like = "mcp__claude_ai_Linear__my_own_tool";
    seedSettings(["Bash(ls)", like]);
    const ctx = makeCtx({ dryRun: true });
    runClaudeModule(ctx);
    expect(retiredAdvisories(ctx)).toHaveLength(0);
    expect(JSON.stringify(ctx.advisories)).not.toContain(like);
  });

  it("removes an exact retired tool grant a person added and keeps the derived allow that equals a retired value", () => {
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "context.md"),
      "<!-- bkit:end -->\n<!-- mcp-servers:start -->\nLinear\n<!-- mcp-servers:end -->\n",
      "utf-8",
    );
    const toolGrant = "mcp__claude_ai_Linear__save_issue";
    const dst = seedSettings(["Bash(ls)"]);
    runClaudeModule(makeCtx());
    const doc = JSON.parse(fs.readFileSync(dst, "utf-8")) as { permissions: { allow: string[] } };
    const installed = doc.permissions.allow.filter((e) => e !== RETIRED);
    const kept = [installed[0]!, RETIRED, "mcp__mine__*", ...installed.slice(1)];
    doc.permissions.allow = [...kept.slice(0, 2), toolGrant, ...kept.slice(2)];
    fs.writeFileSync(dst, JSON.stringify(doc, null, 2) + "\n", "utf-8");

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const ctx = makeCtx();
      runClaudeModule(ctx);
      const allow = (
        JSON.parse(fs.readFileSync(dst, "utf-8")) as { permissions: { allow: string[] } }
      ).permissions.allow;
      expect(allow).toEqual(kept);
      const printed = log.mock.calls.map((c) => c.join(" ")).join("\n");
      expect(printed).toContain(`removed "${toolGrant}"`);
      expect(printed).not.toContain(`removed "${RETIRED}"`);
      expect([ctx.claudeAllowRecorded].flat()).not.toContain(RETIRED);
    } finally {
      log.mockRestore();
    }
  });

  it("dry run over a v2.2.3 settings file names the Linear connector write grants as retired, not kept", () => {
    seedSettings([
      "Bash(ls)",
      "mcp__claude_ai_Linear__save_issue",
      "mcp__claude_ai_Linear__save_comment",
    ]);
    const ctx = makeCtx({ dryRun: true });
    runClaudeModule(ctx);
    const found = retiredAdvisories(ctx);
    expect(found).toHaveLength(1);
    const detect = found[0]!.detect;
    expect(detect).toContain("retired entries bkit removes");
    expect(detect).toContain("mcp__claude_ai_Linear__save_issue");
    expect(detect).toContain("mcp__claude_ai_Linear__save_comment");
  });

  it("keeps a retired value the mcp-servers block derives and records no drift on the next dry run", () => {
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".agents", "context.md"),
      "<!-- bkit:end -->\n<!-- mcp-servers:start -->\nLinear\n<!-- mcp-servers:end -->\n",
      "utf-8",
    );
    const dst = seedSettings(["Bash(ls)"]);
    runClaudeModule(makeCtx());
    const allow = (
      JSON.parse(fs.readFileSync(dst, "utf-8")) as { permissions: { allow: string[] } }
    ).permissions.allow;
    expect(allow).toContain(RETIRED);
    const ctx = makeCtx({ dryRun: true });
    runClaudeModule(ctx);
    expect(ctx.ws.writes.some((w) => w.path.endsWith(".claude/settings.json"))).toBe(false);
    expect(retiredAdvisories(ctx)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// reconcileOpencodeJson — provider-key ordering is stable across paths: install
// reconciles only the ACTIVE provider, upgrade also reconciles each ADDITIONAL
// installed provider, and both render the same order.
// ---------------------------------------------------------------------------
describe("reconcileMcpJson — bkit owns only its tracker entry", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const template = path.resolve(scriptsDir, "..", "..", "..", "..", "shared", ".mcp.json");
  const templateServers = (
    JSON.parse(fs.readFileSync(template, "utf-8")) as { mcpServers: Record<string, unknown> }
  ).mcpServers;
  const githubEntry = templateServers.github;
  const TRACKERS = ["github", "linear", "jira"] as const;
  const write = (doc: unknown) =>
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify(doc, null, 2) + "\n");
  const read = () => JSON.parse(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8"));

  it.each(TRACKERS)("%s: absent file → writes the tracker-filtered render", (tracker) => {
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", tracker, false, ws);
    expect(read()).toEqual({ mcpServers: { [tracker]: templateServers[tracker] } });
    expect(ws.writes).toEqual([{ path: ".mcp.json", action: "write" }]);
  });

  it.each(TRACKERS)(
    "%s: keeps a consumer server and other keys, updates bkit's entry, keeps key order",
    (tracker) => {
      const mine = { type: "stdio", command: "my-mcp" };
      write({ theme: "x", mcpServers: { mine, [tracker]: { url: "https://edited" } } });
      const ws = makeWriteSet();
      reconcileMcpJson(template, ".mcp.json", tracker, false, ws);
      const after = read();
      expect(after).toEqual({
        theme: "x",
        mcpServers: { mine, [tracker]: templateServers[tracker] },
      });
      expect(Object.keys(after.mcpServers)).toEqual(["mine", tracker]);
      expect(ws.writes).toEqual([{ path: ".mcp.json", action: "update" }]);
    },
  );

  it.each(TRACKERS)(
    "%s: in sync → no write; dry-run reports the same write as live without touching disk",
    (tracker) => {
      write({ mcpServers: { [tracker]: templateServers[tracker], mine: {} } });
      const inSync = makeWriteSet();
      reconcileMcpJson(template, ".mcp.json", tracker, false, inSync);
      expect(inSync.writes).toEqual([]);

      write({ mcpServers: { [tracker]: { url: "https://edited" } } });
      const before = fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8");
      const dry = makeWriteSet();
      reconcileMcpJson(template, ".mcp.json", tracker, true, dry);
      expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe(before);
      const live = makeWriteSet();
      reconcileMcpJson(template, ".mcp.json", tracker, false, live);
      expect(live.writes).toEqual(dry.writes);
    },
  );

  it.each(TRACKERS)(
    "%s: a consumer key and header in bkit's entry are in sync → no write (#613)",
    (tracker) => {
      const entry = templateServers[tracker] as { headers?: Record<string, string> };
      const extended = { ...entry, timeout: 30, headers: { ...entry.headers, "X-Mine": "1" } };
      write({ mcpServers: { [tracker]: extended } });
      const ws = makeWriteSet();
      reconcileMcpJson(template, ".mcp.json", tracker, false, ws);
      expect(ws.writes).toEqual([]);
      expect(read()).toEqual({ mcpServers: { [tracker]: extended } });
    },
  );

  it("jira: an edited Authorization header is reset; the consumer's own header stays", () => {
    const entry = templateServers.jira as { headers: Record<string, string> };
    write({
      mcpServers: {
        jira: { ...entry, headers: { Authorization: "Bearer hardcoded", "X-Mine": "1" } },
      },
    });
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "jira", false, ws);
    expect(read().mcpServers.jira.headers).toEqual({
      Authorization: "Bearer ${BKIT_JIRA_API_KEY}",
      "X-Mine": "1",
    });
    expect(ws.writes).toEqual([{ path: ".mcp.json", action: "update" }]);
  });

  it("github: an extra toolset in bkit's entry is in sync → no write (#613)", () => {
    const entry = githubEntry as { headers: Record<string, string> };
    const extended = {
      ...entry,
      timeout: 30,
      headers: {
        ...entry.headers,
        "X-MCP-Toolsets": `${entry.headers["X-MCP-Toolsets"]},gists`,
        "X-Mine": "1",
      },
    };
    write({ mcpServers: { github: extended } });
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "github", false, ws);
    expect(ws.writes).toEqual([]);
    expect(read()).toEqual({ mcpServers: { github: extended } });
  });

  it("github: a missing template toolset is appended after the consumer's; edited url is reset (#613)", () => {
    const entry = githubEntry as { headers: Record<string, string> };
    write({
      mcpServers: {
        github: {
          ...entry,
          url: "https://edited",
          headers: { ...entry.headers, "X-MCP-Toolsets": "gists,issues", "X-Mine": "1" },
        },
      },
    });
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "github", false, ws);
    const gh = read().mcpServers.github;
    const templateSets = entry.headers["X-MCP-Toolsets"]!.split(",").filter((t) => t !== "issues");
    expect(gh.url).toBe((githubEntry as { url: string }).url);
    expect(gh.headers["X-Mine"]).toBe("1");
    expect(gh.headers["X-MCP-Toolsets"]).toBe(["gists", "issues", ...templateSets].join(","));
    expect(ws.writes).toEqual([{ path: ".mcp.json", action: "update" }]);
  });

  it("tracker none owns no entry → a present file is left alone", () => {
    write({ mcpServers: { linear: { url: "https://mine" } } });
    const ws = makeWriteSet();
    reconcileMcpJson(template, ".mcp.json", "none", false, ws);
    expect(ws.writes).toEqual([]);
    expect(read()).toEqual({ mcpServers: { linear: { url: "https://mine" } } });
  });

  it.each([...TRACKERS, "none"] as const)(
    "%s: the render satisfies the preflight MCP detectors (no missing / extra advisory)",
    (tracker) => {
      reconcileMcpJson(template, ".mcp.json", tracker, false, makeWriteSet());
      expect(detectMissingMcpServers(tmpDir, ".mcp.json", tracker)).toEqual([]);
      expect(detectExtraMcpServers(tmpDir, ".mcp.json", tracker)).toEqual([]);
    },
  );

  it("malformed JSON throws and leaves the file as it was", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "{ nope", "utf-8");
    expect(() => reconcileMcpJson(template, ".mcp.json", "github", false, makeWriteSet())).toThrow(
      /malformed JSON/,
    );
    expect(fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")).toBe("{ nope");
  });
});

// ---------------------------------------------------------------------------
// gateguard markered-text — install engine, for both the claude and opencode twins.
// ---------------------------------------------------------------------------

describe("bkit-gateguard.cjs / bkit-gateguard.js markered-text — install engine (#422)", () => {
  const CJS_REL = path.join(".claude", "hooks", "bkit-gateguard.cjs");
  const JS_REL = path.join(".opencode", "plugin", "bkit-gateguard.js");

  // Resolve the real opencode model lookup from prompts.md (same source used at install
  // time) — runOpencodeModule's agent/command render pass requires it populated.
  const PROMPTS_MD = path.join(getBkitDocsRoot(), "prompts.md");
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

  it("install generates each hook from its template plus the shared hook parts", () => {
    runClaudeModule(makeCtx());
    runOpencodeModule(makeOpencodeCtx());
    const read = (rel: string) => fs.readFileSync(path.join(tmpDir, rel), "utf-8");
    for (const rel of [
      CJS_REL,
      JS_REL,
      path.join(".claude", "hooks", "bkit-guardrails.cjs"),
      path.join(".claude", "hooks", "bkit-preflight.sh"),
    ]) {
      expect(read(rel), rel).not.toContain("{{BKIT_PART");
    }
    expect(read(CJS_REL)).toContain("function firstTouchAdvice(");
    expect(read(JS_REL)).toContain("function firstTouchAdvice(");
    expect(read(path.join(".claude", "hooks", "bkit-guardrails.cjs"))).toContain(
      "function shellEditTargets(",
    );
    expect(read(path.join(".claude", "hooks", "bkit-preflight.sh"))).toContain(
      "api.linear.app/graphql",
    );
  });

  it("an existing hook gets the shared parts in its managed block; the driver below it stays", () => {
    const dst = path.join(tmpDir, CJS_REL);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, "// bkit:start\nold engine\n// bkit:end\n// my driver\n", "utf-8");
    runClaudeModule(makeCtx());
    const text = fs.readFileSync(dst, "utf-8");
    expect(text).toContain("function firstTouchAdvice(");
    expect(text).not.toContain("old engine");
    expect(text).not.toContain("{{BKIT_PART");
    expect(text.endsWith("// my driver\n")).toBe(true);
  });
});

function makeClaudeContext(dryRun: boolean): ModuleContext {
  const ws: WriteSet = { writes: [] };
  const advisories: PreflightFinding[] = [];
  return {
    dryRun,
    tokens: {
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test",
      REPO_SLUG: "acme/test",
    },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
    advisories,
    ws,
    logPrefix: "[bkit-test]",
    postDispatch: [],
    issueTracker: "none",
  };
}

describe("Scenario: .envrc (template) and the .bkit/.env gitignore entry", () => {
  it("install never writes .envrc (a template the consumer copies)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    process.chdir(tmpDir);
    runClaudeModule(makeClaudeContext(false));

    expect(fs.existsSync(path.join(tmpDir, ".envrc"))).toBe(false);
  });

  it(".gitignore marker block contains .bkit/.env after first install", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    process.chdir(tmpDir);

    // Simulate the core module writing .gitignore (use the template directly)
    const pkgRoot = getPkgRoot();
    const gitignoreTemplate = path.join(pkgRoot, ".bkit", "shared", "gitignore");
    const gitignoreDst = path.join(tmpDir, ".gitignore");
    fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
    const content = fs.readFileSync(gitignoreDst, "utf-8");
    // Should contain .bkit/.env inside the bkit marker block
    expect(content).toContain(".bkit/.env");
    // The entry must be inside the bkit block
    const blockMatch = content.match(/# <!-- bkit:start -->([\s\S]*?)# <!-- bkit:end -->/);
    expect(blockMatch).not.toBeNull();
    expect(blockMatch![1]).toContain(".bkit/.env");
  });

  it(".gitignore marker block .bkit/.env entry unchanged on second install", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-consumer" }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    process.chdir(tmpDir);

    const pkgRoot = getPkgRoot();
    const gitignoreTemplate = path.join(pkgRoot, ".bkit", "shared", "gitignore");
    const gitignoreDst = path.join(tmpDir, ".gitignore");
    // First install
    fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
    const after1 = fs.readFileSync(gitignoreDst, "utf-8");

    // Second install (re-copy template = same result since content is identical)
    fs.writeFileSync(gitignoreDst, fs.readFileSync(gitignoreTemplate, "utf-8"), "utf-8");
    const after2 = fs.readFileSync(gitignoreDst, "utf-8");

    expect(after2).toBe(after1); // idempotent
    expect(after2).toContain(".bkit/.env");
  });
});
