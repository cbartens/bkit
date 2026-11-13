Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 9
Plan: docs/plans/202611/916-tests-lock-waiting-plan.md
Group: 4
Verify attempt: 1

**Q1 — TASK 11 race test checks the wrong thing:** The fix for two runs refusing each other on first use is in and works, but its test fails even with the fix, because it treats the normal 'waiting in line' note as a refusal. Should the test be rewritten now so it only fails when a run is truly refused (a non-zero exit or a 'cannot create' / 'File exists' message), with enough runs at once that the old code still fails it?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — Without a working test, nothing guards the race fix against coming back. The rewrite is mechanical: change the final check and raise the runs to the plan's 16, then record it red on the old code before keeping the fix.
Decision: Fix now — B

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
