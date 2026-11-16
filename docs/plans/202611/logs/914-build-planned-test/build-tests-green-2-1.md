Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green leaves a changed test the plan no longer names out of changed" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green prints an empty changed list and no Changed by a code step section when no code step changed a test" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` "a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "an exit 11 re-ask offers the BLOCKED test line the engine reads" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Step 15 asks once about planned tests a code step changed, before the unproven ones" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a changed-test item offers Accept or Stop, recommended Accept" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the execute prompt's BLOCKED test line is one the engine reads" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the remediate prompt's BLOCKED test line is one the engine reads" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the verify prompt notes a planned test a code step changed and raises no gap" | red | passed |

## Gaps

None.
