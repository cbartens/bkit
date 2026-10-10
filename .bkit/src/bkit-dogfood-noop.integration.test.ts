// bkit-dogfood-noop.integration.test.ts — Asserts that running bkit install
// inside the bkit repo itself (dogfood context) writes nothing to .agents/.
//
// Run context: tsx-from-source (.agents/scripts/ pre-move, .bkit/src/ post-move).
// This test is authored here pre-move and travels with the WS-3 git mv.
//
// WS1-T6 — dogfood-noop integration test (Sub-Plan 1).

import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPkgRoot, isDogfood } from "./bkit-paths";
import { runPayload } from "./bkit-install";
import { applyTokens } from "./bkit-tokens";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
});

afterEach(() => {
  process.chdir(originalCwd);
});

// ---------------------------------------------------------------------------
// Dogfood detection
// ---------------------------------------------------------------------------

describe("isDogfood() — in-repo detection", () => {
  it("returns true when CWD equals the package root (tsx-from-source context)", () => {
    // In the tsx-from-source run context, getPkgRoot() resolves to the repo root.
    // Change CWD to the repo root so isDogfood() returns true.
    const pkgRoot = getPkgRoot();
    process.chdir(pkgRoot);
    expect(isDogfood()).toBe(true);
  });

  it("returns false when CWD is a different directory", () => {
    // Change CWD to a parent of pkgRoot — guaranteed to be different.
    const pkgRoot = getPkgRoot();
    const parent = path.dirname(pkgRoot);
    process.chdir(parent);
    expect(isDogfood()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Dogfood zero-write assertion
// ---------------------------------------------------------------------------

describe("runPayload() — zero writes when isDogfood() (in-repo install)", () => {
  it("writes nothing when running inside the bkit repo (src === dst paths resolve equal)", () => {
    // Set CWD to the bkit package root — the dogfood scenario.
    const pkgRoot = getPkgRoot();
    process.chdir(pkgRoot);

    // Snapshot .agents/ modification times before the run.
    const agentsDir = path.join(pkgRoot, ".agents");
    const before = snapshotMtimes(agentsDir);

    // Run the payload pass in dry-run=false mode — dogfood src===dst guard must
    // short-circuit all writes so the filesystem is unchanged.
    const result = runPayload(false);

    const after = snapshotMtimes(agentsDir);

    expect(result.deletes).toBe(0);
    expect(after).toStrictEqual(before);
  });

  it("reports zero deletes in dry-run mode when running inside the bkit repo", () => {
    const pkgRoot = getPkgRoot();
    process.chdir(pkgRoot);
    const result = runPayload(true);
    expect(result.deletes).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Dogfood byte-identity — `.bkit/scripts`
// ---------------------------------------------------------------------------
//
// `.bkit/scripts` is excluded from the npm `files` list — consumers receive
// scripts from `.bkit/templates/.bkit/scripts/`; the root copy is the dogfood
// mirror, so every shipped script must equal its template as install renders it.

describe("dogfood byte-identity — .bkit/scripts", () => {
  const pkgRoot = getPkgRoot();
  const shipped = fs.readdirSync(path.join(pkgRoot, ".bkit/templates/.bkit/scripts")).sort();

  it("ships at least one script", () => {
    expect(shipped.length).toBeGreaterThan(0);
  });

  it.each(shipped)("%s: root copy === rendered template copy", (name) => {
    const root = path.join(pkgRoot, ".bkit/scripts", name);
    const tmpl = path.join(pkgRoot, ".bkit/templates/.bkit/scripts", name);
    expect(fs.existsSync(root)).toBe(true);
    const tokens = { DEFAULT_BRANCH: "", PROJECT_NAME: "", REPO_SLUG: "" };
    expect(fs.readFileSync(root, "utf-8")).toBe(
      applyTokens(fs.readFileSync(tmpl, "utf-8"), tokens),
    );
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Walk a directory recursively and return a map of relative-path → mtime (ms).
 * Used to assert no files are modified by a call under test.
 */
function snapshotMtimes(dir: string): Map<string, number> {
  const result = new Map<string, number>();
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(dir, abs);
    if (entry.isFile()) {
      result.set(rel, fs.statSync(abs).mtimeMs);
    } else if (entry.isDirectory()) {
      for (const [subRel, mtime] of snapshotMtimes(abs)) {
        result.set(path.join(rel, subRel), mtime);
      }
    }
  }
  return result;
}
