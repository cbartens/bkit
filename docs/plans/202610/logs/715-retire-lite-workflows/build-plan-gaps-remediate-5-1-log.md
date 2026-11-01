Verdict: CONCERNS
Strategy: STANDARD
Fixed: 0

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap 1: TASK 11 `derives held from a workflow-done row ending held` no-red — red file holds only vitest "No test files found" (vitest include skips .mjs); order evidence cannot be created honestly; needs owner TEST EXCEPTION or `Decision: Accept`
BLOCKED — Gap 3: TASK 11 `counts held runs in the workflow report` no-red — same reason as Gap 1
BLOCKED — Gap 5: TASK 11 `keeps a normal done run as done` no-red — same reason as Gap 1; no red possible against old code (guard test)
BLOCKED — Gap 2: TASK 11 `derives held from a workflow-done row ending held` not-green — passes under `node scripts/harvest/bkit-harvest.test.mjs` (60/60); green tool runs vitest only; fix is a plan TEST EXCEPTION naming `pnpm test:harvest` (owner-only) or harness work outside #715
BLOCKED — Gap 4: TASK 11 `counts held runs in the workflow report` not-green — same reason as Gap 2
BLOCKED — Gap 6: TASK 11 `keeps a normal done run as done` not-green — same reason as Gap 2
