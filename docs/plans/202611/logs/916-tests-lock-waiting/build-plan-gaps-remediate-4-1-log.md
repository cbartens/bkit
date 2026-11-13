Verdict: FAIL
Strategy: STANDARD
Fixed: 0

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
BLOCKED — Gap 1: TASK 11 test-first test 'runs that take a lock at once on a fresh cache never refuse over the queue folder' not-green — the code fix is already in place (bkit-machine-lock.sh:302); the defect is the planned test's own assertion, and only the tests step may rewrite a planned TEST FIRST test (.bkit/core/engine/audits/templates/machine-lock.integration.test.ts)
