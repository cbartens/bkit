Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 10: push lines from .bkit/core/workflows/bkit-ship.md:485,644,746
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship switches the PR conflict check off for every push`
SOURCE — TASK 11: push lines from .bkit/core/workflows/bkit-debug.md:649,680,752,792
WROTE — TASK 11: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `debug switches the PR conflict check off for every feature-branch push`
SOURCE — TASK 12: harness helpers from .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1578
WROTE — TASK 12: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `shallow clone → no base fetch, warns, gates run`
