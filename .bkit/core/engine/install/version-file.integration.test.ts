// install/version-file.integration.test.ts — Integration tests for the `.bkit/version` reader and writer.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readBkitVersion, writeBkitVersion } from "./version-file";

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
