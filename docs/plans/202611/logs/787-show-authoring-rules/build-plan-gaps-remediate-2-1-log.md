Verdict: FAIL
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap 1: TASK 7 gateguard-cursor.integration.test.ts 'routes Cursor delete and shell targets without replacing its driver' not-green — the wrong assertion is in a planned TEST FIRST case, which this step must not edit; the tests step must rewrite it
DONE — Gap 2: gateguard-advice-omitted Hook Text entry now names selectAdvice — instructions-sources.test.ts passes (.bkit/instructions.md)
DONE — Gap 3: shell advice now counts shell notice, fetch notice and retry text against each host budget (selectAdvice fixedCost; shellEditContext outside arg; AG_RETRY_SUFFIX) — whole per-file blocks omitted and counted (.bkit/core/hooks/gateguard-engine.js, antigravity-hook.js, .claude and .agents guardrails.cjs)
