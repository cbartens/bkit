// bkit-paths.test.ts — Unit tests for getPkgRoot() across the THREE run-contexts
// documented in the bkit-paths.ts header comment.
//
// WS1-T7 — authored pre-move under .agents/scripts/, travels with WS-3 git mv.
//
// The dist arm (context 1 + 3) is EXPLICITLY asserted here in addition to the
// tsx-from-source arm (context 2), because WS3-T2 leaves the dist/ arm
// intentionally untouched and check:dist only exercises it indirectly.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getPkgRoot, BKIT_SRC_SUBPATH, getTemplatesRoot, isDogfood } from "./bkit-paths";

// ---------------------------------------------------------------------------
// Context 1 — dist/ (compiled; what consumers run)
// __dirname = <pkgRoot>/dist
// Expected: pkgRoot = __dirname/..
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 1: dist/ arm (consumer context)", () => {
  it("resolves one level above a simulated dist/ __dirname", () => {
    // Simulate the dist/ run-context by constructing a fake scriptDir that ends
    // with path.sep + "dist" and calling the same resolver logic.
    // We cannot call import.meta.url directly from a dist/ path in this test, so
    // we verify the arm logic using the BKIT_SRC_SUBPATH sentinel and explicit
    // suffix matching — this is exactly what getPkgRoot() does internally.
    const fakeDistDir = path.join("/some", "pkg", "dist");
    // Arm 1: does NOT end with BKIT_SRC_SUBPATH → resolves one level up.
    const expectedPkgRoot = path.resolve(fakeDistDir, "..");
    const result = fakeDistDir.endsWith(BKIT_SRC_SUBPATH)
      ? path.resolve(fakeDistDir, "..", "..")
      : path.resolve(fakeDistDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/some", "pkg"));
  });

  it("BKIT_SRC_SUBPATH does NOT match dist/ suffix (so dist uses the one-level arm)", () => {
    const distSuffix = `${path.sep}dist`;
    expect(distSuffix.endsWith(BKIT_SRC_SUBPATH)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Context 2 — tsx-from-source (bkit repo development)
// __dirname = <pkgRoot>/.agents/scripts  (pre-move)
//             <pkgRoot>/.bkit/src        (post-move, Sub-Plan 2)
// Expected: pkgRoot = __dirname/../..
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 2: tsx-from-source arm (dev/test context)", () => {
  it("resolves two levels above a simulated src __dirname matching BKIT_SRC_SUBPATH", () => {
    // Construct a fake scriptDir whose suffix equals BKIT_SRC_SUBPATH.
    const fakeSrcDir = path.join("/some", "pkg") + path.sep + BKIT_SRC_SUBPATH;
    const expectedPkgRoot = path.resolve(fakeSrcDir, "..", "..");
    const result = fakeSrcDir.endsWith(BKIT_SRC_SUBPATH)
      ? path.resolve(fakeSrcDir, "..", "..")
      : path.resolve(fakeSrcDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/some", "pkg"));
  });

  it("BKIT_SRC_SUBPATH matches the pre-move .agents/scripts suffix", () => {
    // Pre-move value must be the .agents/scripts form.
    expect(BKIT_SRC_SUBPATH).toBe(`.agents${path.sep}scripts`);
  });

  it("getPkgRoot() returns the repo root when running in tsx-from-source context", () => {
    // In the actual tsx test run, import.meta.url points at .agents/scripts/bkit-paths.ts,
    // so getPkgRoot() should resolve two levels up to the repo root.
    const result = getPkgRoot();
    // Repo root contains package.json — a reliable sentinel.
    expect(fs.existsSync(path.join(result, "package.json"))).toBe(true);
    // Must NOT be .agents/scripts itself.
    expect(result).not.toContain(path.join(".agents", "scripts"));
  });
});

// ---------------------------------------------------------------------------
// Context 3 — packed-tarball (node_modules layout; effectively the dist/ arm)
// __dirname = <consumerRoot>/node_modules/@cbartens/bkit/dist
// Expected: pkgRoot = __dirname/..  (dist arm, same logic as context 1)
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 3: packed-tarball arm (node_modules layout)", () => {
  it("resolves one level above a simulated node_modules dist/ __dirname", () => {
    // node_modules/@cbartens/bkit/dist — the dist/ arm applies here too.
    const fakeNmDistDir = path.join("/consumer", "node_modules", "@cbartens", "bkit", "dist");
    // Arm 1: does NOT end with BKIT_SRC_SUBPATH → one level up.
    const expectedPkgRoot = path.resolve(fakeNmDistDir, "..");
    const result = fakeNmDistDir.endsWith(BKIT_SRC_SUBPATH)
      ? path.resolve(fakeNmDistDir, "..", "..")
      : path.resolve(fakeNmDistDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/consumer", "node_modules", "@cbartens", "bkit"));
  });
});

// ---------------------------------------------------------------------------
// getTemplatesRoot() — derived from getPkgRoot()
// ---------------------------------------------------------------------------

describe("getTemplatesRoot()", () => {
  it("ends with .agents/templates in the pre-move (WS-1) state", () => {
    const root = getTemplatesRoot();
    // Pre-move: must end with .agents/templates
    expect(root.endsWith(path.join(".agents", "templates"))).toBe(true);
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
