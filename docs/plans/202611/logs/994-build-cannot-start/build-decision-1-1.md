Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/994-build-cannot-start-plan.md

**Q1 — Task 6 [.bkit/core/engine/commands/workflow/branches.ts:605]:** When a resumed build has edited its own plan file (for example ticking two tasks) and dev changed a line next to one of those edits, the rebase now replaces the whole file with dev's copy. The build's other edits to that file are lost too, even the ones that did not conflict, and the command still reports success. The owner decision of 2026-11-17 covers files that exist on both sides; it does not say whether build-phase edits may be thrown away. Which should happen: (a) keep the branch's differing copy aside, as the worktree setup already does for leftover logs (dropped-logs/), and name it in the log; (b) narrow the rule so only files the plan close already landed take dev's copy, and build-phase edits still stop the rebase; or (c) merge the file so only the conflicting lines take dev's side?
A) Accept — the loss of build-phase plan edits is recorded as accepted and the build moves on to the tests gate
B) Fix now — one more fix round runs to the owner's chosen direction (a, b or c) before the build moves on
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — The choice between keeping a copy aside, narrowing the rule, or merging lines changes what the owner decision of 2026-11-17 means; only the owner can widen or narrow that decision.
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Fix now — direction (a): keep the rebase target's copy and keep a differing branch copy aside the way carryLeftovers does (dropped-logs/{time}/, never deleted, named in the log line), reusing that code path, no second mechanism; the run does not stop. Answered by the orchestrator under the run's away policy from the owner's decision row 994-build-keeps-dev-copy-of-plan-logs, not typed by the owner.
Fix task: 6

Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.
