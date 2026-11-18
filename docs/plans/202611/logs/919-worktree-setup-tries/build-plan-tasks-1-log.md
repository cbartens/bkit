Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: worktrees setup adopts the session checkout for every workflow — mint is now `worktrees && session !== target`; adopted mode uses the session's top level; both test files pass, 157 tests (.bkit/core/engine/commands/workflow/worktrees.ts)
DONE — TASK 2: Rebuild engine output — pnpm build ran, grep count 0 (dist/commands/workflow/worktrees.js)
DONE — TASK 3: Docs — adopted row edited in source .bkit/core/.bkit/workflows.md and docs/testing.md row; installed .bkit/workflows.md not hand-edited, the orchestrator re-renders it with upgrade at the end
