// checks/before/index.test.ts — Unit tests for the Phase 1 runner (runPreflight) (BAR-141).

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { serializeBkitVersion } from "../../install/version-file";
import { runPreflight, dedupeById, type PreflightFinding } from "./index";

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

function makeModules(...flags: string[]): Set<import("../../cli").ModuleFlag> {
  return new Set(flags) as Set<import("../../cli").ModuleFlag>;
}

// ---------------------------------------------------------------------------
// runPreflight — integration of all detectors
// ---------------------------------------------------------------------------

describe("runPreflight", () => {
  it("returns blockers when package.json is absent", () => {
    const { blockers } = runPreflight(makeModules("core"), tmpDir);
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

  it("deduplicates findings within phase when same id would appear twice", () => {
    // Simulate by calling runPreflight — it cannot produce duplicate ids organically
    // because each detector is called once. But we can verify the dedup logic by
    // checking no duplicates exist in the output.
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    const { blockers, advisories } = runPreflight(makeModules("claude"), tmpDir);
    const allIds = [...blockers, ...advisories].map((f) => f.id);
    const uniqueIds = [...new Set(allIds)];
    expect(allIds).toEqual(uniqueIds);
  });

  it("reads the installing version from the package root when run from dist/ (no false downgrade)", () => {
    const pkgRoot = path.resolve(__dirname, "../../../../..");
    const built = path.join(pkgRoot, "dist", "checks", "before", "index.js");
    expect(fs.existsSync(built), `${built} missing — run pnpm build`).toBe(true);
    const version = (
      JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf-8")) as {
        version: string;
      }
    ).version;
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      serializeBkitVersion({ pinnedVersion: version, canonicalHashes: {}, claudeAllowDerived: [] }),
      "utf-8",
    );
    const r = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import { runPreflight } from ${JSON.stringify(pathToFileURL(built).href)};` +
          ` const { advisories } = runPreflight(new Set(["core"]), process.cwd());` +
          ` process.stdout.write(JSON.stringify(advisories.map((f) => f.id)));`,
      ],
      { cwd: tmpDir, encoding: "utf-8" },
    );
    expect(r.status, r.stderr).toBe(0);
    expect(JSON.parse(r.stdout)).not.toContain("bkit-version-major-downgrade");
  });

  it("not-git-repo does NOT fire when --core is not requested", () => {
    // No package.json, no .git, but no --core either — not-git-repo should not fire
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    const { blockers } = runPreflight(makeModules("claude"), tmpDir);
    expect(blockers.some((f) => f.id === "not-git-repo")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectHooksConfigOverwriteRisk is absent
// ---------------------------------------------------------------------------
// These tests check that the function does not exist in the source.

describe("P3.T7 — detectHooksConfigOverwriteRisk absent", () => {
  // Every checks/before/ source file, concatenated.
  const beforeSources = () =>
    fs
      .readdirSync(__dirname)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .map((f) => fs.readFileSync(path.join(__dirname, f), "utf-8"))
      .join("\n");

  it("detectHooksConfigOverwriteRisk is NOT present in the checks/before/ sources", () => {
    // Source-level check: the function must not exist in the source
    const src = beforeSources();
    expect(src).not.toContain("detectHooksConfigOverwriteRisk");
  });

  it("the checks/before/ sources do not contain detectHooksConfigOverwriteRisk", () => {
    const src = beforeSources();
    expect(src).not.toContain("detectHooksConfigOverwriteRisk");
  });

  it("runPreflight does NOT produce hooks-config-overwrite-risk blockers (Tier-2 handles survival)", () => {
    // Consumer with Stop hooks — should NOT block under Tier-2 architecture
    fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      JSON.stringify({
        hooks: {
          SessionStart: [{ hooks: [{ type: "command", command: "preflight.sh" }] }],
          Stop: [{ hooks: [{ type: "command", command: "postflight.sh" }] }],
        },
      }),
      "utf-8",
    );
    const { blockers } = runPreflight(makeModules("claude", "cursor"), tmpDir);
    expect(blockers.some((f) => f.id.includes("hooks-config-overwrite-risk"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// process.env snapshot and restore around each test
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// dedupeById — intra-phase dedup unit tests
// ---------------------------------------------------------------------------

describe("dedupeById", () => {
  it("keeps first occurrence when duplicate ids are present", () => {
    const findings: PreflightFinding[] = [
      { id: "foo", severity: "advisory", detect: "first", action: "a1" },
      { id: "bar", severity: "advisory", detect: "bar-detect", action: "a2" },
      { id: "foo", severity: "advisory", detect: "second", action: "a3" },
    ];
    const result = dedupeById(findings);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("foo");
    expect(result[0]!.detect).toBe("first");
    expect(result[1]!.id).toBe("bar");
  });

  it("returns all entries unchanged when all ids are unique", () => {
    const findings: PreflightFinding[] = [
      { id: "a", severity: "advisory", detect: "d1", action: "x" },
      { id: "b", severity: "blocker", detect: "d2", action: "y" },
    ];
    expect(dedupeById(findings)).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(dedupeById([])).toHaveLength(0);
  });

  it("keeps a single entry unchanged", () => {
    const findings: PreflightFinding[] = [
      { id: "only", severity: "advisory", detect: "d", action: "a" },
    ];
    expect(dedupeById(findings)).toHaveLength(1);
  });
});
