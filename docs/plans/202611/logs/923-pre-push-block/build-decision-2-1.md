Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/923-pre-push-block-plan.md

**Q1 — Task 10 (.bkit/core/workflows/bkit-ship.md:644):** Ship's late pushes can be blocked by the new check when dev moved during the run. Suppose another PR lands on dev while /bkit-ship is in Steps 5-7 and adds a row to a shared ledger file. Ship's own Step 8 bookkeeping push and its Step 10 regenerate push still run the PR conflict check, so the push is blocked and ship fails. Without the check, ship would reach its Step 10 merge gate, notice dev moved, and go back to Step 3 / Step 4 to merge dev in, which it already knows how to do. You decided earlier that the off switch goes only on pushes before Step 4. Do you accept this risk as it is, have it fixed now (for example: switch the check off on those two pushes too, and let the merge gate handle a moved dev; or keep it on and send a block back to Step 3 / Step 4 instead of failing), or stop the run?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — It reverses or narrows your earlier decision that the switch is set only on pushes before Step 4, so only you can choose.
Fix task: 10
Decision: Fix now — fix all with flag that require it

**Q2 — Task 11 (.bkit/core/workflows/bkit-debug.md:649):** Debug's pushes to a branch that already has a PR can now be blocked, and the fix can be stranded. When /bkit-debug fixes a red PR and dev gains a ledger row in the meantime that collides with debug's own ledger rows, its Step 9 fix push is blocked and debug fails. Its handover never pushes to a branch with an open PR, so the fix commits stay only in the local worktree and are lost when a cloud sandbox ends. Before this change the push landed and only the CI start failed. Do you accept this as it is, have it fixed now (for example: switch the check off on debug's fix and summary pushes; or on a block, name /bkit-ship as the next step; or push the commits to a side branch), or stop the run?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Task 5 scoped the off switch to ship alone, and each option trades a stranded fix against a PR whose CI never starts, so only you can choose.
Fix task: 11
Decision: Fix now — fix all with flag that require it

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
