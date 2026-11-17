Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/842-ship-fails-local-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "fetches the unseen feature head before classifying the base" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "fast forwards the feature before either base path is chosen" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "merges divergent feature tips without rebasing either side" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "continues the feature merge before starting a dev merge" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "publishes local code with a CI running head before bookkeeping" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses feature reconciliation without losing work when fetch or merge fails" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "reconciles cloud and laptop feature commits through the command boundary" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "fetches a remote only ship branch before adopting it" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "refuses inherited unpublished dev commits in every ship mode" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "names inherited commits and ship recovery in the refusal" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses remote feature work that imports unpublished local dev ancestry" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "rechecks inherited dev work when a retry observes a new feature candidate" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/prs.test.ts` "does not adopt a merged PR when the feature has newer work" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/prs.test.ts` "refuses merged entry when current feature evidence cannot be read" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/prs.test.ts` "qualifies MCP merged PR facts against newer feature work without gh" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves newer feature work when closing an already merged PR" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves unlanded file deletions and ledger additions on close" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves dirty work and uncertain branch evidence during close" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "keeps a newer remote feature tip while closing the landed local tip" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves a local feature ref changed after its cleanup proof" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "preserves unlanded executable bit changes in the shared landed comparison" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "preserves unlanded file type changes in the shared landed comparison" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "uses tree entry equivalence for design and plan land cleanup" | red | passed |

## Gaps

- Task 4 `delete-still-referenced` — DELETE `notOnDev` in `.bkit/core/engine/commands/workflow/branches.ts` is still referenced: `.bkit/core/engine/commands/workflow/branches.test.ts:3449`, `.bkit/core/engine/commands/workflow/branches.test.ts:3462`, `.bkit/core/engine/commands/workflow/branches.ts:3148`, `.bkit/core/engine/commands/workflow/branches.ts:78`, `.bkit/core/engine/commands/workflow/worktrees.ts:698`, and 10 more — Fixable: null — log: TASK 4: delete-still-referenced — Fixable: null
