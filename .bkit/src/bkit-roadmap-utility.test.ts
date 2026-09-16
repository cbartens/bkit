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
    const cadenceBlock = ROADMAP_UTILITY.split("bkit-roadmap-cadence.sh")[1] ?? "";
    expect(cadenceBlock).toMatch(/\[bkit-roadmap\]/);
  });
});

// The cadence evaluator used to run at every ship close, feeding an opus
// analysis pass nobody asked for. It now lives here, on the one command that
// actually runs that analysis.
describe("/bkit-roadmap owns the audit-injection cadence (moved off the ship close)", () => {
  it("sources bkit-roadmap-cadence.sh and invokes bkit_roadmap_cadence_eval with the manifest thresholds", () => {
    expect(ROADMAP_UTILITY).toMatch(
      /\.\s+"\$REPO_ROOT\/\.bkit\/scripts\/bkit-roadmap-cadence\.sh"/,
    );
    expect(ROADMAP_UTILITY).toMatch(
      /bkit_roadmap_cadence_eval\s+"\$ROADMAP_JSONL"\s+"\$STATS_JSONL"\s+"\$BUILD_CYCLES"\s+"\$STALENESS_DAYS"/,
    );
    expect(ROADMAP_UTILITY).toMatch(/\.bkit\.roadmap\.buildCycles \/\/ 10/);
    expect(ROADMAP_UTILITY).toMatch(/\.bkit\.roadmap\.stalenessDays \/\/ 90/);
  });

  it('writes the ROADMAP_CADENCE_FIRE counter row under workflow "roadmap"', () => {
    expect(ROADMAP_UTILITY).toMatch(/counterName = "ROADMAP_CADENCE_FIRE"/);
    expect(ROADMAP_UTILITY).toMatch(/\.step = "roadmap-cadence"/);
    expect(ROADMAP_UTILITY).toMatch(/\.workflow = "roadmap"/);
  });

  // The cadence candidate list is passed inline in the subagent's Context, not
  // through a scratch file: only docs/roadmap.md, docs/roadmap.jsonl and
  // docs/tracker.jsonl outlive a run.
  it("carries the cadence injection inline into both subagents, writing no scratch file", () => {
    const cadenceIdx = ROADMAP_UTILITY.indexOf("bkit_roadmap_cadence_eval");
    const shortlistIdx = ROADMAP_UTILITY.indexOf("Invoke `@bkit-roadmap-shortlist`");
    const refreshIdx = ROADMAP_UTILITY.indexOf("Invoke `@bkit-roadmap-refresh`");
    expect(cadenceIdx).toBeGreaterThan(-1);
    expect(shortlistIdx).toBeGreaterThan(cadenceIdx);
    expect(refreshIdx).toBeGreaterThan(shortlistIdx);
    expect(ROADMAP_UTILITY).toContain("{CADENCE_TEXT}");
    expect(ROADMAP_UTILITY).not.toContain(".roadmap-cadence-inject.md");
    expect(ROADMAP_UTILITY).not.toContain(".roadmap-refresh-on-demand.md");
  });

  it("only the two durable ledgers and the tracker snapshot are gitignored/persisted", () => {
    for (const f of [".gitignore", ".bkit/templates/gitignore"]) {
      expect(read(f)).toContain("docs/tracker.jsonl");
      expect(read(f)).toContain(".bkit/.roadmap-shortlist.json");
      expect(read(f)).not.toContain(".roadmap-cadence-inject.md");
      expect(read(f)).not.toContain(".roadmap-tracker-rows-");
      expect(read(f)).not.toContain(".roadmap-reverse-sync-");
    }
  });

  // The shortlist scratch is the only per-run file, and Step 8 deletes it.
  it("deletes the shortlist scratch at the end of the run", () => {
    expect(ROADMAP_UTILITY).toMatch(/rm -f "\$REPO_ROOT\/\.bkit\/\.roadmap-shortlist\.json"/);
  });

  // Two calls on github (issues + project fields), one on linear. The read is
  // deliberately unfiltered by label: an unlabelled backlog issue must appear.
  it("syncs the tracker with an unfiltered read and no comments", () => {
    expect(ROADMAP_UTILITY).toContain("mcp__github__list_issues");
    expect(ROADMAP_UTILITY).toContain("mcp__github__projects_list");
    expect(ROADMAP_UTILITY).toContain("mcp__linear__list_issues");
    expect(ROADMAP_UTILITY).toMatch(/state: "OPEN"/);
    expect(ROADMAP_UTILITY).not.toMatch(/labels: "bkit:/);
    expect(ROADMAP_UTILITY).toMatch(/NEVER comments/i);
  });
});
