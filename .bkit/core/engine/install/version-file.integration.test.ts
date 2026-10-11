// install/version-file.integration.test.ts — Integration tests for the `.bkit/version` reader and writer.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readBkitVersion, sha256, writeBkitVersion } from "./version-file";
import { updateCanonicalHashesAfterUpgrade } from "../commands/install/upgrade";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

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
// readBkitVersion extracts pinnedVersion from a JSON-format file
// ---------------------------------------------------------------------------

describe("C1 regression: .bkit-version JSON format → pinnedVersion extraction", () => {
  it("readBkitVersion returns pinnedVersion semver string when file is JSON format (v0.7.x+)", () => {
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.7.3",
      canonicalHashes: {},
      claudeAllowDerived: [],
    });

    const parsed = readBkitVersion(versionFile);
    expect(parsed).not.toBeNull();
    // pinnedVersion must be "0.7.3", NOT the full JSON string
    expect(parsed!.pinnedVersion).toBe("0.7.3");
    expect(parsed!.pinnedVersion).not.toContain("{");
    expect(parsed!.pinnedVersion).not.toContain("pinnedVersion");
  });

  it("readBkitVersion.pinnedVersion passes semverLte correctly (not the JSON blob)", () => {
    // Confirm the extracted value is a valid semver — a JSON blob would fail semver comparisons
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "0.8.0",
      canonicalHashes: {},
      claudeAllowDerived: [],
    });

    const parsed = readBkitVersion(versionFile);
    const pinnedVersion = parsed?.pinnedVersion ?? "";
    // Semver string must match NN.NN.NN pattern (JSON blob would not match)
    expect(pinnedVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});

// ---------------------------------------------------------------------------
// updateCanonicalHashesAfterUpgrade — the upgrade side of the shared merge
// ---------------------------------------------------------------------------

describe("updateCanonicalHashesAfterUpgrade prunes hashes for absent paths", () => {
  const seed = (canonicalHashes: Record<string, string>): string => {
    const versionFile = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    writeBkitVersion(versionFile, {
      pinnedVersion: "4.12.0",
      canonicalHashes,
      claudeAllowDerived: [],
    });
    return versionFile;
  };

  it("drops an entry whose file is gone and refreshes a written file's hash", () => {
    fs.writeFileSync(path.join(tmpDir, "kept.md"), "kept v2", "utf-8");
    const versionFile = seed({ "kept.md": sha256("kept v1"), "retired/gone.md": "dead" });

    updateCanonicalHashesAfterUpgrade(
      { updated: ["kept.md"], conflicts: [], skipped: [], skippedSeedable: [] },
      { dryRun: false, cwd: tmpDir },
    );

    const after = readBkitVersion(versionFile)!;
    expect(after.canonicalHashes).toEqual({ "kept.md": sha256("kept v2") });
  });

  it("persists a prune-only run (no files processed, pin current)", () => {
    const versionFile = seed({ "retired/gone.md": "dead" });

    updateCanonicalHashesAfterUpgrade(
      { updated: [], conflicts: [], skipped: [], skippedSeedable: [] },
      { dryRun: false, cwd: tmpDir },
    );

    expect(readBkitVersion(versionFile)!.canonicalHashes).toEqual({});
  });

  it("still writes nothing when there is no work and nothing to prune", () => {
    fs.writeFileSync(path.join(tmpDir, "live.md"), "live", "utf-8");
    const versionFile = seed({ "live.md": sha256("live") });
    const before = fs.readFileSync(versionFile, "utf-8");

    updateCanonicalHashesAfterUpgrade(
      { updated: [], conflicts: [], skipped: [], skippedSeedable: [] },
      { dryRun: false, cwd: tmpDir },
    );

    expect(fs.readFileSync(versionFile, "utf-8")).toBe(before);
  });
});
