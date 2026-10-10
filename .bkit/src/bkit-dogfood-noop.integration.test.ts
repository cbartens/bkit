// bkit-dogfood-noop.integration.test.ts — dogfood detection inside the bkit repo
// itself, and byte-identity of the repo's own `.bkit/scripts` with their templates.

import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPkgRoot, isDogfood } from "./bkit-paths";
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
