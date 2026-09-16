/**
 * bkit-roadmap-staging.integration.test.ts — #380 Sub-plan 1 Tasks 6/7,
 * matrix rows 11 + 20.
 *
 * Boundary: real workflow source files (structural assertions on shipped
 * prose/shell — the four workflow orchestrators are markdown, not directly
 * executable in a unit test; asserting their literal content is the
 * established pattern in this repo, see bkit-ship-invariants.test.ts).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { substituteWorkflow } from "./bkit-trackers.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

const DESIGN = read(".bkit/workflows/bkit-design.md");
const PLAN = read(".bkit/workflows/bkit-plan.md");
const BUILD = read(".bkit/workflows/bkit-build.md");
const DEBUG = read(".bkit/workflows/bkit-debug.md");
const SHIP = read(".bkit/workflows/bkit-ship.md");

describe("row 11: STRAY allowlist widened in design/plan; build/debug/ship existing paths (#380)", () => {
  it("design + plan STRAY allowlists include both docs/roadmap.md and docs/roadmap.jsonl", () => {
    for (const [name, content] of [
      ["design", DESIGN],
      ["plan", PLAN],
    ] as const) {
      const strayLines = content
        .split("\n")
        .filter((l) => l.includes("grep -vE") && l.includes("STRAY="));
      expect(strayLines.length, `${name}: expected >=2 STRAY grep lines`).toBeGreaterThanOrEqual(2);
      for (const line of strayLines) {
        // dev generalised the jsonl half of this allowlist to `docs/<name>.jsonl`
        // + `.bkit/<name>.jsonl` globs, which already cover docs/roadmap.jsonl;
        // docs/roadmap.md is a .md so no jsonl glob reaches it and it stays
        // named explicitly. Intent is unchanged: BOTH roadmap paths pass.
        expect(line, `${name}: STRAY line does not permit docs/roadmap.md: ${line}`).toContain(
          "^docs/roadmap\\.md$",
        );
        expect(line, `${name}: STRAY line does not permit docs/roadmap.jsonl: ${line}`).toContain(
          "^docs/[^/]+\\.jsonl$",
        );
      }
    }
  });

  it("build/debug append docs/roadmap.jsonl via the existing git add -A (no allowlist widen needed)", () => {
    for (const [name, content] of [
      ["build", BUILD],
      ["debug", DEBUG],
    ] as const) {
      expect(content, `${name} missing docs/roadmap.jsonl append`).toContain(
        '>> "$WT/docs/roadmap.jsonl"',
      );
      expect(content, `${name} missing git add -A close-workflow commit`).toMatch(
        /git add -A && git commit/,
      );
    }
  });

  it("ship stages docs/roadmap.jsonl + docs/roadmap.md via bkit-book-commit.sh core sweep", () => {
    // dev (#446) deleted every `BOOK_PATHS=` assignment from the workflows and
    // routed bookkeeping through bkit-book-commit.sh, whose pathspec list is
    // the single place staging scope is now declared. Assert ship still calls
    // it, and that its core scope reaches BOTH roadmap paths — docs/*.jsonl
    // covers docs/roadmap.jsonl, and docs/roadmap.md is named explicitly.
    expect(SHIP).toContain("bkit-book-commit.sh");
    expect(SHIP, "BOOK_PATHS must not return to bkit-ship.md").not.toMatch(/BOOK_PATHS=/);
    const script = read(".bkit/scripts/bkit-book-commit.sh");
    const coreBlock = script.slice(
      script.indexOf("PATHSPECS=("),
      script.indexOf('if [ "$SCOPE" = "full" ]'),
    );
    expect(coreBlock, "core sweep lost docs/roadmap.md").toContain('"docs/roadmap.md"');
    expect(coreBlock, "core sweep lost the docs/*.jsonl glob").toContain('"docs/*.jsonl"');
  });

  it("design + plan append the phase's ledger row BEFORE regenerating (matrix row 11, part 1 — order, not just presence)", () => {
    // GAP-6: a prior round only asserted both the append call and the fold
    // call are PRESENT somewhere in the file; a swapped order (regenerate
    // from a stale ledger, then append the new row afterwards) would still
    // pass a presence-only check. Assert each append's byte offset precedes
    // its corresponding fold call's offset, for BOTH the dev-path and
    // PR-path occurrence (2 sites per file).
    const appendPattern =
      /\[bkit-roadmap\] append failed: (?:\$ROADMAP_JSONL|docs\/roadmap\.jsonl)"/g;
    const foldPattern = /bkit_roadmap_fold\s+"[^"]+"/g;
    for (const [name, content] of [
      ["design", DESIGN],
      ["plan", PLAN],
    ] as const) {
      const appendIndices = [...content.matchAll(appendPattern)].map((m) => m.index!);
      const foldIndices = [...content.matchAll(foldPattern)].map((m) => m.index!);
      expect(appendIndices.length, `${name}: expected 2 ledger-append sites`).toBe(2);
      expect(foldIndices.length, `${name}: expected 2 fold-call sites`).toBe(2);
      for (let i = 0; i < appendIndices.length; i++) {
        expect(
          foldIndices[i],
          `${name} site ${i}: fold call must come AFTER the ledger append, not before`,
        ).toBeGreaterThan(appendIndices[i]);
      }
    }
  });

  it("design + plan PR path pushes the close commits BEFORE gh pr create/merge reads the remote", () => {
    // The PR path (RUNTIME_DEVPUSHES != true) commits the roadmap row locally
    // and then hands off to `gh pr create` / `gh pr merge`, which act on the
    // REMOTE. Without a push in between, neither the roadmap commit nor the
    // preceding close-workflow commit is in the PR, and the board silently
    // loses every design/plan close on this path. Order matters, not presence:
    // a push placed after `gh pr merge` would still satisfy a presence check.
    for (const [name, content] of [
      ["design", DESIGN],
      ["plan", PLAN],
    ] as const) {
      const roadmapCommit = content.indexOf(`docs({FID}): ${name} roadmap update bkit [skip ci]`);
      expect(roadmapCommit, `${name}: PR-path roadmap commit not found`).toBeGreaterThan(-1);

      const pushIdx = content.indexOf('git push --force-with-lease origin "$B"', roadmapCommit);
      expect(pushIdx, `${name}: PR path never pushes after the roadmap commit`).toBeGreaterThan(-1);

      const prCreate = content.indexOf("gh pr create --base dev --head", roadmapCommit);
      expect(prCreate, `${name}: PR-path gh pr create not found`).toBeGreaterThan(-1);
      expect(
        pushIdx,
        `${name}: the close-commit push must precede gh pr create, or the PR omits it`,
      ).toBeLessThan(prCreate);

      // The push is guarded by a non-empty branch assertion (workflow git rule).
      const guard = content.indexOf("detached HEAD — refusing to push", roadmapCommit);
      expect(guard, `${name}: push lacks the non-empty branch assertion`).toBeGreaterThan(-1);
      expect(guard).toBeLessThan(pushIdx);

      // ...and it runs AFTER the STRAY guard, so nothing unvetted is published.
      const stray = content.indexOf("close-workflow diff carries non-doc files", roadmapCommit);
      expect(stray, `${name}: PR-path STRAY guard not found`).toBeGreaterThan(-1);
      expect(stray, `${name}: push must run after the STRAY guard`).toBeLessThan(pushIdx);
    }
  });

  it("build/debug carry the dev-lock ledger append (4th distinct staging shape)", () => {
    for (const [name, content] of [
      ["build", BUILD],
      ["debug", DEBUG],
    ] as const) {
      expect(content, `${name} missing dev-lock roadmap mirror`).toContain(
        "dev-side roadmap mirror",
      );
      expect(content, `${name} missing DEVLOCK acquisition`).toMatch(
        /DEVLOCK="\$REPO_ROOT\/\.bkit\/\.dev\.lock"/,
      );
    }
  });
});

// A close re-renders the status block straight from docs/roadmap.jsonl. It can,
// because tracker rows live in their own marker block, so the block holds
// nothing the ledger does not — there is no on-disk state left to preserve and
// therefore nothing to parse back. A close still never reads the tracker.
describe("phase close re-renders the status block from the ledger — never reads the tracker", () => {
  for (const [name, content] of [
    ["design", DESIGN],
    ["plan", PLAN],
    ["build", BUILD],
    ["debug", DEBUG],
    ["ship", SHIP],
  ] as const) {
    it(`${name}: close folds from the ledger and issues no tracker read`, () => {
      const github = substituteWorkflow(content, "github");
      const linear = substituteWorkflow(content, "linear");
      const none = substituteWorkflow(content, "none");
      expect(github.orphans, `${name} github resolution left orphan tracker markers`).toEqual([]);
      expect(linear.orphans, `${name} linear resolution left orphan tracker markers`).toEqual([]);
      expect(none.orphans, `${name} none resolution left orphan tracker markers`).toEqual([]);

      for (const resolved of [github.output, linear.output, none.output]) {
        expect(resolved, `${name} close must fold the status block`).toMatch(
          /bkit_roadmap_fold\s+"[^"]+"/,
        );
        expect(resolved, `${name} bkit_roadmap_upsert no longer exists`).not.toContain(
          "bkit_roadmap_upsert",
        );
        expect(resolved, `${name} close must not thread tracker rows into the fold`).not.toContain(
          "TRACKER_ROWS",
        );
        expect(resolved, `${name} close must not write tracker-rows scratch`).not.toMatch(
          /roadmap-tracker-rows/,
        );
        expect(resolved, `${name} close must not run tracker enrichment`).not.toContain(
          "Tracker enrichment",
        );
        // Only /bkit-roadmap re-fetches the tracker, so only it stamps that
        // block as fresh; a close carries the previous stamp forward.
        expect(resolved, `${name} close must not stamp the tracker block fresh`).not.toContain(
          "BKIT_ROADMAP_TRACKER_REFRESHED",
        );
        // Reverse label sync writes labels on OTHER issues — /bkit-roadmap only.
        expect(resolved, `${name} close must not reverse-sync labels`).not.toContain(
          "reverse-sync",
        );
      }
    });
  }
});

describe("close-hook ledger rows use the correct phase status per workflow", () => {
  it.each([
    ["design", DESIGN, "DESIGNED"],
    ["plan", PLAN, "PLANNED"],
    ["build", BUILD, "BUILT"],
    ["debug", DEBUG, "DEBUGGED"],
  ] as const)("%s close appends status=%s", (_name, content, status) => {
    expect(content).toContain(`.status="${status}"`);
  });
});

describe("row 11 extension: ship Step 10 is MECHANICAL-TIER ONLY — two subagents, no analysis leaf", () => {
  const step10Start = SHIP.indexOf("## 🧠 Step 10 — Update Docs & Summary");
  const step10End = SHIP.indexOf("## 🤖 Step 11 — Prune Skills");
  const step10 = SHIP.slice(step10Start, step10End);

  it("Step 10 exists and precedes Step 11", () => {
    expect(step10Start).toBeGreaterThan(-1);
    expect(step10End).toBeGreaterThan(step10Start);
  });

  it("names both subagents in the launch list", () => {
    expect(step10).toContain("Invoke `@bkit-ship-update-docs`");
    expect(step10).toContain("Invoke `@bkit-ship-summary`");
    expect(step10).toMatch(/Launch two subagents in parallel/);
  });

  // The whole point of the ship/roadmap split: an opus analysis pass on every
  // ship close is the cost this removes. A reintroduced `@bkit-roadmap-refresh`
  // invocation anywhere in bkit-ship.md fails here, not in review.
  it("bkit-ship.md never invokes @bkit-roadmap-refresh and never names its artifacts", () => {
    expect(SHIP).not.toContain("@bkit-roadmap-refresh");
    expect(SHIP).not.toContain("roadmap-refresh.md");
    expect(SHIP).not.toContain("ROADMAP_VERDICT");
    expect(SHIP).not.toContain("ROADMAP_SCAN_COVERAGE");
    expect(SHIP).not.toContain("ship-roadmap-refresh");
  });

  it("the cadence evaluator is NOT run at ship close — it belongs to /bkit-roadmap", () => {
    expect(SHIP).not.toContain("bkit_roadmap_cadence_eval");
    expect(SHIP).not.toContain("ROADMAP_CADENCE_FIRE");
    expect(SHIP).not.toContain("roadmap-cadence-inject");
  });

  it("the mechanical tier survives: drift check precedes the launch, the fold follows it", () => {
    const driftIdx = step10.indexOf("Drift check");
    const launchIdx = step10.indexOf("Launch two subagents in parallel");
    const foldIdx = step10.indexOf("bkit_roadmap_fold");
    expect(driftIdx).toBeGreaterThan(-1);
    expect(launchIdx).toBeGreaterThan(driftIdx);
    // Load-bearing: the fold must read the SHIPPED row @bkit-ship-update-docs
    // writes, so it runs after the subagents, never beside them.
    expect(foldIdx).toBeGreaterThan(launchIdx);
  });

  it("Step 10 introduces NO new git add/commit of docs/ — staging stays the single Step 13 BOOK_PATHS commit (design Addendum 4 § T)", () => {
    expect(step10).not.toMatch(/git\s+(-C\s+\S+\s+)?add\s+.*docs\//);
    expect(step10).not.toMatch(/git\s+(-C\s+\S+\s+)?commit\b/);
  });
});

describe("bkit-ship-invariants + bkit check stay green after the Step 10 rewrite", () => {
  it("Gate 10 still requires both pre-existing verdicts", () => {
    const gateStart = SHIP.indexOf("### 🔒 Gate 10");
    const gateEnd = SHIP.indexOf("bkit:tracker true start", gateStart);
    const gate = SHIP.slice(gateStart, gateEnd);
    expect(gate).toMatch(/DOCS_VERDICT.*PASS\|FAIL/);
    expect(gate).toMatch(/SUMMARY_VERDICT.*PASS\|CONCERNS\|FAIL/);
  });
});
