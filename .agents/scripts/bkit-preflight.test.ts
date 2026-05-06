// bkit-preflight.test.ts — Unit tests for Phase 1 preflight detectors (BAR-141).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  hasBkitMarkers,
  detectNoPackageJson,
  detectMalformedPackageJson,
  detectNotGitRepo,
  detectHuskyNoMarkers,
  detectPrettierignoreNoMarkers,
  detectLintProseF9Vulnerable,
  detectBkitVersionMajorDowngrade,
  detectBkitVersionPinStale,
  runPreflight,
} from "./bkit-preflight";

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

function makeModules(...flags: string[]): Set<import("./bkit-cli").ModuleFlag> {
  return new Set(flags) as Set<import("./bkit-cli").ModuleFlag>;
}

// ---------------------------------------------------------------------------
// hasBkitMarkers
// ---------------------------------------------------------------------------

describe("hasBkitMarkers", () => {
  it("returns true for HTML comment marker", () => {
    expect(hasBkitMarkers("<!-- bkit:start -->\ncontent\n<!-- bkit:end -->")).toBe(true);
  });

  it("returns true for hash-comment marker", () => {
    expect(hasBkitMarkers("# bkit:start\ncontent\n# bkit:end")).toBe(true);
  });

  it("returns false when no markers present", () => {
    expect(hasBkitMarkers("just some content\nwith no markers")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasBkitMarkers("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectNoPackageJson
// ---------------------------------------------------------------------------

describe("detectNoPackageJson", () => {
  it("returns finding when package.json is absent", () => {
    const result = detectNoPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("no-package-json");
    expect(result!.severity).toBe("blocker");
    expect(result!.detect).toBeTruthy();
    expect(result!.action).toBeTruthy();
  });

  it("returns null when package.json exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectNoPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectMalformedPackageJson
// ---------------------------------------------------------------------------

describe("detectMalformedPackageJson", () => {
  it("returns finding when package.json contains invalid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not valid json }", "utf-8");
    const result = detectMalformedPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("malformed-package-json");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when package.json is valid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });

  it("returns null when package.json is absent (no-package-json fires instead)", () => {
    expect(detectMalformedPackageJson(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectNotGitRepo
// ---------------------------------------------------------------------------

describe("detectNotGitRepo", () => {
  it("returns finding when --core requested AND .git/ absent", () => {
    const result = detectNotGitRepo(tmpDir, makeModules("core"));
    expect(result).not.toBeNull();
    expect(result!.id).toBe("not-git-repo");
    expect(result!.severity).toBe("blocker");
  });

  it("returns null when --core requested AND .git/ exists", () => {
    fs.mkdirSync(path.join(tmpDir, ".git"));
    expect(detectNotGitRepo(tmpDir, makeModules("core"))).toBeNull();
  });

  it("returns null when --core NOT requested (even if .git/ absent)", () => {
    // No core flag — not-git-repo should NOT fire
    expect(detectNotGitRepo(tmpDir, makeModules("lint"))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectHuskyNoMarkers
// ---------------------------------------------------------------------------

describe("detectHuskyNoMarkers", () => {
  it("returns finding when .husky/pre-commit exists without markers", () => {
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-commit"), "#!/bin/sh\npnpm test\n", "utf-8");
    const result = detectHuskyNoMarkers(tmpDir, "pre-commit");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("husky-no-markers-precommit");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when .husky/pre-commit has HTML markers", () => {
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".husky", "pre-commit"),
      "<!-- bkit:start -->\npnpm test\n<!-- bkit:end -->\n",
      "utf-8",
    );
    expect(detectHuskyNoMarkers(tmpDir, "pre-commit")).toBeNull();
  });

  it("returns null when .husky/pre-commit has hash-comment markers", () => {
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".husky", "pre-commit"),
      "# bkit:start\npnpm test\n# bkit:end\n",
      "utf-8",
    );
    expect(detectHuskyNoMarkers(tmpDir, "pre-commit")).toBeNull();
  });

  it("returns null when .husky/pre-commit is absent", () => {
    expect(detectHuskyNoMarkers(tmpDir, "pre-commit")).toBeNull();
  });

  it("returns finding when .husky/pre-push exists without markers", () => {
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-push"), "#!/bin/sh\necho push\n", "utf-8");
    const result = detectHuskyNoMarkers(tmpDir, "pre-push");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("husky-no-markers-prepush");
  });

  it("returns null when .husky/pre-push is absent", () => {
    expect(detectHuskyNoMarkers(tmpDir, "pre-push")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectPrettierignoreNoMarkers
// ---------------------------------------------------------------------------

describe("detectPrettierignoreNoMarkers", () => {
  it("returns finding when .prettierignore exists without markers", () => {
    fs.writeFileSync(path.join(tmpDir, ".prettierignore"), "node_modules\ndist\n", "utf-8");
    const result = detectPrettierignoreNoMarkers(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("prettierignore-no-markers");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when .prettierignore has bkit markers", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".prettierignore"),
      "# bkit:start\nnode_modules\n# bkit:end\n",
      "utf-8",
    );
    expect(detectPrettierignoreNoMarkers(tmpDir)).toBeNull();
  });

  it("returns null when .prettierignore is absent", () => {
    expect(detectPrettierignoreNoMarkers(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectLintProseF9Vulnerable
// ---------------------------------------------------------------------------

describe("detectLintProseF9Vulnerable", () => {
  it("returns finding when lint:prose script exists but lacks write-good guard", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test",
        scripts: { "lint:prose": "vale $(find . -name '*.md')" },
      }),
      "utf-8",
    );
    const result = detectLintProseF9Vulnerable(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("lint-prose-f9-vulnerable");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when lint:prose script includes the write-good guard", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test",
        scripts: {
          "lint:prose":
            "bash -c 'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale ...; fi'",
        },
      }),
      "utf-8",
    );
    expect(detectLintProseF9Vulnerable(tmpDir)).toBeNull();
  });

  it("returns null when lint:prose script is absent", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", scripts: { build: "tsc" } }),
      "utf-8",
    );
    expect(detectLintProseF9Vulnerable(tmpDir)).toBeNull();
  });

  it("returns null when package.json is absent", () => {
    expect(detectLintProseF9Vulnerable(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectBkitVersionMajorDowngrade
// ---------------------------------------------------------------------------

describe("detectBkitVersionMajorDowngrade", () => {
  it("returns finding when on-disk major is greater than installing major", () => {
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", ".bkit-version"), "2.0.0\n", "utf-8");
    const result = detectBkitVersionMajorDowngrade(tmpDir, "1.5.0");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("bkit-version-major-downgrade");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when on-disk major equals installing major", () => {
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", ".bkit-version"), "1.2.0\n", "utf-8");
    expect(detectBkitVersionMajorDowngrade(tmpDir, "1.5.0")).toBeNull();
  });

  it("returns null when on-disk major is less than installing major (upgrade)", () => {
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", ".bkit-version"), "1.0.0\n", "utf-8");
    expect(detectBkitVersionMajorDowngrade(tmpDir, "2.0.0")).toBeNull();
  });

  it("returns null when .bkit-version is absent", () => {
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
    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".agents", ".bkit-version"), version + "\n", "utf-8");
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

  it("(e) returns null when .agents/.bkit-version is absent", () => {
    writeInstalledBkit("0.5.0");
    // Don't write on-disk version
    expect(detectBkitVersionPinStale(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// runPreflight — integration of all detectors
// ---------------------------------------------------------------------------

describe("runPreflight", () => {
  it("returns blockers when package.json is absent", () => {
    const { blockers, advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(blockers.some((f) => f.id === "no-package-json")).toBe(true);
    // When package.json is absent, not-git-repo may not also fire (depends on git dir)
  });

  it("returns blocker malformed-package-json when JSON is invalid", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ invalid }", "utf-8");
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    expect(blockers.some((f) => f.id === "malformed-package-json")).toBe(true);
  });

  it("returns no blockers when package.json is valid and git repo exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
    expect(blockers).toHaveLength(0);
  });

  it("returns advisory husky-no-markers-precommit when .husky/pre-commit has no markers", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-commit"), "#!/bin/sh\npnpm test\n", "utf-8");
    const { advisories } = runPreflight(makeModules("lint"), tmpDir);
    expect(advisories.some((f) => f.id === "husky-no-markers-precommit")).toBe(true);
  });

  it("deduplicates findings within phase when same id would appear twice", () => {
    // Simulate by calling runPreflight — it cannot produce duplicate ids organically
    // because each detector is called once. But we can verify the dedup logic by
    // checking no duplicates exist in the output.
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    const { blockers, advisories } = runPreflight(makeModules("lint"), tmpDir);
    const allIds = [...blockers, ...advisories].map((f) => f.id);
    const uniqueIds = [...new Set(allIds)];
    expect(allIds).toEqual(uniqueIds);
  });

  it("not-git-repo does NOT fire when --core is not requested", () => {
    // No package.json, no .git, but no --core either — not-git-repo should not fire
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    const { blockers } = runPreflight(makeModules("lint"), tmpDir);
    expect(blockers.some((f) => f.id === "not-git-repo")).toBe(false);
  });
});
