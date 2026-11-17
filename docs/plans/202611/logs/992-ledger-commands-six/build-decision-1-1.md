Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/992-ledger-commands-six-plan.md

**Q1 — Task 5 [`.bkit/core/engine/commands/workflow/ledgers.ts:1841`]:** The new replay check (task 2) says "nothing recorded" whenever an operation's rows are not at the exact byte position its receipt stored. Two normal events move rows that were recorded. First, a rebase of the union-merged ledgers can put other rows ahead of ours: the bytes are intact, only shifted. Second, `bkit ledgers compact` or harvest can rewrite or remove the rows. In both cases the refusal is wrong, and a retry under a new operation id writes the row a second time. The shifted case has a mechanical fix: look for the block anywhere in the file. The compacted case needs a contract choice: match the receipt by row key and timestamp; have compaction and harvest update the receipts they touch; or keep the refusal but stop claiming "nothing recorded". The challenge merge folded both findings into task 5. Task 5 carries the shifted-case fix and test, and it is marked not fixable. Decide whether to fix task 5 now (say which remedy covers the compacted case, or that only the shifted case is fixed now), accept it as built, or stop the run here.
A) Accept — task 5 is recorded as accepted and ticked; the replay check ships as built, so a moved or compacted row is still refused as "nothing recorded"; the build moves on to the full test run
B) Fix now — task 5 is rewritten to your direction, its test is written and recorded failing first, then the fix is written; a second challenge round reviews it before the full test run
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — The challenge reviewer marked the compacted-row case architectural: each remedy changes the replay contract written in `docs/architecture.md:220` and `.bkit/core/.bkit/jsonl.md:62`, and which contract bkit keeps is the owner's call, not an agent's.
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Fix now — B) Fix now: on rows moved by a rebase, return the stored receipt with replayed: true when the exact block is anywhere in the ledger file; on rows rewritten or removed by compaction or harvest, keep the refusal but its message says the operation was recorded earlier, the ledger no longer holds its rows, and the caller must not retry under a new operation id; no change to compact or harvest, no row-key matching, no second lookup path (orchestrator, under the owner's instruction)
Fix task: 5

Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.
