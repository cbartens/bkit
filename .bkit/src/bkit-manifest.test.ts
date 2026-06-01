// bkit-manifest.test.ts — P2.T1 — snapshot + contract tests.
import { describe, expect, it } from "vitest";
import {
  getInstallManifest,
  getModuleManifest,
  getManagedPackageJsonKeys,
  CLOUD_MANIFEST_CLAUDE,
  CLOUD_MANIFEST_CURSOR,
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

  it("does NOT contain bkit-cloud.yml or cloud-bootstrap.sh (claude variant only)", () => {
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

  it("core manifest includes .bkit-version as byte-equal-text", () => {
    const entries = getInstallManifest(["core"]);
    const versionEntry = entries.find((e) => e.path.includes(".bkit-version"));
    expect(versionEntry).toBeDefined();
    expect(versionEntry!.format).toBe("byte-equal-text");
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

  it("cloud manifest includes the phase-routed bkit-cloud.yml workflow (renamed from bkit-ci-router — #119)", () => {
    const entries = getInstallManifest(["cloud"]);
    const wf = entries.find((e) => e.path === ".github/workflows/bkit-cloud.yml");
    expect(wf).toBeDefined();
    expect(wf!.format).toBe("byte-equal-text");
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
