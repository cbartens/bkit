Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/ledgers/status.test.ts` "CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "saves the failed job count without the capstone job" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "counts the capstone job when it is the only failed job" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "saves no failed job count when no job failed" | passed-accepted | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "counts fallback evidence jobs without the capstone job" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "CI evidence test rounds > records the selected run's failed job count" | red | passed |
| 5 | `.bkit/core/engine/ledgers/telemetry.test.ts` "test-run status row validation > accepts a counted CI evidence round and refuses 0" | red | passed |
| 5 | `.bkit/core/engine/checks/status-holes.test.ts` "check — hole classes > a counted CI round with its step-done row raises no CI evidence hole" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/steps.test.ts` "finishes a CI round only with its own failed job count" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" | passed-accepted | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 4 `.bkit/core/engine/commands/workflow/runs.test.ts` "saves no failed job count when no job failed" — passed at the group's red, and the tests step accepted it: current locateCi saves no failedJobCount field at all, so absence already holds; no red is due
- Task 6 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" — passed at the group's red, and the tests step accepted it: the same test as Task 10, corrected by the owner-approved Fix now (decision 1); its second round is now a failing local gate with no JUnit report, so it passes against the existing runner; no red is due
- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" — passed at the group's red, and the tests step accepted it: reworked to a failing local gate (control.failLocal, exit 1, no JUnit); existing tests runner records failures null and progress reads "2 → ?" / unknown; no red is due
