Verdict: CONCERNS
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: Linear creation ordering — All fetched candidates must carry a parseable creation timestamp before selection; numeric instants determine order across timezone offsets. New missing/invalid-date and offset-order regression tests failed before the source change and pass afterward (.bkit/core/engine/commands/workflow/tracker.ts; tmp/826-group1-gap-red.log).

DONE — Gap 2: Continuation header budget — Chunking recalculates capacity when the actual total-part digit count grows. The regression crosses 99 parts and checks every rendered part, exact content and deterministic retries; it failed before the fix and passes afterward (.bkit/core/engine/commands/workflow/tracker.ts; tmp/826-group1-gap-red.log).
DONE — Built CLI check: Fresh scratch consumer rendered a comment successfully; inspected result.txt and tmp/bkit-comment body footprint without remote publication (tmp/826-gap-consumer-TPRV8a).

DONE — Verification: All 78 tracker unit tests pass. One unrelated legacy deduplication fixture used the invalid creation timestamp `x`; replaced it with a valid ISO timestamp without changing its assertions. Frozen planned test cases are unchanged (tmp/826-group1-gap-green.log).

DONE — Generation: The required generator passed after the prescribed escalated retry recovered a tsx IPC sandbox denial. Build, 273 render tests and graph refresh succeeded (tmp/826-group1-gap-generate.log).

DONE — Changed checks: Related tests passed 2,364 cases; named tests passed 3,589 cases with one 5,000ms timeout in the existing `runs context` label-read test. Five Bats tests, lint, formatting and both TypeScript projects passed. The changed gate exited 1 solely for that timeout, recorded under the existing failure key. The owner's verbatim instruction in the brief to ignore timeouts makes it nonblocking; no assertion failure was ignored and no broad rerun was performed (tmp/826-group1-gap-changed.log).

DONE — Knowledge: Recorded the validated continuation-header digit and Linear creation-order traps in docs/knowledge.jsonl.
