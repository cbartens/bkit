Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/811-publish-dev-refused-plan.md

**Q1 — Task 5 [`.bkit/core/engine/commands/workflow/workflows.ts:1495`]:** A refused ship FAILED flush now publishes its record on the fixed branch `ship-failed/{FID}` through a PR. If an earlier flush for the same FID left that branch on origin (its PR never merged, `gh pr create` failed after the push, or the merged branch was not deleted), the next refused flush cannot push: the branch already holds a commit that is not on `dev`, so the push is rejected and the flush exits 10 with the record kept only in the run's tree, which a cloud runner loses. Decide how a second flush for one FID publishes: accept this as a known limit, fix it now with a direction (for example a branch name per attempt such as `ship-failed/{FID}-{short sha}`, or updating the bkit-owned branch with a lease and reusing its open PR, which is a force push), or stop the run here.
A) Accept — the leftover-branch case is recorded as accepted and the build moves on; a second refused flush for one FID still exits 10
B) Fix now — one more fix round runs before the build moves on, shaped by the direction you give (branch name per attempt, or a lease update of the bkit-owned branch)
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — The choice is between a force push, which the repo's git rules forbid agents to add, and a branch name per attempt, which departs from the fixed `ship-failed/{FID}` name the plan and the brief set; only the owner can trade those off.
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Accept — the orchestrator's answer, assumed on the owner's behalf (2026-11-18), which the owner can overturn: the issue's edge table already gives this case's outcome (branch push or `gh pr create` fails, record kept in the book, exit 10, both reasons logged); the success close's `ship-close/{FID}` push through the same `closePr` has the same limit; a force push is forbidden and a branch per attempt departs from the issue's fixed name; one follow-up issue covers the leftover branch for both `ship-close/{FID}` and `ship-failed/{FID}`.

Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.
