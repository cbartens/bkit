<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — Task 1 (WS3-T1): Reconciliation note DE-36 appended to docs/decisions.md listing all _*ATTEMPT/MAX*_ sites and confirming prose→shell migration preserves mode-matched semantics (docs/decisions.md)
DONE — Task 2 (WS3-T2): Shell counter bus + MAX*\* config + bats tests — counter-bus.sh (6 helpers), counter-bus-config.sh (7 MAX*\* constants), counter-bus.bats (38 tests all green incl. per-mode DEBUG/NORMAL/SOAK coverage) (scripts/tooling/counter-bus.sh, scripts/tooling/counter-bus-config.sh, scripts/tooling/counter-bus.bats)
DONE — Task 3 (WS3-T3): Staged prose→shell migration complete for bkit-build.md, bkit-debug.md, bkit-ship.md; counter-bus routing blocks inserted; bkit-counter-prose-audit.test.ts (24 tests pass) (.bkit/workflows/bkit-build.md, .bkit/workflows/bkit-debug.md, .bkit/workflows/bkit-ship.md, .bkit/src/bkit-counter-prose-audit.test.ts)
DONE — Task 4 (WS3-T4): Invariant test written and passes — 7 tests assert counters.verifyAttempt == count of plan-verify rows via folded readers (.bkit/src/bkit-telemetry-invariant.test.ts)
