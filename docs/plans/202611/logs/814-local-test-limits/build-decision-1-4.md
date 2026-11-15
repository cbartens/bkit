Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/814-local-test-limits-plan.md

**Q1 — TASK 6 [vitest.timeout-budget.ts:24]:** The reviewer found that on CI, any limit a test file sets for itself with `localLimit(N)` comes out 6 times too long, so the plan's promise that CI limits stay exactly as today breaks. The cause: `vitest.setup.ts` reads `CI` to pick the tier at line 109, then deletes `CI` at lines 173-181, and only after that loads the test file, so `limitFactor()` sees no `CI` and returns 6. Example: a hung CI test in `machine-lock.integration.test.ts:1629` would wait 60 minutes instead of 10, and the CI unit and integration jobs set no `timeout-minutes` to stop it sooner. Fix now adds Task 6 as a new task: first a test that fails (`a file-level localLimit stays at the CI value under CI=1`), then a fix that captures the factor before `CI` is deleted. Accept leaves it and records your reason. Say yes to take the recommendation.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — CI is where hangs cost real money, and the fix is small and has a test that fails first.
Decision: Fix now — owner answered "q1 - B"
Fix task: 6

**Q2 — TASK 7 [.bkit/core/engine/commands/workflow/branches.test.ts:102]:** `branches.test.ts` sets `const GIT_TIMEOUT = 60_000` and uses it as the time limit on 16 test groups, never wrapped in `localLimit`, so those tests keep 60s locally while every other file gets 6x. The guard test only catches a number written directly in the limit, so it cannot see one stored in a named constant. Fix now adds Task 7: tests that fail first (a control for the constant shape, and one that flags `GIT_TIMEOUT`), then wraps the constant in `localLimit(60_000)` and widens the guard. Accept leaves it and records your reason. Say yes to take the recommendation.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — Without it the guard that protects this whole change has a known blind spot, and the fix is mechanical.
Decision: Fix now — owner answered "q2 - B"
Fix task: 7

**Q3 — TASK 8 [.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1629]:** Multiplying a file's own limit by 6 makes already-large limits huge: `localLimit(600_000)` becomes 3,600,000 ms (1 hour) and `localLimit(240_000)` becomes 24 minutes. A single hung local test can then hold the machine-wide tests lock far past the 1200 seconds other agents wait for it (`BKIT_LOCK_WAIT_S=1200` in `docs/testing.md`), so their runs give up with exit 81. The plan and `docs/testing.md` § Time limits fix the plain multiply. Choose Accept to keep the plain multiply and record your reason. Choose Fix now to cap large limits (for example at the 180s integration limit, or another figure), and give the direction. Choose Stop to end the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Capping trades how long a hang lasts against how long others wait on the lock, and the plan and docs deliberately chose the plain multiply, so only the owner can change that.
Decision: Accept — owner answered "A, keep plain 6x"

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
