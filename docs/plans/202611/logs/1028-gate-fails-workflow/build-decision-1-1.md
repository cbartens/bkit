Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/1028-gate-fails-workflow-plan.md

**Q1 — Task 5 (`scripts/gate/bkit-text-ceiling.json:3`):** When two branches both change a folder's word total, git cannot merge the record's ceiling line, and the three commands then crash on the conflict markers. Someone has to decide how such a conflict is settled: by a merge rule that adds both sides' changes, or by a fresh owner raise each time. Accept the gap for now, fix it now, or stop?
A) Accept — the conflict risk is recorded as accepted and the build moves on; conflicts on the record are settled by hand at landing
B) Fix now — one more fix round builds the merge rule the owner names before the build moves on
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — The choice decides whether a merge may carry an owner-approved raise forward without a second owner approval, which only the owner can rule on.
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Accept — the orchestrator files a follow-up issue for the merge rule and settles such conflicts by hand at landing (orchestrator, relaying the owner's instruction to keep work going)

**Q2 — Task 7 (`scripts/gate/bkit-text-ceiling.mjs:83`):** `lower` counts the files as they sit on disk, including another agent's uncommitted edits in the same checkout, so it can write a ceiling the committed files then fail. Someone has to decide which version of the files `lower` and `raise` count: the files on disk, the staged files or the last commit. Accept the gap for now, fix it now, or stop?
A) Accept — the gap is recorded as accepted and the build moves on; builds keep running in their own worktrees
B) Fix now — one more fix round makes `lower` and `raise` count the version the owner names before the build moves on
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — It changes the plan's on-disk counting rule, which `check` shares in the pre-push unit tier, so only the owner can change that contract.
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Accept — the same follow-up issue holds which version is counted; builds run in their own worktrees (orchestrator, relaying the owner's instruction to keep work going)

**Q3 — Task 8 (`scripts/gate/bkit-text-ceiling.mjs:153`):** Only the owner is meant to raise a ceiling, but nothing enforces that: the failure message prints the exact `raise` command, any agent can run it from a non-interactive shell (reproduced: it exited 0 and doubled a ceiling on a scratch copy), and any agent can edit the record by hand. Someone has to choose how owner-only is enforced: a confirmation at a real terminal, deny rules on all four hosts, or a check that refuses an increase outside an owner-signed commit. Accept the gap for now, fix it now, or stop?
A) Accept — the gap is recorded as accepted and the build moves on; owner-only stays a written rule, not an enforced one
B) Fix now — one more fix round builds the control the owner names before the build moves on
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — The script has no way to know who the owner is, and each option changes either the Task 2 `raise` test or every host's permission settings, which only the owner can choose.
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Fix now — enforce owner-only with an interactive-terminal confirmation only: raise refuses, writes nothing and exits non-zero unless stdin and stdout are both a TTY; at a terminal it shows old and new ceilings and asks for a typed confirmation; no flag or environment variable skips it; check stops printing a ready-to-paste raise command; tests call the script's own function with a stub confirmation; deny rules, signed-commit checks and hand-edit guards go to a follow-up issue (orchestrator, relaying the owner's instruction to keep work going)
Fix task: 8

Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.
Or say "one by one" and I'll ask them one at a time.
