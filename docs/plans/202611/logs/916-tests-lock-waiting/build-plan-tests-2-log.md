Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 6: 6.1.1 fixture bytes and template bytes from tests/fixtures/machine-lock/machine-lock-6.1.1.sh:1 and .bkit/templates/scripts/ci/bkit-machine-lock.sh:1
SOURCE — TASK 6: write shape {path, action:update, unhashed:true} and warn pattern from .bkit/core/engine/install/modules/core.ts:793-820
WROTE — TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `replaces a shipped 6.1.1 machine-lock copy and records the same unhashed write in dry run`
WROTE — TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `preserves an edited machine-lock copy without the queue and reports the template to merge by hand`
WROTE — TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a symlinked machine-lock copy unchanged and reports the template to merge by hand`
