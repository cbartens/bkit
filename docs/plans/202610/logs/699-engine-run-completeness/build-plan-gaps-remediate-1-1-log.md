Verdict: FAIL
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap 1: TASK 1 harvest test no-red — Fixable: false, out of scope (needs a Decision: Accept record)
BLOCKED — Gap 2: TASK 1 harvest test not-green under bkit tests — vitest include does not cover scripts/harvest/*.test.mjs; test passes under pnpm test:harvest (57/57, MARK_ROWS case ok); runner config not weakened
BLOCKED — Gap 3: TASK 2 no-red — Fixable: false, skipped (needs a Decision: Accept record)
DONE — Gap 4: TASK 2 docs + mirrors — added engine-call/completeness rows to workflows.md, recorded afterEnd/scan.rows shift in jsonl.md, ran bkit upgrade to regenerate mirrors/.bkit/version, bkit check exits 0 (.bkit/core/.bkit/workflows.md, .bkit/core/.bkit/jsonl.md, .bkit/workflows.md, .bkit/jsonl.md)
DONE — Gap extra: static-unit typecheck error in run-facts.test.ts (as Row on new row types) — journalRow helper via JSON round-trip, no type escapes (run-facts.test.ts)
