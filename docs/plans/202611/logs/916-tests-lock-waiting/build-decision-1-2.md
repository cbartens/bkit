Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 9
Plan: docs/plans/202611/916-tests-lock-waiting-plan.md
Group: 4
Verify attempt: 2

**Q1 — TASK 11 still names the deleted test:** Task 11's code fix is in, but its plan entry named the old race test that task 14 replaced, so the checker kept saying that test never ran. The fix step has now pointed task 11's plan entry at the new test, `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal`. Accept that as closing this gap?
Options: A) Accept / B) Fix now
Recommended: A) Accept — The fix is already made: the plan now names the test that exists, and the next check confirms it. Fix now would only add another task to redo the same plan edit.
Decision: Accept — get this unstuck and moving

**Q2 — TASK 14 race test catches the old bug only about 1 run in 3:** The rewritten race test passes with the fix, but on the old code it failed in only 1 of 3 tries, so it would catch the bug coming back only some of the time. Accept keeps it as an occasional guard. Fix now adds a task to make it fail every time, either by starting more runs at once (it already takes about 100 s) or by adding a test-only hook to the lock script that forces the race. Stop hands the run over. Which do you want, and if Fix now, which way?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — This is a trade the plan does not make: test run time versus a test-only hook in a shipped script versus a guard that only sometimes fires. That is a judgement for the owner.
Decision: Accept — get this unstuck and moving

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
