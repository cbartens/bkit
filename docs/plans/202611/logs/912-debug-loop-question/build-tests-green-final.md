Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopTrend > a missing count is unknown, not stuck" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > a round with no count reports unknown and no recommendation" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop=verify with an uncounted group gate reads unknown" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > does not compare a CI round with a local gate round" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > compares the last round with the earliest round of the same scope" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > reports each round's scope" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > judges codeChanged between the compared same-scope rounds" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine names an unknown count instead of claiming no fewer failures" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine says the rounds ran different tests" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine for a fall without a code change says no source code changed" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine for the same count states both counts" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine prefers different scopes over a missing count" | red | passed |
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
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop on an unknown trend recommends Try again without claiming progress" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop on an unknown trend says the limit is used up" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop states the engine's trendLine in Q1" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug Loop Question states the engine's trend line, never a fixed claim" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug Loop Question at the used-up soak limit states the trend line" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop=verify on an unknown trend below the limit does not say the limit is used up" | red | passed |

## Gaps

- Task 7 `delete-still-referenced` — DELETE `trendLine` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `.agents/plugins/bkit/skills/bkit-debug/SKILL.md:117`, `.agents/skills/bkit-debug/SKILL.md:117`, `.bkit/core/.bkit/workflows.md:1033`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:2039`, `.bkit/core/engine/commands/workflow/counters.test.ts:1021`, and 53 more — Fixable: null — log: TASK 7: delete-still-referenced — Fixable: null

## Already landed

- Task 4 `.bkit/core/engine/commands/workflow/runs.test.ts` "saves no failed job count when no job failed" — passed at the group's red, and the tests step accepted it: current locateCi saves no failedJobCount field at all, so absence already holds; no red is due
- Task 6 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" — passed at the group's red, and the tests step accepted it: the same test as Task 10, corrected by the owner-approved Fix now (decision 1); its second round is now a failing local gate with no JUnit report, so it passes against the existing runner; no red is due
- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" — passed at the group's red, and the tests step accepted it: reworked to a failing local gate (control.failLocal, exit 1, no JUnit); existing tests runner records failures null and progress reads "2 → ?" / unknown; no red is due
