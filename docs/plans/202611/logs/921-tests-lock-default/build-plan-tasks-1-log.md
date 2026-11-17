Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 2: Pin one slot in the tests that expect a second run to wait — BKIT_TEST_SLOTS=1 in tests-lock base env and the exit-81 push; both files pass (.bkit/core/engine/commands/workflow/)
BLOCKED — TASK 1: test `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` — the "override one" holder (slots 1) is never released, so three more holders at slots=3 find slot 0 taken and "three c" waits; the test needs 4 holders on 3 slots. Script change is done and the other 73 tests pass; cmp of the copy is identical
DONE — TASK 1: Work out the default slot count from the core count — script copy identical (cmp), machine-lock test file 74/74 pass (.bkit/templates/scripts/ci/bkit-machine-lock.sh)
DONE — TASK 5: Release the first holder before the three-slot half of the override test — test releases the holder before the three-slot half; file passes 74/74 (.bkit/core/engine/audits/templates/machine-lock.integration.test.ts)
