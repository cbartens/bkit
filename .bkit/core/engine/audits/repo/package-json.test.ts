// audits/repo/package-json.test.ts — bkit's own package.json manifest invariants (BAR-138: GH Packages
// distribution).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Task C0 — package.json manifest field invariants
// ---------------------------------------------------------------------------

describe("package.json manifest invariants (BAR-138)", () => {
  const pkgPath = path.resolve("package.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pkg: Record<string, any>;

  pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  it("private is false (package must be publishable)", () => {
    expect(pkg.private).toBe(false);
  });

  it("publishConfig.registry equals https://npm.pkg.github.com", () => {
    expect(pkg.publishConfig?.registry).toBe("https://npm.pkg.github.com");
  });

  it("publishConfig.access equals restricted", () => {
    expect(pkg.publishConfig?.access).toBe("restricted");
  });

  it("repository.url is bare HTTPS (no git+ prefix)", () => {
    expect(pkg.repository?.url).toBe("https://github.com/cbartens/bkit.git");
    expect(pkg.repository?.url).not.toMatch(/^git\+/);
  });

  it("description does not claim a private git dependency", () => {
    expect(pkg.description).toBeTruthy();
    expect(pkg.description).not.toContain("git dependency from a private GitHub repo");
  });

  // Tarball exclusions — `files` is the only mechanism that actually filters
  // test sources out of the published tarball when an allowlist is set
  // (npm ignores .npmignore for paths included by `files`). Each negation
  // pattern below is the load-bearing exclusion rule.
  it("files array contains a NEGATION (!) for *.test.ts (not a re-inclusion)", () => {
    const filesArray: string[] = pkg.files ?? [];
    const positivePatterns = filesArray.filter(
      (f: string) => f.includes(".test.ts") && !f.startsWith("!"),
    );
    expect(positivePatterns).toHaveLength(0);
    expect(filesArray.some((f: string) => f.startsWith("!") && f.includes(".test.ts"))).toBe(true);
  });

  it("files array contains a NEGATION (!) for __snapshots__ (not a re-inclusion)", () => {
    const filesArray: string[] = pkg.files ?? [];
    const positivePatterns = filesArray.filter(
      (f: string) => f.includes("__snapshots__") && !f.startsWith("!"),
    );
    expect(positivePatterns).toHaveLength(0);
    expect(filesArray.some((f: string) => f.startsWith("!") && f.includes("__snapshots__"))).toBe(
      true,
    );
  });
});
