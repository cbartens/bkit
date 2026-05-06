// release-workflow.test.ts — Structural assertions for .github/workflows/release.yml
// (BAR-138: GH Packages distribution pipeline validation).
//
// No YAML parser available in devDependencies — uses string-based structural
// assertions on the raw YAML file content. Each assertion maps to a specific
// design requirement from bar-138-plan-1.md § Architecture & Component Changes.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

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

  it("permissions.contents is read", () => {
    expect(content).toContain("contents: read");
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
// .npmignore — test-file exclusion from published tarball
// (BAR-138 challenge remediation — Finding 3)
// ---------------------------------------------------------------------------

describe(".npmignore tarball exclusions (BAR-138)", () => {
  const NPMIGNORE_PATH = path.resolve(".npmignore");

  it(".npmignore file exists", () => {
    expect(fs.existsSync(NPMIGNORE_PATH)).toBe(true);
  });

  it(".npmignore excludes .agents/scripts/*.ts (test sources + compiled TS)", () => {
    const content = fs.readFileSync(NPMIGNORE_PATH, "utf-8");
    expect(content).toContain(".agents/scripts/*.ts");
  });

  it(".npmignore excludes .agents/scripts/__snapshots__/ (vitest snapshot files)", () => {
    const content = fs.readFileSync(NPMIGNORE_PATH, "utf-8");
    expect(content).toContain(".agents/scripts/__snapshots__/");
  });
});
