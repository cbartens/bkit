Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 5: Normal debug remediation counts across runs via debug-failure-remediate:next --all-runs in .bkit/core/workflows/bkit-debug.md:351.
SOURCE — TASK 5: Soak completions save soakAttempt from debug-failure-soak:next:all while their ordinary attempt tracks the current debug-run-tests round in .bkit/core/workflows/bkit-debug.md:552.
SOURCE — TASK 5: stepProgress currently prefers the row-local attempt over round, reads saved soakAttempt through runOrStepField, and scopes prior rows to the latest run in .bkit/core/engine/commands/workflow/steps.ts:481. Exact expected transitions are in build-brief-tests-3-1.md.
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress normal debug attempts span runs`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress reuses saved soak counter on later completions`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress challenge budget follows round rather than report attempt`
SOURCE — TASK 5: Targeted lint exited 0. A targeted Vitest run selected only these three Integration tests: each command completed with exit 0, then each test failed on its expected progress string. The other nine existing tests were excluded by the name filter. The caller owns the authoritative tests red record.
