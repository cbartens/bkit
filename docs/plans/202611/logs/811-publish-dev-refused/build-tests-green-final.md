Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/811-publish-dev-refused-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev publishes the FAILED record through a PR" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with the PR path failing keeps the record and exits 10" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "closePr titles the PR by the record it carries" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev twice for one FID publishes the second record through a PR" | no row | not passed |

## Gaps

- Task 5 `not-green` — the named test "--flush refused by dev twice for one FID publishes the second record through a PR" did not run; the report holds "bkit workflows start > warns when the previous run for this fid was holey", "bkit workflows start > prints nothing when the previous run is clean, absent, or unreadable", "bkit workflows start > takes the lock and opens run 1 with a workflow-started row carrying HEAD", "bkit workflows start > freezes the workflow's own limits from package.json in the workflow-started row", "bkit workflows start > writes no limits for a workflow with no ask point", … — Fixable: true — log: TASK 5: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev twice for one FID publishes the second record through a PR` — not-green — Fixable: true

## Test exceptions

- Task 5 — honoured; cleared the red for `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev twice for one FID publishes the second record through a PR"

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1398ms
     ✓ a close that landed releases the lock 1895ms
     ✓ removes the worktree before it releases the lock 1809ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2571ms
       ✓ closePr refuses when the PR base is unknown 1965ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1623ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 578ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 368ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 915ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 432ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 396ms
     ✓ a second run's record does not let this FID's close commit 462ms
     ✓ record is present after workflows close and before the push 869ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1883ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1598ms
       ✓ a run closed by workflow-failed keeps no parked copy 1753ms
       ✓ a run closed by workflow-done keeps no parked copy 1634ms
       ✓ a FAILED run gets no row 1598ms
       ✓ a DONE run gets no row 1597ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1571ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 309ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 340ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 609ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 500ms
     ✓ puts each --line after the summary, in flag order 481ms
     ✓ --summary prints the file and keeps a copy in --outbox 527ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 519ms

 Test Files  1 passed (1)
      Tests  190 passed (190)
   Start at  13:51:20
   Duration  115.23s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gXp1aC/junit.xml
```
