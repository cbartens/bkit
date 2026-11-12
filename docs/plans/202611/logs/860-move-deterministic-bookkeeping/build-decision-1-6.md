Status: DECIDED
Question: UNPROVEN
From: summary
Pause step: 15
Plan: docs/plans/202611/860-move-deterministic-bookkeeping-plan.md

**Q1 — Task 3 — distinguishes unreadable missing malformed and clean ledger coverage without writing:** This test was written first and recorded as failing, then a later group (group 8) changed it when `ledgers query` renamed its `complete` status to `clean`. Re-recording it afterwards showed it already passes, so nothing proves it would have caught the bug it was written for. The code it covers is checked by the other tests and the full run passed. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — The change was a one-word rename forced by group 8; the full suite passes with it.
Decision: Accept — yes (owner, takes the recommendation)

**Q2 — Task 9 — installs and upgrades fresh consumers with deterministic bookkeeping contracts:** Same cause as Task 3: group 8's `complete` to `clean` rename edited this test after it was recorded failing, and the re-record shows it already passes. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — One-word rename forced by group 8; the install and upgrade checks run in the full suite, which passed.
Decision: Accept — yes (owner, takes the recommendation)

**Q3 — Task 14 — resolves a pending ledger intent after its invocation is stale:** This test was re-recorded when a later group changed where ledger intents are stored (Task 23). The re-record shows it already passes, so it no longer proves it would have caught the original bug. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — Group 7 moved the storage location; the test still exercises the stale-invocation path and passes in the full run.
Decision: Accept — yes (owner, takes the recommendation)

**Q4 — Task 17 — refuses to re-append a partly landed block after a foreign writer appended:** Same cause as Task 14: group 7 moved where ledger intents are stored, the test was repointed and re-recorded, and the re-record shows it already passes. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — Group 7 moved the storage location; the test still exercises the foreign-writer path and passes in the full run.
Decision: Accept — yes (owner, takes the recommendation)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
