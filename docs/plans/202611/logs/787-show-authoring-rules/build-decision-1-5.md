Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/787-show-authoring-rules-plan.md
Holistic attempt: 1

**Q1 — Task 1 [guardrails-cursor.integration.test.ts] Limit test no longer matches the shell introduction:** The holistic fixes are done, but one old recorded test blocks the step from finishing: 'stops analysis at each internal bound'. When it was recorded, it expected a command that edits 70 files to name every kept file, including src/f63.ts. Task 12's size fix changed the shell introduction to name only about 200 characters of targets plus 'and N more', so that test was already adjusted to the new wording in an earlier round, and the engine now refuses the change because only the tests step may edit a recorded test. Putting the old text back would make the suite fail. Let the tests step re-record that one test with the current, intended wording, and change nothing else?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Re-recording a test needs the owner's go-ahead; Accept would leave the step unable to finish.
Decision: Fix now — owner chose "Fix now": the tests step re-records only this test with the current wording; the hook code stays as is.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
