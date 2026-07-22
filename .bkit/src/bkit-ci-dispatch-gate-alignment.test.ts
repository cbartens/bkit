// bkit-ci-dispatch-gate-alignment.test.ts — Cross-file alignment assertions for
// the CI-Dispatch Gate (#261).
//
// The gate is authored inline at two sites:
//   - .bkit/workflows/bkit-build.md   (Step 17 "Close Workflow & Create PR" gate block)
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
// Returns null if no delimiters found.
// DEPRECATED: use extractAllSharedKernelBlocks for multi-kernel files (bkit-debug.md has 2).
// ---------------------------------------------------------------------------
function extractSharedKernelLines(content: string): string[] | null {
  const blocks = extractAllSharedKernelBlocks(content);
  if (blocks === null || blocks.length === 0) return null;
  return blocks[0];
}

// ---------------------------------------------------------------------------
// Helper: extract ALL kernel blocks from a file.
// bkit-build.md has 1 block; bkit-debug.md has 2 (PR-mode + LOCAL-mode).
// Each returned array includes the delimiter lines themselves.
// Returns null if no start delimiter is found at all.
// ---------------------------------------------------------------------------
function extractAllSharedKernelBlocks(content: string): string[][] | null {
  const START_DELIM = "# --- CI-Dispatch Gate shared kernel ---";
  const END_DELIM = "# --- end CI-Dispatch Gate shared kernel ---";
  const lines = content.split("\n");
  const blocks: string[][] = [];
  let searchFrom = 0;
  while (searchFrom < lines.length) {
    const startIdx = lines.findIndex((l, i) => i >= searchFrom && l.includes(START_DELIM));
    if (startIdx === -1) break;
    const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(END_DELIM));
    if (endIdx === -1) break;
    // Include delimiter lines themselves in the comparison (they must be present verbatim).
    blocks.push(lines.slice(startIdx, endIdx + 1));
    searchFrom = endIdx + 1;
  }
  return blocks.length > 0 ? blocks : null;
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

  it("anchors on the bkit-tests namespace (+ legacy decide), NOT a single lane name", () => {
    expect(buildMd).toContain('test("bkit-tests|decide"; "i")');
    // Anchoring on one lane's name is what broke when a consumer renamed the planner
    // bkit-decide -> bkit-tests-scope: the probe matched nothing, so the gate reported
    // no-ci forever and could no longer catch a genuinely undispatched run. The namespace
    // survives a lane rename; `decide` stays for consumers still on the old planner name.
    expect(buildMd).not.toContain('test("decide"; "i")');
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

  it("anchors on the bkit-tests namespace (+ legacy decide), NOT a single lane name", () => {
    expect(debugMd).toContain('test("bkit-tests|decide"; "i")');
    expect(debugMd).not.toContain('test("decide"; "i")');
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
//
//    bkit-build.md has 1 kernel block.
//    bkit-debug.md has 2 kernel blocks: PR-mode (sub-step 3) + LOCAL-mode (sub-step 9).
//    ALL debug kernels must be byte-equal to the single build kernel so a one-sided
//    edit to either debug site is caught immediately (guard-rot prevention).
// ---------------------------------------------------------------------------
describe("build vs debug — shared kernel byte-equality", () => {
  it("extracts >= 1 kernel block from bkit-build.md (non-vacuous guard)", () => {
    const blocks = extractAllSharedKernelBlocks(buildMd);
    expect(blocks).not.toBeNull();
    expect(blocks!.length).toBeGreaterThanOrEqual(1);
    expect(blocks![0].length).toBeGreaterThan(0);
  });

  it("extracts >= 2 kernel blocks from bkit-debug.md (PR-mode + LOCAL-mode, non-vacuous guard)", () => {
    const blocks = extractAllSharedKernelBlocks(debugMd);
    expect(blocks).not.toBeNull();
    // Debug MUST have both the PR-mode (sub-step 3) and LOCAL-mode (sub-step 9) kernel sites.
    expect(blocks!.length).toBeGreaterThanOrEqual(2);
    for (const block of blocks!) {
      expect(block.length).toBeGreaterThan(0);
    }
  });

  it("every debug kernel block is byte-equal to the single build kernel (trimmed-line comparison)", () => {
    const buildBlocks = extractAllSharedKernelBlocks(buildMd);
    const debugBlocks = extractAllSharedKernelBlocks(debugMd);
    expect(buildBlocks).not.toBeNull();
    expect(debugBlocks).not.toBeNull();

    // Build has exactly one reference kernel.
    const buildKernel = buildBlocks![0];

    // Normalise whitespace differences caused by indentation in if-block vs top-level
    // (the plan requires the CONTENT to be identical; only leading whitespace may differ
    // due to the PR-mode gate being nested inside `if [ "$PUSH_MODE" = "PR" ]`).
    const trimmed = (lines: string[]) => lines.map((l) => l.trim());
    const trimmedBuild = trimmed(buildKernel);

    for (let i = 0; i < debugBlocks!.length; i++) {
      expect(trimmed(debugBlocks![i])).toEqual(
        trimmedBuild,
        `debug kernel block ${i} (0-based) does not match build kernel — one-sided edit detected`,
      );
    }
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

// ---------------------------------------------------------------------------
// 7. KN-11 regression guard — no post-gate verdict-commit push (FIX B lock-in)
//
//    The ciDispatch jq >> "$STATUS" verdict write must NOT be followed by a
//    git push inside the same gate block. The only legitimate post-kernel push
//    is the capped self-heal re-trigger, which happens BEFORE the jq verdict
//    write (inside the self-heal branch). Adding any push after the verdict
//    write would either:
//      (a) re-hide CI via a [skip ci] commit → empty statusCheckRollup → KN-11
//      (b) fire a second CI run on the already-confirmed HEAD
//
//    Approach: for each gate site, extract the slice of text from the ciDispatch
//    jq write down to the end of the gate's closing `case "$CI_OUTCOME" in
//    unresolved)` line and assert no `git push` appears in that slice.
// ---------------------------------------------------------------------------

// Helper: extract the post-verdict tail for each ciDispatch gate site.
// Returns an array of slices (one per gate site), each being the lines from the
// ciDispatch jq write to the nearest closing `case "$CI_OUTCOME" in unresolved)`
// line (inclusive).
//
// Anchored on the jq write's own arg list, NOT on a comment: `.bkit/workflows.md`
// § Workflow Authoring Rules bans rationale comments from the workflow files, so a
// marker comment is deletable-by-policy and would silently vacate this guard.
function extractPostVerdictSlices(content: string): string[][] {
  const lines = content.split("\n");
  const VERDICT_MARKER = '--arg o "$CI_OUTCOME" --arg h "$PUSHED_HEAD"';
  const GATE_END_MARKER = 'case "$CI_OUTCOME" in unresolved)';
  const slices: string[][] = [];
  let searchFrom = 0;
  while (searchFrom < lines.length) {
    const startIdx = lines.findIndex((l, i) => i >= searchFrom && l.includes(VERDICT_MARKER));
    if (startIdx === -1) break;
    const endIdx = lines.findIndex((l, i) => i >= startIdx && l.includes(GATE_END_MARKER));
    if (endIdx === -1) {
      // No closing case line found — include to end of file as a safe fallback
      slices.push(lines.slice(startIdx));
      break;
    }
    slices.push(lines.slice(startIdx, endIdx + 1));
    searchFrom = endIdx + 1;
  }
  return slices;
}

describe("no post-gate verdict-commit push — KN-11 regression guard (FIX B)", () => {
  it("bkit-build.md: post-verdict slice present (vacuous-match guard — at least 1 site)", () => {
    const slices = extractPostVerdictSlices(buildMd);
    expect(slices.length).toBeGreaterThanOrEqual(1);
    for (const slice of slices) {
      expect(slice.length).toBeGreaterThan(0);
    }
  });

  it("bkit-debug.md: post-verdict slices present (vacuous-match guard — at least 2 sites)", () => {
    const slices = extractPostVerdictSlices(debugMd);
    expect(slices.length).toBeGreaterThanOrEqual(2);
    for (const slice of slices) {
      expect(slice.length).toBeGreaterThan(0);
    }
  });

  it("bkit-build.md: no git push in the post-verdict slice (the ciDispatch jq write is the last action)", () => {
    const slices = extractPostVerdictSlices(buildMd);
    expect(slices.length).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < slices.length; i++) {
      const sliceText = slices[i].join("\n");
      // git push must NOT appear after the verdict write; the self-heal re-trigger push
      // happens before this slice, inside the suppressed/self-heal branch.
      expect(sliceText).not.toMatch(
        /git push/,
        `bkit-build.md gate site ${i}: found a git push in the post-verdict slice — this would re-introduce KN-11 or fire a second CI run`,
      );
    }
  });

  it("bkit-debug.md: no git push in any post-verdict slice (both PR-mode and LOCAL-mode gate sites)", () => {
    const slices = extractPostVerdictSlices(debugMd);
    expect(slices.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < slices.length; i++) {
      const sliceText = slices[i].join("\n");
      expect(sliceText).not.toMatch(
        /git push/,
        `bkit-debug.md gate site ${i}: found a git push in the post-verdict slice — this would re-introduce KN-11 or fire a second CI run`,
      );
    }
  });

  it("bkit-build.md: no ci-dispatch-verdict commit message token after the ciDispatch jq write", () => {
    // Locks out the specific rejected-fix pattern: a 'ci-dispatch-verdict' commit pushed after the gate.
    const slices = extractPostVerdictSlices(buildMd);
    expect(slices.length).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < slices.length; i++) {
      const sliceText = slices[i].join("\n");
      expect(sliceText).not.toContain(
        "ci-dispatch-verdict",
        `bkit-build.md gate site ${i}: 'ci-dispatch-verdict' commit token found after the ciDispatch jq write — this commit+push was rejected as KN-11 regression`,
      );
    }
  });

  it("bkit-debug.md: no ci-dispatch-verdict commit message token after the ciDispatch jq write", () => {
    const slices = extractPostVerdictSlices(debugMd);
    expect(slices.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < slices.length; i++) {
      const sliceText = slices[i].join("\n");
      expect(sliceText).not.toContain(
        "ci-dispatch-verdict",
        `bkit-debug.md gate site ${i}: 'ci-dispatch-verdict' commit token found after the ciDispatch jq write — this commit+push was rejected as KN-11 regression`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// 8. Intentional-non-push rationale lives in workflows.md ONLY (FIX B + L48)
//
//    Per .bkit/workflows.md § "Workflow Authoring Rules" (instructions only:
//    no inline comments justifying behaviour), the rationale for the
//    deliberately-not-pushed ciDispatch record belongs in the workflows.md
//    § CI-Dispatch Gate doctrine paragraph — NOT inline in the per-workflow
//    files. These assertions lock in both halves: the doctrine is documented
//    in workflows.md, and the inline justification stays OUT of the gate files.
// ---------------------------------------------------------------------------
describe("intentional-non-push rationale documented in workflows.md, not inline (FIX B + L48)", () => {
  const workflowsMd = fs.readFileSync(path.resolve(".bkit/workflows.md"), "utf-8");

  // The inline rationale anchor that must NOT appear in the per-workflow files.
  const INLINE_RATIONALE_ANCHOR =
    "written to the LOCAL status.jsonl ledger only and is deliberately";

  it("workflows.md CI-Dispatch Gate section carries the LOCAL-only intentional non-push doctrine", () => {
    // Doctrine paragraph must mention: LOCAL-only, intentional non-push, and KN-11.
    expect(workflowsMd).toContain("LOCAL-only (intentional non-push)");
    expect(workflowsMd).toContain("KN-11");
    // Must explicitly forbid the rejected fix.
    expect(workflowsMd).toContain('Do NOT "fix" with post-gate commit+push');
  });

  it("bkit-build.md does NOT inline the non-push rationale (it belongs in workflows.md)", () => {
    expect(buildMd).not.toContain(INLINE_RATIONALE_ANCHOR);
    expect(buildMd).not.toContain("re-introduces KN-11");
  });

  it("bkit-debug.md does NOT inline the non-push rationale at either gate site", () => {
    expect(debugMd).not.toContain(INLINE_RATIONALE_ANCHOR);
    expect(debugMd).not.toContain("re-introduces KN-11");
  });
});

// ---------------------------------------------------------------------------
// 9. All-kernels equality is non-vacuous (FIX A lock-in — count guards)
//
//    These assertions verify the count guards in describe block 3 are
//    non-vacuous: build yields exactly 1 kernel (not 0, not accidentally 2+),
//    debug yields exactly 2 kernels (not 0 or 1 — both sites must be present).
//    If a kernel were dropped the count check would fail immediately.
// ---------------------------------------------------------------------------
describe("all-kernels equality count guards are non-vacuous (FIX A)", () => {
  it("bkit-build.md: extractAllSharedKernelBlocks returns EXACTLY 1 block (build has one gate site)", () => {
    const blocks = extractAllSharedKernelBlocks(buildMd);
    expect(blocks).not.toBeNull();
    // Exactly 1 — if a second (spurious) kernel were added, this would catch it too.
    expect(blocks!.length).toBe(1);
  });

  it("bkit-debug.md: extractAllSharedKernelBlocks returns EXACTLY 2 blocks (PR-mode + LOCAL-mode)", () => {
    const blocks = extractAllSharedKernelBlocks(debugMd);
    expect(blocks).not.toBeNull();
    // Exactly 2 — dropping either site would fail this, adding a spurious third would also fail.
    expect(blocks!.length).toBe(2);
  });

  it("bkit-build.md: the single kernel block has >= 10 lines (non-trivial content guard)", () => {
    const blocks = extractAllSharedKernelBlocks(buildMd);
    expect(blocks).not.toBeNull();
    // The canonical kernel is 21 lines including delimiters; guard at >=10 to allow minor
    // whitespace-only edits while catching accidental emptying.
    expect(blocks![0].length).toBeGreaterThanOrEqual(10);
  });

  it("bkit-debug.md: both kernel blocks have >= 10 lines (non-trivial content guard)", () => {
    const blocks = extractAllSharedKernelBlocks(debugMd);
    expect(blocks).not.toBeNull();
    for (let i = 0; i < blocks!.length; i++) {
      expect(blocks![i].length).toBeGreaterThanOrEqual(10);
    }
  });

  it("build kernel and both debug kernels are all byte-equal (trimmed) — dropping any one breaks equality", () => {
    // This re-asserts the core FIX-A guarantee with explicit failure context.
    const buildBlocks = extractAllSharedKernelBlocks(buildMd);
    const debugBlocks = extractAllSharedKernelBlocks(debugMd);
    expect(buildBlocks).not.toBeNull();
    expect(debugBlocks).not.toBeNull();
    expect(buildBlocks!.length).toBe(1);
    expect(debugBlocks!.length).toBe(2);

    const trimmed = (lines: string[]) => lines.map((l) => l.trim());
    const buildKernel = trimmed(buildBlocks![0]);

    // Both debug kernels must equal build — if LOCAL-mode kernel were quietly edited,
    // this would catch it (it would fail on debug index 1 specifically).
    expect(trimmed(debugBlocks![0])).toEqual(
      buildKernel,
      "debug PR-mode kernel (block 0) diverged from build kernel",
    );
    expect(trimmed(debugBlocks![1])).toEqual(
      buildKernel,
      "debug LOCAL-mode kernel (block 1) diverged from build kernel — one-sided edit detected",
    );
  });
});
