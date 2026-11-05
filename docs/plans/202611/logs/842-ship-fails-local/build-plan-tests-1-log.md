Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 1: sync head/basePath and pending exit 24 from .bkit/core/engine/commands/workflow/branches.ts:2351; tests select the new opt-in --reconcile-feature contract.
SOURCE — TASK 1: real bare-origin ref and object content from Git subprocesses in the existing fixtures at .bkit/core/engine/commands/workflow/branches.test.ts:203 and .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:96.
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `fetches the unseen feature head before classifying the base`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `fast forwards the feature before either base path is chosen`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `merges divergent feature tips without rebasing either side`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `continues the feature merge before starting a dev merge`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `publishes local code with a CI running head before bookkeeping`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses feature reconciliation without losing work when fetch or merge fails`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `reconciles cloud and laptop feature commits through the command boundary`
SOURCE — TASK 2: ship setup mode, branch and refusal exit 7 from .bkit/core/engine/commands/workflow/worktrees.ts:59 and .bkit/core/engine/commands/workflow/worktrees.ts:903.
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/worktrees.test.ts` `fetches a remote only ship branch before adopting it`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/worktrees.test.ts` `refuses inherited unpublished dev commits in every ship mode`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/worktrees.test.ts` `names inherited commits and ship recovery in the refusal`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses remote feature work that imports unpublished local dev ancestry`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/branches.test.ts` `rechecks inherited dev work when a retry observes a new feature candidate`
SOURCE — TASK 3: GitHub PR state, baseRefName, headRefName, headRefOid and mergeCommit from .bkit/core/engine/commands/workflow/prs.ts:94 and the existing real-subprocess fixture in .bkit/core/engine/commands/workflow/prs.test.ts:94. New opt-in contracts: prs probe --ship-entry; MCP input --facts-file with --owner-repo and envelope {ownerRepo, headRefName, baseRefName, pr}.
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/prs.test.ts` `does not adopt a merged PR when the feature has newer work`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/prs.test.ts` `refuses merged entry when current feature evidence cannot be read`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/prs.test.ts` `qualifies MCP merged PR facts against newer feature work without gh`
SOURCE — TASK 4: ship close output worktree fields from .bkit/core/engine/commands/workflow/worktrees.ts:684 and close landing/lock release from .bkit/core/engine/commands/workflow/workflows.ts:1556; existing landed comparison signature notOnDev(root, branch): string[] from .bkit/core/engine/commands/workflow/branches.ts:2893 moves to the worktree module.
SOURCE — TASK 4: the declared-gate fixture comes from vitest.gate-fixture.ts:35; executable and symlink modes and object identities are read from actual git ls-tree/rev-parse, and race injections mutate only temporary refs through real Git.
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves newer feature work when closing an already merged PR`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves unlanded file deletions and ledger additions on close`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves dirty work and uncertain branch evidence during close`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves a local feature ref changed after its cleanup proof`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `keeps a newer remote feature tip while closing the landed local tip`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/branches.test.ts` `preserves unlanded executable bit changes in the shared landed comparison`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/branches.test.ts` `preserves unlanded file type changes in the shared landed comparison`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/branches.test.ts` `uses tree entry equivalence for design and plan land cleanup`
