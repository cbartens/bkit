// checks/before/version.test.ts — Unit tests for the Phase 1 version-pin detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectBkitVersionMajorDowngrade, detectBkitVersionPinStale } from "./version";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// detectBkitVersionMajorDowngrade
// ---------------------------------------------------------------------------

describe("detectBkitVersionMajorDowngrade", () => {
  it("returns finding when on-disk major is greater than installing major", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({ pinnedVersion: "2.0.0" }),
    );
    const result = detectBkitVersionMajorDowngrade(tmpDir, "1.5.0");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("bkit-version-major-downgrade");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when on-disk major equals installing major", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({ pinnedVersion: "1.2.0" }),
    );
    expect(detectBkitVersionMajorDowngrade(tmpDir, "1.5.0")).toBeNull();
  });

  it("returns null when on-disk major is less than installing major (upgrade)", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({ pinnedVersion: "1.0.0" }),
    );
    expect(detectBkitVersionMajorDowngrade(tmpDir, "2.0.0")).toBeNull();
  });

  it("returns null when .bkit/version is absent", () => {
    expect(detectBkitVersionMajorDowngrade(tmpDir, "1.0.0")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectBkitVersionPinStale
// ---------------------------------------------------------------------------

describe("detectBkitVersionPinStale", () => {
  function writeInstalledBkit(version: string): void {
    const dir = path.join(tmpDir, "node_modules", "@cbartens", "bkit");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version }), "utf-8");
  }

  function writeOnDiskVersion(version: string): void {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({ pinnedVersion: version }),
    );
  }

  it("(a) returns finding when installed version > on-disk version", () => {
    writeInstalledBkit("0.5.0");
    writeOnDiskVersion("0.4.1");
    const result = detectBkitVersionPinStale(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("bkit-version-pin-stale");
    expect(result!.severity).toBe("advisory");
    expect(result!.detect).toContain("0.5.0");
    expect(result!.detect).toContain("0.4.1");
  });

  it("(b) returns null when versions match", () => {
    writeInstalledBkit("0.4.1");
    writeOnDiskVersion("0.4.1");
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });

  it("(c) returns null when installed version < on-disk version (downgrade case)", () => {
    writeInstalledBkit("0.4.0");
    writeOnDiskVersion("0.4.1");
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });

  it("(d) returns null when node_modules/@cbartens/bkit/package.json is absent", () => {
    writeOnDiskVersion("0.4.1");
    // Don't write installed bkit
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });

  it("(e) returns null when .bkit/version is absent", () => {
    writeInstalledBkit("0.5.0");
    // Don't write on-disk version
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectShellToken: unset vs empty-string
// .npmrc inline action text + fallback
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});
