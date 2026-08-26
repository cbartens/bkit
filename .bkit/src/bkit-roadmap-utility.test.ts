/**
 * bkit-roadmap-utility.test.ts — #380 Sub-plan 3 Task 13, matrix row 17.
 *
 * Boundary: real workflow source file (structural assertions on shipped
 * prose/shell — `/bkit-roadmap` is markdown, not directly executable in a
 * unit test; asserting its literal content is the established pattern in
 * this repo, see bkit-roadmap-staging.integration.test.ts /
 * bkit-ship-invariants.test.ts).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

const ROADMAP_UTILITY = read(".bkit/workflows/bkit-roadmap.md");

describe("row 17: /bkit-roadmap utility sources the fold + drift check + invokes @bkit-roadmap-refresh (#380)", () => {
  it("frontmatter registers a utility command", () => {
    expect(ROADMAP_UTILITY).toMatch(/^---\ndescription:/);
    expect(ROADMAP_UTILITY).toMatch(/\/bkit-roadmap/);
  });

  it("sources bkit-roadmap-fold.sh and invokes bkit_roadmap_fold (mechanical fold reused, not re-inlined)", () => {
    expect(ROADMAP_UTILITY).toMatch(/\.\s+"\$REPO_ROOT\/\.bkit\/scripts\/bkit-roadmap-fold\.sh"/);
    expect(ROADMAP_UTILITY).toMatch(/bkit_roadmap_fold\s+"\$REPO_ROOT"/);
  });

  it("sources bkit-roadmap-reconcile.sh and invokes bkit_roadmap_drift_check (drift check reused, never mutates the board)", () => {
    expect(ROADMAP_UTILITY).toMatch(
      /\.\s+"\$REPO_ROOT\/\.bkit\/scripts\/bkit-roadmap-reconcile\.sh"/,
    );
    expect(ROADMAP_UTILITY).toMatch(/bkit_roadmap_drift_check\s+"\$REPO_ROOT"/);
  });

  it("invokes @bkit-roadmap-refresh as a subagent, never inlining the analysis leaf", () => {
    expect(ROADMAP_UTILITY).toMatch(/Invoke `@bkit-roadmap-refresh`/);
    expect(ROADMAP_UTILITY).toMatch(/roadmap-analysis` marker block only/);
  });

  it("is fail-open: every sourced script has a [bkit-roadmap] fallback line, never a hard exit", () => {
    const foldBlock = ROADMAP_UTILITY.split("bkit-roadmap-fold.sh")[1] ?? "";
    expect(foldBlock).toMatch(/\[bkit-roadmap\]/);
    const reconcileBlock = ROADMAP_UTILITY.split("bkit-roadmap-reconcile.sh")[1] ?? "";
    expect(reconcileBlock).toMatch(/\[bkit-roadmap\]/);
  });
});
