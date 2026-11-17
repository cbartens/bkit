Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log
DONE — TASK 1: Reconcile the remote feature branch before base classification and publish code with CI — seven planned unit/integration tests pass; lint and source typecheck pass (.bkit/core/engine/commands/workflow/branches.ts)
DONE — TASK 2: Fetch ship branches during setup and reject inherited unpublished dev work — all five planned unit tests pass; setup and reconciliation share candidate eligibility checks (.bkit/core/engine/commands/workflow/worktrees.ts)
DONE — TASK 3: Qualify the merged-on-entry shortcut against current feature work — three planned regressions and seven generic probe regressions pass, including scoped MCP facts without gh (.bkit/core/engine/commands/workflow/prs.ts)
DONE — TASK 4: Guard ship cleanup with one shared landed-content comparison — eight planned tests pass; existing removal assertions now require dirty-work and remote-ref preservation, and holder reporting remains compatible (.bkit/core/engine/commands/workflow/worktrees.ts)
BLOCKED — bkit:generate: Vitest tests lock exited before readiness (75); another worktree held the machine tests lock beyond 60 seconds after build, CLI sync and upgrade completed.
