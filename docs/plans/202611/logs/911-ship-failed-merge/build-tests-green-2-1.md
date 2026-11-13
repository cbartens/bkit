Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/911-ship-failed-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail treats an empty --next-step as absent" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path re-runs workflows fail without --next-step on exit 2" | red | passed |

## Gaps

None.
