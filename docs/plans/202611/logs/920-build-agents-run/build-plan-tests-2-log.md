Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 3: exit-80 sub-list from .bkit/core/workflows/bkit-ship.md:350
SOURCE — TASK 4: debug-failure-reproduce run step from .bkit/core/prompts/bkit-debug-failure-reproduce.md:73
SOURCE — TASK 5: local-tests-first text from .bkit/instructions.md:1670
WROTE — TASK 3: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm stops on a cancelled, action-required or stale check without naming /bkit-debug`
WROTE — TASK 4: `.bkit/core/engine/tools/instructions.test.ts` `every debug prompt that runs tests by file or name filter carries local-pre-commit`
WROTE — TASK 5: `.bkit/core/engine/tools/instructions.test.ts` `local-tests-first does not ask for the full local suite that local-pre-commit forbids while working`
