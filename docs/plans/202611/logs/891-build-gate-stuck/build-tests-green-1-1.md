Enforced: true
Verdict: null
Gaps: 7
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "parseJunit > keeps each case's classname and file attribute" | red-not-loaded | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "reportFailures > returns the failing and erroring cases of every report, or null with none" | red-not-loaded | passed |
| 2 | `.bkit/core/engine/shared/package-manager.test.ts` "a prefer-offline frozen install adds --prefer-offline" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > adds the group gate's failing tests to each verify round" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > a red gate row with no failure count makes the round unknown" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > a red gate row with 0 counted failures makes the round unknown" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > a verify round whose gate did not run adds no gate failures" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > prints the group gate's failing tests per round for the verify loop" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `CaseState` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:121`, `.bkit/core/engine/commands/workflow/junit.ts:64`, `.bkit/core/engine/commands/workflow/junit.ts:67`, `docs/decisions.jsonl:685` — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `JunitCase` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:108`, `.bkit/core/engine/commands/workflow/junit.ts:110`, `.bkit/core/engine/commands/workflow/junit.ts:134`, `.bkit/core/engine/commands/workflow/junit.ts:43`, `.bkit/core/engine/commands/workflow/junit.ts:54`, and 53 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `parseJunit` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:14`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:147`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:85`, `.bkit/core/engine/commands/workflow/junit.test.ts:22`, `.bkit/core/engine/commands/workflow/junit.test.ts:24`, and 137 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `countReportFailures` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.test.ts:32`, `.bkit/core/engine/commands/workflow/junit.test.ts:35`, `.bkit/core/engine/commands/workflow/junit.test.ts:37`, `.bkit/core/engine/commands/workflow/junit.test.ts:45`, `.bkit/core/engine/commands/workflow/junit.test.ts:7`, and 19 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:137`, `.bkit/core/engine/commands/workflow/junit.ts:19`, `.bkit/core/engine/commands/workflow/tests.ts:1738`, `.bkit/core/engine/commands/workflow/tests.ts:1993`, `.bkit/core/engine/commands/workflow/tests.ts:67`, and 50 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `REPORT_ENV` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:102`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:14`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:145`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:83`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:94`, and 13 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `runTestFile` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:130`, `.bkit/core/engine/commands/workflow/tests.ts:2013`, `.bkit/core/engine/commands/workflow/tests.ts:2217`, `.bkit/core/engine/commands/workflow/tests.ts:67`, `dist/commands/workflow/junit.js:93`, and 4 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
