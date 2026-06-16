// bkit-ci-dispatch-gate-alignment.test.ts — Cross-file alignment assertions for
// the CI-Dispatch Gate (#261).
//
// The gate is authored inline at two sites:
//   - .bkit/workflows/bkit-build.md   (Step 18 close-workflow push block)
//   - .bkit/workflows/bkit-debug.md   (Step 10 close-workflow PR-mode sub-step 3
//                                      and create-pr LOCAL-mode sub-step 9)
//
// Ship is OUT of scope (keeps its pre-existing SQUASH_SHA-poll gate).
//
// The SHARED poll-loop + named-symbol sub-lines between the delimiter comments
//   # --- CI-Dispatch Gate shared kernel ---
//   # --- end CI-Dispatch Gate shared kernel ---
// must be byte-identical across build and debug (WS-6 contract).
// Only the AUTO_ROUTE sourcing tail + workflow/step jq strings legitimately differ.
//
// This file is modeled on bkit-workflow-lock-snippet.test.ts.

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.resolve(".bkit/workflows");

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");
}

const buildMd = readWorkflow("bkit-build.md");
const debugMd = readWorkflow("bkit-debug.md");
const shipMd = readWorkflow("bkit-ship.md");

// ---------------------------------------------------------------------------
// Helper: extract lines between the shared-kernel delimiter comments.
// Returns null if delimiters not found.
// ---------------------------------------------------------------------------
function extractSharedKernelLines(content: string): string[] | null {
  const START_DELIM = "# --- CI-Dispatch Gate shared kernel ---";
  const END_DELIM = "# --- end CI-Dispatch Gate shared kernel ---";
  const lines = content.split("\n");
  const startIdx = lines.findIndex((l) => l.includes(START_DELIM));
  if (startIdx === -1) return null;
  // Find the FIRST end delimiter after the start (there may be multiple kernels)
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(END_DELIM));
  if (endIdx === -1) return null;
  // Include delimiter lines themselves in the comparison (they must be present verbatim).
  return lines.slice(startIdx, endIdx + 1);
}

// ---------------------------------------------------------------------------
// 1. Build close-workflow site carries the CI-Dispatch gate
// ---------------------------------------------------------------------------
describe("bkit-build.md — CI-Dispatch gate presence", () => {
  it("carries [bkit-ci-gate] log prefix", () => {
    expect(buildMd).toContain("[bkit-ci-gate]");
  });

  it("carries POLL_BUDGET_S=60", () => {
    expect(buildMd).toContain("POLL_BUDGET_S=60");
  });

  it("carries POLL_INTERVAL_S=10", () => {
    expect(buildMd).toContain("POLL_INTERVAL_S=10");
  });

  it("carries all 4 outcome strings", () => {
    expect(buildMd).toContain('"dispatched"');
    expect(buildMd).toContain('"self-healed"');
    expect(buildMd).toContain('"no-ci"');
    expect(buildMd).toContain('"unresolved"');
  });

  it("carries ciDispatch field in the step-done jq object", () => {
    expect(buildMd).toContain("ciDispatch");
  });

  it("uses case-insensitive fuzzy test(decide; i) — NOT an exact literal name match", () => {
    expect(buildMd).toContain('test("decide"; "i")');
    // The exact-literal pattern would be something like '"bkit-decide"' as an equality check;
    // assert the fuzzy form is present.
  });

  it("shared kernel delimiters present", () => {
    expect(buildMd).toContain("# --- CI-Dispatch Gate shared kernel ---");
    expect(buildMd).toContain("# --- end CI-Dispatch Gate shared kernel ---");
  });
});

// ---------------------------------------------------------------------------
// 2. Debug close-workflow + create-pr site carries the CI-Dispatch gate
// ---------------------------------------------------------------------------
describe("bkit-debug.md — CI-Dispatch gate presence", () => {
  it("carries [bkit-ci-gate] log prefix", () => {
    expect(debugMd).toContain("[bkit-ci-gate]");
  });

  it("carries POLL_BUDGET_S=60", () => {
    expect(debugMd).toContain("POLL_BUDGET_S=60");
  });

  it("carries POLL_INTERVAL_S=10", () => {
    expect(debugMd).toContain("POLL_INTERVAL_S=10");
  });

  it("carries all 4 outcome strings", () => {
    expect(debugMd).toContain('"dispatched"');
    expect(debugMd).toContain('"self-healed"');
    expect(debugMd).toContain('"no-ci"');
    expect(debugMd).toContain('"unresolved"');
  });

  it("carries ciDispatch field in both step-done jq objects (debug-close-workflow + debug-create-pr)", () => {
    // Both jq blocks should carry ciDispatch
    const ciDispatchMatches = [...debugMd.matchAll(/ciDispatch/g)];
    expect(ciDispatchMatches.length).toBeGreaterThanOrEqual(2);
  });

  it("uses case-insensitive fuzzy test(decide; i) — NOT an exact literal name match", () => {
    expect(debugMd).toContain('test("decide"; "i")');
  });

  it("shared kernel delimiters present (at least once — two kernel sites)", () => {
    expect(debugMd).toContain("# --- CI-Dispatch Gate shared kernel ---");
    expect(debugMd).toContain("# --- end CI-Dispatch Gate shared kernel ---");
  });

  it("LOCAL-mode gate sets RETRIGGER_SUFFIX from AUTO_ROUTE_SUFFIX (not reorder rm)", () => {
    expect(debugMd).toContain('RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"');
  });

  it("PR-mode gate re-derives PR_NUMBER in-block (pr list --json number --jq [0])", () => {
    // Step 1 has one, PR-mode gate adds another — count must be >= 2.
    const matches = [...debugMd.matchAll(/pr list.*--json number.*--jq.*\[0\]/g)];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("autoroute-mismatch sub-reason present", () => {
    expect(debugMd).toContain("autoroute-mismatch");
  });
});

// ---------------------------------------------------------------------------
// 3. Byte-equality on the SHARED poll-loop + named-symbol sub-lines
//    (NOT whole-gate — AUTO_ROUTE sourcing legitimately differs)
// ---------------------------------------------------------------------------
describe("build vs debug — shared kernel byte-equality", () => {
  it("extracts shared kernel lines from bkit-build.md (vacuous-match guard)", () => {
    const lines = extractSharedKernelLines(buildMd);
    expect(lines).not.toBeNull();
    expect(lines!.length).toBeGreaterThan(0);
  });

  it("extracts shared kernel lines from bkit-debug.md (vacuous-match guard)", () => {
    const lines = extractSharedKernelLines(debugMd);
    expect(lines).not.toBeNull();
    expect(lines!.length).toBeGreaterThan(0);
  });

  it("first shared kernel in build == first shared kernel in debug (byte-equal)", () => {
    const buildLines = extractSharedKernelLines(buildMd);
    const debugLines = extractSharedKernelLines(debugMd);
    expect(buildLines).not.toBeNull();
    expect(debugLines).not.toBeNull();
    // Normalise whitespace differences caused by indentation in if-block vs top-level
    // (the plan requires the CONTENT to be identical; only leading whitespace may differ
    // due to the PR-mode gate being nested inside `if [ "$PUSH_MODE" = "PR" ]`).
    // Compare trimmed lines.
    const trimmed = (lines: string[]) => lines.map((l) => l.trim());
    expect(trimmed(buildLines!)).toEqual(trimmed(debugLines!));
  });
});

// ---------------------------------------------------------------------------
// 4. Ship has NO CI-Dispatch gate (negative assertion)
// ---------------------------------------------------------------------------
describe("bkit-ship.md — no CI-Dispatch gate", () => {
  it("does NOT contain [bkit-ci-gate] log prefix", () => {
    expect(shipMd).not.toContain("[bkit-ci-gate]");
  });

  it("does NOT contain the shared kernel delimiter", () => {
    expect(shipMd).not.toContain("# --- CI-Dispatch Gate shared kernel ---");
  });
});

// ---------------------------------------------------------------------------
// 5. ciDispatch FOLD reducer round-trip
//    A step-done record carrying ciDispatch folds cleanly through the #209
//    FOLD reducer — the additive field survives del(.type,.workflow) unchanged.
// ---------------------------------------------------------------------------
describe("ciDispatch field — #209 FOLD reducer round-trip", () => {
  // Extract the FOLD jq string verbatim from bkit-build.md (same reducer used everywhere).
  function extractFoldJq(content: string): string | null {
    const m = content.match(/FOLD='(def lastIdx[^']+)'/);
    return m ? m[1] : null;
  }

  it("ciDispatch.outcome / .head / .attempts survive the FOLD reducer unchanged", () => {
    const foldJq = extractFoldJq(buildMd);
    expect(foldJq).not.toBeNull();

    const testSha = "abc123def456";
    // Fabricate a minimal status.jsonl with one workflow-started + one step-done carrying ciDispatch.
    const statusNdjson = [
      JSON.stringify({
        type: "workflow-started",
        workflow: "build",
        at: "2026-06-16T10:00:00Z",
      }),
      JSON.stringify({
        type: "step-done",
        workflow: "build",
        step: "build-close-workflow",
        status: "DONE",
        at: "2026-06-16T10:01:00Z",
        parentSha: testSha,
        artifacts: [],
        ciDispatch: {
          outcome: "dispatched",
          head: testSha,
          attempts: 1,
          retrigger: false,
        },
      }),
    ].join("\n");

    // Run the FOLD reducer via bash + jq, extract the ciDispatch field from the folded step.
    const script = `
echo '${statusNdjson.replace(/'/g, "'\\''")}' | jq -rs '
  ${foldJq}
  fold |
  [.[] | select(.workflow=="build")] | last |
  .steps[] | select(.step=="build-close-workflow") |
  .ciDispatch
'`;

    const result = execFileSync("bash", ["-c", script], { encoding: "utf-8" }).trim();
    const ciDispatch = JSON.parse(result) as {
      outcome: string;
      head: string;
      attempts: number;
      retrigger: boolean;
    };

    // Assert full values survive — not just key presence.
    expect(ciDispatch.outcome).toBe("dispatched");
    expect(ciDispatch.head).toBe(testSha);
    expect(ciDispatch.attempts).toBe(1);
    expect(ciDispatch.retrigger).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. retrigger-suppressed maps to unresolved ONLY (never no-ci)
//    The assignment CI_REASON="retrigger-suppressed" must ALWAYS appear on a
//    line that also sets CI_OUTCOME="unresolved" (same shell statement).
//    This is the plan constraint: "retrigger-suppressed maps to unresolved ONLY,
//    never no-ci."
// ---------------------------------------------------------------------------
describe("retrigger-suppressed sub-reason — maps to unresolved only", () => {
  it('bkit-build.md: every line with "retrigger-suppressed" also sets CI_OUTCOME=unresolved', () => {
    const lines = buildMd.split("\n");
    const assignmentLines = lines.filter((l) => l.includes("retrigger-suppressed"));
    // There must be at least one such line (vacuous-match guard).
    expect(assignmentLines.length).toBeGreaterThan(0);
    for (const line of assignmentLines) {
      // Each CI_REASON="retrigger-suppressed" assignment must be on the same line
      // as CI_OUTCOME="unresolved" (the canonical form is the compound assignment:
      // CI_OUTCOME="unresolved"; CI_REASON="retrigger-suppressed").
      // An echo line referencing the string does not carry an assignment.
      if (
        line.includes('CI_REASON="retrigger-suppressed"') ||
        line.includes("CI_REASON=retrigger-suppressed")
      ) {
        expect(line).toContain("unresolved");
      }
    }
  });

  it('bkit-debug.md: every line with "retrigger-suppressed" also sets CI_OUTCOME=unresolved', () => {
    const lines = debugMd.split("\n");
    const assignmentLines = lines.filter((l) => l.includes("retrigger-suppressed"));
    expect(assignmentLines.length).toBeGreaterThan(0);
    for (const line of assignmentLines) {
      if (
        line.includes('CI_REASON="retrigger-suppressed"') ||
        line.includes("CI_REASON=retrigger-suppressed")
      ) {
        expect(line).toContain("unresolved");
      }
    }
  });
});
