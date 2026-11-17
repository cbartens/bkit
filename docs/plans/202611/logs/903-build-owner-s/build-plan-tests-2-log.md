Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 2: DecisionItem has no fixTask; no decisionHeader export from .bkit/core/engine/commands/workflow/decisions.ts:29-45
SOURCE — TASK 3: pausedGroups rule absent; answer lookup limits RESOLVED_BY_RUN to holistic/run-tests from .bkit/core/engine/commands/workflow/summary.ts:68-88,404-420
SOURCE — TASK 3: taskVerified reads latest build-plan-verify of the task's group and header 'Tasks:' from .bkit/core/engine/commands/workflow/summary-findings.ts:19-52
SOURCE — TASK 3: decision file layout from .bkit/core/engine/commands/workflow/decisions.ts:480-520
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `reads the task a Fix now item names on its Fix task line`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `decisionHeader reads the header block only`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause's Fix now group is resolved once each fix task is verified`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause before the round limit resolves its Fix now group the same way`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause clears its group's FAIL only when every item is answered`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause clears only the group its Group header names`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a paused group's CONCERNS rows stay concerns after its Fix now task is verified`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a holistic or challenge decision file clears no group rows`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/summary.test.ts` `a group that paused more than once is settled by its latest qualifying decision`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/summary.test.ts` `an Accept-only verify pause resolves its group's FAIL rows before the pause`
NOTE — TASK 3: fixtures put no passing build-plan-verify-holistic or build-run-tests after the pause, so RESOLVED_BY_RUN (summary.ts:71-88) cannot clear the group 9 FAIL rows; each test's first assertion fails on the stated reason (verified red).
NOTE — TASK 3: the 'Fix now task inside group 9' sub-case in the first test already resolves on current code (a later same-group PASS verify, existing rule); it is a non-regression assertion, not a red one. The test as a whole fails on its main sub-case.
NOTE — TASK 3: the 'keeps' sub-cases (unticked, verified before pause, other group, Group header elsewhere, holistic/challenge file, Accept-only with unanswered item, FAIL after pause) pass on current code by design; each test is red on its control that must clear.
NOTE — TASK 3: planOf in workflows.test.ts left unchanged; the group-9/group-10 plan is built inline in the new case. Summary tests use a local planOf inside a nested describe.
