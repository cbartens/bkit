Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 1: Real branch validation and adoption use git check-ref-format and exact git refs; existing debug rejects --branch in .bkit/core/engine/commands/workflow/worktrees.ts:846
SOURCE — TASK 1: Existing temp-repository, git, run and worktreeDir fixtures from .bkit/core/engine/commands/workflow/worktrees.test.ts:24 and .bkit/core/engine/commands/workflow/branches.test.ts:45
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `parses explicit and existing branch tokens without consuming URLs`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/branches.test.ts` `rejects missing explicit and ambiguous existing branch selections`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/worktrees.test.ts` `adopts a requested debug branch without mutating conflicting worktrees`
SOURCE — TASK 2: Configured workflow is bkit.testing.ciWorkflow from .bkit/core/engine/shared/settings.ts:364; ciDeclared reads its on-disk path in .bkit/core/engine/commands/workflow/runs.ts:102
SOURCE — TASK 2: GitHub workflow runs use total_count/workflow_runs and id/head_sha/conclusion/html_url in .bkit/core/engine/commands/workflow/runs.ts:664 and :924; paginated jobs use total_count/jobs and --paginate --slurp in :781
SOURCE — TASK 2: Atomic workflow-meta is folded with Object.assign in .bkit/core/engine/ledgers/status.ts:124; selected run attempt, workflow identity, repository and fallback validation follow docs/plans/202611/830-debug-diagnose-named-plan.md:45
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/runs.test.ts` `locates CI evidence using prompt saved issue and local precedence`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects ambiguous cross-repository and malformed attempt references`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/runs.test.ts` `filters branch and PR discovery by configured workflow and exact head`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/runs.test.ts` `freezes explicit workflow run attempt and all failed job pages`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/runs.test.ts` `validates branch fork ancestor divergent and unavailable ancestry evidence`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/runs.test.ts` `distinguishes proven automatic no-red from explicit non-red and unavailable lookup`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/runs.test.ts` `validates normalized fallback evidence against the requested identity`
WROTE — TASK 2: `.bkit/core/engine/ledgers/status.test.ts` `validates atomic CI and local selections with stable evidence identities`
