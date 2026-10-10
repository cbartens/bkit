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
  OPENCODE_MANIFEST,
  parseCloudAgents,
  type ModuleName,
} from "./manifest";
import { isTemplate } from "./modules/index";

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

describe(".claude/hooks/gateguard.cjs ownership (markered-text: consumer owns the driver)", () => {
  it("is owned by the claude module as markered-text", () => {
    const entry = getInstallManifest().find((e) => e.path === ".claude/hooks/gateguard.cjs");
    expect(entry).toBeDefined();
    expect(entry!.module).toBe("claude");
    expect(entry!.format).toBe("markered-text");
  });
});

// ---------------------------------------------------------------------------
// Cloud manifests — variant-split (T1.5 / DECISION-D). Only cloud=claude writes a file
// (cloud-bootstrap.sh); the cloud workflow and the Cursor Background Agent files are
// templates.
// ---------------------------------------------------------------------------

describe("cloud manifests", () => {
  it("cloud=claude owns only cloud-bootstrap.sh (markered-text)", () => {
    expect(CLOUD_MANIFEST_CLAUDE).toEqual([
      { path: ".claude/hooks/cloud-bootstrap.sh", format: "markered-text", module: "cloud" },
    ]);
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
  it("every module's entries are owned or shared files, never a template", () => {
    const templateEntries = getInstallManifest().filter((e) => isTemplate(e.path));
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
    expect(parseCloudAgents("")).toBeNull();
    expect(parseCloudAgents(null)).toBeNull();
    expect(parseCloudAgents(undefined)).toBeNull();
    expect(parseCloudAgents(42)).toBeNull();
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
    const entries = getInstallManifest(["lint"]);
    for (const e of entries) {
      expect(e.module).toBe("lint");
    }
  });

  it("accepts a Set<string> as modules parameter", () => {
    const entries = getInstallManifest(new Set(["claude", "lint"]));
    const modules = new Set(entries.map((e) => e.module));
    expect(modules.has("claude")).toBe(true);
    expect(modules.has("lint")).toBe(true);
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
      "cloud.md",
      "jsonl.md",
      "providers.md",
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
  });

  it("the lint module owns only the slop-scan plugin (its tool files are templates)", () => {
    expect(getInstallManifest(["lint"]).map((e) => e.path)).toEqual([
      ".bkit/scripts/bkit-slop-type-suppression.mjs",
    ]);
  });

  it("cloud manifest includes cloud-bootstrap.sh as markered-text (moved out of claude — #119)", () => {
    const entries = getInstallManifest(["cloud"]);
    const bootstrapEntry = entries.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh");
    expect(bootstrapEntry).toBeDefined();
    expect(bootstrapEntry!.format).toBe("markered-text");
    expect(
      getInstallManifest(["claude"]).find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh"),
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getModuleManifest — single-module accessor
// ---------------------------------------------------------------------------

describe("getModuleManifest", () => {
  const ALL_MODULES: ModuleName[] = ["core", "claude", "cursor", "lint"];

  it("every module has at least one entry", () => {
    for (const m of ALL_MODULES) {
      const entries = getModuleManifest(m);
      expect(entries.length).toBeGreaterThan(0);
    }
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

  it("contains .opencode/plugin/gateguard.js as markered-text (consumer owns the driver)", () => {
    const entry = OPENCODE_MANIFEST.find((e) => e.path === ".opencode/plugin/gateguard.js");
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
    const gateguardEntry = entries.find((e) => e.path === ".opencode/plugin/gateguard.js");
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
// pre-push hooks. These assert its embedding and guard invariants.
// ---------------------------------------------------------------------------

const LINT_PROSE_SCRIPT = ((): string => {
  const doc = fs.readFileSync(path.resolve(".bkit/templates.md"), "utf-8");
  const block = /```json\n([\s\S]*?)\n```/.exec(doc.slice(doc.indexOf("## Gate tool scripts")));
  return (JSON.parse(block?.[1] ?? "{}") as Record<string, string>)["lint:prose"] ?? "";
})();

describe("lint:prose template value", () => {
  const body = LINT_PROSE_SCRIPT.replace(/^bash -c '/, "").replace(/'$/, "");

  it("is wrapped in bash -c with no single quotes in the body", () => {
    // No inner single quote (the script is wrapped in `bash -c '...'`).
    expect(LINT_PROSE_SCRIPT.startsWith("bash -c '")).toBe(true);
    expect(LINT_PROSE_SCRIPT.endsWith("'")).toBe(true);
    expect(body).not.toContain("'");
  });

  it("contains no backticks", () => {
    // Inside a DOUBLE-quoted echo a backtick command-substitutes instead of printing.
    expect(body).not.toContain("`");
  });

  it("soft-skips instead of failing when the vale binary is absent", () => {
    expect(body).toContain("command -v vale");
    expect(body).toContain("vale not installed");
  });

  it("self-heals a missing write-good from the main worktree before falling back to sync", () => {
    // The worktree hole: .vale/styles/write-good is gitignored, so it is absent in
    // every fresh checkout and every `git worktree add`. --git-common-dir resolves
    // the main worktree from inside a linked one, making this a zero-network copy.
    expect(body).toContain("git rev-parse --git-common-dir");
    expect(body).toContain("cp -R");
    expect(body).toContain("vale sync");
    expect(body.indexOf("git rev-parse --git-common-dir")).toBeLessThan(body.indexOf("vale sync"));
  });

  it("announces loudly on stderr when vale is present but self-heal failed", () => {
    // A failed self-heal with vale present is loud on stderr.
    expect(body).toContain("PROSE LINT SKIPPED");
    expect(body).toContain(">&2");
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
