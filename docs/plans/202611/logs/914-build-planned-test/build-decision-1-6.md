Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/914-build-planned-test-plan.md

**Q1 — Task 15 [.bkit/core/engine/commands/workflow/tests.ts:468]:** Some planned tests cannot be found by name in their file, for example a test built from a table of cases (`it.each`). The lock then guards that test by its whole file instead of by its own lines. Because the lock now checks every group's planned tests, any later change anywhere in that file refuses every later code step, even when a later group's tests step only adds a new test of its own. No BLOCKED line can clear that refusal, so the run would fail. You need to decide how such a test is locked: (1) keep locking the whole file for every later group, as built today; (2) lock the whole file only during the test's own group, so later groups can change the file freely; or (3) keep the whole-file lock, but let a change through when a BLOCKED line names the test and the change to the file only adds lines. Accept leaves it as built (option 1) and records your reason. Fix now adds a fix task shaped by the option you choose. Stop pauses the run here so it can be resumed.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — It trades the lock's strength against two promises the plan makes: that a step which did not touch a file is never refused for it, and that other tests in the same file stay free to change. Which matters more is the owner's choice.
Decision: Fix now — "ok fix both now"; keep the whole-file lock, with the newest red copy of the file as its baseline
Fix task: 15

**Q2 — Task 18 [.bkit/core/engine/commands/workflow/steps.ts:1333]:** At decision 2 you chose to refuse any change that removes lines from a planned test and to let through, under a BLOCKED line, a change that only adds lines. A code agent can still switch a test off by only adding lines: one `return;` before the assertions, a comment opening and closing around them, `expect.assertions(0)`, or reassigning the value under test. The engine lets that through, verify only notes it, and a headless run accepts it automatically. Meanwhile the refusal message, both code prompts and `docs/testing.md:314` promise that a BLOCKED line cannot remove or loosen a planned test, which is not true. You need to choose the control: (a) verify reads the added lines of every changed test, as it already does for updated tests, and a line that disables the test becomes a gap, sent to the tests step to restore or to you as a blocker; (b) the engine refuses added lines that end or skip the test early, such as a `return` or a skip; or (c) drop "or loosen" from the wording and rely on you reading the diff shown at Step 15. Accept leaves it as built, wording included, and records your reason. Fix now adds a fix task shaped by the option you choose. Stop pauses the run here so it can be resumed.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — It reopens the owner's earlier choice that verify raises no gap for a changed test, and picks between engine refusal, verify judgment and owner review as the control. That is a policy choice for the owner.
Decision: Fix now — "ok fix both now"; option (a), verify reads a changed test's added lines, and the refusal wording says what is guaranteed
Fix task: 18

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
