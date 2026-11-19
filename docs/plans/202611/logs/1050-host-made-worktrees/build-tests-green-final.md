Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1050-host-made-worktrees-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/lib.test.ts` "a host-made linked worktree holds the run" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "refuses design, plan and build in place in a submodule's main checkout on feat/{fid}" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "debug in place on dev from a linked worktree records its own checkout" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "refuses plan from a host-made worktree whose branch carries unpushed dev work" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "says so when the adopted worktree has no hooks directory" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "does not report a ~ hooks directory that exists" | red | passed |

## Gaps

None.
