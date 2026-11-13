Status: DECIDED
Question: UNPROVEN
From: summary
Pause step: 15
Plan: docs/plans/202611/787-show-authoring-rules-plan.md

**Q1 — TASK 3 — stops analysis at each internal bound:** This test checks that when the shell checker hits one of its size or depth limits, it stops, gives the limit as the reason, and keeps the targets it had already found. It already passed before task 3's code was written, so nothing shows it would catch that bug. Accepting keeps the test as it is with no proof it can fail. Stopping ends the run here so the test can be reworked. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — The test passes today and guards the limit behaviour going forward. Why it was already green before the code is not written down; the tests step logged only that it "passes at its red, so it proves nothing".
Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.

**Q2 — TASK 13 — upgrades shipped registrations without dropping consumer hook groups or permissions:** This test runs an upgrade from the shipped hook-registration files plus a consumer's own hook group and permission entry, then checks the new matchers arrive and the consumer's entries survive. It already passed before task 13's code was written, so nothing shows it would catch an upgrade that drops consumer entries. Its sibling test for the merge helper itself did fail first. Accepting keeps it as it is with no proof it can fail. Stopping ends the run here so the test can be reworked. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — The sibling unit test 'merges managed lists while keeping consumer-added entries' was proven red first and covers the same merge rule; this one adds the end-to-end upgrade check.
Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.

**Q3 — TASK 18 — drops an entry the previous template shipped and the current one retired:** This test was meant to check that an upgrade removes a list entry bkit used to ship but no longer does. You already accepted task 18 at decision 7 ('fine leaving it as is and handling retirements when they come up'), so the test was never written and never failed. Accepting records that as the test's exception in the plan. Stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — Matches your earlier decision 7 to leave retirements unhandled for now; this only records it against the test.
Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.

**Q4 — TASK 22 — keeps a shell target eligible after an unverified Cursor edit reminder:** This test was meant to check that after Cursor shows an edit reminder it cannot confirm, a later shell command on the same file still gets its own reminder. You already accepted task 22 at decision 8 (answered 'A)', no reason given), so the test was never written and never failed. Accepting records that as the test's exception in the plan. Stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — Matches your earlier decision 8; this only records it against the test.
Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
