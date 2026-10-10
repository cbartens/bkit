// checks/status-holes.test.ts — Tier-3 advisory status-hole detector tests.
//
// Validates the detector's core contract:
//   1. Source derivation: expected set parsed from bkit-ship.md (headings +
//      the step keys its `bkit steps done --step=` calls write), cross-checked
//      against the frozen canonical set — NEVER a parallel table.
//   2. Path-conditional classification: Path A (skip conflict-resolve),
//      Path B (include conflict-resolve), MERGED-on-entry (skip middle),
//      Aborted (workflow-failed), In-progress.
//   3. Hole detection: missing mandatory steps surface; invented names
//      (ship-resume-human-override) surface as unexpected; retry-loop steps
//      (failure-diagnose/remediate) are never holes.
//   4. Advisory / fail-open: CLI exits 0 on a known-holey fixture.
//   5. Aborted runs: pre-abort holes detected, post-abort absences ignored.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
  SHIP_STEP_ORDER,
  auditStatusJsonl,
  checkSourceCanonicalDrift,
  classifyRun,
  computeMandatoryForPath,
  deriveExpectedStepSetFromSource,
  detectHoles,
  formatAdvisoryReport,
  main,
} from "./status-holes";

// __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const SHIP_MD_PATH = path.join(REPO_ROOT, ".bkit/workflows/bkit-ship.md");
const shipMd = fs.readFileSync(SHIP_MD_PATH, "utf-8");

// ---------------------------------------------------------------------------
// Helpers — build synthetic status.jsonl fixtures
// ---------------------------------------------------------------------------

function row(step: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: "step-done",
    workflow: "ship",
    step,
    status: "DONE",
    at: "2026-07-29T00:00:00Z",
    parentSha: "abc123",
    ...extra,
  });
}

function workflowFailedRow(): string {
  return JSON.stringify({
    type: "workflow-failed",
    workflow: "ship",
    at: "2026-07-29T00:00:00Z",
  });
}

/** Build a complete Path A status.jsonl (no conflict-resolve, no retry steps). */
function pathAStatus(): string {
  return [
    row("ship-start-workflow"),
    row("ship-worktree-setup"),
    row("ship-regression-guard"),
    // Step 3 (Base Check) writes no step-done row — it's a router
    // Step 4 (Integrate) skipped — Path A
    row("ship-deferred-sweep"),
    row("ship-update-docs"),
    row("ship-summary"),
    row("ship-prune-skills"),
    row("ship-bookkeeping-push"),
    row("ship-merge-pr", { verdict: "PASS", attempt: 1, failures: 0 }),
    row("ship-switch-to-dev"),
    row("ship-worktree-cleanup"),
    row("ship-close-workflow"),
  ].join("\n");
}

/** Build a complete Path B status.jsonl (includes conflict-resolve). */
function pathBStatus(): string {
  return [
    row("ship-start-workflow"),
    row("ship-worktree-setup"),
    row("ship-regression-guard"),
    row("ship-conflict-resolve", { verdict: "PASS" }),
    row("ship-deferred-sweep"),
    row("ship-update-docs"),
    row("ship-summary"),
    row("ship-prune-skills"),
    row("ship-bookkeeping-push"),
    row("ship-merge-pr", { verdict: "PASS", attempt: 1, failures: 0 }),
    row("ship-switch-to-dev"),
    row("ship-worktree-cleanup"),
    row("ship-close-workflow"),
  ].join("\n");
}

/** Build a MERGED-on-entry status.jsonl (Step 2 detects MERGED → Step 13). */
function mergedOnEntryStatus(): string {
  return [
    row("ship-start-workflow"),
    // Step 2 routes to Step 13 at sub-step 5 (`state` = MERGED) — BEFORE sub-step
    // 8 writes ship-worktree-setup + ship-regression-guard, so neither appears.
    // The explicit marker identifies this path.
    JSON.stringify({ type: "ship-merged-on-entry", workflow: "ship", at: "2026-07-29T00:00:00Z" }),
    // Steps 3–12 skipped entirely — PR was already merged
    row("ship-switch-to-dev"),
    row("ship-worktree-cleanup"),
    row("ship-close-workflow"),
  ].join("\n");
}

/** Build a retry-loop Path B status (merge failed, diagnosed, remediated, retried). */
function retryLoopPathBStatus(): string {
  return [
    row("ship-start-workflow"),
    row("ship-worktree-setup"),
    row("ship-regression-guard"),
    row("ship-conflict-resolve", { verdict: "PASS" }),
    row("ship-deferred-sweep"),
    row("ship-update-docs"),
    row("ship-summary"),
    row("ship-prune-skills"),
    row("ship-bookkeeping-push"),
    row("ship-merge-pr", { verdict: "FAIL", attempt: 1, failures: 1 }),
    row("ship-failure-diagnose", { verdict: "PASS", attempt: 1 }),
    row("ship-failure-remediate", { verdict: "PASS", attempt: 1, strategy: "STANDARD" }),
    row("ship-merge-pr", { verdict: "PASS", attempt: 2, failures: 0 }),
    row("ship-switch-to-dev"),
    row("ship-worktree-cleanup"),
    row("ship-close-workflow"),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// 1. Source derivation — the expected set comes from the markdown, not a table
// ---------------------------------------------------------------------------

describe("source derivation", () => {
  it("derives the expected step set from bkit-ship.md headings + literals", () => {
    const { steps, headingSteps, literalSteps } = deriveExpectedStepSetFromSource(shipMd);
    expect(steps.length).toBeGreaterThan(0);
    expect(headingSteps.length).toBeGreaterThan(0);
    expect(literalSteps.length).toBeGreaterThan(0);
  });

  it("source-derived set AGREES with the frozen canonical set (no drift)", () => {
    const { steps } = deriveExpectedStepSetFromSource(shipMd);
    const drift = checkSourceCanonicalDrift(steps);
    expect(drift).toEqual([]);
  });

  it("detects drift when a canonical key is missing from source", () => {
    const fakeSource = ["ship-start-workflow", "ship-worktree-setup", "ship-invented-step"];
    const drift = checkSourceCanonicalDrift(fakeSource);
    // Should report every canonical key missing + the invented key
    expect(drift.length).toBeGreaterThan(0);
    expect(drift).toContain("source-but-not-canonical:ship-invented-step");
    expect(drift.some((d) => d.startsWith("canonical-but-not-source:"))).toBe(true);
  });

  it("parses a synthetic md with headings + literals", () => {
    const fakeMd = [
      "## Step 1 — Start",
      "```bash",
      '  step:"ship-start-workflow"',
      "```",
      "## Step 2 — Setup",
      "```bash",
      '  step:"ship-worktree-setup"',
      "```",
    ].join("\n");
    const { steps, headingSteps, literalSteps } = deriveExpectedStepSetFromSource(fakeMd);
    expect(steps).toContain("ship-start-workflow");
    expect(steps).toContain("ship-worktree-setup");
    expect(headingSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
    expect(literalSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
  });

  it("parses `bkit steps done --step=` calls, the shape the workflows write rows with", () => {
    const fakeMd = [
      "## Step 1 — Start",
      "```bash",
      '   "$BKIT" steps done --workflow=ship --step=ship-start-workflow --file="$STATUS" --commit=none',
      "```",
      "## Step 2 — Setup",
      "```bash",
      '   "$BKIT" steps done --workflow=ship --step=ship-worktree-setup --file="$STATUS"',
      "```",
    ].join("\n");
    const { headingSteps, literalSteps } = deriveExpectedStepSetFromSource(fakeMd);
    expect(headingSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
    expect(literalSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
  });

  it("flags a status write that lives outside any numbered step (orphanSteps)", () => {
    // headingSteps is a SUBSET of literalSteps by construction (both scan the
    // same regex; the heading pass only narrows the line range), so comparing
    // them for mutual disagreement is a tautology. The one direction that
    // carries signal is a literal recorded outside every `## … Step N` section:
    // a step the workflow writes but never numbers, so no gate covers it.
    const fakeMd = [
      "## Step 1 — Start",
      "```bash",
      '  step:"ship-start-workflow"',
      "```",
      "## Appendix — not a numbered step",
      "```bash",
      '  step:"ship-orphaned-write"',
      "```",
    ].join("\n");
    const { headingSteps, literalSteps, orphanSteps } = deriveExpectedStepSetFromSource(fakeMd);
    expect(headingSteps).toEqual(["ship-start-workflow"]);
    expect(literalSteps).toEqual(["ship-orphaned-write", "ship-start-workflow"]);
    expect(orphanSteps).toEqual(["ship-orphaned-write"]);
  });

  it("the live bkit-ship.md records no step outside a numbered section", () => {
    const { orphanSteps } = deriveExpectedStepSetFromSource(shipMd);
    expect(orphanSteps).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Run classification
// ---------------------------------------------------------------------------

describe("classifyRun", () => {
  it("classifies a clean Path A run (no conflict-resolve)", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
      "ship-deferred-sweep",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-merge-pr",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    expect(classifyRun(observed, false)).toBe("PATH_A");
  });

  it("classifies a Path B run (conflict-resolve present)", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
      "ship-conflict-resolve",
      "ship-deferred-sweep",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-merge-pr",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    expect(classifyRun(observed, false)).toBe("PATH_B");
  });

  it("classifies a MERGED-on-entry run (Step 2 routed to Step 13 before its writes)", () => {
    // bkit-ship.md Step 2 routes on `state` = MERGED at sub-step 5, BEFORE
    // sub-step 8 writes ship-worktree-setup + ship-regression-guard — so a real
    // MERGED-on-entry resume carries neither.
    const observed = new Set([
      "ship-start-workflow",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    expect(classifyRun(observed, false)).toBe("MERGED_ON_ENTRY");
  });

  it("does NOT read a double hole as MERGED_ON_ENTRY (regression)", () => {
    // A Path A run that dropped BOTH ship-merge-pr and ship-deferred-sweep stays Path A
    // and reports both holes.
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    expect(classifyRun(observed, false)).toBe("PATH_A");

    const universe = [...SHIP_STEP_ORDER];
    const { missing } = detectHoles(observed, universe, "PATH_A");
    expect(missing).toContain("ship-merge-pr");
    expect(missing).toContain("ship-deferred-sweep");
  });

  it("classifies an aborted run (workflow-failed, no close-workflow)", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
    ]);
    expect(classifyRun(observed, true)).toBe("ABORTED");
  });

  it("classifies an in-progress run (no close-workflow, no workflow-failed)", () => {
    const observed = new Set(["ship-start-workflow", "ship-worktree-setup"]);
    expect(classifyRun(observed, false)).toBe("IN_PROGRESS");
  });
});

// ---------------------------------------------------------------------------
// 3. Path-conditional mandatory sets
// ---------------------------------------------------------------------------

describe("computeMandatoryForPath", () => {
  const universe = [...SHIP_STEP_ORDER];

  it("Path A excludes conflict-resolve + retry-loop steps", () => {
    const mandatory = computeMandatoryForPath("PATH_A", universe);
    expect(mandatory.has("ship-conflict-resolve")).toBe(false);
    expect(mandatory.has("ship-failure-diagnose")).toBe(false);
    expect(mandatory.has("ship-failure-remediate")).toBe(false);
    expect(mandatory.has("ship-merge-pr")).toBe(true);
    expect(mandatory.has("ship-close-workflow")).toBe(true);
  });

  it("Path B includes conflict-resolve, excludes retry-loop steps", () => {
    const mandatory = computeMandatoryForPath("PATH_B", universe);
    expect(mandatory.has("ship-conflict-resolve")).toBe(true);
    expect(mandatory.has("ship-failure-diagnose")).toBe(false);
    expect(mandatory.has("ship-failure-remediate")).toBe(false);
  });

  it("MERGED-on-entry excludes the entire middle", () => {
    const mandatory = computeMandatoryForPath("MERGED_ON_ENTRY", universe);
    expect(mandatory.has("ship-conflict-resolve")).toBe(false);
    expect(mandatory.has("ship-deferred-sweep")).toBe(false);
    expect(mandatory.has("ship-merge-pr")).toBe(false);
    expect(mandatory.has("ship-switch-to-dev")).toBe(true);
    expect(mandatory.has("ship-close-workflow")).toBe(true);
  });

  it("ABORTED returns empty mandatory set", () => {
    const mandatory = computeMandatoryForPath("ABORTED", universe);
    expect(mandatory.size).toBe(0);
  });

  it("IN_PROGRESS returns empty mandatory set", () => {
    const mandatory = computeMandatoryForPath("IN_PROGRESS", universe);
    expect(mandatory.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Hole detection — missing mandatory + unexpected invented
// ---------------------------------------------------------------------------

describe("detectHoles", () => {
  const universe = [...SHIP_STEP_ORDER];

  it("reports no holes for a clean Path A run", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
      "ship-deferred-sweep",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-merge-pr",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    const { missing, unexpected } = detectHoles(observed, universe, "PATH_A");
    expect(missing).toEqual([]);
    expect(unexpected).toEqual([]);
  });

  it("reports ship-regression-guard as missing when skipped in a completed Path A run", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      // ship-regression-guard SKIPPED — this is a real hole
      "ship-deferred-sweep",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-merge-pr",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    const { missing, unexpected } = detectHoles(observed, universe, "PATH_A");
    expect(missing).toContain("ship-regression-guard");
    expect(unexpected).toEqual([]);
  });

  it("reports conflict-resolve as missing when skipped in a completed Path B run", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
      // ship-conflict-resolve SKIPPED but merge-pr is present → classified PATH_B
      "ship-deferred-sweep",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-merge-pr",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    // This set has merge-pr + no conflict-resolve → PATH_A classification.
    // But if we force PATH_B, conflict-resolve is mandatory.
    const { missing } = detectHoles(observed, universe, "PATH_B");
    expect(missing).toContain("ship-conflict-resolve");
  });

  it("surfaces invented step names as unexpected (ship-resume-human-override)", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
      "ship-deferred-sweep",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-merge-pr",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
      "ship-resume-human-override", // invented name — not in canonical set
    ]);
    const { missing, unexpected } = detectHoles(observed, universe, "PATH_A");
    expect(missing).toEqual([]);
    expect(unexpected).toContain("ship-resume-human-override");
  });

  it("does NOT flag absence of failure-diagnose/remediate (retry-loop steps)", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      "ship-regression-guard",
      "ship-deferred-sweep",
      "ship-update-docs",
      "ship-summary",
      "ship-prune-skills",
      "ship-bookkeeping-push",
      "ship-merge-pr",
      "ship-switch-to-dev",
      "ship-worktree-cleanup",
      "ship-close-workflow",
    ]);
    const { missing } = detectHoles(observed, universe, "PATH_A");
    expect(missing).not.toContain("ship-failure-diagnose");
    expect(missing).not.toContain("ship-failure-remediate");
  });

  it("aborted run: flags pre-abort holes but not post-abort absences", () => {
    const observed = new Set([
      "ship-start-workflow",
      "ship-worktree-setup",
      // ship-regression-guard SKIPPED — this is a hole before the abort
      "ship-deferred-sweep",
      // Run aborted here — merge-pr and everything after is NOT a hole
    ]);
    const { missing } = detectHoles(observed, universe, "ABORTED");
    expect(missing).toContain("ship-regression-guard"); // pre-abort hole
    expect(missing).not.toContain("ship-merge-pr"); // post-abort — not a hole
    expect(missing).not.toContain("ship-close-workflow"); // post-abort — not a hole
  });

  it("in-progress run: no holes reported", () => {
    const observed = new Set(["ship-start-workflow", "ship-worktree-setup"]);
    const { missing, unexpected } = detectHoles(observed, universe, "IN_PROGRESS");
    expect(missing).toEqual([]);
    expect(unexpected).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5. Full audit — end-to-end with synthetic status.jsonl + real bkit-ship.md
// ---------------------------------------------------------------------------

describe("auditStatusJsonl (end-to-end)", () => {
  it("Path A: no holes against real bkit-ship.md", () => {
    const report = auditStatusJsonl(pathAStatus(), shipMd);
    expect(report.path).toBe("PATH_A");
    expect(report.missing).toEqual([]);
    expect(report.unexpected).toEqual([]);
    expect(report.sourceCanonicalDrift).toEqual([]);
  });

  it("Path B: no holes against real bkit-ship.md", () => {
    const report = auditStatusJsonl(pathBStatus(), shipMd);
    expect(report.path).toBe("PATH_B");
    expect(report.missing).toEqual([]);
    expect(report.unexpected).toEqual([]);
  });

  it("MERGED-on-entry: no holes against real bkit-ship.md", () => {
    const report = auditStatusJsonl(mergedOnEntryStatus(), shipMd);
    expect(report.path).toBe("MERGED_ON_ENTRY");
    expect(report.missing).toEqual([]);
    expect(report.unexpected).toEqual([]);
  });

  it("retry-loop Path B: no holes (failure steps optional)", () => {
    const report = auditStatusJsonl(retryLoopPathBStatus(), shipMd);
    expect(report.path).toBe("PATH_B");
    expect(report.missing).toEqual([]);
    expect(report.unexpected).toEqual([]);
  });

  it("holey fixture: ship-regression-guard missing surfaces in advisory report", () => {
    const holey = [
      row("ship-start-workflow"),
      row("ship-worktree-setup"),
      // ship-regression-guard SKIPPED
      row("ship-deferred-sweep"),
      row("ship-merge-pr", { verdict: "PASS" }),
      row("ship-switch-to-dev"),
      row("ship-update-docs"),
      row("ship-summary"),
      row("ship-prune-skills"),
      row("ship-worktree-cleanup"),
      row("ship-close-workflow"),
    ].join("\n");
    const report = auditStatusJsonl(holey, shipMd);
    expect(report.path).toBe("PATH_A");
    expect(report.missing).toContain("ship-regression-guard");
    const formatted = formatAdvisoryReport(report);
    expect(formatted).toContain("ADVISORY");
    expect(formatted).toContain("ship-regression-guard");
  });

  it("invented name (ship-resume-human-override) surfaces as unexpected", () => {
    const withInvented = pathAStatus() + "\n" + row("ship-resume-human-override");
    const report = auditStatusJsonl(withInvented, shipMd);
    expect(report.unexpected).toContain("ship-resume-human-override");
  });

  it("aborted run with pre-abort hole detected", () => {
    const aborted = [
      row("ship-start-workflow"),
      row("ship-worktree-setup"),
      // ship-regression-guard SKIPPED — hole before abort
      row("ship-deferred-sweep"),
      workflowFailedRow(),
    ].join("\n");
    const report = auditStatusJsonl(aborted, shipMd);
    expect(report.path).toBe("ABORTED");
    expect(report.missing).toContain("ship-regression-guard");
  });

  it("empty status.jsonl → IN_PROGRESS, no holes, no crash", () => {
    const report = auditStatusJsonl("", shipMd);
    expect(report.path).toBe("IN_PROGRESS");
    expect(report.missing).toEqual([]);
    expect(report.unexpected).toEqual([]);
  });

  it("unparseable lines skipped without crash", () => {
    const junk = [
      "not json at all",
      row("ship-start-workflow"),
      "{ broken json",
      row("ship-close-workflow"),
    ].join("\n");
    const report = auditStatusJsonl(junk, shipMd);
    // start-workflow + close-workflow, no merge-pr → MERGED_ON_ENTRY
    expect(report.observed).toContain("ship-start-workflow");
    expect(report.observed).toContain("ship-close-workflow");
  });
});

// ---------------------------------------------------------------------------
// 6. Advisory report format
// ---------------------------------------------------------------------------

describe("formatAdvisoryReport", () => {
  it("includes ADVISORY prefix + fail-open note", () => {
    const report = auditStatusJsonl(pathAStatus(), shipMd);
    const formatted = formatAdvisoryReport(report);
    expect(formatted).toContain("ADVISORY");
    expect(formatted).toContain("fail-open");
  });

  it("includes path classification in output", () => {
    const report = auditStatusJsonl(pathBStatus(), shipMd);
    const formatted = formatAdvisoryReport(report);
    expect(formatted).toContain("PATH_B");
  });
});

// ---------------------------------------------------------------------------
// 7. CLI main() — advisory / fail-open (Done-when: exits 0 on holey fixture)
// ---------------------------------------------------------------------------

describe("CLI main() — advisory exit 0", () => {
  it("exits 0 with advisory output on a known-holey fixture (no throw)", () => {
    // Build a holey status.jsonl in a temp file
    const tmpFile = path.join(
      fs.mkdtempSync(path.join(require("node:os").tmpdir(), "bkit-shd-")),
      "status.jsonl",
    );
    const holey = [
      row("ship-start-workflow"),
      row("ship-worktree-setup"),
      // ship-regression-guard SKIPPED — hole
      row("ship-deferred-sweep"),
      row("ship-merge-pr", { verdict: "PASS" }),
      row("ship-switch-to-dev"),
      row("ship-update-docs"),
      row("ship-summary"),
      row("ship-prune-skills"),
      row("ship-worktree-cleanup"),
      row("ship-close-workflow"),
    ].join("\n");
    fs.writeFileSync(tmpFile, holey, "utf-8");

    // Capture stdout — main() must NOT throw and must write advisory output
    const originalWrite = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: unknown) => {
      captured += String(chunk);
      return true;
    }) as typeof process.stdout.write;
    try {
      // main() never throws (fail-open) — if it did, the test fails
      main(["node", "checks/status-holes.ts", tmpFile]);
    } finally {
      process.stdout.write = originalWrite;
    }
    // Verify advisory output appeared
    expect(captured).toContain("ADVISORY");
    expect(captured).toContain("ship-regression-guard"); // the hole surfaced
    // No explicit exit code assertion — main() returning = exit 0 (no process.exit)
  });

  it("main() with no args writes skip message and returns (exit 0)", () => {
    const originalWrite = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: unknown) => {
      captured += String(chunk);
      return true;
    }) as typeof process.stdout.write;
    try {
      main(["node", "checks/status-holes.ts"]);
    } finally {
      process.stdout.write = originalWrite;
    }
    expect(captured).toContain("skipping");
  });

  it("main() with missing file writes skip message and returns (exit 0)", () => {
    const originalWrite = process.stdout.write.bind(process.stdout);
    let captured = "";
    process.stdout.write = ((chunk: unknown) => {
      captured += String(chunk);
      return true;
    }) as typeof process.stdout.write;
    try {
      main(["node", "checks/status-holes.ts", "/nonexistent/path/status.jsonl"]);
    } finally {
      process.stdout.write = originalWrite;
    }
    expect(captured).toContain("skipping");
  });
});
