// bkit-manifest.test.ts — P2.T1 — snapshot + contract tests.
import { describe, expect, it } from "vitest";
import {
  getInstallManifest,
  getModuleManifest,
  getManagedPackageJsonKeys,
  type ManifestEntry,
  type ModuleName,
} from "./bkit-manifest";

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
      expect([1, 2, 3]).toContain(e.tier);
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

  it("core manifest includes .bkit-version as tier-1", () => {
    const entries = getInstallManifest(["core"]);
    const versionEntry = entries.find((e) => e.path.includes(".bkit-version"));
    expect(versionEntry).toBeDefined();
    expect(versionEntry!.tier).toBe(1);
  });

  it("ci manifest includes ci.yml as tier-3", () => {
    const entries = getInstallManifest(["ci"]);
    const ciEntry = entries.find((e) => e.path.includes("ci.yml"));
    expect(ciEntry).toBeDefined();
    expect(ciEntry!.tier).toBe(3);
  });

  it("lint manifest includes .vale.ini as tier-3", () => {
    const entries = getInstallManifest(["lint"]);
    const valeEntry = entries.find((e) => e.path === ".vale.ini");
    expect(valeEntry).toBeDefined();
    expect(valeEntry!.tier).toBe(3);
  });

  it("lint manifest includes .prettierignore as tier-2", () => {
    const entries = getInstallManifest(["lint"]);
    const prettierEntry = entries.find((e) => e.path === ".prettierignore");
    expect(prettierEntry).toBeDefined();
    expect(prettierEntry!.tier).toBe(2);
  });

  it("git-hooks manifest includes .husky files as tier-2", () => {
    const entries = getInstallManifest(["git-hooks"]);
    const preCommit = entries.find((e) => e.path === ".husky/pre-commit");
    const prePush = entries.find((e) => e.path === ".husky/pre-push");
    expect(preCommit).toBeDefined();
    expect(preCommit!.tier).toBe(2);
    expect(prePush).toBeDefined();
    expect(prePush!.tier).toBe(2);
  });

  it("cursor manifest includes hooks.json as tier-1", () => {
    const entries = getInstallManifest(["cursor"]);
    const hooksEntry = entries.find((e) => e.path === ".cursor/hooks.json");
    expect(hooksEntry).toBeDefined();
    expect(hooksEntry!.tier).toBe(1);
  });

  it("claude manifest includes settings.json as tier-1", () => {
    const entries = getInstallManifest(["claude"]);
    const settingsEntry = entries.find((e) => e.path === ".claude/settings.json");
    expect(settingsEntry).toBeDefined();
    expect(settingsEntry!.tier).toBe(1);
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
