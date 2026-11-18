Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/1035-ledger-commit-outbox-plan.md

**Q1 — Task 8 (`.bkit/core/engine/commands/workflow/ledgers.ts:2380`):** The new folder-name check guards only the three commands this build changed. Five other commands still pass an unchecked FID into the same two shared functions: the merge gate (which could then count a source change as bookkeeping-only) and the handover, close and land paths (which could sweep the whole tree into a commit pushed to dev). The build planned the check per command and listed other commands as out of scope, so no agent can widen it alone. Which way should it go?
A) Accept — the gap is recorded as accepted and the build moves on; the five other commands keep taking an unchecked FID, and the helper's comment that calls it the check every bookkeeping path is built from stays wrong
B) Fix now — one more fix round runs, shaped by your direction: (a) move the check into the two shared functions `commitBookkeeping` and `checkOnlyBookkeeping` in `ledgers.ts`, letting only the CI hook's internal `*` month through, so every caller is covered; or (b) keep the check per command and add `monthAndFid` to `runs gate`, `runs revalidate`, `workflows handover`, `workflows fail`, `workflows close` and `branches land`
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — It widens the build past the plan's Out of Scope row and picks where the check lives for every bookkeeping caller, which is a design choice for the owner
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Fix now — B, direction (a): move the check into commitBookkeeping and checkOnlyBookkeeping, reuse monthAndFid, only the CI hook's * month let through (orchestrator's assumption while the owner is away; the owner can overturn it)
Fix task: 8

Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.
