Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 6: Generalise the deriver to all five workflows and promote the pure text helpers — 4 reds recorded (test 2 renamed without the {BKIT} braces, the red tool refuses the placeholder), status-holes + workflow-shape tests 282/282 green (.bkit/core/engine/checks/status-holes.ts, status-holes.test.ts, audits/workflows/workflow-shape.test.ts)
BLOCKED — TASK 7 (reds only): both reds refused as passed (build-task-red-3-7-1.md, 3-7-2.md): the conditionality rule was already implemented by TASK 6's deriveContract, and the Step 4 markdown was edited before its test was written; no code undone to force a red
DONE — TASK 7: Derive step conditionality from the column-0 marker rule and make it an authoring rule — conditionality fixture (all 5 workflows) + Step 4 skip-row case green, build Step 4 sub-step 4 skip row + Gate 4 line, authoring.md rule, workflows.md entry, bkit upgrade regenerated mirrors, pnpm build + bkit:gate:static pass (.bkit/core/workflows/bkit-build.md, .bkit/core/.bkit/authoring.md, .bkit/core/.bkit/workflows.md)
