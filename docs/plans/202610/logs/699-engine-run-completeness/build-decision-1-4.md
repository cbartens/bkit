Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202610/699-engine-run-completeness-plan.md
Group: 4
Verify attempt: 1

build verify: attempt 1 of 2

## Progress

Problems after each round: 6
Code changed: unknown
Strategy: none → next STANDARD
Minutes per round: unknown
Trend: first-round

**Q1 — Verify:** another fix round? This was the first round, so there is no trend yet.
Options: A) Try again / B) Decide
Recommended: A) Try again — the last round made progress
Decision: Decide — accept all, same reasons

**Q2 — TASK 8 [.bkit/core/engine/checks/status-holes.test.ts] charges calls below a step's finish line to that step — test-changed:** The helper that builds this test's fake run (`replay`) was rewritten after the test was seen failing. Before, it wrote one row per step. Now it writes one row per key of each group of steps, because the old shape made every workflow look holey: a step that writes no row of its own has to be folded into the next step that does. The test's own lines only changed in line-wrapping. The reviewer could not tell whether the rewrite is a fair correction or loosens the test. Accept the edited test as it is? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test that changed after its red; no agent may.
Decision: Accept — accept all, same reasons

**Q3 — TASK 8 [.bkit/core/engine/checks/status-holes.test.ts] reports an untaken route arm as unexercised — test-changed:** An assertion in this test was weakened after it was seen failing. It used to demand that no unexercised call remains once every route arm is taken; it now only demands that the one `counters route` call leaves the list. The reviewer found why: with every arm taken, build still lists `branches push` in `build-create-pr` as unexercised, so the original assertion would fail on today's code. Accepting means that known case stays unpinned by this test. Accept the edited test as it is? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test that changed after its red; no agent may.
Decision: Accept — accept all, same reasons

**Q4 — TASK 9 [.bkit/core/engine/checks/status-holes.test.ts] gives a pre-journal run a steps-only verdict — no-red:** This test passes but was never seen failing first. Task 8's single `check()` function already held the pre-journal handling, so no stub could fail it first. Accept this as a test-first exception? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a missing red; no agent may.
Decision: Accept — accept all, same reasons

**Q5 — TASK 9 [.bkit/core/engine/checks/status-holes.test.ts] names a call no contract step owns — no-red:** This test passes but was never seen failing first, because Task 8's `check()` already reported unattributable calls. Accept this as a test-first exception? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a missing red; no agent may.
Decision: Accept — accept all, same reasons

**Q6 — TASK 9 [.bkit/core/engine/checks/status-holes.test.ts] excludes its own journaled call — no-red:** This test passes but was never seen failing first, because Task 8's `check()` already left out the checker's own journaled call. Accept this as a test-first exception? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a missing red; no agent may.
Decision: Accept — accept all, same reasons

**Q7 — TASK 9 [.bkit/core/engine/checks/status-holes.test.ts] reports a hole in a long-closed run with no baseline — no-red:** This test passes but was never seen failing first, because Task 8's `check()` already handled a run with no baseline. Accept this as a test-first exception? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a missing red; no agent may.
Decision: Accept — accept all, same reasons

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
