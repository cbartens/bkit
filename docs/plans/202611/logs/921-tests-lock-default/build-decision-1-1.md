Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 9
Plan: docs/plans/202611/921-tests-lock-default-plan.md
Group: 1
Verify attempt: 1

**Q1 — Task 1 [machine-lock.integration.test.ts: a set BKIT_TEST_SLOTS overrides the core-count default both ways]:** One of the six new tests for the lock script fails because of a mistake in the test itself, not in the script. The test starts a holder with 1 slot and never stops it, then expects three more holders to fit in 3 slots, so the third one waits and gives up. The fix is to stop the first holder before the 3-slot half of the test. Should I rewrite that test now (a new fix task, written test-first), so the script change can be proven? Answering yes rewrites it; the alternative is to accept the failing test as is.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — The script already matches the plan and the other 73 tests pass; only this test's setup is wrong, and a test that cannot pass proves nothing about the override.

Decision: Fix now — Yes, fix now
Fix task: 5

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
