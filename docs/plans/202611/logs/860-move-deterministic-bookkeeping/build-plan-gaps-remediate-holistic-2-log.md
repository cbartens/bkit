Verdict: PASS
Strategy: PIVOT
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: harvest MARK_ROWS lacked ci-handoff and the three correction row types — added in engine order; pnpm test:harvest 61/61 and test-file-script.integration.test.ts 16/16 pass (scripts/harvest/bkit-harvest.mjs)
DONE — Gap 2: docs said correction rows live only in the run status log — runless invocation location and per-invocation budget added to docs/architecture.md, docs/observability.md, .bkit/core/.bkit/jsonl.md; counters correction run-only line added to .bkit/core/.bkit/cli.md
