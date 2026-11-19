Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/994-build-cannot-start-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "classifies only the feature's own plan files as the plan-log shape" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "takes the rebase target's copy of a plan log both sides added, and completes the rebase" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "takes the target's copy in each round when the branch changed the plan log in a later commit" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses another feature's plan log and names the rule in the reason" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses a code conflict beside the plan logs, leaving the plan log unresolved" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "gives a branch not named feat/{fid} no plan-log rule" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "a code conflict beside the plan logs still stops the start, and the reason names the rule" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/branches.test.ts` "does not silently drop a later branch edit to the plan file when dev changed an adjacent line" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/branches.test.ts` "names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one" | red | passed |

## Gaps

None.
