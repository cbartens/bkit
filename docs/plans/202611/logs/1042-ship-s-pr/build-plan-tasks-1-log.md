Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: Merge a leftover branch tip into the record and reuse its open PR — closePr merges the tip, reuses an open PR; 5 of 6 planned tests pass (workflows.ts, branches.ts, dist/, deferral -1509 CLOSED)
BLOCKED — TASK 1: test `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that changes code` — the test never writes a local ship-failed record into the worktree, so the flush finds nothing to commit and exits 0 before closePr runs; the test cannot reach exit 10 without the engine failing a flush with nothing to land (the outside-paths refusal itself is in closePr)
DONE — TASK 2: Link an unmerged flush handover comment at the pushed commit — closePr returns the pushed SHA, landFailedRecord links close-pr-open at it; both planned tests pass; deferral -830 CLOSED
DONE — TASK 3: Say that ship PR fallback builds on a branch an earlier attempt left — workflows.md source, deployments.md, testing.md updated; 811-leftover decision SUPERSEDED; upgrade re-rendered .bkit/workflows.md
