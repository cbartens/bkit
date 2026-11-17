Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/787-show-authoring-rules-plan.md
Group: 3
Verify attempt: 4

**Q1 — Task 13 [core.integration.test.ts] Upgrade test counts a file name twice:** The new upgrade test for Task 13 fails even though the upgrade now works. It counts how many times the text 'bkit-gateguard.cjs' appears in Claude's hook list and expects 1, but Claude's one correct hook command names that file twice (a 'test -f' check and the 'node' call), so the count is always 2. The code checks out: the new matchers arrive, the consumer's own hook groups and permissions survive, each host ends with one GateGuard entry, and a second install changes nothing. Only the test's counting is wrong, and the fix step is not allowed to rewrite a recorded test. Send the test back to the tests step to count hook entries instead of text matches, as was done for Task 7?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Fixing needs the owner to allow a recorded test to be rewritten; Accept would leave a failing test in the group; no agent can grant that.
Decision: Fix now — owner chose "Fix the test": the tests step corrects only the counting assertion (same test name); the merge code stays untouched.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
