Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202610/715-retire-lite-workflows-plan.md
Group: 3
Verify attempt: 2

build verify: attempt 2 of 2

## Progress

Problems after each round: 10 → 9
Code changed: yes
Strategy: STANDARD → next PIVOT
Minutes per round: 6
Trend: closing

**Q1 — Verify:** another fix round? Fewer problems after each round, and the code changed.
Options: A) Try again / B) Decide
Recommended: A) Try again — the last round made progress
Decision: Try again — Take recs (owner)

**Q2 — TASK 6 `seeds build.publish on install`: red proof missing:** The proof that this test failed before the code was written (a saved snapshot, `build-task-red-3-6-2.snapshot`) was lost because of a numbering slip, so the build cannot show the test-first order for it. The code itself works and the test passes. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test-first order the record cannot prove.
Decision: Accept — accept all as exceptions (owner)

**Q3 — TASK 6 `keeps an existing publish.local false on upgrade`: red proof missing:** Same slip as above: the saved failing-first snapshot `build-task-red-3-6-3.snapshot` is missing, though a combined run in `build-task-red-3-6-4.md` shows all four Task 6 tests failing before the fix. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test-first order the record cannot prove.
Decision: Accept — accept all as exceptions (owner)

**Q4 — TASK 7 `strips the managed block and keeps consumer lines`: test edited after its failing run:** Three extra `expect(...).toBe(SENTINEL)` lines were added inside other planned tests after their failing runs were recorded; they only make the checks stricter, and the tests were shown failing first with them in place. The audit counts any added line as a change. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test edited after its recorded failing run.
Decision: Accept — accept all as exceptions (owner)

**Q5 — TASK 7 `deletes .bkit/lite.md when it holds only the seeded heading`: same added lines:** Same three added stricter-check lines as the previous item, flagged again for this test. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test edited after its recorded failing run.
Decision: Accept — accept all as exceptions (owner)

**Q6 — TASK 7 `merges .agents/shortcuts.md consumer lines into the stub`: same added lines:** Same three added stricter-check lines, flagged again for this test. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test edited after its recorded failing run.
Decision: Accept — accept all as exceptions (owner)

**Q7 — TASK 7 `creates the stub when the shortcuts merge finds no lite.md`: same added lines:** Same three added stricter-check lines, flagged again for this test. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test edited after its recorded failing run.
Decision: Accept — accept all as exceptions (owner)

**Q8 — TASK 7 `leaves a blockless or two-block lite.md untouched and logs`: same added lines:** Same three added stricter-check lines, flagged again for this test. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test edited after its recorded failing run.
Decision: Accept — accept all as exceptions (owner)

**Q9 — TASK 7 `installs no lite.md and still mirrors every other canonical doc`: same added lines:** Same three added stricter-check lines, flagged again for this test. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can vouch for a test edited after its recorded failing run.
Decision: Accept — accept all as exceptions (owner)

**Q10 — TASK 7 `install.integration.test.ts` payload test still fails (`.bkit/lite.md`):** The install no longer writes `.bkit/lite.md`, but the package still ships the source file `.bkit/core/.bkit/lite.md`, so the test `every payload file lands…` fails. Plan task 8 (a later group) deletes that file, but this group's test gate would stay red until then. Should the build add a task to this group that deletes the file and its `manifest.ts` entry now (task 8 then finds it already done), or accept the red test and carry on?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — Accepting leaves the group gate red, so the re-run of this group would fail again; pulling the deletion forward clears it and task 8's edits then reduce to what remains.
Decision: Fix now — Take recs (owner)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
