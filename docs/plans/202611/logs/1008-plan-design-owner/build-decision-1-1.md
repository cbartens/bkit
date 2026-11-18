Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/1008-plan-design-owner-plan.md
Group: 1
Verify attempt: 2
Source changed: false

build verify: attempt 2 of 2

## Progress

Problems after each round: 2 → 2
Group gate failures after each round: 0 → 0
Code changed: yes
Strategy: STANDARD → next STANDARD
Minutes per round: 11
Trend: stuck

**Q1 — Verify:** decide the items below instead of another round? The count did not fall between the first and the last round (2 → 2).
A) Try again — one more fix round runs
B) Decide — the questions below are asked instead of another round
Recommended: B) Decide — another round is unlikely to close the remaining items
Default if unanswered: the run waits for you; taken as B when nobody can be asked
Decision: Decide — recommended; applied without asking (LOCAL)

**Q2 — Task 3:** One new test checks the wrong thing at its very end: it expects the last row of the status file to be the run's start row, but posting a comment rightly adds another row after it. The code is correct, and only the step that writes tests may change a planned test. Should one more fix round rewrite that last check so it proves the run is still in progress?
A) Fix now — a new task hands the test back to the tests step, which rewrites its last check to read the folded run's status, then the code step confirms it passes
B) Accept — the test is recorded as accepted and keeps failing, so the full test run at Step 12 goes red
Recommended: A) Fix now — The failing check is a mistake in the test, not the code; left as it is, the integration test file fails at Step 12, and the code step is not allowed to change the test (`.bkit/core/engine/commands/workflow/tracker.integration.test.ts:800`; last BLOCKED reason: a keyed post legitimately appends an engine-action row, so the tests step must assert the folded run status or no close row instead).
Default if unanswered: the run waits for you; taken as A when nobody can be asked
Decision: Fix now — recommended; applied without asking (LOCAL)
Fix task: 7

**Q3 — Task 4:** The generated code map in `docs/capabilities.md` still does not match the code after the first fix round refreshed it. Should one more fix round refresh it again from the committed code and confirm the check passes?
A) Fix now — one more fix round re-runs `pnpm bkit:graph:refresh` on the committed engine edits, commits `docs/capabilities.md` and `DETAILS.md`, and confirms `pnpm bkit:graph:check` passes
B) Accept — the stale map is recorded as accepted; `pnpm bkit:graph:check` keeps failing and a later gate goes red
Recommended: A) Fix now — A stale map fails `pnpm bkit:graph:check`, and the fix is mechanical: the committed map keeps an edge from `tracker.ts` to `shared/json` that the code no longer has.
Default if unanswered: the run waits for you; taken as A when nobody can be asked

Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.
Or say "one by one" and I'll ask them one at a time.
Decision: Fix now — recommended; applied without asking (LOCAL)
Fix task: 7

The owner is away: the v6.3 orchestrator assumed each recommendation (Q1 Decide, Q2 Fix now, Q3 Fix now) on the owner's behalf.
