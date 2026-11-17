Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

NOTE: .bkit/ledger-operations.jsonl is absent from tag v6.1.1 (git grep), so no released consumer can hold it; no migration needed.
DONE — TASK 23: Ledger operation intents and receipts moved to <git common dir>/bkit-outbox/ledger-operations/<root hash>.jsonl (0600/0700); pending checks in union, compact, migrate and --correction-of read only that store (.bkit/core/engine/ledgers/status.ts, migrate.ts, commands/workflow/ledgers.ts; docs/observability.md, docs/architecture.md). Old-location tests in migrate.test.ts and journal.integration.test.ts repointed.
DONE — TASK 24: header-bound values refuse CR/LF with exit 6: report/issue/parent in parseAuditResult (also covers the Report: line of issues comment --result-file, which parses via it, exit 2 there) and every judgment in renderResult (steps.ts, issues.ts)
