// bkit-release-workflow.test.ts — Structural assertions for .github/workflows/release.yml
// (BAR-138: GH Packages distribution pipeline validation).
//
// No YAML parser available in devDependencies — uses string-based structural
// assertions on the raw YAML file content. Each assertion maps to a specific
// design requirement from bar-138-plan-1.md § Architecture & Component Changes.

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";

const WORKFLOW_PATH = path.resolve(".github/workflows/release.yml");

describe("release.yml structural assertions (BAR-138)", () => {
  let content: string;
  let lines: string[];

  content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
  lines = content.split("\n");

  // ---------------------------------------------------------------------------
  // Trigger
  // ---------------------------------------------------------------------------

  it("file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("triggers on push tags matching v*", () => {
    expect(content).toContain("push:");
    expect(content).toContain("tags:");
    expect(content).toContain("'v*'");
  });

  // ---------------------------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------------------------

  it("permissions.packages is write", () => {
    expect(content).toContain("packages: write");
  });

  it("permissions.contents is write (sliding v{N} tag step pushes back to origin)", () => {
    // v1.0.3+: contents was upgraded from read → write so the "Update sliding
    // major-version tag" step can `git push origin v{N} --force` using the
    // default GITHUB_TOKEN. See docs/deployments.md § "Sliding major-version tag".
    expect(content).toContain("contents: write");
  });

  // ---------------------------------------------------------------------------
  // Sliding major-version tag step (v1.0.3+)
  // ---------------------------------------------------------------------------

  it("sliding major-version tag step is present", () => {
    expect(content).toContain("Update sliding major-version tag");
  });

  it("sliding tag step skips prereleases (tags containing '-')", () => {
    // Prerelease tags like v1.0.3-rc.1 must not advance the v{N} sliding tag.
    expect(content).toMatch(/!contains\(github\.ref_name,\s*'-'\)/);
  });

  it("sliding tag step extracts major from ref_name (no hard-coded major)", () => {
    // Future-proofs for v2 / v3 — major is parsed from the tag, not hard-coded.
    expect(content).toContain("sed -E 's/^v([0-9]+)\\..*/\\1/'");
  });

  it("sliding tag step force-pushes the major-version tag to origin", () => {
    expect(content).toContain('git push origin "$MAJOR" --force');
  });

  it("sliding tag step appears after npm publish (failed publish must not advance the sliding tag)", () => {
    // Anchor on `- name:` so we match the step declaration, not the prose
    // reference in the `permissions:` comment block above.
    const publishIdx = lineIndex("- name: Publish to GitHub Packages");
    const slidingIdx = lineIndex("- name: Update sliding major-version tag");
    expect(publishIdx).toBeGreaterThan(-1);
    expect(slidingIdx).toBeGreaterThan(-1);
    expect(slidingIdx).toBeGreaterThan(publishIdx);
  });

  // ---------------------------------------------------------------------------
  // setup-node step
  // ---------------------------------------------------------------------------

  it("setup-node step uses node-version 20", () => {
    expect(content).toContain("node-version: 20");
  });

  it("setup-node step sets registry-url to https://npm.pkg.github.com", () => {
    expect(content).toContain("registry-url: https://npm.pkg.github.com");
  });

  it("setup-node step sets scope to @cbartens", () => {
    expect(content).toContain("scope: '@cbartens'");
  });

  it("uses actions/setup-node pinned to a SHA (supply-chain hardening)", () => {
    // SHA-pinned ref — matches `actions/setup-node@<40-char-hex>` with version comment.
    expect(content).toMatch(/actions\/setup-node@[0-9a-f]{40}/);
  });

  // ---------------------------------------------------------------------------
  // pnpm setup
  // ---------------------------------------------------------------------------

  it("uses pnpm/action-setup pinned to a SHA (supply-chain hardening)", () => {
    // SHA-pinned ref — matches `pnpm/action-setup@<40-char-hex>` with version comment.
    expect(content).toMatch(/pnpm\/action-setup@[0-9a-f]{40}/);
  });

  // ---------------------------------------------------------------------------
  // Full check suite — steps must appear in order
  // ---------------------------------------------------------------------------

  function lineIndex(substr: string): number {
    return lines.findIndex((l) => l.includes(substr));
  }

  it("pnpm typecheck step present", () => {
    expect(content).toContain("pnpm typecheck");
  });

  it("pnpm test step present", () => {
    expect(content).toContain("pnpm test");
  });

  it("pnpm format:check step present", () => {
    expect(content).toContain("pnpm format:check");
  });

  it("pnpm lint:prose step present", () => {
    expect(content).toContain("pnpm lint:prose");
  });

  it("pnpm lint:slop step present", () => {
    expect(content).toContain("pnpm lint:slop");
  });

  it("pnpm check:dist step present", () => {
    expect(content).toContain("pnpm check:dist");
  });

  it("check suite steps appear in order: typecheck → test → format:check → lint:prose → lint:slop → check:dist", () => {
    const typecheckIdx = lineIndex("pnpm typecheck");
    const testIdx = lineIndex("pnpm test");
    const formatIdx = lineIndex("pnpm format:check");
    const proseIdx = lineIndex("pnpm lint:prose");
    const slopIdx = lineIndex("pnpm lint:slop");
    const distIdx = lineIndex("pnpm check:dist");

    expect(typecheckIdx).toBeGreaterThan(-1);
    expect(testIdx).toBeGreaterThan(typecheckIdx);
    expect(formatIdx).toBeGreaterThan(testIdx);
    expect(proseIdx).toBeGreaterThan(formatIdx);
    expect(slopIdx).toBeGreaterThan(proseIdx);
    expect(distIdx).toBeGreaterThan(slopIdx);
  });

  // ---------------------------------------------------------------------------
  // Publish step
  // ---------------------------------------------------------------------------

  it("npm publish step is present (not pnpm publish)", () => {
    expect(content).toContain("npm publish");
    expect(content).not.toContain("pnpm publish");
  });

  it("npm publish step env has NODE_AUTH_TOKEN referencing GITHUB_TOKEN", () => {
    expect(content).toContain("NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}");
  });

  it("npm publish step appears after pnpm check:dist", () => {
    const distIdx = lineIndex("pnpm check:dist");
    const publishIdx = lineIndex("npm publish");
    expect(publishIdx).toBeGreaterThan(distIdx);
  });

  // ---------------------------------------------------------------------------
  // Concurrency guard (BAR-138 challenge remediation — Finding 1)
  // ---------------------------------------------------------------------------

  it("has a top-level concurrency block (prevents duplicate publish races)", () => {
    expect(content).toContain("concurrency:");
  });

  it("concurrency group references github.ref", () => {
    expect(content).toMatch(/group:\s+release-\$\{\{[^}]*github\.ref[^}]*\}\}/);
  });

  it("concurrency cancel-in-progress is false (in-flight publish must not be killed)", () => {
    expect(content).toContain("cancel-in-progress: false");
  });

  // ---------------------------------------------------------------------------
  // SHA-pinned actions (BAR-138 challenge remediation — Finding 2)
  // ---------------------------------------------------------------------------

  it("uses actions/checkout pinned to a SHA (supply-chain hardening)", () => {
    expect(content).toMatch(/actions\/checkout@[0-9a-f]{40}/);
  });
});

// ---------------------------------------------------------------------------
// Tarball exclusions — package.json `files` array uses negation patterns
// (BAR-138 challenge remediation — Finding 3, hardened in pre.3 after the
// initial .npmignore approach turned out to be a no-op when `files` is set:
// npm explicitly states `.npmignore` cannot exclude paths that `files`
// includes, so negation patterns inside `files` are the only mechanism that
// actually works.)
// ---------------------------------------------------------------------------

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
