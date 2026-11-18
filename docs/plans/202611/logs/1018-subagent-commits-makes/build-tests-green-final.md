Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1018-subagent-commits-makes-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "returns the commit that holds the last step-done row" | red-not-loaded | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "with a step name returns the commit of the row before that step's latest row" | red-not-loaded | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "falls back to the run start commit, and null with no run" | red-not-loaded | passed |
| 2 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists a file the subagent committed after the last step-done commit" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists the same file when it is left uncommitted" | passed-accepted | passed |
| 2 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "leaves out a file only the previous step's own commit touched" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 1 when the step changed only logs" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "bkit-build gaps-fix source checks measure from the previous step, never HEAD~1" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists the subagent's committed file when another feature's run is also in progress" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "with no file on a feat/{FID} branch, picks that FID's run when another run is in progress" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "skips a build-takeover row written inside the step it measures" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists the subagent's committed file on an adopted branch when another feature's run is also in progress" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress" | red | passed |

## Gaps

None.

## Already landed

- Task 2 `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists the same file when it is left uncommitted" — passed at the group's red, and the tests step accepted it: the current HEAD default already lists an uncommitted edit; the test guards that it stays equal to the committed case; no red is due
