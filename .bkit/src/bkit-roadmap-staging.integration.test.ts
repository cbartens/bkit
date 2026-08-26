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
    const foldPattern = /bkit_roadmap_fold\s+"[^"]+"\s+"\$TRACKER_ROWS"/g;
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

describe("row 20: tracker enrichment is an invocable orchestrator step, gated wired-only via the real #202 resolver (#380)", () => {
  // Validate through the REAL bkit-trackers.ts resolver (the mechanism `bkit
  // install` uses to render host mirrors) rather than string-presence on the
  // raw source — GAP-2: a comment asserting "tracker enrichment" as prose was
  // previously enough to pass; this must fail unless a real, invocable
  // `list_issues` call exists inside a `github`/`linear` marker pair AND is
  // mechanically stripped when the tracker resolves to `none`.
  for (const [name, content] of [
    ["design", DESIGN],
    ["plan", PLAN],
    ["build", BUILD],
    ["debug", DEBUG],
    // ship joined the loop once its close grew a fold (#380 blocking gap 1).
    // It is the close where dropping enrichment hurts most: the fold is a FULL
    // regenerate, so a ship without it blanks every tracker-only FID from the
    // board at exactly the moment a human reads it for "what next".
    ["ship", SHIP],
  ] as const) {
    it(`${name}: github/linear resolution each carry an invocable list_issues call feeding a fold input path, never gh/search_issues`, () => {
      const github = substituteWorkflow(content, "github");
      const linear = substituteWorkflow(content, "linear");
      expect(github.orphans, `${name} github resolution left orphan tracker markers`).toEqual([]);
      expect(linear.orphans, `${name} linear resolution left orphan tracker markers`).toEqual([]);

      expect(github.output, `${name}/github must invoke mcp__github__list_issues`).toMatch(
        /mcp__github__list_issues\(/,
      );
      expect(linear.output, `${name}/linear must invoke mcp__linear__list_issues`).toMatch(
        /mcp__linear__list_issues\(/,
      );
      // NEVER gh/search_issues for the tracker enrichment read.
      expect(github.output, `${name}/github must not use search_issues for enrichment`).not.toMatch(
        /list_issues[\s\S]{0,400}search_issues/,
      );

      // The resolved output must feed a concrete fold input path — not just
      // name the concept. TRACKER_ROWS must both be assigned from a stable
      // absolute path AND threaded as bkit_roadmap_fold's 2nd argument.
      for (const resolved of [github.output, linear.output]) {
        expect(resolved, `${name} resolved output missing TRACKER_ROWS assignment`).toMatch(
          /TRACKER_ROWS="[^"]*\.bkit\/\.roadmap-tracker-rows-\{FID\}\.json"/,
        );
        expect(
          resolved,
          `${name} resolved output must pass TRACKER_ROWS into bkit_roadmap_fold`,
        ).toMatch(/bkit_roadmap_fold\s+"[^"]+"\s+"\$TRACKER_ROWS"/);
      }
    });

    it(`${name}: under tracker "none" the list_issues call is mechanically ABSENT while the fold call still runs (fail-open no-op)`, () => {
      const none = substituteWorkflow(content, "none");
      expect(none.orphans, `${name} none resolution left orphan tracker markers`).toEqual([]);
      expect(none.output, `${name}/none must NOT invoke any list_issues call`).not.toMatch(
        /list_issues\(/,
      );
      // The fold still runs (TRACKER_ROWS points at a file that was never
      // written, so bkit_roadmap_fold's own fail-open handles the absent-file
      // case — this is what makes enrichment "additive, never a precondition").
      expect(none.output, `${name}/none must still invoke bkit_roadmap_fold`).toMatch(
        /bkit_roadmap_fold\s+"[^"]+"\s+"\$TRACKER_ROWS"/,
      );
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

describe("row 11 extension: ship Step 10 launches THREE subagents, including @bkit-roadmap-refresh (#380 Sub-plan 2 Task 9)", () => {
  const step10Start = SHIP.indexOf("## 🧠 Step 10 — Update Docs & Summary");
  const step10End = SHIP.indexOf("## 🤖 Step 11 — Prune Skills");
  const step10 = SHIP.slice(step10Start, step10End);

  it("Step 10 exists and precedes Step 11", () => {
    expect(step10Start).toBeGreaterThan(-1);
    expect(step10End).toBeGreaterThan(step10Start);
  });

  it("names all three subagents in the launch list", () => {
    expect(step10).toContain("Invoke `@bkit-ship-update-docs`");
    expect(step10).toContain("Invoke `@bkit-ship-summary`");
    expect(step10).toContain("Invoke `@bkit-roadmap-refresh`");
    expect(step10).toMatch(/Launch three subagents in parallel/);
  });

  it("the roadmap-refresh.md artifact is named in the wait/assert list and Gate 10 checklist", () => {
    expect(step10).toMatch(/roadmap-refresh\.md/);
    const gateStart = step10.indexOf("### 🔒 Gate 10");
    expect(gateStart).toBeGreaterThan(-1);
    const gate = step10.slice(gateStart);
    expect(gate).toContain("roadmap-refresh.md");
    expect(gate).toContain("@bkit-roadmap-refresh");
  });

  it("the roadmap-cadence/reverse-sync/drift-check block precedes the subagent launch (so a fired cadence can be folded into the analysis pass)", () => {
    const cadenceIdx = step10.indexOf("Roadmap cadence + reverse tracker sync + drift check");
    const launchIdx = step10.indexOf("Launch three subagents in parallel");
    expect(cadenceIdx).toBeGreaterThan(-1);
    expect(launchIdx).toBeGreaterThan(cadenceIdx);
  });

  it("Step 10 introduces NO new git add/commit of docs/ — staging stays the single Step 13 BOOK_PATHS commit (design Addendum 4 § T)", () => {
    expect(step10).not.toMatch(/git\s+(-C\s+\S+\s+)?add\s+.*docs\//);
    expect(step10).not.toMatch(/git\s+(-C\s+\S+\s+)?commit\b/);
  });

  it("ROADMAP_VERDICT is read but never gates the route — the analysis tier is additive best-effort", () => {
    expect(step10).toMatch(/ROADMAP_VERDICT.*NEVER a gating input/);
  });
});

describe("bkit-ship-invariants + bkit check stay green after the Step 10 rewrite", () => {
  it("Gate 10 still requires both pre-existing verdicts plus the new one", () => {
    const gateStart = SHIP.indexOf("### 🔒 Gate 10");
    const gateEnd = SHIP.indexOf("bkit:tracker true start", gateStart);
    const gate = SHIP.slice(gateStart, gateEnd);
    expect(gate).toMatch(/DOCS_VERDICT.*PASS\|FAIL/);
    expect(gate).toMatch(/SUMMARY_VERDICT.*PASS\|CONCERNS\|FAIL/);
    expect(gate).toMatch(/ROADMAP_VERDICT.*PASS\|CONCERNS\|FAIL/);
  });
});
