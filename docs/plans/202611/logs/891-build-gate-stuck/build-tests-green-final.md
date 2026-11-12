Enforced: true
Verdict: null
Gaps: 7
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "parseJunit > keeps each case's classname and file attribute" | red-not-loaded | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "reportFailures > returns the failing and erroring cases of every report, or null with none" | red-not-loaded | passed |
| 2 | `.bkit/core/engine/shared/package-manager.test.ts` "a prefer-offline frozen install adds --prefer-offline" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > adds the group gate's failing tests to each verify round" | vacuous | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > a red gate row with no failure count makes the round unknown" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > a red gate row with 0 counted failures makes the round unknown" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > a verify round whose gate did not run adds no gate failures" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > prints the group gate's failing tests per round for the verify loop" | red | passed |
| 14 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > adds the group gate's failing tests to each verify round" | passed-accepted | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > all when every failing case also fails at base" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > some with the base-red and branch counts" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > none when each case passes, is absent, or its file is absent at base" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > unknown with a reason when no case is base-red and one is undetermined" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > resolves from file, then a classname path, then one matching tracked basename" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > a classname matching two tracked basenames leaves the case undetermined" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > an untracked or outside-repo file attribute leaves the case undetermined" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > unknown when a red gate has no failing case" | red-not-loaded | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > reports all from a local run at the merge-base" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a failing file absent at the base commit is the branch's" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > no JUnit report reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > an undeclared bkit:test:file reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a failed base install reads unknown and removes the worktree" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > installs at base with --frozen-lockfile --prefer-offline" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > copies the worktreeCopy entries into the base checkout" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > no origin/dev ref reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a base file run that writes no report reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a missing required flag is a usage error" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a passing CI run at the exact base sha settles none without a local run" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a CI run that cannot settle the base falls back to the local run" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > adopt follows the run's runtimeWorktrees" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > worktreeInstall off reads unknown" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all with no items recommends Stop" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all with items recommends Decide" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all in adopt mode adds the merge sentence" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check some names the split" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check none keeps the trend and names the branch" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check unknown keeps the trend and says why" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > Try again is offered for every base verdict" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check prints how many failing tests are also red on base" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > a missing or malformed base check is a usage error that names the problem" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a file without Gate: FAIL or not OPEN" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows start — resume facts > openDecision carries the Gate header" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows start — resume facts > openDecision gate is null without the header" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > the Decision Pause checks a red gate against the base commit before composing" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a no-progress round after a red gate pauses with the loop question" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a failing gate or suite test is never a pause item" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "resume facts > build re-runs a red gate pause instead of asking it" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a re-run gate that is still red goes straight to the Decision Pause" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > a green re-run gate continues without asking and clears GATE_RERUN" | red | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build > group-mode verify logs no gap for a test the group gate runs" | red | passed |
| 15 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a pull_request-event CI run at the base sha does not settle none" | red | passed |
| 16 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all says a gate still red after resume comes from this branch" | red | passed |
| 17 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a base file run that exits non-zero without the failing case reads unknown" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > the base test run does not inherit the hooks-off git config" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a file whose only Gate: FAIL line is in an item body" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows start — resume facts > openDecision gate ignores a Gate line below the header" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a Gate: FAIL file whose Q1 is an item, not the loop question" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a loop file with an undecided item question" | red | passed |
| 20 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "resume facts > build re-runs a red gate pause only when the loop question is its only undecided question" | red | passed |
| 21 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a case skipped at the base commit reads unknown, not the branch's" | red | passed |
| 22 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > some with an undetermined case names it in the reason" | red | passed |
| 22 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check some with undetermined cases counts only the branch's as fixable" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `CaseState` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:121`, `.bkit/core/engine/commands/workflow/junit.ts:64`, `.bkit/core/engine/commands/workflow/junit.ts:67`, `docs/decisions.jsonl:685` — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `JunitCase` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:108`, `.bkit/core/engine/commands/workflow/junit.ts:110`, `.bkit/core/engine/commands/workflow/junit.ts:134`, `.bkit/core/engine/commands/workflow/junit.ts:43`, `.bkit/core/engine/commands/workflow/junit.ts:54`, and 59 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `parseJunit` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:14`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:147`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:85`, `.bkit/core/engine/commands/workflow/junit.test.ts:22`, `.bkit/core/engine/commands/workflow/junit.test.ts:24`, and 137 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `countReportFailures` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.test.ts:32`, `.bkit/core/engine/commands/workflow/junit.test.ts:35`, `.bkit/core/engine/commands/workflow/junit.test.ts:37`, `.bkit/core/engine/commands/workflow/junit.test.ts:45`, `.bkit/core/engine/commands/workflow/junit.test.ts:7`, and 23 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:137`, `.bkit/core/engine/commands/workflow/junit.ts:19`, `.bkit/core/engine/commands/workflow/tests.ts:1740`, `.bkit/core/engine/commands/workflow/tests.ts:1995`, `.bkit/core/engine/commands/workflow/tests.ts:67`, and 50 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `REPORT_ENV` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:102`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:14`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:145`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:83`, `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:94`, and 13 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `runTestFile` in `.bkit/core/engine/commands/workflow/tests.ts` is still referenced: `.bkit/core/engine/commands/workflow/junit.ts:130`, `.bkit/core/engine/commands/workflow/tests-base.ts:23`, `.bkit/core/engine/commands/workflow/tests-base.ts:261`, `.bkit/core/engine/commands/workflow/tests.ts:2015`, `.bkit/core/engine/commands/workflow/tests.ts:2219`, and 9 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null

## Already landed

- Task 14 `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > adds the group gate's failing tests to each verify round" — passed at the group's red, and the tests step accepted it: runtime assertions unchanged and green; the planned failure is a type error (TS2345) only, fixed by the widened label; no red is due

## Unproven

- Task 3 `.bkit/core/engine/commands/workflow/counters.test.ts` "loopProgress with a gate > adds the group gate's failing tests to each verify round" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
