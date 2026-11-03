Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log
DONE — TASK 1: Work out a run progress line — all 40 step-table unit tests pass, including nine planned progress cases (.bkit/core/engine/commands/workflow/step-table.ts)
BLOCKED — TASK 2: test `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress excludes noncompletions` — line 560 expects zero engine-call rows for malformed-status; the existing dispatcher skips malformed lines when resolving the active run and journals one normal engine-call before validation (commands/lib.ts:369-379,478-486), as the plan requires. Completion rows and commits remain unchanged; planned test and journaling are preserved.
BLOCKED — TASK 2: Required changed checks — related: 3381 passed, 2 existing skips, 1 known journal-contract assertion failed; named: 6237 passed, the same assertion failed. Source lint and typecheck passed. Formatting found counters.ts and was corrected and rechecked. Generation passed 273 render tests. Built CLI dogfood passed on tmp/progress-dogfood-X2BTob with one completion and no persisted progressLine.
