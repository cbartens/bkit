// install/manifest.test.ts — P2.T1 — snapshot + contract tests.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getInstallManifest,
  getModuleManifest,
  CLOUD_MANIFEST_CLAUDE,
  CLOUD_MANIFEST_CURSOR,
  CLOUD_MANIFEST_OPENCODE,
  ISSUE_TRACKERS,
  OPENCODE_MANIFEST,
  parseCloudAgents,
  parseIssueTracker,
  type ModuleName,
} from "./manifest";
import { getBkitDocsRoot, getTemplatesRoot, templateRelPath } from "../shared/package-roots";

// ---------------------------------------------------------------------------
// CLAUDE.md is owned by the claude module, not core
// ---------------------------------------------------------------------------

describe("CLAUDE.md ownership (#252: moved core → claude)", () => {
  it("CLAUDE.md is owned by the claude module (markered-text)", () => {
    const entry = getInstallManifest().find((e) => e.path === "CLAUDE.md");
    expect(entry).toBeDefined();
    expect(entry!.module).toBe("claude");
    expect(entry!.format).toBe("markered-text");
  });

  it("getModuleManifest('claude') includes CLAUDE.md", () => {
    expect(getModuleManifest("claude").some((e) => e.path === "CLAUDE.md")).toBe(true);
  });

  it("getModuleManifest('core') does NOT include CLAUDE.md (but keeps AGENTS.md)", () => {
    const core = getModuleManifest("core");
    expect(core.some((e) => e.path === "CLAUDE.md")).toBe(false);
    expect(core.some((e) => e.path === "AGENTS.md")).toBe(true);
  });
});

describe(".claude/hooks/bkit-gateguard.cjs ownership (markered-text: consumer owns the driver)", () => {
  it("is owned by the claude module as markered-text", () => {
    const entry = getInstallManifest().find((e) => e.path === ".claude/hooks/bkit-gateguard.cjs");
    expect(entry).toBeDefined();
    expect(entry!.module).toBe("claude");
    expect(entry!.format).toBe("markered-text");
  });
});

// ---------------------------------------------------------------------------
// Cloud manifests — every variant writes no file: the cloud workflow,
// bkit-cloud-bootstrap.sh and the Cursor Background Agent files are templates.
// ---------------------------------------------------------------------------

describe("cloud manifests", () => {
  it("cloud=claude owns no files", () => {
    expect(CLOUD_MANIFEST_CLAUDE).toEqual([]);
  });

  it("cloud=opencode and cloud=cursor own no files", () => {
    expect(CLOUD_MANIFEST_OPENCODE).toEqual([]);
    expect(CLOUD_MANIFEST_CURSOR).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Templates are never manifest entries — install writes none of them, upgrade and
// uninstall never touch a consumer's adopted copy.
// ---------------------------------------------------------------------------

describe("no manifest entry is a template path", () => {
  it("every module's entries are owned or shared files, never a copy-and-own template", () => {
    const templatesRoot = getTemplatesRoot();
    const templateEntries = getInstallManifest().filter((e) =>
      fs.existsSync(path.join(templatesRoot, templateRelPath(e.path))),
    );
    expect(templateEntries).toEqual([]);
  });

  it("the MCP configs are json (bkit owns one tracker entry) and .bkit/.env.example is owned", () => {
    const byPath = new Map(getInstallManifest().map((e) => [e.path, e]));
    expect(byPath.get(".mcp.json")?.format).toBe("json");
    expect(byPath.get(".cursor/mcp.json")?.format).toBe("json");
    expect(byPath.get(".bkit/.env.example")?.format).toBe("byte-equal-text");
  });
});

// ---------------------------------------------------------------------------
// parseCloudAgents — value-space + back-compat (DECISION-C AMENDED: single field)
// ---------------------------------------------------------------------------

describe("parseCloudAgents — value space and back-compat", () => {
  it("parses 'claude' → 'claude'", () => {
    expect(parseCloudAgents("claude")).toBe("claude");
  });

  it("parses 'cursor' → 'cursor'", () => {
    expect(parseCloudAgents("cursor")).toBe("cursor");
  });

  it("parses 'opencode' → 'opencode'", () => {
    expect(parseCloudAgents("opencode")).toBe("opencode");
  });

  it("parses 'none' → 'none'", () => {
    expect(parseCloudAgents("none")).toBe("none");
  });

  it("returns null for unknown values", () => {
    expect(parseCloudAgents("enabled")).toBeNull();
    expect(parseCloudAgents("linear")).toBeNull();
    expect(parseCloudAgents("github")).toBeNull();
    expect(parseCloudAgents("jira")).toBeNull();
    expect(parseCloudAgents("")).toBeNull();
    expect(parseCloudAgents(null)).toBeNull();
    expect(parseCloudAgents(undefined)).toBeNull();
    expect(parseCloudAgents(42)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseIssueTracker — value space
// ---------------------------------------------------------------------------

describe("parseIssueTracker — value space", () => {
  it("the tracker set is github, linear, jira and the 'none' sentinel", () => {
    expect(ISSUE_TRACKERS).toEqual(["github", "linear", "jira", "none"]);
  });

  it.each(ISSUE_TRACKERS)("parses '%s' → '%s'", (tracker) => {
    expect(parseIssueTracker(tracker)).toBe(tracker);
  });

  it("returns null for unknown values", () => {
    expect(parseIssueTracker("Jira")).toBeNull();
    expect(parseIssueTracker("atlassian")).toBeNull();
    expect(parseIssueTracker("claude")).toBeNull();
    expect(parseIssueTracker("")).toBeNull();
    expect(parseIssueTracker(null)).toBeNull();
    expect(parseIssueTracker(undefined)).toBeNull();
    expect(parseIssueTracker(42)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getInstallManifest — snapshot / structural contract
// ---------------------------------------------------------------------------

describe("getInstallManifest", () => {
  it("returns entries for all modules when called with empty array", () => {
    const entries = getInstallManifest([]);
    expect(entries.length).toBeGreaterThan(0);
    // Every entry has required fields
    for (const e of entries) {
      expect(e.path).toBeTruthy();
      expect(["json", "markered-text", "byte-equal-text"]).toContain(e.format);
      expect(e.module).toBeTruthy();
    }
  });

  it("returns only entries for specified modules", () => {
    const entries = getInstallManifest(["claude"]);
    for (const e of entries) {
      expect(e.module).toBe("claude");
    }
  });

  it("accepts a Set<string> as modules parameter", () => {
    const entries = getInstallManifest(new Set(["claude", "cursor"]));
    const modules = new Set(entries.map((e) => e.module));
    expect(modules.has("claude")).toBe(true);
    expect(modules.has("cursor")).toBe(true);
    expect(modules.has("core")).toBe(false);
  });

  it("core manifest includes .bkit/version as byte-equal-text", () => {
    const entries = getInstallManifest(["core"]);
    const versionEntry = entries.find((e) => e.path.includes(".bkit/version"));
    expect(versionEntry).toBeDefined();
    expect(versionEntry!.format).toBe("byte-equal-text");
  });

  it("core manifest includes the canonical .bkit docs (#218; prompts.md markered #245)", () => {
    const entries = getInstallManifest(["core"]);
    // prompts.md is markered-text (carries the consumer-owned `## Model Overrides`
    // section below `bkit:end`); the rest are whole-file byte-equal.
    const byteEqualDocs = [
      "authoring.md",
      "cloud.md",
      "cli.md",
      "comparison.md",
      "install.md",
      "jsonl.md",
      "pipeline.md",
      "providers.md",
      "router.md",
      "trackers.md",
      "workflows.md",
      "README.md",
    ];
    for (const doc of byteEqualDocs) {
      const entry = entries.find((e) => e.path === `.bkit/${doc}`);
      expect(entry, `core manifest must list .bkit/${doc}`).toBeDefined();
      expect(entry!.format).toBe("byte-equal-text");
    }
    const promptsEntry = entries.find((e) => e.path === ".bkit/prompts.md");
    expect(promptsEntry, "core manifest must list .bkit/prompts.md").toBeDefined();
    expect(promptsEntry!.format).toBe("markered-text");
    const liteEntry = entries.find((e) => e.path === ".bkit/lite.md");
    expect(liteEntry, "core manifest must list .bkit/lite.md").toBeDefined();
    expect(liteEntry!.format).toBe("markered-text");
  });

  it("cloud owns no manifest entry (bkit-cloud-bootstrap.sh is a copy-and-own template)", () => {
    expect(getInstallManifest(["cloud"])).toEqual([]);
    expect(
      getInstallManifest(["claude"]).find(
        (e) => e.path === ".claude/hooks/bkit-cloud-bootstrap.sh",
      ),
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getModuleManifest — single-module accessor
// ---------------------------------------------------------------------------

describe("getModuleManifest", () => {
  const ALL_MODULES: ModuleName[] = [
    "core",
    "claude",
    "cursor",
    "opencode",
    "codex",
    "antigravity",
    "cloud",
  ];

  it("every file-writing module has at least one entry", () => {
    const fileWriting = ALL_MODULES.filter((m) => m !== "cloud");
    expect(fileWriting.length).toBeGreaterThan(0);
    for (const m of fileWriting) {
      expect(getModuleManifest(m).length, m).toBeGreaterThan(0);
    }
  });

  it("cloud writes no manifest entries", () => {
    // Every cloud file (workflow, bkit-cloud-bootstrap.sh, Cursor Dockerfile /
    // environment.json) ships as a copy-and-own template.
    expect(getModuleManifest("cloud")).toEqual([]);
  });

  it("all entries have correct module field", () => {
    for (const m of ALL_MODULES) {
      const entries = getModuleManifest(m);
      for (const e of entries) {
        expect(e.module).toBe(m);
      }
    }
  });

  it("all entries have valid format field", () => {
    for (const m of ALL_MODULES) {
      const entries = getModuleManifest(m);
      for (const e of entries) {
        expect(["json", "markered-text", "byte-equal-text"]).toContain(e.format);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// OPENCODE_MANIFEST — round-trip + format contracts (Task 2.1 "Done when")
// ---------------------------------------------------------------------------

describe("OPENCODE_MANIFEST — round-trip and format contracts", () => {
  it("contains .opencode/opencode.json as json (Tier-2 deep-contained)", () => {
    const entry = OPENCODE_MANIFEST.find((e) => e.path === ".opencode/opencode.json");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("json");
    expect(entry!.module).toBe("opencode");
  });

  it("contains .opencode/plugin/bkit-gateguard.js as markered-text (consumer owns the driver)", () => {
    const entry = OPENCODE_MANIFEST.find((e) => e.path === ".opencode/plugin/bkit-gateguard.js");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.module).toBe("opencode");
  });

  it("all OPENCODE_MANIFEST entries have module=opencode", () => {
    for (const entry of OPENCODE_MANIFEST) {
      expect(entry.module).toBe("opencode");
    }
  });

  it("all OPENCODE_MANIFEST format values are valid ManifestEntry formats", () => {
    const VALID_FORMATS = ["json", "markered-text", "byte-equal-text"];
    for (const entry of OPENCODE_MANIFEST) {
      expect(VALID_FORMATS).toContain(entry.format);
    }
  });

  it("getInstallManifest(['opencode']) returns OPENCODE_MANIFEST entries", () => {
    const entries = getInstallManifest(["opencode"]);
    const opencodeJsonEntry = entries.find((e) => e.path === ".opencode/opencode.json");
    const gateguardEntry = entries.find((e) => e.path === ".opencode/plugin/bkit-gateguard.js");
    expect(opencodeJsonEntry).toBeDefined();
    expect(gateguardEntry).toBeDefined();
  });

  it("getModuleManifest('opencode') returns at least 2 entries", () => {
    const entries = getModuleManifest("opencode");
    expect(entries.length).toBeGreaterThanOrEqual(2);
    for (const e of entries) {
      expect(e.module).toBe("opencode");
    }
  });

  it("opencode manifest is NOT included in getInstallManifest(['cursor']) (additive opt-in)", () => {
    const cursorEntries = getInstallManifest(["cursor"]);
    const opencodeEntry = cursorEntries.find((e) => e.path.startsWith(".opencode/"));
    expect(opencodeEntry).toBeUndefined();
  });

  it("opencode manifest is NOT included in getInstallManifest(['claude']) (additive opt-in)", () => {
    const claudeEntries = getInstallManifest(["claude"]);
    const opencodeEntry = claudeEntries.find((e) => e.path.startsWith(".opencode/"));
    expect(opencodeEntry).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// KN-19-for-opencode — writeTier2JsonContained throws on malformed destination
// Tests the shared helper's throw-on-malformed-destination contract as it
// applies to .opencode/opencode.json (Tier-2 json, committed default per plan).
// ---------------------------------------------------------------------------

describe("KN-19-for-opencode — writeTier2JsonContained throws on malformed .opencode/opencode.json", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-manifest-kn19-"));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writeTier2JsonContained throws on malformed destination JSON (KN-19)", async () => {
    // Dynamic import to keep install/write.ts fs side-effects out of module scope
    const { writeTier2JsonContained } = await import("./write");

    // Prepare a valid template (srcPath)
    const srcPath = path.join(tmpDir, "template.json");
    fs.writeFileSync(srcPath, JSON.stringify({ key: "value" }), "utf-8");

    // Prepare a malformed destination (dstPath) — simulates consumer-corrupted file
    const dstPath = path.join(tmpDir, "opencode.json");
    fs.writeFileSync(dstPath, "this is not valid { json", "utf-8");

    const ws: import("./write").WriteSet = { writes: [] };

    // Must throw — refusing to overwrite malformed consumer JSON (KN-19)
    expect(() => writeTier2JsonContained(srcPath, dstPath, false, ws)).toThrow(/malformed JSON/);
  });

  it("writeTier2JsonContained does NOT throw on valid destination JSON (normal path)", async () => {
    const { writeTier2JsonContained } = await import("./write");

    const srcPath = path.join(tmpDir, "template.json");
    fs.writeFileSync(srcPath, JSON.stringify({ key: "value" }), "utf-8");

    const dstPath = path.join(tmpDir, "opencode.json");
    fs.writeFileSync(dstPath, JSON.stringify({ existingKey: "preserved" }), "utf-8");

    const ws: import("./write").WriteSet = { writes: [] };
    expect(() => writeTier2JsonContained(srcPath, dstPath, false, ws)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// lint:prose — shipped prose-gate contract
//
// The value `.bkit/templates.md` § Gate tool scripts hands consumers; it runs in their
// pre-push hooks. The behaviour (skip, write-good restore, vale exit) lives in
// `bkit ci prose` and is tested in commands/ci/ci.test.ts.
// ---------------------------------------------------------------------------

const GATE_TOOL_SCRIPTS = ((): Record<string, string> => {
  const doc = fs.readFileSync(path.join(getBkitDocsRoot(), "templates.md"), "utf-8");
  const block = /```json\n([\s\S]*?)\n```/.exec(doc.slice(doc.indexOf("## Gate tool scripts")));
  return JSON.parse(block?.[1] ?? "{}") as Record<string, string>;
})();

describe("gate tool script template values", () => {
  it("lint:prose and slop:delta call their bkit ci gates", () => {
    expect(GATE_TOOL_SCRIPTS["lint:prose"]).toBe("bkit ci prose");
    expect(GATE_TOOL_SCRIPTS["slop:delta"]).toBe("bkit ci slop");
  });

  it("this repo's lint:prose calls the same gate", () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["lint:prose"]).toMatch(/^bkit ci prose(?: --glob='[^']+')+$/);
  });
});

// ---------------------------------------------------------------------------
// Telemetry data files — MUST be absent from manifest format entries
// These are git-tracked runtime ledgers, NOT install-engine payload.
// ---------------------------------------------------------------------------

describe("telemetry data files — absent from manifest format entries", () => {
  const DATA_FILES = [
    ".bkit/stats.jsonl",
    ".bkit/friction.jsonl",
    "docs/deferrals.jsonl",
    "docs/failures.jsonl",
  ];

  it("none of the four telemetry data files appear as manifest format entries", () => {
    const manifest = getInstallManifest();
    for (const dataFile of DATA_FILES) {
      const entry = manifest.find((e) => e.path === dataFile);
      expect(entry, `${dataFile} must NOT be a manifest format entry`).toBeUndefined();
    }
  });
});

describe("install/manifest: single dispatch on entry.format", () => {
  it("json entries: settings.json and hooks.json use format json", () => {
    const allEntries = getInstallManifest([]);
    const jsonEntries = allEntries.filter((e) => e.format === "json");
    const paths = jsonEntries.map((e) => e.path);
    expect(paths).toContain(".claude/settings.json");
    expect(paths).toContain(".cursor/hooks.json");
  });

  it("markered-text entries: AGENTS.md, CLAUDE.md, .gitignore use format markered-text", () => {
    const allEntries = getInstallManifest([]);
    const markedEntries = allEntries.filter((e) => e.format === "markered-text");
    const paths = markedEntries.map((e) => e.path);
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain("CLAUDE.md");
    expect(paths).toContain(".gitignore");
  });

  it("byte-equal-text entries: the owned .bkit files use format byte-equal-text", () => {
    const allEntries = getInstallManifest([]);
    const byteEqualEntries = allEntries.filter((e) => e.format === "byte-equal-text");
    const paths = byteEqualEntries.map((e) => e.path);
    expect(paths).toContain(".bkit/version");
    expect(paths).toContain(".bkit/.env.example");
    expect(paths).toContain(".bkit/comparison.md");
    expect(paths).toContain(".bkit/pipeline.md");
    expect(paths).toContain(".bkit/install.md");
  });

  it("every entry has a valid format value", () => {
    const allEntries = getInstallManifest([]);
    const validFormats = new Set(["json", "markered-text", "byte-equal-text"]);
    for (const entry of allEntries) {
      expect(validFormats.has(entry.format)).toBe(true);
    }
  });

  it("ANTIGRAVITY_MANIFEST: plugin.json + hooks.json are json, hooks + GEMINI.md markered-text", () => {
    const entries = getModuleManifest("antigravity");
    const byPath = new Map(entries.map((e) => [e.path, e]));
    expect(byPath.get(".agents/plugins/bkit/plugin.json")?.format).toBe("json");
    expect(byPath.get(".agents/plugins/bkit/hooks.json")?.format).toBe("json");
    expect(byPath.get(".agents/plugins/bkit/hooks/bkit-gateguard.cjs")?.format).toBe(
      "markered-text",
    );
    expect(byPath.get(".agents/plugins/bkit/hooks/bkit-guardrails.cjs")?.format).toBe(
      "markered-text",
    );
    expect(byPath.get("GEMINI.md")?.format).toBe("markered-text");
    // Opt-in: never present in another host's manifest.
    expect(
      getInstallManifest(["claude"]).some((e) => e.path === ".agents/plugins/bkit/hooks.json"),
    ).toBe(false);
  });
});
