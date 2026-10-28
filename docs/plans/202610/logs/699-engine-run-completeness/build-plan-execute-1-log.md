Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: Make both MARK_ROWS copies skip the two new row types — red recorded for run-facts test; harvest test not runnable via bkit tests red (vitest does not include .mjs; red not enforced, confirmed failing via pnpm test:harvest); both copies updated, parity test tolerates trailing comma, harvest 57/57, vitest green (run-facts.ts, bkit-harvest.mjs, bkit-harvest.test.mjs, run-facts.test.ts)
BLOCKED — TASK 2: Audit the remaining readers and document both row types — red refused as passed: "ignores a row type it does not know" passes because fold/readStatusRows/runStatusRows already ignore unknown row types; no code to undo, docs/install steps not started
