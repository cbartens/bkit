// bkit-manifest.test.ts — P2.T1 — snapshot + contract tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getInstallManifest,
  getModuleManifest,
  getManagedPackageJsonKeys,
  CLOUD_MANIFEST_CLAUDE,
  CLOUD_MANIFEST_CURSOR,
  CLOUD_MANIFEST_OPENCODE,
  OPENCODE_MANIFEST,
  parseCloudAgents,
  type ManifestEntry,
  type ModuleName,
} from "./bkit-manifest";

// ---------------------------------------------------------------------------
// CLOUD_MANIFEST_CLAUDE / CLOUD_MANIFEST_CURSOR — variant-split (T1.5 / DECISION-D)
// Derived Test Matrix row 14: each manifest entry tagged with / gated by its owning variant.
// ---------------------------------------------------------------------------

describe("CLOUD_MANIFEST_CLAUDE — cloud=claude variant owns bkit-cloud.yml + cloud-bootstrap.sh", () => {
  it("contains bkit-cloud.yml as byte-equal-text", () => {
    const entry = CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".github/workflows/bkit-cloud.yml");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.module).toBe("cloud");
  });

  it("contains cloud-bootstrap.sh as markered-text", () => {
    const entry = CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.module).toBe("cloud");
  });

  it("does NOT contain .cursor/Dockerfile or .cursor/environment.json (cursor variant only)", () => {
    expect(CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".cursor/Dockerfile")).toBeUndefined();
    expect(
      CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".cursor/environment.json"),
    ).toBeUndefined();
  });

  it("contains exactly 2 entries (bkit-cloud.yml + cloud-bootstrap.sh)", () => {
    expect(CLOUD_MANIFEST_CLAUDE.length).toBe(2);
  });
});

describe("CLOUD_MANIFEST_CURSOR — cloud=cursor variant owns .cursor/Dockerfile + environment.json", () => {
  it("contains .cursor/Dockerfile as markered-text", () => {
    const entry = CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".cursor/Dockerfile");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.module).toBe("cloud");
  });

  it("contains .cursor/environment.json as byte-equal-text with seedOrPrint=true", () => {
    const entry = CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".cursor/environment.json");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.seedOrPrint).toBe(true);
    expect(entry!.module).toBe("cloud");
  });

  it("does NOT contain bkit-cloud.yml or cloud-bootstrap.sh (claude/opencode variant only)", () => {
    expect(
      CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".github/workflows/bkit-cloud.yml"),
    ).toBeUndefined();
    expect(
      CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh"),
    ).toBeUndefined();
  });

  it("contains exactly 2 entries (Dockerfile + environment.json)", () => {
    expect(CLOUD_MANIFEST_CURSOR.length).toBe(2);
  });
});

describe("CLOUD_MANIFEST_OPENCODE — cloud=opencode variant owns bkit-cloud.yml (same file as claude)", () => {
  it("contains bkit-cloud.yml as byte-equal-text", () => {
    const entry = CLOUD_MANIFEST_OPENCODE.find(
      (e) => e.path === ".github/workflows/bkit-cloud.yml",
    );
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.module).toBe("cloud");
  });

  it("does NOT contain cloud-bootstrap.sh (claude only) or cursor files", () => {
    expect(
      CLOUD_MANIFEST_OPENCODE.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh"),
    ).toBeUndefined();
    expect(CLOUD_MANIFEST_OPENCODE.find((e) => e.path === ".cursor/Dockerfile")).toBeUndefined();
  });

  it("contains exactly 1 entry (bkit-cloud.yml only)", () => {
    expect(CLOUD_MANIFEST_OPENCODE.length).toBe(1);
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

  it("back-compat: legacy 'enabled' → 'claude' (DECISION-C AMENDED)", () => {
    expect(parseCloudAgents("enabled")).toBe("claude");
  });

  it("returns null for unknown values", () => {
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
    const entries = getInstallManifest(new Set(["ci", "lint"]));
    const modules = new Set(entries.map((e) => e.module));
    expect(modules.has("ci")).toBe(true);
    expect(modules.has("lint")).toBe(true);
    expect(modules.has("core")).toBe(false);
  });

  it("core manifest includes .bkit/version as byte-equal-text", () => {
    const entries = getInstallManifest(["core"]);
    const versionEntry = entries.find((e) => e.path.includes(".bkit/version"));
    expect(versionEntry).toBeDefined();
    expect(versionEntry!.format).toBe("byte-equal-text");
  });

  it("core manifest includes the six canonical .bkit docs as byte-equal-text, non-seed (#218)", () => {
    const entries = getInstallManifest(["core"]);
    const docs = [
      "cloud.md",
      "providers.md",
      "prompts.md",
      "trackers.md",
      "workflows.md",
      "README.md",
    ];
    for (const doc of docs) {
      const entry = entries.find((e) => e.path === `.bkit/${doc}`);
      expect(entry, `core manifest must list .bkit/${doc}`).toBeDefined();
      expect(entry!.format).toBe("byte-equal-text");
      expect(entry!.seedOrPrint ?? false).toBe(false);
    }
  });

  it("ci manifest includes ci.yml as byte-equal-text", () => {
    const entries = getInstallManifest(["ci"]);
    const ciEntry = entries.find((e) => e.path.includes("ci.yml"));
    expect(ciEntry).toBeDefined();
    expect(ciEntry!.format).toBe("byte-equal-text");
  });

  it("lint manifest includes .vale.ini as byte-equal-text", () => {
    const entries = getInstallManifest(["lint"]);
    const valeEntry = entries.find((e) => e.path === ".vale.ini");
    expect(valeEntry).toBeDefined();
    expect(valeEntry!.format).toBe("byte-equal-text");
  });

  it("lint manifest includes .prettierignore as markered-text", () => {
    const entries = getInstallManifest(["lint"]);
    const prettierEntry = entries.find((e) => e.path === ".prettierignore");
    expect(prettierEntry).toBeDefined();
    expect(prettierEntry!.format).toBe("markered-text");
  });

  it("git-hooks manifest includes .husky files as byte-equal-text (Tier 3 seed-or-print, v2.0.4)", () => {
    const entries = getInstallManifest(["git-hooks"]);
    const preCommit = entries.find((e) => e.path === ".husky/pre-commit");
    const prePush = entries.find((e) => e.path === ".husky/pre-push");
    expect(preCommit).toBeDefined();
    expect(preCommit!.format).toBe("byte-equal-text");
    expect(prePush).toBeDefined();
    expect(prePush!.format).toBe("byte-equal-text");
  });

  it("cursor manifest includes hooks.json as json", () => {
    const entries = getInstallManifest(["cursor"]);
    const hooksEntry = entries.find((e) => e.path === ".cursor/hooks.json");
    expect(hooksEntry).toBeDefined();
    expect(hooksEntry!.format).toBe("json");
  });

  it("claude manifest includes settings.json as json", () => {
    const entries = getInstallManifest(["claude"]);
    const settingsEntry = entries.find((e) => e.path === ".claude/settings.json");
    expect(settingsEntry).toBeDefined();
    expect(settingsEntry!.format).toBe("json");
  });

  it("lint manifest includes slop-scan.config.json as byte-equal-text", () => {
    const entries = getInstallManifest(["lint"]);
    const slopEntry = entries.find((e) => e.path === "slop-scan.config.json");
    expect(slopEntry).toBeDefined();
    expect(slopEntry!.format).toBe("byte-equal-text");
  });

  it("cloud manifest includes environment.json as byte-equal-text (moved out of cursor — #119)", () => {
    const entries = getInstallManifest(["cloud"]);
    const envEntry = entries.find((e) => e.path === ".cursor/environment.json");
    expect(envEntry).toBeDefined();
    expect(envEntry!.format).toBe("byte-equal-text");
    expect(envEntry!.seedOrPrint).toBe(true);
    // Not in the default cursor module — it ships only via --cloud.
    expect(
      getInstallManifest(["cursor"]).find((e) => e.path === ".cursor/environment.json"),
    ).toBeUndefined();
  });

  it("cloud manifest includes Dockerfile as markered-text (moved out of cursor — #119)", () => {
    const entries = getInstallManifest(["cloud"]);
    const dockerEntry = entries.find((e) => e.path === ".cursor/Dockerfile");
    expect(dockerEntry).toBeDefined();
    expect(dockerEntry!.format).toBe("markered-text");
    expect(
      getInstallManifest(["cursor"]).find((e) => e.path === ".cursor/Dockerfile"),
    ).toBeUndefined();
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

  it("cloud manifest includes the phase-routed bkit-cloud.yml workflow (renamed from bkit-auto.yml — #245)", () => {
    const entries = getInstallManifest(["cloud"]);
    const wf = entries.find((e) => e.path === ".github/workflows/bkit-cloud.yml");
    expect(wf).toBeDefined();
    expect(wf!.format).toBe("byte-equal-text");
    expect(entries.find((e) => e.path === ".github/workflows/bkit-auto.yml")).toBeUndefined();
    expect(entries.find((e) => e.path === ".github/workflows/bkit-ci-router.yml")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getModuleManifest — single-module accessor
// ---------------------------------------------------------------------------

describe("getModuleManifest", () => {
  const ALL_MODULES: ModuleName[] = ["core", "claude", "cursor", "ci", "lint", "git-hooks"];

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
// getManagedPackageJsonKeys — aggregate scripts + devDependencies
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// OPENCODE_MANIFEST — round-trip + format contracts (Task 2.1 "Done when")
// ---------------------------------------------------------------------------

describe("OPENCODE_MANIFEST — round-trip and format contracts", () => {
  it("contains .opencode/opencode.json as json (Tier-2 deep-contained)", () => {
    const entry = OPENCODE_MANIFEST.find((e) => e.path === ".opencode/opencode.json");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("json");
    expect(entry!.module).toBe("opencode");
    // opencode.json is ownership-mixed — must NOT be seed-or-print (KN-17: reconverged on upgrade)
    expect(entry!.seedOrPrint ?? false).toBe(false);
  });

  it("contains .opencode/plugin/gateguard.js as byte-equal-text (Tier-1 bkit-owned)", () => {
    const entry = OPENCODE_MANIFEST.find((e) => e.path === ".opencode/plugin/gateguard.js");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.module).toBe("opencode");
    // gateguard.js is fully bkit-owned — must NOT be seed-or-print
    expect(entry!.seedOrPrint ?? false).toBe(false);
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
    // Dynamic import to keep bkit-tiers fs side-effects out of module scope
    const { writeTier2JsonContained } = await import("./bkit-tiers");

    // Prepare a valid template (srcPath)
    const srcPath = path.join(tmpDir, "template.json");
    fs.writeFileSync(srcPath, JSON.stringify({ key: "value" }), "utf-8");

    // Prepare a malformed destination (dstPath) — simulates consumer-corrupted file
    const dstPath = path.join(tmpDir, "opencode.json");
    fs.writeFileSync(dstPath, "this is not valid { json", "utf-8");

    const ws: import("./bkit-tiers").WriteSet = { writes: [] };

    // Must throw — refusing to overwrite malformed consumer JSON (KN-19)
    expect(() => writeTier2JsonContained(srcPath, dstPath, false, ws)).toThrow(/malformed JSON/);
  });

  it("writeTier2JsonContained does NOT throw on valid destination JSON (normal path)", async () => {
    const { writeTier2JsonContained } = await import("./bkit-tiers");

    const srcPath = path.join(tmpDir, "template.json");
    fs.writeFileSync(srcPath, JSON.stringify({ key: "value" }), "utf-8");

    const dstPath = path.join(tmpDir, "opencode.json");
    fs.writeFileSync(dstPath, JSON.stringify({ existingKey: "preserved" }), "utf-8");

    const ws: import("./bkit-tiers").WriteSet = { writes: [] };
    expect(() => writeTier2JsonContained(srcPath, dstPath, false, ws)).not.toThrow();
  });
});

describe("getManagedPackageJsonKeys", () => {
  it("aggregates scripts from lint module: format:check, lint:prose, lint:slop", () => {
    const { scripts } = getManagedPackageJsonKeys(["lint"]);
    expect(Object.keys(scripts)).toContain("format:check");
    expect(Object.keys(scripts)).toContain("lint:prose");
    expect(Object.keys(scripts)).toContain("lint:slop");
  });

  it("aggregates devDependencies from lint module: prettier, slop-scan", () => {
    const { devDependencies } = getManagedPackageJsonKeys(["lint"]);
    expect(Object.keys(devDependencies)).toContain("prettier");
    expect(Object.keys(devDependencies)).toContain("slop-scan");
  });

  it("aggregates prepare script from git-hooks module", () => {
    const { scripts } = getManagedPackageJsonKeys(["git-hooks"]);
    expect(Object.keys(scripts)).toContain("prepare");
  });

  it("aggregates devDependencies from git-hooks module: husky", () => {
    const { devDependencies } = getManagedPackageJsonKeys(["git-hooks"]);
    expect(Object.keys(devDependencies)).toContain("husky");
  });

  it("aggregates typecheck from ci module", () => {
    const { scripts } = getManagedPackageJsonKeys(["ci"]);
    expect(Object.keys(scripts)).toContain("typecheck");
  });

  it("returns empty objects when no packageJsonKeys entries present", () => {
    const { scripts, devDependencies } = getManagedPackageJsonKeys(["core"]);
    // core has no packageJsonKeys in its manifest entries
    expect(scripts).toEqual({});
    expect(devDependencies).toEqual({});
  });

  it("aggregates across all modules when called with empty array", () => {
    const { scripts, devDependencies } = getManagedPackageJsonKeys([]);
    expect(Object.keys(scripts).length).toBeGreaterThan(0);
    expect(Object.keys(devDependencies).length).toBeGreaterThan(0);
  });

  it("manifest snapshot: all expected managed scripts present across full install", () => {
    const { scripts } = getManagedPackageJsonKeys([]);
    const expected = ["typecheck", "format:check", "lint:prose", "lint:slop", "prepare"];
    for (const s of expected) {
      expect(Object.keys(scripts)).toContain(s);
    }
  });
});
