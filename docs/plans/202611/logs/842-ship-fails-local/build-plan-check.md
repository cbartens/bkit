Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/842-ship-fails-local-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Reconcile feature work and preserve unpublished changes | 4 | 23 | 10.4 |
| 2 | Revalidate concurrent changes and route refusals safely | 4 | 13 | 8.3 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 7 | 2 |
| 2 | 1 | 5 | 2 |
| 3 | 1 | 3 | 1 |
| 4 | 1 | 8 | 3 |
| 5 | 2 | 4 | 1 |
| 6 | 2 | 4 | 1 |
| 7 | 2 | 5 | 1 |
| 8 | 2 | 0 | 0 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/842-ship-fails-local-plan.md:379` TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "fetches the unseen feature head before classifying the base" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:379` TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "fast forwards the feature before either base path is chosen" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:379` TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "merges divergent feature tips without rebasing either side" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:379` TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "continues the feature merge before starting a dev merge" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:379` TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "publishes local code with a CI running head before bookkeeping" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:379` TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "refuses feature reconciliation without losing work when fetch or merge fails" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:379` TASK 1: `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` already holds a test named "reconciles cloud and laptop feature commits through the command boundary" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:399` TASK 2: `.bkit/core/engine/commands/workflow/worktrees.test.ts` already holds a test named "fetches a remote only ship branch before adopting it" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:399` TASK 2: `.bkit/core/engine/commands/workflow/worktrees.test.ts` already holds a test named "refuses inherited unpublished dev commits in every ship mode" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:399` TASK 2: `.bkit/core/engine/commands/workflow/worktrees.test.ts` already holds a test named "names inherited commits and ship recovery in the refusal" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:399` TASK 2: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "refuses remote feature work that imports unpublished local dev ancestry" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:399` TASK 2: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "rechecks inherited dev work when a retry observes a new feature candidate" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:415` TASK 3: `.bkit/core/engine/commands/workflow/prs.test.ts` already holds a test named "does not adopt a merged PR when the feature has newer work" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:415` TASK 3: `.bkit/core/engine/commands/workflow/prs.test.ts` already holds a test named "refuses merged entry when current feature evidence cannot be read" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:415` TASK 3: `.bkit/core/engine/commands/workflow/prs.test.ts` already holds a test named "qualifies MCP merged PR facts against newer feature work without gh" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "preserves newer feature work when closing an already merged PR" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "preserves unlanded file deletions and ledger additions on close" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "preserves dirty work and uncertain branch evidence during close" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` already holds a test named "keeps a newer remote feature tip while closing the landed local tip" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "preserves a local feature ref changed after its cleanup proof" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "preserves unlanded executable bit changes in the shared landed comparison" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "preserves unlanded file type changes in the shared landed comparison" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/842-ship-fails-local-plan.md:434` TASK 4: `.bkit/core/engine/commands/workflow/branches.test.ts` already holds a test named "uses tree entry equivalence for design and plan land cleanup" — name the update to it in TEST FIRST, or give the new test a new name
