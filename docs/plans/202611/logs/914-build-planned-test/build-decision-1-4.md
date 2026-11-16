Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/914-build-planned-test-plan.md
Holistic attempt: 3

**Q1 — Holistic gap — 13 planned tests of Tasks 2-4 the group 3 code step rewrote [.bkit/core/engine/commands/workflow/steps.test.ts]:** The final fix round cannot be recorded. The lock that guards planned tests refuses it with exit 11, naming 13 planned tests of Tasks 2-4 that the group 3 code step rewrote for Task 11's add-only rule, which you accepted at decision 3. Nothing can record that acceptance: the tests still belong to Tasks 2-4, whose recorded lines are the old ones, and re-recording them does nothing because those tasks are ticked. Accept leaves the run refused here, so it ends on the Failure Path. Fix now moves the 13 tests out of Tasks 2-4 into new fix tasks in a last group: the tests step takes them over and records their current lines, and the lock then guards those lines; any test that already passes before code shows as unproven at Step 15. Stop pauses the run here so it can be resumed.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Which owner decision a rewrite of an earlier task's planned tests falls under, and whether those tests change hands to a new task, is a policy choice about the test-first lock, not a code defect an agent can settle.
Decision: Fix now — "Get this unblocked and build finished"; under "whatever gives us best end state is fine", the 13 tests move to new fix tasks for the tests step to take over and record again
Fix task: 12, 13

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
