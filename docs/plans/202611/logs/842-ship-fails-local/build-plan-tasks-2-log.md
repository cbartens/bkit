Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log
DONE — TASK 5: Enforce fresh dev ancestry at the pre-merge gate — four planned regressions and all 189 gate/run unit tests pass; fresh local/foreign base evidence and scoped MCP facts refuse stale or unavailable ancestry before CI overrides, with snapshot/refusal records (.bkit/core/engine/commands/workflow/runs.ts)
DONE — TASK 6: Distinguish moved-head and base-conflict merge refusals — all 114 PR unit tests pass; final scoped-identity changes pass 15 merge tests, typecheck and file lint; ship-only independent rereads classify head movement before conflict and preserve generic contracts (.bkit/core/engine/commands/workflow/prs.ts)
NOTE — Shared-instruction lookup returned exit 1 without matches; using the documented instructions-ledger grep alternative. Automatic approval review timed out once for local verification; the identical authorized retry passed.
DONE — TASK 7: Wire reconciliation and bounded retry routes across the ship workflow and resolver — all 331 branch/workflow tests pass, final workflow rerun passes 59/59, typecheck and changed-file lint pass; early publication, scoped MCP decisions, durable feature coverage, bounded retry routes and guarded close are wired. Two additional real Git regressions reproduced and fixed dirty run bookkeeping and missing public target continuation without changing planned tests (.bkit/core/workflows/bkit-ship.md; .bkit/core/prompts/bkit-ship-conflict-resolve.md; .bkit/core/engine/commands/workflow/branches.ts)
BLOCKED — bkit:generate: instructions:sync rejected changed workflow-resume/workflow-exit-0 template shapes and missing local instruction registry entries; build and cli:sync passed, upgrade and renderer regeneration did not run.
HANDOVER — TASK 8: Synchronize documentation, compiled output and provider renders — documentation updates, upgrade/render parity and scratch-consumer dogfood were unstarted at the role turn cap and require a fresh continuation. The separate generation failure remains BLOCKED above. The required tests changed command was still active in session 85655 when handed over and had not returned an outcome.
