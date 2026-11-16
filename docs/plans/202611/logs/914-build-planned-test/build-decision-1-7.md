Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/914-build-planned-test-plan.md
Group: 5
Verify attempt: 4
Source changed: false

**Q1 — Task 18:** Two planned tests contradict each other, and the group 5 code step settled it by editing a test it is not allowed to touch. Task 18 makes the refusal message stop saying "cannot remove or loosen". A planned test from group 3 (Task 11) checks for exactly that wording, so the code step changed that test's one checking line to the new wording. Nothing recorded the edit: there is no BLOCKED line and no changed-test record, so you would never see it at the end of the build. This run did not catch it because the engine running the workflow is the main checkout's dev copy, which only guards the current group's tests; this branch's own lock would refuse the next code step that runs on it. No fix round can close it: a code step may not keep a rewritten line, putting the old line back fails Task 18's test, and the group 5 tests step cannot re-record a test that belongs to the finished Task 11. Accept keeps the edited test as it is and records your reason; the test stays recorded under its old lines, so a later code step run on this branch's engine is refused for it. Fix now moves the test out of Task 11 into a new fix task in a new group 6, as decision 4 did for 13 other tests: the tests step takes it over and records its current line, and the lock then guards that line; because the test already passes, it shows as unproven at the end of the build. Stop pauses the run here so it can be resumed. The test is `.bkit/core/engine/commands/workflow/steps.test.ts:2453` `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11`.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Whether an earlier task's planned test changes hands to a new task, or its rewrite is simply accepted, is a policy choice about the test-first lock, not a code defect an agent can settle.
Decision: Fix now — "B"; the test moves out of Task 11 into a new fix task in group 6, for the tests step to take over and record again
Fix task: 19

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
