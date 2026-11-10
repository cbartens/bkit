Verdict: PASS
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: runless audit/utility `ledgers append --correction-of` and standalone rejection scope — standalone invocations now carry a correction scope (`standalone` + `declaredStep`) and keep their correction events in `<outbox>/invocation-context/<id>.corrections.jsonl` beside the receipt; two-retry budget unchanged; tests added in ledgers.test.ts (.bkit/core/engine/commands/workflow/ledgers.ts)
DONE — Gap 2: `ci-handoff`, `correction-rejected`, `correction-candidate`, `correction-succeeded` added to `MARK_ROWS`; test added in run-facts.test.ts (.bkit/core/engine/commands/workflow/run-facts.ts)
