Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: Bind managed commands to engine-issued invocation context — `status invocation` verb, INVOCATION_FLAG and resolveInvocation (worktree/stale/conflict checks), outbox receipts; invocation-bound calls append no engine-call row (.bkit/core/engine/commands/lib.ts, .bkit/core/engine/commands/workflow/status.ts)
DONE — TASK 2: Complete verified ledger attribution before validation — RowBy modelSource/configuredModel/host with unavailable provenance; ledgers append --invocation fills and conflict-checks by (.bkit/core/engine/ledgers/telemetry.ts, .bkit/core/engine/commands/workflow/ledgers.ts)
DONE — TASK 3: Expose canonical complete ledger reads — queryLedger plus `ledgers query` with filters, snapshot cursors, line diagnostics and coverage (.bkit/core/engine/ledgers/telemetry.ts, .bkit/core/engine/commands/workflow/ledgers.ts)
DONE — TASK 10: Record invocations and invocation-bound engine calls in the run's status log — additive `invocation` row in the run's status.jsonl, receipt rebuilt from it when missing (this checkout only), invocation-bound calls write engine-call into the issuing run's log, docs/observability.md updated (.bkit/core/engine/ledgers/status.ts, .bkit/core/engine/commands/lib.ts, .bkit/core/engine/commands/workflow/status.ts)
