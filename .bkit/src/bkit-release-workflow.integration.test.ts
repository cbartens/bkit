// bkit-release-workflow.integration.test.ts — real `npm pack` tarball-manifest
// inspection (BAR-138 challenge remediation — Finding 3).
//
// Tarball exclusions — package.json `files` array uses negation patterns, hardened
// in pre.3 after the initial .npmignore approach turned out to be a no-op when
// `files` is set: npm explicitly states `.npmignore` cannot exclude paths that
// `files` includes, so negation patterns inside `files` are the only mechanism
// that actually works.

import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";

describe("published tarball excludes test sources (BAR-138, real `npm pack` inspection)", () => {
  // Run a dry-run pack and inspect the actual file manifest. This is the only
  // test that catches the npm quirk where .npmignore is silently ignored when
  // a `files` array is set in package.json — i.e., asserting on
  // package.json#files shape alone is insufficient (the actual tarball might
  // still ship excluded paths).
  const repoRoot = path.resolve(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
  );

  let manifestFiles: string[];

  beforeAll(() => {
    const out = execFileSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const parsed = JSON.parse(out) as Array<{ files: Array<{ path: string }> }>;
    manifestFiles = parsed[0].files.map((f) => f.path);
  });

  it("tarball ships zero *.test.ts files", () => {
    const offenders = manifestFiles.filter((p) => p.endsWith(".test.ts"));
    expect(offenders).toEqual([]);
  });

  it("tarball ships zero *.integration.test.ts files", () => {
    const offenders = manifestFiles.filter((p) => p.endsWith(".integration.test.ts"));
    expect(offenders).toEqual([]);
  });

  it("tarball ships zero files under __snapshots__/", () => {
    const offenders = manifestFiles.filter((p) => p.includes("__snapshots__/"));
    expect(offenders).toEqual([]);
  });

  it("tarball still contains the load-bearing payload (dist/, README.md, .bkit/templates/)", () => {
    expect(manifestFiles.some((p) => p === "dist/bkit-install.js")).toBe(true);
    expect(manifestFiles.some((p) => p === "README.md")).toBe(true);
    expect(manifestFiles.some((p) => p === ".bkit/templates/.github/workflows/ci.yml")).toBe(true);
    expect(manifestFiles.some((p) => p === ".bkit/templates/.github/renovate.json5")).toBe(true);
  });
});
