Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/860-move-deterministic-bookkeeping-plan.md
Group: 1
Verify attempt: 5

build verify: attempt 5 of 5

## Progress

Problems after each round: 7 → 4 → 3 → 2 → 3
Code changed: yes
Strategy: FINAL → next FINAL (FINAL already used)
Minutes per round: 46
Trend: closing

**Q1 — Verify:** another fix round? Fewer problems after each round, and the code changed.
Options: A) Try again / B) Decide
Recommended: A) Try again — the last round made progress
Decision: Try again — owner: "Yes"

**Q2 — Task 10 [commands/workflow/status.ts:680-736] issuing an invocation can write into another worktree's log:** The command that issues an invocation id (`status invocation`) accepts a `--file` pointing at a different worktree's `status.jsonl`, and then writes the new invocation row into that other log. The verifier reproduced it: issuing from worktree A with worktree B's file added the row to B, and a later `ledgers append --invocation` from A wrote its engine-call row into B too. That breaks the plan's rule that nothing is written to another worktree. It also lets an id issued in A be tied to B's run, which Task 1's cross-worktree refusal is meant to stop. Accept it as it is, or fix it now by refusing any `--file` outside the issuing checkout before anything is written, with a new test? A fix here closes the next item as well.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — It is a real hole in a rule the plan states outright, and the fix is small (one check before the write plus one test).
Decision: Fix now — owner: "Yes" (new Task 11 in group 1)

**Q3 — Task 1 [commands/lib.ts resolveInvocation] an id issued in one worktree is accepted for another worktree's run:** This is the same root cause as the first item, seen from the other side. `resolveInvocation` only compares the caller's top folder with the receipt's worktree, so an id that was tied to worktree B's run is accepted when used from worktree A. Accept it, or fix it now? Fixing the first item (refusing a `--file` outside the issuing checkout) closes this one too, so no extra work is needed.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — Same fix as the first item; nothing extra to build.
Decision: Fix now — owner: "Yes" (new Task 11 in group 1)

**Q4 — Task 10 [commands/workflow/run-facts.ts:338] new invocation row throws off the step timings:** The new `invocation` row type is not in the list of rows that mark the start of a step (`MARK_ROWS`). So each step that issues an invocation starts its clock at that row instead of at the previous step's row, and reports fewer minutes than it really took. No test covers it. Accept the wrong timings, or fix it now by adding the row type to that list with a test?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — The new row type came from Task 10, so the timing bug is ours, and the fix is one list entry plus one test.
Decision: Fix now — owner: "Yes" (new Task 11 in group 1)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
