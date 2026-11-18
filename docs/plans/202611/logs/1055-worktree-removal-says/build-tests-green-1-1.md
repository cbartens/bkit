Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1055-worktree-removal-says-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "a later dev commit on the same file does not turn a landed branch back into unlanded" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "names only the file whose branch version never reached dev" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "a deleted file that dev deleted and a later commit re-added counts as landed" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "removes the worktree and local branch when a later dev commit changed the branch's file" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "deletes the remote branch when a later dev commit changed the branch's file" | red | passed |

## Gaps

None.
