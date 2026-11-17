Verdict: FAIL
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: Task 5 broke ship-verdict.integration.test.ts (stale push-line lookup) — lookup prefix now includes BKIT_PR_CONFLICT_CHECK=false; file passes 5 of 5 (.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts)
DONE — Group gate: exit 0 (bkit tests changed: 49 files, 3799 tests passed; bkit:generate exit 0)
BLOCKED — Task 2 test restore: .bkit/core/engine/checks/tips/catalogue.test.ts "pre-push-pr-conflict fires only for a hook without merge-tree" — the tests-step version uses a hook with merge-tree but no PUSH_BRANCH_SHA= as its "complete" sample and expects the tip not to fire. Task 8 (planned test "pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA") requires the tip to fire for exactly that hook, so the two planned tests contradict each other. Restoring would fail against shipped Task 8 behaviour (catalogue.ts:482), and source must not change to satisfy it. The test needs the tests step to rewrite it. Nothing written.
