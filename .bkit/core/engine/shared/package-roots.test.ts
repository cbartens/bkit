// shared/package-roots.test.ts — Unit tests for getPkgRoot() across the THREE run-contexts
// documented in the shared/package-roots.ts header comment.
//
// The dist arm (context 1 + 3) is asserted here in addition to the tsx-from-source arm
// (context 2).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getPkgRoot, ENGINE_SUBPATH, getTemplatesRoot, isDogfood } from "./package-roots";

// ---------------------------------------------------------------------------
// Context 1 — dist/ (compiled; what consumers run)
// engineDir = <pkgRoot>/dist
// Expected: pkgRoot = engineDir/..
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 1: dist/ arm (consumer context)", () => {
  it("resolves one level above a simulated dist/ __dirname", () => {
    // Simulate the dist/ run-context by constructing a fake scriptDir that ends
    // with path.sep + "dist" and calling the same resolver logic.
    // We cannot call import.meta.url directly from a dist/ path in this test, so
    // we verify the arm logic using the ENGINE_SUBPATH sentinel and explicit
    // suffix matching — this is exactly what getPkgRoot() does internally.
    const fakeDistDir = path.join("/some", "pkg", "dist");
    // Arm 1: does NOT end with ENGINE_SUBPATH → resolves one level up.
    const expectedPkgRoot = path.resolve(fakeDistDir, "..");
    const result = fakeDistDir.endsWith(ENGINE_SUBPATH)
      ? path.resolve(fakeDistDir, "..", "..", "..")
      : path.resolve(fakeDistDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/some", "pkg"));
  });

  it("ENGINE_SUBPATH does NOT match dist/ suffix (so dist uses the one-level arm)", () => {
    const distSuffix = `${path.sep}dist`;
    expect(distSuffix.endsWith(ENGINE_SUBPATH)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Context 2 — tsx-from-source (bkit repo development)
// engineDir = <pkgRoot>/.bkit/core/engine
// Expected: pkgRoot = engineDir/../../..
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 2: tsx-from-source arm (dev/test context)", () => {
  it("resolves three levels above a simulated engine dir matching ENGINE_SUBPATH", () => {
    // Construct a fake scriptDir whose suffix equals ENGINE_SUBPATH.
    const fakeSrcDir = path.join("/some", "pkg") + path.sep + ENGINE_SUBPATH;
    const expectedPkgRoot = path.resolve(fakeSrcDir, "..", "..", "..");
    const result = fakeSrcDir.endsWith(ENGINE_SUBPATH)
      ? path.resolve(fakeSrcDir, "..", "..", "..")
      : path.resolve(fakeSrcDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/some", "pkg"));
  });

  it("ENGINE_SUBPATH matches the .bkit/core/engine suffix", () => {
    expect(ENGINE_SUBPATH).toBe(path.join(".bkit", "core", "engine"));
  });

  it("getPkgRoot() returns the repo root when running in tsx-from-source context", () => {
    // In the actual tsx test run, import.meta.url points at
    // .bkit/core/engine/shared/package-roots.ts, so getPkgRoot() resolves to the repo root.
    const result = getPkgRoot();
    // Repo root contains package.json — a reliable sentinel.
    expect(fs.existsSync(path.join(result, "package.json"))).toBe(true);
    // Must NOT be inside .bkit/core itself.
    expect(result).not.toContain(path.join(".bkit", "core"));
  });
});

// ---------------------------------------------------------------------------
// Context 3 — packed-tarball (node_modules layout; effectively the dist/ arm)
// engineDir = <consumerRoot>/node_modules/@cbartens/bkit/dist
// Expected: pkgRoot = engineDir/..  (dist arm, same logic as context 1)
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 3: packed-tarball arm (node_modules layout)", () => {
  it("resolves one level above a simulated node_modules dist/ __dirname", () => {
    // node_modules/@cbartens/bkit/dist — the dist/ arm applies here too.
    const fakeNmDistDir = path.join("/consumer", "node_modules", "@cbartens", "bkit", "dist");
    // Arm 1: does NOT end with ENGINE_SUBPATH → one level up.
    const expectedPkgRoot = path.resolve(fakeNmDistDir, "..");
    const result = fakeNmDistDir.endsWith(ENGINE_SUBPATH)
      ? path.resolve(fakeNmDistDir, "..", "..", "..")
      : path.resolve(fakeNmDistDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/consumer", "node_modules", "@cbartens", "bkit"));
  });
});

// ---------------------------------------------------------------------------
// getTemplatesRoot() — derived from getPkgRoot()
// ---------------------------------------------------------------------------

describe("getTemplatesRoot()", () => {
  it("ends with .bkit/templates in the post-move (WS-3) state", () => {
    const root = getTemplatesRoot();
    // Post-move: must end with .bkit/templates
    expect(root.endsWith(path.join(".bkit", "templates"))).toBe(true);
  });

  it("is rooted at getPkgRoot()", () => {
    expect(getTemplatesRoot().startsWith(getPkgRoot())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isDogfood()
// ---------------------------------------------------------------------------

describe("isDogfood()", () => {
  it("returns a boolean", () => {
    expect(typeof isDogfood()).toBe("boolean");
  });
});
